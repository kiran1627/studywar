const express = require('express');
const axios = require('axios');
const FocusSession = require('../models/FocusSession');
const User = require('../models/User');
const authMiddleware = require('../middleware/auth');
const { sendNotification } = require('../config/firebase');
const router = express.Router();

/* All routes require authentication */
router.use(authMiddleware);

/* ─── Constants ─── */
const DIFFICULTY_BONUS = { easy: 0, medium: 5, hard: 10, expert: 20 };

const INSTITUTE_BADGES = [
  { id: 'first-institute', name: 'First Steps', icon: '🏛️', desc: 'Complete your first institute session', check: (s) => s.totalSessions >= 1 },
  { id: 'institute-streak-7', name: '7-Day Scholar', icon: '🔥', desc: 'Maintain a 7-day institute streak', check: (s) => s.streak >= 7 },
  { id: 'institute-50h', name: 'Dedicated Learner', icon: '📚', desc: 'Log 50 hours of institute study', check: (s) => s.totalMinutes >= 3000 },
  { id: 'institute-100', name: 'Century Club', icon: '💯', desc: 'Complete 100 institute sessions', check: (s) => s.totalSessions >= 100 },
  { id: 'topic-master', name: 'Topic Master', icon: '🎯', desc: 'Study 10 different topics', check: (s) => s.uniqueTopics >= 10 },
  { id: 'night-owl', name: 'Night Owl', icon: '🦉', desc: 'Complete a session after 10 PM', check: (s) => s.hasLateSession },
];

/* ─── Helpers ─── */
function calculateInstituteStreak(sessions) {
  if (!sessions.length) return 0;

  // Get unique dates sorted descending
  const uniqueDates = [...new Set(sessions.map(s => s.date))].sort().reverse();
  const today = new Date().toISOString().split('T')[0];
  const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];

  // Streak must include today or yesterday
  if (uniqueDates[0] !== today && uniqueDates[0] !== yesterday) return 0;

  let streak = 1;
  for (let i = 0; i < uniqueDates.length - 1; i++) {
    const curr = new Date(uniqueDates[i] + 'T12:00:00');
    const prev = new Date(uniqueDates[i + 1] + 'T12:00:00');
    const diffDays = Math.round((curr - prev) / 86400000);
    if (diffDays === 1) {
      streak++;
    } else {
      break;
    }
  }
  return streak;
}

