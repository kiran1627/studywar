'use client';

import React from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';

interface Module {
  _id: string;
  title: string;
  progress: number;
}

export default function QuickResume({ lastModule }: { lastModule?: Module }) {
  if (!lastModule) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-card p-6 bg-gradient-to-br from-neon-purple/10 to-transparent border-neon-purple/20 relative overflow-hidden"
    >
      <div className="absolute top-0 right-0 w-32 h-32 bg-neon-purple/10 blur-3xl pointer-events-none" />
      
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
        <div>
          <p className="text-[10px] text-neon-purple font-black uppercase tracking-[0.2em] mb-2">Continue Journey</p>
          <h2 className="text-xl sm:text-2xl font-black text-white mb-2">{lastModule.title}</h2>
          <div className="flex items-center gap-3">
            <div className="w-24 h-1 bg-dark-800 rounded-full overflow-hidden">
              <div 
                className="h-full bg-neon-purple" 
                style={{ width: `${lastModule.progress}%` }} 
              />
            </div>
            <span className="text-[10px] text-gray-500 font-bold">{lastModule.progress}% Completed</span>
          </div>
        </div>
        
        <Link href={`/classroom?module=${lastModule._id}`}>
          <button className="bg-white text-dark-950 px-8 py-3 rounded-xl font-black text-sm hover:scale-105 transition-all shadow-xl shadow-white/10 active:scale-95">
            RESUME LEARNING
          </button>
        </Link>
      </div>
    </motion.div>
  );
}
