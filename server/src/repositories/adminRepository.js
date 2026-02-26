const db = require('../config/db');

const getConfig = async (key) => {
    const result = await db.query('SELECT value FROM config WHERE key = $1', [key]);
    return result.rows[0]?.value;
};

const updateConfig = async (key, value) => {
    await db.query(
        'INSERT INTO config (key, value) VALUES ($1, $2) ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value',
        [key, value]
    );
};

const addHoliday = async (date, description) => {
    const result = await db.query(
        'INSERT INTO holidays (holiday_date, description) VALUES ($1, $2) RETURNING *',
        [date, description]
    );
    return result.rows[0];
};

const getHolidays = async () => {
    const result = await db.query('SELECT * FROM holidays ORDER BY holiday_date ASC');
    return result.rows;
};

const getAllBookings = async (dateStr) => {
    let query = `
    SELECT b.id, b.booking_date, b.booking_type, b.status, 
           u.name as user_name, u.email as user_email,
           s.seat_number, s.type as seat_type
    FROM bookings b
    JOIN users u ON b.user_id = u.id
    JOIN seats s ON b.seat_id = s.id
  `;
    const params = [];

    if (dateStr) {
        query += ' WHERE b.booking_date = $1';
        params.push(dateStr);
    }

    query += ' ORDER BY b.booking_date DESC, b.created_at DESC';

    const result = await db.query(query, params);
    return result.rows;
};

const getWaitlist = async () => {
    const result = await db.query(`
    SELECT w.id, w.booking_date, w.created_at, u.name as user_name, u.email as user_email
    FROM waitlist w
    JOIN users u ON w.user_id = u.id
    ORDER BY w.booking_date ASC, w.created_at ASC
  `);
    return result.rows;
};

const getAuditLogs = async () => {
    const result = await db.query(`
    SELECT a.id, a.action, a.entity, a.details, a.timestamp, u.name as user_name
    FROM audit_logs a
    LEFT JOIN users u ON a.user_id = u.id
    ORDER BY a.timestamp DESC LIMIT 100
  `);
    return result.rows;
};

module.exports = {
    getConfig,
    updateConfig,
    addHoliday,
    getHolidays,
    getAllBookings,
    getWaitlist,
    getAuditLogs
};
