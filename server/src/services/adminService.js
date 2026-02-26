const bcrypt = require('bcrypt');
const adminRepository = require('../repositories/adminRepository');
const userRepository = require('../repositories/userRepository');
const CustomError = require('../utils/customError');

const createEmployee = async (name, email, password, role, batchId, adminId) => {
    const existingUser = await userRepository.findUserByEmail(email);
    if (existingUser) {
        throw new CustomError('User with this email already exists', 400);
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    const newUser = await userRepository.createUser(name, email, passwordHash, role, batchId);

    // Log action
    const db = require('../config/db');
    await db.query(
        'INSERT INTO audit_logs (user_id, action, entity, details) VALUES ($1, $2, $3, $4)',
        [adminId, 'CREATE_USER', 'USERS', JSON.stringify({ new_user_id: newUser.id, role })]
    );

    return newUser;
};

const updateConfig = async (key, value, adminId) => {
    await adminRepository.updateConfig(key, value);
    const db = require('../config/db');
    await db.query(
        'INSERT INTO audit_logs (user_id, action, entity, details) VALUES ($1, $2, $3, $4)',
        [adminId, 'UPDATE_CONFIG', 'CONFIG', JSON.stringify({ key, value })]
    );
};

const addHoliday = async (date, description, adminId) => {
    const holiday = await adminRepository.addHoliday(date, description);
    const db = require('../config/db');
    await db.query(
        'INSERT INTO audit_logs (user_id, action, entity, details) VALUES ($1, $2, $3, $4)',
        [adminId, 'ADD_HOLIDAY', 'HOLIDAYS', JSON.stringify({ holiday_date: date })]
    );
    return holiday;
};

// Simple analytics
const getAnalytics = async () => {
    const db = require('../config/db');

    const today = new Date().toISOString().split('T')[0];

    // Total bookings today
    const bookingsRes = await db.query("SELECT COUNT(*) FROM bookings WHERE booking_date = $1 AND status = 'BOOKED'", [today]);
    const totalBookingsToday = parseInt(bookingsRes.rows[0].count, 10);

    // Waitlist count
    const waitlistRes = await db.query('SELECT COUNT(*) FROM waitlist WHERE booking_date = $1', [today]);
    const waitlistToday = parseInt(waitlistRes.rows[0].count, 10);

    // Total seats
    const seatsRes = await db.query('SELECT COUNT(*) FROM seats');
    const totalSeats = parseInt(seatsRes.rows[0].count, 10);

    return {
        date: today,
        occupancy_percentage: totalSeats ? ((totalBookingsToday / totalSeats) * 100).toFixed(2) : 0,
        total_bookings: totalBookingsToday,
        waitlist_count: waitlistToday,
        total_seats: totalSeats
    };
};

module.exports = {
    createEmployee,
    updateConfig,
    addHoliday,
    getAnalytics,
    getHolidays: adminRepository.getHolidays,
    getAllBookings: adminRepository.getAllBookings,
    getWaitlist: adminRepository.getWaitlist,
    getAuditLogs: adminRepository.getAuditLogs
};
