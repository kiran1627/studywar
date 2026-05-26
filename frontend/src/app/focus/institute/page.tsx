'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import Navbar from '@/components/Navbar';
import api from '@/lib/api';

interface Badge {
  id: string;
  name: string;
  icon: string;
  desc: string;
  earned: boolean;
}

interface DailyPoint { date: string; minutes: number; sessions: number; xp: number; }
interface WeeklyPoint { weekStart: string; weekEnd: string; minutes: number; sessions: number; xp: number; }
interface MonthlyPoint { month: string; minutes: number; sessions: number; xp: number; }
interface AISummaryItem { _id: string; date: string; topic: string; duration: number; summary: string; }
interface SessionItem {
  _id: string; date: string; focusMinutes: number; topic: string;
  difficulty: string; problemsSolved: number; xpEarned: number; notes: string; tags: string[];
}

export default function InstituteAnalyticsPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  const [stats, setStats] = useState<any>(null);
  const [analytics, setAnalytics] = useState<any>(null);
  const [badges, setBadges] = useState<Badge[]>([]);
  const [history, setHistory] = useState<SessionItem[]>([]);
  const [dataLoading, setDataLoading] = useState(true);
  const [activeView, setActiveView] = useState<'daily' | 'weekly' | 'monthly'>('daily');
  const [filterTopic, setFilterTopic] = useState('');
  const [filterDifficulty, setFilterDifficulty] = useState('');

  useEffect(() => {
    if (!loading && !user) router.push('/');
  }, [user, loading, router]);

  useEffect(() => {
    if (!user) return;
    const fetchAll = async () => {
      try {
        const [statsRes, analyticsRes, badgesRes, historyRes] = await Promise.all([
          api.get('/api/institute-sessions/stats'),
          api.get('/api/institute-sessions/analytics'),
          api.get('/api/institute-sessions/badges'),
          api.get('/api/institute-sessions/history?days=90'),
        ]);
        setStats(statsRes.data);
        setAnalytics(analyticsRes.data);
        setBadges(badgesRes.data);
        setHistory(historyRes.data);
      } catch (err) {
        console.error('Failed to fetch institute analytics:', err);
      } finally {
        setDataLoading(false);
      }
    };
    fetchAll();
  }, [user]);

  if (loading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-dark-950">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          className="w-10 h-10 border-2 border-[#f97316] border-t-transparent rounded-full"
        />
      </div>
    );
  }

  if (dataLoading) {
    return (
      <div className="min-h-screen bg-dark-950">
        <Navbar />
        <div className="flex items-center justify-center pt-32">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
            className="w-8 h-8 border-2 border-[#f97316]/30 border-t-[#f97316] rounded-full"
          />
        </div>
      </div>
    );
  }

  const totalHours = stats ? Math.floor(stats.totalMinutes / 60) : 0;
  const totalRemainingMin = stats ? stats.totalMinutes % 60 : 0;

  // Chart helpers
  const dailyData: DailyPoint[] = analytics?.dailyData || [];
  const weeklyData: WeeklyPoint[] = analytics?.weeklyData || [];
  const monthlyData: MonthlyPoint[] = analytics?.monthlyData || [];
  const topicMastery = analytics?.topicMastery || {};
  const recentSummaries: AISummaryItem[] = analytics?.recentSummaries || [];

  const currentViewData = activeView === 'daily' ? dailyData : activeView === 'weekly' ? weeklyData : monthlyData;
  const maxMinutes = Math.max(...currentViewData.map((d: any) => d.minutes), 1);

  // Topic mastery sorted
  const sortedTopics = Object.entries(topicMastery)
    .sort(([, a]: any, [, b]: any) => b.minutes - a.minutes)
    .slice(0, 8);
  const maxTopicMin = Math.max(...sortedTopics.map(([, v]: any) => v.minutes), 1);

  // Difficulty distribution
  const diffDist = stats?.difficultyDistribution || { easy: 0, medium: 0, hard: 0, expert: 0 };
  const totalDiffSessions = Object.values(diffDist).reduce((a: number, b: any) => a + b, 0) || 1;

  // Filtered history
  const filteredHistory = history.filter(s => {
    if (filterTopic && s.topic !== filterTopic) return false;
    if (filterDifficulty && s.difficulty !== filterDifficulty) return false;
    return true;
  });

  const uniqueTopics = Array.from(new Set(history.map(s => s.topic)));

  const handleExportCSV = async () => {
    try {
      const res = await api.get('/api/institute-sessions/history?days=365', { responseType: 'blob' });
      // Build CSV client-side from history
      const header = 'Date,Duration (min),Topic,Difficulty,Problems,XP,Notes\n';
      const rows = history.map(s =>
        `${s.date},${s.focusMinutes},${s.topic},${s.difficulty},${s.problemsSolved},${s.xpEarned},"${(s.notes || '').replace(/"/g, '""')}"`
      ).join('\n');
      const blob = new Blob([header + rows], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'institute-sessions.csv';
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Export error:', err);
    }
  };

  return (
    <div className="min-h-screen bg-dark-950 text-white">
      {/* Background FX */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#f97316]/5 rounded-full blur-[120px]" />
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-[#fbbf24]/5 rounded-full blur-[120px]" />
      </div>

      <Navbar />

      <main className="relative z-10 pt-20 pb-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        {/* Hero Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-3">
              <span className="text-3xl">🏛️</span>
              <div>
                <h1 className="text-2xl sm:text-3xl font-black">
                  Institute <span className="text-[#f97316]">Analytics</span>
                </h1>
                <p className="text-xs text-gray-500 mt-0.5">Track your institute study performance</p>
              </div>
            </div>
            <button
              onClick={handleExportCSV}
              className="px-4 py-2 rounded-xl bg-[#f97316]/10 text-[#f97316] border border-[#f97316]/20 font-semibold text-sm hover:bg-[#f97316]/20 transition-colors"
            >
              📥 Export CSV
            </button>
          </div>
        </motion.div>

        {/* Stats Row */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mb-8">
          {[
            { label: 'Total Hours', value: `${totalHours}h ${totalRemainingMin}m`, icon: '⏱️', color: '#f97316' },
            { label: 'Sessions', value: stats?.totalSessions || 0, icon: '📖', color: '#fbbf24' },
            { label: 'Streak', value: `${stats?.streak || 0} days`, icon: '🔥', color: '#ef4444' },
            { label: 'Attendance', value: `${stats?.attendance || 0}%`, icon: '📊', color: '#22c55e' },
            { label: 'XP Earned', value: stats?.totalXP || 0, icon: '⚡', color: '#7c3aed' },
            { label: 'Problems', value: stats?.totalProblems || 0, icon: '🧩', color: '#00d4ff' },
          ].map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.06 }}
              className="glass-card p-4 text-center"
            >
              <span className="text-xl">{stat.icon}</span>
              <p className="text-lg sm:text-xl font-black mt-1" style={{ color: stat.color }}>
                {stat.value}
              </p>
              <p className="text-[9px] font-bold text-gray-500 uppercase tracking-wider mt-0.5">{stat.label}</p>
            </motion.div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Activity Chart */}
          <div className="lg:col-span-2 glass-card p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-bold text-white">Study Activity</h3>
                <p className="text-[10px] text-gray-500">Minutes studied over time</p>
              </div>
              <div className="flex gap-1">
                {(['daily', 'weekly', 'monthly'] as const).map(v => (
                  <button
                    key={v}
                    onClick={() => setActiveView(v)}
                    className={`px-3 py-1 rounded-lg text-[10px] font-bold uppercase transition-all ${
                      activeView === v
                        ? 'bg-[#f97316]/20 text-[#f97316] border border-[#f97316]/30'
                        : 'text-gray-500 hover:text-white'
                    }`}
                  >
                    {v}
                  </button>
                ))}
              </div>
            </div>

            {/* Bar chart */}
            <div className="space-y-2">
              {currentViewData.slice(-14).map((d: any, i: number) => {
                const label = activeView === 'daily'
                  ? new Date(d.date + 'T12:00:00').toLocaleDateString('en-US', { weekday: 'short', day: 'numeric' })
                  : activeView === 'weekly'
                  ? `W${i + 1}`
                  : new Date(d.month + '-01T12:00:00').toLocaleDateString('en-US', { month: 'short' });
                return (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.03 }}
                    className="flex items-center gap-3"
                  >
                    <span className="text-[10px] font-bold text-gray-400 w-14 text-right">{label}</span>
                    <div className="flex-1 h-4 bg-dark-800 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${(d.minutes / maxMinutes) * 100}%` }}
                        transition={{ duration: 0.8, delay: i * 0.03 }}
                        className="h-full rounded-full"
                        style={{ background: 'linear-gradient(90deg, #f97316, #fbbf24)' }}
                      />
                    </div>
                    <span className="text-[10px] font-bold text-gray-400 w-12 text-right">
                      {d.minutes >= 60 ? `${Math.floor(d.minutes / 60)}h${d.minutes % 60}m` : `${d.minutes}m`}
                    </span>
                  </motion.div>
                );
              })}
            </div>
          </div>

          {/* Difficulty Distribution */}
          <div className="glass-card p-6">
            <h3 className="text-sm font-bold text-white mb-1">Difficulty Spread</h3>
            <p className="text-[10px] text-gray-500 mb-6">Session difficulty breakdown</p>

            <div className="space-y-4">
              {[
                { key: 'easy', label: 'Easy', color: '#22c55e', emoji: '🟢' },
                { key: 'medium', label: 'Medium', color: '#eab308', emoji: '🟡' },
                { key: 'hard', label: 'Hard', color: '#f97316', emoji: '🟠' },
                { key: 'expert', label: 'Expert', color: '#ef4444', emoji: '🔴' },
              ].map(d => {
                const count = diffDist[d.key] || 0;
                const pct = Math.round((count / (totalDiffSessions as number)) * 100);
                return (
                  <div key={d.key}>
                    <div className="flex justify-between items-center mb-1.5">
                      <span className="text-[11px] font-bold text-gray-400">{d.emoji} {d.label}</span>
                      <span className="text-[11px] font-black" style={{ color: d.color }}>{count} ({pct}%)</span>
                    </div>
                    <div className="w-full h-2 bg-dark-800 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${pct}%` }}
                        transition={{ duration: 1 }}
                        className="h-full rounded-full"
                        style={{ background: d.color }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Topic Mastery */}
          <div className="lg:col-span-2 glass-card p-6">
            <h3 className="text-sm font-bold text-white mb-1">Topic Mastery</h3>
            <p className="text-[10px] text-gray-500 mb-4">Time invested per topic</p>

            <div className="space-y-3">
              {sortedTopics.map(([topic, data]: any, i) => (
                <div key={topic}>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-xs font-bold text-gray-300">{topic}</span>
                    <div className="flex items-center gap-3 text-[10px]">
                      <span className="text-gray-500">{data.sessions} sessions</span>
                      <span className="font-bold text-[#f97316]">
                        {data.minutes >= 60 ? `${Math.floor(data.minutes / 60)}h ${data.minutes % 60}m` : `${data.minutes}m`}
                      </span>
                    </div>
                  </div>
                  <div className="w-full h-2 bg-dark-800 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${(data.minutes / maxTopicMin) * 100}%` }}
                      transition={{ duration: 1, delay: i * 0.1 }}
                      className="h-full rounded-full"
                      style={{
                        background: ['#f97316', '#fbbf24', '#22c55e', '#00d4ff', '#7c3aed', '#ec4899', '#ef4444', '#06b6d4'][i % 8],
                      }}
                    />
                  </div>
                </div>
              ))}
              {sortedTopics.length === 0 && (
                <p className="text-xs text-gray-600 text-center py-4">No sessions recorded yet</p>
              )}
            </div>
          </div>

          {/* Badges */}
          <div className="glass-card p-6">
            <h3 className="text-sm font-bold text-white mb-1">Institute Badges</h3>
            <p className="text-[10px] text-gray-500 mb-4">
              {badges.filter(b => b.earned).length}/{badges.length} earned
            </p>

            <div className="grid grid-cols-2 gap-3">
              {badges.map((badge, i) => (
                <motion.div
                  key={badge.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.08 }}
                  className={`p-3 rounded-xl text-center border transition-all ${
                    badge.earned
                      ? 'bg-[#f97316]/5 border-[#f97316]/20'
                      : 'bg-dark-800/30 border-white/5 opacity-40'
                  }`}
                >
                  <span className="text-2xl block mb-1">{badge.icon}</span>
                  <p className="text-[10px] font-bold text-white">{badge.name}</p>
                  <p className="text-[9px] text-gray-500 mt-0.5">{badge.desc}</p>
                  {badge.earned && (
                    <span className="text-[9px] text-[#00ff88] font-bold mt-1 block">✓ Earned</span>
                  )}
                </motion.div>
              ))}
            </div>
          </div>
        </div>

        {/* AI Summaries */}
        {recentSummaries.length > 0 && (
          <div className="glass-card p-6 mb-8">
            <div className="flex items-center gap-2 mb-4">
              <span className="text-lg">🤖</span>
              <div>
                <h3 className="text-sm font-bold text-white">AI Learning Summaries</h3>
                <p className="text-[10px] text-gray-500">Auto-generated insights from recent sessions</p>
              </div>
            </div>

            <div className="space-y-3">
              {recentSummaries.map((s, i) => (
                <motion.div
                  key={s._id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="p-4 rounded-xl bg-[#1a1a24]/60 border border-white/5"
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-[#f97316]">{s.topic}</span>
                      <span className="text-[9px] text-gray-600">•</span>
                      <span className="text-[10px] text-gray-500">{s.duration}min</span>
                    </div>
                    <span className="text-[10px] text-gray-600">
                      {new Date(s.date + 'T12:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </span>
                  </div>
                  <p className="text-xs text-gray-300 leading-relaxed">{s.summary}</p>
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {/* Session History */}
        <div className="glass-card p-6">
          <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
            <div>
              <h3 className="text-sm font-bold text-white">Session History</h3>
              <p className="text-[10px] text-gray-500">Last 90 days • {filteredHistory.length} sessions</p>
            </div>
            <div className="flex gap-2">
              <select
                value={filterTopic}
                onChange={(e) => setFilterTopic(e.target.value)}
                className="px-3 py-1.5 rounded-lg bg-[#1a1a24] border border-white/10 text-xs text-gray-400 focus:outline-none focus:border-[#f97316]/50"
              >
                <option value="">All Topics</option>
                {uniqueTopics.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
              <select
                value={filterDifficulty}
                onChange={(e) => setFilterDifficulty(e.target.value)}
                className="px-3 py-1.5 rounded-lg bg-[#1a1a24] border border-white/10 text-xs text-gray-400 focus:outline-none focus:border-[#f97316]/50"
              >
                <option value="">All Difficulties</option>
                <option value="easy">Easy</option>
                <option value="medium">Medium</option>
                <option value="hard">Hard</option>
                <option value="expert">Expert</option>
              </select>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[600px]">
              <thead>
                <tr className="border-b border-white/5">
                  {['Date', 'Topic', 'Duration', 'Difficulty', 'Problems', 'XP'].map(h => (
                    <th key={h} className="text-[10px] font-black text-gray-500 uppercase tracking-widest py-3 px-3 text-left">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filteredHistory.slice(0, 30).map((s, i) => {
                  const diffColor = { easy: '#22c55e', medium: '#eab308', hard: '#f97316', expert: '#ef4444' }[s.difficulty] || '#9ca3af';
                  return (
                    <motion.tr
                      key={s._id}
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.02 }}
                      className="border-b border-white/[0.03] hover:bg-white/[0.02] transition-colors"
                    >
                      <td className="py-3 px-3 text-xs text-gray-400">
                        {new Date(s.date + 'T12:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      </td>
                      <td className="py-3 px-3 text-xs font-bold text-white">{s.topic}</td>
                      <td className="py-3 px-3 text-xs text-gray-400">
                        {s.focusMinutes >= 60 ? `${Math.floor(s.focusMinutes / 60)}h ${s.focusMinutes % 60}m` : `${s.focusMinutes}m`}
                      </td>
                      <td className="py-3 px-3">
                        <span
                          className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-md"
                          style={{ color: diffColor, background: `${diffColor}15` }}
                        >
                          {s.difficulty}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-xs font-bold text-[#fbbf24]">{s.problemsSolved}</td>
                      <td className="py-3 px-3 text-xs font-bold text-[#00ff88]">+{s.xpEarned}</td>
                    </motion.tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {filteredHistory.length === 0 && (
            <div className="text-center py-8">
              <span className="text-3xl mb-2 block">🏛️</span>
              <p className="text-sm text-gray-500">No institute sessions found</p>
              <p className="text-xs text-gray-600 mt-1">Start a session from your dashboard!</p>
            </div>
          )}
        </div>
      </main>

      <style jsx global>{`
        .glass-card {
          background: rgba(255, 255, 255, 0.02);
          backdrop-filter: blur(12px);
          border: 1px solid rgba(255, 255, 255, 0.05);
          border-radius: 1.25rem;
        }
        .bg-dark-950 { background: #050505; }
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 10px; }
      `}</style>
    </div>
  );
}
