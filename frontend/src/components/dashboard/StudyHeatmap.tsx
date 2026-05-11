'use client';

import React from 'react';
import { motion } from 'framer-motion';

interface HeatmapItem {
  date: string;
  count: number;
}

export default function StudyHeatmap({ data }: { data: HeatmapItem[] }) {
  // Generate last 6 months of dates
  const days = 180;
  const today = new Date();
  const dates = Array.from({ length: days }, (_, i) => {
    const d = new Date();
    d.setDate(today.getDate() - (days - 1 - i));
    return d.toISOString().split('T')[0];
  });

  const getIntensity = (date: string) => {
    const item = data.find(d => d.date === date);
    if (!item || item.count === 0) return 'bg-dark-800';
    if (item.count >= 5) return 'bg-neon-purple shadow-[0_0_8px_rgba(124,58,237,0.5)]';
    if (item.count >= 3) return 'bg-neon-purple/60';
    return 'bg-neon-purple/30';
  };

  return (
    <div className="glass-card p-5">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xs font-black text-gray-500 uppercase tracking-widest">Consistency Map</h3>
        <div className="flex gap-1 items-center">
          <span className="text-[8px] text-gray-600">Less</span>
          <div className="w-2 h-2 rounded-sm bg-dark-800" />
          <div className="w-2 h-2 rounded-sm bg-neon-purple/30" />
          <div className="w-2 h-2 rounded-sm bg-neon-purple/60" />
          <div className="w-2 h-2 rounded-sm bg-neon-purple" />
          <span className="text-[8px] text-gray-600">More</span>
        </div>
      </div>
      
      <div className="flex flex-wrap gap-1.5 justify-center sm:justify-start">
        {dates.map((date) => (
          <motion.div
            key={date}
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            title={date}
            className={`w-3 h-3 sm:w-4 sm:h-4 rounded-sm transition-all duration-500 cursor-pointer hover:ring-1 hover:ring-white/20 ${getIntensity(date)}`}
          />
        ))}
      </div>
      
      <p className="text-[10px] text-gray-500 mt-4 italic text-center sm:text-left">
        Showing study intensity for the last 6 months
      </p>
    </div>
  );
}
