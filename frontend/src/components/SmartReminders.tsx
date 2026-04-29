'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function SmartReminders() {
  const [visible, setVisible] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    const checkTimeAndTasks = () => {
      const hour = new Date().getHours();
      
      if (hour >= 21 && hour <= 23) {
        setMessage('🌙 Start evening session! Don\'t break your focus.');
        setVisible(true);
      } else if (hour >= 6 && hour <= 8) {
        setMessage('🌅 Morning sprint window open! Secure early points.');
        setVisible(true);
      } else {
        setVisible(false);
      }
    };

    checkTimeAndTasks();
    const interval = setInterval(checkTimeAndTasks, 60000);
    return () => clearInterval(interval);
  }, []);

  if (!visible) return null;

  return (
    <AnimatePresence>
      <motion.div 
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -50 }}
        className="bg-gradient-to-r from-amber-500 to-orange-600 text-white text-xs font-bold px-4 py-2 rounded-xl shadow-lg border border-amber-400/30 flex justify-between items-center gap-2"
      >
        <span>{message}</span>
        <button onClick={() => setVisible(false)} className="text-white/80 hover:text-white text-sm">✕</button>
      </motion.div>
    </AnimatePresence>
  );
}
