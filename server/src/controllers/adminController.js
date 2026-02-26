const adminService = require('../services/adminService');

const createEmployee = async (req, res, next) => {
    try {
        const { name, email, password, role, batch_id } = req.body;
        const adminId = req.user.id;
        const newUser = await adminService.createEmployee(name, email, password, role, batch_id, adminId);
        res.status(201).json({ success: true, data: newUser });
    } catch (error) {
        next(error);
    }
};

const getAllEmployees = async (req, res, next) => {
    try {
        const employees = await adminService.getAllEmployees();
        res.status(200).json({ success: true, data: employees });
    } catch (error) {
        next(error);
    }
};

const updateEmployee = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { name, email, role, batch_id } = req.body;
        const adminId = req.user.id;

        const updatedUser = await adminService.updateEmployee(id, name, email, role, batch_id, adminId);
        res.status(200).json({ success: true, data: updatedUser });
    } catch (error) {
        next(error);
    }
};

const deleteEmployee = async (req, res, next) => {
    try {
        const { id } = req.params;
        const adminId = req.user.id;

        await adminService.deleteEmployee(id, adminId);
        res.status(200).json({ success: true, message: 'Employee deleted successfully' });
    } catch (error) {
        next(error);
    }
};

const updateConfig = async (req, res, next) => {
    try {
        const { key, value } = req.body;
        const adminId = req.user.id;
        await adminService.updateConfig(key, value, adminId);
        res.status(200).json({ success: true, message: 'Configuration updated successfully' });
    } catch (error) {
        next(error);
    }
};

const addHoliday = async (req, res, next) => {
    try {
        const { date, description } = req.body;
        const adminId = req.user.id;
        const holiday = await adminService.addHoliday(date, description, adminId);
        res.status(201).json({ success: true, data: holiday });
    } catch (error) {
        next(error);
    }
};

const getHolidays = async (req, res, next) => {
    try {
        const holidays = await adminService.getHolidays();
        res.status(200).json({ success: true, data: holidays });
    } catch (error) {
        next(error);
    }
};

const getAnalytics = async (req, res, next) => {
    try {
        const stats = await adminService.getAnalytics();
        res.status(200).json({ success: true, data: stats });
    } catch (error) {
        next(error);
    }
};

const getDailyOccupancy = async (req, res, next) => {
    try {
        const stats = await adminService.getDailyOccupancy();
        res.status(200).json({ success: true, data: stats });
    } catch (error) {
        next(error);
    }
};

const getAllBookings = async (req, res, next) => {
    try {
        const { date } = req.query;
        const bookings = await adminService.getAllBookings(date);
        res.status(200).json({ success: true, data: bookings });
    } catch (error) {
        next(error);
    }
};

const getWaitlist = async (req, res, next) => {
    try {
        const waitlist = await adminService.getWaitlist();
        res.status(200).json({ success: true, data: waitlist });
    } catch (error) {
        next(error);
    }
};

const getAuditLogs = async (req, res, next) => {
    try {
        const logs = await adminService.getAuditLogs();
        res.status(200).json({ success: true, data: logs });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    createEmployee,
    updateConfig,
    addHoliday,
    getHolidays,
    getAnalytics,
    getAllBookings,
    getWaitlist,
    getAuditLogs,
    getAllEmployees,
    updateEmployee,
    deleteEmployee,
    getDailyOccupancy
};
