const express = require('express');
const pool = require('../database/config');
const { authenticateToken, requireRole } = require('../middleware/auth');
const multer = require('multer');
const path = require('path');

const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/payment-proofs/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'payment-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed!'), false);
    }
  }
});

// Create transaction (customer only)
router.post('/', authenticateToken, requireRole('customer'), async (req, res) => {
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');
    
    const { eventId, quantity, pointsUsed } = req.body;

    // Get event details
    const eventResult = await client.query(
      'SELECT * FROM events WHERE id = $1 AND status = $2',
      [eventId, 'active']
    );

    if (eventResult.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({
        success: false,
        message: 'Event tidak ditemukan atau tidak aktif'
      });
    }

    const event = eventResult.rows[0];

    // Check available seats
    if (event.available_seats < quantity) {
      await client.query('ROLLBACK');
      return res.status(400).json({
        success: false,
        message: 'Kursi tidak mencukupi'
      });
    }

    // Check user points
    if (pointsUsed > req.user.points) {
      await client.query('ROLLBACK');
      return res.status(400).json({
        success: false,
        message: 'Points tidak mencukupi'
      });
    }

    const originalPrice = event.price * quantity;
    const totalPointsDiscount = pointsUsed * quantity;
    const finalPrice = Math.max(0, originalPrice - totalPointsDiscount);

    // Create transaction
    const transactionResult = await client.query(`
      INSERT INTO transactions (
        user_id, event_id, quantity, original_price, 
        points_used, final_price, status, expires_at
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING *
    `, [
      req.user.id, eventId, quantity, originalPrice,
      pointsUsed * quantity, finalPrice, 'waiting_payment',
      new Date(Date.now() + 2 * 60 * 60 * 1000) // 2 hours from now
    ]);

    // Reserve seats and deduct points
    await client.query(
      'UPDATE events SET available_seats = available_seats - $1 WHERE id = $2',
      [quantity, eventId]
    );

    await client.query(
      'UPDATE users SET points = points - $1 WHERE id = $2',
      [pointsUsed * quantity, req.user.id]
    );

    await client.query('COMMIT');

    res.status(201).json({
      success: true,
      message: 'Transaksi berhasil dibuat!',
      data: transactionResult.rows[0]
    });

  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Create transaction error:', error);
    res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan saat membuat transaksi'
    });
  } finally {
    client.release();
  }
});

// Upload payment proof
router.post('/:id/payment-proof', authenticateToken, requireRole('customer'), upload.single('paymentProof'), async (req, res) => {
  try {
    const { id } = req.params;

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'File bukti pembayaran diperlukan'
      });
    }

    // Check if transaction belongs to user
    const transactionResult = await pool.query(
      'SELECT * FROM transactions WHERE id = $1 AND user_id = $2',
      [id, req.user.id]
    );

    if (transactionResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Transaksi tidak ditemukan'
      });
    }

    const transaction = transactionResult.rows[0];

    if (transaction.status !== 'waiting_payment') {
      return res.status(400).json({
        success: false,
        message: 'Transaksi tidak dalam status menunggu pembayaran'
      });
    }

    // Update transaction
    await pool.query(`
      UPDATE transactions 
      SET payment_proof = $1, status = $2, updated_at = CURRENT_TIMESTAMP
      WHERE id = $3
    `, [req.file.filename, 'waiting_confirmation', id]);

    res.json({
      success: true,
      message: 'Bukti pembayaran berhasil diupload!'
    });

  } catch (error) {
    console.error('Upload payment proof error:', error);
    res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan saat mengupload bukti pembayaran'
    });
  }
});

