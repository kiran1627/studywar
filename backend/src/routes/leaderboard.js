const express = require('express');
const User = require('../models/User');
const authMiddleware = require('../middleware/auth');
const router = express.Router();

router.get('/', authMiddleware, async (req, res) => {
  try {
    const leaderboard = await User.find({ role: { $ne: 'admin' } })
      .sort({ score: -1 })
      .limit(20)
      .select('name picture score streak');
    res.json(leaderboard);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
