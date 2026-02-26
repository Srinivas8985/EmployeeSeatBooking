const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
require('dotenv').config();

const app = express();

// Security Middleware
app.use(helmet());

// CORS configuration - Allow all for development, restrict for production
app.use(cors());

// Parsing JSON & URL-encoded bodies
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Fallback to prevent "Cannot destructure property of undefined" if Content-Type is missing
app.use((req, res, next) => {
    if (!req.body) req.body = {};
    next();
});

// Request logging middleware
if (process.env.NODE_ENV === 'development') {
    app.use(morgan('dev'));
}

// Health Check Route
app.get('/api/health', (req, res) => {
    res.status(200).json({ status: 'UP', timestamp: new Date() });
});

// Import Routes
const authRoutes = require('./routes/authRoutes');
const adminRoutes = require('./routes/adminRoutes');
const bookingRoutes = require('./routes/bookingRoutes');

app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/bookings', bookingRoutes);

// Global Error Handler
app.use((err, req, res, next) => {
    console.error('Internal Server Error:', err.stack);
    const status = err.statusCode || 500;
    // Never expose internal errors in production
    const message = process.env.NODE_ENV === 'production' && status === 500
        ? 'Internal Server Error'
        : err.message || 'Internal Server Error';

    res.status(status).json({
        success: false,
        error: message,
    });
});

// 404 Route Not Found
app.use((req, res) => {
    res.status(404).json({ success: false, error: 'Route not found' });
});

module.exports = app;
