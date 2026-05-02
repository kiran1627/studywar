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
  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <div className="glass-card p-5 sm:p-6">
        <h3 className="text-sm font-bold text-white mb-1">Module Completion Rates</h3>
        <p className="text-[10px] text-gray-500 mb-6">Percentage of users who completed each module</p>
        <div className="space-y-4">
          {analytics.moduleAnalytics.map((mod, i) => (
            <motion.div key={mod.id} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}>
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs font-medium text-gray-300 truncate max-w-[180px] sm:max-w-none">{mod.title}</span>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] text-gray-500">{mod.completedByUsers} user{mod.completedByUsers !== 1 ? 's' : ''}</span>
                  <span className="text-xs font-bold" style={{ color: MODULE_COLORS[mod.id] || '#fff' }}>{mod.completionRate}%</span>
                </div>
              </div>
              <div className="w-full h-2 bg-dark-700 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${mod.completionRate}%` }}
                  transition={{ duration: 1, delay: 0.2 + i * 0.08, ease: 'easeOut' }}
                  className="h-full rounded-full"
                  style={{ background: MODULE_COLORS[mod.id] || '#7c3aed', boxShadow: `0 0 8px ${MODULE_COLORS[mod.id] || '#7c3aed'}40` }}
                />
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="glass-card p-5">
          <h3 className="text-sm font-bold text-white mb-3">Platform Overview</h3>
          <div className="space-y-3">
            {[
              { label: 'Total Users', value: analytics.totalUsers, color: '#7c3aed' },
              { label: 'Total XP', value: analytics.totalXP.toLocaleString(), color: '#00d4ff' },
              { label: 'Institute XP', value: analytics.totalInstituteXP.toLocaleString(), color: '#00ff88' },
              { label: 'Avg Streak', value: `${analytics.avgStreak} days`, color: '#f97316' },
              { label: 'Active Today', value: analytics.activeToday, color: '#22c55e' },
            ].map((item) => (
              <div key={item.label} className="flex items-center justify-between">
                <span className="text-xs text-gray-400">{item.label}</span>
                <span className="text-sm font-bold" style={{ color: item.color }}>{item.value}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="glass-card p-5">
          <h3 className="text-sm font-bold text-white mb-3">Module Breakdown</h3>
          <div className="space-y-2.5">
            {analytics.moduleAnalytics.map((mod) => (
              <div key={mod.id} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: MODULE_COLORS[mod.id] }} />
                  <span className="text-[11px] text-gray-400 truncate max-w-[120px]">{mod.title}</span>
                </div>
                <span className="text-[11px] font-medium text-gray-300">{mod.days}d • {mod.completedByUsers} done</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