async function generateAISummary(session, recentSessions) {
  const OR_URL = 'https://openrouter.ai/api/v1/chat/completions';
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) return 'AI summary unavailable — API key not configured.';

  const recentContext = recentSessions
    .slice(0, 5)
    .map(s => `- ${s.topic} (${s.focusMinutes}min, ${s.difficulty})`)
    .join('\n');

  try {
    const resp = await axios.post(
      OR_URL,
      {
        model: 'google/gemini-2.0-flash-001',
        messages: [
          {
            role: 'user',
            content: `You are a study coach AI. Generate a brief, encouraging learning summary for this study session.

Session Details:
- Topic: ${session.topic || 'General'}
- Duration: ${session.focusMinutes} minutes
- Difficulty: ${session.difficulty}
- Problems Solved: ${session.problemsSolved}
- Notes: ${session.notes || 'None'}

Recent sessions:
${recentContext || 'No recent sessions'}

Write a 2-3 sentence summary that:
1. Acknowledges what they studied and the effort level
2. Highlights any patterns from recent sessions
3. Gives one actionable suggestion for next session

Keep it concise and motivating.`,
          },
        ],
      },
      {
        headers: {
          Authorization: `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': process.env.CLIENT_URL || 'https://studywar.vercel.app',
          'X-Title': 'StudyWar',
        },
        timeout: 15000,
      }
    );

    return resp.data?.choices?.[0]?.message?.content || 'Summary generation failed.';
  } catch (err) {
    console.error('AI summary generation error:', err.message);
    return `Great ${session.difficulty} session on ${session.topic || 'General'}! You studied for ${session.focusMinutes} minutes and solved ${session.problemsSolved} problems. Keep building momentum!`;
  }
}

/* ═══════════════════════════════════════════
   POST /api/institute-sessions
   Save a completed institute focus session
   ═══════════════════════════════════════════ */
router.post('/', async (req, res) => {
  try {
    const { focusMinutes, problemsSolved, topic, notes, difficulty, tags } = req.body;
    const userId = req.user._id;
    const today = new Date().toISOString().split('T')[0];

    const minutes = Math.max(1, parseInt(focusMinutes) || 0);
    const problems = Math.max(0, parseInt(problemsSolved) || 0);
    const diff = ['easy', 'medium', 'hard', 'expert'].includes(difficulty) ? difficulty : 'medium';
    const cleanTags = Array.isArray(tags) ? tags.map(t => t.trim()).filter(Boolean).slice(0, 10) : [];

    // Create focus session
    const session = new FocusSession({
      userId,
      date: today,
      sessionType: 'institute',
      focusMinutes: minutes,
      problemsSolved: problems,
      topic: (topic || '').trim() || 'General',
      notes: (notes || '').trim(),
      difficulty: diff,
      tags: cleanTags,
      completed: true,
    });
    await session.save();

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
    user.streak = newStreak;
    user.lastActiveDate = today;
    user.totalSessions = (user.totalSessions || 0) + 1;
    await user.save();

    // Generate AI summary asynchronously (don't block response)
    generateAISummary(
      session,
      await FocusSession.find({ userId, sessionType: 'institute' }).sort({ createdAt: -1 }).limit(5)
    ).then(async (summary) => {
      session.aiSummary = summary;
      await session.save();
    }).catch(err => console.error('AI summary save error:', err));

    // Send push notification if available
    if (user.fcmToken) {
      sendNotification(
        user.fcmToken,
        'Institute Session Complete! 🏛️',
        `+${session.xpEarned} XP earned! Topic: ${session.topic}. Streak: ${newStreak}🔥`,
        { type: 'institute_session', xp: String(session.xpEarned) }
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
    console.error('Save institute session error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

/* ═══════════════════════════════════════════
   GET /api/institute-sessions/today
   Get today's institute sessions
   ═══════════════════════════════════════════ */
router.get('/today', async (req, res) => {
  try {
    const userId = req.user._id;
    const today = new Date().toISOString().split('T')[0];

    const sessions = await FocusSession.find({
      userId,
      date: today,
      sessionType: 'institute',
    }).sort({ createdAt: 1 });

    const totalProblems = sessions.reduce((acc, s) => acc + s.problemsSolved, 0);
    const totalXP = sessions.reduce((acc, s) => acc + s.xpEarned, 0);
    const totalMinutes = sessions.reduce((acc, s) => acc + s.focusMinutes, 0);

    res.json({
      sessions,
      summary: {
        sessionCount: sessions.length,
        totalProblems,
        totalXP,
        totalMinutes,
      },
    });
  } catch (error) {
    console.error('Get today institute sessions error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

/* ═══════════════════════════════════════════
   GET /api/institute-sessions/stats
   Aggregate stats for the current user
   ═══════════════════════════════════════════ */
router.get('/stats', async (req, res) => {
  try {
    const userId = req.user._id;
    const allSessions = await FocusSession.find({
      userId,
      sessionType: 'institute',
      completed: true,
    }).sort({ date: -1 });

    const totalSessions = allSessions.length;
    const totalProblems = allSessions.reduce((acc, s) => acc + s.problemsSolved, 0);
    const totalXP = allSessions.reduce((acc, s) => acc + s.xpEarned, 0);
    const totalMinutes = allSessions.reduce((acc, s) => acc + s.focusMinutes, 0);

    // Institute-specific streak
    const streak = calculateInstituteStreak(allSessions);

    // Attendance: days with institute session / total days since first session
    const uniqueDates = [...new Set(allSessions.map(s => s.date))];
    let attendance = 0;
    if (allSessions.length > 0) {
      const firstDate = new Date(allSessions[allSessions.length - 1].date + 'T12:00:00');
      const today = new Date();
      const totalDays = Math.max(1, Math.ceil((today - firstDate) / 86400000) + 1);
      attendance = Math.round((uniqueDates.length / totalDays) * 100);
    }

    // Topic breakdown
    const topicCounts = {};
    allSessions.forEach(s => {
      const t = s.topic || 'General';
      topicCounts[t] = (topicCounts[t] || 0) + 1;
    });

    // Difficulty distribution
    const difficultyDist = { easy: 0, medium: 0, hard: 0, expert: 0 };
    allSessions.forEach(s => {
      difficultyDist[s.difficulty || 'medium']++;
    });

    // Daily activity (last 7 days)
    const today = new Date();
    const dailyActivity = Array.from({ length: 7 }, (_, i) => {
      const d = new Date(today);
      d.setDate(d.getDate() - (6 - i));
      const dateStr = d.toISOString().split('T')[0];
      const daySessions = allSessions.filter(s => s.date === dateStr);
      return {
        date: dateStr,
        sessions: daySessions.length,
        minutes: daySessions.reduce((acc, s) => acc + s.focusMinutes, 0),
        problems: daySessions.reduce((acc, s) => acc + s.problemsSolved, 0),
        xp: daySessions.reduce((acc, s) => acc + s.xpEarned, 0),
      };
    });

    res.json({
      totalSessions,
      totalProblems,
      totalXP,
      totalMinutes,
      streak,
      attendance,
      topicBreakdown: topicCounts,
      difficultyDistribution: difficultyDist,
      dailyActivity,
    });
  } catch (error) {
    console.error('Get institute stats error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

/* ═══════════════════════════════════════════
   GET /api/institute-sessions/history
   Session history with filters
   ═══════════════════════════════════════════ */
router.get('/history', async (req, res) => {
  try {
    const userId = req.user._id;
    const { days = 30, topic, difficulty } = req.query;

    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - parseInt(days));
    const cutoffStr = cutoff.toISOString().split('T')[0];

    const query = {
      userId,
      sessionType: 'institute',
      date: { $gte: cutoffStr },
    };

    if (topic) query.topic = topic;
    if (difficulty && ['easy', 'medium', 'hard', 'expert'].includes(difficulty)) {
      query.difficulty = difficulty;
    }

    const sessions = await FocusSession.find(query).sort({ date: -1, createdAt: -1 });
    res.json(sessions);
  } catch (error) {
    console.error('Get institute history error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

/* ═══════════════════════════════════════════
   GET /api/institute-sessions/badges
   Check user's institute badge progress
   ═══════════════════════════════════════════ */
router.get('/badges', async (req, res) => {
  try {
    const userId = req.user._id;
    const allSessions = await FocusSession.find({
      userId,
      sessionType: 'institute',
      completed: true,
    });

    const totalSessions = allSessions.length;
    const totalMinutes = allSessions.reduce((acc, s) => acc + s.focusMinutes, 0);
    const streak = calculateInstituteStreak(allSessions);
    const uniqueTopics = new Set(allSessions.map(s => s.topic || 'General')).size;
    const hasLateSession = allSessions.some(s => {
      const hour = new Date(s.createdAt).getHours();
      return hour >= 22 || hour < 4;
    });

    const checkData = { totalSessions, totalMinutes, streak, uniqueTopics, hasLateSession };

    const badges = INSTITUTE_BADGES.map(badge => ({
      ...badge,
      earned: badge.check(checkData),
    }));

    res.json(badges);
  } catch (error) {
    console.error('Get institute badges error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

/* ═══════════════════════════════════════════
   GET /api/institute-sessions/analytics
   Detailed analytics for charts
   ═══════════════════════════════════════════ */
router.get('/analytics', async (req, res) => {
  try {
    const userId = req.user._id;
    const allSessions = await FocusSession.find({
      userId,
      sessionType: 'institute',
      completed: true,
    }).sort({ date: -1 });

    const today = new Date();

    // Daily minutes (last 30 days)
    const dailyData = Array.from({ length: 30 }, (_, i) => {
      const d = new Date(today);
      d.setDate(d.getDate() - (29 - i));
      const dateStr = d.toISOString().split('T')[0];
      const daySessions = allSessions.filter(s => s.date === dateStr);
      return {
        date: dateStr,
        minutes: daySessions.reduce((acc, s) => acc + s.focusMinutes, 0),
        sessions: daySessions.length,
        xp: daySessions.reduce((acc, s) => acc + s.xpEarned, 0),
      };
    });

    // Weekly totals (last 12 weeks)
    const weeklyData = Array.from({ length: 12 }, (_, i) => {
      const weekEnd = new Date(today);
      weekEnd.setDate(weekEnd.getDate() - (i * 7));
      const weekStart = new Date(weekEnd);
      weekStart.setDate(weekStart.getDate() - 6);
      const startStr = weekStart.toISOString().split('T')[0];
      const endStr = weekEnd.toISOString().split('T')[0];
      const weekSessions = allSessions.filter(s => s.date >= startStr && s.date <= endStr);
      return {
        weekStart: startStr,
        weekEnd: endStr,
        minutes: weekSessions.reduce((acc, s) => acc + s.focusMinutes, 0),
        sessions: weekSessions.length,
        xp: weekSessions.reduce((acc, s) => acc + s.xpEarned, 0),
      };
    }).reverse();

    // Monthly totals (last 6 months)
    const monthlyData = Array.from({ length: 6 }, (_, i) => {
      const month = new Date(today.getFullYear(), today.getMonth() - (5 - i), 1);
      const monthStr = `${month.getFullYear()}-${String(month.getMonth() + 1).padStart(2, '0')}`;
      const monthSessions = allSessions.filter(s => s.date.startsWith(monthStr));
      return {
        month: monthStr,
        minutes: monthSessions.reduce((acc, s) => acc + s.focusMinutes, 0),
        sessions: monthSessions.length,
        xp: monthSessions.reduce((acc, s) => acc + s.xpEarned, 0),
      };
    });

    // Best day
    const dayTotals = {};
    allSessions.forEach(s => {
      dayTotals[s.date] = (dayTotals[s.date] || 0) + s.focusMinutes;
    });
    const bestDay = Object.entries(dayTotals).sort(([, a], [, b]) => b - a)[0];

    // Topic mastery
    const topicData = {};
    allSessions.forEach(s => {
      const t = s.topic || 'General';
      if (!topicData[t]) topicData[t] = { sessions: 0, minutes: 0, xp: 0 };
      topicData[t].sessions++;
      topicData[t].minutes += s.focusMinutes;
      topicData[t].xp += s.xpEarned;
    });

    // Recent AI summaries
    const recentSummaries = allSessions
      .filter(s => s.aiSummary)
      .slice(0, 10)
      .map(s => ({
        _id: s._id,
        date: s.date,
        topic: s.topic,
        duration: s.focusMinutes,
        summary: s.aiSummary,
      }));

    res.json({
      dailyData,
      weeklyData,
      monthlyData,
      bestDay: bestDay ? { date: bestDay[0], minutes: bestDay[1] } : null,
      topicMastery: topicData,
      recentSummaries,
    });
  } catch (error) {
    console.error('Get institute analytics error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

/* ═══════════════════════════════════════════
   POST /api/institute-sessions/:id/ai-summary
   Generate/regenerate AI summary
   ═══════════════════════════════════════════ */
router.post('/:id/ai-summary', async (req, res) => {
  try {
    const userId = req.user._id;
    const session = await FocusSession.findOne({ _id: req.params.id, userId, sessionType: 'institute' });
    if (!session) return res.status(404).json({ message: 'Session not found' });

    const recentSessions = await FocusSession.find({
      userId,
      sessionType: 'institute',
      _id: { $ne: session._id },
    }).sort({ createdAt: -1 }).limit(5);

    const summary = await generateAISummary(session, recentSessions);
    session.aiSummary = summary;
    await session.save();

    res.json({ summary });
  } catch (error) {
    console.error('AI summary generation error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
