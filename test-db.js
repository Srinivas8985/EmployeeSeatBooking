const db = require('./server/src/config/db');
async function test() {
    try {
        const result = await db.query(`SELECT COALESCE('2025-01-01'::DATE, '2025-01-02'::DATE) as stat_date`);
        console.log(result.rows);
        const row = result.rows[0];
        console.log('stat_date IS Date?', row.stat_date instanceof Date);
        console.log('stat_date typeof:', typeof row.stat_date);
        console.log('stat_date value:', row.stat_date);
    } catch (e) { console.error('ERROR:', e); }
    process.exit();
}
test();
