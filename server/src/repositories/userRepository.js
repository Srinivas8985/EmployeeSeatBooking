const db = require('../config/db');

const findUserByEmail = async (email) => {
    const result = await db.query('SELECT * FROM users WHERE email = $1', [email]);
    return result.rows[0];
};

const createUser = async (name, email, passwordHash, role, batchId = null) => {
    const result = await db.query(
        `INSERT INTO users (name, email, password_hash, role, batch_id) 
     VALUES ($1, $2, $3, $4, $5) RETURNING id, name, email, role, batch_id`,
        [name, email, passwordHash, role, batchId]
    );
    return result.rows[0];
};

const findUserById = async (id) => {
    const result = await db.query('SELECT id, name, email, role, batch_id FROM users WHERE id = $1', [id]);
    return result.rows[0];
};

module.exports = {
    findUserByEmail,
    createUser,
    findUserById
};
