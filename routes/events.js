const express = require('express');
const pool = require('../database/config');
const { authenticateToken, requireRole } = require('../middleware/auth');

const router = express.Router();

// Get all events
router.get('/', async (req, res) => {
  try {
    const { category, search, limit = 50, offset = 0 } = req.query;
    
    let query = `
      SELECT e.*, u.name as organizer_name,
             COALESCE(o.company_name, u.name) as organizer_company
      FROM events e
      JOIN users u ON e.organizer_id = u.id
      LEFT JOIN organizers o ON u.id = o.user_id
      WHERE e.status = 'active'
    `;
    const params = [];
    let paramCount = 0;

    if (category) {
      paramCount++;
      query += ` AND e.category = $${paramCount}`;
      params.push(category);
    }

    if (search) {
      paramCount++;
      query += ` AND (e.title ILIKE $${paramCount} OR e.description ILIKE $${paramCount} OR e.location ILIKE $${paramCount})`;
      params.push(`%${search}%`);
    }

    query += ` ORDER BY e.date ASC LIMIT $${paramCount + 1} OFFSET $${paramCount + 2}`;
    params.push(limit, offset);

    const result = await pool.query(query, params);

    res.json({
      success: true,
      data: result.rows
    });

  } catch (error) {
    console.error('Get events error:', error);
    res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan saat mengambil data event'
    });
  }
});

// Get event by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(`
      SELECT e.*, u.name as organizer_name,
             COALESCE(o.company_name, u.name) as organizer_company,
             o.average_rating as organizer_rating,
             o.total_events as organizer_total_events,
             o.total_reviews as organizer_total_reviews
      FROM events e
      JOIN users u ON e.organizer_id = u.id
      LEFT JOIN organizers o ON u.id = o.user_id
      WHERE e.id = $1
    `, [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Event tidak ditemukan'
      });
    }

    res.json({
      success: true,
      data: result.rows[0]
    });

  } catch (error) {
    console.error('Get event error:', error);
    res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan saat mengambil data event'
    });
  }
});

// Create event (organizer only)
router.post('/', authenticateToken, requireRole('organizer'), async (req, res) => {
  try {
    const {
      title, description, date, time, location, category,
      price, availableSeats, icon
    } = req.body;

    const result = await pool.query(`
      INSERT INTO events (
        title, description, date, time, location, category,
        price, available_seats, total_seats, organizer_id, icon
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $8, $9, $10)
      RETURNING *
    `, [
      title, description, date, time, location, category,
      price || 0, availableSeats, req.user.id, icon || '🎉'
    ]);

    // Update organizer total events
    await pool.query(`
      UPDATE organizers 
      SET total_events = total_events + 1
      WHERE user_id = $1
    `, [req.user.id]);

    res.status(201).json({
      success: true,
      message: 'Event berhasil dibuat!',
      data: result.rows[0]
    });

  } catch (error) {
    console.error('Create event error:', error);
    res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan saat membuat event'
    });
  }
});

// Update event (organizer only)
router.put('/:id', authenticateToken, requireRole('organizer'), async (req, res) => {
  try {
    const { id } = req.params;
    const {
      title, description, date, time, location, category,
      price, availableSeats, icon
    } = req.body;

    // Check if event belongs to organizer
    const eventCheck = await pool.query(
      'SELECT id FROM events WHERE id = $1 AND organizer_id = $2',
      [id, req.user.id]
    );

    if (eventCheck.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Event tidak ditemukan atau Anda tidak memiliki akses'
      });
    }

    const result = await pool.query(`
      UPDATE events 
      SET title = $1, description = $2, date = $3, time = $4,
          location = $5, category = $6, price = $7, 
          available_seats = $8, icon = $9, updated_at = CURRENT_TIMESTAMP
      WHERE id = $10 AND organizer_id = $11
      RETURNING *
    `, [
      title, description, date, time, location, category,
      price || 0, availableSeats, icon || '🎉', id, req.user.id
    ]);

    res.json({
      success: true,
      message: 'Event berhasil diperbarui!',
      data: result.rows[0]
    });

  } catch (error) {
    console.error('Update event error:', error);
    res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan saat memperbarui event'
    });
  }
});

// Delete event (organizer only)
router.delete('/:id', authenticateToken, requireRole('organizer'), async (req, res) => {
  try {
    const { id } = req.params;

    // Check if event belongs to organizer
    const eventCheck = await pool.query(
      'SELECT id FROM events WHERE id = $1 AND organizer_id = $2',
      [id, req.user.id]
    );

    if (eventCheck.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Event tidak ditemukan atau Anda tidak memiliki akses'
      });
    }

    // Check for active transactions
    const activeTransactions = await pool.query(`
      SELECT id FROM transactions 
      WHERE event_id = $1 AND status IN ('waiting_payment', 'waiting_confirmation')
    `, [id]);

    if (activeTransactions.rows.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Tidak dapat menghapus event yang memiliki transaksi aktif'
      });
    }

    await pool.query('DELETE FROM events WHERE id = $1', [id]);

    // Update organizer total events
    await pool.query(`
      UPDATE organizers 
      SET total_events = total_events - 1
      WHERE user_id = $1
    `, [req.user.id]);

    res.json({
      success: true,
      message: 'Event berhasil dihapus!'
    });

  } catch (error) {
    console.error('Delete event error:', error);
    res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan saat menghapus event'
    });
  }
});

// Get organizer events
router.get('/organizer/my-events', authenticateToken, requireRole('organizer'), async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT e.*,
             (SELECT COUNT(*) FROM transactions t WHERE t.event_id = e.id AND t.status = 'done') as sold_tickets,
             (SELECT COALESCE(SUM(t.final_price), 0) FROM transactions t WHERE t.event_id = e.id AND t.status = 'done') as revenue
      FROM events e
      WHERE e.organizer_id = $1
      ORDER BY e.created_at DESC
    `, [req.user.id]);

    res.json({
      success: true,
      data: result.rows
    });

  } catch (error) {
    console.error('Get organizer events error:', error);
    res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan saat mengambil data event'
    });
  }
});

// Get event attendees (organizer only)
router.get('/:id/attendees', authenticateToken, requireRole('organizer'), async (req, res) => {
  try {
    const { id } = req.params;

    // Check if event belongs to organizer
    const eventCheck = await pool.query(
      'SELECT id FROM events WHERE id = $1 AND organizer_id = $2',
      [id, req.user.id]
    );

    if (eventCheck.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Event tidak ditemukan atau Anda tidak memiliki akses'
      });
    }

    const result = await pool.query(`
      SELECT t.*, u.name, u.email
      FROM transactions t
      JOIN users u ON t.user_id = u.id
      WHERE t.event_id = $1 AND t.status = 'done'
      ORDER BY t.created_at DESC
    `, [id]);

    res.json({
      success: true,
      data: result.rows
    });

  } catch (error) {
    console.error('Get attendees error:', error);
    res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan saat mengambil data peserta'
    });
  }
});

module.exports = router;