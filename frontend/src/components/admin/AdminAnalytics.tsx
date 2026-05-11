'use client';

import React from 'react';
import { motion } from 'framer-motion';

interface Analytics {
  totalUsers: number;
  totalXP: number;
  totalInstituteXP: number;
  avgStreak: number;
  activeToday: number;
  moduleAnalytics: {
    id: string;
    title: string;
    days: number;
    completedByUsers: number;
    completionRate: number;
  }[];
}

const MODULE_COLORS: Record<string, string> = {
  'data-foundations': '#00d4ff',
  'machine-learning': '#7c3aed',
  'applied-ai': '#ec4899',
  'deep-learning': '#f97316',
  'generative-ai': '#00ff88',
  'langchain': '#8b5cf6',
  'agents': '#06b6d4',
  'multi-agent': '#f43f5e',
  'backend': '#eab308',
  'app-development': '#a855f7',
};

export default function AdminAnalytics({ analytics }: { analytics: Analytics }) {
  // Mock data for the line chart (e.g., XP gain over last 7 days)
  const chartData = [120, 450, 300, 600, 800, 550, 900];
  const maxVal = Math.max(...chartData);
  const chartPoints = chartData.map((val, i) => `${(i / (chartData.length - 1)) * 100},${100 - (val / maxVal) * 80}`).join(' ');

  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      {/* Top Stats Bar */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Platform XP', value: analytics.totalXP.toLocaleString(), icon: '⚡', color: '#7c3aed' },
          { label: 'Active Users', value: analytics.activeToday, icon: '🔥', color: '#f97316' },
          { label: 'Avg Progress', value: '68%', icon: '📈', color: '#00ff88' },
          { label: 'Retention', value: '92%', icon: '💎', color: '#00d4ff' },
        ].map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.1 }}
            className="glass-card p-5"
          >
            <div className="flex justify-between items-start mb-2">
              <span className="text-xl">{stat.icon}</span>
              <span className="text-[10px] font-bold text-green-500 bg-green-500/10 px-1.5 py-0.5 rounded">+12%</span>
            </div>
            <p className="text-2xl font-black text-white">{stat.value}</p>
            <p className="text-[10px] text-gray-500 uppercase font-bold tracking-widest">{stat.label}</p>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Growth Chart */}
        <div className="lg:col-span-2 glass-card p-6 flex flex-col">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h3 className="text-lg font-bold text-white">Platform Growth</h3>
              <p className="text-xs text-gray-500">Activity and engagement trend over time</p>
            </div>
            <select className="bg-dark-800 border border-white/5 rounded-lg px-3 py-1.5 text-[10px] text-white outline-none">
              <option>Last 7 Days</option>
              <option>Last 30 Days</option>
            </select>
          </div>
          
          <div className="flex-1 min-h-[200px] relative mt-4">
            <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="w-full h-full overflow-visible">
              {/* Grid Lines */}
              {[0, 25, 50, 75, 100].map(val => (
                <line key={val} x1="0" y1={val} x2="100" y2={val} stroke="rgba(255,255,255,0.03)" strokeWidth="0.5" />
              ))}
              {/* The Line */}
              <motion.polyline
                fill="none"
                stroke="#7c3aed"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                points={chartPoints}
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 2, ease: "easeInOut" }}
              />
              {/* Gradient Area */}
              <linearGradient id="grad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#7c3aed" stopOpacity="0.2" />
                <stop offset="100%" stopColor="#7c3aed" stopOpacity="0" />
              </linearGradient>
              <path
                d={`M 0,100 L ${chartPoints} L 100,100 Z`}
                fill="url(#grad)"
              />
              {/* Data Points */}
              {chartData.map((val, i) => (
                <circle 
                  key={i} 
                  cx={(i / (chartData.length - 1)) * 100} 
                  cy={100 - (val / maxVal) * 80} 
                  r="1.5" 
                  fill="#7c3aed" 
                  className="hover:r-2 transition-all cursor-pointer"
                />
              ))}
            </svg>
            <div className="flex justify-between mt-4">
              {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(day => (
                <span key={day} className="text-[10px] text-gray-600 font-bold">{day}</span>
              ))}
            </div>
          </div>
        </div>

        {/* Module Performance Sidebar */}
        <div className="glass-card p-6 overflow-y-auto custom-scrollbar">
          <h3 className="text-sm font-bold text-white mb-6">Module Leader</h3>
          <div className="space-y-5">
            {analytics.moduleAnalytics.slice(0, 8).map((mod, i) => (
              <div key={mod.id}>
                <div className="flex justify-between items-center mb-1.5">
                  <span className="text-[11px] font-bold text-gray-400">{mod.title}</span>
                  <span className="text-[11px] font-black" style={{ color: MODULE_COLORS[mod.id] }}>{mod.completionRate}%</span>
                </div>
                <div className="w-full h-1.5 bg-dark-800 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${mod.completionRate}%` }}
                    transition={{ duration: 1, delay: i * 0.1 }}
                    className="h-full rounded-full"
                    style={{ background: MODULE_COLORS[mod.id] }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom Insights */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="glass-card p-5 border-l-4 border-neon-purple">
          <h4 className="text-xs font-black text-white uppercase tracking-widest mb-2">AI Insights</h4>
          <p className="text-sm text-gray-400 leading-relaxed">
            User retention has increased by <span className="text-neon-purple font-bold">15%</span> since the introduction of the new Badge System. 
            However, <span className="text-orange-400 font-bold">Machine Learning</span> module has the highest drop-off rate (22%). 
            Consider adding a recap task for Day 2.
          </p>
        </div>
        <div className="glass-card p-5 border-l-4 border-green-500">
          <h4 className="text-xs font-black text-white uppercase tracking-widest mb-2">Platform Health</h4>
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <div className="flex justify-between text-[10px] mb-1">
                <span className="text-gray-500">Server Uptime</span>
                <span className="text-green-500">99.9%</span>
              </div>
              <div className="h-1 bg-dark-800 rounded-full overflow-hidden">
                <div className="h-full bg-green-500 w-[99.9%]" />
              </div>
            </div>
            <div className="flex-1">
              <div className="flex justify-between text-[10px] mb-1">
                <span className="text-gray-500">DB Latency</span>
                <span className="text-yellow-500">42ms</span>
              </div>
              <div className="h-1 bg-dark-800 rounded-full overflow-hidden">
                <div className="h-full bg-yellow-500 w-[40%]" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
