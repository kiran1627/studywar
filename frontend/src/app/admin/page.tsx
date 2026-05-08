'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import Navbar from '@/components/Navbar';
import AdminUserTable from '@/components/admin/AdminUserTable';
import AdminAnalytics from '@/components/admin/AdminAnalytics';
import AdminLeaderboard from '@/components/admin/AdminLeaderboard';
import AdminReports from '@/components/admin/AdminReports';
import AdminModuleManagement from '@/components/admin/AdminModuleManagement';
import AdminNotificationControl from '@/components/admin/AdminNotificationControl';
import api from '@/lib/api';

interface AdminUser {
  _id: string;
  name: string;
  email: string;
  picture: string;
  score: number;
  streak: number;
  xp: number;
  level: number;
  role: string;
  lastActiveDate: string | null;
  createdAt: string;
  institute: {
    xp: number;
    currentDay: number;
    completedDays: number;
    totalDays: number;
    modulesCompleted: number;
    totalModules: number;
    progress: number;
  };
}

interface Analytics {
  totalUsers: number;
  totalXP: number;
  totalInstituteXP: number;
  avgStreak: number;
  activeToday: number;
  moduleAnalytics: {
    id: string;
    title: string;
    days: number;
    completedByUsers: number;
    completionRate: number;
  }[];
}

type Tab = 'users' | 'analytics' | 'leaderboard' | 'reports' | 'modules' | 'notifications';

export default function AdminPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<Tab>('users');
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [dataLoading, setDataLoading] = useState(true);

  // Auth + role guard
  useEffect(() => {
    if (!loading && !user) router.push('/');
    if (!loading && user && user.role !== 'admin') router.push('/dashboard');
  }, [user, loading, router]);

  // Fetch data
  const fetchData = async () => {
    try {
      const [usersRes, analyticsRes] = await Promise.all([
        api.get('/api/admin/users'),
        api.get('/api/admin/analytics'),
      ]);
      setUsers(usersRes.data);
      setAnalytics(analyticsRes.data);
    } catch (err) {
      console.error('Admin data fetch error:', err);
    } finally {
      setDataLoading(false);
    }
  };

  useEffect(() => {
    if (!user || user.role !== 'admin') return;
    fetchData();
  }, [user]);

  if (loading || !user || user.role !== 'admin') {
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

  const tabs: { key: Tab; label: string; icon: string }[] = [
    { key: 'users', label: 'Users', icon: '👥' },
    { key: 'modules', label: 'Curriculum', icon: '📚' },
    { key: 'notifications', label: 'Alerts', icon: '🔔' },
    { key: 'analytics', label: 'Analytics', icon: '📊' },
    { key: 'reports', label: 'Reports', icon: '📄' },
    { key: 'leaderboard', label: 'Leaderboard', icon: '🏆' },
  ];

  return (
    <div className="min-h-screen bg-dark-900">
      {/* Ambient glows */}
      <div className="fixed top-0 left-0 w-full h-full pointer-events-none">
        <div className="absolute top-0 right-0 w-96 h-96 bg-red-500/5 rounded-full blur-[150px]" />
        <div className="absolute bottom-1/3 left-0 w-96 h-96 bg-neon-purple/5 rounded-full blur-[150px]" />
      </div>

      <Navbar />

      <main className="relative z-10 pt-20 pb-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center gap-3 mb-1">
            <span className="text-3xl">🛡️</span>
            <h1 className="text-2xl sm:text-4xl font-black text-white">
              Admin <span className="neon-text">Portal</span>
            </h1>
          </div>
          <p className="text-sm text-gray-500 ml-12">
            Complete platform control center for StudyWar
          </p>
        </motion.div>

        {/* Quick Stats */}
        {analytics && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="grid grid-cols-2 sm:grid-cols-5 gap-3 mb-8"
          >
            {[
              { label: 'Total Users', value: analytics.totalUsers, icon: '👥', color: '#7c3aed' },
              { label: 'Total XP', value: analytics.totalXP.toLocaleString(), icon: '⚡', color: '#00ff88' },
              { label: 'Institute XP', value: analytics.totalInstituteXP.toLocaleString(), icon: '🏛️', color: '#00d4ff' },
              { label: 'Avg Streak', value: `${analytics.avgStreak}d`, icon: '🔥', color: '#f97316' },
              { label: 'Active Today', value: analytics.activeToday, icon: '🟢', color: '#22c55e' },
            ].map((stat, i) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.15 + i * 0.05 }}
                className="glass-card p-3 sm:p-4 text-center"
              >
                <span className="text-lg">{stat.icon}</span>
                <p className="text-lg font-black mt-1" style={{ color: stat.color }}>
                  {stat.value}
                </p>
                <p className="text-[10px] text-gray-500">{stat.label}</p>
              </motion.div>
            ))}
          </motion.div>
        )}

        {/* Tabs */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-1">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium transition-all whitespace-nowrap cursor-pointer ${
                activeTab === tab.key
                  ? 'bg-neon-purple/20 border border-neon-purple/30 text-neon-purple'
                  : 'bg-dark-800/50 border border-white/5 text-gray-400 hover:text-white hover:border-white/10'
              }`}
            >
              <span>{tab.icon}</span>
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Tab Content */}
        {dataLoading ? (
          <div className="flex items-center justify-center py-20">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
              className="w-8 h-8 border-2 border-neon-purple border-t-transparent rounded-full"
            />
          </div>
        ) : (
          <>
            {activeTab === 'users' && <AdminUserTable users={users} onUpdate={fetchData} />}
            {activeTab === 'modules' && <AdminModuleManagement />}
            {activeTab === 'notifications' && <AdminNotificationControl />}
            {activeTab === 'analytics' && analytics && <AdminAnalytics analytics={analytics} />}
            {activeTab === 'reports' && <AdminReports />}
            {activeTab === 'leaderboard' && <AdminLeaderboard users={users} />}
          </>
        )}
      </main>
    </div>
  );
}
