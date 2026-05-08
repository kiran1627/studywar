const express = require('express');
const User = require('../models/User');
const Module = require('../models/Module');
const authMiddleware = require('../middleware/auth');
const { sendNotification } = require('../config/firebase');
const router = express.Router();

/* ─── Helpers to get dynamic curriculum ─── */
const getCurriculum = async () => {
  const modules = await Module.find().sort({ order: 1 });
  if (modules.length > 0) {
    const order = modules.map(m => m.id);
    const dayCounts = {};
    modules.forEach(m => { dayCounts[m.id] = m.days; });
    const totalDays = modules.reduce((acc, m) => acc + m.days, 0);
    return { order, dayCounts, totalDays };
  }
  
  // Fallback
  const fallbackOrder = ['data-foundations', 'machine-learning', 'applied-ai', 'deep-learning', 'generative-ai', 'langchain', 'agents', 'multi-agent', 'backend', 'app-development'];
  const fallbackDayCounts = { 'data-foundations': 3, 'machine-learning': 3, 'applied-ai': 2, 'deep-learning': 3, 'generative-ai': 2, 'langchain': 2, 'agents': 2, 'multi-agent': 2, 'backend': 2, 'app-development': 2 };
  return { order: fallbackOrder, dayCounts: fallbackDayCounts, totalDays: 23 };
};

const XP_PER_DAY = 25;

/* ═══════════════════════════════════════════
   GET /api/progress/me
   Return the current user's institute progress
   ═══════════════════════════════════════════ */
