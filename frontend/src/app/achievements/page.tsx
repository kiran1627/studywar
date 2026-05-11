'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import Navbar from '@/components/Navbar';
import api from '@/lib/api';

interface Badge {
  _id: string;
  name: string;
  description: string;
  icon: string;
  rarity: string;
  color: string;
}

export default function AchievementsPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [badges, setBadges] = useState<Badge[]>([]);
  const [dataLoading, setDataLoading] = useState(true);

  useEffect(() => {
    if (!loading && !user) router.push('/');
  }, [user, loading, router]);

  useEffect(() => {
    const fetchBadges = async () => {
      try {
        const res = await api.get('/api/admin/badges'); // Use admin for now
        setBadges(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setDataLoading(false);
      }
    };
    if (user) fetchBadges();
  }, [user]);

  if (loading || !user) return null;

  return (
    <div className="min-h-screen bg-dark-950 text-white selection:bg-neon-purple/30">
      <Navbar />
      
      <main className="pt-24 pb-20 px-4 max-w-5xl mx-auto">
        <header className="mb-16 text-center">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <h1 className="text-5xl font-black italic tracking-tighter mb-4 uppercase">
              Hall of <span className="text-neon-purple">Valour</span>
            </h1>
            <p className="text-gray-500 font-bold uppercase text-[10px] tracking-[0.4em]">
              Your milestones, badges, and legendary achievements
            </p>
          </motion.div>
        </header>

        {dataLoading ? (
          <div className="flex justify-center py-20">
            <div className="w-10 h-10 border-2 border-neon-purple border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
            {badges.map((badge, idx) => (
              <motion.div
                key={badge._id}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: idx * 0.05 }}
                whileHover={{ y: -10 }}
                className="glass-card p-6 flex flex-col items-center text-center group cursor-pointer"
              >
                <div className="w-20 h-20 rounded-full bg-white/5 mb-4 flex items-center justify-center text-4xl group-hover:scale-110 transition-all duration-500 relative">
                  <div className="absolute inset-0 rounded-full blur-xl opacity-0 group-hover:opacity-40 transition-opacity" style={{ backgroundColor: badge.color }} />
                  <span className="relative z-10">{badge.icon}</span>
                </div>
                
                <h3 className="font-bold text-sm mb-1 text-white uppercase tracking-tight">{badge.name}</h3>
                <span className="text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full mb-3" style={{ backgroundColor: `${badge.color}20`, color: badge.color }}>
                  {badge.rarity}
                </span>
                
                <p className="text-[10px] text-gray-500 leading-tight opacity-0 group-hover:opacity-100 transition-opacity">
                  {badge.description}
                </p>
              </motion.div>
            ))}
            
            {/* Locked Achievements */}
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="glass-card p-6 flex flex-col items-center text-center opacity-30 grayscale">
                <div className="w-20 h-20 rounded-full bg-white/5 mb-4 flex items-center justify-center text-4xl">
                  <span>🔒</span>
                </div>
                <div className="h-3 w-16 bg-white/10 rounded mb-2" />
                <div className="h-2 w-10 bg-white/10 rounded" />
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
          border-radius: 1.5rem;
        }
      `}</style>
    </div>
  );
}
