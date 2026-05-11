'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import api from '@/lib/api';

interface Certificate {
  _id: string;
  user: { name: string, email: string };
  courseName: string;
  issueDate: string;
  certificateId: string;
}

export default function AdminCertificates() {
  const [certs, setCerts] = useState<Certificate[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCerts();
  }, []);

  const fetchCerts = async () => {
    try {
      const res = await api.get('/api/admin/certificates');
      setCerts(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold text-white">Certificates & Awards</h2>
        <button className="bg-neon-purple hover:bg-neon-purple/80 text-white text-xs px-4 py-2 rounded-xl transition-all font-bold">
          Manual Issue
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-10">
          <div className="w-6 h-6 border-2 border-neon-purple border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-white/5">
                <th className="py-3 px-4 text-[10px] text-gray-500 uppercase font-bold">Student</th>
                <th className="py-3 px-4 text-[10px] text-gray-500 uppercase font-bold">Course</th>
                <th className="py-3 px-4 text-[10px] text-gray-500 uppercase font-bold">ID</th>
                <th className="py-3 px-4 text-[10px] text-gray-500 uppercase font-bold">Issue Date</th>
                <th className="py-3 px-4 text-[10px] text-gray-500 uppercase font-bold text-right">Action</th>
              </tr>
            </thead>
            <tbody>
              {certs.map((cert) => (
                <tr key={cert._id} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors group">
                  <td className="py-4 px-4">
                    <p className="font-bold text-white text-sm">{cert.user.name}</p>
                    <p className="text-[10px] text-gray-500">{cert.user.email}</p>
                  </td>
                  <td className="py-4 px-4 text-sm text-gray-400">{cert.courseName}</td>
                  <td className="py-4 px-4 font-mono text-[10px] text-neon-purple">{cert.certificateId}</td>
                  <td className="py-4 px-4 text-sm text-gray-400">{new Date(cert.issueDate).toLocaleDateString()}</td>
                  <td className="py-4 px-4 text-right">
                    <button className="text-[10px] text-white hover:text-neon-purple font-bold">View PDF</button>
                  </td>
                </tr>
              ))}
              {certs.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-10 text-center text-gray-500">No certificates issued yet.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
