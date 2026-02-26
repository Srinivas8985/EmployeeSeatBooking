const express = require('express');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');
const {
    createEmployee,
    updateConfig,
    addHoliday,
    getHolidays,
    getAnalytics,
    getAllBookings,
    getWaitlist,
    getAuditLogs
} = require('../controllers/adminController');

const router = express.Router();

// All routes require authentication and ADMIN role
router.use(protect);
router.use(authorize('ADMIN'));

router.post('/users', createEmployee);
router.put('/config', updateConfig);
router.post('/holidays', addHoliday);
router.get('/holidays', getHolidays);
router.get('/analytics', getAnalytics);
router.get('/bookings', getAllBookings);
router.get('/waitlist', getWaitlist);
router.get('/audit-logs', getAuditLogs);

module.exports = router;
