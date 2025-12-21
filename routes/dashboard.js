const express = require('express');
const pool = require('../database/config');
const { authenticateToken, requireRole } = require('../middleware/auth');

const router = express.Router();

// Get dashboard overview (organizer only)
router.get('/overview', authenticateToken, requireRole('organizer'), async (req, res) => {
  try {
    // Get organizer events
    const eventsResult = await pool.query(
      'SELECT COUNT(*) as total_events FROM events WHERE organizer_id = $1',
      [req.user.id]
    );

    // Get total revenue
    const revenueResult = await pool.query(`
      SELECT COALESCE(SUM(t.final_price), 0) as total_revenue
      FROM transactions t
      JOIN events e ON t.event_id = e.id
      WHERE e.organizer_id = $1 AND t.status = 'done'
    `, [req.user.id]);

    // Get total customers
    const customersResult = await pool.query(`
      SELECT COUNT(DISTINCT t.user_id) as total_customers
      FROM transactions t
      JOIN events e ON t.event_id = e.id
      WHERE e.organizer_id = $1 AND t.status = 'done'
    `, [req.user.id]);

    // Get pending transactions
    const pendingResult = await pool.query(`
      SELECT COUNT(*) as pending_transactions
      FROM transactions t
      JOIN events e ON t.event_id = e.id
      WHERE e.organizer_id = $1 AND t.status = 'waiting_confirmation'
    `, [req.user.id]);

    res.json({
      success: true,
      data: {
        totalEvents: parseInt(eventsResult.rows[0].total_events),
        totalRevenue: parseInt(revenueResult.rows[0].total_revenue),
        totalCustomers: parseInt(customersResult.rows[0].total_customers),
        pendingTransactions: parseInt(pendingResult.rows[0].pending_transactions)
      }
    });

  } catch (error) {
    console.error('Get dashboard overview error:', error);
    res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan saat mengambil data overview'
    });
  }
});

// Get revenue statistics (organizer only)
router.get('/revenue-stats', authenticateToken, requireRole('organizer'), async (req, res) => {
  try {
    const { year = new Date().getFullYear() } = req.query;

    const result = await pool.query(`
      SELECT 
        EXTRACT(MONTH FROM t.created_at) as month,
        COALESCE(SUM(t.final_price), 0) as revenue,
        COUNT(t.id) as transactions
      FROM transactions t
      JOIN events e ON t.event_id = e.id
      WHERE e.organizer_id = $1 
        AND t.status = 'done'
        AND EXTRACT(YEAR FROM t.created_at) = $2
      GROUP BY EXTRACT(MONTH FROM t.created_at)
      ORDER BY month
    `, [req.user.id, year]);

    // Fill missing months with 0
    const monthlyData = Array.from({ length: 12 }, (_, i) => ({
      month: i + 1,
      revenue: 0,
      transactions: 0
    }));

    result.rows.forEach(row => {
      monthlyData[row.month - 1] = {
        month: parseInt(row.month),
        revenue: parseInt(row.revenue),
        transactions: parseInt(row.transactions)
      };
    });

    res.json({
      success: true,
      data: monthlyData
    });

  } catch (error) {
    console.error('Get revenue stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan saat mengambil data statistik pendapatan'
    });
  }
});

// Get ticket sales statistics (organizer only)
router.get('/ticket-stats', authenticateToken, requireRole('organizer'), async (req, res) => {
  try {
    const { year = new Date().getFullYear() } = req.query;

    const result = await pool.query(`
      SELECT 
        EXTRACT(MONTH FROM t.created_at) as month,
        COALESCE(SUM(t.quantity), 0) as tickets_sold
      FROM transactions t
      JOIN events e ON t.event_id = e.id
      WHERE e.organizer_id = $1 
        AND t.status = 'done'
        AND EXTRACT(YEAR FROM t.created_at) = $2
      GROUP BY EXTRACT(MONTH FROM t.created_at)
      ORDER BY month
    `, [req.user.id, year]);

    // Fill missing months with 0
    const monthlyData = Array.from({ length: 12 }, (_, i) => ({
      month: i + 1,
      tickets_sold: 0
    }));

    result.rows.forEach(row => {
      monthlyData[row.month - 1] = {
        month: parseInt(row.month),
        tickets_sold: parseInt(row.tickets_sold)
      };
    });

    res.json({
      success: true,
      data: monthlyData
    });

  } catch (error) {
    console.error('Get ticket stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan saat mengambil data statistik tiket'
    });
  }
});

