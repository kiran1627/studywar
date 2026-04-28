'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import GlassCard from './GlassCard';
import api from '@/lib/api';
import { useSocket } from '@/hooks/useSocket';
import { useAuth } from '@/context/AuthContext';

interface LeaderboardUser {
  _id: string;
  name: string;
  picture: string;
  score: number;
  streak: number;
}

const Leaderboard: React.FC = () => {
  const [users, setUsers] = useState<LeaderboardUser[]>([]);
  const { user } = useAuth();
  const { on, emit } = useSocket();

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        const res = await api.get('/api/leaderboard');
        setUsers(res.data);
      } catch (err) {
        console.error('Failed to fetch leaderboard:', err);
      }
    };
    fetchLeaderboard();
  }, []);

  useEffect(() => {
    emit('leaderboard:request');
    const cleanup = on('leaderboard:update', (data: LeaderboardUser[]) => {
      setUsers(data);
    });
    return cleanup;
  }, [on, emit]);

  const getMedalEmoji = (index: number) => {
    if (index === 0) return '🥇';
    if (index === 1) return '🥈';
    if (index === 2) return '🥉';
    return `#${index + 1}`;
  };

  return (
    <GlassCard glowColor="purple" className="relative overflow-hidden">
      <div className="relative z-10">
        <div className="flex items-center gap-2 mb-4">
          <span className="text-2xl">🏆</span>
          <h3 className="text-sm font-medium text-gray-400 uppercase tracking-wider">Leaderboard</h3>
          <div className="ml-auto flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full bg-neon-green animate-pulse" />
            <span className="text-xs text-neon-green">Live</span>
          </div>
        </div>
        <div className="space-y-2 max-h-[400px] overflow-y-auto pr-1">
          <AnimatePresence>
            {users.map((u, index) => {
              const isMe = user?._id === u._id;
              return (
                <motion.div
                  key={u._id}
                  layout
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                  className={`flex items-center gap-3 p-3 rounded-xl transition-all ${
                    isMe ? 'leaderboard-me' : 'bg-dark-700/30 border border-transparent hover:border-white/5'
                  }`}
                >
                  <span className="text-lg w-8 text-center font-bold">{getMedalEmoji(index)}</span>
                  {u.picture ? (
                    <img src={u.picture} alt={u.name} className="w-8 h-8 rounded-full object-cover border border-white/10" />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-neon-purple/20 flex items-center justify-center text-xs font-bold text-neon-purple">{u.name.charAt(0)}</div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm font-semibold truncate ${isMe ? 'text-neon-blue' : 'text-white'}`}>{u.name}{isMe ? ' (You)' : ''}</p>
                    <p className="text-xs text-gray-500">🔥 {u.streak} day streak</p>
                  </div>
                  <span className="text-sm font-bold neon-text">{u.score.toLocaleString()}</span>
                </motion.div>
              );
            })}
          </AnimatePresence>
          {users.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              <p className="text-lg mb-1">No warriors yet</p>
              <p className="text-sm">Be the first to join!</p>
            </div>
          )}
        </div>
      </div>
    </GlassCard>
  );
};

export default Leaderboard;
