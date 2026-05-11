'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import api from '@/lib/api';

interface Badge {
  _id: string;
  name: string;
  description: string;
  icon: string;
  rarity: string;
  color: string;
}

export default function BadgeManager() {
  const [badges, setBadges] = useState<Badge[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [newBadge, setNewBadge] = useState({
    name: '',
    description: '',
    icon: '🏆',
    rarity: 'common',
    color: '#7c3aed'
  });

  useEffect(() => {
    fetchBadges();
  }, []);

  const fetchBadges = async () => {
    try {
      const res = await api.get('/api/admin/badges');
      setBadges(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/api/admin/badges', newBadge);
      setIsAdding(false);
      fetchBadges();
      setNewBadge({ name: '', description: '', icon: '🏆', rarity: 'common', color: '#7c3aed' });
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold text-white">Badge Management</h2>
        <button 
          onClick={() => setIsAdding(!isAdding)}
          className="bg-neon-purple hover:bg-neon-purple/80 text-white text-xs px-4 py-2 rounded-xl transition-all font-bold"
        >
          {isAdding ? 'Cancel' : '+ Create Badge'}
        </button>
      </div>

      {isAdding && (
        <motion.form 
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          onSubmit={handleAdd}
          className="glass-card p-6 space-y-4 overflow-hidden"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[10px] text-gray-500 uppercase font-bold ml-1">Badge Name</label>
              <input 
                type="text" 
                value={newBadge.name}
                onChange={(e) => setNewBadge({...newBadge, name: e.target.value})}
                className="w-full bg-dark-800 border border-white/5 rounded-xl px-4 py-2.5 text-white focus:border-neon-purple/50 outline-none transition-all"
                placeholder="e.g. Early Bird"
                required
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] text-gray-500 uppercase font-bold ml-1">Icon (Emoji or URL)</label>
              <input 
                type="text" 
                value={newBadge.icon}
                onChange={(e) => setNewBadge({...newBadge, icon: e.target.value})}
                className="w-full bg-dark-800 border border-white/5 rounded-xl px-4 py-2.5 text-white focus:border-neon-purple/50 outline-none transition-all"
                required
              />
            </div>
          </div>
          <div className="space-y-1">
            <label className="text-[10px] text-gray-500 uppercase font-bold ml-1">Description</label>
            <textarea 
              value={newBadge.description}
              onChange={(e) => setNewBadge({...newBadge, description: e.target.value})}
              className="w-full bg-dark-800 border border-white/5 rounded-xl px-4 py-2.5 text-white focus:border-neon-purple/50 outline-none transition-all resize-none"
              placeholder="How to earn this badge..."
              rows={2}
              required
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[10px] text-gray-500 uppercase font-bold ml-1">Rarity</label>
              <select 
                value={newBadge.rarity}
                onChange={(e) => setNewBadge({...newBadge, rarity: e.target.value})}
                className="w-full bg-dark-800 border border-white/5 rounded-xl px-4 py-2.5 text-white focus:border-neon-purple/50 outline-none transition-all"
              >
                <option value="common">Common</option>
                <option value="rare">Rare</option>
                <option value="epic">Epic</option>
                <option value="legendary">Legendary</option>
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-[10px] text-gray-500 uppercase font-bold ml-1">Color Theme</label>
              <input 
                type="color" 
                value={newBadge.color}
                onChange={(e) => setNewBadge({...newBadge, color: e.target.value})}
                className="w-full h-11 bg-dark-800 border border-white/5 rounded-xl px-1 py-1 outline-none transition-all cursor-pointer"
              />
            </div>
          </div>
          <button type="submit" className="w-full bg-neon-purple py-3 rounded-xl font-bold text-white shadow-lg shadow-neon-purple/20">
            Save Badge
          </button>
        </motion.form>
      )}

      {loading ? (
        <div className="flex justify-center py-10">
          <div className="w-6 h-6 border-2 border-neon-purple border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {badges.map((badge) => (
            <motion.div
              key={badge._id}
              whileHover={{ y: -5 }}
              className="glass-card p-4 text-center group relative overflow-hidden"
            >
              <div 
                className="absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity"
                style={{ backgroundColor: badge.color }}
              />
              <div className="text-4xl mb-3">{badge.icon}</div>
              <h3 className="font-bold text-white text-sm mb-1">{badge.name}</h3>
              <p className="text-[10px] text-gray-500 line-clamp-2 mb-2">{badge.description}</p>
              <span 
                className="text-[9px] uppercase font-black px-2 py-0.5 rounded-full"
                style={{ backgroundColor: `${badge.color}20`, color: badge.color }}
              >
                {badge.rarity}
              </span>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
