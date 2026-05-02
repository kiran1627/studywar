'use client';

import React from 'react';
import { motion } from 'framer-motion';
import type { DaySchedule } from '@/lib/instituteData';

interface DayCardProps {
  day: DaySchedule;
  moduleNumber: number;
  isCompleted: boolean;
  accentFrom: string;
  accentTo: string;
  onToggle: () => void;
}

const TIME_BLOCKS = [
  { key: 'learning' as const, label: 'Learn', time: '9:30 – 11:30', icon: '🎓', bgClass: 'bg-blue-500/8' },
  { key: 'practice' as const, label: 'Practice', time: '11:30 – 1:30', icon: '💪', bgClass: 'bg-purple-500/8' },
  { key: 'build' as const, label: 'Build', time: '1:30 – 3:00', icon: '🔨', bgClass: 'bg-orange-500/8' },
];

export default function DayCard({
  day,
  moduleNumber,
  isCompleted,
  accentFrom,
  accentTo,
  onToggle,
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

          {/* Completion toggle */}
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={onToggle}
            className="relative w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300 cursor-pointer"
            style={{
              background: isCompleted
                ? 'linear-gradient(135deg, #00ff88, #059669)'
                : 'rgba(255,255,255,0.05)',
              border: isCompleted
                ? 'none'
                : '2px solid rgba(255,255,255,0.12)',
              boxShadow: isCompleted
                ? '0 0 20px rgba(0,255,136,0.3)'
                : 'none',
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

        {/* Time blocks */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {TIME_BLOCKS.map((block) => (
            <div
              key={block.key}
              className={`rounded-lg p-3 ${block.bgClass} border border-white/[0.03] transition-all duration-200 hover:border-white/[0.08]`}
            >
              <div className="flex items-center gap-1.5 mb-1.5">
                <span className="text-sm">{block.icon}</span>
                <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
                  {block.label}
                </span>
              </div>
              <p className="text-xs text-gray-300 leading-relaxed line-clamp-2">
                {day[block.key]}
              </p>
              <p className="text-[10px] text-gray-500 mt-1.5">{block.time}</p>
            </div>
          ))}
        </div>

        {/* XP badge */}
        <div className="flex items-center justify-end mt-3">
          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
            isCompleted
              ? 'bg-neon-green/10 text-neon-green'
              : 'bg-white/5 text-gray-500'
          }`}>
            {isCompleted ? '✓ ' : ''}+{day.xpReward} XP
          </span>
        </div>
      </div>
    </motion.div>
  );
}
