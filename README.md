# EventKu - Event Management System with PostgreSQL

EventKu adalah sistem manajemen event yang lengkap dengan fitur authentication, review system, dashboard organizer, dan integrasi PostgreSQL database.

## 🚀 Fitur Utama

### 🔐 Authentication & Authorization
- User registration dengan sistem referral
- Login/logout dengan JWT token
- Role-based access (Customer & Organizer)
- Referral code generation dan bonus points

### 🎫 Event Management
- CRUD operations untuk events
- Kategori event (musik, teknologi, olahraga, seni, bisnis, makanan)
- Upload gambar event
- Event rating dan review system

### 💳 Transaction System
- Pembelian tiket dengan points system
- Upload bukti pembayaran
- Approval/rejection system untuk organizer
- Automatic rollback untuk transaksi yang ditolak

### ⭐ Review & Rating System
- Customer dapat memberikan review setelah menghadiri event
- Rating 1-5 bintang
- Organizer profile dengan rating keseluruhan

### 📊 Dashboard Organizer
- Overview statistik (revenue, events, customers)
- Event management (edit, delete, view attendees)
- Transaction management (approve/reject payments)
- Visual charts untuk revenue dan ticket sales
- Event performance analytics

### 📧 Notification System
- Email notifications untuk transaction status
- In-app notifications
- Real-time updates

## 🛠️ Tech Stack

### Backend
- **Node.js** dengan Express.js
- **PostgreSQL** database
- **JWT** untuk authentication
- **bcrypt** untuk password hashing
- **multer** untuk file uploads
- **nodemailer** untuk email notifications

### Frontend
- **HTML5, CSS3, JavaScript** (Vanilla)
- **Responsive design** dengan mobile support
- **Modal-based UI** untuk better UX

## 📋 Prerequisites

Sebelum menjalankan aplikasi, pastikan Anda telah menginstall:

- **Node.js** (v14 atau lebih baru)
- **PostgreSQL** (v12 atau lebih baru)
- **npm** atau **yarn**

## 🔧 Installation & Setup

### 1. Clone Repository
```bash
git clone <repository-url>
cd eventku
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Setup PostgreSQL Database

#### Buat Database
```sql
-- Login ke PostgreSQL sebagai superuser
psql -U postgres

-- Buat database
CREATE DATABASE eventku_db;

-- Buat user (opsional)
CREATE USER eventku_user WITH PASSWORD 'your_password';
GRANT ALL PRIVILEGES ON DATABASE eventku_db TO eventku_user;
```

### 4. Environment Configuration

Salin file `.env` dan sesuaikan konfigurasi:

```bash
cp .env.example .env
```

Edit file `.env`:
```env
# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_NAME=eventku_db
DB_USER=postgres
DB_PASSWORD=your_actual_password

# JWT Secret (generate random string)
JWT_SECRET=your_very_secure_jwt_secret_key

# Email Configuration (opsional)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password

# Server Configuration
PORT=3000
NODE_ENV=development
```

### 5. Initialize Database

Jalankan script untuk membuat schema dan sample data:

```bash
npm run init-db
```

Script ini akan:
- Membuat semua tabel yang diperlukan
- Membuat indexes untuk performa optimal
- Membuat triggers untuk auto-update timestamps
- Insert sample data (users, events, reviews, transactions)

### 6. Create Upload Directories

```bash
mkdir -p uploads/payment-proofs
```

### 7. Start Server

#### Development Mode
```bash
npm run dev
```

#### Production Mode
```bash
npm start
```

Server akan berjalan di `http://localhost:3000`

## 📚 API Documentation

### Authentication Endpoints

#### Register
```http
POST /api/auth/register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "role": "customer",
  "referralCode": "ADMIN001"
}
```

#### Login
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "password123"
}
```

### Event Endpoints

#### Get All Events
```http
GET /api/events?category=musik&search=jazz&limit=10&offset=0
```

#### Create Event (Organizer only)
```http
POST /api/events
Authorization: Bearer <jwt_token>
Content-Type: application/json

