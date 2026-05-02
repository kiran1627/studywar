const express = require('express');
const User = require('../models/User');
const authMiddleware = require('../middleware/auth');
const adminMiddleware = require('../middleware/admin');
const router = express.Router();

/* All routes require auth + admin */
router.use(authMiddleware);
router.use(adminMiddleware);

/* ─── Module metadata for analytics ─── */
const MODULE_META = [
  { id: 'data-foundations', title: 'Data Foundations', days: 3 },
  { id: 'machine-learning', title: 'Machine Learning', days: 3 },
  { id: 'applied-ai', title: 'Applied AI', days: 2 },
  { id: 'deep-learning', title: 'Deep Learning', days: 3 },
  { id: 'generative-ai', title: 'Generative AI', days: 2 },
  { id: 'langchain', title: 'LangChain', days: 2 },
  { id: 'agents', title: 'Agents', days: 2 },
  { id: 'multi-agent', title: 'Multi-Agent Systems', days: 2 },
  { id: 'backend', title: 'Backend', days: 2 },
  { id: 'app-development', title: 'App Development', days: 2 },
];
const TOTAL_DAYS = 23;

/* ═══════════════════════════════════════════
   GET /api/admin/users
   Get all users with their progress
   ═══════════════════════════════════════════ */
router.get('/users', async (req, res) => {
  try {
    const users = await User.find({})
      .select('name email picture score streak xp level role lastActiveDate instituteProgress createdAt')
      .sort({ createdAt: -1 });

    const result = users.map((u) => {
      const p = u.instituteProgress || {};
      let completedCount = 0;
      const completedDays = p.completedDays || new Map();
      if (completedDays.forEach) {
        completedDays.forEach((days) => { completedCount += (days || []).length; });
      }
      const modulesCompleted = MODULE_META.filter((m) => {
        const days = completedDays instanceof Map ? completedDays.get(m.id) : (completedDays[m.id] || []);
        return (days || []).length === m.days;
      }).length;

      return {
        _id: u._id,
        name: u.name,
        email: u.email,
        picture: u.picture,
        score: u.score,
        streak: u.streak,
        xp: u.xp || 0,
        level: u.level || 0,
        role: u.role || 'user',
        lastActiveDate: u.lastActiveDate,
        createdAt: u.createdAt,
        institute: {
          xp: p.xp || 0,
          currentDay: p.currentDay || 1,
          completedDays: completedCount,
          totalDays: TOTAL_DAYS,
          modulesCompleted,
          totalModules: MODULE_META.length,
          progress: Math.round((completedCount / TOTAL_DAYS) * 100),
        },
      };
    });

    res.json(result);
  } catch (error) {
    console.error('Admin get users error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

/* ═══════════════════════════════════════════
   GET /api/admin/users/:id
   Get single user detail
   ═══════════════════════════════════════════ */
router.get('/users/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
      .select('name email picture score streak xp level role lastActiveDate instituteProgress createdAt');
    if (!user) return res.status(404).json({ message: 'User not found' });

    const p = user.instituteProgress || {};
    const completedDays = {};
    if (p.completedDays) {
      if (p.completedDays instanceof Map) {
        p.completedDays.forEach((val, key) => { completedDays[key] = val; });
      } else {
        Object.assign(completedDays, p.completedDays);
      }
    }

    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      picture: user.picture,
      score: user.score,
      streak: user.streak,
      xp: user.xp,
      level: user.level,
      role: user.role,
      lastActiveDate: user.lastActiveDate,
      createdAt: user.createdAt,
      instituteProgress: {
        currentDay: p.currentDay || 1,
        xp: p.xp || 0,
        unlockedModules: p.unlockedModules || ['data-foundations'],
        completedDays,
      },
    });
  } catch (error) {
    console.error('Admin get user error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

/* ═══════════════════════════════════════════
   GET /api/admin/analytics
   Platform-wide analytics
   ═══════════════════════════════════════════ */
router.get('/analytics', async (req, res) => {
  try {
    const users = await User.find({}).select('xp streak lastActiveDate instituteProgress');
    const totalUsers = users.length;

    const today = new Date().toISOString().split('T')[0];
    let totalXP = 0;
    let totalStreak = 0;
    let activeToday = 0;
    let totalInstituteXP = 0;

    // Per-module completion counts
    const moduleCompletion = {};
    MODULE_META.forEach((m) => { moduleCompletion[m.id] = 0; });

    users.forEach((u) => {
      totalXP += u.xp || 0;
      totalStreak += u.streak || 0;
      if (u.lastActiveDate === today) activeToday++;

      const p = u.instituteProgress || {};
      totalInstituteXP += p.xp || 0;

      const completedDays = p.completedDays || new Map();
      MODULE_META.forEach((m) => {
        const days = completedDays instanceof Map ? completedDays.get(m.id) : (completedDays[m.id] || []);
        if ((days || []).length === m.days) {
          moduleCompletion[m.id]++;
        }
      });
    });

    const moduleAnalytics = MODULE_META.map((m) => ({
      id: m.id,
      title: m.title,
      days: m.days,
      completedByUsers: moduleCompletion[m.id],
      completionRate: totalUsers > 0 ? Math.round((moduleCompletion[m.id] / totalUsers) * 100) : 0,
    }));

    res.json({
      totalUsers,
      totalXP,
      totalInstituteXP,
      avgStreak: totalUsers > 0 ? Math.round(totalStreak / totalUsers) : 0,
      activeToday,
      moduleAnalytics,
    });
  } catch (error) {
    console.error('Admin analytics error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

/* ═══════════════════════════════════════════
   GET /api/admin/leaderboard
   Full leaderboard with institute XP
   ═══════════════════════════════════════════ */
router.get('/leaderboard', async (req, res) => {
  try {
    const users = await User.find({})
      .select('name picture score streak xp instituteProgress')
      .sort({ xp: -1 })
      .limit(50);

    const result = users.map((u) => {
      const p = u.instituteProgress || {};
      let completedCount = 0;
      const completedDays = p.completedDays || new Map();
      if (completedDays.forEach) {
        completedDays.forEach((days) => { completedCount += (days || []).length; });
      }

      return {
        _id: u._id,
        name: u.name,
        picture: u.picture,
        score: u.score,
        streak: u.streak,
        xp: u.xp || 0,
        instituteXP: p.xp || 0,
        progress: Math.round((completedCount / TOTAL_DAYS) * 100),
      };
    });

    res.json(result);
  } catch (error) {
    console.error('Admin leaderboard error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
