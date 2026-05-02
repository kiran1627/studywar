'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import type { User } from '@/types/user';
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
import { calculateXP, getLevel } from '@/utils/coach';

interface UserStats {
  totalDays: number; totalCompleted: number; monthProgress: number; totalProblems: number; xp?: number; level?: string;
}

export default function DashboardPage() {
  const { user, loading, refreshUser } = useAuth();
  const router = useRouter();
  const [stats, setStats] = useState<UserStats>({ totalDays: 0, totalCompleted: 0, monthProgress: 0, totalProblems: 0 });
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => { 
    if (!loading && !user) router.push('/'); 
    if (!loading && user?.role === 'admin') router.push('/admin');
  }, [user, loading, router]);

  const fetchStats = useCallback(async () => {
    try { 
      const res = await api.get('/api/user/stats'); 
      const data = res.data;
      
      // Calculate XP and level locally
      data.xp = calculateXP(user, data);
      data.level = getLevel(data.xp);
      
      setStats(data); 
      // Cache data for offline use
      localStorage.setItem('studywar_offline_stats', JSON.stringify(data));
      localStorage.setItem('studywar_offline_user', JSON.stringify(user));
    }
    catch (err) { 
      console.error('Failed to fetch stats, loading from cache:', err); 
      const cachedStats = localStorage.getItem('studywar_offline_stats');
      if (cachedStats) {
        setStats(JSON.parse(cachedStats));
      }
    }
  }, [user]);

  useEffect(() => { 
    if (user) {
      const cachedStats = localStorage.getItem('studywar_offline_stats');
      if (cachedStats) setStats(JSON.parse(cachedStats));
      fetchStats(); 
    }
  }, [user, fetchStats, refreshKey]);

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
              Welcome back, <span className="neon-text">{user?.name?.split(' ')[0] || 'Warrior'}</span> 👋
            </h1>
          </div>
          {stats.xp !== undefined && (
            <div className="flex items-center gap-3">
              <div className="px-3 py-1.5 rounded-full bg-neon-purple/10 border border-neon-purple/20 flex items-center gap-2">
                <span className="text-sm font-semibold text-neon-purple">XP</span>
                <span className="text-white font-bold">{stats.xp}</span>
              </div>
              <div className="px-3 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 flex items-center gap-2">
                <span className="text-sm font-semibold text-blue-400">Level</span>
                <span className="text-white font-bold">{stats.level}</span>
              </div>
            </div>
          )}
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