{
  "title": "Konser Jazz Malam",
  "description": "Event musik jazz terbaik",
  "date": "2025-12-15",
  "time": "19:00",
  "location": "Jakarta Convention Center",
  "category": "musik",
  "price": 250000,
  "availableSeats": 500,
  "icon": "🎵"
}
```

### Transaction Endpoints

#### Create Transaction (Customer only)
```http
POST /api/transactions
Authorization: Bearer <jwt_token>
Content-Type: application/json

{
  "eventId": 1,
  "quantity": 2,
  "pointsUsed": 50000
}
```

#### Upload Payment Proof
```http
POST /api/transactions/:id/payment-proof
Authorization: Bearer <jwt_token>
Content-Type: multipart/form-data

paymentProof: <image_file>
```

### Dashboard Endpoints (Organizer only)

#### Get Overview Stats
```http
GET /api/dashboard/overview
Authorization: Bearer <jwt_token>
```

#### Get Revenue Statistics
```http
GET /api/dashboard/revenue-stats?year=2025
Authorization: Bearer <jwt_token>
```

## 👥 Default Users

Setelah menjalankan `npm run init-db`, Anda dapat login dengan:

### Organizer Account
- **Email**: `admin@eventku.com`
- **Password**: `admin123`
- **Role**: Organizer
- **Features**: Dashboard, create events, manage transactions

### Customer Account
- **Email**: `customer@demo.com`
- **Password**: `demo123`
- **Role**: Customer
- **Points**: 75,000
- **Features**: Buy tickets, write reviews, view transactions

## 🗂️ Database Schema

### Main Tables
- **users** - User accounts dengan authentication
- **organizers** - Extended info untuk organizers
- **events** - Event data dengan ratings
- **transactions** - Ticket purchases dan payments
- **reviews** - Event reviews dan ratings
- **notifications** - User notifications

### Key Features
- **Foreign key constraints** untuk data integrity
- **Triggers** untuk auto-update ratings dan timestamps
- **Indexes** untuk query performance
- **Functions** untuk business logic (referral codes, ratings)

## 🔒 Security Features

- **JWT Authentication** dengan expiration
- **Password hashing** dengan bcrypt
- **Role-based authorization**
- **SQL injection protection** dengan parameterized queries
- **File upload validation**
- **CORS configuration**

## 📱 Frontend Features

- **Responsive design** untuk mobile dan desktop
- **Modal-based UI** untuk better UX
- **Real-time updates** untuk dashboard
- **Interactive charts** untuk statistics
- **File upload** dengan preview
- **Form validation**

## 🚀 Deployment

### Production Setup

1. **Environment Variables**
```env
NODE_ENV=production
DB_HOST=your_production_db_host
DB_PASSWORD=secure_production_password
JWT_SECRET=very_secure_production_jwt_secret
```

2. **Database Migration**
```bash
npm run init-db
```

3. **Start Production Server**
```bash
npm start
```

### Docker Deployment (Optional)

```dockerfile
FROM node:16-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
EXPOSE 3000
CMD ["npm", "start"]
```

## 🧪 Testing

### Manual Testing
1. Register sebagai customer dan organizer
2. Login dengan kedua role
3. Test semua fitur (create event, buy ticket, review, dashboard)
4. Test transaction flow (payment upload, approval/rejection)

### API Testing dengan Postman
Import collection dari `postman/EventKu.postman_collection.json`

## 🤝 Contributing

1. Fork repository
2. Create feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open Pull Request

## 📄 License

This project is licensed under the MIT License.

## 📞 Support

Jika Anda mengalami masalah atau memiliki pertanyaan:

1. Check dokumentasi API di atas
2. Periksa logs di console untuk error messages
3. Pastikan database connection sudah benar
4. Verify environment variables sudah sesuai

## 🔄 Updates & Maintenance

### Database Backup
```bash
pg_dump -U postgres eventku_db > backup.sql
```

### Database Restore
```bash
psql -U postgres eventku_db < backup.sql
```

### Update Dependencies
```bash
npm update
npm audit fix
```

---

**EventKu** - Sistem manajemen event modern dengan PostgreSQL integration 🎉