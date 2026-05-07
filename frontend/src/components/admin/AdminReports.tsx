'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import api from '@/lib/api';
import Script from 'next/script';

declare global {
  interface Window {
    jspdf: any;
  }
}

interface UserReport {
  _id: string;
  name: string;
  email: string;
  picture: string;
  score: number;
  streak: number;
  xp: number;
  level: number;
  engagement: string;
  study: {
    totalSessions: number;
    totalProblems: number;
    studyHours: number;
    activeDays: number;
  };
  monthly: {
    sessions: number;
    problems: number;
  };
  institute: {
    progress: number;
    modulesCompleted: number;
    totalModules: number;
  };
  dailyActivity: {
    date: string;
    problems: number;
    sessions: number;
  }[];
}

interface ReportsData {
  summary: {
    totalUsers: number;
    totalStudyHours: number;
    totalProblems: number;
    activeToday: number;
    activeThisWeek: number;
    avgProgress: number;
    avgStreak: number;
  };
  users: UserReport[];
}

export default function AdminReports() {
  const [data, setData] = useState<ReportsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);

  const generatePDF = async () => {
    if (!data || !window.jspdf) return;
    setIsGeneratingPDF(true);

    try {
      const doc = new window.jspdf.jsPDF();
      const pageWidth = doc.internal.pageSize.getWidth();

      // Header
      doc.setFillColor(15, 15, 20); // Dark background
      doc.rect(0, 0, pageWidth, 40, 'F');
      
      doc.setTextColor(124, 58, 237); // Neon Purple
      doc.setFontSize(24);
      doc.setFont('helvetica', 'bold');
      doc.text('STUDYWAR', 15, 25);
      
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(12);
      doc.text('Analytics & Engagement Report', 15, 32);
      
      doc.setTextColor(150, 150, 150);
      doc.setFontSize(10);
      doc.text(`Generated on: ${new Date().toLocaleString()}`, pageWidth - 15, 25, { align: 'right' });

      // Summary Section
      doc.setTextColor(0, 0, 0);
      doc.setFontSize(16);
      doc.text('Platform Summary', 15, 55);
      
      const summaryData = [
        ['Total Study Hours', `${data.summary.totalStudyHours}h`],
        ['Problems Solved', data.summary.totalProblems.toLocaleString()],
        ['Weekly Active Users', data.summary.activeThisWeek.toString()],
        ['Average Progress', `${Math.round(data.summary.avgProgress)}%`],
        ['Average Streak', `${data.summary.avgStreak} days`]
      ];

      (doc as any).autoTable({
        startY: 60,
        head: [['Metric', 'Value']],
        body: summaryData,
        theme: 'striped',
        headStyles: { fillColor: [124, 58, 237], textColor: [255, 255, 255] },
        styles: { fontSize: 10, cellPadding: 4 },
      });

      // User Details Section
      const finalY = (doc as any).lastAutoTable.finalY || 60;
      doc.setFontSize(16);
      doc.text('Detailed User Activity', 15, finalY + 15);

      const tableData = filteredUsers.map(u => [
        u.name,
        u.email,
        `${u.study.studyHours}h`,
        u.study.totalProblems.toString(),
        `${u.institute.progress}%`,
        u.streak.toString(),
        u.engagement
      ]);

      (doc as any).autoTable({
        startY: finalY + 20,
        head: [['Name', 'Email', 'Hours', 'Solved', 'Progress', 'Streak', 'Status']],
        body: tableData,
        theme: 'grid',
        headStyles: { fillColor: [30, 30, 40], textColor: [255, 255, 255] },
        styles: { fontSize: 8, cellPadding: 3 },
        columnStyles: {
          0: { fontStyle: 'bold' },
          4: { fontStyle: 'bold', textColor: [124, 58, 237] }
        }
      });

      doc.save(`StudyWar_Report_${new Date().toISOString().split('T')[0]}.pdf`);
    } catch (err) {
      console.error('PDF Generation Error:', err);
      alert('Failed to generate PDF. Please try again.');
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  useEffect(() => {
    const fetchReports = async () => {
      try {
        const res = await api.get('/api/admin/reports');
        setData(res.data);
      } catch (err) {
        console.error('Failed to fetch reports:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchReports();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          className="w-8 h-8 border-2 border-neon-purple border-t-transparent rounded-full"
        />
      </div>
    );
  }

  if (!data) return null;

  const filteredUsers = data.users.filter(u => 
    u.name.toLowerCase().includes(search.toLowerCase()) || 
    u.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <>
      <div className="space-y-8 pb-12">
      {/* ─── Summary Report ─── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="glass-card p-6 bg-gradient-to-br from-neon-purple/10 to-transparent">
          <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-1">Total Effort</p>
          <h2 className="text-3xl font-black text-white">{data.summary.totalStudyHours} <span className="text-sm font-normal text-gray-500 uppercase">Hours</span></h2>
          <p className="text-xs text-neon-purple mt-2 font-medium">Across all users to date</p>
        </div>
        <div className="glass-card p-6 bg-gradient-to-br from-neon-blue/10 to-transparent">
          <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-1">Problems Solved</p>
          <h2 className="text-3xl font-black text-white">{data.summary.totalProblems.toLocaleString()} <span className="text-sm font-normal text-gray-500 uppercase">Solved</span></h2>
          <p className="text-xs text-neon-blue mt-2 font-medium">Total coding impact</p>
        </div>
        <div className="glass-card p-6 bg-gradient-to-br from-neon-green/10 to-transparent">
          <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-1">Weekly Retention</p>
          <h2 className="text-3xl font-black text-white">{data.summary.activeThisWeek} <span className="text-sm font-normal text-gray-500 uppercase">Active</span></h2>
          <p className="text-xs text-neon-green mt-2 font-medium">{Math.round((data.summary.activeThisWeek / data.summary.totalUsers) * 100)}% of total userbase</p>
        </div>
      </div>

      {/* ─── Detailed User Report ─── */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-bold text-white flex items-center gap-2">
            <span>Detailed User Activity</span>
            <span className="text-xs bg-dark-800 text-gray-400 px-2 py-1 rounded-full">{filteredUsers.length} Users</span>
          </h3>
        <div className="flex flex-col sm:flex-row items-center gap-4">
          <button
            onClick={generatePDF}
            disabled={isGeneratingPDF}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all ${
              isGeneratingPDF 
                ? 'bg-dark-800 text-gray-500 cursor-not-allowed' 
                : 'bg-neon-purple/20 border border-neon-purple/30 text-neon-purple hover:bg-neon-purple/30'
            }`}
          >
            {isGeneratingPDF ? (
              <>
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                  className="w-4 h-4 border-2 border-neon-purple border-t-transparent rounded-full"
                />
                Generating...
              </>
            ) : (
              <>
                <span>📥</span>
                Download PDF
              </>
            )}
          </button>
          <input
            type="text"
            placeholder="Search report..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="px-4 py-2 rounded-xl bg-dark-800 border border-white/5 text-sm text-white placeholder-gray-500 outline-none focus:border-neon-purple/30 transition-all w-64"
          />
        </div>
        </div>

        <div className="grid grid-cols-1 gap-4">
          {filteredUsers.map((u, i) => (
            <motion.div
              key={u._id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="glass-card p-5 group hover:border-white/10 transition-all"
            >
              <div className="flex flex-col md:flex-row md:items-center gap-6">
                {/* Profile Info */}
                <div className="flex items-center gap-4 min-w-[240px]">
                  {u.picture ? (
                    <img src={u.picture} alt={u.name} className="w-12 h-12 rounded-full border border-white/10" />
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-neon-purple/20 flex items-center justify-center text-xl font-bold text-neon-purple">
                      {u.name.charAt(0)}
                    </div>
                  )}
                  <div>
                    <h4 className="font-bold text-white leading-tight">{u.name}</h4>
                    <p className="text-xs text-gray-500 mt-0.5">{u.email}</p>
                    <div className="mt-2 inline-block px-2 py-0.5 rounded-full bg-white/5 border border-white/5 text-[10px] text-gray-400 font-bold uppercase tracking-wider">
                      {u.engagement}
                    </div>
                  </div>
                </div>

                {/* Stats Grid */}
                <div className="flex-1 grid grid-cols-2 sm:grid-cols-4 gap-6 py-2 border-l border-white/5 pl-6">
                  <div>
                    <p className="text-[10px] font-bold text-gray-500 uppercase mb-1">Effort</p>
                    <p className="text-lg font-black text-white">{u.study.studyHours}h</p>
                    <p className="text-[10px] text-gray-500">{u.study.totalSessions} sessions</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-gray-500 uppercase mb-1">Impact</p>
                    <p className="text-lg font-black text-neon-blue">{u.study.totalProblems}</p>
                    <p className="text-[10px] text-gray-500">Solved total</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-gray-500 uppercase mb-1">Institute</p>
                    <div className="flex items-center gap-2">
                      <span className="text-lg font-black text-neon-purple">{u.institute.progress}%</span>
                    </div>
                    <p className="text-[10px] text-gray-500">{u.institute.modulesCompleted}/{u.institute.totalModules} modules</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-gray-500 uppercase mb-1">Streak</p>
                    <p className="text-lg font-black text-orange-500">🔥 {u.streak}</p>
                    <p className="text-[10px] text-gray-500">Day streak</p>
                  </div>
                </div>

                {/* Sparkline Visual (Simple visualization of last 7 days) */}
                <div className="hidden lg:flex items-end gap-1.5 h-12 pt-2 min-w-[120px]">
                  {u.dailyActivity.map((day, di) => {
                    const height = Math.min(100, (day.problems / 10) * 100);
                    return (
                      <div key={di} className="flex-1 bg-dark-700 rounded-t-sm relative group/bar h-full flex items-end">
                        <motion.div
                          initial={{ height: 0 }}
                          animate={{ height: `${height}%` }}
                          className={`w-full rounded-t-sm ${height > 0 ? 'bg-neon-purple/60 group-hover/bar:bg-neon-purple' : 'bg-transparent'}`}
                        />
                        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-1.5 py-0.5 rounded bg-black text-[8px] text-white opacity-0 group-hover/bar:opacity-100 transition-opacity whitespace-nowrap z-10 pointer-events-none">
                          {day.problems} solved
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
    
    <Script 
      src="https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js" 
      strategy="afterInteractive" 
    />
    <Script 
      src="https://cdnjs.cloudflare.com/ajax/libs/jspdf-autotable/3.5.25/jspdf.plugin.autotable.min.js" 
      strategy="afterInteractive" 
    />
  </>
  );
}
