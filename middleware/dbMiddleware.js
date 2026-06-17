const connectDB = require('../config/db');

const ensureDb = async (req, res, next) => {
    try {
        await connectDB();
        next();
    } catch (error) {
        res.status(500).json({
            message: `Database connection failed: ${error.message}`,
        });
    }
};

module.exports = ensureDb;