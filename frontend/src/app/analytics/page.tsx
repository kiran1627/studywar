'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Navbar from '@/components/Navbar';
import api from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import Leaderboard from '@/components/Leaderboard';
import { getCoachAdvice } from '@/utils/coach';

interface Task {
  date: string;
  morning: boolean;
  evening: boolean;
  problems: number;
}

interface Stats {
  totalDays: number;
  totalCompleted: number;
  monthProgress: number;
  totalProblems: number;
}

export default function AnalyticsPage() {
  const { user } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [stats, setStats] = useState<Stats>({ totalDays: 0, totalCompleted: 0, monthProgress: 0, totalProblems: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const [statsRes, tasksRes] = await Promise.all([
          api.get('/api/user/stats'),
          api.get('/api/tasks')
        ]);
        setStats(statsRes.data);
        setTasks(tasksRes.data);
      } catch (err) {
        console.error('Error loading analytics:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-dark-900 flex items-center justify-center">
        <div className="w-10 h-10 border-2 border-neon-purple border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // Calculate Study Hours (Assuming 2h per completed session)
  const totalSessions = tasks.reduce((acc, t) => acc + (t.morning ? 1 : 0) + (t.evening ? 1 : 0), 0);
  const studyHours = totalSessions * 2;

  // Prepare SVG graph data for Problems solved (past 7 days)
  const past7Days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    const dateStr = d.toISOString().split('T')[0];
    const task = tasks.find(t => t.date === dateStr);
    return {
      day: d.toLocaleDateString('en-US', { weekday: 'short' }),
      problems: task?.problems || 0
    };
  });

  const maxProblems = Math.max(...past7Days.map(d => d.problems), 5);
  const chartHeight = 160;
  const chartWidth = 500;
  const barWidth = 40;
  const gap = 30;

  // Level progress calculation
  const currentXP = user?.xp || 0;
  const currentLevel = Math.floor(currentXP / 1000);
  const nextLevelXP = (currentLevel + 1) * 1000;
  const prevLevelXP = currentLevel * 1000;
  const levelProgress = Math.min(100, Math.round(((currentXP - prevLevelXP) / (nextLevelXP - prevLevelXP)) * 100));

  const coachAdvice = getCoachAdvice({ 
    xp: currentXP, 
    streak: user?.streak || 0, 
    problems: stats.totalProblems 
  });

  const subjectData = [
    { name: 'DSA', value: 45, color: '#a78bfa' },
    { name: 'Build', value: 30, color: '#60a5fa' },
    { name: 'Theory', value: 25, color: '#34d399' },
  ];

  return (
    <div className="min-h-screen bg-dark-900 text-white relative">
      <div className="fixed top-0 left-0 w-full h-full pointer-events-none z-0">
        <div className="absolute top-0 right-0 w-96 h-96 bg-neon-purple/5 rounded-full blur-[150px]" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-neon-blue/5 rounded-full blur-[150px]" />
      </div>

      <Navbar />

      <main className="relative z-10 max-w-7xl mx-auto pt-24 pb-12 px-4 sm:px-6 lg:px-8">
        <div className="mb-8 flex flex-col md:flex-row md:items-end md:justify-between gap-4">
          <div>
            <h1 className="text-4xl font-bold tracking-tight neon-text">Performance Analytics</h1>
            <p className="text-gray-400 mt-2 text-lg">Detailed breakdown of your growth and consistency.</p>
          </div>
          <div className="bg-dark-800/60 border border-white/10 rounded-2xl px-6 py-3 flex items-center gap-6">
            <div className="text-center">
              <span className="text-xs text-gray-500 uppercase font-bold tracking-widest block">Level</span>
              <span className="text-2xl font-black text-neon-blue">{currentLevel}</span>
            </div>
            <div className="h-10 w-[1px] bg-white/10" />
            <div className="text-center">
              <span className="text-xs text-gray-500 uppercase font-bold tracking-widest block">Streak</span>
              <span className="text-2xl font-black text-orange-400">{user?.streak || 0} 🔥</span>
            </div>
            <div className="h-10 w-[1px] bg-white/10" />
            <div className="text-center">
              <span className="text-xs text-gray-500 uppercase font-bold tracking-widest block">XP</span>
              <span className="text-2xl font-black text-neon-purple">{currentXP.toLocaleString()}</span>
            </div>
          </div>
        </div>

        {/* High-Level Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          <motion.div 
            whileHover={{ y: -5 }}
            className="bg-dark-800/40 backdrop-blur-xl border border-white/10 rounded-2xl p-6 shadow-lg"
          >
            <div className="flex items-center justify-between mb-4">
              <span className="text-gray-400 text-sm font-medium">Study Time</span>
              <span className="text-2xl">⏳</span>
            </div>
            <span className="text-3xl font-bold block">{studyHours} Hours</span>
            <div className="mt-4 h-1.5 bg-white/5 rounded-full overflow-hidden">
              <div className="h-full bg-neon-purple w-[70%]" />
            </div>
          </motion.div>

          <motion.div 
            whileHover={{ y: -5 }}
            className="bg-dark-800/40 backdrop-blur-xl border border-white/10 rounded-2xl p-6 shadow-lg"
          >
            <div className="flex items-center justify-between mb-4">
              <span className="text-gray-400 text-sm font-medium">Problems</span>
              <span className="text-2xl">💻</span>
            </div>
            <span className="text-3xl font-bold block">{stats.totalProblems} Solved</span>
            <div className="mt-4 h-1.5 bg-white/5 rounded-full overflow-hidden">
              <div className="h-full bg-neon-blue w-[60%]" />
            </div>
          </motion.div>

          <motion.div 
            whileHover={{ y: -5 }}
            className="bg-dark-800/40 backdrop-blur-xl border border-white/10 rounded-2xl p-6 shadow-lg"
          >
            <div className="flex items-center justify-between mb-4">
              <span className="text-gray-400 text-sm font-medium">Consistency</span>
              <span className="text-2xl text-green-400">🔥</span>
            </div>
            <span className="text-3xl font-bold block">{stats.monthProgress}%</span>
            <div className="mt-4 h-1.5 bg-white/5 rounded-full overflow-hidden">
              <div className="h-full bg-green-400" style={{ width: `${stats.monthProgress}%` }} />
            </div>
          </motion.div>

          <motion.div 
            whileHover={{ y: -5 }}
            className="bg-dark-800/40 backdrop-blur-xl border border-neon-purple/20 rounded-2xl p-6 shadow-lg bg-gradient-to-br from-neon-purple/5 to-transparent"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-400 text-sm font-medium">Next Level</span>
              <span className="text-xs font-bold text-neon-purple">{levelProgress}%</span>
            </div>
            <span className="text-2xl font-bold block">Level {currentLevel + 1}</span>
            <div className="mt-4 h-2 bg-white/5 rounded-full overflow-hidden">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: `${levelProgress}%` }}
                className="h-full bg-neon-purple shadow-[0_0_10px_rgba(167,139,250,0.5)]" 
              />
            </div>
            <span className="text-[10px] text-gray-500 mt-2 block">{(nextLevelXP - currentXP).toLocaleString()} XP remaining</span>
          </motion.div>
        </div>

        {/* Charts & Insights Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          {/* Weekly Graph */}
          <div className="lg:col-span-2 bg-dark-800/40 backdrop-blur-xl border border-white/10 rounded-2xl p-8 shadow-lg">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-xl font-bold text-gray-100">Weekly Solved Rate</h2>
              <div className="flex items-center gap-4 text-xs">
                <div className="flex items-center gap-1.5">
                  <div className="w-2 h-2 rounded-full bg-neon-purple" />
                  <span className="text-gray-400">Problems</span>
                </div>
              </div>
            </div>
            <div className="flex justify-center overflow-x-auto pb-4">
              <svg width={chartWidth} height={chartHeight + 40} className="overflow-visible min-w-[500px]">
                {past7Days.map((d, i) => {
                  const barH = (d.problems / maxProblems) * chartHeight;
                  const x = i * (barWidth + gap) + 40;
                  const y = chartHeight - barH + 20;

                  return (
                    <g key={i}>
                      <motion.rect
                        x={x}
                        y={y}
                        width={barWidth}
                        height={barH}
                        rx={8}
                        fill="url(#purpleGrad)"
                        initial={{ height: 0, y: chartHeight + 20 }}
                        animate={{ height: barH, y }}
                        transition={{ duration: 0.8, delay: i * 0.1 }}
                        className="hover:opacity-80 transition-opacity cursor-pointer"
                      />
                      <text x={x + barWidth / 2} y={y - 12} textAnchor="middle" fill="#a78bfa" fontSize="14" fontWeight="700">
                        {d.problems}
                      </text>
                      <text x={x + barWidth / 2} y={chartHeight + 45} textAnchor="middle" fill="#6b7280" fontSize="12" fontWeight="500">
                        {d.day}
                      </text>
                    </g>
                  );
                })}
                <defs>
                  <linearGradient id="purpleGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#a78bfa" />
                    <stop offset="100%" stopColor="#7c3aed" />
                  </linearGradient>
                </defs>
              </svg>
            </div>
          </div>

          {/* Coach Insights */}
          <div className="bg-dark-800/40 backdrop-blur-xl border border-white/10 rounded-2xl p-8 shadow-lg flex flex-col">
            <h2 className="text-xl font-bold mb-6 text-gray-100">Coach Insights</h2>
            <div className="flex-1 flex flex-col justify-center items-center text-center space-y-6">
              <div className="w-20 h-20 bg-neon-purple/20 rounded-full flex items-center justify-center text-4xl shadow-inner border border-neon-purple/30">
                💡
              </div>
              <div>
                <p className="text-lg font-medium text-purple-200 leading-relaxed italic">
                  "{coachAdvice}"
                </p>
              </div>
              <div className="w-full pt-6 border-t border-white/5 space-y-4">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-400 text-left">Subject Focus</span>
                  <span className="text-neon-blue font-bold">DSA</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-400 text-left">Daily Goal</span>
                  <span className="text-green-400 font-bold">4/6 Problems</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Lower Section: Leaderboard & Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Leaderboard Column */}
          <div className="lg:col-span-1">
            <Leaderboard />
          </div>

          {/* Activity & Breakdown */}
          <div className="lg:col-span-2 space-y-8">
            {/* Calendar */}
            <div className="bg-dark-800/40 backdrop-blur-xl border border-white/10 rounded-2xl p-8 shadow-lg">
              <h2 className="text-xl font-bold mb-8 text-gray-100">Activity Tracker (30 Days)</h2>
              <div className="grid grid-cols-6 sm:grid-cols-10 gap-3">
                {tasks.slice(0, 30).map((t, idx) => {
                  const active = t.morning || t.evening;
                  return (
                    <motion.div
                      key={idx}
                      className={`aspect-square rounded-lg flex items-center justify-center text-xs border transition-colors ${
                        active 
                          ? 'bg-neon-purple/20 border-neon-purple text-purple-200 font-bold shadow-[0_0_10px_rgba(167,139,250,0.15)]' 
                          : 'bg-dark-700/50 border-white/5 text-gray-600'
                      }`}
                      title={`${t.date}: ${t.problems} problems`}
                      whileHover={{ scale: 1.1, backgroundColor: active ? 'rgba(167,139,250,0.3)' : 'rgba(255,255,255,0.05)' }}
                    >
                      {t.problems > 0 ? t.problems : ''}
                    </motion.div>
                  );
                })}
              </div>
              <p className="text-gray-500 text-sm mt-6 flex items-center gap-2">
                <span className="w-3 h-3 bg-neon-purple/40 border border-neon-purple rounded-sm" />
                Completed sessions highlight active days.
              </p>
            </div>

            {/* Subject Breakdown Mock */}
            <div className="bg-dark-800/40 backdrop-blur-xl border border-white/10 rounded-2xl p-8 shadow-lg">
              <h2 className="text-xl font-bold mb-6 text-gray-100">Task Distribution</h2>
              <div className="space-y-6">
                {subjectData.map((s, i) => (
                  <div key={i}>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm text-gray-400 font-medium">{s.name}</span>
                      <span className="text-sm font-bold" style={{ color: s.color }}>{s.value}%</span>
                    </div>
                    <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${s.value}%` }}
                        transition={{ duration: 1, delay: i * 0.2 }}
                        className="h-full rounded-full"
                        style={{ backgroundColor: s.color }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