// Get event performance (organizer only)
router.get('/event-performance', authenticateToken, requireRole('organizer'), async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        e.id,
        e.title,
        e.total_seats,
        e.available_seats,
        (e.total_seats - e.available_seats) as sold_tickets,
        CASE 
          WHEN e.total_seats > 0 THEN 
            ROUND(((e.total_seats - e.available_seats)::DECIMAL / e.total_seats) * 100, 2)
          ELSE 0 
        END as occupancy_rate,
        e.average_rating,
        COALESCE(SUM(t.final_price), 0) as revenue
      FROM events e
      LEFT JOIN transactions t ON e.id = t.event_id AND t.status = 'done'
      WHERE e.organizer_id = $1
      GROUP BY e.id, e.title, e.total_seats, e.available_seats, e.average_rating
      ORDER BY occupancy_rate DESC
    `, [req.user.id]);

    res.json({
      success: true,
      data: result.rows.map(row => ({
        ...row,
        revenue: parseInt(row.revenue),
        occupancy_rate: parseFloat(row.occupancy_rate),
        average_rating: parseFloat(row.average_rating)
      }))
    });

  } catch (error) {
    console.error('Get event performance error:', error);
    res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan saat mengambil data performa event'
    });
  }
});

// Get organizer transactions (organizer only)
router.get('/transactions', authenticateToken, requireRole('organizer'), async (req, res) => {
  try {
    const { status, eventId, limit = 50, offset = 0 } = req.query;

    let query = `
      SELECT t.*, e.title as event_title, u.name as customer_name, u.email as customer_email
      FROM transactions t
      JOIN events e ON t.event_id = e.id
      JOIN users u ON t.user_id = u.id
      WHERE e.organizer_id = $1
    `;
    const params = [req.user.id];
    let paramCount = 1;

    if (status) {
      paramCount++;
      query += ` AND t.status = $${paramCount}`;
      params.push(status);
    }

    if (eventId) {
      paramCount++;
      query += ` AND t.event_id = $${paramCount}`;
      params.push(eventId);
    }

    query += ` ORDER BY t.created_at DESC LIMIT $${paramCount + 1} OFFSET $${paramCount + 2}`;
    params.push(limit, offset);

    const result = await pool.query(query, params);

    res.json({
      success: true,
      data: result.rows
    });

  } catch (error) {
    console.error('Get organizer transactions error:', error);
    res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan saat mengambil data transaksi'
    });
  }
});

// Get recent transactions (organizer only)
router.get('/recent-transactions', authenticateToken, requireRole('organizer'), async (req, res) => {
  try {
    const { limit = 5 } = req.query;

    const result = await pool.query(`
      SELECT t.*, e.title as event_title, u.name as customer_name
      FROM transactions t
      JOIN events e ON t.event_id = e.id
      JOIN users u ON t.user_id = u.id
      WHERE e.organizer_id = $1
      ORDER BY t.created_at DESC
      LIMIT $2
    `, [req.user.id, limit]);

    res.json({
      success: true,
      data: result.rows
    });

  } catch (error) {
    console.error('Get recent transactions error:', error);
    res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan saat mengambil data transaksi terbaru'
    });
  }
});

// Get popular events (organizer only)
router.get('/popular-events', authenticateToken, requireRole('organizer'), async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        e.id,
        e.title,
        COALESCE(SUM(t.quantity), 0) as tickets_sold,
        COALESCE(SUM(t.final_price), 0) as revenue
      FROM events e
      LEFT JOIN transactions t ON e.id = t.event_id AND t.status = 'done'
      WHERE e.organizer_id = $1
      GROUP BY e.id, e.title
      ORDER BY tickets_sold DESC
      LIMIT 5
    `, [req.user.id]);

    res.json({
      success: true,
      data: result.rows.map(row => ({
        ...row,
        tickets_sold: parseInt(row.tickets_sold),
        revenue: parseInt(row.revenue)
      }))
    });

  } catch (error) {
    console.error('Get popular events error:', error);
    res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan saat mengambil data event populer'
    });
  }
});

module.exports = router;