const express = require('express');
const pool = require('../database/config');
const { authenticateToken, requireRole } = require('../middleware/auth');

const router = express.Router();

// Get reviews for an event
router.get('/event/:eventId', async (req, res) => {
  try {
    const { eventId } = req.params;

    const result = await pool.query(`
      SELECT r.*, u.name as reviewer_name
      FROM reviews r
      JOIN users u ON r.user_id = u.id
      WHERE r.event_id = $1
      ORDER BY r.created_at DESC
    `, [eventId]);

    res.json({
      success: true,
      data: result.rows
    });

  } catch (error) {
    console.error('Get event reviews error:', error);
    res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan saat mengambil data review'
    });
  }
});

// Create review (customer only, must have attended event)
router.post('/', authenticateToken, requireRole('customer'), async (req, res) => {
  try {
    const { eventId, rating, comment } = req.body;

    // Check if user has attended the event
    const attendanceCheck = await pool.query(`
      SELECT id FROM transactions 
      WHERE user_id = $1 AND event_id = $2 AND status = 'done'
    `, [req.user.id, eventId]);

    if (attendanceCheck.rows.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Anda hanya dapat memberikan review untuk event yang sudah Anda hadiri'
      });
    }

    // Check if user already reviewed this event
    const existingReview = await pool.query(
      'SELECT id FROM reviews WHERE user_id = $1 AND event_id = $2',
      [req.user.id, eventId]
    );

    if (existingReview.rows.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Anda sudah memberikan review untuk event ini'
      });
    }

    // Create review
    const result = await pool.query(`
      INSERT INTO reviews (user_id, event_id, rating, comment)
      VALUES ($1, $2, $3, $4)
      RETURNING *
    `, [req.user.id, eventId, rating, comment]);

    res.status(201).json({
      success: true,
      message: 'Review berhasil dikirim!',
      data: result.rows[0]
    });

  } catch (error) {
    console.error('Create review error:', error);
    res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan saat mengirim review'
    });
  }
});

// Update review (customer only)
router.put('/:id', authenticateToken, requireRole('customer'), async (req, res) => {
  try {
    const { id } = req.params;
    const { rating, comment } = req.body;

    // Check if review belongs to user
    const reviewCheck = await pool.query(
      'SELECT id FROM reviews WHERE id = $1 AND user_id = $2',
      [id, req.user.id]
    );

    if (reviewCheck.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Review tidak ditemukan atau Anda tidak memiliki akses'
      });
    }

    // Update review
    const result = await pool.query(`
      UPDATE reviews 
      SET rating = $1, comment = $2, updated_at = CURRENT_TIMESTAMP
      WHERE id = $3 AND user_id = $4
      RETURNING *
    `, [rating, comment, id, req.user.id]);

    res.json({
      success: true,
      message: 'Review berhasil diperbarui!',
      data: result.rows[0]
    });

  } catch (error) {
    console.error('Update review error:', error);
    res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan saat memperbarui review'
    });
  }
});

// Delete review (customer only)
router.delete('/:id', authenticateToken, requireRole('customer'), async (req, res) => {
  try {
    const { id } = req.params;

    // Check if review belongs to user
    const reviewCheck = await pool.query(
      'SELECT id FROM reviews WHERE id = $1 AND user_id = $2',
      [id, req.user.id]
    );

    if (reviewCheck.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Review tidak ditemukan atau Anda tidak memiliki akses'
      });
    }

    await pool.query('DELETE FROM reviews WHERE id = $1', [id]);

    res.json({
      success: true,
      message: 'Review berhasil dihapus!'
    });

  } catch (error) {
    console.error('Delete review error:', error);
    res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan saat menghapus review'
    });
  }
});

// Get user reviews
router.get('/my-reviews', authenticateToken, requireRole('customer'), async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT r.*, e.title as event_title
      FROM reviews r
      JOIN events e ON r.event_id = e.id
      WHERE r.user_id = $1
      ORDER BY r.created_at DESC
    `, [req.user.id]);

    res.json({
      success: true,
      data: result.rows
    });

  } catch (error) {
    console.error('Get user reviews error:', error);
    res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan saat mengambil data review'
    });
  }
});

module.exports = router;