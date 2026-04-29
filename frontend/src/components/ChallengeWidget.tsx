'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import api from '@/lib/api';

interface Challenge {
  _id: string;
  title: string;
  durationDays: number;
  endDate: string;
  participants: any[];
}

export default function ChallengeWidget() {
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [email, setEmail] = useState('');
  const [title, setTitle] = useState('');
  const [days, setDays] = useState(3);
  const [message, setMessage] = useState('');

  const fetchChallenges = async () => {
    try {
      const res = await api.get('/api/challenge');
      setChallenges(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchChallenges();
  }, []);

  const inviteFriend = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage('');
    try {
      const res = await api.post('/api/user/friends/invite', { email });
      setMessage(`Success: ${res.data.message}`);
      setEmail('');
    } catch (err: any) {
      setMessage(`Error: ${err.response?.data?.message || 'Invitation failed'}`);
    }
  };

  const createChallenge = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage('');
    try {
      await api.post('/api/challenge', { title, durationDays: days });
      setMessage('Challenge created!');
      setTitle('');
      fetchChallenges();
    } catch (err: any) {
      setMessage(`Error: ${err.response?.data?.message || 'Creation failed'}`);
    }
  };

  return (
    <div className="bg-dark-800/40 backdrop-blur-xl border border-white/10 rounded-2xl p-6 shadow-lg space-y-6">
      <div>
        <h3 className="text-lg font-bold text-white">🤝 Friend Challenges</h3>
        {message && <p className="text-xs mt-2 text-neon-blue font-medium">{message}</p>}
      </div>

      {/* Invite Friend */}
      <form onSubmit={inviteFriend} className="space-y-2">
        <label className="text-xs text-gray-400 font-medium">Invite Coding Buddy</label>
        <div className="flex gap-2">
          <input 
            type="email" 
            placeholder="buddy@studywar.com" 
            value={email} 
            onChange={(e) => setEmail(e.target.value)}
            className="flex-1 bg-dark-700 border border-white/5 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-neon-purple text-white"
          />
          <button type="submit" className="px-3 py-2 bg-dark-700 hover:bg-dark-600 border border-white/10 rounded-xl text-xs font-semibold text-purple-400 transition cursor-pointer">
            Invite
          </button>
        </div>
      </form>

      {/* Create Challenge */}
      <form onSubmit={createChallenge} className="space-y-2 border-t border-white/5 pt-4">
        <label className="text-xs text-gray-400 font-medium">Launch Competitive Sprint</label>
        <input 
          type="text" 
          placeholder="Sprint Title (e.g. LeetCode Wars)" 
          value={title} 
          onChange={(e) => setTitle(e.target.value)}
          className="w-full bg-dark-700 border border-white/5 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-neon-purple text-white mb-2"
        />
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <label className="text-xs text-gray-400">Days:</label>
            <select 
              value={days} 
              onChange={(e) => setDays(Number(e.target.value))}
              className="bg-dark-700 border border-white/5 text-xs rounded-lg px-2 py-1 text-white"
            >
              {[3, 4, 5, 6, 7].map(d => <option key={d} value={d}>{d} days</option>)}
            </select>
          </div>
          <button type="submit" className="px-4 py-2 bg-neon-purple hover:bg-purple-600 rounded-xl text-xs font-bold text-white transition shadow-md">
            Start Challenge ⚔️
          </button>
        </div>
      </form>

      {/* Challenge List */}
      {challenges.length > 0 && (
        <div className="border-t border-white/5 pt-4 space-y-2">
          <label className="text-xs text-gray-400 font-semibold block mb-2">Active Competitions</label>
          {challenges.map((c) => (
            <div key={c._id} className="bg-white/5 rounded-xl p-3 border border-white/5 text-xs flex justify-between items-center">
              <div>
                <span className="font-bold text-gray-200 block">{c.title}</span>
                <span className="text-gray-400 block mt-0.5">{c.participants.length} contenders</span>
              </div>
              <span className="text-neon-blue font-medium font-mono">Ends {new Date(c.endDate).toLocaleDateString()}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
