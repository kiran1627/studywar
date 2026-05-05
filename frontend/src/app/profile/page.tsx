'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import Navbar from '@/components/Navbar';
import api from '@/lib/api';

export default function ProfilePage() {
  const { user, loading, logout } = useAuth();
  const router = useRouter();
  const [stats, setStats] = useState<any>(null);
  const [statsLoading, setStatsLoading] = useState(true);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/');
    }
  }, [user, loading, router]);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await api.get('/api/user/stats');
        setStats(res.data);
      } catch (err) {
        console.error('Failed to fetch user stats:', err);
      } finally {
        setStatsLoading(false);
      }
    };

    if (user) {
      fetchStats();
    }
  }, [user]);

  if (loading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-dark-900">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          className="w-10 h-10 border-2 border-neon-purple border-t-transparent rounded-full"
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-dark-900">
      {/* Ambient glows */}
      <div className="fixed top-0 left-0 w-full h-full pointer-events-none">
        <div className="absolute top-0 right-0 w-96 h-96 bg-neon-purple/5 rounded-full blur-[150px]" />
        <div className="absolute bottom-1/3 left-0 w-96 h-96 bg-neon-blue/5 rounded-full blur-[150px]" />
      </div>

      <Navbar />

      <main className="relative z-10 pt-24 pb-12 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto">
        {/* Profile Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card p-8 mb-8"
        >
          <div className="flex flex-col md:flex-row items-center gap-8">
            {/* Avatar */}
            <div className="relative">
              {user.picture ? (
                <img
                  src={user.picture}
                  alt={user.name}
                  className="w-32 h-32 rounded-full border-4 border-neon-purple/30 object-cover shadow-[0_0_30px_rgba(124,58,237,0.3)]"
                />
              ) : (
                <div className="w-32 h-32 rounded-full bg-neon-purple/20 flex items-center justify-center text-4xl font-bold text-neon-purple border-4 border-neon-purple/30 shadow-[0_0_30px_rgba(124,58,237,0.3)]">
                  {user.name.charAt(0)}
                </div>
              )}
              <div className="absolute -bottom-2 -right-2 bg-dark-900 border border-white/10 px-3 py-1 rounded-full text-xs font-bold text-neon-blue">
                LVL {user.level}
              </div>
            </div>

            {/* User Info */}
            <div className="flex-1 text-center md:text-left">
              <h1 className="text-3xl font-black text-white mb-1">{user.name}</h1>
              <p className="text-gray-500 mb-4">{user.email}</p>
              
              <div className="flex flex-wrap justify-center md:justify-start gap-4">
                <div className="bg-dark-800/50 border border-white/5 px-4 py-2 rounded-2xl">
                  <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Global Rank</p>
                  <p className="text-lg font-black text-neon-blue">#--</p>
                </div>
                <div className="bg-dark-800/50 border border-white/5 px-4 py-2 rounded-2xl">
                  <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Total XP</p>
                  <p className="text-lg font-black text-neon-purple">{user.xp.toLocaleString()}</p>
                </div>
                <div className="bg-dark-800/50 border border-white/5 px-4 py-2 rounded-2xl">
                  <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Streak</p>
                  <p className="text-lg font-black text-orange-500">🔥 {user.streak}</p>
                </div>
              </div>
            </div>

            {/* Logout Action */}
            <div className="flex flex-col gap-3">
              <button
                onClick={logout}
                className="px-6 py-2.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm font-bold hover:bg-red-500/20 transition-all cursor-pointer"
              >
                Logout
              </button>
            </div>
          </div>
        </motion.div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Institute Progress */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="glass-card p-6"
          >
            <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
              <span>🏛️</span> Institute Progress
            </h3>
            
            {statsLoading ? (
               <div className="h-24 flex items-center justify-center">
                 <div className="w-6 h-6 border-2 border-neon-purple border-t-transparent rounded-full animate-spin" />
               </div>
            ) : (
              <div className="space-y-6">
                <div>
                  <div className="flex justify-between items-end mb-2">
                    <p className="text-xs text-gray-400 font-medium">Curriculum Completion</p>
                    <p className="text-sm font-black text-white">{stats?.monthProgress || 0}%</p>
                  </div>
                  <div className="w-full h-2 bg-dark-700 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${stats?.monthProgress || 0}%` }}
                      className="h-full bg-gradient-to-r from-neon-purple to-neon-blue"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-dark-800/30 p-4 rounded-2xl border border-white/5">
                    <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1">Days Done</p>
                    <p className="text-xl font-black text-white">{stats?.totalDays || 0}</p>
                  </div>
                  <div className="bg-dark-800/30 p-4 rounded-2xl border border-white/5">
                    <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1">Sessions</p>
                    <p className="text-xl font-black text-white">{stats?.totalCompleted || 0}</p>
                  </div>
                </div>
              </div>
            )}
          </motion.div>

          {/* Activity Overview */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="glass-card p-6"
          >
            <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
              <span>📊</span> Activity Overview
            </h3>

            {statsLoading ? (
               <div className="h-24 flex items-center justify-center">
                 <div className="w-6 h-6 border-2 border-neon-purple border-t-transparent rounded-full animate-spin" />
               </div>
            ) : (
              <div className="space-y-4">
                <div className="flex justify-between items-center p-3 bg-dark-800/30 rounded-xl border border-white/5">
                  <span className="text-sm text-gray-400">Total Problems Solved</span>
                  <span className="text-sm font-bold text-neon-blue">{stats?.totalProblems || 0}</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-dark-800/30 rounded-xl border border-white/5">
                  <span className="text-sm text-gray-400">Total Score</span>
                  <span className="text-sm font-bold text-neon-green">{user.score.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-dark-800/30 rounded-xl border border-white/5">
                  <span className="text-sm text-gray-400">Role</span>
                  <span className="text-sm font-bold text-gray-300 uppercase tracking-tighter">{user.role}</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-dark-800/30 rounded-xl border border-white/5">
                  <span className="text-sm text-gray-400">Member Since</span>
                  <span className="text-sm font-bold text-gray-300">
                    {new Date(user.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
            )}
          </motion.div>
        </div>
      </main>
    </div>
  );
}
