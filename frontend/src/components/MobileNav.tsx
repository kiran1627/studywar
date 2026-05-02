'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { motion } from 'framer-motion';

export default function MobileNav() {
  const { user } = useAuth();
  const pathname = usePathname();

  // Do not show navigation on the root landing page if not logged in
  if (!user || pathname === '/') return null;

  const navItems = [
    { name: 'Dashboard', path: '/dashboard', icon: '🏠' },
    { name: 'Institute', path: '/institute', icon: '🏛️' },
    { name: 'Analytics', path: '/analytics', icon: '📊' },
    { name: 'Focus', path: '/focus', icon: '⏱️' },
  ];

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-dark-900/90 backdrop-blur-xl border-t border-white/10 pb-safe">
      <div className="flex justify-around items-center h-16">
        {navItems.map((item) => {
          const isActive = pathname === item.path;
          return (
            <Link key={item.name} href={item.path} className="flex flex-col items-center justify-center w-full h-full relative group">
              <span className={`text-xl mb-1 transition-transform ${isActive ? 'scale-110' : 'opacity-60 group-hover:opacity-100'}`}>
                {item.icon}
              </span>
              <span className={`text-[10px] font-medium transition-colors ${isActive ? 'text-neon-purple' : 'text-gray-500 group-hover:text-gray-300'}`}>
                {item.name}
              </span>
              {isActive && (
                <motion.div 
                  layoutId="mobileNavIndicator" 
                  className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-1 bg-neon-purple rounded-b-full"
                />
              )}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
