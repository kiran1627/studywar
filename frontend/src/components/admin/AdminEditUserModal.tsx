'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '@/lib/api';

interface User {
  _id: string;
  name: string;
  email: string;
  xp: number;
  streak: number;
  level: number;
  role: string;
}

interface Props {
  user: User;
  isOpen: boolean;
  onClose: () => void;
  onUpdate: () => void;
}

export default function AdminEditUserModal({ user, isOpen, onClose, onUpdate }: Props) {
  const [formData, setFormData] = useState({
    name: user.name,
    xp: user.xp,
    streak: user.streak,
    level: user.level,
    role: user.role,
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.patch(`/api/admin/users/${user._id}`, formData);
      onUpdate();
      onClose();
    } catch (err) {
      console.error('Update user error:', err);
      alert('Failed to update user');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="glass-card w-full max-w-md p-6 relative overflow-hidden"
          >
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-neon-purple to-neon-blue" />
            
            <h2 className="text-xl font-black text-white mb-6 flex items-center gap-2">
              <span>✏️</span> Edit User <span className="text-gray-500 font-normal text-sm ml-auto">{user.email}</span>
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-[10px] uppercase tracking-wider text-gray-500 font-bold mb-1">Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-neon-purple/50 transition-colors"
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-[10px] uppercase tracking-wider text-gray-500 font-bold mb-1">XP</label>
                  <input
                    type="number"
                    value={formData.xp}
                    onChange={(e) => setFormData({ ...formData, xp: parseInt(e.target.value) })}
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-neon-purple/50 transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-[10px] uppercase tracking-wider text-gray-500 font-bold mb-1">Streak</label>
                  <input
                    type="number"
                    value={formData.streak}
                    onChange={(e) => setFormData({ ...formData, streak: parseInt(e.target.value) })}
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-neon-purple/50 transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-[10px] uppercase tracking-wider text-gray-500 font-bold mb-1">Level</label>
                  <input
                    type="number"
                    value={formData.level}
                    onChange={(e) => setFormData({ ...formData, level: parseInt(e.target.value) })}
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-neon-purple/50 transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] uppercase tracking-wider text-gray-500 font-bold mb-1">Role</label>
                <select
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-neon-purple/50 transition-colors appearance-none"
                >
                  <option value="user" className="bg-dark-900">User</option>
                  <option value="admin" className="bg-dark-900">Admin</option>
                </select>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 px-4 py-2 rounded-lg border border-white/10 text-gray-400 hover:text-white hover:bg-white/5 transition-all font-medium text-sm"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 px-4 py-2 rounded-lg bg-neon-purple text-white hover:bg-neon-purple/80 transition-all font-bold text-sm disabled:opacity-50"
                >
                  {loading ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
