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

const getAllUsers = async () => {
    const result = await db.query(`
        SELECT u.id, u.name, u.email, u.role, u.batch_id, b.name as batch_name 
        FROM users u 
        LEFT JOIN batches b ON u.batch_id = b.id 
        ORDER BY u.created_at DESC
    `);
    return result.rows;
};

const updateUser = async (id, name, email, role, batchId) => {
    const result = await db.query(
        `UPDATE users 
         SET name = $1, email = $2, role = $3, batch_id = $4 
         WHERE id = $5 
         RETURNING id, name, email, role, batch_id`,
        [name, email, role, batchId, id]
    );
    return result.rows[0];
};

const deleteUser = async (id) => {
    const result = await db.query('DELETE FROM users WHERE id = $1 RETURNING id', [id]);
    return result.rows[0];
};

module.exports = {
    findUserByEmail,
    createUser,
    findUserById,
    getAllUsers,
    updateUser,
    deleteUser
};
