'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

/**
 * CinematicIntro — A movie-trailer-style splash that plays once,
 * then fades away to reveal children (the landing page).
 * 
 * Timeline (~5.5s total):
 *   0.0s  – Black screen
 *   0.4s  – Particle burst begins
 *   1.0s  – Logo scales in with energy ring
 *   2.0s  – Title text sweeps in letter-by-letter
 *   3.0s  – Tagline fades in
 *   4.0s  – Horizontal light-streak flashes across
 *   4.8s  – Everything fades to white then clears
 *   5.5s  – Intro unmounts, landing page visible
 */

const TITLE = 'StudyWar';

// Spark particles that burst outward from center
function SparkBurst() {
  const sparks = Array.from({ length: 28 }, (_, i) => {
    const angle = (i / 28) * 360;
    const dist = 120 + Math.random() * 180;
    const x = Math.cos((angle * Math.PI) / 180) * dist;
    const y = Math.sin((angle * Math.PI) / 180) * dist;
    const size = 2 + Math.random() * 3;
    const colors = ['#7c3aed', '#00d4ff', '#ec4899', '#00ff88'];
    const color = colors[i % colors.length];
    return { x, y, size, color, delay: Math.random() * 0.3 };
  });

  return (
    <>
      {sparks.map((s, i) => (
        <motion.div
          key={i}
          className="absolute rounded-full"
          style={{ width: s.size, height: s.size, background: s.color, top: '50%', left: '50%' }}
          initial={{ x: 0, y: 0, opacity: 1, scale: 0 }}
          animate={{ x: s.x, y: s.y, opacity: 0, scale: 1 }}
          transition={{ duration: 1.2, delay: 0.8 + s.delay, ease: 'easeOut' }}
        />
      ))}
    </>
  );
}

export default function CinematicIntro({ children }: { children: React.ReactNode }) {
  const [phase, setPhase] = useState<'intro' | 'done'>('intro');

  useEffect(() => {
    // Check sessionStorage so the intro only plays once per session
    if (sessionStorage.getItem('sw_intro_seen')) {
      setPhase('done');
      return;
    }
    const timer = setTimeout(() => {
      setPhase('done');
      sessionStorage.setItem('sw_intro_seen', '1');
    }, 5500);
    return () => clearTimeout(timer);
  }, []);

  if (phase === 'done') return <>{children}</>;

  return (
    <AnimatePresence>
      <motion.div
        key="cinematic-intro"
        className="fixed inset-0 z-[9999] flex items-center justify-center overflow-hidden"
        style={{ background: '#030305' }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.6 }}
      >
        {/* ── Deep space background ── */}
        <div className="absolute inset-0">
          {/* Radial vignette */}
          <div className="absolute inset-0" style={{
            background: 'radial-gradient(circle at 50% 50%, transparent 30%, rgba(0,0,0,0.7) 100%)'
          }} />

          {/* Pulsing nebula glow */}
          <motion.div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full"
            style={{ background: 'radial-gradient(circle, rgba(124,58,237,0.15) 0%, transparent 70%)' }}
            animate={{ scale: [1, 1.3, 1], opacity: [0.4, 0.8, 0.4] }}
            transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
          />
          <motion.div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] rounded-full"
            style={{ background: 'radial-gradient(circle, rgba(0,212,255,0.1) 0%, transparent 70%)' }}
            animate={{ scale: [1.2, 1, 1.2], opacity: [0.3, 0.6, 0.3] }}
            transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
          />
        </div>

        {/* ── Spark burst particles ── */}
        <SparkBurst />

        {/* ── Energy ring ── */}
        <motion.div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full border-2"
          style={{ borderColor: 'rgba(124,58,237,0.5)', width: 200, height: 200 }}
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: [0, 1.8, 2.2], opacity: [0, 0.8, 0] }}
          transition={{ duration: 1.5, delay: 0.6, ease: 'easeOut' }}
        />
        <motion.div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full border"
          style={{ borderColor: 'rgba(0,212,255,0.4)', width: 160, height: 160 }}
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: [0, 2, 2.5], opacity: [0, 0.6, 0] }}
          transition={{ duration: 1.8, delay: 0.8, ease: 'easeOut' }}
        />

        {/* ── Logo ── */}
        <motion.img
          src="/icons/app logo.png"
          alt="StudyWar"
          className="absolute top-1/2 left-1/2 -translate-x-1/2 w-28 h-28 sm:w-36 sm:h-36 z-10"
          style={{ translateY: '-120%' }}
          initial={{ scale: 0, opacity: 0, rotate: -30 }}
          animate={{ scale: [0, 1.2, 1], opacity: 1, rotate: 0 }}
          transition={{ duration: 0.9, delay: 0.9, ease: [0.22, 1, 0.36, 1] }}
        />

        {/* ── Logo glow pulse ── */}
        <motion.div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 w-40 h-40 rounded-full z-[5]"
          style={{ translateY: '-110%', background: 'radial-gradient(circle, rgba(124,58,237,0.4) 0%, transparent 70%)' }}
          initial={{ opacity: 0 }}
          animate={{ opacity: [0, 0.8, 0.4, 0.7, 0.3] }}
          transition={{ duration: 2, delay: 1.0 }}
        />

        {/* ── Title — letter-by-letter reveal ── */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 translate-y-[20%] z-10 flex">
          {TITLE.split('').map((char, i) => (
            <motion.span
              key={i}
              className="text-5xl sm:text-7xl font-black"
              style={{
                background: 'linear-gradient(135deg, #7c3aed, #00d4ff, #ec4899)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}
              initial={{ opacity: 0, y: 40, rotateX: -90 }}
              animate={{ opacity: 1, y: 0, rotateX: 0 }}
              transition={{ duration: 0.5, delay: 2.0 + i * 0.08, ease: [0.22, 1, 0.36, 1] }}
            >
              {char}
            </motion.span>
          ))}
        </div>

        {/* ── Tagline ── */}
        <motion.p
          className="absolute top-1/2 left-1/2 -translate-x-1/2 translate-y-[120%] sm:translate-y-[100%] z-10 text-sm sm:text-lg text-gray-400 tracking-[0.3em] uppercase whitespace-nowrap"
          initial={{ opacity: 0, letterSpacing: '0.6em' }}
          animate={{ opacity: 1, letterSpacing: '0.3em' }}
          transition={{ duration: 1.2, delay: 3.0, ease: 'easeOut' }}
        >
          Declare War on Mediocrity
        </motion.p>

        {/* ── Horizontal light streak ── */}
        <motion.div
          className="absolute top-1/2 left-0 h-[2px] z-20"
          style={{
            background: 'linear-gradient(90deg, transparent, #7c3aed, #00d4ff, #ec4899, transparent)',
            width: '100vw'
          }}
          initial={{ x: '-100vw', opacity: 0 }}
          animate={{ x: '100vw', opacity: [0, 1, 1, 0] }}
          transition={{ duration: 0.8, delay: 4.0, ease: 'easeInOut' }}
        />

        {/* ── Final white flash & fade out ── */}
        <motion.div
          className="absolute inset-0 z-30"
          style={{ background: 'white' }}
          initial={{ opacity: 0 }}
          animate={{ opacity: [0, 0, 0.6, 0] }}
          transition={{ duration: 1.2, delay: 4.3, ease: 'easeInOut' }}
        />
      </motion.div>
    </AnimatePresence>
  );
}
