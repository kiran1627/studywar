'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import api from '@/lib/api';

export default function AdminNotificationControl() {
  const [formData, setFormData] = useState({
    title: '',
    body: '',
    target: 'all',
  });
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setStatus(null);
    try {
      const res = await api.post('/api/admin/notifications', formData);
      setStatus({ type: 'success', message: res.data.message });
      setFormData({ ...formData, title: '', body: '' });
    } catch (err) {
      console.error('Send notification error:', err);
      setStatus({ type: 'error', message: 'Failed to send notification' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="glass-card p-8"
      >
        <div className="flex items-center gap-3 mb-6">
          <span className="text-3xl">🔔</span>
          <div>
            <h2 className="text-2xl font-black text-white">Broadcast Alerts</h2>
            <p className="text-sm text-gray-500">Send push notifications to StudyWar users</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-xs uppercase tracking-widest text-gray-400 font-bold mb-2">Target Audience</label>
            <div className="grid grid-cols-2 gap-3">
              {[
                { id: 'all', label: 'All Users', icon: '🌍' },
                { id: 'active', label: 'Recently Active', icon: '⚡' },
              ].map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setFormData({ ...formData, target: t.id })}
                  className={`flex items-center justify-center gap-2 px-4 py-3 rounded-xl border transition-all ${
                    formData.target === t.id
                      ? 'bg-neon-purple/20 border-neon-purple text-neon-purple shadow-[0_0_15px_rgba(124,58,237,0.2)]'
                      : 'bg-white/5 border-white/10 text-gray-400 hover:border-white/20'
                  }`}
                >
                  <span>{t.icon}</span>
                  <span className="font-bold text-sm">{t.label}</span>
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs uppercase tracking-widest text-gray-400 font-bold mb-2">Notification Title</label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="e.g., Weekend Challenge starting now! 🏆"
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-neon-purple/50 transition-all"
              required
            />
          </div>

          <div>
            <label className="block text-xs uppercase tracking-widest text-gray-400 font-bold mb-2">Message Body</label>
            <textarea
              value={formData.body}
              onChange={(e) => setFormData({ ...formData, body: e.target.value })}
              placeholder="Enter the alert message details here..."
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-neon-purple/50 transition-all h-32 resize-none"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 bg-gradient-to-r from-neon-purple to-neon-blue text-white font-black rounded-xl hover:shadow-[0_0_25px_rgba(124,58,237,0.4)] transition-all disabled:opacity-50 disabled:scale-95 transform active:scale-[0.98]"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <motion.span
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                  className="w-4 h-4 border-2 border-white border-t-transparent rounded-full"
                />
                Sending Broadcast...
              </span>
            ) : (
              'Send Notification Now'
            )}
          </button>

          {status && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`p-4 rounded-xl text-sm font-bold text-center ${
                status.type === 'success' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
              }`}
            >
              {status.message}
            </motion.div>
          )}
        </form>

        <div className="mt-8 p-4 bg-dark-900/50 rounded-xl border border-white/5">
          <h4 className="text-[10px] uppercase tracking-widest text-gray-500 font-bold mb-2">Preview</h4>
          <div className="bg-white/5 rounded-lg p-3">
            <p className="text-white font-bold text-sm">{formData.title || 'Notification Title'}</p>
            <p className="text-gray-400 text-xs mt-1">{formData.body || 'This is how your message will appear on user devices.'}</p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
