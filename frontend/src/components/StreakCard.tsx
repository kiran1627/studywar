'use client';

import React from 'react';
import { motion } from 'framer-motion';
import GlassCard from './GlassCard';

interface StreakCardProps { streak: number; }

const StreakCard: React.FC<StreakCardProps> = ({ streak }) => {
  const msg = streak >= 30 ? 'LEGENDARY! 👑' : streak >= 14 ? 'Unstoppable! 🔥' : streak >= 7 ? 'On Fire! 💪' : streak >= 3 ? 'Building up! ⬆️' : streak >= 1 ? 'Keep going! 🌱' : 'Start today! 🚀';

  return (
    <GlassCard glowColor="pink" className="relative overflow-hidden">
      <div className="absolute -top-10 -left-10 w-40 h-40 bg-orange-500/5 rounded-full blur-3xl" />
      <div className="relative z-10">
        <div className="flex items-center gap-2 mb-3">
          <span className="text-2xl fire-glow">🔥</span>
          <h3 className="text-sm font-medium text-gray-400 uppercase tracking-wider">Current Streak</h3>
        </div>
        <div className="flex items-baseline gap-2 mb-2">
          <motion.span className="text-5xl sm:text-6xl font-black text-orange-400 fire-glow" key={streak}
            initial={{ scale: 1.3, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 300 }}>{streak}</motion.span>
          <span className="text-lg text-gray-500 font-medium">days</span>
        </div>
        <p className="text-sm font-medium text-orange-300/70">{msg}</p>
        <div className="mt-3 flex gap-1">
          {[3, 5, 7, 14, 30].map((m) => (
            <div key={m} className={`flex-1 h-1.5 rounded-full transition-colors duration-500 ${streak >= m ? 'bg-gradient-to-r from-orange-500 to-red-500' : 'bg-dark-600'}`} />
          ))}
        </div>
        <div className="flex justify-between mt-1">
          {[3, 5, 7, 14, 30].map((m) => (
            <span key={m} className={`text-[10px] ${streak >= m ? 'text-orange-400' : 'text-gray-600'}`}>{m}d</span>
          ))}
        </div>
        {/* Streak Badges */}
        <div className="mt-4 pt-4 border-t border-white/5 flex items-center gap-2 justify-around">
          {streak >= 3 && (
            <motion.div 
              initial={{ scale: 0, rotate: -180 }} 
              animate={{ scale: 1, rotate: 0 }} 
              transition={{ type: 'spring', stiffness: 200 }}
              className="flex flex-col items-center gap-1"
            >
              <span className="text-2xl shadow-sm">🥉</span>
              <span className="text-[9px] text-amber-600 font-bold uppercase">Bronze</span>
            </motion.div>
          )}
          {streak >= 7 && (
            <motion.div 
              initial={{ scale: 0, rotate: -180 }} 
              animate={{ scale: 1, rotate: 0 }} 
              transition={{ type: 'spring', stiffness: 200, delay: 0.2 }}
              className="flex flex-col items-center gap-1"
            >
              <span className="text-2xl shadow-sm">🥈</span>
              <span className="text-[9px] text-gray-400 font-bold uppercase">Silver</span>
            </motion.div>
          )}
          {streak >= 30 && (
            <motion.div 
              initial={{ scale: 0, rotate: -180 }} 
              animate={{ scale: 1, rotate: 0 }} 
              transition={{ type: 'spring', stiffness: 200, delay: 0.4 }}
              className="flex flex-col items-center gap-1"
            >
              <span className="text-2xl shadow-sm">🥇</span>
              <span className="text-[9px] text-amber-400 font-bold uppercase">Gold</span>
            </motion.div>
          )}
        </div>
      </div>
    </GlassCard>
  );
};

export default StreakCard;
