'use client';

import React from 'react';
import { motion } from 'framer-motion';

export default function OfflinePage() {
  return (
    <main className="min-h-screen bg-dark-900 flex items-center justify-center px-4">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center">
        <div className="text-7xl mb-6">📡</div>
        <h1 className="text-3xl font-bold text-white mb-3">You&apos;re Offline</h1>
        <p className="text-gray-400 mb-8 max-w-sm">
          It looks like you&apos;ve lost your internet connection. Some features may not be available.
        </p>
        <button onClick={() => window.location.reload()} className="btn-glow">Try Again 🔄</button>
      </motion.div>
    </main>
  );
}
