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

const getDailyOccupancy = async () => {
    const db = require('../config/db');
    const seatsRes = await db.query('SELECT COUNT(*) FROM seats');
    const totalSeats = parseInt(seatsRes.rows[0].count, 10);

    const result = await db.query(`
        WITH DailyStats AS (
            SELECT 
                b.booking_date as date, 
                COUNT(*) as booked
            FROM bookings b
            WHERE b.status='BOOKED'
            GROUP BY b.booking_date
        ), WaitlistStats AS (
            SELECT 
                w.booking_date as date, 
                COUNT(*) as waitlist_count
            FROM waitlist w
            GROUP BY w.booking_date
        )
        SELECT 
            COALESCE(d.date, w.date) as stat_date,
            COALESCE(d.booked, 0) as booked,
            COALESCE(w.waitlist_count, 0) as waitlist_count
        FROM DailyStats d
        FULL OUTER JOIN WaitlistStats w ON d.date = w.date
        ORDER BY stat_date DESC
        LIMIT 30
    `);

    return result.rows.map(row => ({
        date: row.stat_date.toISOString().split('T')[0],
        booked: parseInt(row.booked, 10),
        waitlist: parseInt(row.waitlist_count, 10),
        capacity: totalSeats,
        occupancy_percentage: totalSeats ? ((parseInt(row.booked, 10) / totalSeats) * 100).toFixed(2) : 0
    }));
};

const getAllEmployees = async () => {
    return await userRepository.getAllUsers();
};

const updateEmployee = async (id, name, email, role, batchId, adminId) => {
    const updatedUser = await userRepository.updateUser(id, name, email, role, batchId);

    if (!updatedUser) {
        throw new CustomError('User not found', 404);
    }

    const db = require('../config/db');
    await db.query(
        'INSERT INTO audit_logs (user_id, action, entity, details) VALUES ($1, $2, $3, $4)',
        [adminId, 'UPDATE_USER', 'USERS', JSON.stringify({ updated_user_id: id, role })]
    );

    return updatedUser;
};

const deleteEmployee = async (id, adminId) => {
    const deletedUser = await userRepository.deleteUser(id);

    if (!deletedUser) {
        throw new CustomError('User not found', 404);
    }

    const db = require('../config/db');
    await db.query(
        'INSERT INTO audit_logs (user_id, action, entity, details) VALUES ($1, $2, $3, $4)',
        [adminId, 'DELETE_USER', 'USERS', JSON.stringify({ deleted_user_id: id })]
    );

    return true;
};

module.exports = {
    createEmployee,
    updateConfig,
    addHoliday,
    getAnalytics,
    getHolidays: adminRepository.getHolidays,
    getAllBookings: adminRepository.getAllBookings,
    getWaitlist: adminRepository.getWaitlist,
    getAuditLogs: adminRepository.getAuditLogs,
    getAllEmployees,
    updateEmployee,
    deleteEmployee,
    getDailyOccupancy
};
