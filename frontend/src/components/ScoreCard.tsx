'use client';

import React, { useEffect } from 'react';
import { motion, useMotionValue, useTransform, animate } from 'framer-motion';
import GlassCard from './GlassCard';

interface ScoreCardProps { score: number; }

const AnimatedNumber: React.FC<{ value: number }> = ({ value }) => {
  const count = useMotionValue(0);
  const rounded = useTransform(count, (latest) => Math.round(latest).toLocaleString());
  useEffect(() => { const controls = animate(count, value, { duration: 1.5, ease: 'easeOut' }); return controls.stop; }, [count, value]);
  return <motion.span>{rounded}</motion.span>;
};

const ScoreCard: React.FC<ScoreCardProps> = ({ score }) => {
  return (
    <GlassCard glowColor="blue" className="relative overflow-hidden">
      <div className="absolute -top-10 -right-10 w-40 h-40 bg-neon-blue/5 rounded-full blur-3xl" />
      <div className="relative z-10">
        <div className="flex items-center gap-2 mb-3">
          <span className="text-2xl">⚡</span>
          <h3 className="text-sm font-medium text-gray-400 uppercase tracking-wider">Total Score</h3>
        </div>
        <div className="flex items-baseline gap-2">
          <span className="text-5xl sm:text-6xl font-black neon-text score-glow"><AnimatedNumber value={score} /></span>
          <span className="text-lg text-gray-500 font-medium">pts</span>
        </div>
        <div className="mt-3 flex items-center gap-2">
          <div className="h-1 flex-1 bg-dark-600 rounded-full overflow-hidden">
            <motion.div className="h-full bg-gradient-to-r from-neon-purple to-neon-blue rounded-full"
              initial={{ width: 0 }} animate={{ width: `${Math.min((score / 1000) * 100, 100)}%` }}
              transition={{ duration: 1, ease: 'easeOut', delay: 0.5 }} />
          </div>
          <span className="text-xs text-gray-500">{Math.min(Math.round((score / 1000) * 100), 100)}%</span>
        </div>
      </div>
    </GlassCard>
  );
};

export default ScoreCard;
