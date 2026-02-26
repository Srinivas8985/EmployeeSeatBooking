const db = require('../config/db');

/**
 * Returns a connection to run multiple queries in a transaction
 */
const getTransactionClient = async () => {
    return await db.getClient();
};

/**
 * Locks a seat for a given type, using SELECT FOR UPDATE
 */
const findAvailableSeatAndLock = async (client, seatType, bookingDate) => {
    const result = await client.query(
        `SELECT id, seat_number FROM seats 
     WHERE type = $1 
     AND id NOT IN (
       SELECT seat_id FROM bookings 
       WHERE booking_date = $2 AND status = 'BOOKED'
     ) 
     LIMIT 1 FOR UPDATE SKIP LOCKED`,
        [seatType, bookingDate]
    );
    return result.rows[0];
};

/**
 * Logical Availability:
 * Gives count of how many designated seats are unbooked. 
 * Doesn't lock anything, used for checking logically derived floater capacity.
 */
const getUnbookedDesignatedCount = async (client, bookingDate) => {
    const result = await client.query(
        `SELECT COUNT(*) FROM seats 
     WHERE type = 'DESIGNATED' 
     AND id NOT IN (
       SELECT seat_id FROM bookings WHERE booking_date = $1 AND status = 'BOOKED'
     )`,
        [bookingDate]
    );
    return parseInt(result.rows[0].count, 10);
};

const getBaseFloaterCount = async (client) => {
    const result = await client.query(`SELECT value FROM config WHERE key = 'FLOATER_BASE_COUNT'`);
    return result.rows[0] ? parseInt(result.rows[0].value, 10) : 10; // default 10
};

const getBookedFloaterCount = async (client, bookingDate) => {
    const result = await client.query(
        `SELECT COUNT(*) FROM bookings WHERE booking_date = $1 AND booking_type = 'FLOATER' AND status = 'BOOKED'`,
        [bookingDate]
    );
    return parseInt(result.rows[0].count, 10);
};

const createBooking = async (client, userId, seatId, bookingDate, bookingType) => {
    const result = await client.query(
        `INSERT INTO bookings (user_id, seat_id, booking_date, booking_type, status) 
     VALUES ($1, $2, $3, $4, 'BOOKED') RETURNING *`,
        [userId, seatId, bookingDate, bookingType]
    );
    return result.rows[0];
};

const addToWaitlist = async (client, userId, bookingDate) => {
    const result = await client.query(
        `INSERT INTO waitlist (user_id, booking_date) VALUES ($1, $2) 
     ON CONFLICT (user_id, booking_date) DO NOTHING RETURNING *`,
        [userId, bookingDate]
    );
    return result.rows[0];
};

const getBookingById = async (bookingId) => {
    const result = await db.query('SELECT * FROM bookings WHERE id = $1', [bookingId]);
    return result.rows[0];
};

const cancelBooking = async (client, bookingId) => {
    const result = await client.query(
        `UPDATE bookings SET status = 'CANCELLED' WHERE id = $1 RETURNING *`,
        [bookingId]
    );
    return result.rows[0];
};

// Waitlist Atomic Promotion components
const lockOldestWaitlistEntry = async (client, bookingDate) => {
    const result = await client.query(
        `SELECT id, user_id FROM waitlist 
     WHERE booking_date = $1 
     ORDER BY created_at ASC 
     LIMIT 1 FOR UPDATE SKIP LOCKED`,
        [bookingDate]
    );
    return result.rows[0];
};

const removeWaitlistEntry = async (client, waitlistId) => {
    await client.query(`DELETE FROM waitlist WHERE id = $1`, [waitlistId]);
};

// Returns user's booking for a day
const getUserBookingForDate = async (userId, bookingDate) => {
    const result = await db.query(
        `SELECT * FROM bookings WHERE user_id = $1 AND booking_date = $2 AND status = 'BOOKED'`,
        [userId, bookingDate]
    );
    return result.rows[0];
};

// For finding the user's working days
const getUserBatchDays = async (userId) => {
    const result = await db.query(
        `SELECT b.working_days FROM users u JOIN batches b ON u.batch_id = b.id WHERE u.id = $1`,
        [userId]
    );
    return result.rows[0]?.working_days || [];
};

// Holidays check
const isHoliday = async (bookingDate) => {
    const result = await db.query(`SELECT id FROM holidays WHERE holiday_date = $1`, [bookingDate]);
    return result.rows.length > 0;
};

module.exports = {
    getTransactionClient,
    findAvailableSeatAndLock,
    getUnbookedDesignatedCount,
    getBaseFloaterCount,
    getBookedFloaterCount,
    createBooking,
    addToWaitlist,
    getBookingById,
    cancelBooking,
    lockOldestWaitlistEntry,
    removeWaitlistEntry,
    getUserBookingForDate,
    getUserBatchDays,
    isHoliday
};
