'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import Navbar from '@/components/Navbar';

const ACCESS_CODE = '1627';
const DRIVE_URL = 'https://drive.google.com/embeddedfolderview?id=1qSC9-6-bRLFWjsxn1VdqfjIemp-5x93T#grid';
const DRIVE_LINK = 'https://drive.google.com/drive/folders/1qSC9-6-bRLFWjsxn1VdqfjIemp-5x93T?usp=sharing';

export default function ClassroomPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  const [accessGranted, setAccessGranted] = useState(false);
  const [code, setCode] = useState(['', '', '', '']);
  const [error, setError] = useState('');
  const [shakeKey, setShakeKey] = useState(0);

  // Auth guard
  useEffect(() => {
    if (!loading && !user) router.push('/');
  }, [user, loading, router]);

  // Auto-focus first input on mount
  useEffect(() => {
    const firstInput = document.getElementById('code-0');
    if (firstInput) firstInput.focus();
  }, []);

  const handleCodeChange = (index: number, value: string) => {
    if (value.length > 1) value = value.slice(-1);
    if (value && !/^\d$/.test(value)) return;

    const newCode = [...code];
    newCode[index] = value;
    setCode(newCode);
    setError('');

    // Auto-focus next input
    if (value && index < 3) {
      const nextInput = document.getElementById(`code-${index + 1}`);
      if (nextInput) nextInput.focus();
    }

    // Auto-submit when all 4 digits are entered
    if (value && index === 3) {
      const fullCode = newCode.join('');
      if (fullCode === ACCESS_CODE) {
        setAccessGranted(true);
      } else {
        setError('Invalid access code. Try again.');
        setShakeKey(prev => prev + 1);
        setTimeout(() => {
          setCode(['', '', '', '']);
          const firstInput = document.getElementById('code-0');
          if (firstInput) firstInput.focus();
        }, 600);
      }
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !code[index] && index > 0) {
      const prevInput = document.getElementById(`code-${index - 1}`);
      if (prevInput) prevInput.focus();
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

      <main className="relative z-10 pt-20 pb-24 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto">
        <AnimatePresence mode="wait">
          {!accessGranted ? (
            /* ═══ ACCESS CODE GATE ═══ */
            <motion.div
              key="gate"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -30, scale: 0.95 }}
              transition={{ duration: 0.5 }}
              className="flex flex-col items-center justify-center min-h-[70vh]"
            >
              {/* Lock icon with pulse */}
              <motion.div
                animate={{
                  boxShadow: [
                    '0 0 20px rgba(124,58,237,0.2)',
                    '0 0 60px rgba(124,58,237,0.4)',
                    '0 0 20px rgba(124,58,237,0.2)',
                  ],
                }}
                transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                className="w-24 h-24 rounded-full bg-dark-800 border border-neon-purple/30 flex items-center justify-center mb-8"
              >
                <span className="text-5xl">🔐</span>
              </motion.div>

              <h1 className="text-2xl sm:text-3xl font-black text-white mb-2 text-center">
                Enter <span className="neon-text">Classroom</span> Code
              </h1>
              <p className="text-sm text-gray-500 mb-10 text-center max-w-md">
                This section is restricted. Enter the 4-digit access code to view classroom materials.
              </p>

              {/* Code input boxes */}
              <motion.div
                key={shakeKey}
                animate={error ? { x: [0, -12, 12, -12, 12, 0] } : {}}
                transition={{ duration: 0.5 }}
                className="flex gap-3 sm:gap-4 mb-6"
              >
                {code.map((digit, i) => (
                  <input
                    key={i}
                    id={`code-${i}`}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleCodeChange(i, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(i, e)}
                    className={`
                      w-16 h-20 sm:w-20 sm:h-24 text-center text-3xl sm:text-4xl font-black rounded-2xl
                      bg-dark-800 border-2 outline-none transition-all duration-300
                      ${digit ? 'border-neon-purple text-neon-purple shadow-[0_0_20px_rgba(124,58,237,0.3)]' : 'border-white/10 text-white'}
                      focus:border-neon-blue focus:shadow-[0_0_30px_rgba(0,212,255,0.3)]
                    `}
                    style={{ caretColor: 'transparent' }}
                  />
                ))}
              </motion.div>

              {/* Error message */}
              <AnimatePresence>
                {error && (
                  <motion.p
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="text-red-400 text-sm font-medium"
                  >
                    {error}
                  </motion.p>
                )}
              </AnimatePresence>

              {/* Hint */}
              <p className="text-xs text-gray-600 mt-8">
                💡 Contact your instructor if you don&apos;t have the code
              </p>
            </motion.div>
          ) : (
            /* ═══ CLASSROOM CONTENT ═══ */
            <motion.div
              key="content"
              initial={{ opacity: 0, y: 30, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.6, ease: 'easeOut' }}
            >
              {/* Header */}
              <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
                <div className="flex items-center gap-3">
                  <motion.span
                    className="text-3xl sm:text-4xl"
                    animate={{ rotateY: [0, 360] }}
                    transition={{ duration: 2, delay: 0.5 }}
                  >
                    📚
                  </motion.span>
                  <div>
                    <h1 className="text-2xl sm:text-3xl font-black text-white">
                      <span className="neon-text">Classroom</span> Materials
                    </h1>
                    <p className="text-sm text-gray-500">
                      Access all study resources and materials
                    </p>
                  </div>
                </div>

                {/* Open in Drive button */}
                <motion.a
                  href={DRIVE_LINK}
                  target="_blank"
                  rel="noopener noreferrer"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-neon-purple to-neon-blue text-white text-sm font-bold shadow-[0_0_20px_rgba(124,58,237,0.3)] hover:shadow-[0_0_30px_rgba(124,58,237,0.5)] transition-shadow flex items-center gap-2 no-underline"
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6" />
                    <polyline points="15 3 21 3 21 9" />
                    <line x1="10" y1="14" x2="21" y2="3" />
                  </svg>
                  Open in Drive
                </motion.a>
              </div>

              {/* Status bar */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="glass-card p-4 mb-6 flex items-center gap-3"
              >
                <div className="w-2 h-2 rounded-full bg-neon-green animate-pulse" />
                <span className="text-sm text-gray-400">
                  Access granted • Viewing shared classroom resources
                </span>
              </motion.div>

              {/* Embedded Drive Folder */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.5 }}
                className="glass-card overflow-hidden"
                style={{ borderRadius: '16px' }}
              >
                <iframe
                  src={DRIVE_URL}
                  title="Classroom Materials"
                  className="w-full border-0"
                  style={{
                    height: 'calc(100vh - 280px)',
                    minHeight: '500px',
                    backgroundColor: '#111118',
                  }}
                  allow="autoplay"
                />
              </motion.div>

              {/* Quick access info */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6 }}
                className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-3"
              >
                {[
                  { icon: '📖', title: 'Study Materials', desc: 'Notes, slides & references' },
                  { icon: '📝', title: 'Assignments', desc: 'Practice problems & projects' },
                  { icon: '🎥', title: 'Recordings', desc: 'Class recordings & tutorials' },
                ].map((item, i) => (
                  <motion.div
                    key={item.title}
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.7 + i * 0.1 }}
                    className="glass-card p-4 text-center"
                  >
                    <span className="text-2xl mb-2 block">{item.icon}</span>
                    <p className="text-sm font-bold text-white">{item.title}</p>
                    <p className="text-xs text-gray-500 mt-1">{item.desc}</p>
                  </motion.div>
                ))}
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}
