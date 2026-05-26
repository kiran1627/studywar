'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '@/lib/api';
import { useAuth } from '@/context/AuthContext';

interface InstituteCompleteModalProps {
  isOpen: boolean;
  focusMinutes: number;
  onClose: () => void;
  onSaved: () => void;
}

const TOPIC_SUGGESTIONS = [
  'DSA', 'Arrays & Strings', 'Linked Lists', 'Trees & Graphs',
  'Dynamic Programming', 'Backend', 'Python', 'JavaScript',
  'Machine Learning', 'System Design', 'Database', 'React/Next.js',
  'HackerRank', 'LeetCode', 'Math & Logic', 'Operating Systems',
];

const DIFFICULTY_LEVELS = [
  { key: 'easy', label: 'Easy', emoji: '🟢', color: '#22c55e', bonus: 0 },
  { key: 'medium', label: 'Medium', emoji: '🟡', color: '#eab308', bonus: 5 },
  { key: 'hard', label: 'Hard', emoji: '🟠', color: '#f97316', bonus: 10 },
  { key: 'expert', label: 'Expert', emoji: '🔴', color: '#ef4444', bonus: 20 },
];

const InstituteCompleteModal: React.FC<InstituteCompleteModalProps> = ({
  isOpen,
  focusMinutes,
  onClose,
  onSaved,
}) => {
  const { refreshUser } = useAuth();
  const [problems, setProblems] = useState(0);
  const [topic, setTopic] = useState('');
  const [notes, setNotes] = useState('');
  const [difficulty, setDifficulty] = useState('medium');
  const [tagInput, setTagInput] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');
  const [aiSummary, setAiSummary] = useState('');
  const [loadingSummary, setLoadingSummary] = useState(false);

  const diffBonus = DIFFICULTY_LEVELS.find(d => d.key === difficulty)?.bonus || 0;
  const xpPreview = 25 + (problems * 5) + diffBonus;

  // Reset state when modal opens
  useEffect(() => {
    if (isOpen) {
      setProblems(0);
      setTopic('');
      setNotes('');
      setDifficulty('medium');
      setTagInput('');
      setTags([]);
      setSaving(false);
      setSaved(false);
      setError('');
      setAiSummary('');
      setLoadingSummary(false);
    }
  }, [isOpen]);

  const addTag = () => {
    const t = tagInput.trim();
    if (t && !tags.includes(t) && tags.length < 10) {
      setTags([...tags, t]);
      setTagInput('');
    }
  };

  const removeTag = (tag: string) => {
    setTags(tags.filter(t => t !== tag));
  };

  const handleTagKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      addTag();
    }
  };

  const handleSave = async () => {
    setSaving(true);
    setError('');
    try {
      const res = await api.post('/api/institute-sessions', {
        focusMinutes,
        problemsSolved: problems,
        topic: topic || 'General',
        notes,
        difficulty,
        tags,
      });

      await refreshUser();
      setSaved(true);

      // Fetch AI summary (it's generated async on backend)
      setLoadingSummary(true);
      setTimeout(async () => {
        try {
          const summaryRes = await api.post(`/api/institute-sessions/${res.data.session._id}/ai-summary`);
          setAiSummary(summaryRes.data.summary);
        } catch {
          setAiSummary('');
        } finally {
          setLoadingSummary(false);
        }
      }, 2000);

      // Auto-close after delay
      setTimeout(() => {
        onSaved();
      }, 6000);
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
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-[#f97316]/20 rounded-full blur-[100px] pointer-events-none" />
        <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-[#fbbf24]/15 rounded-full blur-[100px] pointer-events-none" />

        {/* Modal Content */}
        <motion.div
          initial={{ scale: 0.85, opacity: 0, y: 40 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.85, opacity: 0, y: 40 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="relative z-10 w-full max-w-lg max-h-[90vh] overflow-y-auto custom-scrollbar"
        >
          <div className="bg-[#0d0d14]/95 border border-white/10 rounded-3xl p-6 sm:p-8 shadow-2xl shadow-[#f97316]/10">
            {/* Success State */}
            {saved ? (
              <motion.div
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="text-center py-6"
              >
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', damping: 10, stiffness: 200, delay: 0.1 }}
                  className="text-6xl mb-4"
                >
                  🏛️
                </motion.div>
                <h2 className="text-2xl font-black text-white mb-2">Institute Session Saved!</h2>
                <div className="flex items-center justify-center gap-2 mb-4">
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

                {/* Session stats */}
                <div className="flex justify-center gap-6 mb-5 text-sm text-gray-400">
                  <span>⏱️ {focusMinutes}min</span>
                  <span>🧩 {problems} problems</span>
                  <span className="capitalize">📊 {difficulty}</span>
                </div>

                {/* AI Summary */}
                <div className="bg-[#1a1a24] rounded-xl p-4 border border-white/5 text-left">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-sm">🤖</span>
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">AI Learning Summary</span>
                  </div>
                  {loadingSummary ? (
                    <div className="flex items-center gap-2 py-2">
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                        className="w-4 h-4 border-2 border-[#f97316]/30 border-t-[#f97316] rounded-full"
                      />
                      <span className="text-xs text-gray-500">Generating summary...</span>
                    </div>
                  ) : aiSummary ? (
                    <p className="text-xs text-gray-300 leading-relaxed">{aiSummary}</p>
                  ) : (
                    <p className="text-xs text-gray-500 italic">Summary will appear shortly...</p>
                  )}
                </div>

                <button
                  onClick={onSaved}
                  className="mt-4 px-6 py-2.5 rounded-xl bg-[#f97316]/20 text-[#f97316] border border-[#f97316]/30 font-semibold text-sm hover:bg-[#f97316]/30 transition-colors"
                >
                  Close ✓
                </button>

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
                    style={{ background: ['#f97316', '#fbbf24', '#00ff88', '#00d4ff'][i % 4] }}
                  />
                ))}
              </motion.div>
            ) : (
              <>
                {/* Header */}
                <div className="text-center mb-5">
                  <motion.div
                    initial={{ y: -10, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#f97316]/10 border border-[#f97316]/20 mb-3"
                  >
                    <span className="text-sm">🏛️</span>
                    <span className="text-xs font-bold text-[#f97316] uppercase tracking-wider">Institute Session</span>
                  </motion.div>
                  <h2 className="text-xl sm:text-2xl font-black text-white">Session Complete!</h2>
                  <p className="text-xs text-gray-500 mt-1">
                    {focusMinutes > 0 ? `${focusMinutes} min of focused study` : 'Report your progress below'}
                  </p>
                </div>

                {/* Difficulty Selector */}
                <div className="mb-4">
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 block">
                    Difficulty Level
                  </label>
                  <div className="grid grid-cols-4 gap-2">
                    {DIFFICULTY_LEVELS.map(d => (
                      <button
                        key={d.key}
                        onClick={() => setDifficulty(d.key)}
                        className={`flex flex-col items-center p-2.5 rounded-xl transition-all ${
                          difficulty === d.key
                            ? 'border-2'
                            : 'bg-[#1a1a24] border border-white/5 hover:border-white/15'
                        }`}
                        style={
                          difficulty === d.key
                            ? {
                                background: `${d.color}15`,
                                borderColor: `${d.color}50`,
                              }
                            : undefined
                        }
                      >
                        <span className="text-lg mb-0.5">{d.emoji}</span>
                        <span
                          className="text-[10px] font-bold uppercase"
                          style={{ color: difficulty === d.key ? d.color : '#9ca3af' }}
                        >
                          {d.label}
                        </span>
                        <span className="text-[9px] text-gray-600">+{d.bonus} XP</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Problems Counter */}
                <div className="mb-4">
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 block">
                    Problems Solved
                  </label>
                  <div className="flex items-center justify-center gap-4">
                    <motion.button
                      whileTap={{ scale: 0.9 }}
                      onClick={decrementProblems}
                      className="w-11 h-11 rounded-xl bg-[#2e2e3a] border border-white/10 text-white text-xl font-bold flex items-center justify-center"
                    >
                      −
                    </motion.button>
                    <div className="w-16 text-center">
                      <input
                        type="number"
                        min="0"
                        max="99"
                        value={problems}
                        onChange={(e) => setProblems(Math.max(0, Math.min(99, parseInt(e.target.value) || 0)))}
                        className="w-full text-center text-2xl font-black text-white bg-transparent border-none outline-none appearance-none [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                      />
                    </div>
                    <motion.button
                      whileTap={{ scale: 0.9 }}
                      onClick={incrementProblems}
                      className="w-11 h-11 rounded-xl bg-[#f97316]/20 border border-[#f97316]/30 text-[#f97316] text-xl font-bold flex items-center justify-center"
                    >
                      +
                    </motion.button>
                  </div>
                </div>

                {/* Topic Selection */}
                <div className="mb-4">
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 block">
                    Topic Studied
                  </label>
                  <div className="flex flex-wrap gap-1.5 mb-2">
                    {TOPIC_SUGGESTIONS.slice(0, 8).map(t => (
                      <button
                        key={t}
                        onClick={() => setTopic(t)}
                        className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition-all ${
                          topic === t
                            ? 'bg-[#f97316]/20 text-[#f97316] border border-[#f97316]/40'
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
                    className="w-full px-4 py-2.5 rounded-xl bg-[#1a1a24] border border-white/10 text-white text-sm placeholder-gray-600 focus:border-[#f97316]/50 focus:outline-none transition-colors"
                  />
                </div>

                {/* Tags */}
                <div className="mb-4">
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 block">
                    Tags <span className="text-gray-600 font-normal normal-case">(optional)</span>
                  </label>
                  <div className="flex flex-wrap gap-1.5 mb-2">
                    {tags.map(tag => (
                      <span
                        key={tag}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#f97316]/10 text-[#f97316] text-[11px] font-medium border border-[#f97316]/20"
                      >
                        {tag}
                        <button onClick={() => removeTag(tag)} className="text-[#f97316]/60 hover:text-[#f97316] ml-0.5">×</button>
                      </span>
                    ))}
                  </div>
                  <input
                    type="text"
                    placeholder="Add tags (press Enter)..."
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyDown={handleTagKeyDown}
                    className="w-full px-4 py-2.5 rounded-xl bg-[#1a1a24] border border-white/10 text-white text-sm placeholder-gray-600 focus:border-[#f97316]/50 focus:outline-none transition-colors"
                  />
                </div>

                {/* Notes */}
                <div className="mb-4">
                  <div className="flex justify-between items-center mb-2">
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                      Notes <span className="text-gray-600 font-normal normal-case">(optional)</span>
                    </label>
                    <span className="text-[10px] text-gray-600">{notes.length}/500</span>
                  </div>
                  <textarea
                    placeholder="What did you learn? Any breakthroughs or difficulties?"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value.slice(0, 500))}
                    rows={3}
                    className="w-full px-4 py-2.5 rounded-xl bg-[#1a1a24] border border-white/10 text-white text-sm placeholder-gray-600 focus:border-[#f97316]/50 focus:outline-none resize-none transition-colors"
                  />
                </div>

                {/* XP Preview */}
                <div className="flex items-center justify-between p-3 rounded-xl bg-gradient-to-r from-[#f97316]/10 to-[#fbbf24]/10 border border-[#f97316]/20 mb-4">
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
                <div className="flex gap-4 mb-5 text-[10px] text-gray-500 justify-center flex-wrap">
                  <span>🏛️ Base: <span className="text-white font-bold">+25</span></span>
                  <span>🧩 Problems: <span className="text-white font-bold">+{problems * 5}</span></span>
                  <span>📊 Difficulty: <span className="text-white font-bold">+{diffBonus}</span></span>
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
                    className="flex-1 px-4 py-3 rounded-xl bg-[#2e2e3a] text-gray-400 font-semibold text-sm border border-white/5 hover:bg-[#3e3e4a] transition-colors disabled:opacity-50"
                  >
                    Skip
                  </button>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleSave}
                    disabled={saving}
                    className="flex-[2] px-4 py-3 rounded-xl font-bold text-sm text-white disabled:opacity-50 transition-all"
                    style={{
                      background: 'linear-gradient(135deg, #f97316 0%, #fbbf24 100%)',
                      boxShadow: '0 4px 20px rgba(249, 115, 22, 0.3)',
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

export default InstituteCompleteModal;
