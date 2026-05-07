'use client';

import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import LoginButton from '@/components/LoginButton';
import Link from 'next/link';

export default function LoginPage() {
  const { user, loading, login } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && user) {
      router.push('/dashboard');
    }
  }, [user, loading, router]);

  if (loading) {
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
    <main className="min-h-screen bg-dark-900 text-white flex flex-col items-center justify-center px-4 relative overflow-hidden">
      {/* Background Image with Overlay */}
      <div className="absolute inset-0 z-0">
        <img 
          src="/assets/login-bg.png" 
          alt="Login Background" 
          className="w-full h-full object-cover opacity-40"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-dark-900/80 via-dark-900/40 to-dark-900/80" />
      </div>

      {/* Background elements */}
      <div className="absolute inset-0 gradient-shift opacity-20" />
      <div className="absolute inset-0 bg-grid opacity-10" />
      <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-neon-purple/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] bg-neon-blue/10 rounded-full blur-[120px] pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="relative z-10 w-full max-w-md"
      >
        <div className="text-center mb-10">
          <Link href="/" className="inline-block mb-6 group">
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="relative w-20 h-20 mx-auto"
            >
              <div className="absolute inset-0 bg-neon-purple/20 rounded-2xl blur-xl group-hover:bg-neon-purple/30 transition-colors" />
              <img
                src="/icons/app logo.png"
                alt="StudyWar Logo"
                className="relative z-10 w-full h-full drop-shadow-[0_0_15px_rgba(124,58,237,0.5)]"
              />
            </motion.div>
          </Link>
          <h1 className="text-4xl font-black mb-3 tracking-tight">
            Ignite <span className="neon-text">StudyWar</span>
          </h1>
          <p className="text-gray-400">
            Shift into gear and conquer your coding goals.
          </p>
        </div>

        <div className="glass-card p-8 sm:p-10 relative overflow-hidden border border-white/10">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-neon-purple via-neon-blue to-neon-purple" />
          
          <div className="space-y-6">
            <div className="text-center space-y-2">
              <h2 className="text-xl font-bold text-white uppercase tracking-widest">Engine Start</h2>
              <p className="text-sm text-gray-500">Secure access via Google Authentication</p>
            </div>

            <div className="flex justify-center py-4">
              <LoginButton onClick={login} />
            </div>

            <div className="pt-6 border-t border-white/5">
              <p className="text-center text-xs text-gray-600 leading-relaxed">
                By signing in, you agree to our <span className="text-gray-400 cursor-pointer hover:text-white transition-colors">Terms of Service</span> and <span className="text-gray-400 cursor-pointer hover:text-white transition-colors">Privacy Policy</span>.
              </p>
            </div>
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-8 text-center"
        >
          <Link href="/" className="text-sm text-gray-500 hover:text-neon-purple transition-colors flex items-center justify-center gap-2">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Home
          </Link>
        </motion.div>
      </motion.div>

      {/* Footer credit */}
      <div className="absolute bottom-6 text-center w-full opacity-30">
        <p className="text-[10px] tracking-widest uppercase text-gray-500 font-bold">
          StudyWar Engine v2.0 • Zero Latency Auth
        </p>
      </div>
    </main>
  );
}
