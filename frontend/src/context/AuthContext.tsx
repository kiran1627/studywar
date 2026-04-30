'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import { disconnectSocket } from '@/lib/socket';

import type { User } from '@/types/user';

interface AuthContextType {
  user: User | null; loading: boolean;
  login: () => void; logout: () => Promise<void>; refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null, loading: true, login: () => {}, logout: async () => {}, refreshUser: async () => {},
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const fetchUser = useCallback(async () => {
    try { const res = await api.get('/auth/me'); setUser(res.data); }
    catch { setUser(null); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      const token = urlParams.get('token');
      if (token) {
        localStorage.setItem('studywar_token', token);
        const newUrl = window.location.pathname;
        window.history.replaceState({}, document.title, newUrl);
      }
    }
    fetchUser();
  }, [fetchUser]);

  const login = () => {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
    window.location.href = `${apiUrl}/auth/google`;
  };

  const logout = async () => {
    try { await api.post('/auth/logout'); } catch {}
    if (typeof window !== 'undefined') {
      localStorage.removeItem('studywar_token');
      sessionStorage.removeItem('sw_intro_seen');
    }
    disconnectSocket(); setUser(null); router.push('/');
  };

  const refreshUser = async () => {
    try { const res = await api.get('/auth/me'); setUser(res.data); } catch {}
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
};
