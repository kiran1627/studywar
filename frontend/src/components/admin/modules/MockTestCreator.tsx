'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import api from '@/lib/api';

interface MockTest {
  _id: string;
  title: string;
  questions: any[];
  duration: number;
}

export default function MockTestCreator() {
  const [tests, setTests] = useState<MockTest[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTests();
  }, []);

  const fetchTests = async () => {
    try {
      const res = await api.get('/api/admin/mock-tests');
      setTests(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold text-white">Mock Test Creator</h2>
        <button className="bg-neon-purple hover:bg-neon-purple/80 text-white text-xs px-4 py-2 rounded-xl transition-all font-bold">
          + Create New Test
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-10">
          <div className="w-6 h-6 border-2 border-neon-purple border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <div className="space-y-3">
          {tests.map((test) => (
            <motion.div
              key={test._id}
              className="glass-card p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 group"
            >
              <div>
                <h3 className="font-bold text-white group-hover:text-neon-purple transition-colors">{test.title}</h3>
                <div className="flex gap-4 mt-1">
                  <span className="text-[10px] text-gray-500">⏱️ {test.duration} Minutes</span>
                  <span className="text-[10px] text-gray-500">❓ {test.questions.length} Questions</span>
                </div>
              </div>
              <div className="flex gap-2 w-full sm:w-auto">
                <button className="flex-1 sm:flex-none bg-white/5 hover:bg-white/10 text-white text-xs px-4 py-2 rounded-lg border border-white/5">
                  Edit Questions
                </button>
                <button className="flex-1 sm:flex-none bg-neon-purple/10 hover:bg-neon-purple/20 text-neon-purple text-xs px-4 py-2 rounded-lg border border-neon-purple/20">
                  Preview
                </button>
              </div>
            </motion.div>
          ))}
          {tests.length === 0 && (
            <div className="glass-card p-10 text-center text-gray-500">
              No mock tests created. Start by adding some questions.
            </div>
          )}
        </div>
      )}
    </div>
  );
}
