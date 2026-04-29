'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import api from '@/lib/api';

export default function AIPlanCard({ streak }: { streak: number }) {
  const [plan, setPlan] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchPlan = async () => {
    setLoading(true);
    try {
      const res = await api.post('/api/ai/plan', {
        streak,
        completedTasks: 1, // Simulated aggregates
        missedSessions: 0
      });
      setPlan(res.data);
    } catch (err) {
      console.error('Failed to fetch daily plan:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPlan();
  }, []);

  return (
    <div className="bg-dark-800/40 backdrop-blur-xl border border-white/10 rounded-2xl p-6 shadow-lg">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold text-white flex items-center gap-2">
          🧠 Today&apos;s AI Plan
        </h3>
        <button 
          onClick={fetchPlan} 
          disabled={loading} 
          className="text-xs text-neon-purple hover:underline disabled:text-gray-500"
        >
          {loading ? 'Thinking...' : 'Regenerate 🔄'}
        </button>
      </div>

      {loading ? (
        <div className="space-y-2">
          <div className="h-6 bg-dark-700 animate-pulse rounded-md" />
          <div className="h-6 bg-dark-700 animate-pulse rounded-md" />
          <div className="h-6 bg-dark-700 animate-pulse rounded-md" />
        </div>
      ) : (
        <ul className="space-y-3">
          {plan.map((task, i) => (
            <motion.li 
              key={i}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.1 }}
              className="flex items-start gap-2 text-gray-300 text-sm border-l-2 border-neon-blue pl-3 py-1 bg-white/5 rounded-r-md"
            >
              {task}
            </motion.li>
          ))}
        </ul>
      )}
    </div>
  );
}
