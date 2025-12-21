-- EventKu Database Schema

-- Users table
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL CHECK (role IN ('customer', 'organizer')),
    referral_code VARCHAR(8) UNIQUE NOT NULL,
    referred_by INTEGER REFERENCES users(id),
    points INTEGER DEFAULT 0,
    total_referrals INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Organizers table (additional info for organizers)
CREATE TABLE organizers (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    company_name VARCHAR(255),
    phone VARCHAR(20),
    address TEXT,
    total_events INTEGER DEFAULT 0,
    average_rating DECIMAL(3,2) DEFAULT 0,
    total_reviews INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Events table
CREATE TABLE events (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    date DATE NOT NULL,
    time TIME NOT NULL,
    location VARCHAR(255) NOT NULL,
    category VARCHAR(50) NOT NULL,
    price INTEGER DEFAULT 0,
    available_seats INTEGER NOT NULL,
    total_seats INTEGER NOT NULL,
    organizer_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    icon VARCHAR(10) DEFAULT '🎉',
    average_rating DECIMAL(3,2) DEFAULT 0,
    total_reviews INTEGER DEFAULT 0,
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'cancelled', 'completed')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Transactions table
CREATE TABLE transactions (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    event_id INTEGER REFERENCES events(id) ON DELETE CASCADE,
    quantity INTEGER NOT NULL,
    original_price INTEGER NOT NULL,
    points_used INTEGER DEFAULT 0,
    final_price INTEGER NOT NULL,
    status VARCHAR(30) NOT NULL CHECK (status IN ('waiting_payment', 'waiting_confirmation', 'done', 'rejected', 'expired', 'canceled')),
    payment_proof VARCHAR(255),
    expires_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Reviews table
CREATE TABLE reviews (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    event_id INTEGER REFERENCES events(id) ON DELETE CASCADE,
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comment TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, event_id)
);

-- Notifications table
CREATE TABLE notifications (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    type VARCHAR(50) NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for better performance
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_referral_code ON users(referral_code);
CREATE INDEX idx_events_organizer ON events(organizer_id);
CREATE INDEX idx_events_date ON events(date);
CREATE INDEX idx_events_category ON events(category);
CREATE INDEX idx_transactions_user ON transactions(user_id);
CREATE INDEX idx_transactions_event ON transactions(event_id);
CREATE INDEX idx_transactions_status ON transactions(status);
CREATE INDEX idx_reviews_event ON reviews(event_id);
CREATE INDEX idx_reviews_user ON reviews(user_id);

-- Triggers for updated_at timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_events_updated_at BEFORE UPDATE ON events FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_transactions_updated_at BEFORE UPDATE ON transactions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_reviews_updated_at BEFORE UPDATE ON reviews FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to generate referral code
CREATE OR REPLACE FUNCTION generate_referral_code()
RETURNS VARCHAR(8) AS $$
DECLARE
    chars TEXT := 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    result VARCHAR(8) := '';
    i INTEGER;
BEGIN
    FOR i IN 1..8 LOOP
        result := result || substr(chars, floor(random() * length(chars) + 1)::integer, 1);
    END LOOP;
    RETURN result;
END;
$$ LANGUAGE plpgsql;

-- Function to update event ratings
CREATE OR REPLACE FUNCTION update_event_rating()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE events 
    SET 
        average_rating = (
            SELECT COALESCE(AVG(rating), 0) 
            FROM reviews 
            WHERE event_id = COALESCE(NEW.event_id, OLD.event_id)
        ),
        total_reviews = (
            SELECT COUNT(*) 
            FROM reviews 
            WHERE event_id = COALESCE(NEW.event_id, OLD.event_id)
        )
    WHERE id = COALESCE(NEW.event_id, OLD.event_id);
    
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_event_rating_trigger
    AFTER INSERT OR UPDATE OR DELETE ON reviews
    FOR EACH ROW EXECUTE FUNCTION update_event_rating();

-- Function to update organizer stats
CREATE OR REPLACE FUNCTION update_organizer_stats()
RETURNS TRIGGER AS $$
DECLARE
    org_id INTEGER;
BEGIN
    -- Get organizer ID from event
    SELECT organizer_id INTO org_id 
    FROM events 
    WHERE id = COALESCE(NEW.event_id, OLD.event_id);
    
    -- Update organizer stats
    UPDATE organizers 
    SET 
        average_rating = (
            SELECT COALESCE(AVG(r.rating), 0)
            FROM reviews r
            JOIN events e ON r.event_id = e.id
            WHERE e.organizer_id = org_id
        ),
        total_reviews = (
            SELECT COUNT(*)
            FROM reviews r
            JOIN events e ON r.event_id = e.id
            WHERE e.organizer_id = org_id
        )
    WHERE user_id = org_id;
    
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_organizer_stats_trigger
    AFTER INSERT OR UPDATE OR DELETE ON reviews
    FOR EACH ROW EXECUTE FUNCTION update_organizer_stats();