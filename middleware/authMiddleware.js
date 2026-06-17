const jwt = require('jsonwebtoken');
const { getFirebaseAdmin } = require('../config/firebase');
const Admin = require('../models/Admin');

const protect = async (req, res, next) => {
    let token;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            token = req.headers.authorization.split(' ')[1];
            const admin = getFirebaseAdmin();
            if (!admin) {
                return res.status(503).json({ message: 'Firebase is not configured' });
            }
            const decodedToken = await admin.auth().verifyIdToken(token);
            req.user = decodedToken;
            next();
        } catch (error) {
            console.error('Firebase Auth Error:', error);
            res.status(401).json({ message: 'Not authorized, token failed' });
        }
    } else {
        res.status(401).json({ message: 'Not authorized, no token' });
    }
};

const isAdmin = (req, res, next) => {
    const adminEmail = process.env.ADMIN_EMAIL || 'admin@gmail.com';
    if (req.user && req.user.email === adminEmail) {
        next();
    } else {
        res.status(403).json({ message: 'Not authorized as an admin' });
    }
};

const protectAdmin = async (req, res, next) => {
    if (!req.headers.authorization?.startsWith('Bearer')) {
        return res.status(401).json({ message: 'Not authorized, no token' });
    }

    try {
        const token = req.headers.authorization.split(' ')[1];
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const adminUser = await Admin.findById(decoded.id).select('-password');

        if (!adminUser) {
            return res.status(401).json({ message: 'Not authorized, admin not found' });
        }

        req.admin = adminUser;
        next();
    } catch (error) {
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({ message: 'Session expired, please login again' });
        }
        return res.status(401).json({ message: 'Not authorized, invalid token' });
    }
};

module.exports = { protect, isAdmin, protectAdmin };