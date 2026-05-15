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
    <div className="p-8 space-y-8 bg-gray-50 min-h-full">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">Halo, Sekretaris</h1>
        <p className="text-sm text-gray-500 mt-1">Status manajemen organisasi hari ini.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {stats.map((stat, i) => (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            key={stat.label}
            className={cn("p-6 rounded-2xl border border-gray-200 shadow-sm bg-white")}
          >
            <div className="p-2.5 bg-slate-50 rounded-xl w-fit mb-4">
              <stat.icon className="w-5 h-5 text-slate-600" />
            </div>
            <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-1">{stat.label}</p>
            <p className="text-2xl font-semibold text-slate-900 tracking-tight">{stat.value}</p>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Jadwal Rapat */}
        <div className="lg:col-span-2 bg-white border border-gray-200 rounded-2xl p-8 flex flex-col justify-between shadow-sm min-h-[350px]">
           <div>
             <h2 className="text-[11px] font-bold text-gray-400 uppercase tracking-[0.1em] mb-8">Jadwal Rapat Mendatang</h2>
             {upcomingRapat ? (
               <div className="space-y-8">
                 <h3 className="text-3xl font-semibold leading-tight tracking-tight text-slate-900">{upcomingRapat.judul}</h3>
                 <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="flex items-center gap-3 text-gray-500 bg-slate-50 p-4 rounded-xl">
                      <Calendar className="w-5 h-5 text-blue-600" />
                      <span className="font-semibold text-sm">{formatDate(upcomingRapat.tanggal)}</span>
                    </div>
                    <div className="flex items-center gap-3 text-gray-500 bg-slate-50 p-4 rounded-xl">
                      <Clock className="w-5 h-5 text-blue-600" />
                      <span className="font-mono text-sm">{upcomingRapat.waktuMulai} - {upcomingRapat.waktuSelesai}</span>
                    </div>
                    <div className="flex items-center gap-3 text-gray-500 bg-slate-50 p-4 rounded-xl">
                      <MapPin className="w-5 h-5 text-blue-600" />
                      <span className="text-sm font-medium">{upcomingRapat.tempat}</span>
                    </div>
                 </div>
               </div>
             ) : (
               <div className="py-12 text-center text-gray-300 italic border border-dashed border-gray-200 rounded-2xl">Belum ada rapat terjadwal dalam waktu dekat.</div>
             )}
           </div>
           {upcomingRapat && (
             <Link to="/sekretaris/rapat" className="mt-10 self-start px-6 py-2.5 bg-slate-900 text-white rounded-lg font-semibold text-sm tracking-tight hover:bg-slate-800 transition-colors shadow-sm">
               Kelola Rapat
             </Link>
           )}
        </div>

        {/* Ringkasan & Pengumuman */}
        <div className="space-y-6">
           <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
             <div className="flex justify-between items-center mb-6">
               <h2 className="text-xs font-bold text-slate-900 uppercase tracking-widest">Presensi Terakhir</h2>
               {lastRapat && <span className="text-[10px] font-mono text-gray-400 font-bold">{formatDate(lastRapat.tanggal)}</span>}
             </div>
             {lastRapat ? (
               <div className="flex items-center gap-6">
                  <div className="text-center">
                    <p className="text-3xl font-bold text-slate-900">{hadirCount}</p>
                    <p className="text-[10px] font-bold uppercase text-gray-400 tracking-wider">Hadir</p>
                  </div>
                  <div className="flex-1">
                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden flex">
                       <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${(hadirCount / anggotaAktif.length) * 100}%` }}
                        className="bg-blue-600 h-full rounded-full"
                       />
                    </div>
                    <p className="text-[10px] text-gray-400 mt-2 font-bold uppercase tracking-tighter">{(hadirCount / anggotaAktif.length * 100).toFixed(0)}% Partisipasi</p>
                  </div>
               </div>
             ) : (
               <div className="text-center py-6 text-gray-300 italic">Belum ada data.</div>
             )}
           </div>

           <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm flex flex-col">
             <div className="flex justify-between items-center mb-6">
               <h2 className="text-xs font-bold text-slate-900 uppercase tracking-widest">Warta Organisasi</h2>
               <Link to="/sekretaris/pengumuman" className="p-1 hover:bg-slate-50 rounded-lg transition-colors"><ChevronRight className="w-5 h-5 text-gray-400" /></Link>
             </div>
             <div className="space-y-3">
               {pengumumanList.slice(0, 3).map(p => (
                 <Link key={p.id} to="/sekretaris/pengumuman" className="block p-3.5 bg-slate-50 rounded-xl border border-transparent hover:border-gray-200 transition-all group">
                    <h4 className="font-semibold text-xs text-slate-900 line-clamp-1 group-hover:text-blue-600 transition-colors">{p.judul}</h4>
                    <p className="text-[9px] text-gray-400 font-bold uppercase tracking-widest mt-1">{formatDate(p.tanggalDibuat)}</p>
                 </Link>
               ))}
               {pengumumanList.length === 0 && <p className="text-center text-gray-300 italic py-4 text-xs">Kosong.</p>}
             </div>
           </div>
        </div>
      </div>
    </div>
  );
}
