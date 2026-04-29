'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import Navbar from '@/components/Navbar';
import ScoreCard from '@/components/ScoreCard';
import StreakCard from '@/components/StreakCard';
import ProgressCard from '@/components/ProgressCard';
import FocusTimer from '@/components/FocusTimer';
import TasksPanel from '@/components/TasksPanel';
import Leaderboard from '@/components/Leaderboard';
import ProblemSection from '@/components/ProblemSection';
import api from '@/lib/api';
import AIPlanCard from '@/components/AIPlanCard';
import ChallengeWidget from '@/components/ChallengeWidget';
import SmartReminders from '@/components/SmartReminders';

interface UserStats {
  totalDays: number; totalCompleted: number; monthProgress: number; totalProblems: number;
}

export default function DashboardPage() {
  const { user: authUser, loading, refreshUser } = useAuth();
  const user = authUser as any;
  const router = useRouter();
  const [stats, setStats] = useState<UserStats>({ totalDays: 0, totalCompleted: 0, monthProgress: 0, totalProblems: 0 });
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => { if (!loading && !user) router.push('/'); }, [user, loading, router]);

  const fetchStats = useCallback(async () => {
    try { const res = await api.get('/api/user/stats'); setStats(res.data); }
    catch (err) { console.error('Failed to fetch stats:', err); }
  }, []);

  useEffect(() => { if (user) fetchStats(); }, [user, fetchStats, refreshKey]);

  const handleSessionComplete = () => { setRefreshKey((k) => k + 1); refreshUser(); fetchStats(); };

  if (loading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-dark-900">
        <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          className="w-10 h-10 border-2 border-neon-purple border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-dark-900 bg-grid">
      <div className="fixed top-0 left-0 w-full h-full pointer-events-none">
        <div className="absolute top-0 right-0 w-96 h-96 bg-neon-purple/5 rounded-full blur-[150px]" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-neon-blue/5 rounded-full blur-[150px]" />
      </div>
      <Navbar />
      <main className="relative z-10 pt-20 pb-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="mb-4">
          <SmartReminders />
        </div>
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-white">
              Welcome back, <span className="neon-text">{user.name.split(' ')[0]}</span> 👋
            </h1>
            <div className="flex items-center gap-2 mt-2">
              <span className={`text-xs font-bold px-3 py-1 rounded-full border shadow-sm ${
                (user.xp || 0) >= 700 ? 'bg-amber-500/20 text-amber-400 border-amber-500/40' :
                (user.xp || 0) >= 300 ? 'bg-red-500/20 text-red-400 border-red-500/40' :
                (user.xp || 0) >= 100 ? 'bg-cyan-500/20 text-cyan-400 border-cyan-500/40' :
                'bg-gray-500/20 text-gray-400 border-gray-500/40'
              }`}>
                {(user.xp || 0) >= 700 ? '🏆 Master' :
                 (user.xp || 0) >= 300 ? '⚔️ Pro' :
                 (user.xp || 0) >= 100 ? '🎖️ Intermediate' :
                 '🔰 Beginner'}
              </span>
              <span className="text-xs text-gray-400">Level {user.level || 0}</span>
            </div>
          </div>

          {/* XP Progress Bar */}
          <div className="w-full sm:w-72 bg-dark-800/60 border border-white/10 rounded-xl p-3">
            <div className="flex justify-between text-xs mb-1 font-medium">
              <span className="text-purple-300">Progression</span>
              <span className="text-gray-300">{user.xp || 0} XP</span>
            </div>
            <div className="w-full h-2 bg-dark-700 rounded-full overflow-hidden">
              <motion.div 
                className="h-full bg-gradient-to-r from-neon-purple to-neon-blue"
                initial={{ width: 0 }}
                animate={{ 
                  width: `${
                    (user.xp || 0) >= 700 ? 100 :
                    (user.xp || 0) >= 300 ? ((user.xp - 300) / 400) * 100 :
                    (user.xp || 0) >= 100 ? ((user.xp - 100) / 200) * 100 :
                    (user.xp / 100) * 100
                  }%`
                }}
                transition={{ duration: 1 }}
              />
            </div>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <ScoreCard score={user.score} />
          <StreakCard streak={user.streak} />
          <ProgressCard progress={stats.monthProgress} totalProblems={stats.totalProblems} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2 space-y-4">
            <AIPlanCard streak={user.streak || 0} />
            <FocusTimer onSessionComplete={handleSessionComplete} />
            <TasksPanel key={refreshKey} />
          </div>
          <div className="space-y-4">
            <ChallengeWidget />
            <Leaderboard />
            <ProblemSection />
          </div>
        </div>
      </main>
    </div>
  );
}
