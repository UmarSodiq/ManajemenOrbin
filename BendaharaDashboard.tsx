/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  User, 
  Wallet, 
  Calendar, 
  MapPin, 
  Briefcase, 
  Clock, 
  CheckCircle2, 
  XCircle,
  ChevronRight,
  TrendingUp,
  Award
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { useAnggota } from '../../hooks/useAnggota';
import { useKeuangan } from '../../hooks/useKeuangan';
import { useRapat } from '../../hooks/useRapat';
import { motion } from 'motion/react';
import { cn, formatDate } from '../../lib/utils';

export default function ProfilePage() {
  const { user } = useAuth();
  const { anggotaList, isLoading: loadingAnggota } = useAnggota();
  const { iuranList, NOMINAL_IURAN } = useKeuangan();
  const { rapatList, presensiList } = useRapat();

  // Find linked member record
  const myRecord = anggotaList.find(a => a.userId === user?.uid || a.namaLengkap.toLowerCase() === user?.username.toLowerCase());
  
  const myIuran = iuranList.filter(i => i.anggotaId === myRecord?.id);
  const myPresensi = presensiList.filter(p => p.anggotaId === myRecord?.id);
  
  const attendanceRate = rapatList.length > 0 
    ? Math.round((myPresensi.filter(p => p.status === 'hadir').length / rapatList.length) * 100) 
    : 0;

  const totalDuesPaid = myIuran.reduce((sum, i) => sum + i.jumlah, 0);

  if (loadingAnggota) {
    return (
      <div className="p-8 flex items-center justify-center min-h-[60vh]">
        <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-8 max-w-5xl mx-auto space-y-8 transition-colors duration-300">
      {/* Header / Basic Info */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white dark:bg-slate-900 rounded-3xl border border-gray-100 dark:border-slate-800 shadow-sm overflow-hidden"
      >
        <div className="h-32 bg-gradient-to-r from-blue-600 to-indigo-700 pointer-events-none" />
        <div className="px-8 pb-8 -mt-12 flex flex-col md:flex-row md:items-end gap-6">
          <div className="w-24 h-24 bg-white dark:bg-slate-900 rounded-3xl p-1 shadow-lg">
            <div className="w-full h-full bg-slate-100 dark:bg-slate-800 rounded-2xl flex items-center justify-center">
              <User className="w-12 h-12 text-slate-400 dark:text-slate-600" />
            </div>
          </div>
          <div className="flex-1">
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="text-3xl font-bold text-slate-900 dark:text-white">{myRecord?.namaLengkap || user?.username}</h1>
              <span className={cn(
                "px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider",
                myRecord?.status === 'aktif' ? "bg-green-50 dark:bg-green-900/40 text-green-600 dark:text-green-400" : "bg-gray-50 dark:bg-slate-800 text-gray-400 dark:text-slate-500"
              )}>
                {myRecord?.status || 'Aktif'}
              </span>
            </div>
            <p className="text-slate-500 dark:text-slate-400 font-medium flex items-center gap-2 mt-1">
              <Briefcase className="w-4 h-4" />
              {myRecord?.jabatan || 'Anggota'}
            </p>
          </div>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Stats Cards */}
        <motion.div 
          whileHover={{ y: -5 }}
          className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-gray-100 dark:border-slate-800 shadow-sm flex items-center gap-4"
        >
          <div className="w-12 h-12 bg-blue-50 dark:bg-blue-900/30 rounded-2xl flex items-center justify-center text-blue-600 dark:text-blue-400">
            <TrendingUp className="w-6 h-6" />
          </div>
          <div>
            <p className="text-[10px] font-bold text-gray-400 dark:text-slate-500 uppercase tracking-widest">Tingkat Kehadiran</p>
            <p className="text-2xl font-bold text-slate-900 dark:text-white">{attendanceRate}%</p>
          </div>
        </motion.div>

        <motion.div 
          whileHover={{ y: -5 }}
          className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-gray-100 dark:border-slate-800 shadow-sm flex items-center gap-4"
        >
          <div className="w-12 h-12 bg-green-50 dark:bg-green-900/30 rounded-2xl flex items-center justify-center text-green-600 dark:text-green-400">
            <Wallet className="w-6 h-6" />
          </div>
          <div>
            <p className="text-[10px] font-bold text-gray-400 dark:text-slate-500 uppercase tracking-widest">Total Iuran Terbayar</p>
            <p className="text-2xl font-bold text-slate-900 dark:text-white">Rp {totalDuesPaid.toLocaleString()}</p>
          </div>
        </motion.div>

        <motion.div 
          whileHover={{ y: -5 }}
          className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-gray-100 dark:border-slate-800 shadow-sm flex items-center gap-4"
        >
          <div className="w-12 h-12 bg-amber-50 dark:bg-amber-900/30 rounded-2xl flex items-center justify-center text-amber-600 dark:text-amber-400">
            <Award className="w-6 h-6" />
          </div>
          <div>
            <p className="text-[10px] font-bold text-gray-400 dark:text-slate-500 uppercase tracking-widest">Poin Keaktifan</p>
            <p className="text-2xl font-bold text-slate-900 dark:text-white">{myPresensi.filter(p => p.status === 'hadir').length * 10} pts</p>
          </div>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Iuran Section */}
        <section className="space-y-4">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Wallet className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            Riwayat Iuran
          </h2>
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-gray-100 dark:border-slate-800 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-gray-50 dark:border-slate-800 flex justify-between items-center bg-slate-50/50 dark:bg-slate-800/50">
              <span className="text-xs font-bold text-slate-500 dark:text-slate-400">Nominal per Bulan: Rp {NOMINAL_IURAN.toLocaleString()}</span>
            </div>
            <div className="divide-y divide-gray-50 dark:divide-slate-800 max-h-[400px] overflow-y-auto">
              {myIuran.length > 0 ? (
                myIuran.map((item) => (
                  <div key={item.id} className="p-4 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-green-50 dark:bg-green-900/30 rounded-xl flex items-center justify-center text-green-600 dark:text-green-400">
                        <CheckCircle2 className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-slate-900 dark:text-white">Periode {item.periode}</p>
                        <p className="text-[10px] text-gray-400 dark:text-slate-500 font-mono uppercase">{formatDate(item.tanggalBayar)}</p>
                      </div>
                    </div>
                    <span className="text-sm font-bold text-slate-700 dark:text-slate-300">Rp {item.jumlah.toLocaleString()}</span>
                  </div>
                ))
              ) : (
                <div className="p-12 text-center text-gray-400 dark:text-slate-600 italic text-sm">
                  Belum ada riwayat iuran tercatat.
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Attendance Section */}
        <section className="space-y-4">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Calendar className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            Riwayat Kehadiran (5 Rapat Terakhir)
          </h2>
          <div className="space-y-3">
            {rapatList.slice(0, 5).map(rapat => {
              const presensi = myPresensi.find(p => p.rapatId === rapat.id);
              return (
                <div key={rapat.id} className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-gray-100 dark:border-slate-800 shadow-sm flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white">{rapat.judul}</h3>
                    <div className="flex items-center gap-3 mt-1">
                      <p className="text-[10px] font-mono text-gray-400 dark:text-slate-500 uppercase">{formatDate(rapat.tanggal)}</p>
                      <div className="flex items-center gap-1 text-[10px] text-gray-400 dark:text-slate-500">
                        <MapPin className="w-3 h-3" />
                        {rapat.tempat}
                      </div>
                    </div>
                  </div>
                  <div className={cn(
                    "flex items-center gap-2 px-3 py-1.5 rounded-xl text-[10px] font-bold uppercase tracking-wider",
                    presensi?.status === 'hadir' ? "bg-green-50 dark:bg-green-900/40 text-green-600 dark:text-green-400" : "bg-red-50 dark:bg-red-900/40 text-red-600 dark:text-red-400"
                  )}>
                    {presensi?.status === 'hadir' ? <CheckCircle2 className="w-3.5 h-3.5" /> : <XCircle className="w-3.5 h-3.5" />}
                    {presensi?.status === 'hadir' ? 'Hadir' : 'Absen'}
                  </div>
                </div>
              );
            })}
            {rapatList.length === 0 && (
              <div className="bg-slate-50 dark:bg-slate-800/50 border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-3xl p-12 text-center text-gray-400 dark:text-slate-600">
                Belum ada agenda rapat tercatat.
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
