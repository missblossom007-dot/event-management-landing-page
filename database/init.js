const fs = require('fs');
const path = require('path');
const pool = require('./config');
const bcrypt = require('bcrypt');

async function initializeDatabase() {
  try {
    console.log('🚀 Initializing EventKu database...');
    
    // Read and execute schema
    const schemaSQL = fs.readFileSync(path.join(__dirname, 'schema.sql'), 'utf8');
    await pool.query(schemaSQL);
    console.log('✅ Database schema created successfully');
    
    // Insert sample data
    await insertSampleData();
    console.log('✅ Sample data inserted successfully');
    
    console.log('🎉 Database initialization completed!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Database initialization failed:', error);
    process.exit(1);
  }
}

async function insertSampleData() {
  // Hash passwords
  const adminPassword = await bcrypt.hash('admin123', 10);
  const customerPassword = await bcrypt.hash('demo123', 10);
  
  // Insert sample users
  const adminResult = await pool.query(`
    INSERT INTO users (name, email, password, role, referral_code, points, total_referrals)
    VALUES ($1, $2, $3, $4, $5, $6, $7)
    RETURNING id
  `, ['Admin EventKu', 'admin@eventku.com', adminPassword, 'organizer', 'ADMIN001', 0, 5]);
  
  const customerResult = await pool.query(`
    INSERT INTO users (name, email, password, role, referral_code, points, total_referrals)
    VALUES ($1, $2, $3, $4, $5, $6, $7)
    RETURNING id
  `, ['Customer Demo', 'customer@demo.com', customerPassword, 'customer', 'CUST001', 75000, 2]);
  
  const adminId = adminResult.rows[0].id;
  const customerId = customerResult.rows[0].id;
  
  // Insert organizer profile
  await pool.query(`
    INSERT INTO organizers (user_id, company_name, phone, address, total_events, average_rating, total_reviews)
    VALUES ($1, $2, $3, $4, $5, $6, $7)
  `, [adminId, 'EventKu Productions', '+62812345678', 'Jakarta, Indonesia', 15, 4.5, 120]);
  
  // Insert sample events
  const events = [
    {
      title: 'Konser Musik Jazz Malam',
      description: 'Nikmati malam yang penuh dengan alunan musik jazz dari musisi terbaik Indonesia dan internasional.',
      date: '2025-12-15',
      time: '19:00',
      location: 'Jakarta Convention Center',
      category: 'musik',
      price: 250000,
      available_seats: 500,
      total_seats: 500,
      icon: '🎵'
    },
    {
      title: 'Workshop Web Development',
      description: 'Belajar membuat website modern dengan teknologi terkini. Cocok untuk pemula hingga menengah.',
      date: '2025-12-10',
      time: '09:00',
      location: 'Tech Hub Bandung',
      category: 'teknologi',
      price: 150000,
      available_seats: 50,
      total_seats: 50,
      icon: '💻'
    },
    {
      title: 'Marathon Jakarta 2025',
      description: 'Ikuti marathon tahunan terbesar di Jakarta. Tersedia kategori 5K, 10K, dan 21K.',
      date: '2025-12-20',
      time: '05:00',
      location: 'Bundaran HI, Jakarta',
      category: 'olahraga',
      price: 100000,
      available_seats: 1000,
      total_seats: 1000,
      icon: '🏃'
    },
    {
      title: 'Pameran Seni Kontemporer',
      description: 'Pameran karya seni kontemporer dari seniman lokal dan internasional.',
      date: '2025-12-08',
      time: '10:00',
      location: 'Galeri Nasional Indonesia',
      category: 'seni',
      price: 50000,
      available_seats: 200,
      total_seats: 200,
      icon: '🎨'
    },
    {
      title: 'Startup Pitch Competition',
      description: 'Kompetisi pitch untuk startup. Hadiah total 500 juta rupiah!',
      date: '2025-12-18',
      time: '13:00',
      location: 'Surabaya Business Center',
      category: 'bisnis',
      price: 0,
      available_seats: 300,
      total_seats: 300,
      icon: '💼'
    },
    {
      title: 'Festival Kuliner Nusantara',
      description: 'Jelajahi kekayaan kuliner Indonesia dari Sabang sampai Merauke.',
      date: '2025-12-25',
      time: '11:00',
      location: 'Lapangan Banteng, Jakarta',
      category: 'makanan',
      price: 0,
      available_seats: 2000,
      total_seats: 2000,
      icon: '🍜'
    }
  ];
  
  for (const event of events) {
    await pool.query(`
      INSERT INTO events (title, description, date, time, location, category, price, available_seats, total_seats, organizer_id, icon)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
    `, [
      event.title, event.description, event.date, event.time, event.location,
      event.category, event.price, event.available_seats, event.total_seats, adminId, event.icon
    ]);
  }
  
  // Insert sample reviews
  const eventIds = await pool.query('SELECT id FROM events LIMIT 4');
  const sampleReviews = [
    {
      event_id: eventIds.rows[0].id,
      rating: 5,
      comment: 'Event yang luar biasa! Musiknya sangat bagus dan suasananya sangat menyenangkan. Pasti akan datang lagi tahun depan!'
    },
    {
      event_id: eventIds.rows[0].id,
      rating: 4,
      comment: 'Konser jazz yang berkualitas tinggi. Sound system bagus, hanya saja tempat parkir agak terbatas.'
    },
    {
      event_id: eventIds.rows[1].id,
      rating: 5,
      comment: 'Workshop yang sangat bermanfaat! Materinya up-to-date dan instrukturnya sangat kompeten. Highly recommended!'
    },
    {
      event_id: eventIds.rows[2].id,
      rating: 4,
      comment: 'Marathon yang well-organized. Rute bagus dan support station lengkap. Cuma cuacanya agak panas.'
    }
  ];
  
  for (const review of sampleReviews) {
    await pool.query(`
      INSERT INTO reviews (user_id, event_id, rating, comment)
      VALUES ($1, $2, $3, $4)
    `, [customerId, review.event_id, review.rating, review.comment]);
  }
  
  // Insert sample transaction
  const jazzEventId = eventIds.rows[0].id;
  await pool.query(`
    INSERT INTO transactions (user_id, event_id, quantity, original_price, points_used, final_price, status, payment_proof)
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
  `, [customerId, jazzEventId, 1, 250000, 0, 250000, 'done', 'sample_proof.jpg']);
}

// Run initialization
initializeDatabase();