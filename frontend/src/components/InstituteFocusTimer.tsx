'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import GlassCard from './GlassCard';
import InstituteCompleteModal from './InstituteCompleteModal';
import { useAuth } from '@/context/AuthContext';
import api from '@/lib/api';

interface InstituteFocusTimerProps {
  onSessionComplete: () => void;
}

const formatTime = (s: number): string => {
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}`;
};

const InstituteFocusTimer: React.FC<InstituteFocusTimerProps> = ({ onSessionComplete }) => {
  const { refreshUser } = useAuth();
  const [isRunning, setIsRunning] = useState(false);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [showModal, setShowModal] = useState(false);
  const [todayCount, setTodayCount] = useState(0);
  const [todayMinutes, setTodayMinutes] = useState(0);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const startTimeRef = useRef<number | null>(null);
  const pausedElapsedRef = useRef<number>(0);

  // Fetch today's institute sessions on mount
  useEffect(() => {
    const fetchToday = async () => {
      try {
        const res = await api.get('/api/institute-sessions/today');
        setTodayCount(res.data.summary.sessionCount);
        setTodayMinutes(res.data.summary.totalMinutes);
      } catch { /* ignore */ }
    };
    fetchToday();
  }, []);

  // Timer tick (count-up)
  useEffect(() => {
    if (isRunning) {
      if (!startTimeRef.current) {
        startTimeRef.current = Date.now();
      }
      intervalRef.current = setInterval(() => {
        const nowElapsed = pausedElapsedRef.current + Math.floor((Date.now() - (startTimeRef.current || Date.now())) / 1000);
        setElapsedSeconds(nowElapsed);
      }, 1000);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isRunning]);

  const startTimer = () => {
    startTimeRef.current = Date.now();
    setIsRunning(true);
  };

  const pauseTimer = () => {
    setIsRunning(false);
    if (startTimeRef.current) {
      pausedElapsedRef.current += Math.floor((Date.now() - startTimeRef.current) / 1000);
      startTimeRef.current = null;
    }
  };

  const stopTimer = () => {
    setIsRunning(false);
    if (startTimeRef.current) {
      pausedElapsedRef.current += Math.floor((Date.now() - startTimeRef.current) / 1000);
      startTimeRef.current = null;
    }
    setElapsedSeconds(pausedElapsedRef.current);
    setShowModal(true);
  };

  const resetTimer = () => {
    setIsRunning(false);
    setElapsedSeconds(0);
    setShowModal(false);
    startTimeRef.current = null;
    pausedElapsedRef.current = 0;
  };

  const handleModalSaved = () => {
    setTodayCount(c => c + 1);
    setTodayMinutes(m => m + Math.round(elapsedSeconds / 60));
    onSessionComplete();
    resetTimer();
  };

  const handleModalClose = () => {
    setShowModal(false);
  };

  const focusMinutes = Math.max(1, Math.round(elapsedSeconds / 60));

  // Progress ring — fill based on 2-hour max for visual
  const MAX_VISUAL = 2 * 60 * 60;
  const progress = Math.min((elapsedSeconds / MAX_VISUAL) * 100, 100);
  const circumference = 2 * Math.PI * 80;
  const offset = circumference - (progress / 100) * circumference;

  const hasStarted = elapsedSeconds > 0 || isRunning;

  return (
    <>
      <GlassCard glowColor="green" className="relative overflow-hidden">
        {/* Ambient glow */}
        <div className="absolute -top-20 -right-20 w-60 h-60 bg-[#f97316]/5 rounded-full blur-3xl" />
        <div className="absolute -bottom-16 -left-16 w-48 h-48 bg-[#f97316]/3 rounded-full blur-3xl" />

        <div className="relative z-10">
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <span className="text-2xl">🏛️</span>
              <div>
                <h3 className="text-sm font-medium text-gray-400 uppercase tracking-wider">Institute Timer</h3>
                <p className="text-[10px] text-gray-600">Flexible study sessions</p>
              </div>
            </div>
            {todayCount > 0 && (
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#f97316]/10 border border-[#f97316]/20">
                <span className="text-xs font-bold text-[#f97316]">{todayCount}</span>
                <span className="text-[9px] text-gray-500">today</span>
              </div>
            )}
          </div>

          {/* Timer Display */}
          <div className="flex flex-col items-center py-4">
            <div className="relative w-48 h-48 mb-4">
              <svg className="w-48 h-48" viewBox="0 0 180 180">
                <circle cx="90" cy="90" r="80" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="6" />
                <motion.circle
                  cx="90" cy="90" r="80" fill="none"
                  stroke="url(#instituteGrad)"
                  strokeWidth="6" strokeLinecap="round"
                  strokeDasharray={circumference}
                  animate={{ strokeDashoffset: offset }}
                  transition={{ duration: 0.5 }}
                  style={{ transformOrigin: 'center', transform: 'rotate(-90deg)' }}
                />
                <defs>
                  <linearGradient id="instituteGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#f97316" />
                    <stop offset="100%" stopColor="#fbbf24" />
                  </linearGradient>
                </defs>
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-3xl font-mono font-bold text-white">{formatTime(elapsedSeconds)}</span>
                <span className="text-[10px] text-gray-500 mt-1">
                  {isRunning ? (
                    <motion.span
                      animate={{ opacity: [1, 0.3, 1] }}
                      transition={{ repeat: Infinity, duration: 1.5 }}
                      className="text-[#f97316] font-bold uppercase tracking-wider"
                    >
                      ● Recording
                    </motion.span>
                  ) : hasStarted ? 'Paused' : 'Ready to start'}
                </span>
              </div>
            </div>

            {/* Today's total */}
            {todayMinutes > 0 && (
              <div className="mb-3 text-center">
                <span className="text-[10px] text-gray-500">Today: </span>
                <span className="text-[10px] font-bold text-[#f97316]">
                  {todayMinutes >= 60
                    ? `${Math.floor(todayMinutes / 60)}h ${todayMinutes % 60}m`
                    : `${todayMinutes}m`
                  }
                </span>
              </div>
            )}

            {/* Controls */}
            <div className="flex gap-3">
              {!hasStarted && !showModal && (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={startTimer}
                  className="px-6 py-3 rounded-xl font-bold text-sm text-white transition-all"
                  style={{
                    background: 'linear-gradient(135deg, #f97316 0%, #fbbf24 100%)',
                    boxShadow: '0 4px 20px rgba(249, 115, 22, 0.3)',
                  }}
                  id="start-institute-btn"
                >
                  Start Session 🏛️
                </motion.button>
              )}
              {isRunning && (
                <>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={pauseTimer}
                    className="px-5 py-3 rounded-xl bg-yellow-500/20 text-yellow-400 border border-yellow-500/30 font-semibold text-sm"
                  >
                    ⏸️ Pause
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={stopTimer}
                    className="px-5 py-3 rounded-xl bg-red-500/20 text-red-400 border border-red-500/30 font-semibold text-sm"
                  >
                    ⏹️ Stop
                  </motion.button>
                </>
              )}
              {!isRunning && hasStarted && !showModal && (
                <>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={startTimer}
                    className="px-5 py-3 rounded-xl font-bold text-sm text-white"
                    style={{
                      background: 'linear-gradient(135deg, #f97316 0%, #fbbf24 100%)',
                      boxShadow: '0 4px 15px rgba(249, 115, 22, 0.25)',
                    }}
                  >
                    ▶️ Resume
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={stopTimer}
                    className="px-5 py-3 rounded-xl bg-[#00ff88]/20 text-[#00ff88] border border-[#00ff88]/30 font-semibold text-sm"
                  >
                    ✅ Complete
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={resetTimer}
                    className="px-4 py-3 rounded-xl bg-[#2e2e3a] text-gray-400 border border-white/10 font-semibold text-sm"
                  >
                    Reset
                  </motion.button>
                </>
              )}
            </div>
          </div>
        </div>
      </GlassCard>

      {/* Session Completion Modal */}
      <InstituteCompleteModal
        isOpen={showModal}
        focusMinutes={focusMinutes}
        onClose={handleModalClose}
        onSaved={handleModalSaved}
      />
    </>
  );
};

export default InstituteFocusTimer;
