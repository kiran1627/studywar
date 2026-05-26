'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import Navbar from '@/components/Navbar';
import AdminUserTable from '@/components/admin/AdminUserTable';
import AdminAnalytics from '@/components/admin/AdminAnalytics';
import AdminLeaderboard from '@/components/admin/AdminLeaderboard';
import AdminReports from '@/components/admin/AdminReports';
import AdminModuleManagement from '@/components/admin/AdminModuleManagement';
import AdminNotificationControl from '@/components/admin/AdminNotificationControl';

// New Modules
import RiskDetection from '@/components/admin/modules/RiskDetection';
import BadgeManager from '@/components/admin/modules/BadgeManager';
import AssignmentSystem from '@/components/admin/modules/AssignmentSystem';
import RoadmapBuilder from '@/components/admin/modules/RoadmapBuilder';
import MockTestCreator from '@/components/admin/modules/MockTestCreator';
import BatchManager from '@/components/admin/modules/BatchManager';
import Announcements from '@/components/admin/modules/Announcements';
import AdminCertificates from '@/components/admin/modules/AdminCertificates';
import FocusSessionTracker from '@/components/admin/modules/FocusSessionTracker';
import InstituteAnalytics from '@/components/admin/modules/InstituteAnalytics';

import api from '@/lib/api';

type Tab = 
  | 'dashboard' 
  | 'users' 
  | 'batches' 
  | 'curriculum' 
  | 'roadmaps' 
  | 'assignments' 
  | 'mock-tests' 
  | 'badges' 
  | 'announcements' 
  | 'risk' 
  | 'reports' 
  | 'leaderboard'
  | 'notifications'
  | 'focus-tracker'
  | 'institute-analytics';

