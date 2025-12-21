const express = require('express');
const pool = require('../database/config');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Get user profile
router.get('/profile', authenticateToken, async (req, res) => {
  try {
    let userQuery = `
      SELECT u.id, u.name, u.email, u.role, u.points, u.referral_code, 
             u.total_referrals, u.created_at
      FROM users u
      WHERE u.id = $1
    `;

    const userResult = await pool.query(userQuery, [req.user.id]);
    
    if (userResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'User tidak ditemukan'
      });
    }

    let userData = userResult.rows[0];

    // If organizer, get additional organizer info
    if (userData.role === 'organizer') {
      const organizerResult = await pool.query(`
        SELECT company_name, phone, address, total_events, average_rating, total_reviews
        FROM organizers
        WHERE user_id = $1
      `, [req.user.id]);

      if (organizerResult.rows.length > 0) {
        userData = { ...userData, ...organizerResult.rows[0] };
      }
    }

    res.json({
      success: true,
      data: userData
    });

  } catch (error) {
    console.error('Get user profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan saat mengambil data profil'
    });
  }
});

// Update user profile
router.put('/profile', authenticateToken, async (req, res) => {
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');
    
    const { name, phone, address, companyName } = req.body;

    // Update user basic info
    await client.query(
      'UPDATE users SET name = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2',
      [name, req.user.id]
    );

    // If organizer, update organizer info
    if (req.user.role === 'organizer') {
      await client.query(`
        UPDATE organizers 
        SET company_name = $1, phone = $2, address = $3
        WHERE user_id = $4
      `, [companyName || name, phone, address, req.user.id]);
    }

    await client.query('COMMIT');

    res.json({
      success: true,
      message: 'Profil berhasil diperbarui!'
    });

  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Update user profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan saat memperbarui profil'
    });
  } finally {
    client.release();
  }
});

// Get user notifications
router.get('/notifications', authenticateToken, async (req, res) => {
  try {
    const { limit = 20, offset = 0 } = req.query;

    const result = await pool.query(`
      SELECT * FROM notifications
      WHERE user_id = $1
      ORDER BY created_at DESC
      LIMIT $2 OFFSET $3
    `, [req.user.id, limit, offset]);

    res.json({
      success: true,
      data: result.rows
    });

  } catch (error) {
    console.error('Get notifications error:', error);
    res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan saat mengambil notifikasi'
    });
  }
});

// Mark notification as read
router.put('/notifications/:id/read', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(`
      UPDATE notifications 
      SET is_read = true
      WHERE id = $1 AND user_id = $2
      RETURNING *
    `, [id, req.user.id]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Notifikasi tidak ditemukan'
      });
    }

    res.json({
      success: true,
      message: 'Notifikasi berhasil ditandai sebagai dibaca'
    });

  } catch (error) {
    console.error('Mark notification read error:', error);
    res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan saat menandai notifikasi'
    });
  }
});

// Get user statistics (for customers)
router.get('/stats', authenticateToken, async (req, res) => {
  try {
    if (req.user.role !== 'customer') {
      return res.status(403).json({
        success: false,
        message: 'Akses ditolak'
      });
    }

    // Get transaction stats
    const transactionStats = await pool.query(`
      SELECT 
        COUNT(*) as total_transactions,
        COUNT(CASE WHEN status = 'done' THEN 1 END) as completed_transactions,
        COALESCE(SUM(CASE WHEN status = 'done' THEN final_price ELSE 0 END), 0) as total_spent,
        COALESCE(SUM(CASE WHEN status = 'done' THEN quantity ELSE 0 END), 0) as total_tickets
      FROM transactions
      WHERE user_id = $1
    `, [req.user.id]);

    // Get review stats
    const reviewStats = await pool.query(`
      SELECT 
        COUNT(*) as total_reviews,
        COALESCE(AVG(rating), 0) as average_rating_given
      FROM reviews
      WHERE user_id = $1
    `, [req.user.id]);

    const stats = {
      ...transactionStats.rows[0],
      ...reviewStats.rows[0],
      total_spent: parseInt(transactionStats.rows[0].total_spent),
      total_tickets: parseInt(transactionStats.rows[0].total_tickets),
      total_transactions: parseInt(transactionStats.rows[0].total_transactions),
      completed_transactions: parseInt(transactionStats.rows[0].completed_transactions),
      total_reviews: parseInt(reviewStats.rows[0].total_reviews),
      average_rating_given: parseFloat(reviewStats.rows[0].average_rating_given)
    };

    res.json({
      success: true,
      data: stats
    });

  } catch (error) {
    console.error('Get user stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan saat mengambil statistik user'
    });
  }
});

module.exports = router;