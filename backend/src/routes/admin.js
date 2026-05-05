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
    const users = await User.find({ role: { $ne: 'admin' } })
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
   POST /api/admin/users/:id/modules
   Update user's completed modules
   ═══════════════════════════════════════════ */
router.post('/users/:id/modules', async (req, res) => {
  try {
    const { completedModules } = req.body;
    if (!Array.isArray(completedModules)) {
      return res.status(400).json({ message: 'Invalid data' });
    }

    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    if (!user.instituteProgress) user.instituteProgress = {};
    if (!user.instituteProgress.completedDays) user.instituteProgress.completedDays = new Map();
    if (!user.instituteProgress.unlockedModules) user.instituteProgress.unlockedModules = ['data-foundations'];

    const completedDaysMap = user.instituteProgress.completedDays instanceof Map
      ? user.instituteProgress.completedDays
      : new Map(Object.entries(user.instituteProgress.completedDays));

    // Update completed days for each module
    MODULE_META.forEach((m) => {
      if (completedModules.includes(m.id)) {
        // Mark all days complete
        const days = [];
        for (let i = 1; i <= m.days; i++) days.push(i);
        completedDaysMap.set(m.id, days);
      } else {
        // If they had it completed, should we clear it entirely? 
        // We'll only clear if it was fully complete or if the admin unchecked it.
        // To be safe, if it's not in completedModules, we clear it.
        completedDaysMap.set(m.id, []);
      }
    });

    user.instituteProgress.completedDays = completedDaysMap;

    // Recalculate unlocked modules based on completed ones
    const newUnlocked = ['data-foundations'];
    for (let i = 0; i < MODULE_META.length - 1; i++) {
      if (completedModules.includes(MODULE_META[i].id)) {
        if (!newUnlocked.includes(MODULE_META[i + 1].id)) {
          newUnlocked.push(MODULE_META[i + 1].id);
        }
      }
    }
    
    // Preserve any existing unlocked modules that they might have unlocked manually
    user.instituteProgress.unlockedModules.forEach(id => {
      if (!newUnlocked.includes(id)) newUnlocked.push(id);
    });
    user.instituteProgress.unlockedModules = newUnlocked;

    await user.save();

    res.json({ message: 'Modules updated successfully' });
  } catch (error) {
    console.error('Admin update modules error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

/* ═══════════════════════════════════════════
   POST /api/admin/users
   Create a new user manually
   ═══════════════════════════════════════════ */
router.post('/users', async (req, res) => {
  try {
    const { name, email, role } = req.body;

    if (!name || !email) {
      return res.status(400).json({ message: 'Name and email are required' });
    }

    // Check if user already exists
    const existing = await User.findOne({ email: email.toLowerCase().trim() });
    if (existing) {
      return res.status(409).json({ message: 'A user with this email already exists' });
    }

    const newUser = new User({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      role: role === 'admin' ? 'admin' : 'user',
      score: 0,
      streak: 0,
      xp: 0,
      level: 0,
    });

    await newUser.save();

    res.status(201).json({
      message: 'User created successfully',
      user: {
        _id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
      },
    });
  } catch (error) {
    console.error('Admin create user error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

/* ═══════════════════════════════════════════
   DELETE /api/admin/users/:id
   Delete a user
   ═══════════════════════════════════════════ */
router.delete('/users/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Prevent deleting yourself (the admin)
    if (user._id.toString() === req.user._id.toString()) {
      return res.status(400).json({ message: 'You cannot delete your own account' });
    }

    await User.findByIdAndDelete(req.params.id);

    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Admin delete user error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

/* ═══════════════════════════════════════════
   GET /api/admin/analytics
   Platform-wide analytics
   ═══════════════════════════════════════════ */
router.get('/analytics', async (req, res) => {
  try {
    const users = await User.find({ role: { $ne: 'admin' } }).select('xp streak lastActiveDate instituteProgress');
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
    const users = await User.find({ role: { $ne: 'admin' } })
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
