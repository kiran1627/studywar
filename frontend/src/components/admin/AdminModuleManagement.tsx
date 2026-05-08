'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '@/lib/api';

interface Module {
  _id: string;
  id: string;
  title: string;
  days: number;
  order: number;
  icon: string;
  description: string;
}

export default function AdminModuleManagement() {
  const [modules, setModules] = useState<Module[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingMod, setEditingMod] = useState<Partial<Module> | null>(null);

  const fetchModules = async () => {
    try {
      const res = await api.get('/api/admin/modules');
      setModules(res.data);
    } catch (err) {
      console.error('Fetch modules error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchModules();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingMod) return;

    try {
      if (editingMod._id) {
        await api.patch(`/api/admin/modules/${editingMod._id}`, editingMod);
      } else {
        await api.post('/api/admin/modules', editingMod);
      }
      setEditingMod(null);
      fetchModules();
    } catch (err) {
      console.error('Save module error:', err);
      alert('Failed to save module');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this module?')) return;
    try {
      await api.delete(`/api/admin/modules/${id}`);
      fetchModules();
    } catch (err) {
      console.error('Delete module error:', err);
    }
  };

  if (loading) {
    return <div className="p-8 text-center text-gray-500">Loading curriculum...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-black text-white">Curriculum Management</h2>
        <button
          onClick={() => setEditingMod({ id: '', title: '', days: 1, order: modules.length + 1, icon: '📚', description: '' })}
          className="bg-neon-blue/20 border border-neon-blue/30 text-neon-blue px-4 py-2 rounded-xl text-sm font-bold hover:bg-neon-blue/30 transition-all"
        >
          + Add Module
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {modules.map((mod, i) => (
          <motion.div
            key={mod._id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="glass-card p-5 group"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <span className="text-2xl p-2 bg-white/5 rounded-xl">{mod.icon}</span>
                <div>
                  <h3 className="font-bold text-white leading-tight">{mod.title}</h3>
                  <p className="text-[10px] text-gray-500 uppercase tracking-widest">{mod.id}</p>
                </div>
              </div>
              <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={() => setEditingMod(mod)}
                  className="p-1.5 bg-white/5 rounded-lg text-gray-400 hover:text-white transition-colors"
                >
                  ✏️
                </button>
                <button
                  onClick={() => handleDelete(mod._id)}
                  className="p-1.5 bg-red-500/10 rounded-lg text-red-500 hover:bg-red-500/20 transition-colors"
                >
                  🗑️
                </button>
              </div>
            </div>
            
            <div className="flex items-center gap-4 text-xs">
              <div className="flex items-center gap-1.5 text-neon-purple">
                <span className="opacity-50">⏱️</span> {mod.days} Days
              </div>
              <div className="flex items-center gap-1.5 text-neon-blue">
                <span className="opacity-50">🔢</span> Order: {mod.order}
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Edit/Add Modal */}
      <AnimatePresence>
        {editingMod && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="glass-card w-full max-w-md p-6"
            >
              <h3 className="text-xl font-black text-white mb-6">
                {editingMod._id ? 'Edit' : 'Add'} Module
              </h3>
              <form onSubmit={handleSave} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] uppercase tracking-wider text-gray-500 font-bold mb-1">ID (Slug)</label>
                    <input
                      type="text"
                      value={editingMod.id}
                      onChange={(e) => setEditingMod({ ...editingMod, id: e.target.value })}
                      className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white text-sm"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] uppercase tracking-wider text-gray-500 font-bold mb-1">Icon</label>
                    <input
                      type="text"
                      value={editingMod.icon}
                      onChange={(e) => setEditingMod({ ...editingMod, icon: e.target.value })}
                      className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white text-sm"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] uppercase tracking-wider text-gray-500 font-bold mb-1">Title</label>
                  <input
                    type="text"
                    value={editingMod.title}
                    onChange={(e) => setEditingMod({ ...editingMod, title: e.target.value })}
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white text-sm"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] uppercase tracking-wider text-gray-500 font-bold mb-1">Days</label>
                    <input
                      type="number"
                      value={editingMod.days}
                      onChange={(e) => setEditingMod({ ...editingMod, days: parseInt(e.target.value) })}
                      className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white text-sm"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] uppercase tracking-wider text-gray-500 font-bold mb-1">Order</label>
                    <input
                      type="number"
                      value={editingMod.order}
                      onChange={(e) => setEditingMod({ ...editingMod, order: parseInt(e.target.value) })}
                      className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white text-sm"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] uppercase tracking-wider text-gray-500 font-bold mb-1">Description</label>
                  <textarea
                    value={editingMod.description}
                    onChange={(e) => setEditingMod({ ...editingMod, description: e.target.value })}
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white text-sm h-20 resize-none"
                  />
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setEditingMod(null)}
                    className="flex-1 px-4 py-2 rounded-lg border border-white/10 text-gray-400 hover:text-white text-sm"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-4 py-2 rounded-lg bg-neon-blue text-white font-bold text-sm"
                  >
                    Save Module
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
