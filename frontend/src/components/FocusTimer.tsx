'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import GlassCard from './GlassCard';
import api from '@/lib/api';
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
  const [problems, setProblems] = useState(0);
  const [completing, setCompleting] = useState(false);
  const [showComplete, setShowComplete] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour >= 21 && hour < 23) setSessionType('evening');
    else setSessionType('morning');
  }, []);

  useEffect(() => {
    if (isRunning && timeLeft > 0) {
      intervalRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) { clearInterval(intervalRef.current!); setIsRunning(false); setShowComplete(true); return 0; }
          return prev - 1;
        });
      }, 1000);
    }
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [isRunning, timeLeft]);

  const startTimer = () => { setIsRunning(true); setShowComplete(false); };
  const pauseTimer = () => setIsRunning(false);
  const resetTimer = () => { setIsRunning(false); setTimeLeft(TOTAL_SECONDS); setShowComplete(false); };
  const forceComplete = () => { setIsRunning(false); setTimeLeft(0); setShowComplete(true); };

  const completeSession = async () => {
    setCompleting(true);
    try {
      await api.put('/api/user/complete-session', { sessionType, problems });
      await refreshUser();
      onSessionComplete();
      resetTimer();
      setProblems(0);
    } catch (error: any) {
      alert(error.response?.data?.message || 'Failed to complete session');
    } finally { setCompleting(false); setShowComplete(false); }
  };

  const progress = ((TOTAL_SECONDS - timeLeft) / TOTAL_SECONDS) * 100;
  const circumference = 2 * Math.PI * 80;
  const offset = circumference - (progress / 100) * circumference;

  return (
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
            {!isRunning && timeLeft === TOTAL_SECONDS && !showComplete && (
              <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={startTimer} className="btn-glow text-lg" id="start-session-btn">Start Session 🚀</motion.button>
            )}
            {isRunning && (
              <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={pauseTimer} className="px-6 py-3 rounded-xl bg-yellow-500/20 text-yellow-400 border border-yellow-500/30 font-semibold">⏸️ Pause</motion.button>
            )}
            {!isRunning && timeLeft < TOTAL_SECONDS && !showComplete && (
              <>
                <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={startTimer} className="btn-glow">▶️ Resume</motion.button>
                <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={resetTimer} className="px-6 py-3 rounded-xl bg-[#2e2e3a] text-gray-400 border border-white/10 font-semibold">Reset</motion.button>
                <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={forceComplete} className="px-6 py-3 rounded-xl bg-[#00ff88]/20 text-[#00ff88] border border-[#00ff88]/30 font-semibold text-sm">✅ Complete</motion.button>
              </>
            )}
          </div>
        </div>

        <AnimatePresence>
          {showComplete && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="border-t border-white/10 pt-4 mt-4">
              <p className="text-center text-[#00ff88] font-semibold mb-4">🎉 Session Complete!</p>
              <div className="flex items-center gap-4 mb-4">
                <label className="text-sm text-gray-400">Problems Solved:</label>
                <input type="number" min="0" max="50" value={problems} onChange={(e) => setProblems(Math.max(0, parseInt(e.target.value) || 0))} className="w-20 px-3 py-2 rounded-lg bg-[#2e2e3a] border border-white/10 text-white text-center focus:border-[#7c3aed]/50 focus:outline-none" />
              </div>
              <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={completeSession} disabled={completing} className="w-full btn-glow disabled:opacity-50">
                {completing ? 'Saving...' : 'Save & Update Score 🏆'}
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </GlassCard>
  );
};

export default FocusTimer;
