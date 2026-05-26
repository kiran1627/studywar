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
import InstituteFocusTimer from '@/components/InstituteFocusTimer';
import TasksPanel from '@/components/TasksPanel';
import Leaderboard from '@/components/Leaderboard';
import api from '@/lib/api';

// New Widgets
import LevelSystem from '@/components/dashboard/LevelSystem';
import StudyHeatmap from '@/components/dashboard/StudyHeatmap';
import DailyMissions from '@/components/dashboard/DailyMissions';
import QuickResume from '@/components/dashboard/QuickResume';
import SmartReminders from '@/components/SmartReminders';
import FocusStats from '@/components/dashboard/FocusStats';

import { calculateXP, getLevel, getRank } from '@/utils/coach';

interface UserStats {
  totalDays: number;
  totalCompleted: number;
  monthProgress: number;
  totalProblems: number;
  xp?: number;
  level?: string;
  rank?: string;
  lastModule?: { id: string; title: string; progress: number };
}

export default function DashboardPage() {
  const { user, loading, refreshUser } = useAuth();
  const router = useRouter();
  const [stats, setStats] = useState<UserStats>({ totalDays: 0, totalCompleted: 0, monthProgress: 0, totalProblems: 0 });
  const [heatmapData, setHeatmapData] = useState([]);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => { 
    if (!loading && !user) router.push('/'); 
    if (!loading && user?.role === 'admin') router.push('/admin');
  }, [user, loading, router]);

  const fetchData = useCallback(async () => {
    try { 
      const [statsRes, heatmapRes] = await Promise.all([
        api.get('/api/user/stats'),
        api.get('/api/user/heatmap')
      ]);
      
      const data = statsRes.data;
      data.xp = calculateXP(user, data);
      data.level = getLevel(data.xp);
      data.rank = getRank(data.xp);
      
      setStats(data);
      setHeatmapData(heatmapRes.data);
      
      localStorage.setItem('studywar_offline_stats', JSON.stringify(data));
    }
    catch (err) { 
      console.error('Data fetch error:', err);
      const cachedStats = localStorage.getItem('studywar_offline_stats');
      if (cachedStats) setStats(JSON.parse(cachedStats));
    }
  }, [user]);

  useEffect(() => { 
    if (user) {
      fetchData(); 
    }
  }, [user, fetchData, refreshKey]);

  const handleSessionComplete = () => { 
    setRefreshKey((k) => k + 1); 
    refreshUser(); 
  };

  if (loading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-dark-950">
        <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          className="w-10 h-10 border-2 border-neon-purple border-t-transparent rounded-full shadow-[0_0_15px_rgba(124,58,237,0.5)]" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-dark-950 text-white selection:bg-neon-purple/30">
      {/* Background FX */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))]" />
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-neon-purple/5 rounded-full blur-[120px]" />
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-neon-blue/5 rounded-full blur-[120px]" />
      </div>

      <Navbar />

      <main className="relative z-10 pt-20 pb-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        {/* Top Notification Bar */}
        <div className="mb-6">
          <SmartReminders />
        </div>

        {/* Hero Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8 items-start">
          <div className="lg:col-span-2 space-y-6">
            <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <motion.div 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
              >
                <h1 className="text-3xl sm:text-4xl font-black italic tracking-tighter">
                  LEVEL <span className="text-neon-purple underline decoration-4 underline-offset-4">{stats.level || '0'}</span> WARRIOR
                </h1>
                <p className="text-gray-500 font-bold uppercase text-[10px] tracking-[0.3em] mt-1">
                  System Online // Session Active
                </p>
              </motion.div>
              
              <div className="flex gap-2">
                <div className="glass-card px-4 py-2 border-neon-purple/20">
                  <span className="text-neon-purple font-black mr-2">XP</span>
                  <span className="font-bold">{stats.xp || 0}</span>
                </div>
                <div className="glass-card px-4 py-2 border-neon-blue/20">
                  <span className="text-neon-blue font-black mr-2">RANK</span>
                  <span className="font-bold">#42</span>
                </div>
              </div>
            </header>

            <QuickResume lastModule={stats.lastModule ? { _id: stats.lastModule.id, title: stats.lastModule.title, progress: stats.lastModule.progress || 0 } : undefined} />
            
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <ScoreCard score={user.score} />
              <StreakCard streak={user.streak} />
              <ProgressCard progress={stats.monthProgress} totalProblems={stats.totalProblems} />
            </div>
          </div>

          <div className="space-y-6">
            <LevelSystem xp={stats.xp || 0} level={stats.level || '0'} rank={stats.rank || 'Novice'} />
            <DailyMissions />
          </div>
        </div>

        {/* Secondary Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FocusTimer onSessionComplete={handleSessionComplete} />
              <InstituteFocusTimer onSessionComplete={handleSessionComplete} />
            </div>
            <FocusStats refreshKey={refreshKey} />
            <TasksPanel key={refreshKey} />
            <StudyHeatmap data={heatmapData} />
          </div>
          
          <div className="space-y-6">
            <Leaderboard />
            <div className="glass-card p-5 bg-gradient-to-t from-red-500/5 to-transparent border-red-500/10">
              <h3 className="text-xs font-black text-red-500 uppercase tracking-widest mb-4 italic">Active Challenges</h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center p-3 bg-dark-900/50 rounded-xl border border-red-500/10">
                  <span className="text-xs font-bold text-white">Algorithm Sprint</span>
                  <span className="text-[10px] text-red-500 font-black">2H REMAINING</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <style jsx global>{`
        .glass-card {
          background: rgba(255, 255, 255, 0.02);
          backdrop-filter: blur(12px);
          border: 1px solid rgba(255, 255, 255, 0.05);
          border-radius: 1.5rem;
        }
        .neon-text {
          color: #7c3aed;
          text-shadow: 0 0 10px rgba(124, 58, 237, 0.5);
        }
        .bg-dark-950 {
          background: #050505;
        }
      `}</style>
    </div>
  );
}
