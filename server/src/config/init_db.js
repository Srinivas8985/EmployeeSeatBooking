const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT || 5432,
});

const executeQuery = async (query) => {
    const client = await pool.connect();
    try {
        await client.query(query);
    } finally {
        client.release();
    }
};

const createTables = async () => {
    try {
        console.log('Creating database tables...');

        // 1. Config Table
        await executeQuery(`
      CREATE TABLE IF NOT EXISTS config (
        key VARCHAR(50) PRIMARY KEY,
        value VARCHAR(255) NOT NULL,
        description TEXT
      );
    `);

        // 2. Batches
        await executeQuery(`
      CREATE TABLE IF NOT EXISTS batches (
        id SERIAL PRIMARY KEY,
        name VARCHAR(50) NOT NULL,
        working_days INTEGER[] NOT NULL -- array of day numbers (0=Sun, 1=Mon, ..., 6=Sat)
      );
    `);

        // 3. Users Table
        await executeQuery(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        email VARCHAR(150) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        role VARCHAR(20) NOT NULL CHECK (role IN ('ADMIN', 'EMPLOYEE')),
        batch_id INTEGER REFERENCES batches(id) ON DELETE SET NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

        // 4. Seats Table
        await executeQuery(`
      CREATE TABLE IF NOT EXISTS seats (
        id SERIAL PRIMARY KEY,
        seat_number VARCHAR(20) UNIQUE NOT NULL,
        type VARCHAR(20) NOT NULL CHECK (type IN ('DESIGNATED', 'FLOATER'))
      );
    `);

        // 5. Bookings Table
        // Constraints: UNIQUE(user_id, booking_date)
        await executeQuery(`
      CREATE TABLE IF NOT EXISTS bookings (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        seat_id INTEGER NOT NULL REFERENCES seats(id) ON DELETE RESTRICT,
        booking_date DATE NOT NULL,
        booking_type VARCHAR(20) NOT NULL CHECK (booking_type IN ('DESIGNATED', 'FLOATER')),
        status VARCHAR(20) NOT NULL CHECK (status IN ('BOOKED', 'CANCELLED')),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT unique_user_booking_date UNIQUE(user_id, booking_date)
      );
    `);

        // Add index on booking_date
        await executeQuery(`CREATE INDEX IF NOT EXISTS idx_booking_date ON bookings(booking_date);`);

        // 6. Waitlist Table
        await executeQuery(`
      CREATE TABLE IF NOT EXISTS waitlist (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        booking_date DATE NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT unique_user_waitlist_date UNIQUE(user_id, booking_date)
      );
    `);

        // Add index on waitlist date and creation time for atomic promotion priority
        await executeQuery(`CREATE INDEX IF NOT EXISTS idx_waitlist_date_created ON waitlist(booking_date, created_at);`);

        // 7. Holidays Table
        await executeQuery(`
      CREATE TABLE IF NOT EXISTS holidays (
        id SERIAL PRIMARY KEY,
        holiday_date DATE UNIQUE NOT NULL,
        description VARCHAR(255)
      );
    `);

        // 8. Audit Logs Table
        await executeQuery(`
      CREATE TABLE IF NOT EXISTS audit_logs (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
        action VARCHAR(50) NOT NULL,
        entity VARCHAR(50) NOT NULL,
        details JSONB,
        timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

        console.log('✅ All tables created successfully.');
    } catch (error) {
        console.error('❌ Error creating tables:', error.stack);
    } finally {
        pool.end();
    }
};

createTables();
