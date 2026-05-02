'use client';

import React from 'react';
import { motion } from 'framer-motion';
import type { DaySchedule } from '@/lib/instituteData';
import type { DayBlockProgress } from '@/types/user';

interface DayCardProps {
  day: DaySchedule;
  moduleId: string;
  moduleNumber: number;
  isCompleted: boolean;
  blockProgress: DayBlockProgress;
  accentFrom: string;
  accentTo: string;
  onToggle: () => void;
  onToggleBlock: (block: 'learning' | 'practice' | 'build') => void;
}

const TIME_BLOCKS: {
  key: 'learning' | 'practice' | 'build';
  label: string;
  time: string;
  icon: string;
  bgClass: string;
}[] = [
  { key: 'learning', label: 'Learn', time: '9:30 – 11:30', icon: '🎓', bgClass: 'bg-blue-500/8' },
  { key: 'practice', label: 'Practice', time: '11:30 – 1:30', icon: '💪', bgClass: 'bg-purple-500/8' },
  { key: 'build', label: 'Build', time: '1:30 – 3:00', icon: '🔨', bgClass: 'bg-orange-500/8' },
];

export default function DayCard({
  day,
  moduleId,
  moduleNumber,
  isCompleted,
  blockProgress,
  accentFrom,
  accentTo,
  onToggle,
  onToggleBlock,
}: DayCardProps) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.35 }}
      className={`relative rounded-xl border transition-all duration-300 overflow-hidden ${
        isCompleted
          ? 'bg-dark-800/40 border-neon-green/20'
          : 'bg-dark-800/60 border-white/5 hover:border-white/10'
      }`}
    >
      {/* Accent top bar */}
      <div
        className="h-[3px] w-full"
        style={{ background: `linear-gradient(90deg, ${accentFrom}, ${accentTo})` }}
      />

      <div className="p-4 sm:p-5">
        {/* Day header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <span
              className="text-xs font-bold px-2.5 py-1 rounded-lg"
              style={{
                background: `linear-gradient(135deg, ${accentFrom}15, ${accentTo}15)`,
                color: accentFrom,
              }}
            >
              M{moduleNumber} · Day {day.day}
            </span>
            <h4 className="text-sm sm:text-base font-semibold text-white">{day.title}</h4>
          </div>

          {/* Full day completion toggle */}
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={onToggle}
            className="relative w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300 cursor-pointer"
            style={{
              background: isCompleted
                ? 'linear-gradient(135deg, #00ff88, #059669)'
                : 'rgba(255,255,255,0.05)',
              border: isCompleted ? 'none' : '2px solid rgba(255,255,255,0.12)',
              boxShadow: isCompleted ? '0 0 20px rgba(0,255,136,0.3)' : 'none',
            }}
            aria-label={isCompleted ? 'Mark as incomplete' : 'Mark as complete'}
          >
            {isCompleted ? (
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <path d="M2.5 7L5.5 10L11.5 4" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            ) : (
              <div className="w-2.5 h-2.5 rounded-full bg-white/10" />
            )}
          </motion.button>
        </div>

        {/* Time blocks with individual toggles */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {TIME_BLOCKS.map((block) => {
            const isDone = blockProgress[block.key];
            return (
              <motion.button
                key={block.key}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => onToggleBlock(block.key)}
                className={`rounded-lg p-3 text-left transition-all duration-200 cursor-pointer ${
                  isDone
                    ? 'bg-neon-green/5 border border-neon-green/15'
                    : `${block.bgClass} border border-white/[0.03] hover:border-white/[0.08]`
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-1.5">
                    <span className="text-sm">{block.icon}</span>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
                      {block.label}
                    </span>
                  </div>
                  {/* Block check */}
                  <div
                    className={`w-4 h-4 rounded-full flex items-center justify-center transition-all ${
                      isDone
                        ? 'bg-neon-green/20 border border-neon-green/40'
                        : 'bg-white/5 border border-white/10'
                    }`}
                  >
                    {isDone && (
                      <svg width="8" height="8" viewBox="0 0 8 8" fill="none">
                        <path d="M1 4L3 6L7 2" stroke="#00ff88" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    )}
                  </div>
                </div>
                <p className="text-xs text-gray-300 leading-relaxed line-clamp-2">
                  {day[block.key]}
                </p>
                <p className="text-[10px] text-gray-500 mt-1.5">{block.time}</p>
              </motion.button>
            );
          })}
        </div>

        {/* XP badge */}
        <div className="flex items-center justify-end mt-3">
          <span
            className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
              isCompleted
                ? 'bg-neon-green/10 text-neon-green'
                : 'bg-white/5 text-gray-500'
            }`}
          >
            {isCompleted ? '✓ ' : ''}+{day.xpReward} XP
          </span>
        </div>
      </div>
    </motion.div>
  );
}
