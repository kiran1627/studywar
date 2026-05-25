'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import api from '@/lib/api';

interface UserStat {
  _id: string;
  name: string;
  email: string;
  picture: string;
  totalSessions: number;
  totalProblems: number;
  totalXP: number;
  totalMinutes: number;
  lastSessionDate: string | null;
}

interface DailyActivity {
  date: string;
  sessions: number;
  problems: number;
  xp: number;
  uniqueUsers: number;
}

interface Analytics {
  summary: {
    totalSessions: number;
    totalProblems: number;
    totalXP: number;
    totalMinutes: number;
    todaySessions: number;
    todayProblems: number;
    todayXP: number;
    weekSessions: number;
    activeUsersToday: number;
  };
  perUserStats: UserStat[];
  dailyActivity: DailyActivity[];
  topicBreakdown: Record<string, number>;
}

export default function FocusSessionTracker() {
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const res = await api.get('/api/admin/focus-sessions/analytics');
        setAnalytics(res.data);
      } catch (err) {
        console.error('Failed to fetch focus analytics:', err);
        setError('Failed to load focus session analytics');
      } finally {
        setLoading(false);
      }
    };
    fetchAnalytics();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          className="w-8 h-8 border-2 border-neon-purple/30 border-t-neon-purple rounded-full"
        />
      </div>
    );
  }

  if (error || !analytics) {
    return (
      <div className="glass-card p-8 text-center">
        <p className="text-red-400">{error || 'No data available'}</p>
      </div>
    );
  }

  const { summary, perUserStats, dailyActivity, topicBreakdown } = analytics;

  // Chart helpers
  const maxSessions = Math.max(...dailyActivity.map(d => d.sessions), 1);
  const maxProblems = Math.max(...dailyActivity.map(d => d.problems), 1);

  // Top topics
  const sortedTopics = Object.entries(topicBreakdown)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 6);
  const maxTopicCount = Math.max(...sortedTopics.map(([, c]) => c), 1);

  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {[
          { label: 'Today Sessions', value: summary.todaySessions, icon: '📅', color: '#00d4ff' },
          { label: 'Today Problems', value: summary.todayProblems, icon: '🧩', color: '#f97316' },
          { label: 'Today XP', value: summary.todayXP, icon: '⚡', color: '#7c3aed' },
          { label: 'Active Users', value: summary.activeUsersToday, icon: '👥', color: '#00ff88' },
          { label: 'Total Sessions', value: summary.totalSessions, icon: '🎯', color: '#ec4899' },
        ].map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.08 }}
            className="glass-card p-4"
          >
            <div className="flex items-center gap-2 mb-2">
              <span className="text-lg">{stat.icon}</span>
              <span className="text-[10px] font-bold uppercase tracking-widest text-gray-500">{stat.label}</span>
            </div>
            <p className="text-2xl font-black text-white">{stat.value.toLocaleString()}</p>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Daily Activity Chart */}
        <div className="lg:col-span-2 glass-card p-6">
          <h3 className="text-sm font-bold text-white mb-1">Daily Activity — Last 7 Days</h3>
          <p className="text-[10px] text-gray-500 mb-6">Sessions and problems solved per day</p>

          <div className="space-y-3">
            {dailyActivity.map((day, i) => {
              const dayName = new Date(day.date + 'T12:00:00').toLocaleDateString('en-US', { weekday: 'short' });
              const dateShort = new Date(day.date + 'T12:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
              return (
                <motion.div
                  key={day.date}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="flex items-center gap-3"
                >
                  <div className="w-20 text-right">
                    <p className="text-[11px] font-bold text-gray-400">{dayName}</p>
                    <p className="text-[9px] text-gray-600">{dateShort}</p>
                  </div>
                  <div className="flex-1 space-y-1">
                    {/* Sessions bar */}
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-3 bg-dark-800 rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${(day.sessions / maxSessions) * 100}%` }}
                          transition={{ duration: 0.8, delay: i * 0.05 }}
                          className="h-full rounded-full"
                          style={{ background: 'linear-gradient(90deg, #7c3aed, #00d4ff)' }}
                        />
                      </div>
                      <span className="text-[10px] font-bold text-gray-400 w-6 text-right">{day.sessions}</span>
                    </div>
                    {/* Problems bar */}
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-2 bg-dark-800 rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${(day.problems / maxProblems) * 100}%` }}
                          transition={{ duration: 0.8, delay: i * 0.05 + 0.1 }}
                          className="h-full rounded-full bg-[#f97316]/60"
                        />
                      </div>
                      <span className="text-[9px] text-gray-500 w-6 text-right">{day.problems}p</span>
                    </div>
                  </div>
                  <div className="text-right w-14">
                    <p className="text-[10px] font-bold text-[#00ff88]">+{day.xp} XP</p>
                    <p className="text-[9px] text-gray-600">{day.uniqueUsers} users</p>
                  </div>
                </motion.div>
              );
            })}
          </div>

          {/* Legend */}
          <div className="flex gap-4 mt-4 pt-3 border-t border-white/5">
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-2 rounded-full" style={{ background: 'linear-gradient(90deg, #7c3aed, #00d4ff)' }} />
              <span className="text-[10px] text-gray-500 font-bold">Sessions</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-1.5 rounded-full bg-[#f97316]/60" />
              <span className="text-[10px] text-gray-500 font-bold">Problems</span>
            </div>
          </div>
        </div>

        {/* Topic Breakdown */}
        <div className="glass-card p-6">
          <h3 className="text-sm font-bold text-white mb-1">Popular Topics</h3>
          <p className="text-[10px] text-gray-500 mb-6">Most studied subjects across all users</p>

          <div className="space-y-4">
            {sortedTopics.map(([topic, count], i) => (
              <div key={topic}>
                <div className="flex justify-between items-center mb-1.5">
                  <span className="text-[11px] font-bold text-gray-400">{topic}</span>
                  <span className="text-[11px] font-black text-[#7c3aed]">{count}</span>
                </div>
                <div className="w-full h-1.5 bg-dark-800 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${(count / maxTopicCount) * 100}%` }}
                    transition={{ duration: 1, delay: i * 0.1 }}
                    className="h-full rounded-full"
                    style={{
                      background: ['#7c3aed', '#00d4ff', '#f97316', '#00ff88', '#ec4899', '#eab308'][i % 6],
                    }}
                  />
                </div>
              </div>
            ))}
          </div>

          {sortedTopics.length === 0 && (
            <p className="text-xs text-gray-600 text-center py-4">No sessions recorded yet</p>
          )}
        </div>
      </div>

      {/* Per-User Table */}
      <div className="glass-card p-6 overflow-hidden">
        <h3 className="text-sm font-bold text-white mb-1">Per-User Focus Analytics</h3>
        <p className="text-[10px] text-gray-500 mb-4">Problems solved and XP earned per user</p>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[600px]">
            <thead>
              <tr className="border-b border-white/5">
                {['User', 'Sessions', 'Problems', 'XP Earned', 'Focus Time', 'Last Active'].map(h => (
                  <th key={h} className="text-[10px] font-black text-gray-500 uppercase tracking-widest py-3 px-3 text-left">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {perUserStats.slice(0, 20).map((user, i) => (
                <motion.tr
                  key={user._id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.03 }}
                  className="border-b border-white/3 hover:bg-white/[0.02] transition-colors"
                >
                  <td className="py-3 px-3">
                    <div className="flex items-center gap-3">
                      {user.picture ? (
                        <img src={user.picture} alt="" className="w-8 h-8 rounded-full object-cover border border-white/10" />
                      ) : (
                        <div className="w-8 h-8 rounded-full bg-[#7c3aed]/20 flex items-center justify-center text-xs font-bold text-[#7c3aed]">
                          {user.name?.charAt(0)?.toUpperCase() || '?'}
                        </div>
                      )}
                      <div>
                        <p className="text-xs font-bold text-white">{user.name}</p>
                        <p className="text-[10px] text-gray-600">{user.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-3">
                    <span className="text-sm font-bold text-white">{user.totalSessions}</span>
                  </td>
                  <td className="py-3 px-3">
                    <span className="text-sm font-bold text-[#f97316]">{user.totalProblems}</span>
                  </td>
                  <td className="py-3 px-3">
                    <span className="text-sm font-bold text-[#00ff88]">{user.totalXP}</span>
                  </td>
                  <td className="py-3 px-3">
                    <span className="text-xs text-gray-400">
                      {user.totalMinutes >= 60
                        ? `${Math.floor(user.totalMinutes / 60)}h ${user.totalMinutes % 60}m`
                        : `${user.totalMinutes}m`
                      }
                    </span>
                  </td>
                  <td className="py-3 px-3">
                    <span className={`text-[10px] font-bold ${
                      user.lastSessionDate === new Date().toISOString().split('T')[0]
                        ? 'text-[#00ff88]'
                        : 'text-gray-500'
                    }`}>
                      {user.lastSessionDate || 'Never'}
                    </span>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>

        {perUserStats.length === 0 && (
          <div className="text-center py-8">
            <p className="text-gray-500 text-sm">No focus sessions recorded yet</p>
          </div>
        )}
      </div>
    </motion.div>
  );
}
