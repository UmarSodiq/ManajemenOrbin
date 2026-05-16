/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Calendar, Users, Megaphone, ClipboardList, CheckCircle2, ChevronRight, Clock, MapPin } from 'lucide-react';
import { useRapat } from '../../hooks/useRapat';
import { usePengumuman } from '../../hooks/usePengumuman';
import { useAnggota } from '../../hooks/useAnggota';
import { formatDate, cn } from '../../lib/utils';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';

export default function SekretarisDashboard() {
  const { rapatList, presensiList } = useRapat();
  const { pengumumanList } = usePengumuman();
  const { anggotaList } = useAnggota();
  
  const anggotaAktif = anggotaList.filter(a => a.status === 'aktif');
  
  const upcomingRapat = rapatList
    .filter(r => r.tanggal >= new Date())
    .sort((a, b) => a.tanggal.getTime() - b.tanggal.getTime())[0];

  const lastRapat = rapatList
    .filter(r => r.tanggal < new Date())
    .sort((a, b) => b.tanggal.getTime() - a.tanggal.getTime())[0];

  const lastPresensi = lastRapat ? presensiList.filter(p => p.rapatId === lastRapat.id) : [];
  const hadirCount = lastPresensi.filter(p => p.status === 'hadir').length;

  const stats = [
    { label: 'Total Anggota', value: `${anggotaAktif.length} Orang`, icon: Users, bg: 'bg-white' },
    { label: 'Rapat Terlaksana', value: `${rapatList.filter(r => r.tanggal < new Date()).length}`, icon: ClipboardList, bg: 'bg-white' },
    { label: 'Pengumuman Aktif', value: `${pengumumanList.length}`, icon: Megaphone, bg: 'bg-white' },
  ];

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[var(--text-primary)]">Dasbor Sekretaris</h1>
          <p className="text-sm text-[var(--text-secondary)] mt-1">Kelola administrasi dan agenda organisasi.</p>
        </div>
        
        <div className="bg-[var(--bg-card)] px-4 py-2 rounded-xl border border-[var(--border-base)] shadow-sm flex items-center gap-3">
          <Clock className="w-4 h-4 text-[var(--text-muted)]" />
          <span className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider">{new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })} WIB</span>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {stats.map((stat, i) => (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            key={stat.label}
            className="p-6 card-base"
          >
            <div className="w-10 h-10 rounded-lg bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 flex items-center justify-center mb-4">
              <stat.icon className="w-5 h-5" />
            </div>
            <p className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider mb-1">{stat.label}</p>
            <p className="text-2xl font-bold text-[var(--text-primary)] tracking-tight">{stat.value}</p>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 card-base p-8 flex flex-col justify-between">
           <div>
             <div className="flex items-center justify-between mb-8">
               <h2 className="font-bold text-[var(--text-primary)] flex items-center gap-2">
                 <Calendar className="w-4 h-4 text-blue-600 dark:text-blue-400" /> Agenda Rapat Terdekat
               </h2>
             </div>
             
             {upcomingRapat ? (
               <div className="space-y-6">
                 <h3 className="text-2xl font-bold text-[var(--text-primary)]">{upcomingRapat.judul}</h3>
                 <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="p-4 bg-slate-50 dark:bg-white/5 rounded-xl border border-slate-100 dark:border-white/5">
                      <p className="text-[10px] font-bold text-[var(--text-muted)] uppercase mb-1">Tanggal</p>
                      <p className="font-bold text-sm text-[var(--text-secondary)]">{formatDate(upcomingRapat.tanggal)}</p>
                    </div>
                    <div className="p-4 bg-slate-50 dark:bg-white/5 rounded-xl border border-slate-100 dark:border-white/5">
                      <p className="text-[10px] font-bold text-[var(--text-muted)] uppercase mb-1">Waktu</p>
                      <p className="font-bold text-sm text-[var(--text-secondary)]">{upcomingRapat.waktuMulai} - {upcomingRapat.waktuSelesai}</p>
                    </div>
                    <div className="p-4 bg-slate-50 dark:bg-white/5 rounded-xl border border-slate-100 dark:border-white/5 truncate">
                      <p className="text-[10px] font-bold text-[var(--text-muted)] uppercase mb-1">Tempat</p>
                      <p className="font-bold text-sm text-[var(--text-secondary)] uppercase">{upcomingRapat.tempat}</p>
                    </div>
                 </div>
               </div>
             ) : (
               <div className="py-12 text-center text-slate-400 italic text-sm border border-dashed border-slate-200 rounded-xl">Tidak ada agenda rapat dalam waktu dekat.</div>
             )}
           </div>
           
           {upcomingRapat && (
             <Link to="/sekretaris/rapat" className="mt-8 btn-primary self-start">
               Manajer Rapat
               <ChevronRight className="w-4 h-4" />
             </Link>
           )}
        </div>

        <div className="space-y-6">
           <div className="card-base p-6">
             <h2 className="font-bold text-[var(--text-primary)] mb-6 flex items-center gap-2">
               <CheckCircle2 className="w-4 h-4 text-green-500" /> Presensi Rapat Terakhir
             </h2>
             {lastRapat ? (
                <div className="space-y-4">
                   <div className="flex items-center gap-4">
                     <div className="w-12 h-12 rounded-xl bg-slate-900 text-white flex items-center justify-center text-xl font-bold">
                       {hadirCount}
                     </div>
                     <div>
                       <p className="text-sm font-bold text-[var(--text-primary)] uppercase">Hadir</p>
                       <p className="text-xs text-[var(--text-secondary)]">Dari {anggotaAktif.length} Anggota Aktif</p>
                     </div>
                   </div>
                   <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${(hadirCount / anggotaAktif.length) * 100}%` }}
                        className="bg-blue-600 h-full rounded-full"
                      />
                   </div>
                   <p className="text-[10px] text-right font-bold text-slate-400 uppercase tracking-widest">Tingkat Partisipasi: {(hadirCount / anggotaAktif.length * 100).toFixed(0)}%</p>
                </div>
             ) : (
                <div className="text-center py-6 text-slate-400 italic text-sm">Belum ada data presensi.</div>
             )}
           </div>

           <div className="card-base p-6">
             <div className="flex justify-between items-center mb-6">
                <h2 className="font-bold text-[var(--text-primary)] flex items-center gap-2">
                  <Megaphone className="w-4 h-4 text-[var(--text-muted)]" /> Pengumuman
                </h2>
                <Link to="/sekretaris/pengumuman" className="p-1.5 hover:bg-[var(--bg-main)] rounded-lg transition-colors border border-transparent hover:border-[var(--border-base)]"><ChevronRight className="w-4 h-4 text-[var(--text-muted)]" /></Link>
             </div>
             <div className="space-y-3">
                {pengumumanList.slice(0, 3).map(p => (
                  <Link key={p.id} to="/sekretaris/pengumuman" className="block p-3 bg-slate-50 dark:bg-white/5 hover:bg-blue-50 dark:hover:bg-blue-900/10 border border-slate-100 dark:border-white/5 hover:border-blue-200 rounded-xl transition-all group">
                     <h4 className="font-bold text-xs text-[var(--text-primary)] line-clamp-1 group-hover:text-blue-700 dark:group-hover:text-blue-400 transition-colors uppercase tracking-tight">{p.judul}</h4>
                     <p className="text-[10px] text-[var(--text-muted)] mt-1">{formatDate(p.tanggalDibuat)}</p>
                  </Link>
                ))}
                {pengumumanList.length === 0 && <p className="text-center text-slate-400 italic text-xs py-4">Kotak masuk kosong.</p>}
             </div>
           </div>
        </div>
      </div>
    </div>
  );
}
