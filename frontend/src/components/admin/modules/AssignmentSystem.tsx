'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import api from '@/lib/api';

interface Assignment {
  _id: string;
  title: string;
  dueDate: string;
  maxPoints: number;
  batch?: { name: string };
  submissions: any[];
}

export default function AssignmentSystem() {
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);

  useEffect(() => {
    fetchAssignments();
  }, []);

  const fetchAssignments = async () => {
    try {
      const res = await api.get('/api/admin/assignments');
      setAssignments(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold text-white">Assignment System</h2>
        <button 
          onClick={() => setIsAdding(!isAdding)}
          className="bg-neon-purple hover:bg-neon-purple/80 text-white text-xs px-4 py-2 rounded-xl transition-all font-bold"
        >
          {isAdding ? 'Cancel' : '+ New Assignment'}
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-10">
          <div className="w-6 h-6 border-2 border-neon-purple border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <div className="space-y-3">
          {assignments.map((assignment) => (
            <motion.div
              key={assignment._id}
              className="glass-card p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4"
            >
              <div>
                <h3 className="font-bold text-white">{assignment.title}</h3>
                <div className="flex gap-3 mt-1">
                  <span className="text-[10px] text-gray-500">📅 Due: {new Date(assignment.dueDate).toLocaleDateString()}</span>
                  <span className="text-[10px] text-gray-500">📦 Batch: {assignment.batch?.name || 'All'}</span>
                  <span className="text-[10px] text-neon-purple font-bold">✨ {assignment.maxPoints} Points</span>
                </div>
              </div>
              <div className="flex items-center gap-3 w-full sm:w-auto">
                <div className="text-right flex-1 sm:flex-none">
                  <p className="text-lg font-black text-white">{assignment.submissions.length}</p>
                  <p className="text-[9px] text-gray-500 uppercase font-bold">Submissions</p>
                </div>
                <button className="bg-white/5 hover:bg-white/10 text-white text-xs px-4 py-2 rounded-lg border border-white/5 transition-all">
                  View Submissions
                </button>
              </div>
            </motion.div>
          ))}
          {assignments.length === 0 && !isAdding && (
            <div className="glass-card p-10 text-center text-gray-500">
              No assignments created yet.
            </div>
          )}
        </div>
      )}
    </div>
  );
}