router.get('/me', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    // Ensure instituteProgress exists
    if (!user.instituteProgress) {
      user.instituteProgress = {
        currentDay: 1,
        xp: 0,
        unlockedModules: ['data-foundations'],
        completedDays: {},
        dayProgress: {},
      };
      await user.save();
    }

    const progress = user.instituteProgress.toObject
      ? user.instituteProgress.toObject()
      : user.instituteProgress;

    // Convert Maps to plain objects for the response
    const completedDays = {};
    if (progress.completedDays) {
      if (progress.completedDays instanceof Map) {
        progress.completedDays.forEach((val, key) => { completedDays[key] = val; });
      } else {
        Object.assign(completedDays, progress.completedDays);
      }
    }

    const dayProgress = {};
    if (progress.dayProgress) {
      if (progress.dayProgress instanceof Map) {
        progress.dayProgress.forEach((val, key) => { dayProgress[key] = val; });
      } else {
        Object.assign(dayProgress, progress.dayProgress);
      }
    }

    res.json({
      currentDay: progress.currentDay || 1,
      xp: progress.xp || 0,
      unlockedModules: progress.unlockedModules || ['data-foundations'],
      completedDays,
      dayProgress,
    });
  } catch (error) {
    console.error('Get progress error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

/* ═══════════════════════════════════════════
   POST /api/progress/update
   Toggle day / block completion
   Body: { moduleId, day, block }
   block: "learning" | "practice" | "build" | "full"
   ═══════════════════════════════════════════ */
router.post('/update', authMiddleware, async (req, res) => {
  try {
    const { moduleId, day, block } = req.body;

    const { order, dayCounts } = await getCurriculum();

    if (!moduleId || !day) {
      return res.status(400).json({ message: 'moduleId and day are required' });
    }

    if (!dayCounts[moduleId]) {
      return res.status(400).json({ message: 'Invalid moduleId' });
    }

    const dayNum = parseInt(day);
    if (isNaN(dayNum) || dayNum < 1 || dayNum > dayCounts[moduleId]) {
      return res.status(400).json({ message: 'Invalid day number' });
    }

    const user = await User.findById(req.user._id);

    // Initialize institute progress if needed
    if (!user.instituteProgress) {
      user.instituteProgress = {
        currentDay: 1,
        xp: 0,
        unlockedModules: ['data-foundations'],
        completedDays: new Map(),
        dayProgress: new Map(),
      };
    }

    const progress = user.instituteProgress;

    // Check module is unlocked
    if (!progress.unlockedModules.includes(moduleId)) {
      return res.status(403).json({ message: 'Module is locked' });
    }

    // Get current completed days for this module
    let moduleDays = progress.completedDays.get(moduleId) || [];
    const dayKey = `${moduleId}_day${dayNum}`;

    let xpAwarded = 0;
    let newlyUnlocked = null;

    if (block === 'full') {
      // Toggle full day completion
      if (moduleDays.includes(dayNum)) {
        // Un-complete
        moduleDays = moduleDays.filter(d => d !== dayNum);
        progress.xp = Math.max(0, (progress.xp || 0) - XP_PER_DAY);
        user.xp = Math.max(0, (user.xp || 0) - XP_PER_DAY);
        // Clear block progress
        progress.dayProgress.delete(dayKey);
      } else {
        // Complete
        moduleDays.push(dayNum);
        progress.xp = (progress.xp || 0) + XP_PER_DAY;
        user.xp = (user.xp || 0) + XP_PER_DAY;
        xpAwarded = XP_PER_DAY;
        // Set all blocks complete
        progress.dayProgress.set(dayKey, { learning: true, practice: true, build: true });
      }
    } else if (['learning', 'practice', 'build'].includes(block)) {
      // Toggle individual block
      let blockProgress = progress.dayProgress.get(dayKey) || { learning: false, practice: false, build: false };
      // Ensure it's a plain object
      if (blockProgress.toObject) blockProgress = blockProgress.toObject();
      blockProgress = { ...blockProgress };

      blockProgress[block] = !blockProgress[block];
      progress.dayProgress.set(dayKey, blockProgress);

      // Check if all blocks are complete → auto-complete day
      const allDone = blockProgress.learning && blockProgress.practice && blockProgress.build;

      if (allDone && !moduleDays.includes(dayNum)) {
        moduleDays.push(dayNum);
        progress.xp = (progress.xp || 0) + XP_PER_DAY;
        user.xp = (user.xp || 0) + XP_PER_DAY;
        xpAwarded = XP_PER_DAY;
      } else if (!allDone && moduleDays.includes(dayNum)) {
        moduleDays = moduleDays.filter(d => d !== dayNum);
        progress.xp = Math.max(0, (progress.xp || 0) - XP_PER_DAY);
        user.xp = Math.max(0, (user.xp || 0) - XP_PER_DAY);
      }
    } else {
      return res.status(400).json({ message: 'Invalid block type. Use: learning, practice, build, or full' });
    }

    progress.completedDays.set(moduleId, moduleDays);

    // Check if module is fully completed → unlock next
    const totalDaysInModule = dayCounts[moduleId];
    if (moduleDays.length === totalDaysInModule) {
      const currentIndex = order.indexOf(moduleId);
      if (currentIndex >= 0 && currentIndex < order.length - 1) {
        const nextModule = order[currentIndex + 1];
        if (!progress.unlockedModules.includes(nextModule)) {
          progress.unlockedModules.push(nextModule);
          newlyUnlocked = nextModule;
        }
      }
    }

    // Update currentDay (total completed across all modules + 1)
    let totalCompleted = 0;
    if (progress.completedDays) {
      progress.completedDays.forEach((days) => {
        totalCompleted += (days || []).length;
      });
    }
    const { totalDays: finalTotalDays } = await getCurriculum();
    progress.currentDay = Math.min(totalCompleted + 1, finalTotalDays);

    user.markModified('instituteProgress');
    await user.save();

    // Send XP Push Notification if applicable
    if (user.fcmToken) {
      if (newlyUnlocked) {
        sendNotification(
          user.fcmToken,
          'New Module Unlocked! 🎓',
          `Congratulations! You've unlocked the "${newlyUnlocked}" module.`,
          { type: 'module_unlock', module: newlyUnlocked }
        ).catch(err => console.error('Error sending unlock push:', err));
      } else if (xpAwarded > 0) {
        sendNotification(
          user.fcmToken,
          'XP Earned! 🎉',
          `You earned ${xpAwarded} XP in "${moduleId}". Keep it up!`,
          { type: 'xp_reward', xp: String(xpAwarded) }
        ).catch(err => console.error('Error sending XP push:', err));
      }
    }

    // Build response
    const completedDaysObj = {};
    progress.completedDays.forEach((val, key) => { completedDaysObj[key] = val; });

    const dayProgressObj = {};
    progress.dayProgress.forEach((val, key) => { dayProgressObj[key] = val; });

    res.json({
      xpAwarded,
      newlyUnlocked,
      progress: {
        currentDay: progress.currentDay,
        xp: progress.xp,
        unlockedModules: progress.unlockedModules,
        completedDays: completedDaysObj,
        dayProgress: dayProgressObj,
      },
    });
  } catch (error) {
    console.error('Update progress error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

/* ═══════════════════════════════════════════
   POST /api/progress/sync
   Bulk sync progress (used by manual Save button)
   Body: { completedDays: {}, dayProgress: {} }
   ═══════════════════════════════════════════ */
router.post('/sync', authMiddleware, async (req, res) => {
  try {
    const { completedDays, dayProgress } = req.body;
    if (!completedDays || !dayProgress) {
      return res.status(400).json({ message: 'completedDays and dayProgress are required' });
    }

    const user = await User.findById(req.user._id);
    if (!user.instituteProgress) {
      user.instituteProgress = {
        currentDay: 1,
        xp: 0,
        unlockedModules: ['data-foundations'],
        completedDays: new Map(),
        dayProgress: new Map(),
      };
    }

    const progress = user.instituteProgress;
    const oldInstituteXP = progress.xp || 0;

    const { order, dayCounts, totalDays } = await getCurriculum();

    // Convert requested plain objects back to Maps
    progress.completedDays = new Map(Object.entries(completedDays));
    progress.dayProgress = new Map(Object.entries(dayProgress));

    // Recalculate total completed days
    let totalCompleted = 0;
    progress.completedDays.forEach((days, moduleId) => {
      // Filter out invalid days just in case
      const validDays = (days || []).filter(d => d >= 1 && d <= (dayCounts[moduleId] || 0));
      progress.completedDays.set(moduleId, validDays);
      totalCompleted += validDays.length;
    });

    // Recalculate XP
    const newInstituteXP = totalCompleted * XP_PER_DAY;
    const xpDiff = newInstituteXP - oldInstituteXP;

    progress.xp = newInstituteXP;
    user.xp = Math.max(0, (user.xp || 0) + xpDiff);
    progress.currentDay = Math.min(totalCompleted + 1, totalDays);

    // Recalculate unlocked modules based on order
    let newlyUnlocked = null;
    const newUnlockedList = [order[0] || 'data-foundations'];
    
    for (let i = 0; i < order.length - 1; i++) {
      const currentMod = order[i];
      const nextMod = order[i + 1];
      const completedArr = progress.completedDays.get(currentMod) || [];
      
      if (completedArr.length === dayCounts[currentMod]) {
        newUnlockedList.push(nextMod);
      } else {
        break;
      }
    }

    // Preserve previously unlocked modules that might not be auto-unlocked anymore
    // (Optional: if we strictly want to lock them again, we wouldn't do this. 
    // But usually we don't want to revoke access).
    progress.unlockedModules.forEach(m => {
      if (!newUnlockedList.includes(m)) newUnlockedList.push(m);
    });

    // Check if there's any module unlocked *just now* that wasn't before
    const newlyAdded = newUnlockedList.find(m => !progress.unlockedModules.includes(m));
    if (newlyAdded) newlyUnlocked = newlyAdded;

    progress.unlockedModules = newUnlockedList;

    user.markModified('instituteProgress');
    await user.save();

    // Send XP Push Notification if applicable
    if (user.fcmToken) {
      if (newlyUnlocked) {
        sendNotification(
          user.fcmToken,
          'New Modules Unlocked! 🚀',
          `Progress synced! You've unlocked the "${newlyUnlocked}" module.`,
          { type: 'module_unlock', module: newlyUnlocked }
        ).catch(err => console.error('Error sending unlock push:', err));
      } else if (xpDiff > 0) {
        sendNotification(
          user.fcmToken,
          'Progress Saved! 🎉',
          `You earned ${xpDiff} XP from your latest progress.`,
          { type: 'xp_reward', xp: String(xpDiff) }
        ).catch(err => console.error('Error sending XP push:', err));
      }
    }

    // Prepare response maps
    const completedDaysObj = {};
    progress.completedDays.forEach((val, key) => { completedDaysObj[key] = val; });
    
    const dayProgressObj = {};
    progress.dayProgress.forEach((val, key) => { dayProgressObj[key] = val; });

    res.json({
      xpAwarded: Math.max(0, xpDiff), // Only show positive XP to the user toast
      newlyUnlocked,
      progress: {
        currentDay: progress.currentDay,
        xp: progress.xp,
        unlockedModules: progress.unlockedModules,
        completedDays: completedDaysObj,
        dayProgress: dayProgressObj,
      },
    });

  } catch (error) {
    console.error('Sync progress error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
