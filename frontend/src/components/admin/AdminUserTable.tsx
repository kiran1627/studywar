'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';

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

export default function AdminUserTable({ users }: { users: AdminUser[] }) {
  const [sortKey, setSortKey] = useState<SortKey>('xp');
  const [sortAsc, setSortAsc] = useState(false);
  const [search, setSearch] = useState('');

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

  return (
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
  );
}
