'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Navbar from '@/components/Navbar';
import api from '@/lib/api';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export default function AIChatPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Welcome message
    setMessages([
      { 
        role: 'assistant', 
        content: 'Hello! I am your AI Study Coach. How can I help you optimize your study strategy, solve bugs, or maintain productivity today?' 
      }
    ]);
  }, []);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMsg: Message = { role: 'user', content: input.trim() };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const API = process.env.NEXT_PUBLIC_API_URL || 'https://studywar-3.onrender.com';
      const res = await fetch(`${API}/api/ai/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [...messages, userMsg]
        })
      });
      
      if (!res.ok) throw new Error('AI unavailable');
      const data = await res.json();
      
      const aiMsg: Message = { role: 'assistant', content: data.reply };
      setMessages((prev) => [...prev, aiMsg]);
    } catch (error) {
      console.error(error);
      setMessages((prev) => [
        ...prev, 
        { role: 'assistant', content: 'AI unavailable, try again' }
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-dark-900 text-white relative">
      {/* Glowing Background Accents */}
      <div className="fixed top-0 left-0 w-full h-full pointer-events-none z-0">
        <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-neon-purple/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-1/4 left-1/4 w-96 h-96 bg-neon-blue/10 rounded-full blur-[120px]" />
      </div>

      <Navbar />

      <main className="relative z-10 max-w-4xl mx-auto pt-24 pb-6 px-4 h-[calc(100vh-80px)] flex flex-col">
        <div className="mb-4 text-center">
          <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-neon-purple to-neon-blue bg-clip-text text-transparent">
            AI Coach Workspace
          </h1>
          <p className="text-sm text-gray-400 mt-1">Ask strategy, code, or task updates.</p>
        </div>

        {/* Chat History Panel */}
        <div className="flex-1 bg-dark-800/40 backdrop-blur-xl border border-white/10 rounded-2xl p-4 sm:p-6 overflow-y-auto shadow-xl space-y-4 custom-scrollbar">
          <AnimatePresence initial={false}>
            {messages.map((msg, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[85%] sm:max-w-[75%] rounded-2xl px-4 py-3 text-sm shadow-md ${
                    msg.role === 'user'
                      ? 'bg-neon-purple/20 text-purple-100 border border-neon-purple/30 rounded-br-none'
                      : 'bg-dark-700/60 text-gray-100 border border-white/5 rounded-bl-none'
                  }`}
                >
                  <div className="font-semibold text-xs text-gray-400 mb-1">
                    {msg.role === 'user' ? 'You' : 'AI Coach'}
                  </div>
                  <div className="whitespace-pre-wrap leading-relaxed">{msg.content}</div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {loading && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-start">
              <div className="bg-dark-700/60 rounded-2xl px-4 py-3 text-sm border border-white/5 rounded-bl-none flex items-center space-x-2">
                <div className="w-2 h-2 bg-neon-blue rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                <div className="w-2 h-2 bg-neon-blue rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                <div className="w-2 h-2 bg-neon-blue rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </motion.div>
          )}
          <div ref={chatEndRef} />
        </div>

        {/* Message Input Bar */}
        <form onSubmit={handleSend} className="mt-4 flex gap-2 items-center">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Message your AI Coach..."
            disabled={loading}
            className="flex-1 bg-dark-800/60 backdrop-blur-md border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-neon-purple/50 transition"
          />
          <button
            type="submit"
            disabled={!input.trim() || loading}
            className="bg-neon-purple hover:bg-purple-600 disabled:opacity-50 disabled:hover:bg-neon-purple text-white font-medium px-5 py-3 rounded-xl text-sm transition shadow-lg hover:shadow-purple-500/20 flex items-center justify-center"
          >
            Send 🚀
          </button>
        </form>
      </main>
    </div>
  );
}
