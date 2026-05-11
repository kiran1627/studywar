'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '@/lib/api';

interface Mission {
  _id: string;
  title: string;
  description: string;
  xpReward: number;
  completed: boolean;
  type: string;
}

export default function DailyMissions() {
  const [missions, setMissions] = useState<Mission[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMissions();
  }, []);

  const fetchMissions = async () => {
    try {
      const res = await api.get('/api/user/missions');
      setMissions(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const completeMission = async (id: string) => {
    try {
      const res = await api.post(`/api/user/missions/${id}/complete`);
      setMissions(prev => prev.map(m => m._id === id ? { ...m, completed: true } : m));
      // Show XP popup logic could go here
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="glass-card p-5 overflow-hidden">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-sm font-black text-white uppercase tracking-widest">Daily Missions</h3>
        <span className="text-[10px] text-neon-purple font-bold bg-neon-purple/10 px-2 py-0.5 rounded-full">
          RESET IN 4H
        </span>
      </div>

      <div className="space-y-3">
        {loading ? (
          Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-16 bg-white/5 rounded-xl animate-pulse" />
          ))
        ) : (
          <AnimatePresence>
            {missions.map((mission) => (
              <motion.div
                key={mission._id}
                layout
                className={`p-4 rounded-xl border transition-all duration-300 flex items-center justify-between ${
                  mission.completed 
                    ? 'bg-green-500/5 border-green-500/20 opacity-60' 
                    : 'bg-dark-800 border-white/5 hover:border-neon-purple/30'
                }`}
              >
                <div>
                  <h4 className={`text-xs font-bold ${mission.completed ? 'text-green-500 line-through' : 'text-white'}`}>
                    {mission.title}
                  </h4>
                  <p className="text-[10px] text-gray-500">{mission.description}</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`text-[10px] font-black ${mission.completed ? 'text-green-500' : 'text-neon-purple'}`}>
                    +{mission.xpReward} XP
                  </span>
                  {!mission.completed && (
                    <button 
                      onClick={() => completeMission(mission._id)}
                      className="w-5 h-5 rounded-full border border-neon-purple/30 flex items-center justify-center hover:bg-neon-purple/20 transition-all"
                    >
                      <div className="w-2 h-2 rounded-full bg-neon-purple" />
                    </button>
                  )}
                  {mission.completed && <span className="text-green-500 text-xs">✓</span>}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        )}
      </div>
    </div>
  );
}
