'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Navbar from '@/components/Navbar';
import SessionCompleteModal from '@/components/SessionCompleteModal';
import { useAuth } from '@/context/AuthContext';
import api from '@/lib/api';

export default function FocusPage() {
  const { user, loading } = useAuth();
  const [seconds, setSeconds] = useState(25 * 60);
  const [isActive, setIsActive] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [soundOn, setSoundOn] = useState(false);
  const [audio, setAudio] = useState<HTMLAudioElement | null>(null);
  const [sessionType, setSessionType] = useState<'morning' | 'evening'>('morning');
  const [showModal, setShowModal] = useState(false);
  const [todayStatus, setTodayStatus] = useState({ morningDone: false, eveningDone: false });

  const startTimeRef = useRef<number | null>(null);
  const elapsedRef = useRef<number>(0);
  const expectedEndTimeRef = useRef<number | null>(null);
  const soundOnRef = useRef(soundOn);

  useEffect(() => {
    soundOnRef.current = soundOn;
  }, [soundOn]);

  // Load state on mount
  useEffect(() => {
    const saved = localStorage.getItem('deepFocusTimer_state');
    let loadedRunning = false;
    
    if (saved) {
      try {
        const state = JSON.parse(saved);
        if (state.isActive && state.expectedEndTime) {
          const now = Date.now();
          const remaining = Math.max(0, Math.round((state.expectedEndTime - now) / 1000));
          if (remaining <= 0) {
            // Timer finished while closed
            setSeconds(0);
            setIsActive(false);
            if (state.startTime) {
              elapsedRef.current = (state.elapsed || 0) + Math.round((now - state.startTime) / 60000);
            }
            setShowModal(true);
          } else {
            // Timer still running
            setSeconds(remaining);
            setIsActive(true);
            expectedEndTimeRef.current = state.expectedEndTime;
            startTimeRef.current = state.startTime;
            elapsedRef.current = state.elapsed || 0;
            loadedRunning = true;
          }
          if (state.sessionType) setSessionType(state.sessionType);
        } else {
          // Paused or not running
          setSeconds(state.seconds || (25 * 60));
          setIsActive(false);
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
      isActive,
      seconds,
      expectedEndTime: expectedEndTimeRef.current,
      startTime: startTimeRef.current,
      elapsed: elapsedRef.current,
      sessionType
    };
    localStorage.setItem('deepFocusTimer_state', JSON.stringify(state));
  }, [isActive, seconds, sessionType]);

  // Fetch today's session status
  useEffect(() => {
    if (!user) return;
    const fetchStatus = async () => {
      try {
        const res = await api.get('/api/focus-sessions/today');
        setTodayStatus({
          morningDone: res.data.summary.morningDone,
          eveningDone: res.data.summary.eveningDone,
        });
      } catch (err) {
        console.error('Failed to fetch today status:', err);
      }
    };
    fetchStatus();
  }, [user]);

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;

    if (isActive) {
      if (!startTimeRef.current) {
        startTimeRef.current = Date.now();
      }
      
      expectedEndTimeRef.current = Date.now() + seconds * 1000;

      interval = setInterval(() => {
        const now = Date.now();
        const remaining = Math.max(0, Math.round((expectedEndTimeRef.current! - now) / 1000));

        if (remaining <= 0) {
          clearInterval(interval!);
          setIsActive(false);
          // Track elapsed time
          if (startTimeRef.current) {
            elapsedRef.current += Math.round((now - startTimeRef.current) / 60000);
            startTimeRef.current = null;
          }
          // Play alarm
          if (soundOnRef.current) {
            const alarm = new Audio('https://assets.mixkit.co/active_storage/sfx/2568/2568-73.wav');
            alarm.play().catch(e => console.log('Audio play failed', e));
          }
          setSeconds(0);
          setShowModal(true);
        } else {
          setSeconds(remaining);
        }
      }, 1000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isActive]);

  useEffect(() => {
    if (soundOn) {
      const lofi = new Audio('https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3');
      lofi.loop = true;
      setAudio(lofi);
      if (isActive) {
        lofi.play().catch(e => console.log('Audio play failed', e));
      }
    } else {
      if (audio) {
        audio.pause();
        setAudio(null);
      }
    }

    return () => {
      if (audio) audio.pause();
    };
  }, [soundOn]);

  useEffect(() => {
    if (isActive && soundOn && audio) {
      audio.play().catch(e => console.log('Audio play failed', e));
    } else if (!isActive && audio) {
      audio.pause();
    }
  }, [isActive]);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().then(() => setIsFullscreen(true)).catch(err => {
        console.error(`Error attempting to enable fullscreen: ${err.message}`);
      });
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const startTimer = () => {
    setIsActive(true);
    if (!startTimeRef.current) {
      startTimeRef.current = Date.now();
    }
  };

  const pauseTimer = () => {
    setIsActive(false);
    if (startTimeRef.current) {
      elapsedRef.current += Math.round((Date.now() - startTimeRef.current) / 60000);
      startTimeRef.current = null;
    }
  };

  const resetTimer = () => {
    setIsActive(false);
    setSeconds(25 * 60);
    startTimeRef.current = null;
    elapsedRef.current = 0;
  };

  const forceComplete = () => {
    setIsActive(false);
    if (startTimeRef.current) {
      elapsedRef.current += Math.round((Date.now() - startTimeRef.current) / 60000);
      startTimeRef.current = null;
    }
    setSeconds(0);
    setShowModal(true);
  };

  const handleModalSaved = () => {
    setShowModal(false);
    resetTimer();
    // Refresh today's status
    setTodayStatus(prev => ({
      ...prev,
      [sessionType === 'morning' ? 'morningDone' : 'eveningDone']: true,
    }));
  };

  const focusMinutes = Math.max(1, elapsedRef.current || Math.round((25 * 60 - seconds) / 60));

  // Progress ring for the timer
  const totalSeconds = 25 * 60;
  const progress = ((totalSeconds - seconds) / totalSeconds) * 100;
  const circumference = 2 * Math.PI * 110;
  const dashOffset = circumference - (progress / 100) * circumference;

  return (
    <div className={`min-h-screen bg-dark-950 text-white relative transition-all duration-700 ${isFullscreen ? 'p-0' : ''}`}>
      {!isFullscreen && <Navbar />}

      <main className={`relative z-10 flex flex-col items-center justify-center h-screen max-w-4xl mx-auto px-4 ${isFullscreen ? 'justify-center' : 'pt-20'}`}>
        {/* Immersive backdrop glowing ring */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] sm:w-[400px] h-[300px] sm:h-[400px] bg-neon-purple/10 rounded-full blur-[120px] pointer-events-none" />

        <motion.div 
          initial={{ scale: 0.9, opacity: 0 }} 
          animate={{ scale: 1, opacity: 1 }}
          className="text-center space-y-8 bg-dark-900/50 backdrop-blur-2xl border border-white/10 rounded-3xl p-10 sm:p-16 shadow-2xl max-w-md w-full"
        >
          <div>
            <h1 className="text-2xl font-bold tracking-widest text-gray-300 uppercase">Deep Focus Mode</h1>
            <p className="text-xs text-neon-purple mt-2 font-semibold tracking-wider">
              RECOMMENDED SLOTS: 06:00-08:00 AM & 09:00-11:00 PM
            </p>
          </div>

          {/* Session Type Selector */}
          <div className="flex gap-3 justify-center">
            <button
              onClick={() => setSessionType('morning')}
              className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all flex items-center gap-2 ${
                sessionType === 'morning'
                  ? 'bg-[#00d4ff]/15 text-[#00d4ff] border border-[#00d4ff]/30'
                  : 'bg-dark-800 text-gray-400 border border-white/5'
              }`}
            >
              ☀️ Morning
              {todayStatus.morningDone && <span className="text-[#00ff88] text-xs">✓</span>}
            </button>
            <button
              onClick={() => setSessionType('evening')}
              className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all flex items-center gap-2 ${
                sessionType === 'evening'
                  ? 'bg-[#7c3aed]/15 text-[#7c3aed] border border-[#7c3aed]/30'
                  : 'bg-dark-800 text-gray-400 border border-white/5'
              }`}
            >
              🌙 Evening
              {todayStatus.eveningDone && <span className="text-[#00ff88] text-xs">✓</span>}
            </button>
          </div>

          {/* Timer Display with SVG Ring */}
          <div className="relative w-56 h-56 mx-auto">
            <svg className="w-56 h-56" viewBox="0 0 240 240">
              <circle cx="120" cy="120" r="110" fill="none" stroke="rgba(255,255,255,0.03)" strokeWidth="4" />
              <motion.circle
                cx="120" cy="120" r="110"
                fill="none"
                stroke="url(#focusTimerGrad)"
                strokeWidth="4"
                strokeLinecap="round"
                strokeDasharray={circumference}
                animate={{ strokeDashoffset: dashOffset }}
                transition={{ duration: 0.5 }}
                style={{ transformOrigin: 'center', transform: 'rotate(-90deg)' }}
              />
              <defs>
                <linearGradient id="focusTimerGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#7c3aed" />
                  <stop offset="100%" stopColor="#00d4ff" />
                </linearGradient>
              </defs>
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <div className="text-6xl sm:text-7xl font-black tabular-nums neon-text tracking-tight">
                {formatTime(seconds)}
              </div>
              <p className="text-[10px] text-gray-500 mt-1 uppercase tracking-widest">
                {sessionType === 'morning' ? '☀️ Morning Session' : '🌙 Evening Session'}
              </p>
            </div>
          </div>

          <div className="flex justify-center gap-4 flex-wrap">
            {isActive ? (
              <button onClick={pauseTimer} className="px-6 py-3 bg-amber-600 hover:bg-amber-700 text-white font-medium rounded-xl transition duration-200 text-sm shadow-md">
                Pause ⏸
              </button>
            ) : (
              <button onClick={startTimer} className="px-6 py-3 bg-neon-purple hover:bg-purple-600 text-white font-medium rounded-xl transition duration-200 text-sm shadow-md">
                {seconds < totalSeconds ? 'Resume ▶️' : 'Focus Start ⚡'}
              </button>
            )}
            <button onClick={resetTimer} className="px-6 py-3 bg-dark-700 hover:bg-dark-600 text-gray-300 font-medium rounded-xl transition duration-200 text-sm border border-white/10">
              Reset 🔄
            </button>
            {!isActive && seconds < totalSeconds && seconds > 0 && (
              <button onClick={forceComplete} className="px-6 py-3 bg-[#00ff88]/10 hover:bg-[#00ff88]/20 text-[#00ff88] font-medium rounded-xl transition duration-200 text-sm border border-[#00ff88]/20">
                Complete ✅
              </button>
            )}
          </div>

          <div className="flex items-center justify-around pt-6 border-t border-white/5 text-sm text-gray-400">
            <button 
              onClick={() => setSoundOn(!soundOn)} 
              className={`flex items-center gap-1 hover:text-white transition ${soundOn ? 'text-neon-blue font-semibold' : ''}`}
            >
              {soundOn ? '🔊 Ambient On' : '🔇 Mute Ambient'}
            </button>

            <button 
              onClick={toggleFullscreen} 
              className="flex items-center gap-1 hover:text-white transition text-gray-300"
            >
              {isFullscreen ? 'Exit Fullscreen 📴' : 'Go Fullscreen 📺'}
            </button>
          </div>
        </motion.div>
      </main>

      {/* Session Completion Modal */}
      <SessionCompleteModal
        isOpen={showModal}
        sessionType={sessionType}
        focusMinutes={focusMinutes}
        onClose={() => setShowModal(false)}
        onSaved={handleModalSaved}
      />
    </div>
  );
}
