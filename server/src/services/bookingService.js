const bookingRepo = require('../repositories/bookingRepository');
const CustomError = require('../utils/customError');
const db = require('../config/db');

// --- Helper Functions ---

const isWeekend = (dateString) => {
    const day = new Date(dateString).getDay();
    return day === 0 || day === 6; // Sunday or Saturday
};

const getDayOfWeek = (dateString) => {
    return new Date(dateString).getDay();
};

const diffDays = (date1, date2) => {
    const d1 = new Date(date1).setHours(0, 0, 0, 0);
    const d2 = new Date(date2).setHours(0, 0, 0, 0);
    return Math.round((d2 - d1) / (1000 * 60 * 60 * 24));
};

// --- Main Service Logic ---

const getAvailability = async (userId, date) => {
    if (!date) throw new CustomError('Date is required', 400);

    const client = await db.getClient();
    let result = {};
    try {
        const workingDays = await bookingRepo.getUserBatchDays(userId);
        const targetDay = getDayOfWeek(date);
        const isWorkingBatch = workingDays.includes(targetDay);

        result.is_working_batch = isWorkingBatch;
        result.booking_type = isWorkingBatch ? 'DESIGNATED' : 'FLOATER';

        const isHol = await bookingRepo.isHoliday(date);
        result.is_holiday = isHol;
        result.is_weekend = isWeekend(date);

        const seatsRes = await client.query('SELECT COUNT(*) FROM seats');
        result.total_seats = parseInt(seatsRes.rows[0].count, 10);

        const waitlistRes = await client.query('SELECT COUNT(*) FROM waitlist WHERE booking_date = $1', [date]);
        result.waitlist_count = parseInt(waitlistRes.rows[0].count, 10);

        const designatedBookedRes = await client.query(`SELECT COUNT(*) FROM bookings WHERE booking_date = $1 AND booking_type = 'DESIGNATED' AND status = 'BOOKED'`, [date]);
        const designatedBooked = parseInt(designatedBookedRes.rows[0].count, 10);
        const totalDesignatedRes = await client.query(`SELECT COUNT(*) FROM seats WHERE type = 'DESIGNATED'`);
        const totalDesignated = parseInt(totalDesignatedRes.rows[0].count, 10);

        result.designated_available = Math.max(0, totalDesignated - designatedBooked);
        result.designated_total = totalDesignated;

        const baseFloaterCount = await bookingRepo.getBaseFloaterCount(client);
        const bookedFloaterCount = await bookingRepo.getBookedFloaterCount(client, date);
        const unbookedDesignatedCount = Math.max(0, totalDesignated - designatedBooked);

        const totalLogicalFloaterCapacity = baseFloaterCount + unbookedDesignatedCount;
        result.floater_available = Math.max(0, totalLogicalFloaterCapacity - bookedFloaterCount);
        result.floater_total = totalLogicalFloaterCapacity;

        const todayStr = new Date().toISOString().split('T')[0];
        const daysDiff = diffDays(todayStr, date);
        const currentHour = new Date().getHours();

        if (isHol || result.is_weekend) {
            result.is_eligible = false;
            result.eligibility_reason = isHol ? 'Company Holiday' : 'Weekend';
        } else if (daysDiff < 0) {
            result.is_eligible = false;
            result.eligibility_reason = 'Cannot book past dates';
        } else if (daysDiff > 14) {
            result.is_eligible = false;
            result.eligibility_reason = 'Cannot book more than 14 days in advance';
        } else if (!isWorkingBatch) {
            if (daysDiff !== 1) {
                result.is_eligible = false;
                result.eligibility_reason = 'Floater seats can only be booked exactly 1 day in advance';
            } else if (currentHour < 15) {
                result.is_eligible = false;
                result.eligibility_reason = 'Floater seats can only be booked after 3 PM server time the day before';
            } else {
                result.is_eligible = true;
            }
        } else {
            result.is_eligible = true;
        }

        const existingBooking = await bookingRepo.getUserBookingForDate(userId, date);
        if (existingBooking) {
            result.is_eligible = false;
            result.eligibility_reason = 'Already booked for this date';
        }

        const waitlistUserRes = await client.query('SELECT id FROM waitlist WHERE user_id = $1 AND booking_date = $2', [userId, date]);
        if (waitlistUserRes.rows.length > 0) {
            result.is_eligible = false;
            result.eligibility_reason = 'Already on waitlist for this date';
        }

        const batchRes = await client.query(`SELECT b.name FROM users u JOIN batches b ON u.batch_id = b.id WHERE u.id = $1`, [userId]);
        result.batch_name = batchRes.rows[0]?.name || 'Unassigned Batch';

    } catch (e) {
        throw e;
    } finally {
        client.release();
    }

    return result;
};

