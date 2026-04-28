'use client';

import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '@/context/AuthContext';
import LoginButton from '@/components/LoginButton';
import { useRouter } from 'next/navigation';

export default function HomePage() {
  const { user, loading, login } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && user) router.push('/dashboard');
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-dark-900">
        <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          className="w-10 h-10 border-2 border-neon-purple border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-dark-900 bg-grid relative overflow-hidden">
      {/* Ambient glow */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-neon-purple/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-neon-blue/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-neon-pink/5 rounded-full blur-[150px] pointer-events-none" />

      {/* Particles */}
      {[...Array(6)].map((_, i) => (
        <div key={i} className="particle" style={{
          left: `${15 + i * 15}%`, animationDelay: `${i * 1.2}s`,
          background: i % 2 === 0 ? 'var(--neon-purple)' : 'var(--neon-blue)',
        }} />
      ))}

      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-4">
        {/* Hero with SW Logo */}
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}
          className="text-center mb-12">

          {/* SW Logo Image */}
          <motion.div initial={{ scale: 0, rotate: -10 }} animate={{ scale: 1, rotate: 0 }}
            transition={{ type: 'spring', stiffness: 200, delay: 0.2 }} className="mb-6">
            <img src="/icons/app logo.png" alt="StudyWar Logo" className="w-32 h-32 sm:w-40 sm:h-40 mx-auto drop-shadow-[0_0_30px_rgba(124,58,237,0.5)]" />
          </motion.div>

          <h1 className="text-5xl sm:text-7xl font-black mb-4">
            <span className="neon-text">StudyWar</span>
          </h1>
          <p className="text-lg sm:text-xl text-gray-400 max-w-md mx-auto leading-relaxed">
            Gamify your coding journey. Build streaks, climb the leaderboard, and become unstoppable.
          </p>
        </motion.div>

        {/* Features */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
          className="grid grid-cols-3 gap-4 mb-12 max-w-sm w-full">
          {[{ icon: '🔥', label: 'Streaks' }, { icon: '🏆', label: 'Leaderboard' }, { icon: '⚡', label: 'Real-time' }].map((f, i) => (
            <motion.div key={f.label} initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.6 + i * 0.1 }} className="glass-card p-4 text-center">
              <span className="text-2xl">{f.icon}</span>
              <p className="text-xs text-gray-400 mt-1">{f.label}</p>
            </motion.div>
          ))}
        </motion.div>

        {/* Login */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.8 }}>
          <LoginButton onClick={login} />
        </motion.div>
        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.2 }}
          className="mt-6 text-xs text-gray-600">
          Free forever • No credit card required
        </motion.p>
      </div>
    </main>
  );
}
