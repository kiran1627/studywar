'use client';

import { useEffect, useRef, useCallback } from 'react';
import { Socket } from 'socket.io-client';
import { getSocket } from '@/lib/socket';

export const useSocket = () => {
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    socketRef.current = getSocket();
  }, []);

  const emit = useCallback((event: string, data?: any) => {
    if (socketRef.current) socketRef.current.emit(event, data);
  }, []);

  const on = useCallback((event: string, callback: (...args: any[]) => void) => {
    if (socketRef.current) socketRef.current.on(event, callback);
    return () => { if (socketRef.current) socketRef.current.off(event, callback); };
  }, []);

  return { socket: socketRef.current, emit, on };
};
