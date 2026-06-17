const express = require('express');
const crypto = require('crypto');
const User = require('../models/User');
const Admin = require('../models/Admin');
const generateToken = require('../utils/generateToken');
const formatUser = require('../utils/formatUser');
const { protect } = require('../middleware/authMiddleware');
const { getFirebaseAdmin } = require('../config/firebase');

const router = express.Router();

const sendAuthResponse = (res, user) => {
  res.json({
    token: generateToken(user),
    user: formatUser(user),
  });
};

const findAuthAccount = async (email, password) => {
  const user = await User.findOne({ email: email.toLowerCase().trim() });

  if (user && (await user.matchPassword(password))) {
    return user;
  }

  const legacyAdmin = await Admin.findOne({ email: email.toLowerCase().trim() });

  if (legacyAdmin && (await legacyAdmin.matchPassword(password))) {
    let migratedAdmin = await User.findOne({ email: legacyAdmin.email });

    if (!migratedAdmin) {
      migratedAdmin = await User.create({
        name: 'Admin',
        email: legacyAdmin.email,
        password,
        role: 'admin',
      });
    } else if (migratedAdmin.role !== 'admin') {
      migratedAdmin.role = 'admin';
      await migratedAdmin.save();
    }

    return migratedAdmin;
  }

  return null;
};

router.post('/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Name, email, and password are required' });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const existingUser = await User.findOne({ email: normalizedEmail });

    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const user = await User.create({
      name: name.trim(),
      email: normalizedEmail,
      password,
      role: 'user',
    });

    res.status(201).json({
      token: generateToken(user),
      user: formatUser(user),
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    const account = await findAuthAccount(email, password);

    if (!account) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    sendAuthResponse(res, account);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post('/google', async (req, res) => {
  try {
    const { token } = req.body;

    if (!token) {
      return res.status(400).json({ message: 'Google token is required' });
    }

    const firebaseAdmin = getFirebaseAdmin();

    if (!firebaseAdmin) {
      return res.status(503).json({ message: 'Firebase is not configured' });
    }

    const decoded = await firebaseAdmin.auth().verifyIdToken(token);
    const email = decoded.email?.toLowerCase().trim();

    if (!email) {
      return res.status(400).json({ message: 'Google account email is required' });
    }

    let user = await User.findOne({ email });

    if (!user) {
      user = await User.create({
        name: decoded.name || 'User',
        email,
        password: crypto.randomBytes(32).toString('hex'),
        role: 'user',
      });
    }

    sendAuthResponse(res, user);
  } catch (error) {
    res.status(401).json({ message: 'Google authentication failed' });
  }
});

router.get('/me', protect, async (req, res) => {
  res.json({ user: formatUser(req.user) });
});

module.exports = router;