const bookSeat = async (userId, bookingDate) => {
    // 1. Basic Validations
    if (isWeekend(bookingDate)) {
        throw new CustomError('Booking not allowed on weekends', 400);
    }

    const isHol = await bookingRepo.isHoliday(bookingDate);
    if (isHol) {
        throw new CustomError('Booking not allowed on holidays', 400);
    }

    const todayStr = new Date().toISOString().split('T')[0];
    const daysDiff = diffDays(todayStr, bookingDate);

    if (daysDiff < 0) {
        throw new CustomError('Cannot book for past dates', 400);
    }
    if (daysDiff > 14) {
        throw new CustomError('Cannot book more than 14 days in advance', 400);
    }

    // 2. Duplicate Check
    const existingBooking = await bookingRepo.getUserBookingForDate(userId, bookingDate);
    if (existingBooking) {
        throw new CustomError('You already have a booking for this date', 400);
    }

    // 3. Determine Batch & Eligibility
    const workingDays = await bookingRepo.getUserBatchDays(userId);
    const targetDay = getDayOfWeek(bookingDate);
    const isWorkingBatch = workingDays.includes(targetDay);

    let bookingType = isWorkingBatch ? 'DESIGNATED' : 'FLOATER';

    // Floater Rule Verification (if user is non-working batch for that day)
    if (!isWorkingBatch) {
        if (daysDiff !== 1) {
            throw new CustomError('Floater seats can only be booked exactly 1 day in advance', 400);
        }
        const currentHour = new Date().getHours();
        if (currentHour < 15) {
            throw new CustomError('Floater seats can only be booked after 3 PM server time the day before', 400);
        }
    }

    // 4. TRANSACTION START
    const client = await bookingRepo.getTransactionClient();
    try {
        await client.query('BEGIN');

        let seatAssigned = null;

        if (bookingType === 'DESIGNATED') {
            seatAssigned = await bookingRepo.findAvailableSeatAndLock(client, 'DESIGNATED', bookingDate);

            // If no designated seat, they do NOT fall back to floater seats because floaters are for non-working batch.
            // They just go to waitlist.
        } else {
            // Floater booking
            // Calculate logical floater capacity
            const baseFloaterCount = await bookingRepo.getBaseFloaterCount(client);
            const unbookedDesignatedCount = await bookingRepo.getUnbookedDesignatedCount(client, bookingDate);

            // 3PM logical conversion: after 3PM yesterday, unused designated seats become part of floater pool logically.
            const totalLogicalFloaterCapacity = baseFloaterCount + unbookedDesignatedCount;
            const bookedFloaterCount = await bookingRepo.getBookedFloaterCount(client, bookingDate);

            if (bookedFloaterCount < totalLogicalFloaterCapacity) {
                // Technically we can pick any available seat, but structurally we prefer grabbing physical 'FLOATER' seats first, 
                // then grabbing physical 'DESIGNATED' seats if needed (since they were logically converted).
                seatAssigned = await bookingRepo.findAvailableSeatAndLock(client, 'FLOATER', bookingDate);
                if (!seatAssigned) {
                    // borrow an unbooked designated seat
                    seatAssigned = await bookingRepo.findAvailableSeatAndLock(client, 'DESIGNATED', bookingDate);
                }
            }
        }

        if (seatAssigned) {
            // Create actual booking
            const newBooking = await bookingRepo.createBooking(client, userId, seatAssigned.id, bookingDate, bookingType);

            // Audit log
            await client.query(
                'INSERT INTO audit_logs (user_id, action, entity, details) VALUES ($1, $2, $3, $4)',
                [userId, 'CREATE_BOOKING', 'BOOKINGS', JSON.stringify({ booking_id: newBooking.id, seat_id: seatAssigned.id, date: bookingDate })]
            );

            await client.query('COMMIT');
            return { status: 'BOOKED', seat: seatAssigned.seat_number, booking: newBooking };
        } else {
            // Add to Waitlist
            const waitlistEntry = await bookingRepo.addToWaitlist(client, userId, bookingDate);
            await client.query('COMMIT');
            return { status: 'WAITLISTED', message: 'Seats are full. You have been added to the waitlist.', waitlist: waitlistEntry };
        }
    } catch (err) {
        await client.query('ROLLBACK');
        if (err.code === '23505') {
            throw new CustomError('You are already booked or on the waitlist for this date.', 400);
        }
        throw err;
    } finally {
        client.release();
    }
};

