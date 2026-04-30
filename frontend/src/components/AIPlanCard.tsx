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
      const API = process.env.NEXT_PUBLIC_API_URL || 'https://studywar-3.onrender.com';
      const res = await fetch(`${API}/api/ai/plan`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          streak,
          completed: 1, // Simulated aggregates
          missed: 0
        })
      });
      
      if (!res.ok) throw new Error('AI unavailable');
      const data = await res.json();
      
      if (data.reply) {
        const tasks = data.reply.split('\n').filter((t: string) => t.trim().length > 0);
        setPlan(tasks);
      } else {
        setPlan(["AI did not return a plan."]);
      }
    } catch (err) {
      console.error('Failed to fetch daily plan:', err);
      setPlan(["AI unavailable, try again"]);
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
