'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import api from '@/lib/api';

interface Batch {
  _id: string;
  name: string;
  description: string;
  students: any[];
  active: boolean;
}

export default function BatchManager() {
  const [batches, setBatches] = useState<Batch[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBatches();
  }, []);

  const fetchBatches = async () => {
    try {
      const res = await api.get('/api/admin/batches');
      setBatches(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold text-white">Batch Management</h2>
        <button className="bg-neon-purple hover:bg-neon-purple/80 text-white text-xs px-4 py-2 rounded-xl transition-all font-bold">
          + Create New Batch
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-10">
          <div className="w-6 h-6 border-2 border-neon-purple border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {batches.map((batch) => (
            <motion.div
              key={batch._id}
              className="glass-card p-5 hover:border-neon-purple/20 transition-all"
            >
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="font-bold text-white text-lg">{batch.name}</h3>
                  <p className="text-xs text-gray-500">{batch.description || 'No description'}</p>
                </div>
                <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${batch.active ? 'bg-green-500/20 text-green-400' : 'bg-gray-500/20 text-gray-400'}`}>
                  {batch.active ? 'ACTIVE' : 'INACTIVE'}
                </span>
              </div>

              <div className="flex items-center gap-3 mb-5">
                <div className="flex -space-x-2">
                  {batch.students.slice(0, 3).map((s, i) => (
                    <div key={i} className="w-8 h-8 rounded-full bg-dark-700 border-2 border-dark-900 flex items-center justify-center text-[10px] text-white">
                      {s.name?.[0] || '?'}
                    </div>
                  ))}
                  {batch.students.length > 3 && (
                    <div className="w-8 h-8 rounded-full bg-neon-purple/20 border-2 border-dark-900 flex items-center justify-center text-[10px] text-neon-purple font-bold">
                      +{batch.students.length - 3}
                    </div>
                  )}
                </div>
                <span className="text-[10px] text-gray-500 uppercase font-bold tracking-wider">
                  {batch.students.length} Students
                </span>
              </div>

              <div className="flex gap-2">
                <button className="flex-1 bg-white/5 hover:bg-white/10 text-white text-xs py-2 rounded-lg transition-all border border-white/5">
                  Manage
                </button>
                <button className="flex-1 bg-white/5 hover:bg-white/10 text-white text-xs py-2 rounded-lg transition-all border border-white/5">
                  Schedule
                </button>
              </div>
            </motion.div>
          ))}
          {batches.length === 0 && (
            <div className="glass-card p-10 text-center text-gray-500 md:col-span-2 lg:col-span-3">
              No batches found. Organize your students into cohorts.
            </div>
          )}
        </div>
      )}
    </div>
  );
}
