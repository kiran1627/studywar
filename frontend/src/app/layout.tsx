import type { Metadata, Viewport } from 'next';
import './globals.css';
import { AuthProvider } from '@/context/AuthContext';

export const metadata: Metadata = {
  title: 'StudyWar 🚀 | Gamified Coding Habit Tracker',
  description: 'Level up your coding skills with StudyWar - a gamified habit tracker with real-time leaderboard, streaks, and daily challenges.',
  manifest: '/manifest.json',
  keywords: ['coding', 'habit tracker', 'gamified', 'leaderboard', 'study'],
};

export const viewport: Viewport = {
  themeColor: '#7c3aed',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap" rel="stylesheet" />
        <link rel="apple-touch-icon" href="/icons/app logo.png" />
        <link rel="icon" href="/icons/favincon.png" />
      </head>
      <body className="bg-dark-900 text-white antialiased">
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
