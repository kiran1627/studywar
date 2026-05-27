'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import GlassCard from './GlassCard';
import SessionCompleteModal from './SessionCompleteModal';
import { useAuth } from '@/context/AuthContext';

interface FocusTimerProps { onSessionComplete: () => void; }

const TOTAL_SECONDS = 2 * 60 * 60;

const formatTime = (s: number): string => {
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}`;
};

const FocusTimer: React.FC<FocusTimerProps> = ({ onSessionComplete }) => {
  const { refreshUser } = useAuth();
  const [isRunning, setIsRunning] = useState(false);
  const [timeLeft, setTimeLeft] = useState(TOTAL_SECONDS);
  const [sessionType, setSessionType] = useState<'morning' | 'evening'>('morning');
  const [showModal, setShowModal] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const startTimeRef = useRef<number | null>(null);
  const elapsedRef = useRef<number>(0);

  const expectedEndTimeRef = useRef<number | null>(null);

  // Load state on mount
  useEffect(() => {
    const saved = localStorage.getItem('focusTimer_state');
    let loadedRunning = false;
    
    if (saved) {
      try {
        const state = JSON.parse(saved);
        if (state.isRunning && state.expectedEndTime) {
          const now = Date.now();
          const remaining = Math.max(0, Math.round((state.expectedEndTime - now) / 1000));
          if (remaining <= 0) {
            // Timer finished while closed
            setTimeLeft(0);
            setIsRunning(false);
            if (state.startTime) {
              elapsedRef.current = state.elapsed + Math.round((now - state.startTime) / 60000);
            }
            setShowModal(true);
          } else {
            // Timer still running
            setTimeLeft(remaining);
            setIsRunning(true);
            expectedEndTimeRef.current = state.expectedEndTime;
            startTimeRef.current = state.startTime;
            elapsedRef.current = state.elapsed || 0;
            loadedRunning = true;
          }
          if (state.sessionType) setSessionType(state.sessionType);
        } else {
          // Paused or not running
          setTimeLeft(state.timeLeft || TOTAL_SECONDS);
          setIsRunning(false);
          startTimeRef.current = state.startTime;
          elapsedRef.current = state.elapsed || 0;
          if (state.sessionType) setSessionType(state.sessionType);
        }
      } catch (e) {
        console.error('Failed to parse timer state', e);
      }
    }
    
    if (!loadedRunning) {
      const hour = new Date().getHours();
      if (hour >= 21 && hour < 23) setSessionType('evening');
      else setSessionType('morning');
    }
  }, []);

  // Save state on change
  useEffect(() => {
    const state = {
      isRunning,
      timeLeft,
      expectedEndTime: expectedEndTimeRef.current,
      startTime: startTimeRef.current,
      elapsed: elapsedRef.current,
      sessionType
    };
    localStorage.setItem('focusTimer_state', JSON.stringify(state));
  }, [isRunning, timeLeft, sessionType]);

  useEffect(() => {
    if (isRunning) {
      if (!startTimeRef.current) {
        startTimeRef.current = Date.now();
      }
      // Set the expected end time based on the current timeLeft
      expectedEndTimeRef.current = Date.now() + timeLeft * 1000;

      intervalRef.current = setInterval(() => {
        const now = Date.now();
        const remaining = Math.max(0, Math.round((expectedEndTimeRef.current! - now) / 1000));

        if (remaining <= 0) {
          clearInterval(intervalRef.current!);
          setIsRunning(false);
          if (startTimeRef.current) {
            elapsedRef.current += Math.round((now - startTimeRef.current) / 60000);
            startTimeRef.current = null;
          }
          setTimeLeft(0);
          setShowModal(true);
        } else {
          setTimeLeft(remaining);
        }
      }, 1000);
    }
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isRunning]);

  const startTimer = () => {
    setIsRunning(true);
    if (!startTimeRef.current) {
      startTimeRef.current = Date.now();
    }
  };

  const pauseTimer = () => {
    setIsRunning(false);
    if (startTimeRef.current) {
      elapsedRef.current += Math.round((Date.now() - startTimeRef.current) / 60000);
      startTimeRef.current = null;
    }
  };

  const resetTimer = () => {
    setIsRunning(false);
    setTimeLeft(TOTAL_SECONDS);
    setShowModal(false);
    startTimeRef.current = null;
    elapsedRef.current = 0;
  };

  const forceComplete = () => {
    setIsRunning(false);
    if (startTimeRef.current) {
      elapsedRef.current += Math.round((Date.now() - startTimeRef.current) / 60000);
      startTimeRef.current = null;
    }
    setTimeLeft(0);
    setShowModal(true);
  };

  const handleModalSaved = () => {
    onSessionComplete();
    resetTimer();
  };

  const handleModalClose = () => {
    setShowModal(false);
  };

  const focusMinutes = Math.max(1, elapsedRef.current || Math.round((TOTAL_SECONDS - timeLeft) / 60));

  const progress = ((TOTAL_SECONDS - timeLeft) / TOTAL_SECONDS) * 100;
  const circumference = 2 * Math.PI * 80;
  const offset = circumference - (progress / 100) * circumference;

  return (
    <>
      <GlassCard glowColor="purple" className="relative overflow-hidden">
        <div className="absolute -top-20 -left-20 w-60 h-60 bg-neon-purple/5 rounded-full blur-3xl" />
        <div className="relative z-10">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <span className="text-2xl">⏱️</span>
              <h3 className="text-sm font-medium text-gray-400 uppercase tracking-wider">Focus Timer</h3>
            </div>
            <div className="flex gap-2">
              <button onClick={() => setSessionType('morning')} className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${sessionType === 'morning' ? 'bg-[#00d4ff]/20 text-[#00d4ff] border border-[#00d4ff]/30' : 'bg-[#2e2e3a] text-gray-400 border border-transparent'}`}>☀️ Morning</button>
              <button onClick={() => setSessionType('evening')} className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${sessionType === 'evening' ? 'bg-[#7c3aed]/20 text-[#7c3aed] border border-[#7c3aed]/30' : 'bg-[#2e2e3a] text-gray-400 border border-transparent'}`}>🌙 Evening</button>
            </div>
          </div>

          <div className="flex flex-col items-center py-6">
            <div className="relative w-48 h-48 mb-6">
              <svg className="w-48 h-48" viewBox="0 0 180 180">
                <circle cx="90" cy="90" r="80" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="6" />
                <motion.circle cx="90" cy="90" r="80" fill="none" stroke="url(#timerGrad)" strokeWidth="6" strokeLinecap="round" strokeDasharray={circumference} animate={{ strokeDashoffset: offset }} transition={{ duration: 0.5 }} className="timer-ring" />
                <defs><linearGradient id="timerGrad" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stopColor="#7c3aed" /><stop offset="100%" stopColor="#00d4ff" /></linearGradient></defs>
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-3xl font-mono font-bold text-white">{formatTime(timeLeft)}</span>
                <span className="text-xs text-gray-500 mt-1">{sessionType === 'morning' ? 'Python + Backend' : 'DSA + HackerRank'}</span>
              </div>
            </div>

            <div className="flex gap-3">
              {!isRunning && timeLeft === TOTAL_SECONDS && !showModal && (
                <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={startTimer} className="btn-glow text-lg" id="start-session-btn">Start Session 🚀</motion.button>
              )}
              {isRunning && (
                <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={pauseTimer} className="px-6 py-3 rounded-xl bg-yellow-500/20 text-yellow-400 border border-yellow-500/30 font-semibold">⏸️ Pause</motion.button>
              )}
              {!isRunning && timeLeft < TOTAL_SECONDS && !showModal && (
                <>
                  <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={startTimer} className="btn-glow">▶️ Resume</motion.button>
                  <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={resetTimer} className="px-6 py-3 rounded-xl bg-[#2e2e3a] text-gray-400 border border-white/10 font-semibold">Reset</motion.button>
                  <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={forceComplete} className="px-6 py-3 rounded-xl bg-[#00ff88]/20 text-[#00ff88] border border-[#00ff88]/30 font-semibold text-sm">✅ Complete</motion.button>
                </>
              )}
            </div>
          </div>
        </div>
      </GlassCard>

      {/* Session Completion Modal */}
      <SessionCompleteModal
        isOpen={showModal}
        sessionType={sessionType}
        focusMinutes={focusMinutes}
        onClose={handleModalClose}
        onSaved={handleModalSaved}
      />
    </>
  );
};

export default FocusTimer;
