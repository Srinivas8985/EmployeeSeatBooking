const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const userRepository = require('../repositories/userRepository');
const CustomError = require('../utils/customError');

const loginUser = async (email, password) => {
    const user = await userRepository.findUserByEmail(email);

    if (!user) {
        throw new CustomError('Invalid credentials', 401);
    }

    const isMatch = await bcrypt.compare(password, user.password_hash);

    if (!isMatch) {
        throw new CustomError('Invalid credentials', 401);
    }

    // Verify secret exists (fallback handled in environment, but good practice)
    if (!process.env.JWT_SECRET) {
        throw new CustomError('Server configuration missing JWT_SECRET', 500);
    }

    const payload = {
        id: user.id,
        role: user.role,
        batch_id: user.batch_id
    };

    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1d' });

    return {
        user: {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
            batch_id: user.batch_id
        },
        token
    };
};

module.exports = {
    loginUser
};
