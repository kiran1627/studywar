'use client';

import React from 'react';
import { motion } from 'framer-motion';

interface AdminUser {
  _id: string;
  name: string;
  picture: string;
  score: number;
  streak: number;
  xp: number;
  institute: {
    xp: number;
    progress: number;
    modulesCompleted: number;
    totalModules: number;
  };
}

export default function AdminLeaderboard({ users }: { users: AdminUser[] }) {
  const sorted = [...users].sort((a, b) => b.xp - a.xp);

  const getMedal = (i: number) => {
    if (i === 0) return '🥇';
    if (i === 1) return '🥈';
    if (i === 2) return '🥉';
    return `#${i + 1}`;
  };

  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
      <div className="glass-card overflow-hidden">
        <div className="p-4 border-b border-white/5">
          <h3 className="text-sm font-bold text-white">Full Leaderboard</h3>
          <p className="text-[10px] text-gray-500">Ranked by total XP</p>
        </div>

        <div className="divide-y divide-white/[0.03]">
          {sorted.map((u, i) => (
            <motion.div
              key={u._id}
              initial={{ opacity: 0, x: -16 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.03 }}
              className={`flex items-center gap-3 px-4 py-3 hover:bg-white/[0.02] transition-colors ${
                i < 3 ? 'bg-neon-purple/[0.03]' : ''
              }`}
            >
              <span className="text-lg w-10 text-center font-bold">{getMedal(i)}</span>

              {u.picture ? (
                <img src={u.picture} alt={u.name} className="w-9 h-9 rounded-full object-cover border border-white/10" />
              ) : (
                <div className="w-9 h-9 rounded-full bg-neon-purple/20 flex items-center justify-center text-xs font-bold text-neon-purple">
                  {u.name.charAt(0)}
                </div>
              )}

              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-white truncate">{u.name}</p>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] text-gray-500">🔥 {u.streak}d</span>
                  <span className="text-[10px] text-gray-500">
                    {u.institute.modulesCompleted}/{u.institute.totalModules} modules
                  </span>
                </div>
              </div>

              <div className="text-right flex-shrink-0">
                <p className="text-sm font-bold neon-text">{u.xp.toLocaleString()} XP</p>
                <div className="flex items-center gap-1 justify-end">
                  <div className="w-12 h-1 bg-dark-700 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-neon-purple to-neon-blue"
                      style={{ width: `${u.institute.progress}%` }}
                    />
                  </div>
                  <span className="text-[10px] text-gray-500">{u.institute.progress}%</span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {sorted.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            <p className="text-lg mb-1">No users yet</p>
          </div>
        )}
      </div>
    </motion.div>
  );
}
