'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Navbar from '@/components/Navbar';
import api from '@/lib/api';

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

  return (
    <div className="min-h-screen bg-dark-900 text-white relative">
      <div className="fixed top-0 left-0 w-full h-full pointer-events-none z-0">
        <div className="absolute top-0 right-0 w-96 h-96 bg-neon-purple/5 rounded-full blur-[150px]" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-neon-blue/5 rounded-full blur-[150px]" />
      </div>

      <Navbar />

      <main className="relative z-10 max-w-7xl mx-auto pt-24 pb-12 px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight neon-text">Performance Analytics</h1>
          <p className="text-gray-400 mt-1">Review metrics, target habits, and achievements.</p>
        </div>

        {/* High-Level Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          <div className="bg-dark-800/40 backdrop-blur-xl border border-white/10 rounded-2xl p-6 shadow-lg flex items-center justify-between">
            <div>
              <span className="text-gray-400 text-sm block font-medium">Total Study Time</span>
              <span className="text-3xl font-bold mt-2 block">{studyHours} Hours</span>
            </div>
            <div className="text-4xl text-neon-purple">⏳</div>
          </div>

          <div className="bg-dark-800/40 backdrop-blur-xl border border-white/10 rounded-2xl p-6 shadow-lg flex items-center justify-between">
            <div>
              <span className="text-gray-400 text-sm block font-medium">Problems Resolved</span>
              <span className="text-3xl font-bold mt-2 block">{stats.totalProblems} Solved</span>
            </div>
            <div className="text-4xl text-neon-blue">💻</div>
          </div>

          <div className="bg-dark-800/40 backdrop-blur-xl border border-white/10 rounded-2xl p-6 shadow-lg flex items-center justify-between">
            <div>
              <span className="text-gray-400 text-sm block font-medium">Monthly Progress</span>
              <span className="text-3xl font-bold mt-2 block">{stats.monthProgress}%</span>
            </div>
            <div className="text-4xl text-green-400">🔥</div>
          </div>
        </div>

        {/* Custom Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Problems Solved Weekly Graph */}
          <div className="bg-dark-800/40 backdrop-blur-xl border border-white/10 rounded-2xl p-6 shadow-lg">
            <h2 className="text-xl font-bold mb-6 text-gray-100">Weekly Solved Rate</h2>
            <div className="flex justify-center">
              <svg width={chartWidth} height={chartHeight + 40} className="overflow-visible">
                {past7Days.map((d, i) => {
                  const barH = (d.problems / maxProblems) * chartHeight;
                  const x = i * (barWidth + gap) + 40;
                  const y = chartHeight - barH + 20;

                  return (
                    <g key={i}>
                      {/* Bar */}
                      <motion.rect
                        x={x}
                        y={y}
                        width={barWidth}
                        height={barH}
                        rx={6}
                        fill="url(#purpleGrad)"
                        initial={{ height: 0, y: chartHeight + 20 }}
                        animate={{ height: barH, y }}
                        transition={{ duration: 0.8, delay: i * 0.1 }}
                        className="hover:opacity-80 transition-opacity cursor-pointer"
                      />
                      {/* Tooltip text above bar */}
                      <text
                        x={x + barWidth / 2}
                        y={y - 8}
                        textAnchor="middle"
                        fill="#a78bfa"
                        fontSize="12"
                        fontWeight="600"
                      >
                        {d.problems}
                      </text>
                      {/* X Axis label */}
                      <text
                        x={x + barWidth / 2}
                        y={chartHeight + 40}
                        textAnchor="middle"
                        fill="#9ca3af"
                        fontSize="12"
                      >
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

          {/* Overall Consistency Calendar */}
          <div className="bg-dark-800/40 backdrop-blur-xl border border-white/10 rounded-2xl p-6 shadow-lg flex flex-col justify-between">
            <h2 className="text-xl font-bold mb-6 text-gray-100">Activity Tracker (Last 30 Days)</h2>
            <div className="grid grid-cols-10 gap-2 justify-center items-center">
              {tasks.slice(0, 30).map((t, idx) => {
                const active = t.morning || t.evening;
                return (
                  <motion.div
                    key={idx}
                    className={`w-8 h-8 rounded-md flex items-center justify-center text-xs border ${
                      active 
                        ? 'bg-neon-purple/20 border-neon-purple text-purple-200 font-semibold shadow-sm shadow-neon-purple/20' 
                        : 'bg-dark-700 border-white/5 text-gray-500'
                    }`}
                    title={`${t.date}: ${t.problems} problems`}
                    whileHover={{ scale: 1.1 }}
                  >
                    {t.problems > 0 ? t.problems : ''}
                  </motion.div>
                );
              })}
            </div>
            <p className="text-gray-400 text-xs text-center mt-4">Filled grids denote days involving morning/evening work.</p>
          </div>
        </div>
      </main>
    </div>
  );
}
