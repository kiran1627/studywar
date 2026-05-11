'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import api from '@/lib/api';

interface RiskUser {
  _id: string;
  name: string;
  email: string;
  risks: string[];
  severity: 'high' | 'medium';
}

export default function RiskDetection() {
  const [flaggedUsers, setFlaggedUsers] = useState<RiskUser[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRisks();
  }, []);

  const fetchRisks = async () => {
    try {
      const res = await api.get('/api/admin/risk-detection');
      setFlaggedUsers(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const sendWarning = async (userId: string) => {
    try {
      await api.post('/api/admin/send-warning', { userId });
      alert('Warning email sent!');
    } catch (err) {
      alert('Failed to send warning');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold text-white">Student Risk Detection</h2>
        <button 
          onClick={fetchRisks}
          className="text-xs bg-dark-800 hover:bg-dark-700 text-gray-400 px-3 py-1.5 rounded-lg border border-white/5 transition-colors"
        >
          Refresh Analysis
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-10">
          <div className="w-6 h-6 border-2 border-neon-purple border-t-transparent rounded-full animate-spin" />
        </div>
      ) : flaggedUsers.length === 0 ? (
        <div className="glass-card p-10 text-center text-gray-500">
          No students currently flagged as at-risk. Great job!
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {flaggedUsers.map((user) => (
            <motion.div
              key={user._id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="glass-card p-4 border-l-4"
              style={{ borderLeftColor: user.severity === 'high' ? '#ef4444' : '#f59e0b' }}
            >
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h3 className="font-bold text-white">{user.name}</h3>
                  <p className="text-xs text-gray-500">{user.email}</p>
                </div>
                <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded ${
                  user.severity === 'high' ? 'bg-red-500/20 text-red-400' : 'bg-orange-500/20 text-orange-400'
                }`}>
                  {user.severity} Risk
                </span>
              </div>
              
              <div className="space-y-2 mb-4">
                {user.risks.map((risk, i) => (
                  <div key={i} className="flex items-center gap-2 text-xs text-gray-400">
                    <span className="text-red-500">⚠️</span>
                    {risk}
                  </div>
                ))}
              </div>

              <div className="flex gap-2">
                <button 
                  onClick={() => sendWarning(user._id)}
                  className="flex-1 bg-red-500/10 hover:bg-red-500/20 text-red-500 text-xs py-2 rounded-lg border border-red-500/20 transition-all font-medium"
                >
                  Send Warning Email
                </button>
                <button className="flex-1 bg-white/5 hover:bg-white/10 text-gray-400 text-xs py-2 rounded-lg border border-white/5 transition-all">
                  View Profile
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
