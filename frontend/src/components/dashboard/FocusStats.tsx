'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import GlassCard from '../GlassCard';
import api from '@/lib/api';

interface TodaySummary {
  morningDone: boolean;
  eveningDone: boolean;
  totalProblems: number;
  totalXP: number;
  totalMinutes: number;
  sessionsCompleted: number;
}

interface FocusStatsProps {
  refreshKey?: number;
}

const FocusStats: React.FC<FocusStatsProps> = ({ refreshKey }) => {
  const [summary, setSummary] = useState<TodaySummary>({
    morningDone: false,
    eveningDone: false,
    totalProblems: 0,
    totalXP: 0,
    totalMinutes: 0,
    sessionsCompleted: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchToday = async () => {
      try {
        const res = await api.get('/api/focus-sessions/today');
        setSummary(res.data.summary);
      } catch (err) {
        console.error('Failed to fetch focus stats:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchToday();
  }, [refreshKey]);

  const sessionItems = [
    {
      label: 'Morning',
      icon: '☀️',
      done: summary.morningDone,
      color: '#00d4ff',
    },
    {
      label: 'Evening',
      icon: '🌙',
      done: summary.eveningDone,
      color: '#7c3aed',
    },
  ];

  return (
    <GlassCard glowColor="blue" className="relative overflow-hidden">
      <div className="absolute -top-16 -right-16 w-48 h-48 bg-[#00d4ff]/5 rounded-full blur-3xl" />
      <div className="relative z-10">
        {/* Header */}
        <div className="flex items-center gap-2 mb-4">
          <span className="text-2xl">🎯</span>
          <h3 className="text-sm font-medium text-gray-400 uppercase tracking-wider">
            Today&apos;s Focus
          </h3>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-6">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
              className="w-6 h-6 border-2 border-[#7c3aed]/30 border-t-[#7c3aed] rounded-full"
            />
          </div>
        ) : (
          <>
            {/* Session Status */}
            <div className="flex gap-3 mb-4">
              {sessionItems.map((item) => (
                <div
                  key={item.label}
                  className={`flex-1 flex items-center gap-2 p-3 rounded-xl border transition-all ${
                    item.done
                      ? 'bg-[#00ff88]/5 border-[#00ff88]/20'
                      : 'bg-[#2e2e3a]/50 border-white/5'
                  }`}
                >
                  <span className="text-lg">{item.icon}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold text-gray-300 truncate">{item.label}</p>
                    <p
                      className={`text-[10px] font-bold uppercase tracking-wider ${
                        item.done ? 'text-[#00ff88]' : 'text-gray-600'
                      }`}
                    >
                      {item.done ? '✓ Done' : 'Pending'}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-3 gap-2">
              {[
                {
                  label: 'Problems',
                  value: summary.totalProblems,
                  icon: '🧩',
                  color: '#f97316',
                },
                {
                  label: 'XP Earned',
                  value: summary.totalXP,
                  icon: '⚡',
                  color: '#7c3aed',
                },
                {
                  label: 'Minutes',
                  value: summary.totalMinutes,
                  icon: '⏱️',
                  color: '#00d4ff',
                },
              ].map((stat, i) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 + i * 0.1 }}
                  className="text-center p-2.5 rounded-xl bg-[#1a1a24]/60 border border-white/5"
                >
                  <p className="text-xs mb-0.5">{stat.icon}</p>
                  <p className="text-lg font-black text-white">{stat.value}</p>
                  <p className="text-[9px] font-bold text-gray-500 uppercase tracking-wider">
                    {stat.label}
                  </p>
                </motion.div>
              ))}
            </div>

            {/* Completion indicator */}
            {summary.morningDone && summary.eveningDone && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-4 text-center py-2 px-3 rounded-lg bg-gradient-to-r from-[#00ff88]/10 to-[#7c3aed]/10 border border-[#00ff88]/20"
              >
                <span className="text-xs font-bold text-[#00ff88]">
                  🏆 All sessions complete! Great work today!
                </span>
              </motion.div>
            )}
          </>
        )}
      </div>
    </GlassCard>
  );
};

export default FocusStats;
