const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Admin = require('../models/Admin');
const { getFirebaseAdmin } = require('../config/firebase');

const getBearerToken = (req) => {
  if (req.headers.authorization?.startsWith('Bearer')) {
    return req.headers.authorization.split(' ')[1];
  }
  return null;
};

const loadUserFromToken = async (decoded) => {
  let user = await User.findById(decoded.id).select('-password');

  if (user) {
    return user;
  }

  if (decoded.role === 'admin') {
    const legacyAdmin = await Admin.findById(decoded.id);

    if (legacyAdmin) {
      return {
        _id: legacyAdmin._id,
        name: 'Admin',
        email: legacyAdmin.email,
        role: 'admin',
      };
    }
  }

  return null;
};

const protect = async (req, res, next) => {
  const token = getBearerToken(req);

  if (!token) {
    return res.status(401).json({ message: 'Not authorized, no token' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await loadUserFromToken(decoded);

    if (!user) {
      return res.status(401).json({ message: 'Not authorized, user not found' });
    }

    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'Session expired, please login again' });
    }

    return res.status(401).json({ message: 'Not authorized, invalid token' });
  }
};

const protectAdmin = async (req, res, next) => {
  const token = getBearerToken(req);

  if (!token) {
    return res.status(401).json({ message: 'Not authorized, no token' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await loadUserFromToken(decoded);

    if (!user) {
      return res.status(401).json({ message: 'Not authorized, user not found' });
    }

    if (user.role !== 'admin') {
      return res.status(403).json({ message: 'Forbidden: admin access required' });
    }

    req.user = user;
    req.admin = user;
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'Session expired, please login again' });
    }

    return res.status(401).json({ message: 'Not authorized, invalid token' });
  }
};

const protectFirebase = async (req, res, next) => {
  const token = getBearerToken(req);

  if (!token) {
    return res.status(401).json({ message: 'Not authorized, no token' });
  }

  try {
    const firebaseAdmin = getFirebaseAdmin();

    if (!firebaseAdmin) {
      return res.status(503).json({ message: 'Firebase is not configured' });
    }

    const decodedToken = await firebaseAdmin.auth().verifyIdToken(token);
    req.user = decodedToken;
    next();
  } catch (error) {
    res.status(401).json({ message: 'Not authorized, token failed' });
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

module.exports = { protect, protectAdmin, protectFirebase, isAdmin };