export default function AdminPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<Tab>('dashboard');
  const [users, setUsers] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [dataLoading, setDataLoading] = useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  // Auth + role guard
  useEffect(() => {
    if (!loading && !user) router.push('/');
    if (!loading && user && user.role !== 'admin') router.push('/dashboard');
  }, [user, loading, router]);

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

  const menuItems: { key: Tab; label: string; icon: string; group: string }[] = [
    { key: 'dashboard', label: 'Overview', icon: '📊', group: 'General' },
    { key: 'users', label: 'User Directory', icon: '👥', group: 'Management' },
    { key: 'batches', label: 'Student Batches', icon: '🏫', group: 'Management' },
    { key: 'curriculum', label: 'Curriculum', icon: '📚', group: 'Content' },
    { key: 'roadmaps', label: 'Roadmap Builder', icon: '🗺️', group: 'Content' },
    { key: 'assignments', label: 'Assignments', icon: '📝', group: 'Learning' },
    { key: 'mock-tests', label: 'Mock Tests', icon: '🧪', group: 'Learning' },
    { key: 'badges', label: 'Badge System', icon: '🏆', group: 'Gamification' },
    { key: 'announcements', label: 'Announcements', icon: '📢', group: 'Communication' },
    { key: 'notifications', label: 'Push Alerts', icon: '🔔', group: 'Communication' },
    { key: 'risk', label: 'Risk Detection', icon: '⚠️', group: 'Analytics' },
    { key: 'focus-tracker', label: 'Focus Tracker', icon: '🎯', group: 'Analytics' },
    { key: 'institute-analytics', label: 'Institute Study', icon: '🏛️', group: 'Analytics' },
    { key: 'reports', label: 'Platform Reports', icon: '📄', group: 'Analytics' },
    { key: 'leaderboard', label: 'Leaderboard', icon: '🥇', group: 'Analytics' },
  ];

  const groupedMenu = menuItems.reduce((acc, item) => {
    if (!acc[item.group]) acc[item.group] = [];
    acc[item.group].push(item);
    return acc;
  }, {} as Record<string, typeof menuItems>);

  return (
    <div className="min-h-screen bg-dark-950 flex flex-col">
      <Navbar />
      
      <div className="flex flex-1 pt-16 overflow-hidden">
        {/* Sidebar */}
        <motion.aside 
          initial={false}
          animate={{ width: isSidebarOpen ? 260 : 80 }}
          className="bg-dark-900 border-r border-white/5 flex flex-col z-20 transition-all duration-300 hidden md:flex"
        >
          <div className="p-4 flex-1 overflow-y-auto custom-scrollbar">
            {Object.entries(groupedMenu).map(([group, items]) => (
              <div key={group} className="mb-6">
                {isSidebarOpen && (
                  <p className="text-[10px] uppercase font-black text-gray-600 mb-2 px-3 tracking-widest">
                    {group}
                  </p>
                )}
                <div className="space-y-1">
                  {items.map((item) => (
                    <button
                      key={item.key}
                      onClick={() => setActiveTab(item.key)}
                      className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl transition-all ${
                        activeTab === item.key
                          ? 'bg-neon-purple/10 text-neon-purple border border-neon-purple/20'
                          : 'text-gray-400 hover:text-white hover:bg-white/5 border border-transparent'
                      }`}
                    >
                      <span className="text-xl">{item.icon}</span>
                      {isSidebarOpen && <span className="text-sm font-medium">{item.label}</span>}
                      {activeTab === item.key && isSidebarOpen && (
                        <motion.div layoutId="active" className="ml-auto w-1.5 h-1.5 rounded-full bg-neon-purple" />
                      )}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
          
          <button 
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="p-4 border-t border-white/5 text-gray-500 hover:text-white transition-colors"
          >
            {isSidebarOpen ? '← Collapse' : '→'}
          </button>
        </motion.aside>

        {/* Mobile Navigation (Bottom Bar) */}
        <div className="md:hidden fixed bottom-0 left-0 w-full bg-dark-900 border-t border-white/5 flex justify-around p-2 z-50">
          {menuItems.slice(0, 5).map((item) => (
            <button
              key={item.key}
              onClick={() => setActiveTab(item.key)}
              className={`flex flex-col items-center p-2 rounded-lg ${activeTab === item.key ? 'text-neon-purple' : 'text-gray-500'}`}
            >
              <span className="text-xl">{item.icon}</span>
              <span className="text-[8px] uppercase font-bold">{item.label.split(' ')[0]}</span>
            </button>
          ))}
          <button className="flex flex-col items-center p-2 text-gray-500">
            <span className="text-xl">⚙️</span>
            <span className="text-[8px] uppercase font-bold">More</span>
          </button>
        </div>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto bg-dark-950 p-4 sm:p-8 custom-scrollbar relative">
          {/* Ambient Background Glows */}
          <div className="absolute top-0 right-0 w-1/2 h-1/2 bg-neon-purple/5 blur-[120px] pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-1/2 h-1/2 bg-red-500/5 blur-[120px] pointer-events-none" />

          <div className="max-w-6xl mx-auto relative z-10 pb-24 md:pb-0">
            {/* Page Header */}
            <header className="mb-8">
              <div className="flex items-center gap-3">
                <span className="text-2xl">{menuItems.find(i => i.key === activeTab)?.icon}</span>
                <h1 className="text-2xl sm:text-3xl font-black text-white">
                  {menuItems.find(i => i.key === activeTab)?.label}
                </h1>
              </div>
              <p className="text-sm text-gray-500 mt-1">
                Manage your EdTech ecosystem effectively from this dashboard.
              </p>
            </header>

            {/* Content Switcher */}
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
              >
                {activeTab === 'dashboard' && analytics && <AdminAnalytics analytics={analytics} />}
                {activeTab === 'users' && <AdminUserTable users={users} onUpdate={fetchData} />}
                {activeTab === 'batches' && <BatchManager />}
                {activeTab === 'curriculum' && <AdminModuleManagement />}
                {activeTab === 'roadmaps' && <RoadmapBuilder />}
                {activeTab === 'assignments' && <AssignmentSystem />}
                {activeTab === 'mock-tests' && <MockTestCreator />}
                {activeTab === 'badges' && <BadgeManager />}
                {activeTab === 'announcements' && <Announcements />}
                {activeTab === 'notifications' && <AdminNotificationControl />}
                {activeTab === 'risk' && <RiskDetection />}
                {activeTab === 'focus-tracker' && <FocusSessionTracker />}
                {activeTab === 'institute-analytics' && <InstituteAnalytics />}
                {activeTab === 'reports' && <AdminReports />}
                {activeTab === 'leaderboard' && <AdminLeaderboard users={users} />}
              </motion.div>
            </AnimatePresence>
          </div>
        </main>
      </div>

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.1);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(124, 58, 237, 0.5);
        }
        .glass-card {
          background: rgba(255, 255, 255, 0.03);
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 0.05);
          border-radius: 1.25rem;
        }
      `}</style>
    </div>
  );
}
