const express = require('express');
const Challenge = require('../models/Challenge');
const Task = require('../models/Task');
const User = require('../models/User');
const authMiddleware = require('../middleware/auth');
const router = express.Router();

// Create a challenge
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { title, durationDays } = req.body;
    if (!title) return res.status(400).json({ message: 'Challenge title required' });
    
    const days = Math.min(7, Math.max(3, parseInt(durationDays) || 3));
    const startDate = new Date();
    const endDate = new Date();
    endDate.setDate(startDate.getDate() + days);

    const challenge = new Challenge({
      creator: req.user._id,
      participants: [req.user._id],
      title,
      durationDays: days,
      startDate,
      endDate
    });

    await challenge.save();
    res.status(201).json(challenge);
  } catch (error) {
    console.error('Create challenge error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// List challenges
router.get('/', authMiddleware, async (req, res) => {
  try {
    const challenges = await Challenge.find({ participants: req.user._id })
      .populate('creator', 'name picture')
      .populate('participants', 'name picture score level')
      .sort({ createdAt: -1 });
    res.json(challenges);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Join a challenge
router.post('/:id/join', authMiddleware, async (req, res) => {
  try {
    const challenge = await Challenge.findById(req.params.id);
    if (!challenge) return res.status(404).json({ message: 'Challenge not found' });
    if (challenge.status === 'completed') return res.status(400).json({ message: 'Challenge ended' });

    if (challenge.participants.includes(req.user._id)) {
      return res.status(400).json({ message: 'Already participating' });
    }

    challenge.participants.push(req.user._id);
    await challenge.save();
    res.json(challenge);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Compare challenge scores
router.get('/:id/scores', authMiddleware, async (req, res) => {
  try {
    const challenge = await Challenge.findById(req.params.id).populate('participants', 'name picture');
    if (!challenge) return res.status(404).json({ message: 'Challenge not found' });

    const startStr = challenge.startDate.toISOString().split('T')[0];
    const endStr = challenge.endDate.toISOString().split('T')[0];

    const leaderboard = await Promise.all(challenge.participants.map(async (p) => {
      const tasks = await Task.find({
        userId: p._id,
        date: { $gte: startStr, $lte: endStr }
      });

      const challengeSessions = tasks.reduce((acc, t) => acc + (t.morning ? 1 : 0) + (t.evening ? 1 : 0), 0);
      const challengeProblems = tasks.reduce((acc, t) => acc + (t.problems || 0), 0);
      const challengeXP = challengeSessions * 40 + challengeProblems * 10;

      return {
        _id: p._id,
        name: p.name,
        picture: p.picture,
        sessions: challengeSessions,
        problems: challengeProblems,
        xp: challengeXP
      };
    }));

    leaderboard.sort((a, b) => b.xp - a.xp);

    res.json({
      challenge,
      leaderboard
    });
  } catch (error) {
    console.error('Challenge scores error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
