const app = require('./src/app');
const db = require('./src/config/db');

const PORT = process.env.PORT || 5000;

// Test DB Connection before starting server
db.query('SELECT NOW()')
    .then((res) => {
        console.log('✅ PostgreSQL Connected at:', res.rows[0].now);

        app.listen(PORT, () => {
            console.log(`🚀 Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
        });
    })
    .catch((err) => {
        console.error('❌ Database connection failed!', err.stack);
        process.exit(1);
    });
