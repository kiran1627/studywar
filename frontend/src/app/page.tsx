'use client';

import React, { useEffect, useState, useRef } from 'react';
import { motion, useScroll, useTransform, useInView } from 'framer-motion';
import { useAuth } from '@/context/AuthContext';
import LoginButton from '@/components/LoginButton';
import { useRouter } from 'next/navigation';

/* ──────── Typewriter Hook ──────── */
function useTypewriter(words: string[], speed = 100, pause = 2200) {
  const [text, setText] = useState('');
  const [wordIdx, setWordIdx] = useState(0);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const current = words[wordIdx];
    const timeout = setTimeout(() => {
      if (!deleting) {
        setText(current.slice(0, text.length + 1));
        if (text.length + 1 === current.length) setTimeout(() => setDeleting(true), pause);
      } else {
        setText(current.slice(0, text.length - 1));
        if (text.length === 0) { setDeleting(false); setWordIdx((i) => (i + 1) % words.length); }
      }
    }, deleting ? speed / 2 : speed);
    return () => clearTimeout(timeout);
  }, [text, deleting, wordIdx, words, speed, pause]);

  return text;
}

/* ──────── Animated Counter ──────── */
function AnimatedCounter({ target, duration = 2000, suffix = '' }: { target: number; duration?: number; suffix?: string }) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true });

  useEffect(() => {
    if (!isInView) return;
    let start = 0;
    const step = target / (duration / 16);
    const timer = setInterval(() => {
      start += step;
      if (start >= target) { setCount(target); clearInterval(timer); }
      else setCount(Math.floor(start));
    }, 16);
    return () => clearInterval(timer);
  }, [isInView, target, duration]);

  return <span ref={ref} className="stat-number">{count.toLocaleString()}{suffix}</span>;
}

/* ──────── Data ──────── */
const FEATURES = [
  { icon: '🔥', title: 'Streak Engine', desc: 'Build unbreakable habits with daily streaks. Never miss twice.', floatClass: 'feature-float' },
  { icon: '🧠', title: 'Smart Coach', desc: 'Rule-based, instant advice that adapts to your progress. Zero latency.', floatClass: 'feature-float-delay' },
  { icon: '⚡', title: 'XP & Levels', desc: 'Earn 40 XP per session, 10 per problem. Climb from Beginner to Master.', floatClass: 'feature-float-delay2' },
  { icon: '🏆', title: 'Leaderboards', desc: 'Compete with friends in real-time. See who is on top.', floatClass: 'feature-float' },
  { icon: '📋', title: 'Daily Plans', desc: 'Auto-generated task lists based on what you missed and where you are.', floatClass: 'feature-float-delay' },
  { icon: '📡', title: 'Offline Ready', desc: 'PWA-powered. Works without internet. Your progress is always safe.', floatClass: 'feature-float-delay2' },
];

const LEVELS = [
  { name: 'Beginner', range: '0–99 XP', width: '15%', color: 'from-gray-500 to-gray-400' },
  { name: 'Intermediate', range: '100–299 XP', width: '40%', color: 'from-blue-500 to-cyan-400' },
  { name: 'Pro', range: '300–699 XP', width: '70%', color: 'from-purple-500 to-pink-400' },
  { name: 'Master', range: '700+ XP', width: '100%', color: 'from-yellow-400 to-orange-500' },
];

const TESTIMONIALS = [
  { name: 'Arjun S.', streak: 42, quote: 'StudyWar turned my chaotic study into a game. 42-day streak and counting!' },
  { name: 'Priya K.', streak: 28, quote: 'The Smart Coach tells me exactly what I need. No fluff, just action.' },
  { name: 'Rahul M.', streak: 65, quote: 'I went from Beginner to Pro in 2 months. The XP system is addictive.' },
];

