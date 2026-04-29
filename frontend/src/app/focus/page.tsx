'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Navbar from '@/components/Navbar';

export default function FocusPage() {
  const [seconds, setSeconds] = useState(25 * 60);
  const [isActive, setIsActive] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [soundOn, setSoundOn] = useState(false);
  const [audio, setAudio] = useState<HTMLAudioElement | null>(null);

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;

    if (isActive && seconds > 0) {
      interval = setInterval(() => {
        setSeconds((prev) => prev - 1);
      }, 1000);
    } else if (seconds === 0) {
      setIsActive(false);
      if (soundOn) {
        const alarm = new Audio('https://assets.mixkit.co/active_storage/sfx/2568/2568-73.wav');
        alarm.play().catch(e => console.log('Audio play failed', e));
      }
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isActive, seconds, soundOn]);

  useEffect(() => {
    if (soundOn) {
      // Simple lofi audio placeholder
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

  const startTimer = () => setIsActive(true);
  const pauseTimer = () => setIsActive(false);
  const resetTimer = () => {
    setIsActive(false);
    setSeconds(25 * 60);
  };

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

          <div className="text-6xl sm:text-7xl font-black tabular-nums neon-text tracking-tight">
            {formatTime(seconds)}
          </div>

          <div className="flex justify-center gap-4">
            {isActive ? (
              <button onClick={pauseTimer} className="px-6 py-3 bg-amber-600 hover:bg-amber-700 text-white font-medium rounded-xl transition duration-200 text-sm shadow-md">
                Pause ⏸
              </button>
            ) : (
              <button onClick={startTimer} className="px-6 py-3 bg-neon-purple hover:bg-purple-600 text-white font-medium rounded-xl transition duration-200 text-sm shadow-md">
                Focus Start ⚡
              </button>
            )}
            <button onClick={resetTimer} className="px-6 py-3 bg-dark-700 hover:bg-dark-600 text-gray-300 font-medium rounded-xl transition duration-200 text-sm border border-white/10">
              Reset 🔄
            </button>
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
    </div>
  );
}
