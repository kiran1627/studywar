'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import Navbar from '@/components/Navbar';
import api from '@/lib/api';

interface Note {
  _id: string;
  title: string;
  content: string;
  tags: string[];
  updatedAt: string;
}

export default function NotesPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [notes, setNotes] = useState<Note[]>([]);
  const [dataLoading, setDataLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [newNote, setNewNote] = useState({ title: '', content: '', tags: '' });

  useEffect(() => {
    if (!loading && !user) router.push('/');
  }, [user, loading, router]);

  const fetchNotes = async () => {
    try {
      const res = await api.get('/api/user/notes');
      setNotes(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setDataLoading(false);
    }
  };

  useEffect(() => {
    if (user) fetchNotes();
  }, [user]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/api/user/notes', {
        ...newNote,
        tags: newNote.tags.split(',').map(t => t.trim()).filter(t => t)
      });
      setIsAdding(false);
      setNewNote({ title: '', content: '', tags: '' });
      fetchNotes();
    } catch (err) {
      console.error(err);
    }
  };

  if (loading || !user) return null;

  return (
    <div className="min-h-screen bg-dark-950 text-white selection:bg-neon-purple/30">
      <Navbar />
      
      <main className="pt-24 pb-20 px-4 max-w-6xl mx-auto">
        <header className="mb-12 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
          <div>
            <h1 className="text-4xl font-black italic tracking-tighter uppercase">
              Study <span className="text-neon-purple">Archives</span>
            </h1>
            <p className="text-gray-500 font-bold uppercase text-[10px] tracking-[0.3em] mt-1">
              Your digital neural network of knowledge
            </p>
          </div>
          <button 
            onClick={() => setIsAdding(!isAdding)}
            className="bg-white text-dark-950 px-6 py-2.5 rounded-xl font-black text-xs hover:scale-105 transition-all shadow-lg shadow-white/5 active:scale-95"
          >
            {isAdding ? 'CLOSE' : '+ NEW ENTRY'}
          </button>
        </header>

        <AnimatePresence>
          {isAdding && (
            <motion.form 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              onSubmit={handleSave}
              className="glass-card p-6 mb-12 space-y-4 overflow-hidden"
            >
              <input 
                type="text" 
                value={newNote.title}
                onChange={(e) => setNewNote({...newNote, title: e.target.value})}
                className="w-full bg-dark-900 border border-white/5 rounded-xl px-4 py-3 text-white outline-none focus:border-neon-purple/50 font-bold"
                placeholder="Entry Title..."
                required
              />
              <textarea 
                value={newNote.content}
                onChange={(e) => setNewNote({...newNote, content: e.target.value})}
                className="w-full bg-dark-900 border border-white/5 rounded-xl px-4 py-3 text-white outline-none focus:border-neon-purple/50 min-h-[150px] text-sm"
                placeholder="Start typing your insights..."
                required
              />
              <div className="flex flex-col sm:flex-row gap-4">
                <input 
                  type="text" 
                  value={newNote.tags}
                  onChange={(e) => setNewNote({...newNote, tags: e.target.value})}
                  className="flex-1 bg-dark-900 border border-white/5 rounded-xl px-4 py-3 text-xs text-white outline-none focus:border-neon-purple/50"
                  placeholder="Tags (comma separated)..."
                />
                <button type="submit" className="bg-neon-purple px-10 py-3 rounded-xl font-black text-xs text-white shadow-lg shadow-neon-purple/20">
                  SAVE TO ARCHIVE
                </button>
              </div>
            </motion.form>
          )}
        </AnimatePresence>

        {dataLoading ? (
          <div className="flex justify-center py-20">
            <div className="w-10 h-10 border-2 border-neon-purple border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {notes.map((note, idx) => (
              <motion.div
                key={note._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
                className="glass-card p-6 group hover:border-neon-purple/30 transition-all cursor-pointer flex flex-col h-full"
              >
                <div className="flex justify-between items-start mb-4">
                  <h3 className="font-bold text-white group-hover:text-neon-purple transition-colors">{note.title}</h3>
                  <span className="text-[9px] text-gray-600 font-bold">{new Date(note.updatedAt).toLocaleDateString()}</span>
                </div>
                <p className="text-[11px] text-gray-400 line-clamp-4 mb-6 flex-1 italic leading-relaxed">
                  "{note.content}"
                </p>
                <div className="flex flex-wrap gap-2 pt-4 border-t border-white/5">
                  {note.tags.map(tag => (
                    <span key={tag} className="text-[8px] font-black uppercase text-neon-purple bg-neon-purple/5 px-2 py-0.5 rounded-full border border-neon-purple/10">
                      #{tag}
                    </span>
                  ))}
                </div>
              </motion.div>
            ))}
            {notes.length === 0 && !isAdding && (
              <div className="md:col-span-3 py-20 text-center glass-card border-dashed">
                <p className="text-gray-500 font-bold uppercase tracking-widest text-xs">Archives are empty. Start documenting your journey.</p>
              </div>
            )}
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
