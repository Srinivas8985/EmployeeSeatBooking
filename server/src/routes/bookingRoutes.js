const express = require('express');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');
const { bookSeat, cancelBooking, getMyBookings } = require('../controllers/bookingController');

const router = express.Router();

router.use(protect);

router.post('/', authorize('EMPLOYEE', 'ADMIN'), bookSeat);
router.delete('/:id', authorize('EMPLOYEE', 'ADMIN'), cancelBooking);
router.get('/my', authorize('EMPLOYEE', 'ADMIN'), getMyBookings);

module.exports = router;
