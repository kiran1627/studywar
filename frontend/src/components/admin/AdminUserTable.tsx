'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '@/lib/api';
import { MODULES } from '@/lib/instituteData';

interface AdminUser {
  _id: string;
  name: string;
  email: string;
  picture: string;
  score: number;
  streak: number;
  xp: number;
  role: string;
  lastActiveDate: string | null;
  createdAt: string;
  institute: {
    xp: number;
    completedDays: number;
    totalDays: number;
    modulesCompleted: number;
    totalModules: number;
    progress: number;
  };
}

type SortKey = 'name' | 'xp' | 'streak' | 'progress' | 'lastActiveDate';

export default function AdminUserTable({ users, onUpdate }: { users: AdminUser[]; onUpdate?: () => void }) {
  const [sortKey, setSortKey] = useState<SortKey>('xp');
  const [sortAsc, setSortAsc] = useState(false);
  const [search, setSearch] = useState('');

  // Edit Modal State
  const [editingUser, setEditingUser] = useState<AdminUser | null>(null);
  const [selectedModules, setSelectedModules] = useState<Set<string>>(new Set());
  const [isSaving, setIsSaving] = useState(false);
  const [isLoadingUser, setIsLoadingUser] = useState(false);

  const handleSort = (key: SortKey) => {
    if (sortKey === key) setSortAsc(!sortAsc);
    else { setSortKey(key); setSortAsc(false); }
  };

  const filtered = users.filter((u) =>
    u.name.toLowerCase().includes(search.toLowerCase()) ||
    u.email.toLowerCase().includes(search.toLowerCase())
  );

  const sorted = [...filtered].sort((a, b) => {
    let aVal: number | string = 0;
    let bVal: number | string = 0;

    switch (sortKey) {
      case 'name': aVal = a.name.toLowerCase(); bVal = b.name.toLowerCase(); break;
      case 'xp': aVal = a.xp; bVal = b.xp; break;
      case 'streak': aVal = a.streak; bVal = b.streak; break;
      case 'progress': aVal = a.institute.progress; bVal = b.institute.progress; break;
      case 'lastActiveDate': aVal = a.lastActiveDate || ''; bVal = b.lastActiveDate || ''; break;
    }

    if (aVal < bVal) return sortAsc ? -1 : 1;
    if (aVal > bVal) return sortAsc ? 1 : -1;
    return 0;
  });

  const SortIcon = ({ active, asc }: { active: boolean; asc: boolean }) => (
    <span className={`ml-1 text-[10px] ${active ? 'text-neon-purple' : 'text-gray-600'}`}>
      {active ? (asc ? '▲' : '▼') : '⇅'}
    </span>
  );

  const openEditModal = async (u: AdminUser) => {
    setEditingUser(u);
    setIsLoadingUser(true);
    setSelectedModules(new Set());
    
    try {
      const res = await api.get(`/api/admin/users/${u._id}`);
      const userFull = res.data;
      const completedIds = new Set<string>();
      
      const p = userFull.instituteProgress;
      if (p && p.completedDays) {
        MODULES.forEach(m => {
          const days = p.completedDays[m.id] || [];
          if (days.length === m.days.length) {
            completedIds.add(m.id);
          }
        });
      }
      setSelectedModules(completedIds);
    } catch (err) {
      console.error('Failed to fetch user modules', err);
    } finally {
      setIsLoadingUser(false);
    }
  };

  const toggleModule = (id: string) => {
    const next = new Set(selectedModules);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelectedModules(next);
  };

  const saveModules = async () => {
    if (!editingUser) return;
    setIsSaving(true);
    try {
      await api.post(`/api/admin/users/${editingUser._id}/modules`, {
        completedModules: Array.from(selectedModules)
      });
      setEditingUser(null);
      if (onUpdate) onUpdate();
    } catch (err) {
      console.error('Failed to update modules', err);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
      >
        {/* Search */}
        <div className="mb-4">
          <input
            type="text"
            placeholder="Search by name or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full sm:w-80 px-4 py-2.5 rounded-xl bg-dark-800/80 border border-white/5 text-sm text-white placeholder-gray-500 outline-none focus:border-neon-purple/30 transition-colors"
          />
        </div>

        {/* Table */}
        <div className="glass-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/5">
                  {[
                    { key: 'name' as SortKey, label: 'User' },
                    { key: 'xp' as SortKey, label: 'XP' },
                    { key: 'streak' as SortKey, label: 'Streak' },
                    { key: 'progress' as SortKey, label: 'Progress' },
                    { key: 'lastActiveDate' as SortKey, label: 'Last Active' },
                  ].map((col) => (
                    <th
                      key={col.key}
                      onClick={() => handleSort(col.key)}
                      className="text-left px-4 py-3 text-[10px] font-bold uppercase tracking-wider text-gray-400 cursor-pointer hover:text-white transition-colors select-none"
                    >
                      {col.label}
                      <SortIcon active={sortKey === col.key} asc={sortAsc} />
                    </th>
                  ))}
                  <th className="text-left px-4 py-3 text-[10px] font-bold uppercase tracking-wider text-gray-400">
                    Role
                  </th>
                  <th className="text-right px-4 py-3 text-[10px] font-bold uppercase tracking-wider text-gray-400">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {sorted.map((u, i) => (
                  <motion.tr
                    key={u._id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: i * 0.02 }}
                    className="border-b border-white/[0.03] hover:bg-white/[0.02] transition-colors"
                  >
                    {/* User */}
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        {u.picture ? (
                          <img src={u.picture} alt={u.name} className="w-8 h-8 rounded-full object-cover border border-white/10" />
                        ) : (
                          <div className="w-8 h-8 rounded-full bg-neon-purple/20 flex items-center justify-center text-xs font-bold text-neon-purple">
                            {u.name.charAt(0)}
                          </div>
                        )}
                        <div>
                          <p className="text-sm font-medium text-white">{u.name}</p>
                          <p className="text-[10px] text-gray-500">{u.email}</p>
                        </div>
                      </div>
                    </td>

                    {/* XP */}
                    <td className="px-4 py-3">
                      <span className="text-sm font-bold text-neon-blue">{u.xp}</span>
                      {u.institute.xp > 0 && (
                        <span className="text-[10px] text-gray-500 ml-1">({u.institute.xp} inst)</span>
                      )}
                    </td>

                    {/* Streak */}
                    <td className="px-4 py-3">
                      <span className="text-sm font-medium">🔥 {u.streak}</span>
                    </td>

                    {/* Progress */}
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-20 h-1.5 bg-dark-700 rounded-full overflow-hidden">
                          <div
                            className="h-full rounded-full bg-gradient-to-r from-neon-purple to-neon-blue transition-all"
                            style={{ width: `${u.institute.progress}%` }}
                          />
                        </div>
                        <span className="text-[10px] text-gray-400">{u.institute.progress}%</span>
                      </div>
                      <p className="text-[10px] text-gray-500 mt-0.5">
                        {u.institute.modulesCompleted}/{u.institute.totalModules} modules
                      </p>
                    </td>

                    {/* Last Active */}
                    <td className="px-4 py-3">
                      <span className="text-xs text-gray-400">
                        {u.lastActiveDate || 'Never'}
                      </span>
                    </td>

                    {/* Role */}
                    <td className="px-4 py-3">
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          u.role === 'admin'
                            ? 'bg-red-500/10 text-red-400 border border-red-500/20'
                            : 'bg-white/5 text-gray-400'
                        }`}
                      >
                        {u.role}
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="px-4 py-3 text-right">
                      <button 
                        onClick={() => openEditModal(u)}
                        className="px-3 py-1 bg-neon-purple/10 text-neon-purple text-xs font-bold rounded-lg border border-neon-purple/20 hover:bg-neon-purple hover:text-white transition-all cursor-pointer"
                      >
                        Edit
                      </button>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>

            {sorted.length === 0 && (
              <div className="text-center py-12 text-gray-500">
                <p className="text-lg mb-1">No users found</p>
                <p className="text-sm">Try a different search term</p>
              </div>
            )}
          </div>
        </div>

        <p className="text-[10px] text-gray-600 mt-3">
          Showing {sorted.length} of {users.length} users
        </p>
      </motion.div>

      {/* Edit User Modal */}
      <AnimatePresence>
        {editingUser && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100]"
              onClick={() => setEditingUser(null)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="fixed top-[10%] left-1/2 -translate-x-1/2 w-[90%] max-w-md bg-dark-800 border border-white/10 rounded-2xl shadow-2xl z-[101] flex flex-col max-h-[80vh]"
            >
              <div className="p-5 border-b border-white/5 flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-bold text-white">Edit User Modules</h3>
                  <p className="text-xs text-gray-400 mt-0.5">{editingUser.name} • {editingUser.email}</p>
                </div>
                <button 
                  onClick={() => setEditingUser(null)}
                  className="w-8 h-8 flex items-center justify-center rounded-full bg-white/5 hover:bg-white/10 text-gray-400 transition-colors"
                >
                  ✕
                </button>
              </div>

              <div className="p-5 overflow-y-auto flex-1">
                {isLoadingUser ? (
                  <div className="flex justify-center py-10">
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                      className="w-8 h-8 border-2 border-neon-purple border-t-transparent rounded-full"
                    />
                  </div>
                ) : (
                  <div className="space-y-2">
                    <p className="text-xs text-gray-400 mb-3">
                      Select which modules this user has fully completed. Checking a module will mark all its days as complete.
                    </p>
                    {MODULES.map(m => (
                      <div 
                        key={m.id}
                        onClick={() => toggleModule(m.id)}
                        className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                          selectedModules.has(m.id)
                            ? 'bg-neon-purple/10 border-neon-purple/50'
                            : 'bg-white/[0.02] border-white/5 hover:border-white/20'
                        }`}
                      >
                        <div className={`w-5 h-5 rounded flex items-center justify-center border transition-colors flex-shrink-0 ${
                          selectedModules.has(m.id)
                            ? 'bg-neon-purple border-neon-purple text-white'
                            : 'border-gray-600'
                        }`}>
                          {selectedModules.has(m.id) && <span className="text-xs">✓</span>}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-bold text-white truncate">{m.title}</p>
                          <p className="text-[10px] text-gray-500 truncate">{m.days.length} days</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="p-5 border-t border-white/5 bg-black/20 rounded-b-2xl">
                <button
                  onClick={saveModules}
                  disabled={isLoadingUser || isSaving}
                  className="w-full py-3 bg-gradient-to-r from-neon-purple to-neon-blue text-white font-bold rounded-xl shadow-[0_0_20px_rgba(124,58,237,0.3)] hover:shadow-[0_0_30px_rgba(124,58,237,0.5)] transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                >
                  {isSaving ? 'Saving Update...' : 'Save Update'}
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
