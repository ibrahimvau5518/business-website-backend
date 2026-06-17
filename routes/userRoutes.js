const express = require('express');
const User = require('../models/User');
const formatUser = require('../utils/formatUser');
const { protectAdmin } = require('../middleware/authMiddleware');

const router = express.Router();

router.patch('/:id/role', protectAdmin, async (req, res) => {
  try {
    const { role } = req.body;

    if (!['user', 'admin'].includes(role)) {
      return res.status(400).json({ message: 'Role must be either "user" or "admin"' });
    }

    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.role = role;
    await user.save();

    res.json({
      message: `User role updated to "${role}"`,
      user: formatUser(user),
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;