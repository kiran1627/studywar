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
  attendance: number;
}

interface DailyActivity {
  date: string;
  sessions: number;
  minutes: number;
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
    todayMinutes: number;
    todayXP: number;
    weekSessions: number;
    activeUsersToday: number;
  };
  perUserStats: UserStat[];
  dailyActivity: DailyActivity[];
  topicBreakdown: Record<string, number>;
  difficultyDistribution: Record<string, number>;
}

export default function InstituteAnalytics() {
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const res = await api.get('/api/admin/institute-sessions/analytics');
        setAnalytics(res.data);
      } catch (err) {
        console.error('Failed to fetch institute analytics:', err);
        setError('Failed to load institute session analytics');
      } finally {
        setLoading(false);
      }
    };
    fetchAnalytics();
  }, []);

  const handleExportCSV = async () => {
    try {
      const response = await api.get('/api/admin/institute-sessions/export', {
        responseType: 'blob',
      });
      const url = URL.createObjectURL(new Blob([response.data]));
      const a = document.createElement('a');
      a.href = url;
      a.download = 'institute-sessions-export.csv';
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Export failed:', err);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          className="w-8 h-8 border-2 border-[#f97316]/30 border-t-[#f97316] rounded-full"
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

  const { summary, perUserStats, dailyActivity, topicBreakdown, difficultyDistribution } = analytics;

  const totalHours = Math.floor(summary.totalMinutes / 60);
  const todayHours = Math.floor(summary.todayMinutes / 60);
  const todayMins = summary.todayMinutes % 60;

  // Chart helpers
  const maxMinutes = Math.max(...dailyActivity.map(d => d.minutes), 1);
  const maxSessions = Math.max(...dailyActivity.map(d => d.sessions), 1);

  const sortedTopics = Object.entries(topicBreakdown)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 8);
  const maxTopicCount = Math.max(...sortedTopics.map(([, c]) => c), 1);

  const totalDiff = Object.values(difficultyDistribution).reduce((a, b) => a + b, 0) || 1;

  // Filter users
  const filteredUsers = perUserStats.filter(u =>
    !searchQuery ||
    u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      {/* Header Actions */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <p className="text-sm text-gray-400">
          Platform-wide institute session data and per-user analytics
        </p>
        <button
          onClick={handleExportCSV}
          className="px-4 py-2 rounded-xl bg-[#f97316]/10 text-[#f97316] border border-[#f97316]/20 font-semibold text-sm hover:bg-[#f97316]/20 transition-colors"
        >
          📥 Export CSV
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {[
          { label: 'Today Sessions', value: summary.todaySessions, icon: '📅', color: '#f97316' },
          { label: 'Today Study Time', value: `${todayHours}h ${todayMins}m`, icon: '⏱️', color: '#fbbf24' },
          { label: 'Today XP', value: summary.todayXP, icon: '⚡', color: '#7c3aed' },
          { label: 'Active Users', value: summary.activeUsersToday, icon: '👥', color: '#00ff88' },
          { label: 'Total Sessions', value: summary.totalSessions, icon: '🏛️', color: '#ec4899' },
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
            <p className="text-2xl font-black text-white">{typeof stat.value === 'number' ? stat.value.toLocaleString() : stat.value}</p>
          </motion.div>
        ))}
      </div>

      {/* Additional stats row */}
      <div className="grid grid-cols-3 gap-4">
        <div className="glass-card p-4 text-center">
          <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1">Total Study Hours</p>
          <p className="text-3xl font-black text-[#f97316]">{totalHours}<span className="text-lg text-gray-500">h</span></p>
        </div>
        <div className="glass-card p-4 text-center">
          <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1">Total Problems</p>
          <p className="text-3xl font-black text-[#fbbf24]">{summary.totalProblems.toLocaleString()}</p>
        </div>
        <div className="glass-card p-4 text-center">
          <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1">Week Sessions</p>
          <p className="text-3xl font-black text-[#22c55e]">{summary.weekSessions}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Daily Activity Chart */}
        <div className="lg:col-span-2 glass-card p-6">
          <h3 className="text-sm font-bold text-white mb-1">Daily Activity — Last 7 Days</h3>
          <p className="text-[10px] text-gray-500 mb-6">Institute sessions and study time per day</p>

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
                    {/* Minutes bar */}
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-3 bg-dark-800 rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${(day.minutes / maxMinutes) * 100}%` }}
                          transition={{ duration: 0.8, delay: i * 0.05 }}
                          className="h-full rounded-full"
                          style={{ background: 'linear-gradient(90deg, #f97316, #fbbf24)' }}
                        />
                      </div>
                      <span className="text-[10px] font-bold text-gray-400 w-8 text-right">
                        {day.minutes >= 60 ? `${Math.floor(day.minutes / 60)}h` : `${day.minutes}m`}
                      </span>
                    </div>
                    {/* Sessions bar */}
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-2 bg-dark-800 rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${(day.sessions / maxSessions) * 100}%` }}
                          transition={{ duration: 0.8, delay: i * 0.05 + 0.1 }}
                          className="h-full rounded-full bg-[#00d4ff]/60"
                        />
                      </div>
                      <span className="text-[9px] text-gray-500 w-8 text-right">{day.sessions}s</span>
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

          <div className="flex gap-4 mt-4 pt-3 border-t border-white/5">
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-2 rounded-full" style={{ background: 'linear-gradient(90deg, #f97316, #fbbf24)' }} />
              <span className="text-[10px] text-gray-500 font-bold">Study Time</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-1.5 rounded-full bg-[#00d4ff]/60" />
              <span className="text-[10px] text-gray-500 font-bold">Sessions</span>
            </div>
          </div>
        </div>

        {/* Right column: Topic + Difficulty */}
        <div className="space-y-6">
          {/* Topic Breakdown */}
          <div className="glass-card p-6">
            <h3 className="text-sm font-bold text-white mb-1">Popular Topics</h3>
            <p className="text-[10px] text-gray-500 mb-4">Most studied at institute</p>

            <div className="space-y-3">
              {sortedTopics.map(([topic, count], i) => (
                <div key={topic}>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-[11px] font-bold text-gray-400">{topic}</span>
                    <span className="text-[11px] font-black text-[#f97316]">{count}</span>
                  </div>
                  <div className="w-full h-1.5 bg-dark-800 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${(count / maxTopicCount) * 100}%` }}
                      transition={{ duration: 1, delay: i * 0.1 }}
                      className="h-full rounded-full"
                      style={{
                        background: ['#f97316', '#fbbf24', '#22c55e', '#00d4ff', '#7c3aed', '#ec4899'][i % 6],
                      }}
                    />
                  </div>
                </div>
              ))}
              {sortedTopics.length === 0 && (
                <p className="text-xs text-gray-600 text-center py-4">No institute sessions yet</p>
              )}
            </div>
          </div>

          {/* Difficulty Distribution */}
          <div className="glass-card p-6">
            <h3 className="text-sm font-bold text-white mb-1">Difficulty Spread</h3>
            <p className="text-[10px] text-gray-500 mb-4">Across all users</p>

            <div className="space-y-3">
              {[
                { key: 'easy', color: '#22c55e', emoji: '🟢' },
                { key: 'medium', color: '#eab308', emoji: '🟡' },
                { key: 'hard', color: '#f97316', emoji: '🟠' },
                { key: 'expert', color: '#ef4444', emoji: '🔴' },
              ].map(d => {
                const count = difficultyDistribution[d.key] || 0;
                const pct = Math.round((count / totalDiff) * 100);
                return (
                  <div key={d.key} className="flex items-center gap-2">
                    <span className="text-xs">{d.emoji}</span>
                    <div className="flex-1 h-2 bg-dark-800 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${pct}%` }}
                        transition={{ duration: 1 }}
                        className="h-full rounded-full"
                        style={{ background: d.color }}
                      />
                    </div>
                    <span className="text-[10px] font-bold text-gray-400 w-12 text-right">{count} ({pct}%)</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Per-User Table */}
      <div className="glass-card p-6 overflow-hidden">
        <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
          <div>
            <h3 className="text-sm font-bold text-white">Per-User Institute Analytics</h3>
            <p className="text-[10px] text-gray-500">Study time, sessions, and attendance per user</p>
          </div>
          <input
            type="text"
            placeholder="Search users..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="px-3 py-1.5 rounded-lg bg-[#1a1a24] border border-white/10 text-xs text-white placeholder-gray-600 focus:outline-none focus:border-[#f97316]/50 w-48"
          />
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[700px]">
            <thead>
              <tr className="border-b border-white/5">
                {['User', 'Sessions', 'Study Time', 'Problems', 'XP', 'Attendance', 'Last Active'].map(h => (
                  <th key={h} className="text-[10px] font-black text-gray-500 uppercase tracking-widest py-3 px-3 text-left">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filteredUsers.slice(0, 30).map((user, i) => (
                <motion.tr
                  key={user._id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.03 }}
                  className="border-b border-white/[0.03] hover:bg-white/[0.02] transition-colors"
                >
                  <td className="py-3 px-3">
                    <div className="flex items-center gap-3">
                      {user.picture ? (
                        <img src={user.picture} alt="" className="w-8 h-8 rounded-full object-cover border border-white/10" />
                      ) : (
                        <div className="w-8 h-8 rounded-full bg-[#f97316]/20 flex items-center justify-center text-xs font-bold text-[#f97316]">
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
                    <span className="text-xs text-[#f97316] font-bold">
                      {user.totalMinutes >= 60
                        ? `${Math.floor(user.totalMinutes / 60)}h ${user.totalMinutes % 60}m`
                        : `${user.totalMinutes}m`
                      }
                    </span>
                  </td>
                  <td className="py-3 px-3">
                    <span className="text-sm font-bold text-[#fbbf24]">{user.totalProblems}</span>
                  </td>
                  <td className="py-3 px-3">
                    <span className="text-sm font-bold text-[#00ff88]">{user.totalXP}</span>
                  </td>
                  <td className="py-3 px-3">
                    <div className="flex items-center gap-2">
                      <div className="w-12 h-1.5 bg-dark-800 rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full"
                          style={{
                            width: `${Math.min(user.attendance, 100)}%`,
                            background: user.attendance >= 80 ? '#22c55e' : user.attendance >= 50 ? '#eab308' : '#ef4444',
                          }}
                        />
                      </div>
                      <span className={`text-[10px] font-bold ${
                        user.attendance >= 80 ? 'text-[#22c55e]' : user.attendance >= 50 ? 'text-[#eab308]' : 'text-[#ef4444]'
                      }`}>
                        {user.attendance}%
                      </span>
                    </div>
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

        {filteredUsers.length === 0 && (
          <div className="text-center py-8">
            <p className="text-gray-500 text-sm">No institute sessions recorded yet</p>
          </div>
        )}
      </div>
    </motion.div>
  );
}