const cancelBooking = async (userId, bookingId) => {
    const booking = await bookingRepo.getBookingById(bookingId);
    if (!booking) {
        throw new CustomError('Booking not found', 404);
    }
    if (booking.user_id !== userId) {
        throw new CustomError('Unauthorized to cancel this booking', 403);
    }
    if (booking.status === 'CANCELLED') {
        throw new CustomError('Booking is already cancelled', 400);
    }

    const client = await bookingRepo.getTransactionClient();
    try {
        await client.query('BEGIN');

        // 1. Cancel the current booking
        await bookingRepo.cancelBooking(client, bookingId);

        // Log Cancellation
        await client.query(
            'INSERT INTO audit_logs (user_id, action, entity, details) VALUES ($1, $2, $3, $4)',
            [userId, 'CANCEL_BOOKING', 'BOOKINGS', JSON.stringify({ booking_id: bookingId })]
        );

        // 2. Waitlist Promotion (Atomic)
        const bookingDate = booking.booking_date.toISOString().split('T')[0];
        const waitlistRow = await bookingRepo.lockOldestWaitlistEntry(client, bookingDate);

        if (waitlistRow) {
            // Re-book the just released seat to the waitlisted user
            const waitlistedUserId = waitlistRow.user_id;

            let waitlistBookingType = 'DESIGNATED'; // Assume designated, though we could check batch. Due to rules, waitlist could be mixed. 
            // To strictly adhere, we evaluate the promoted user's batch days.
            const workingDays = await bookingRepo.getUserBatchDays(waitlistedUserId);
            const isWaitlistUserWorkingBatch = workingDays.includes(getDayOfWeek(bookingDate));
            waitlistBookingType = isWaitlistUserWorkingBatch ? 'DESIGNATED' : 'FLOATER';

            const newBooking = await bookingRepo.createBooking(
                client,
                waitlistedUserId,
                booking.seat_id,
                bookingDate,
                waitlistBookingType
            );

            // Remove from waitlist
            await bookingRepo.removeWaitlistEntry(client, waitlistRow.id);

            // Log Promotion
            await client.query(
                'INSERT INTO audit_logs (user_id, action, entity, details) VALUES ($1, $2, $3, $4)',
                [waitlistedUserId, 'WAITLIST_PROMOTED', 'BOOKINGS', JSON.stringify({ old_waitlist_id: waitlistRow.id, new_booking_id: newBooking.id })]
            );
        }

        await client.query('COMMIT');
        return { success: true, message: 'Booking cancelled successfully' };
    } catch (err) {
        await client.query('ROLLBACK');
        throw err;
    } finally {
        client.release();
    }
};

const getMyBookings = async (userId) => {
    const result = await db.query(
        `SELECT b.id, b.booking_date, b.booking_type, b.status, s.seat_number, s.type as physical_seat_type 
     FROM bookings b
     JOIN seats s ON b.seat_id = s.id
     WHERE b.user_id = $1 
     ORDER BY b.booking_date DESC`,
        [userId]
    );
    return result.rows;
};

module.exports = {
    getAvailability,
    bookSeat,
    cancelBooking,
    getMyBookings
};
