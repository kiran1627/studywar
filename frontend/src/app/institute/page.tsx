'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import Navbar from '@/components/Navbar';
import ModuleCard from '@/components/institute/ModuleCard';
import XPToast from '@/components/institute/XPToast';
import { MODULES, TOTAL_DAYS, TOTAL_XP } from '@/lib/instituteData';
import type { InstituteProgress, DayBlockProgress } from '@/types/user';
import api from '@/lib/api';

/* ─── Types ─── */
const STORAGE_KEY = 'studywar_institute_progress';

/* ─── Helpers ─── */
function loadCachedProgress(): InstituteProgress | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function cacheProgress(progress: InstituteProgress) {
  if (typeof window !== 'undefined') {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
  }
}

const DEFAULT_PROGRESS: InstituteProgress = {
  currentDay: 1,
  xp: 0,
  unlockedModules: ['data-foundations'],
  completedDays: {},
  dayProgress: {},
};

/* ═══════════════════════════════════════════════════════════════
   Institute Page — AI Bootcamp
   ═══════════════════════════════════════════════════════════════ */
export default function InstitutePage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  const [progress, setProgress] = useState<InstituteProgress>(DEFAULT_PROGRESS);
  const [toastXP, setToastXP] = useState(0);
  const [showToast, setShowToast] = useState(false);
  const [unlockToast, setUnlockToast] = useState<string | null>(null);
  
  const [isLoading, setIsLoading] = useState(true);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Auth guard
  useEffect(() => {
    if (!loading && !user) router.push('/');
  }, [user, loading, router]);

  // Load progress from API (with localStorage cache fallback)
  useEffect(() => {
    if (!user) return;

    // Load cache immediately for fast render
    const cached = loadCachedProgress();
    if (cached) setProgress(cached);

    // Then fetch from API
    const fetchProgress = async () => {
      try {
        const res = await api.get('/api/progress/me');
        setProgress(res.data);
        cacheProgress(res.data);
      } catch (err) {
        console.error('Failed to fetch progress:', err);
        // Keep using cache
      } finally {
        setIsLoading(false);
      }
    };

    fetchProgress();
  }, [user]);

  /* ─── Computed stats ─── */
  const completedDays = progress.completedDays || {};
  const totalCompleted = Object.values(completedDays).reduce((sum, days) => sum + (days?.length || 0), 0);
  const overallPercentage = TOTAL_DAYS > 0 ? (totalCompleted / TOTAL_DAYS) * 100 : 0;
  // Note: we use progress.xp from API, but since we toggle locally, this won't reflect perfectly
  // until they save, which gives a nice incentive to click "Save Progress".
  const earnedXP = progress.xp || 0;

  const completedModules = MODULES.filter((mod) => {
    const days = completedDays[mod.id] || [];
    return days.length === mod.days.length;
  }).length;

  /* ─── Toggle day completion locally ─── */
  const handleToggleDay = useCallback(
    (moduleId: string, day: number, xp: number) => {
      setProgress((prev) => {
        const next = { ...prev };
        next.completedDays = { ...next.completedDays };
        next.dayProgress = { ...next.dayProgress };

        const dayKey = `${moduleId}_day${day}`;
        let moduleDays = [...(next.completedDays[moduleId] || [])];

        if (moduleDays.includes(day)) {
          // Un-complete
          moduleDays = moduleDays.filter(d => d !== day);
          delete next.dayProgress[dayKey];
        } else {
          // Complete
          moduleDays.push(day);
          next.dayProgress[dayKey] = { learning: true, practice: true, build: true };
        }
        next.completedDays[moduleId] = moduleDays;

        setHasUnsavedChanges(true);
        return next;
      });
    },
    []
  );

  /* ─── Toggle individual block locally ─── */
  const handleToggleBlock = useCallback(
    (moduleId: string, day: number, block: 'learning' | 'practice' | 'build', xp: number) => {
      setProgress((prev) => {
        const next = { ...prev };
        next.dayProgress = { ...next.dayProgress };
        next.completedDays = { ...next.completedDays };

        const dayKey = `${moduleId}_day${day}`;
        const blockProg = { ...(next.dayProgress[dayKey] || { learning: false, practice: false, build: false }) };
        
        blockProg[block] = !blockProg[block];
        next.dayProgress[dayKey] = blockProg;

        const allDone = blockProg.learning && blockProg.practice && blockProg.build;
        let moduleDays = [...(next.completedDays[moduleId] || [])];
        
        if (allDone && !moduleDays.includes(day)) {
          moduleDays.push(day);
        } else if (!allDone && moduleDays.includes(day)) {
          moduleDays = moduleDays.filter(d => d !== day);
        }
        next.completedDays[moduleId] = moduleDays;

        setHasUnsavedChanges(true);
        return next;
      });
    },
    []
  );

  /* ─── Sync changes to backend ─── */
  const handleSaveProgress = async () => {
    setIsSaving(true);
    try {
      const res = await api.post('/api/progress/sync', {
        completedDays: progress.completedDays,
        dayProgress: progress.dayProgress,
      });

      const { xpAwarded, newlyUnlocked, progress: newProgress } = res.data;

      setProgress(newProgress);
      cacheProgress(newProgress);
      setHasUnsavedChanges(false);

      if (xpAwarded > 0) {
        setToastXP(xpAwarded);
        setShowToast(true);
      }

      if (newlyUnlocked) {
        setUnlockToast(newlyUnlocked);
        setTimeout(() => setUnlockToast(null), 3000);
      }
    } catch (err) {
      console.error('Failed to sync progress:', err);
    } finally {
      setIsSaving(false);
    }
  };

  /* ─── Loading / auth states ─── */
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
      {/* Ambient background glows */}
      <div className="fixed top-0 left-0 w-full h-full pointer-events-none">
        <div className="absolute top-0 right-0 w-96 h-96 bg-neon-purple/5 rounded-full blur-[150px]" />
        <div className="absolute bottom-1/3 left-0 w-96 h-96 bg-neon-blue/5 rounded-full blur-[150px]" />
        <div className="absolute top-1/2 right-1/4 w-80 h-80 bg-neon-pink/3 rounded-full blur-[120px]" />
      </div>

      <Navbar />
      <XPToast xp={toastXP} show={showToast} onDone={() => setShowToast(false)} />

      {/* Module unlock toast */}
      {unlockToast && (
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.8 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -30 }}
          className="fixed top-36 left-1/2 -translate-x-1/2 z-[100] pointer-events-none"
        >
          <div className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-dark-800/95 backdrop-blur-xl border border-neon-purple/30 shadow-[0_0_40px_rgba(124,58,237,0.2)]">
            <span className="text-2xl">🔓</span>
            <span className="text-sm font-bold text-neon-purple">New module unlocked!</span>
          </div>
        </motion.div>
      )}

      {/* Floating Save Button */}
      <AnimatePresence>
        {hasUnsavedChanges && (
          <motion.div
            initial={{ opacity: 0, y: 100 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 100 }}
            className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[100]"
          >
            <button
              onClick={handleSaveProgress}
              disabled={isSaving}
              className="px-8 py-3 bg-gradient-to-r from-neon-purple to-neon-blue text-white font-bold rounded-full shadow-[0_0_30px_rgba(124,58,237,0.4)] hover:shadow-[0_0_40px_rgba(124,58,237,0.6)] transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {isSaving ? (
                <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: 'linear' }} className="w-5 h-5 border-2 border-white border-t-transparent rounded-full" />
              ) : (
                <span>💾 Save Progress</span>
              )}
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <main className="relative z-10 pt-20 pb-24 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto">
        {/* ═══ Hero Section ═══ */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-10"
        >
          <div className="flex items-center gap-3 mb-2">
            <span className="text-3xl sm:text-4xl">🏛️</span>
            <div>
              <h1 className="text-2xl sm:text-4xl font-black text-white">
                AI <span className="neon-text">Bootcamp</span>
              </h1>
              <p className="text-sm text-gray-500">
                Structured curriculum • {TOTAL_DAYS} days • {TOTAL_XP} XP
              </p>
            </div>
          </div>

          {/* Stats cards row */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6">
            {[
              { label: 'Days Done', value: `${totalCompleted}/${TOTAL_DAYS}`, icon: '📅', color: '#00d4ff' },
              { label: 'XP Earned', value: `${earnedXP}`, icon: '⚡', color: '#00ff88' },
              { label: 'Modules Done', value: `${completedModules}/${MODULES.length}`, icon: '📦', color: '#7c3aed' },
              { label: 'Progress', value: `${Math.round(overallPercentage)}%`, icon: '🎯', color: '#ec4899' },
            ].map((stat, i) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 + i * 0.08 }}
                className="glass-card p-3 sm:p-4 text-center"
              >
                <span className="text-xl sm:text-2xl">{stat.icon}</span>
                <p className="text-lg sm:text-xl font-black mt-1" style={{ color: stat.color }}>
                  {stat.value}
                </p>
                <p className="text-[10px] sm:text-xs text-gray-500 mt-0.5">{stat.label}</p>
              </motion.div>
            ))}
          </div>

          {/* Overall progress bar */}
          <div className="mt-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-gray-400">Overall Progress</span>
              <span className="text-xs font-bold text-white">{Math.round(overallPercentage)}%</span>
            </div>
            <div className="w-full h-2.5 bg-dark-700 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${overallPercentage}%` }}
                transition={{ duration: 1.2, ease: 'easeOut' }}
                className="h-full rounded-full bg-gradient-to-r from-neon-purple via-neon-blue to-neon-green"
                style={{ boxShadow: '0 0 12px rgba(0,212,255,0.4)' }}
              />
            </div>
          </div>
        </motion.div>

        {/* ═══ Module List ═══ */}
        <div className="space-y-4">
          {MODULES.map((mod, i) => {
            const isLocked = !(progress.unlockedModules || []).includes(mod.id);
            return (
              <motion.div
                key={mod.id}
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 + i * 0.06, duration: 0.5 }}
              >
                <ModuleCard
                  module={mod}
                  completedDays={completedDays[mod.id] || []}
                  dayProgress={progress.dayProgress || {}}
                  isLocked={isLocked}
                  onToggleDay={handleToggleDay}
                  onToggleBlock={handleToggleBlock}
                />
              </motion.div>
            );
          })}
        </div>

        {/* ═══ Bottom Motivational ═══ */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2 }}
          className="mt-12 text-center"
        >
          <div className="glass-card p-6 sm:p-8 max-w-lg mx-auto">
            <span className="text-4xl mb-3 block">
              {overallPercentage === 100 ? '🏆' : overallPercentage > 50 ? '🔥' : '💪'}
            </span>
            <p className="text-sm text-gray-400">
              {overallPercentage === 100
                ? 'You conquered the entire bootcamp! You are an AI warrior!'
                : overallPercentage > 50
                ? "You're past halfway! Keep the momentum going!"
                : 'Every expert was once a beginner. Start your journey today!'}
            </p>
          </div>
        </motion.div>
      </main>
    </div>
  );
}
