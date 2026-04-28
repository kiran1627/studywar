'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import GlassCard from './GlassCard';
import api from '@/lib/api';

const TasksPanel: React.FC = () => {
  const [task, setTask] = useState({ morning: false, evening: false, problems: 0, date: '' });
  const today = new Date().toISOString().split('T')[0];

  useEffect(() => {
    const fetchTask = async () => {
      try { const res = await api.get(`/api/tasks/${today}`); setTask(res.data); }
      catch (err) { console.error('Failed to fetch task:', err); }
    };
    fetchTask();
  }, [today]);

  return (
    <GlassCard glowColor="blue" className="relative overflow-hidden">
      <div className="relative z-10">
        <div className="flex items-center gap-2 mb-4">
          <span className="text-2xl">📋</span>
          <h3 className="text-sm font-medium text-gray-400 uppercase tracking-wider">Today&apos;s Tasks</h3>
        </div>
        <div className="space-y-3">
          <motion.div className={`p-4 rounded-xl border transition-all ${task.morning ? 'bg-[#00ff88]/5 border-[#00ff88]/20' : 'bg-[#1a1a24]/50 border-white/5'}`} whileHover={{ scale: 1.01 }}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="text-xl">☀️</span>
                <div><p className="font-semibold text-white text-sm">Morning Session</p><p className="text-xs text-gray-500">Python + Backend • 6 AM – 8 AM</p></div>
              </div>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${task.morning ? 'bg-[#00ff88]/20 text-[#00ff88]' : 'bg-[#2e2e3a] text-gray-600'}`}>{task.morning ? '✓' : '○'}</div>
            </div>
          </motion.div>
          <motion.div className={`p-4 rounded-xl border transition-all ${task.evening ? 'bg-[#00ff88]/5 border-[#00ff88]/20' : 'bg-[#1a1a24]/50 border-white/5'}`} whileHover={{ scale: 1.01 }}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="text-xl">🌙</span>
                <div><p className="font-semibold text-white text-sm">Evening Session</p><p className="text-xs text-gray-500">DSA + HackerRank • 9 PM – 11 PM</p></div>
              </div>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${task.evening ? 'bg-[#00ff88]/20 text-[#00ff88]' : 'bg-[#2e2e3a] text-gray-600'}`}>{task.evening ? '✓' : '○'}</div>
            </div>
          </motion.div>
          <div className="p-4 rounded-xl bg-[#1a1a24]/50 border border-white/5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="text-xl">💻</span>
                <div><p className="font-semibold text-white text-sm">Problems Solved</p><p className="text-xs text-gray-500">Total for today</p></div>
              </div>
              <span className="text-2xl font-bold neon-text">{task.problems}</span>
            </div>
          </div>
        </div>
      </div>
    </GlassCard>
  );
};

export default TasksPanel;
