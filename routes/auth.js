const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { prisma } = require('../lib/prisma');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Generate referral code
function generateReferralCode() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < 8; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

// Register
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, role, referralCode } = req.body;

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'Email sudah terdaftar!'
      });
    }

    // Validate referral code if provided
    let referrer = null;
    if (referralCode) {
      referrer = await prisma.user.findUnique({
        where: { referralCode }
      });

      if (!referrer) {
        return res.status(400).json({
          success: false,
          message: 'Kode referral tidak valid!'
        });
      }
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Generate unique referral code
    let newReferralCode;
    let isUnique = false;
    while (!isUnique) {
      newReferralCode = generateReferralCode();
      const codeCheck = await prisma.user.findUnique({
        where: { referralCode: newReferralCode }
      });
      isUnique = !codeCheck;
    }

    // Create user with transaction
    const newUser = await prisma.$transaction(async (tx) => {
      // Create user
      const user = await tx.user.create({
        data: {
          name,
          email,
          password: hashedPassword,
          role: role.toUpperCase(),
          referralCode: newReferralCode,
          referredBy: referrer?.id,
          points: role === 'customer' ? 50000 : 0,
        },
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          points: true,
          referralCode: true
        }
      });

      // Give bonus points to referrer
      if (referrer) {
        await tx.user.update({
          where: { id: referrer.id },
          data: {
            points: { increment: 25000 },
            totalReferrals: { increment: 1 }
          }
        });
      }

      // Create organizer profile if role is organizer
      if (role.toUpperCase() === 'ORGANIZER') {
        await tx.organizer.create({
          data: {
            userId: user.id,
            companyName: name
          }
        });
      }

      return user;
    });

    // Generate JWT token
    const token = jwt.sign(
      { userId: newUser.id, role: newUser.role },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.status(201).json({
      success: true,
      message: 'Akun berhasil dibuat!',
      data: {
        user: newUser,
        token
      }
    });

  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan saat mendaftar'
    });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Get user from database
    const user = await prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        name: true,
        email: true,
        password: true,
        role: true,
        points: true,
        referralCode: true
      }
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Email atau password salah!'
      });
    }

    // Check password
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({
        success: false,
        message: 'Email atau password salah!'
      });
    }

    // Generate JWT token
    const token = jwt.sign(
      { userId: user.id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    // Remove password from response
    const { password: _, ...userWithoutPassword } = user;

    res.json({
      success: true,
      message: `Selamat datang, ${user.name}!`,
      data: {
        user: userWithoutPassword,
        token
      }
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan saat login'
    });
  }
});

// Get current user
router.get('/me', authenticateToken, async (req, res) => {
  try {
    res.json({
      success: true,
      data: { user: req.user }
    });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan saat mengambil data user'
    });
  }
});

// Refresh token
router.post('/refresh', authenticateToken, async (req, res) => {
  try {
    const token = jwt.sign(
      { userId: req.user.id, role: req.user.role },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({
      success: true,
      data: { token }
    });
  } catch (error) {
    console.error('Token refresh error:', error);
    res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan saat refresh token'
    });
  }
});

module.exports = router;