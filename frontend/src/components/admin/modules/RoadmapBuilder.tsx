'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import api from '@/lib/api';

interface Roadmap {
  _id: string;
  title: string;
  description: string;
  steps: any[];
}

export default function RoadmapBuilder() {
  const [roadmaps, setRoadmaps] = useState<Roadmap[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRoadmaps();
  }, []);

  const fetchRoadmaps = async () => {
    try {
      const res = await api.get('/api/admin/roadmaps');
      setRoadmaps(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold text-white">Learning Roadmaps</h2>
        <button 
          className="bg-neon-purple hover:bg-neon-purple/80 text-white text-xs px-4 py-2 rounded-xl transition-all font-bold"
        >
          + Create Roadmap
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-10">
          <div className="w-6 h-6 border-2 border-neon-purple border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {roadmaps.map((roadmap) => (
            <motion.div
              key={roadmap._id}
              className="glass-card p-5 group cursor-pointer hover:border-neon-purple/30 transition-all"
            >
              <h3 className="font-bold text-white mb-2 text-lg group-hover:text-neon-purple transition-colors">{roadmap.title}</h3>
              <p className="text-sm text-gray-500 mb-4 line-clamp-2">{roadmap.description}</p>
              
              <div className="flex items-center gap-2 mb-4">
                {roadmap.steps.slice(0, 5).map((_, i) => (
                  <div key={i} className="w-8 h-1.5 rounded-full bg-neon-purple/20" />
                ))}
                {roadmap.steps.length > 5 && <span className="text-[10px] text-gray-600">+{roadmap.steps.length - 5}</span>}
              </div>

              <div className="flex justify-between items-center pt-4 border-t border-white/5">
                <span className="text-[10px] text-gray-500 uppercase font-bold">{roadmap.steps.length} Steps</span>
                <button className="text-xs text-neon-purple font-bold">Edit Path →</button>
              </div>
            </motion.div>
          ))}
          {roadmaps.length === 0 && (
            <div className="glass-card p-10 text-center text-gray-500 md:col-span-2">
              No roadmaps created yet. Build a learning path for your students.
            </div>
          )}
        </div>
      )}
    </div>
  );
}
