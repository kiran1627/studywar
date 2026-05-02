'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { Module } from '@/lib/instituteData';
import ProgressRing from './ProgressRing';
import DayCard from './DayCard';

interface ModuleCardProps {
  module: Module;
  completedDays: number[];
  onToggleDay: (moduleId: string, day: number, xp: number) => void;
}

export default function ModuleCard({ module, completedDays, onToggleDay }: ModuleCardProps) {
  const [expanded, setExpanded] = useState(false);

  const totalDays = module.days.length;
  const completedCount = completedDays.length;
  const percentage = totalDays > 0 ? (completedCount / totalDays) * 100 : 0;
  const earnedXP = module.days
    .filter((d) => completedDays.includes(d.day))
    .reduce((sum, d) => sum + d.xpReward, 0);
  const totalModuleXP = module.days.reduce((sum, d) => sum + d.xpReward, 0);
  const isComplete = completedCount === totalDays;

  return (
    <motion.div
      layout
      className={`relative rounded-2xl overflow-hidden transition-all duration-300 ${
        isComplete
          ? 'bg-dark-800/30 border border-neon-green/15'
          : 'bg-dark-800/50 border border-white/[0.06] hover:border-white/[0.12]'
      }`}
      style={{
        boxShadow: expanded
          ? `0 0 40px ${module.accentFrom}08, 0 4px 24px rgba(0,0,0,0.4)`
          : '0 2px 12px rgba(0,0,0,0.2)',
      }}
    >
      {/* Color-coded left border accent */}
      <div
        className="absolute left-0 top-0 bottom-0 w-[3px]"
        style={{ background: `linear-gradient(180deg, ${module.accentFrom}, ${module.accentTo})` }}
      />

      {/* ── Header (always visible) ── */}
      <motion.button
        layout="position"
        onClick={() => setExpanded(!expanded)}
        className="w-full text-left p-4 sm:p-5 pl-5 sm:pl-6 cursor-pointer"
      >
        <div className="flex items-center gap-3 sm:gap-4">
          {/* Module icon */}
          <div
            className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl flex items-center justify-center text-2xl sm:text-3xl flex-shrink-0"
            style={{
              background: `linear-gradient(135deg, ${module.accentFrom}12, ${module.accentTo}12)`,
              border: `1px solid ${module.accentFrom}20`,
            }}
          >
            {module.icon}
          </div>

          {/* Title & meta */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-0.5">
              <span
                className="text-[10px] font-bold uppercase tracking-widest"
                style={{ color: module.accentFrom }}
              >
                Module {module.number}
              </span>
              {isComplete && (
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-neon-green/10 text-neon-green">
                  ✓ Complete
                </span>
              )}
            </div>
            <h3 className="text-base sm:text-lg font-bold text-white truncate">{module.title}</h3>
            <p className="text-xs text-gray-500 truncate">{module.subtitle}</p>
          </div>

          {/* Stats cluster */}
          <div className="flex items-center gap-3 sm:gap-4 flex-shrink-0">
            {/* Day count */}
            <div className="hidden sm:block text-right">
              <p className="text-xs text-gray-500">Days</p>
              <p className="text-sm font-bold text-white">
                {completedCount}/{totalDays}
              </p>
            </div>

            {/* XP earned */}
            <div className="hidden sm:block text-right">
              <p className="text-xs text-gray-500">XP</p>
              <p className="text-sm font-bold" style={{ color: module.accentFrom }}>
                {earnedXP}/{totalModuleXP}
              </p>
            </div>

            {/* Progress ring */}
            <ProgressRing
              percentage={percentage}
              accentFrom={module.accentFrom}
              accentTo={module.accentTo}
            />

            {/* Expand chevron */}
            <motion.div
              animate={{ rotate: expanded ? 180 : 0 }}
              transition={{ duration: 0.3 }}
              className="text-gray-500"
            >
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                <path d="M4.5 6.75L9 11.25L13.5 6.75" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </motion.div>
          </div>
        </div>

        {/* Mobile-only stats row */}
        <div className="flex sm:hidden items-center gap-3 mt-2 ml-[60px]">
          <span className="text-[10px] text-gray-500">
            {completedCount}/{totalDays} days
          </span>
          <span className="text-[10px]" style={{ color: module.accentFrom }}>
            {earnedXP}/{totalModuleXP} XP
          </span>
        </div>
      </motion.button>

      {/* ── Expanded Day Cards ── */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            className="overflow-hidden"
          >
            <div className="px-4 sm:px-5 pb-4 sm:pb-5 pl-5 sm:pl-6 space-y-3">
              <div className="h-px w-full bg-white/5 mb-1" />
              {module.days.map((day, i) => (
                <DayCard
                  key={day.day}
                  day={day}
                  moduleNumber={module.number}
                  isCompleted={completedDays.includes(day.day)}
                  accentFrom={module.accentFrom}
                  accentTo={module.accentTo}
                  onToggle={() => onToggleDay(module.id, day.day, day.xpReward)}
                />
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
