const { Pool } = require('pg');
const bcrypt = require('bcrypt');
require('dotenv').config();

const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT || 5432,
});

const seedDatabase = async () => {
    const client = await pool.connect();
    try {
        console.log('🌱 Starting database seeding...');
        await client.query('BEGIN');

        // 1. Clear existing data (if needed, here we assume empty db)
        // await client.query('TRUNCATE users, batches, seats, bookings, waitlist, holidays, audit_logs CASCADE;');

        // 2. Insert Config
        await client.query(`
      INSERT INTO config (key, value, description)
      VALUES 
        ('FLOATER_BASE_COUNT', '10', 'Base number of floater seats available'),
        ('MAX_ADVANCE_DAYS', '14', 'Max days in advance to book designated seats')
      ON CONFLICT (key) DO NOTHING;
    `);

        // 3. Insert Batches
        const batch1Res = await client.query(`
      INSERT INTO batches (name, working_days) VALUES ('Batch 1', ARRAY[1, 2, 3]) RETURNING id;
    `);
        const batch2Res = await client.query(`
      INSERT INTO batches (name, working_days) VALUES ('Batch 2', ARRAY[4, 5]) RETURNING id;
    `);
        const b1Id = batch1Res.rows[0].id;
        const b2Id = batch2Res.rows[0].id;

        // 4. Insert Seats
        console.log('Creating 40 DESIGNATED and 10 FLOATER seats...');
        for (let i = 1; i <= 40; i++) {
            await client.query(`INSERT INTO seats (seat_number, type) VALUES ($1, 'DESIGNATED') ON CONFLICT DO NOTHING`, [`D${i}`]);
        }
        for (let i = 1; i <= 10; i++) {
            await client.query(`INSERT INTO seats (seat_number, type) VALUES ($1, 'FLOATER') ON CONFLICT DO NOTHING`, [`F${i}`]);
        }

        // 5. Create Admin User
        const adminPassHash = await bcrypt.hash('admin123', 10);
        await client.query(`
      INSERT INTO users (name, email, password_hash, role) 
      VALUES ('System Admin', 'admin@company.com', $1, 'ADMIN')
      ON CONFLICT (email) DO NOTHING;
    `, [adminPassHash]);

        // Create Sample Employee
        const empPassHash = await bcrypt.hash('password123', 10);
        await client.query(`
      INSERT INTO users (name, email, password_hash, role, batch_id) 
      VALUES ('John Doe', 'john@company.com', $1, 'EMPLOYEE', $2)
      ON CONFLICT (email) DO NOTHING;
    `, [empPassHash, b1Id]);

        await client.query('COMMIT');
        console.log('✅ Seeding completed! Admin user: admin@company.com / admin123');

    } catch (error) {
        await client.query('ROLLBACK');
        console.error('❌ Seeding failed:', error);
    } finally {
        client.release();
        pool.end();
    }
};

seedDatabase();