/* ──────── MAIN PAGE ──────── */
export default function HomePage() {
  const { user, loading, login } = useAuth();
  const router = useRouter();
  const heroTyped = useTypewriter(['Build Streaks.', 'Crush Goals.', 'Level Up.', 'Become Unstoppable.'], 80, 1800);

  const { scrollYProgress } = useScroll();
  const heroOpacity = useTransform(scrollYProgress, [0, 0.15], [1, 0]);
  const heroScale = useTransform(scrollYProgress, [0, 0.15], [1, 0.95]);

  useEffect(() => { if (!loading && user) router.push('/dashboard'); }, [user, loading, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-dark-900">
        <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          className="w-10 h-10 border-2 border-neon-purple border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-dark-900 text-white overflow-x-hidden">

      {/* ═══════════════════════ SECTION 1 : HERO ═══════════════════════ */}
      <motion.section style={{ opacity: heroOpacity, scale: heroScale }}
        className="relative min-h-screen flex flex-col items-center justify-center px-4 overflow-hidden">

        {/* Animated gradient background */}
        <div className="absolute inset-0 gradient-shift" />
        <div className="absolute inset-0 bg-grid opacity-40" />

        {/* Floating ambient orbs */}
        <div className="absolute top-1/4 left-[10%] w-80 h-80 bg-neon-purple/10 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute bottom-1/4 right-[10%] w-80 h-80 bg-neon-blue/10 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-neon-pink/5 rounded-full blur-[160px] pointer-events-none" />

        {/* Particles */}
        {[...Array(10)].map((_, i) => (
          <div key={i} className="particle" style={{
            left: `${8 + i * 9}%`, animationDelay: `${i * 0.8}s`,
            background: i % 3 === 0 ? 'var(--neon-purple)' : i % 3 === 1 ? 'var(--neon-blue)' : 'var(--neon-pink)',
          }} />
        ))}

        {/* ── Hero Logo with orbiting rings ── */}
        <div className="relative z-10 mb-8">
          <div className="relative w-44 h-44 sm:w-56 sm:h-56 flex items-center justify-center">
            {/* Orbit ring 1 */}
            <div className="orbit-ring w-full h-full top-1/2 left-1/2" style={{ width: '100%', height: '100%' }}>
              <div className="orbit-dot" style={{ top: 0, left: '50%', transform: 'translate(-50%, -50%)' }} />
            </div>
            {/* Orbit ring 2 */}
            <div className="orbit-ring-reverse" style={{ width: '130%', height: '130%', top: '50%', left: '50%' }}>
              <div className="orbit-dot-blue" style={{ bottom: 0, right: '10%', position: 'absolute' }} />
            </div>
            {/* Logo */}
            <motion.img
              src="/icons/app logo.png" alt="StudyWar Logo"
              initial={{ scale: 0, rotate: -15 }} animate={{ scale: 1, rotate: 0 }}
              transition={{ type: 'spring', stiffness: 150, delay: 0.3 }}
              className="w-28 h-28 sm:w-36 sm:h-36 drop-shadow-[0_0_40px_rgba(124,58,237,0.6)] relative z-10"
            />
          </div>
        </div>

        {/* ── Heading ── */}
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.2 }}
          className="relative z-10 text-center max-w-3xl">
          <h1 className="text-5xl sm:text-7xl lg:text-8xl font-black mb-4 tracking-tight">
            <span className="neon-text">StudyWar</span>
          </h1>
          <p className="text-lg sm:text-2xl text-gray-400 mb-2 leading-relaxed">
            Gamify your coding journey. Compete. Conquer.
          </p>
          {/* Typewriter */}
          <div className="h-10 flex items-center justify-center">
            <span className="text-xl sm:text-2xl font-semibold text-white/90 typewriter-cursor">{heroTyped}</span>
          </div>
        </motion.div>

        {/* ── Quick stats ── */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}
          className="relative z-10 grid grid-cols-3 gap-6 sm:gap-12 mt-10 mb-12">
          {[
            { value: 500, suffix: '+', label: 'Active Warriors' },
            { value: 12000, suffix: '+', label: 'Problems Solved' },
            { value: 98, suffix: '%', label: 'Uptime' },
          ].map((s) => (
            <div key={s.label} className="text-center">
              <div className="text-3xl sm:text-4xl font-black"><AnimatedCounter target={s.value} suffix={s.suffix} /></div>
              <p className="text-xs sm:text-sm text-gray-500 mt-1">{s.label}</p>
            </div>
          ))}
        </motion.div>

        {/* ── CTA ── */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.9 }}
          className="relative z-10">
          <LoginButton onClick={login} />
          <p className="text-center mt-4 text-xs text-gray-600">Free forever • No credit card • Instant start</p>
        </motion.div>

        {/* ── Scroll indicator ── */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 scroll-indicator">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="text-gray-500">
            <path d="M12 5v14m0 0l-6-6m6 6l6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
      </motion.section>

      {/* ═══════════════════════ SECTION 2 : FEATURES ═══════════════════════ */}
      <section className="relative py-24 sm:py-32 px-4">
        <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-neon-purple/30 to-transparent" />

        <div className="max-w-6xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: '-100px' }}
            transition={{ duration: 0.7 }} className="text-center mb-16">
            <h2 className="text-3xl sm:text-5xl font-black mb-4">
              Everything You Need to <span className="neon-text">Dominate</span>
            </h2>
            <p className="text-gray-400 text-lg max-w-xl mx-auto">No AI APIs. No latency. Pure local intelligence that works offline.</p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {FEATURES.map((f, i) => (
              <motion.div
                key={f.title}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-50px' }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className={`glass-card shimmer-card p-6 sm:p-8 ${f.floatClass} group cursor-default`}
              >
                <div className="text-4xl mb-4 group-hover:scale-110 transition-transform duration-300">{f.icon}</div>
                <h3 className="text-lg font-bold text-white mb-2">{f.title}</h3>
                <p className="text-sm text-gray-400 leading-relaxed">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════ SECTION 3 : XP & LEVELS ═══════════════════════ */}
      <section className="relative py-24 sm:py-32 px-4">
        <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-neon-blue/30 to-transparent" />
        <div className="absolute top-1/2 right-0 w-96 h-96 bg-neon-purple/5 rounded-full blur-[150px] pointer-events-none" />

        <div className="max-w-4xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: '-100px' }}
            transition={{ duration: 0.7 }} className="text-center mb-16">
            <h2 className="text-3xl sm:text-5xl font-black mb-4">
              Your <span className="neon-text">Progression</span> Path
            </h2>
            <p className="text-gray-400 text-lg max-w-xl mx-auto">Earn XP for every session and problem. Watch yourself level up.</p>
          </motion.div>

          {/* XP Breakdown */}
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            transition={{ duration: 0.5 }} className="grid grid-cols-2 gap-4 mb-12 max-w-md mx-auto">
            <div className="glass-card p-5 text-center">
              <div className="text-3xl font-black text-neon-blue">+40</div>
              <p className="text-xs text-gray-400 mt-1">XP per Session</p>
            </div>
            <div className="glass-card p-5 text-center">
              <div className="text-3xl font-black text-neon-purple">+10</div>
              <p className="text-xs text-gray-400 mt-1">XP per Problem</p>
            </div>
          </motion.div>

          {/* Level bars */}
          <div className="space-y-6">
            {LEVELS.map((lvl, i) => (
              <motion.div key={lvl.name}
                initial={{ opacity: 0, x: -40 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.15 }}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-bold text-white">{lvl.name}</span>
                  <span className="text-xs text-gray-500">{lvl.range}</span>
                </div>
                <div className="w-full h-3 bg-dark-700 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    whileInView={{ width: lvl.width }}
                    viewport={{ once: true }}
                    transition={{ duration: 1.5, delay: 0.3 + i * 0.15, ease: 'easeOut' }}
                    className={`h-full rounded-full bg-gradient-to-r ${lvl.color} shadow-lg`}
                  />
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════ SECTION 4 : HOW IT WORKS ═══════════════════════ */}
      <section className="relative py-24 sm:py-32 px-4">
        <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-neon-pink/30 to-transparent" />

        <div className="max-w-5xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: '-100px' }}
            transition={{ duration: 0.7 }} className="text-center mb-16">
            <h2 className="text-3xl sm:text-5xl font-black mb-4">
              How <span className="neon-text">StudyWar</span> Works
            </h2>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { step: '01', title: 'Sign In', desc: 'One-click Google login. No forms, no friction.', icon: '🔐' },
              { step: '02', title: 'Get Your Plan', desc: 'Smart Coach generates your personalized daily tasks instantly.', icon: '📋' },
              { step: '03', title: 'Level Up', desc: 'Complete sessions, solve problems, earn XP and climb the ranks.', icon: '🚀' },
            ].map((s, i) => (
              <motion.div key={s.step}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: i * 0.2 }}
                className="relative text-center">
                <div className="text-6xl font-black text-dark-700 absolute -top-6 left-1/2 -translate-x-1/2 select-none">{s.step}</div>
                <div className="glass-card p-8 pt-10 relative z-10">
                  <div className="text-4xl mb-4">{s.icon}</div>
                  <h3 className="text-lg font-bold mb-2 text-white">{s.title}</h3>
                  <p className="text-sm text-gray-400">{s.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════ SECTION 5 : TESTIMONIALS ═══════════════════════ */}
      <section className="relative py-24 sm:py-32 px-4">
        <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-neon-green/30 to-transparent" />
        <div className="absolute bottom-1/4 left-0 w-80 h-80 bg-neon-green/5 rounded-full blur-[150px] pointer-events-none" />

        <div className="max-w-5xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: '-100px' }}
            transition={{ duration: 0.7 }} className="text-center mb-16">
            <h2 className="text-3xl sm:text-5xl font-black mb-4">
              Warriors <span className="neon-text">Love It</span>
            </h2>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {TESTIMONIALS.map((t, i) => (
              <motion.div key={t.name}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.15 }}
                className="glass-card shimmer-card p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-full bg-neon-purple/20 border border-neon-purple/40 flex items-center justify-center">
                    <span className="text-sm font-bold text-neon-purple">{t.name.charAt(0)}</span>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-white">{t.name}</p>
                    <p className="text-xs text-orange-400">🔥 {t.streak}-day streak</p>
                  </div>
                </div>
                <p className="text-sm text-gray-300 leading-relaxed italic">&ldquo;{t.quote}&rdquo;</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════ SECTION 6 : FINAL CTA ═══════════════════════ */}
      <section className="relative py-32 sm:py-40 px-4">
        <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-neon-purple/30 to-transparent" />
        <div className="absolute inset-0 gradient-shift opacity-50" />

        {/* Ambient glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-neon-purple/8 rounded-full blur-[180px] pointer-events-none" />

        <div className="relative z-10 max-w-2xl mx-auto text-center">
          <motion.div initial={{ opacity: 0, scale: 0.9 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }}
            transition={{ duration: 0.8 }}>
            <h2 className="text-4xl sm:text-6xl font-black mb-6">
              Ready to <span className="neon-text">Declare War</span> on Mediocrity?
            </h2>
            <p className="text-lg text-gray-400 mb-10">Join hundreds of warriors who are leveling up every single day.</p>
            <LoginButton onClick={login} />
            <p className="mt-6 text-xs text-gray-600">No API costs • Works offline • Forever free</p>
          </motion.div>
        </div>
      </section>

      {/* ═══════════════════════ FOOTER ═══════════════════════ */}
      <footer className="relative py-8 px-4 border-t border-white/5">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <img src="/icons/app logo.png" alt="SW" className="w-6 h-6 opacity-60" />
            <span className="text-sm text-gray-500">StudyWar © {new Date().getFullYear()}</span>
          </div>
          <div className="flex items-center gap-6 text-xs text-gray-600">
            <span>Built with 💜 for warriors</span>
            <span>•</span>
            <span>Offline-first</span>
            <span>•</span>
            <span>Zero external APIs</span>
          </div>
        </div>
      </footer>
    </main>
  );
}
