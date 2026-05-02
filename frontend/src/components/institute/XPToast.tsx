'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface XPToastProps {
  xp: number;
  show: boolean;
  onDone: () => void;
}

export default function XPToast({ xp, show, onDone }: XPToastProps) {
  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.8 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -30, scale: 0.6 }}
          transition={{ duration: 0.5 }}
          onAnimationComplete={(definition) => {
            // After the enter animation completes, auto-dismiss after 1.5s
            if (definition === 'animate' || (typeof definition === 'object' && 'opacity' in definition && (definition as { opacity: number }).opacity === 1)) {
              setTimeout(onDone, 1500);
            }
          }}
          className="fixed top-24 left-1/2 -translate-x-1/2 z-[100] pointer-events-none"
        >
          <div className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-dark-800/95 backdrop-blur-xl border border-neon-green/30 shadow-[0_0_40px_rgba(0,255,136,0.2)]">
            <span className="text-2xl">⚡</span>
            <span className="text-lg font-black text-neon-green">+{xp} XP</span>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
