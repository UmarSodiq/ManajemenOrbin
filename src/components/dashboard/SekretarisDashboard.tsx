/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Calendar, Users, Megaphone, ClipboardList, CheckCircle2, ChevronRight, Clock, MapPin, Instagram } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { useRapat } from '../../hooks/useRapat';
import { usePengumuman } from '../../hooks/usePengumuman';
import { useAnggota } from '../../hooks/useAnggota';
import { useLanguageStore } from '../../store/useLanguageStore';
import { formatDate, cn } from '../../lib/utils';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';

import DynamicGreeting from './DynamicGreeting';

export default function SekretarisDashboard() {
  const { user } = useAuth();
  const { rapatList, presensiList } = useRapat();
  const { pengumumanList } = usePengumuman();
  const { anggotaList } = useAnggota();
  const { t } = useLanguageStore();
  
  const myRecord = anggotaList.find(a => a.userId === user?.uid || a.id === user?.uid);
  const displayName = myRecord?.namaLengkap || user?.username || 'Anggota';
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
    { label: t('total_members'), value: `${anggotaAktif.length} ${t('person')}`, icon: Users, bg: 'bg-white' },
    { label: t('meetings_done'), value: `${rapatList.filter(r => r.tanggal < new Date()).length}`, icon: ClipboardList, bg: 'bg-white' },
    { label: t('active_announcements'), value: `${pengumumanList.length}`, icon: Megaphone, bg: 'bg-white' },
  ];

  return (
    <div className="p-8 space-y-8 bg-gray-50 dark:bg-slate-950 min-h-full transition-colors duration-300">
      <DynamicGreeting name={displayName} />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {stats.map((stat, i) => (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            key={stat.label}
            className={cn("p-6 rounded-2xl border border-gray-200 dark:border-slate-800 shadow-sm bg-white dark:bg-slate-900")}
          >
            <div className="p-2.5 bg-slate-50 dark:bg-slate-800 rounded-xl w-fit mb-4">
              <stat.icon className="w-5 h-5 text-slate-600 dark:text-slate-400" />
            </div>
            <p className="text-[11px] font-bold text-gray-400 dark:text-slate-500 uppercase tracking-widest mb-1">{stat.label}</p>
            <p className="text-2xl font-semibold text-slate-900 dark:text-white tracking-tight">{stat.value}</p>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Jadwal Rapat */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-2xl p-8 flex flex-col justify-between shadow-sm min-h-[350px]">
           <div>
             <h2 className="text-[11px] font-bold text-gray-400 dark:text-slate-500 uppercase tracking-[0.1em] mb-8">{t('upcoming_meeting')}</h2>
             {upcomingRapat ? (
               <div className="space-y-8">
                 <h3 className="text-3xl font-semibold leading-tight tracking-tight text-slate-900 dark:text-white">{upcomingRapat.judul}</h3>
                 <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="flex items-center gap-3 text-gray-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl">
                      <Calendar className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                      <span className="font-semibold text-sm">{formatDate(upcomingRapat.tanggal)}</span>
                    </div>
                    <div className="flex items-center gap-3 text-gray-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl">
                      <Clock className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                      <span className="font-mono text-sm">{upcomingRapat.waktuMulai} - {upcomingRapat.waktuSelesai}</span>
                    </div>
                    <div className="flex items-center gap-3 text-gray-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl">
                      <MapPin className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                      <span className="text-sm font-medium">{upcomingRapat.tempat}</span>
                    </div>
                 </div>
               </div>
             ) : (
               <div className="py-12 text-center text-gray-300 dark:text-slate-600 italic border border-dashed border-gray-200 dark:border-slate-800 rounded-2xl">{t('no_upcoming_meetings')}</div>
             )}
           </div>
           {upcomingRapat && (
             <Link to="/rapat" className="mt-10 self-start px-6 py-2.5 bg-slate-900 dark:bg-blue-600 text-white rounded-lg font-semibold text-sm tracking-tight hover:bg-slate-800 dark:hover:bg-blue-700 transition-colors shadow-sm">
               {t('manage_meeting')}
             </Link>
           )}
        </div>

        {/* Ringkasan & Pengumuman */}
        <div className="space-y-6">
           <div className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-200 dark:border-slate-800 p-6 shadow-sm">
             <div className="flex justify-between items-center mb-6">
               <h2 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-widest">{t('last_presence')}</h2>
               {lastRapat && <span className="text-[10px] font-mono text-gray-400 dark:text-slate-500 font-bold">{formatDate(lastRapat.tanggal)}</span>}
             </div>
             {lastRapat ? (
               <div className="flex items-center gap-6">
                  <div className="text-center">
                    <p className="text-3xl font-bold text-slate-900 dark:text-white">{hadirCount}</p>
                    <p className="text-[10px] font-bold uppercase text-gray-400 dark:text-slate-500 tracking-wider">{t('present')}</p>
                  </div>
                  <div className="flex-1">
                    <div className="h-2 bg-gray-100 dark:bg-slate-800 rounded-full overflow-hidden flex">
                       <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${(hadirCount / anggotaAktif.length) * 100}%` }}
                        className="bg-blue-600 dark:bg-blue-500 h-full rounded-full"
                       />
                    </div>
                    <p className="text-[10px] text-gray-400 dark:text-slate-500 mt-2 font-bold uppercase tracking-tighter">{(hadirCount / anggotaAktif.length * 100).toFixed(0)}% {t('participation')}</p>
                  </div>
               </div>
             ) : (
               <div className="text-center py-6 text-gray-300 dark:text-slate-600 italic">{t('empty_label')}</div>
             )}
           </div>

           <div className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-200 dark:border-slate-800 p-6 shadow-sm flex flex-col">
             <div className="flex justify-between items-center mb-6">
               <h2 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-widest">{t('org_news')}</h2>
               <Link to="/pengumuman" className="p-1 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg transition-colors"><ChevronRight className="w-5 h-5 text-gray-400 dark:text-slate-500" /></Link>
             </div>
             <div className="space-y-3">
               {pengumumanList.slice(0, 3).map(p => (
                 <Link key={p.id} to="/pengumuman" className="block p-3.5 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-transparent hover:border-gray-200 dark:hover:border-slate-700 transition-all group">
                    <h4 className="font-semibold text-xs text-slate-900 dark:text-white line-clamp-1 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">{p.judul}</h4>
                    <p className="text-[9px] text-gray-400 dark:text-slate-500 font-bold uppercase tracking-widest mt-1">{formatDate(p.tanggalDibuat)}</p>
                 </Link>
               ))}
               {pengumumanList.length === 0 && <p className="text-center text-gray-300 dark:text-slate-600 italic py-4 text-xs">{t('empty_label')}</p>}
             </div>
           </div>

           <div className="bg-gradient-to-br from-purple-600 to-pink-500 rounded-2xl p-[1px] shadow-sm overflow-hidden mt-2">
             <div className="bg-white dark:bg-slate-900 p-5 rounded-[calc(1rem-1px)]">
               <div className="flex items-center gap-3 mb-4">
                 <div className="p-2 bg-pink-50 dark:bg-pink-900/30 text-pink-600 dark:text-pink-400 rounded-lg">
                    <Instagram className="w-5 h-5" />
                 </div>
                 <div>
                   <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">Instagram Resmi</h3>
                   <p className="text-[10px] font-bold text-pink-500">@orbin_est.17</p>
                 </div>
               </div>
               <a
                  href="https://www.instagram.com/orbin_est.17"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full flex items-center justify-center gap-2 py-2.5 bg-slate-900 dark:bg-pink-600 text-white rounded-xl font-bold text-center text-[10px] uppercase tracking-widest hover:opacity-90 transition-all shadow-md"
                >
                  Kunjungi Profil
                </a>
             </div>
           </div>
        </div>
      </div>
    </div>
  );
}
