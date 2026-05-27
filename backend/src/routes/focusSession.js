const express = require('express');
const FocusSession = require('../models/FocusSession');
const User = require('../models/User');
const Task = require('../models/Task');
const authMiddleware = require('../middleware/auth');
const { sendNotification } = require('../config/firebase');
const router = express.Router();

/* All routes require authentication */
router.use(authMiddleware);

/* ═══════════════════════════════════════════
   POST /api/focus-sessions
   Save a completed focus session
   ═══════════════════════════════════════════ */
router.post('/', async (req, res) => {
  try {
    const { sessionType, focusMinutes, problemsSolved, topic, notes } = req.body;
    const userId = req.user._id;
    const today = new Date().toISOString().split('T')[0];

    if (!['morning', 'evening'].includes(sessionType)) {
      return res.status(400).json({ message: 'Invalid session type. Must be morning or evening.' });
    }

    const minutes = Math.max(0, parseInt(focusMinutes) || 0);
    const problems = Math.max(0, parseInt(problemsSolved) || 0);

    // Check for duplicate
    const existing = await FocusSession.findOne({ userId, date: today, sessionType });
    if (existing) {
      return res.status(400).json({ message: `${sessionType} session already completed today` });
    }

    // Create focus session
    const session = new FocusSession({
      userId,
      date: today,
      sessionType,
      focusMinutes: minutes,
      problemsSolved: problems,
      topic: (topic || '').trim(),
      notes: (notes || '').trim(),
      completed: true,
    });
    await session.save();

    // Also update the legacy Task model for backward compatibility
    let task = await Task.findOne({ userId, date: today });
    if (!task) task = new Task({ userId, date: today });
    task[sessionType] = true;
    task.problems = (task.problems || 0) + problems;
    await task.save();

    // Update user streak and XP
    const user = await User.findById(userId);
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split('T')[0];

    let newStreak = user.streak;
    if (user.lastActiveDate === today) {
      /* keep streak */
    } else if (user.lastActiveDate === yesterdayStr) {
      newStreak += 1;
    } else if (!user.lastActiveDate) {
      newStreak = 1;
    } else {
      newStreak = 1;
    }

    user.xp = (user.xp || 0) + session.xpEarned;
    user.score = (user.score || 0) + session.xpEarned;
    user.streak = newStreak;
    user.lastActiveDate = today;
    user.totalSessions = (user.totalSessions || 0) + 1;
    await user.save();

    // Send push notification if available
    if (user.fcmToken) {
      sendNotification(
        user.fcmToken,
        'Focus Session Complete! 🎯',
        `+${session.xpEarned} XP earned! Topic: ${session.topic || 'General'}. Streak: ${newStreak}🔥`,
        { type: 'focus_session', xp: String(session.xpEarned) }
      ).catch(err => console.error('Push notification error:', err));
    }

    // Broadcast leaderboard update
    const io = req.app.get('io');
    if (io) {
      const leaderboard = await User.find({}).sort({ score: -1 }).limit(20).select('name picture score streak');
      io.emit('leaderboard:update', leaderboard);
    }

    res.status(201).json({
      session,
      xpEarned: session.xpEarned,
      totalXP: user.xp,
      streak: user.streak,
    });
  } catch (error) {
    console.error('Save focus session error:', error);
    if (error.code === 11000) {
      return res.status(400).json({ message: 'This session has already been completed today' });
    }
    res.status(500).json({ message: 'Server error' });
  }
});

/* ═══════════════════════════════════════════
   GET /api/focus-sessions/today
   Get today's sessions for the current user
   ═══════════════════════════════════════════ */
router.get('/today', async (req, res) => {
  try {
    const userId = req.user._id;
    const today = new Date().toISOString().split('T')[0];

    const sessions = await FocusSession.find({ userId, date: today }).sort({ createdAt: 1 });

    const morningDone = sessions.some(s => s.sessionType === 'morning');
    const eveningDone = sessions.some(s => s.sessionType === 'evening');
    const totalProblems = sessions.reduce((acc, s) => acc + s.problemsSolved, 0);
    const totalXP = sessions.reduce((acc, s) => acc + s.xpEarned, 0);
    const totalMinutes = sessions.reduce((acc, s) => acc + s.focusMinutes, 0);

    res.json({
      sessions,
      summary: {
        morningDone,
        eveningDone,
        totalProblems,
        totalXP,
        totalMinutes,
        sessionsCompleted: sessions.length,
      },
    });
  } catch (error) {
    console.error('Get today sessions error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

/* ═══════════════════════════════════════════
   GET /api/focus-sessions/stats
   Aggregate stats for the current user
   ═══════════════════════════════════════════ */
router.get('/stats', async (req, res) => {
  try {
    const userId = req.user._id;

    const allSessions = await FocusSession.find({ userId, completed: true });
    const user = await User.findById(userId).select('streak xp');

    const totalSessions = allSessions.length;
    const totalProblems = allSessions.reduce((acc, s) => acc + s.problemsSolved, 0);
    const totalXPFromSessions = allSessions.reduce((acc, s) => acc + s.xpEarned, 0);
    const totalMinutes = allSessions.reduce((acc, s) => acc + s.focusMinutes, 0);

    // Topics breakdown
    const topicCounts = {};
    allSessions.forEach(s => {
      const t = s.topic || 'General';
      topicCounts[t] = (topicCounts[t] || 0) + 1;
    });

    // Last 7 days activity
    const today = new Date();
    const dailyActivity = Array.from({ length: 7 }, (_, i) => {
      const d = new Date(today);
      d.setDate(d.getDate() - (6 - i));
      const dateStr = d.toISOString().split('T')[0];
      const daySessions = allSessions.filter(s => s.date === dateStr);
      return {
        date: dateStr,
        sessions: daySessions.length,
        problems: daySessions.reduce((acc, s) => acc + s.problemsSolved, 0),
        xp: daySessions.reduce((acc, s) => acc + s.xpEarned, 0),
      };
    });

    res.json({
      totalSessions,
      totalProblems,
      totalXP: totalXPFromSessions,
      totalMinutes,
      streak: user.streak,
      topicBreakdown: topicCounts,
      dailyActivity,
    });
  } catch (error) {
    console.error('Get stats error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

/* ═══════════════════════════════════════════
   GET /api/focus-sessions/history
   Session history (last 30 days)
   ═══════════════════════════════════════════ */
router.get('/history', async (req, res) => {
  try {
    const userId = req.user._id;
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const thirtyDaysAgoStr = thirtyDaysAgo.toISOString().split('T')[0];

    const sessions = await FocusSession.find({
      userId,
      date: { $gte: thirtyDaysAgoStr },
    }).sort({ date: -1, createdAt: -1 });

    res.json(sessions);
  } catch (error) {
    console.error('Get history error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
