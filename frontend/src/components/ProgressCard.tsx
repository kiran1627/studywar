'use client';

import React from 'react';
import { motion } from 'framer-motion';
import GlassCard from './GlassCard';

interface ProgressCardProps { progress: number; totalProblems: number; }

const ProgressCard: React.FC<ProgressCardProps> = ({ progress, totalProblems }) => {
  const circumference = 2 * Math.PI * 45;
  const offset = circumference - (progress / 100) * circumference;

  return (
    <GlassCard glowColor="green" className="relative overflow-hidden">
      <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-[#00ff88]/5 rounded-full blur-3xl" />
      <div className="relative z-10">
        <div className="flex items-center gap-2 mb-3">
          <span className="text-2xl">📊</span>
          <h3 className="text-sm font-medium text-gray-400 uppercase tracking-wider">Monthly Progress</h3>
        </div>
        <div className="flex items-center gap-6">
          <div className="relative w-24 h-24">
            <svg className="w-24 h-24" viewBox="0 0 100 100">
              <circle cx="50" cy="50" r="45" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="8" />
              <motion.circle cx="50" cy="50" r="45" fill="none" stroke="url(#progressGrad)" strokeWidth="8" strokeLinecap="round"
                strokeDasharray={circumference} initial={{ strokeDashoffset: circumference }} animate={{ strokeDashoffset: offset }}
                transition={{ duration: 1.5, ease: 'easeOut', delay: 0.3 }} className="timer-ring" />
              <defs><linearGradient id="progressGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#00ff88" /><stop offset="100%" stopColor="#00d4ff" />
              </linearGradient></defs>
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-xl font-bold text-[#00ff88]">{progress}%</span>
            </div>
          </div>
          <div className="flex-1 space-y-2">
            <div><p className="text-xs text-gray-500">Problems Solved</p><p className="text-lg font-bold text-white">{totalProblems}</p></div>
            <div><p className="text-xs text-gray-500">Status</p>
              <p className="text-sm font-medium text-[#00ff88]">
                {progress >= 80 ? '🏆 Outstanding' : progress >= 50 ? '💪 On Track' : '🚀 Keep Pushing'}
              </p>
            </div>
          </div>
        </div>
      </div>
    </GlassCard>
  );
};

export default ProgressCard;
