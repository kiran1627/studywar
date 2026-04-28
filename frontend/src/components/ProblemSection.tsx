'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import GlassCard from './GlassCard';

interface Problem { id: number; title: string; difficulty: string; category: string; link: string; }

const diffColors: Record<string, string> = {
  Easy: 'bg-[#00ff88]/20 text-[#00ff88] border-[#00ff88]/30',
  Medium: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  Hard: 'bg-red-500/20 text-red-400 border-red-500/30',
};

const ProblemSection: React.FC = () => {
  const [problems, setProblems] = useState<Problem[]>([]);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch('/problems.json');
        const data: Problem[] = await res.json();
        const dayOfYear = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86400000);
        const startIdx = (dayOfYear * 3) % data.length;
        const daily = [];
        for (let i = 0; i < 3; i++) daily.push(data[(startIdx + i) % data.length]);
        setProblems(daily);
      } catch (err) { console.error('Failed to load problems:', err); }
    };
    load();
  }, []);

  return (
    <GlassCard glowColor="blue" className="relative overflow-hidden">
      <div className="relative z-10">
        <div className="flex items-center gap-2 mb-4">
          <span className="text-2xl">🧩</span>
          <h3 className="text-sm font-medium text-gray-400 uppercase tracking-wider">Daily Problems</h3>
        </div>
        <div className="space-y-3">
          {problems.map((p, i) => (
            <motion.a key={p.id} href={p.link} target="_blank" rel="noopener noreferrer"
              initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
              className="block p-4 rounded-xl bg-[#1a1a24]/50 border border-white/5 hover:border-[#00d4ff]/20 transition-all group">
              <div className="flex items-center justify-between mb-1">
                <p className="font-semibold text-white text-sm group-hover:text-[#00d4ff] transition-colors">{p.title}</p>
                <span className={`text-[10px] px-2 py-0.5 rounded-full border font-medium ${diffColors[p.difficulty]}`}>{p.difficulty}</span>
              </div>
              <p className="text-xs text-gray-500">{p.category}</p>
            </motion.a>
          ))}
        </div>
      </div>
    </GlassCard>
  );
};

export default ProblemSection;
