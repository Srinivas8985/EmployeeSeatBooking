const bookingService = require('../services/bookingService');
const Joi = require('joi'); // Light validation in controller layer

const bookSeat = async (req, res, next) => {
    try {
        const { date } = req.body;

        // Basic format validation
        const schema = Joi.object({
            date: Joi.date().iso().required()
        });

        const { error } = schema.validate(req.body);
        if (error) {
            return res.status(400).json({ success: false, error: error.details[0].message });
        }

        const userId = req.user.id;
        const result = await bookingService.bookSeat(userId, date);

        res.status(201).json({ success: true, data: result });
    } catch (err) {
        next(err);
    }
};

const cancelBooking = async (req, res, next) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;

        const result = await bookingService.cancelBooking(userId, id);

        res.status(200).json(result);
    } catch (err) {
        next(err);
    }
};

const getMyBookings = async (req, res, next) => {
    try {
        const userId = req.user.id;
        const bookings = await bookingService.getMyBookings(userId);

        res.status(200).json({ success: true, data: bookings });
    } catch (err) {
        next(err);
    }
};

const getAvailability = async (req, res, next) => {
    try {
        const userId = req.user.id;
        const { date } = req.query;
        const availability = await bookingService.getAvailability(userId, date);

        res.status(200).json({ success: true, data: availability });
    } catch (err) {
        next(err);
    }
};

module.exports = {
    bookSeat,
    cancelBooking,
    getMyBookings,
    getAvailability
};
