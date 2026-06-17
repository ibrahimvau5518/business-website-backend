const connectDB = require('../config/db');

const ensureDb = async (req, res, next) => {
    console.log(`[DEBUG ensureDb] middleware started for ${req.method} ${req.originalUrl}`);

    try {
        console.log('[DEBUG ensureDb] before connectDB()');
        await connectDB();
        console.log('[DEBUG ensureDb] after connectDB()');
        next();
    } catch (error) {
        console.error(`[DEBUG ensureDb] connectDB failed: ${error.message}`);
        res.status(500).json({
            message: `Database connection failed: ${error.message}`,
        });
    }
};

module.exports = ensureDb;