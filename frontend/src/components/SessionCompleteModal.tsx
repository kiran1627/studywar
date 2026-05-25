'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '@/lib/api';
import { useAuth } from '@/context/AuthContext';

interface SessionCompleteModalProps {
  isOpen: boolean;
  sessionType: 'morning' | 'evening';
  focusMinutes: number;
  onClose: () => void;
  onSaved: () => void;
}

const TOPIC_SUGGESTIONS = [
  'DSA', 'Arrays & Strings', 'Linked Lists', 'Trees & Graphs',
  'Dynamic Programming', 'Backend', 'Python', 'JavaScript',
  'Machine Learning', 'System Design', 'Database', 'React/Next.js',
  'HackerRank', 'LeetCode', 'Math & Logic', 'Other',
];

const SessionCompleteModal: React.FC<SessionCompleteModalProps> = ({
  isOpen,
  sessionType,
  focusMinutes,
  onClose,
  onSaved,
}) => {
  const { refreshUser } = useAuth();
  const [problems, setProblems] = useState(0);
  const [topic, setTopic] = useState('');
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');
  const [xpPreview, setXpPreview] = useState(20);

  useEffect(() => {
    setXpPreview(20 + problems * 5);
  }, [problems]);

  // Reset state when modal opens
  useEffect(() => {
    if (isOpen) {
      setProblems(0);
      setTopic('');
      setNotes('');
      setSaving(false);
      setSaved(false);
      setError('');
    }
  }, [isOpen]);

  const handleSave = async () => {
    setSaving(true);
    setError('');
    try {
      await api.post('/api/focus-sessions', {
        sessionType,
        focusMinutes,
        problemsSolved: problems,
        topic: topic || 'General',
        notes,
      });
      await refreshUser();
      setSaved(true);
      setTimeout(() => {
        onSaved();
      }, 1800);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to save session');
    } finally {
      setSaving(false);
    }
  };

  const incrementProblems = () => setProblems(p => Math.min(p + 1, 99));
  const decrementProblems = () => setProblems(p => Math.max(p - 1, 0));

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[100] flex items-center justify-center p-4"
        style={{ backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)' }}
      >
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="absolute inset-0 bg-black/70"
          onClick={!saving && !saved ? onClose : undefined}
        />

        {/* Ambient glows */}
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-[#7c3aed]/20 rounded-full blur-[100px] pointer-events-none" />
        <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-[#00d4ff]/15 rounded-full blur-[100px] pointer-events-none" />

        {/* Modal Content */}
        <motion.div
          initial={{ scale: 0.85, opacity: 0, y: 40 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.85, opacity: 0, y: 40 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="relative z-10 w-full max-w-md"
        >
          <div className="bg-[#0d0d14]/95 border border-white/10 rounded-3xl p-6 sm:p-8 shadow-2xl shadow-[#7c3aed]/10">
            {/* Success State */}
            {saved ? (
              <motion.div
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="text-center py-8"
              >
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', damping: 10, stiffness: 200, delay: 0.1 }}
                  className="text-6xl mb-4"
                >
                  🎉
                </motion.div>
                <h2 className="text-2xl font-black text-white mb-2">Session Saved!</h2>
                <div className="flex items-center justify-center gap-2 mb-3">
                  <motion.span
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.3 }}
                    className="text-3xl font-black text-[#00ff88]"
                  >
                    +{xpPreview} XP
                  </motion.span>
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: [0, 1.3, 1] }}
                    transition={{ delay: 0.5 }}
                    className="text-2xl"
                  >
                    ⚡
                  </motion.span>
                </div>
                <p className="text-sm text-gray-400">Keep the momentum going!</p>

                {/* Sparkle particles */}
                {Array.from({ length: 8 }).map((_, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 1, scale: 0 }}
                    animate={{
                      opacity: 0,
                      scale: 1,
                      x: (Math.random() - 0.5) * 200,
                      y: (Math.random() - 0.5) * 200,
                    }}
                    transition={{ duration: 1, delay: 0.2 + i * 0.05 }}
                    className="absolute top-1/3 left-1/2 w-2 h-2 rounded-full"
                    style={{ background: ['#7c3aed', '#00d4ff', '#00ff88', '#f97316'][i % 4] }}
                  />
                ))}
              </motion.div>
            ) : (
              <>
                {/* Header */}
                <div className="text-center mb-6">
                  <motion.div
                    initial={{ y: -10, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#00ff88]/10 border border-[#00ff88]/20 mb-4"
                  >
                    <span className="text-sm">✅</span>
                    <span className="text-xs font-bold text-[#00ff88] uppercase tracking-wider">Session Complete</span>
                  </motion.div>
                  <h2 className="text-xl sm:text-2xl font-black text-white">
                    {sessionType === 'morning' ? '☀️ Morning' : '🌙 Evening'} Focus Done!
                  </h2>
                  <p className="text-xs text-gray-500 mt-1">
                    {focusMinutes > 0 ? `${focusMinutes} min of focused study` : 'Report your progress below'}
                  </p>
                </div>

                {/* Problems Counter — Touch-friendly */}
                <div className="mb-5">
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 block">
                    Problems Solved
                  </label>
                  <div className="flex items-center justify-center gap-4">
                    <motion.button
                      whileTap={{ scale: 0.9 }}
                      onClick={decrementProblems}
                      className="w-12 h-12 rounded-xl bg-[#2e2e3a] border border-white/10 text-white text-xl font-bold flex items-center justify-center active:bg-[#3e3e4a] transition-colors"
                    >
                      −
                    </motion.button>
                    <div className="w-20 text-center">
                      <input
                        type="number"
                        min="0"
                        max="99"
                        value={problems}
                        onChange={(e) => setProblems(Math.max(0, Math.min(99, parseInt(e.target.value) || 0)))}
                        className="w-full text-center text-3xl font-black text-white bg-transparent border-none outline-none appearance-none [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                      />
                    </div>
                    <motion.button
                      whileTap={{ scale: 0.9 }}
                      onClick={incrementProblems}
                      className="w-12 h-12 rounded-xl bg-[#7c3aed]/20 border border-[#7c3aed]/30 text-[#7c3aed] text-xl font-bold flex items-center justify-center active:bg-[#7c3aed]/30 transition-colors"
                    >
                      +
                    </motion.button>
                  </div>
                </div>

                {/* Topic Selection */}
                <div className="mb-5">
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 block">
                    Topic Studied
                  </label>
                  <div className="flex flex-wrap gap-1.5 mb-2">
                    {TOPIC_SUGGESTIONS.slice(0, 8).map((t) => (
                      <button
                        key={t}
                        onClick={() => setTopic(t)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                          topic === t
                            ? 'bg-[#7c3aed]/20 text-[#7c3aed] border border-[#7c3aed]/40'
                            : 'bg-[#1a1a24] text-gray-400 border border-white/5 hover:border-white/15'
                        }`}
                      >
                        {t}
                      </button>
                    ))}
                  </div>
                  <input
                    type="text"
                    placeholder="Or type a custom topic..."
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl bg-[#1a1a24] border border-white/10 text-white text-sm placeholder-gray-600 focus:border-[#7c3aed]/50 focus:outline-none transition-colors"
                  />
                </div>

                {/* Notes */}
                <div className="mb-5">
                  <div className="flex justify-between items-center mb-2">
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                      Notes <span className="text-gray-600 font-normal normal-case">(optional)</span>
                    </label>
                    <span className="text-[10px] text-gray-600">{notes.length}/280</span>
                  </div>
                  <textarea
                    placeholder="What did you learn today? Any breakthroughs?"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value.slice(0, 280))}
                    rows={3}
                    className="w-full px-4 py-3 rounded-xl bg-[#1a1a24] border border-white/10 text-white text-sm placeholder-gray-600 focus:border-[#7c3aed]/50 focus:outline-none resize-none transition-colors"
                  />
                </div>

                {/* XP Preview */}
                <div className="flex items-center justify-between p-3 rounded-xl bg-gradient-to-r from-[#7c3aed]/10 to-[#00d4ff]/10 border border-[#7c3aed]/20 mb-5">
                  <div className="flex items-center gap-2">
                    <span className="text-sm">⚡</span>
                    <span className="text-xs font-bold text-gray-400 uppercase">XP Reward</span>
                  </div>
                  <div className="text-right">
                    <span className="text-xl font-black text-[#00ff88]">+{xpPreview}</span>
                    <span className="text-xs text-gray-500 ml-1">XP</span>
                  </div>
                </div>

                {/* XP Breakdown */}
                <div className="flex gap-4 mb-6 text-[10px] text-gray-500 justify-center">
                  <span>🎯 Session: <span className="text-white font-bold">+20</span></span>
                  <span>🧩 Problems: <span className="text-white font-bold">+{problems * 5}</span></span>
                </div>

                {/* Error */}
                {error && (
                  <motion.p
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-red-400 text-xs text-center mb-4 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2"
                  >
                    {error}
                  </motion.p>
                )}

                {/* Actions */}
                <div className="flex gap-3">
                  <button
                    onClick={onClose}
                    disabled={saving}
                    className="flex-1 px-4 py-3.5 rounded-xl bg-[#2e2e3a] text-gray-400 font-semibold text-sm border border-white/5 hover:bg-[#3e3e4a] transition-colors disabled:opacity-50"
                  >
                    Skip
                  </button>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleSave}
                    disabled={saving}
                    className="flex-[2] px-4 py-3.5 rounded-xl font-bold text-sm text-white disabled:opacity-50 transition-all"
                    style={{
                      background: 'linear-gradient(135deg, #7c3aed 0%, #00d4ff 100%)',
                      boxShadow: '0 4px 20px rgba(124, 58, 237, 0.3)',
                    }}
                  >
                    {saving ? (
                      <span className="flex items-center justify-center gap-2">
                        <motion.span
                          animate={{ rotate: 360 }}
                          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                          className="inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full"
                        />
                        Saving...
                      </span>
                    ) : (
                      'Save Progress 🚀'
                    )}
                  </motion.button>
                </div>
              </>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default SessionCompleteModal;