// Get user transactions
router.get('/my-transactions', authenticateToken, requireRole('customer'), async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT t.*, e.title as event_title, e.date as event_date, e.time as event_time
      FROM transactions t
      JOIN events e ON t.event_id = e.id
      WHERE t.user_id = $1
      ORDER BY t.created_at DESC
    `, [req.user.id]);

    res.json({
      success: true,
      data: result.rows
    });

  } catch (error) {
    console.error('Get user transactions error:', error);
    res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan saat mengambil data transaksi'
    });
  }
});

// Cancel transaction
router.post('/:id/cancel', authenticateToken, requireRole('customer'), async (req, res) => {
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');
    
    const { id } = req.params;

    // Get transaction
    const transactionResult = await client.query(
      'SELECT * FROM transactions WHERE id = $1 AND user_id = $2',
      [id, req.user.id]
    );

    if (transactionResult.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({
        success: false,
        message: 'Transaksi tidak ditemukan'
      });
    }

    const transaction = transactionResult.rows[0];

    if (!['waiting_payment', 'waiting_confirmation'].includes(transaction.status)) {
      await client.query('ROLLBACK');
      return res.status(400).json({
        success: false,
        message: 'Transaksi tidak dapat dibatalkan'
      });
    }

    // Rollback: restore seats and points
    await client.query(
      'UPDATE events SET available_seats = available_seats + $1 WHERE id = $2',
      [transaction.quantity, transaction.event_id]
    );

    await client.query(
      'UPDATE users SET points = points + $1 WHERE id = $2',
      [transaction.points_used, req.user.id]
    );

    // Update transaction status
    await client.query(
      'UPDATE transactions SET status = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2',
      ['canceled', id]
    );

    await client.query('COMMIT');

    res.json({
      success: true,
      message: 'Transaksi berhasil dibatalkan. Points dan kursi telah dikembalikan.'
    });

  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Cancel transaction error:', error);
    res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan saat membatalkan transaksi'
    });
  } finally {
    client.release();
  }
});

// Approve transaction (organizer only)
router.post('/:id/approve', authenticateToken, requireRole('organizer'), async (req, res) => {
  try {
    const { id } = req.params;

    // Check if transaction belongs to organizer's event
    const transactionResult = await pool.query(`
      SELECT t.*, e.organizer_id
      FROM transactions t
      JOIN events e ON t.event_id = e.id
      WHERE t.id = $1
    `, [id]);

    if (transactionResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Transaksi tidak ditemukan'
      });
    }

    const transaction = transactionResult.rows[0];

    if (transaction.organizer_id !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Anda tidak memiliki akses untuk transaksi ini'
      });
    }

    if (transaction.status !== 'waiting_confirmation') {
      return res.status(400).json({
        success: false,
        message: 'Transaksi tidak dalam status menunggu konfirmasi'
      });
    }

    // Update transaction status
    await pool.query(
      'UPDATE transactions SET status = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2',
      ['done', id]
    );

    // Send notification (you can implement email service here)
    await pool.query(`
      INSERT INTO notifications (user_id, title, message, type)
      VALUES ($1, $2, $3, $4)
    `, [
      transaction.user_id,
      'Pembayaran Diterima',
      'Pembayaran Anda telah diterima dan tiket sudah aktif!',
      'payment_approved'
    ]);

    res.json({
      success: true,
      message: 'Transaksi berhasil disetujui!'
    });

  } catch (error) {
    console.error('Approve transaction error:', error);
    res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan saat menyetujui transaksi'
    });
  }
});

// Reject transaction (organizer only)
router.post('/:id/reject', authenticateToken, requireRole('organizer'), async (req, res) => {
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');
    
    const { id } = req.params;

    // Check if transaction belongs to organizer's event
    const transactionResult = await client.query(`
      SELECT t.*, e.organizer_id
      FROM transactions t
      JOIN events e ON t.event_id = e.id
      WHERE t.id = $1
    `, [id]);

    if (transactionResult.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({
        success: false,
        message: 'Transaksi tidak ditemukan'
      });
    }

    const transaction = transactionResult.rows[0];

    if (transaction.organizer_id !== req.user.id) {
      await client.query('ROLLBACK');
      return res.status(403).json({
        success: false,
        message: 'Anda tidak memiliki akses untuk transaksi ini'
      });
    }

    if (transaction.status !== 'waiting_confirmation') {
      await client.query('ROLLBACK');
      return res.status(400).json({
        success: false,
        message: 'Transaksi tidak dalam status menunggu konfirmasi'
      });
    }

    // Rollback: restore seats and points
    await client.query(
      'UPDATE events SET available_seats = available_seats + $1 WHERE id = $2',
      [transaction.quantity, transaction.event_id]
    );

    await client.query(
      'UPDATE users SET points = points + $1 WHERE id = $2',
      [transaction.points_used, transaction.user_id]
    );

    // Update transaction status
    await client.query(
      'UPDATE transactions SET status = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2',
      ['rejected', id]
    );

    // Send notification
    await client.query(`
      INSERT INTO notifications (user_id, title, message, type)
      VALUES ($1, $2, $3, $4)
    `, [
      transaction.user_id,
      'Pembayaran Ditolak',
      'Pembayaran Anda ditolak. Points telah dikembalikan ke akun Anda.',
      'payment_rejected'
    ]);

    await client.query('COMMIT');

    res.json({
      success: true,
      message: 'Transaksi berhasil ditolak. Points dan kursi telah dikembalikan.'
    });

  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Reject transaction error:', error);
    res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan saat menolak transaksi'
    });
  } finally {
    client.release();
  }
});

module.exports = router;