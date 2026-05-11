'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import Navbar from '@/components/Navbar';
import api from '@/lib/api';

interface RoadmapStep {
  _id: string;
  title: string;
  description: string;
  type: 'module' | 'task' | 'external';
  completed?: boolean;
}

interface Roadmap {
  _id: string;
  title: string;
  description: string;
  steps: RoadmapStep[];
}

export default function RoadmapPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [roadmaps, setRoadmaps] = useState<Roadmap[]>([]);
  const [dataLoading, setDataLoading] = useState(true);

  useEffect(() => {
    if (!loading && !user) router.push('/');
  }, [user, loading, router]);

  useEffect(() => {
    const fetchRoadmaps = async () => {
      try {
        const res = await api.get('/api/admin/roadmaps'); // Admin route for now, or create user one
        setRoadmaps(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setDataLoading(false);
      }
    };
    if (user) fetchRoadmaps();
  }, [user]);

  if (loading || !user) return null;

  return (
    <div className="min-h-screen bg-dark-950 text-white">
      <Navbar />
      
      <main className="pt-24 pb-12 px-4 max-w-4xl mx-auto">
        <header className="mb-12 text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <h1 className="text-4xl sm:text-5xl font-black italic tracking-tighter mb-4">
              LEARNING <span className="text-neon-purple">ROADMAPS</span>
            </h1>
            <p className="text-gray-500 font-bold uppercase text-[10px] tracking-[0.3em]">
              Master the art of AI & Coding step by step
            </p>
          </motion.div>
        </header>

        {dataLoading ? (
          <div className="flex justify-center py-20">
            <div className="w-10 h-10 border-2 border-neon-purple border-t-transparent rounded-full animate-spin shadow-[0_0_15px_rgba(124,58,237,0.5)]" />
          </div>
        ) : (
          <div className="space-y-12 relative">
            {/* Connection Line */}
            <div className="absolute left-[23px] top-10 bottom-10 w-0.5 bg-gradient-to-b from-neon-purple via-neon-blue to-transparent opacity-20 hidden sm:block" />

            {roadmaps.map((roadmap) => (
              <div key={roadmap._id} className="space-y-8">
                <div className="flex items-center gap-4 mb-8">
                  <div className="w-12 h-12 rounded-2xl bg-neon-purple/20 flex items-center justify-center border border-neon-purple/30">
                    <span className="text-xl font-black">🏁</span>
                  </div>
                  <div>
                    <h2 className="text-2xl font-black italic">{roadmap.title}</h2>
                    <p className="text-xs text-gray-500">{roadmap.description}</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-6 ml-0 sm:ml-12">
                  {roadmap.steps.map((step, idx) => (
                    <motion.div
                      key={step._id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.1 }}
                      className="glass-card p-6 flex items-center gap-6 group hover:border-neon-purple/40 transition-all cursor-pointer relative"
                    >
                      <div className="absolute -left-[53px] top-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-dark-900 border-2 border-neon-purple z-10 hidden sm:block" />
                      
                      <div className="w-10 h-10 rounded-full bg-dark-800 flex items-center justify-center text-xs font-black group-hover:bg-neon-purple group-hover:text-white transition-all">
                        {idx + 1}
                      </div>
                      
                      <div className="flex-1">
                        <div className="flex justify-between items-start mb-1">
                          <h3 className="font-bold text-white group-hover:text-neon-purple transition-colors">{step.title}</h3>
                          <span className={`text-[9px] font-black px-2 py-0.5 rounded uppercase border ${
                            step.type === 'module' ? 'border-neon-purple text-neon-purple' : 'border-neon-blue text-neon-blue'
                          }`}>
                            {step.type}
                          </span>
                        </div>
                        <p className="text-[11px] text-gray-500 line-clamp-1">{step.description}</p>
                      </div>
                      
                      <button className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <span className="text-xs">→</span>
                      </button>
                    </motion.div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      <style jsx global>{`
        .glass-card {
          background: rgba(255, 255, 255, 0.02);
          backdrop-filter: blur(12px);
          border: 1px solid rgba(255, 255, 255, 0.05);
          border-radius: 1.25rem;
        }
      `}</style>
    </div>
  );
}
