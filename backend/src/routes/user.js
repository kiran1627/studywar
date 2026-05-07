const express = require('express');
const User = require('../models/User');
const Task = require('../models/Task');
const authMiddleware = require('../middleware/auth');
const { sendNotification } = require('../config/firebase');
const router = express.Router();

const calculateSessionScore = (sessionType, problems, currentStreak) => {
  let score = 0;
  if (sessionType === 'morning' || sessionType === 'evening') score += 40;
  if (problems >= 6) score += 20;
  else if (problems >= 3) score += 10;
  else if (problems >= 1) score += 5;
  if (currentStreak >= 7) score += 20;
  else if (currentStreak >= 5) score += 10;
  else if (currentStreak >= 3) score += 5;
  return score;
};

router.put('/complete-session', authMiddleware, async (req, res) => {
  try {
    const { sessionType, problems } = req.body;
    const userId = req.user._id;
    const today = new Date().toISOString().split('T')[0];

    if (!['morning', 'evening'].includes(sessionType))
      return res.status(400).json({ message: 'Invalid session type' });

    const problemCount = Math.max(0, parseInt(problems) || 0);

    let task = await Task.findOne({ userId, date: today });
    if (!task) task = new Task({ userId, date: today });

    if (task[sessionType])
      return res.status(400).json({ message: `${sessionType} session already completed today` });

    task[sessionType] = true;
    task.problems = (task.problems || 0) + problemCount;
    await task.save();

    const user = await User.findById(userId);
    let newStreak = user.streak;
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split('T')[0];

    if (user.lastActiveDate === today) { /* keep streak */ }
    else if (user.lastActiveDate === yesterdayStr) newStreak += 1;
    else if (!user.lastActiveDate) newStreak = 1;
    else newStreak = 1;

    const earnedScore = calculateSessionScore(sessionType, problemCount, newStreak);
    user.score += earnedScore;
    user.streak = newStreak;
    user.lastActiveDate = today;
    await user.save();

    if (earnedScore > 0 && user.fcmToken) {
      sendNotification(
        user.fcmToken,
        'Session Completed! 🚀',
        `You earned ${earnedScore} points for your ${sessionType} session! Streak: ${newStreak}🔥`,
        { type: 'session_reward', score: String(earnedScore) }
      ).catch(err => console.error('Error sending session push:', err));
    }

    const io = req.app.get('io');
    if (io) {
      const leaderboard = await User.find({}).sort({ score: -1 }).limit(20).select('name picture score streak');
      io.emit('leaderboard:update', leaderboard);
    }

    res.json({ score: user.score, streak: user.streak, earnedScore, task });
  } catch (error) {
    console.error('Complete session error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

router.get('/profile', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-__v');
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

router.get('/stats', authMiddleware, async (req, res) => {
  try {
    const userId = req.user._id;
    const tasks = await Task.find({ userId });
    const now = new Date();
    const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
    const maxSessions = daysInMonth * 2;
    const monthStart = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-01`;
    const monthTasks = tasks.filter((t) => t.date >= monthStart);
    const monthCompleted = monthTasks.reduce((acc, t) => acc + (t.morning ? 1 : 0) + (t.evening ? 1 : 0), 0);
    const progress = Math.round((monthCompleted / maxSessions) * 100);

    res.json({
      totalDays: tasks.length,
      totalCompleted: tasks.reduce((a, t) => a + (t.morning ? 1 : 0) + (t.evening ? 1 : 0), 0),
      monthProgress: progress,
      totalProblems: tasks.reduce((a, t) => a + t.problems, 0),
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Invite a friend
router.post('/friends/invite', authMiddleware, async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: 'Friend email required' });

    const friend = await User.findOne({ email: email.toLowerCase().trim() });
    if (!friend) return res.status(404).json({ message: 'User not found' });

    if (friend._id.equals(req.user._id)) {
      return res.status(400).json({ message: 'You cannot invite yourself' });
    }

    // Add to mutual friends
    const user = await User.findById(req.user._id);
    if (user.friends.includes(friend._id)) {
      return res.status(400).json({ message: 'Already friends' });
    }

    user.friends.push(friend._id);
    await user.save();

    if (!friend.friends.includes(req.user._id)) {
      friend.friends.push(req.user._id);
      await friend.save();
    }

    res.json({ message: 'Friend added successfully!', friend });
  } catch (error) {
    console.error('Friend invite error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get friends list
router.get('/friends', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate('friends', 'name picture score level streak xp');
    res.json(user.friends || []);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Friend ranking leaderboard
router.get('/friends/leaderboard', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate('friends', 'name picture score level streak xp');
    const leaderboard = [...(user.friends || []), user];
    leaderboard.sort((a, b) => (b.xp || 0) - (a.xp || 0));
    res.json(leaderboard);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Save FCM Token
router.post('/fcm-token', authMiddleware, async (req, res) => {
  try {
    const { token } = req.body;
    if (!token) return res.status(400).json({ message: 'Token is required' });

    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    user.fcmToken = token;
    await user.save();

    res.json({ message: 'FCM token saved successfully' });
  } catch (error) {
    console.error('FCM token save error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
