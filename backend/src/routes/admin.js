const express = require('express');
const User = require('../models/User');
const Task = require('../models/Task');
const Module = require('../models/Module');
const authMiddleware = require('../middleware/auth');
const adminMiddleware = require('../middleware/admin');
const { sendNotification } = require('../config/firebase');
const router = express.Router();

/* All routes require auth + admin */
router.use(authMiddleware);
router.use(adminMiddleware);

/* ─── Helper to get modules ─── */
const getModules = async () => {
  const modules = await Module.find().sort({ order: 1 });
  if (modules.length > 0) return modules;
  
  // Fallback to hardcoded if DB is empty
  return [
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
};

const getStats = async (modules) => {
  const totalDays = modules.reduce((acc, m) => acc + m.days, 0);
  return { totalDays, totalModules: modules.length };
};

/* ═══════════════════════════════════════════
   GET /api/admin/users
   Get all users with their progress
   ═══════════════════════════════════════════ */
router.get('/users', async (req, res) => {
  try {
    const users = await User.find({ role: { $ne: 'admin' } })
      .select('name email picture score streak xp level role lastActiveDate instituteProgress createdAt')
      .sort({ createdAt: -1 });

    const modules = await getModules();
    const { totalDays, totalModules } = await getStats(modules);

    const result = users.map((u) => {
      const p = u.instituteProgress || {};
      let completedCount = 0;
      const completedDays = p.completedDays || new Map();
      if (completedDays.forEach) {
        completedDays.forEach((days) => { completedCount += (days || []).length; });
      }
      const modulesCompleted = modules.filter((m) => {
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
          totalDays: totalDays,
          modulesCompleted,
          totalModules: totalModules,
          progress: totalDays > 0 ? Math.round((completedCount / totalDays) * 100) : 0,
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

    const modules = await getModules();
    const completedDaysMap = user.instituteProgress.completedDays instanceof Map
      ? user.instituteProgress.completedDays
      : new Map(Object.entries(user.instituteProgress.completedDays));

    // Update completed days for each module
    modules.forEach((m) => {
      if (completedModules.includes(m.id)) {
        // Mark all days complete
        const days = [];
        for (let i = 1; i <= m.days; i++) days.push(i);
        completedDaysMap.set(m.id, days);
      } else {
        completedDaysMap.set(m.id, []);
      }
    });

    user.instituteProgress.completedDays = completedDaysMap;

    // Recalculate unlocked modules based on completed ones
    const newUnlocked = [modules[0]?.id || 'data-foundations'];
    for (let i = 0; i < modules.length - 1; i++) {
      if (completedModules.includes(modules[i].id)) {
        if (!newUnlocked.includes(modules[i + 1].id)) {
          newUnlocked.push(modules[i + 1].id);
        }
      }
    }
    
    // Preserve any existing unlocked modules
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
   PATCH /api/admin/users/:id
   Update user stats directly
   ═══════════════════════════════════════════ */
router.patch('/users/:id', async (req, res) => {
  try {
    const { name, xp, streak, level, role } = req.body;
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    if (name !== undefined) user.name = name;
    if (xp !== undefined) user.xp = xp;
    if (streak !== undefined) user.streak = streak;
    if (level !== undefined) user.level = level;
    if (role !== undefined) user.role = role;

    await user.save();
    res.json({ message: 'User updated successfully', user });
  } catch (error) {
    console.error('Admin patch user error:', error);
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

    const modules = await getModules();
    const { totalDays } = await getStats(modules);

    // Per-module completion counts
    const moduleCompletion = {};
    modules.forEach((m) => { moduleCompletion[m.id] = 0; });

    users.forEach((u) => {
      totalXP += u.xp || 0;
      totalStreak += u.streak || 0;
      if (u.lastActiveDate === today) activeToday++;

      const p = u.instituteProgress || {};
      totalInstituteXP += p.xp || 0;

      const completedDays = p.completedDays || new Map();
      modules.forEach((m) => {
        const days = completedDays instanceof Map ? completedDays.get(m.id) : (completedDays[m.id] || []);
        if ((days || []).length === m.days) {
          moduleCompletion[m.id]++;
        }
      });
    });

    const moduleAnalytics = modules.map((m) => ({
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

    const modules = await getModules();
    const { totalDays } = await getStats(modules);

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
        progress: totalDays > 0 ? Math.round((completedCount / totalDays) * 100) : 0,
      };
    });

    res.json(result);
  } catch (error) {
    console.error('Admin leaderboard error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

/* ═══════════════════════════════════════════
   GET /api/admin/reports
   Detailed per-user analytics report
   ═══════════════════════════════════════════ */
router.get('/reports', async (req, res) => {
  try {
    const users = await User.find({ role: { $ne: 'admin' } })
      .select('name email picture score streak xp level lastActiveDate instituteProgress createdAt')
      .sort({ createdAt: -1 });

    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];
    const sevenDaysAgo = new Date(today);
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const sevenDaysAgoStr = sevenDaysAgo.toISOString().split('T')[0];
    const thirtyDaysAgo = new Date(today);
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const thirtyDaysAgoStr = thirtyDaysAgo.toISOString().split('T')[0];

    // Fetch all tasks for all users
    const allTasks = await Task.find({});

    // Group tasks by userId
    const tasksByUser = {};
    allTasks.forEach(t => {
      const uid = t.userId.toString();
      if (!tasksByUser[uid]) tasksByUser[uid] = [];
      tasksByUser[uid].push(t);
    });

    const modules = await getModules();
    const { totalDays, totalModules } = await getStats(modules);

    const userReports = users.map(u => {
      const uid = u._id.toString();
      const tasks = tasksByUser[uid] || [];

      // Session stats
      const totalSessions = tasks.reduce((acc, t) => acc + (t.morning ? 1 : 0) + (t.evening ? 1 : 0), 0);
      const totalMorning = tasks.reduce((acc, t) => acc + (t.morning ? 1 : 0), 0);
      const totalEvening = tasks.reduce((acc, t) => acc + (t.evening ? 1 : 0), 0);
      const totalProblems = tasks.reduce((acc, t) => acc + (t.problems || 0), 0);
      const studyHours = totalSessions * 2;
      const activeDays = tasks.filter(t => t.morning || t.evening).length;

      // Last 7 days activity
      const recentTasks = tasks.filter(t => t.date >= sevenDaysAgoStr);
      const recentSessions = recentTasks.reduce((acc, t) => acc + (t.morning ? 1 : 0) + (t.evening ? 1 : 0), 0);
      const recentProblems = recentTasks.reduce((acc, t) => acc + (t.problems || 0), 0);

      // Last 30 days activity
      const monthTasks = tasks.filter(t => t.date >= thirtyDaysAgoStr);
      const monthSessions = monthTasks.reduce((acc, t) => acc + (t.morning ? 1 : 0) + (t.evening ? 1 : 0), 0);
      const monthProblems = monthTasks.reduce((acc, t) => acc + (t.problems || 0), 0);

      // Institute progress
      const p = u.instituteProgress || {};
      const completedDays = p.completedDays || {};
      let instituteCompleted = 0;
      if (completedDays instanceof Map) {
        completedDays.forEach((days) => { instituteCompleted += (days || []).length; });
      } else if (completedDays.forEach) {
        completedDays.forEach((days) => { instituteCompleted += (days || []).length; });
      } else {
        Object.values(completedDays).forEach((days) => { instituteCompleted += (days || []).length; });
      }

      const modulesCompleted = modules.filter(m => {
        let days;
        if (completedDays instanceof Map) {
          days = completedDays.get(m.id) || [];
        } else {
          days = completedDays[m.id] || [];
        }
        return days.length === m.days;
      }).length;

      // Engagement level
      let engagement = 'Inactive';
      if (u.lastActiveDate === todayStr) engagement = 'Active Today';
      else if (u.lastActiveDate && u.lastActiveDate >= sevenDaysAgoStr) engagement = 'Active This Week';
      else if (u.lastActiveDate && u.lastActiveDate >= thirtyDaysAgoStr) engagement = 'Active This Month';

      // Daily problems for past 7 days (for sparkline)
      const dailyActivity = Array.from({ length: 7 }, (_, i) => {
        const d = new Date(today);
        d.setDate(d.getDate() - (6 - i));
        const dateStr = d.toISOString().split('T')[0];
        const task = tasks.find(t => t.date === dateStr);
        return {
          date: dateStr,
          problems: task?.problems || 0,
          sessions: (task?.morning ? 1 : 0) + (task?.evening ? 1 : 0),
        };
      });

      return {
        _id: u._id,
        name: u.name,
        email: u.email,
        picture: u.picture,
        score: u.score,
        streak: u.streak,
        xp: u.xp || 0,
        level: u.level || 0,
        lastActiveDate: u.lastActiveDate,
        createdAt: u.createdAt,
        engagement,
        study: {
          totalSessions,
          totalMorning,
          totalEvening,
          totalProblems,
          studyHours,
          activeDays,
        },
        recent: {
          sessions: recentSessions,
          problems: recentProblems,
        },
        monthly: {
          sessions: monthSessions,
          problems: monthProblems,
        },
        institute: {
          xp: p.xp || 0,
          completedDays: instituteCompleted,
          totalDays: totalDays,
          modulesCompleted,
          totalModules: totalModules,
          progress: totalDays > 0 ? Math.round((instituteCompleted / totalDays) * 100) : 0,
        },
        dailyActivity,
      };
    });

    // Aggregated platform stats
    const totalStudyHours = userReports.reduce((acc, u) => acc + u.study.studyHours, 0);
    const totalProblems = userReports.reduce((acc, u) => acc + u.study.totalProblems, 0);
    const activeToday = userReports.filter(u => u.engagement === 'Active Today').length;
    const activeThisWeek = userReports.filter(u => u.engagement === 'Active Today' || u.engagement === 'Active This Week').length;
    const avgProgress = userReports.length > 0
      ? Math.round(userReports.reduce((acc, u) => acc + u.institute.progress, 0) / userReports.length)
      : 0;

    res.json({
      summary: {
        totalUsers: userReports.length,
        totalStudyHours,
        totalProblems,
        activeToday,
        activeThisWeek,
        avgProgress,
        avgStreak: userReports.length > 0
          ? Math.round(userReports.reduce((acc, u) => acc + u.streak, 0) / userReports.length)
          : 0,
      },
      users: userReports,
    });
  } catch (error) {
    console.error('Admin reports error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

/* ═══════════════════════════════════════════
   POST /api/admin/notifications
   Send broadcast notification
   ═══════════════════════════════════════════ */
router.post('/notifications', async (req, res) => {
  try {
    const { title, body, target } = req.body;
    if (!title || !body) return res.status(400).json({ message: 'Title and body required' });

    let users = [];
    if (target === 'all') {
      users = await User.find({ fcmToken: { $ne: null } }).select('fcmToken');
    } else {
      // Add logic for specific user groups if needed
      users = await User.find({ fcmToken: { $ne: null } }).select('fcmToken');
    }

    const tokens = users.map(u => u.fcmToken).filter(t => !!t);
    if (tokens.length === 0) return res.json({ message: 'No users with registered devices found' });

    await sendNotification(tokens, title, body);
    res.json({ message: `Notification sent to ${tokens.length} devices` });
  } catch (error) {
    console.error('Admin notification error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

/* ═══════════════════════════════════════════
   MODULE MANAGEMENT
   ═══════════════════════════════════════════ */

router.get('/modules', async (req, res) => {
  try {
    const modules = await Module.find().sort({ order: 1 });
    res.json(modules);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

router.post('/modules', async (req, res) => {
  try {
    const mod = new Module(req.body);
    await mod.save();
    res.status(201).json(mod);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

router.patch('/modules/:id', async (req, res) => {
  try {
    const mod = await Module.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(mod);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

router.delete('/modules/:id', async (req, res) => {
  try {
    await Module.findByIdAndDelete(req.params.id);
    res.json({ message: 'Module deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

const { sendWarningMail } = require('../services/mailService');

/* ═══════════════════════════════════════════
   POST /api/admin/send-warning
   Send warning email to a user
   ═══════════════════════════════════════════ */
router.post('/send-warning', async (req, res) => {
  try {
    const { userId } = req.body;
    if (!userId) {
      return res.status(400).json({ message: 'User ID is required' });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (!user.email) {
      return res.status(400).json({ message: 'User does not have a registered email' });
    }

    await sendWarningMail(user.email, user.name);

    res.json({ message: 'Warning email sent successfully' });
  } catch (error) {
    console.error('Send warning error:', error);
    res.status(500).json({ message: error.message || 'Failed to send warning email' });
  }
});

module.exports = router;


