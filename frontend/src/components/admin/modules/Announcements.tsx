'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import api from '@/lib/api';

interface Announcement {
  _id: string;
  title: string;
  content: string;
  priority: string;
  createdAt: string;
}

export default function Announcements() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [newAnn, setNewAnn] = useState({ title: '', content: '', priority: 'medium' });

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const fetchAnnouncements = async () => {
    try {
      const res = await api.get('/api/admin/announcements');
      setAnnouncements(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handlePost = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/api/admin/announcements', newAnn);
      setIsAdding(false);
      fetchAnnouncements();
      setNewAnn({ title: '', content: '', priority: 'medium' });
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold text-white">Platform Announcements</h2>
        <button 
          onClick={() => setIsAdding(!isAdding)}
          className="bg-neon-purple hover:bg-neon-purple/80 text-white text-xs px-4 py-2 rounded-xl transition-all font-bold"
        >
          {isAdding ? 'Cancel' : 'Broadcast Message'}
        </button>
      </div>

      {isAdding && (
        <motion.form 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          onSubmit={handlePost}
          className="glass-card p-6 space-y-4"
        >
          <input 
            type="text" 
            value={newAnn.title}
            onChange={(e) => setNewAnn({...newAnn, title: e.target.value})}
            className="w-full bg-dark-800 border border-white/5 rounded-xl px-4 py-2.5 text-white outline-none focus:border-neon-purple/50"
            placeholder="Announcement Title"
            required
          />
          <textarea 
            value={newAnn.content}
            onChange={(e) => setNewAnn({...newAnn, content: e.target.value})}
            className="w-full bg-dark-800 border border-white/5 rounded-xl px-4 py-2.5 text-white outline-none focus:border-neon-purple/50 min-h-[100px]"
            placeholder="Write your message here..."
            required
          />
          <div className="flex justify-between items-center">
            <select 
              value={newAnn.priority}
              onChange={(e) => setNewAnn({...newAnn, priority: e.target.value})}
              className="bg-dark-800 border border-white/5 rounded-lg px-3 py-1.5 text-xs text-white outline-none"
            >
              <option value="low">Low Priority</option>
              <option value="medium">Medium Priority</option>
              <option value="high">High Priority</option>
              <option value="urgent">Urgent</option>
            </select>
            <button type="submit" className="bg-neon-purple px-6 py-2 rounded-xl font-bold text-white text-sm">
              Post Announcement
            </button>
          </div>
        </motion.form>
      )}

      {loading ? (
        <div className="flex justify-center py-10">
          <div className="w-6 h-6 border-2 border-neon-purple border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <div className="space-y-4">
          {announcements.map((ann) => (
            <motion.div
              key={ann._id}
              className="glass-card p-5 relative overflow-hidden"
            >
              <div className={`absolute top-0 right-0 w-1 h-full ${
                ann.priority === 'urgent' ? 'bg-red-500' : 
                ann.priority === 'high' ? 'bg-orange-500' : 'bg-neon-purple'
              }`} />
              <div className="flex justify-between items-start mb-2">
                <h3 className="font-bold text-white">{ann.title}</h3>
                <span className="text-[10px] text-gray-500">{new Date(ann.createdAt).toLocaleDateString()}</span>
              </div>
              <p className="text-sm text-gray-400 mb-3 whitespace-pre-wrap">{ann.content}</p>
              <div className="flex gap-2">
                <span className="text-[9px] uppercase font-bold px-2 py-0.5 rounded bg-white/5 text-gray-500 border border-white/5">
                  {ann.priority}
                </span>
              </div>
            </motion.div>
          ))}
          {announcements.length === 0 && !isAdding && (
            <div className="glass-card p-10 text-center text-gray-500">
              No announcements yet.
            </div>
          )}
        </div>
      )}
    </div>
  );
}
