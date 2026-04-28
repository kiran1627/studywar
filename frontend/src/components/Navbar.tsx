'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '@/context/AuthContext';

const Navbar: React.FC = () => {
  const { user, logout } = useAuth();
  if (!user) return null;

  return (
    <motion.nav initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }}
      className="fixed top-0 left-0 right-0 z-50 bg-dark-900/80 backdrop-blur-xl border-b border-white/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <motion.div className="flex items-center gap-2" whileHover={{ scale: 1.02 }}>
            <img src="/icons/app logo.png" alt="SW" className="w-8 h-8 drop-shadow-[0_0_10px_rgba(124,58,237,0.5)]" />
            <span className="text-xl font-extrabold neon-text">StudyWar</span>
          </motion.div>
          <div className="flex items-center gap-4">
            <motion.div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-orange-500/10 border border-orange-500/20" whileHover={{ scale: 1.05 }}>
              <span className="text-lg fire-glow">🔥</span>
              <span className="text-sm font-bold text-orange-400">{user.streak}</span>
            </motion.div>
            <div className="flex items-center gap-3">
              <div className="hidden sm:block text-right">
                <p className="text-sm font-medium text-white truncate max-w-[120px]">{user.name}</p>
                <p className="text-xs text-gray-400">{user.score.toLocaleString()} pts</p>
              </div>
              {user.picture ? (
                <img src={user.picture} alt={user.name} className="w-9 h-9 rounded-full border-2 border-neon-purple/50 object-cover" />
              ) : (
                <div className="w-9 h-9 rounded-full bg-neon-purple/20 border-2 border-neon-purple/50 flex items-center justify-center">
                  <span className="text-sm font-bold text-neon-purple">{user.name.charAt(0)}</span>
                </div>
              )}
            </div>
            <motion.button id="logout-btn" onClick={logout} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
              className="px-3 py-1.5 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm font-medium hover:bg-red-500/20 transition-colors cursor-pointer">
              Logout
            </motion.button>
          </div>
        </div>
      </div>
    </motion.nav>
  );
};

export default Navbar;
