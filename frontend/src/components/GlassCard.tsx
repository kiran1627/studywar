'use client';

import React from 'react';
import { motion } from 'framer-motion';

interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
  glowColor?: 'blue' | 'purple' | 'pink' | 'green';
  hover?: boolean;
}

const glowMap = {
  blue: 'hover:shadow-[0_0_20px_rgba(0,212,255,0.3)]',
  purple: 'hover:shadow-[0_0_20px_rgba(124,58,237,0.3)]',
  pink: 'hover:shadow-[0_0_20px_rgba(236,72,153,0.3)]',
  green: 'hover:shadow-[0_0_20px_rgba(0,255,136,0.3)]',
};

const GlassCard: React.FC<GlassCardProps> = ({ children, className = '', glowColor = 'purple', hover = true }) => {
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
      className={`glass-card p-6 ${hover ? glowMap[glowColor] : ''} ${className}`}>
      {children}
    </motion.div>
  );
};

export default GlassCard;
