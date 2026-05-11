'use client';

import React from 'react';
import { motion } from 'framer-motion';

export default function LevelSystem({ xp, level }: { xp: number, level: string }) {
  // Simple level logic: every 1000 XP is a level
  const currentLevel = parseInt(level) || 0;
  const nextLevelXP = (currentLevel + 1) * 1000;
  const prevLevelXP = currentLevel * 1000;
  const progress = ((xp - prevLevelXP) / (nextLevelXP - prevLevelXP)) * 100;

  return (
    <div className="glass-card p-5 overflow-hidden relative group">
      <div className="absolute top-0 right-0 p-2 opacity-10 group-hover:opacity-20 transition-opacity">
        <span className="text-6xl font-black text-neon-purple italic">{currentLevel}</span>
      </div>
      
      <div className="relative z-10">
        <div className="flex justify-between items-end mb-4">
          <div>
            <p className="text-[10px] text-gray-500 uppercase font-black tracking-widest mb-1">Rank Status</p>
            <h3 className="text-xl font-black text-white italic">Level {currentLevel} <span className="text-neon-purple text-xs font-bold uppercase not-italic ml-2">Master</span></h3>
          </div>
          <div className="text-right">
            <span className="text-xs font-bold text-white">{xp}</span>
            <span className="text-[10px] text-gray-500"> / {nextLevelXP} XP</span>
          </div>
        </div>

        <div className="h-2.5 bg-dark-800 rounded-full overflow-hidden p-[2px] border border-white/5">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 1.5, ease: "easeOut" }}
            className="h-full rounded-full bg-gradient-to-r from-neon-purple to-neon-blue relative"
          >
            <div className="absolute inset-0 bg-white/20 animate-pulse" />
          </motion.div>
        </div>
        
        <div className="flex justify-between mt-3">
          <span className="text-[9px] text-gray-600 font-bold">Lvl {currentLevel}</span>
          <span className="text-[9px] text-gray-600 font-bold">Lvl {currentLevel + 1}</span>
        </div>
      </div>
    </div>
  );
}
