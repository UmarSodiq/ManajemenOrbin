/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { 
  Megaphone, 
  Calendar, 
  Vote, 
  Camera, 
  ChevronRight,
  TrendingUp,
  Users,
  ClipboardList,
  Wallet,
  User as UserIcon,
  CheckCircle2,
  Instagram
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { useAuth } from '../../hooks/useAuth';
import { usePengumuman } from '../../hooks/usePengumuman';
import { useRapat } from '../../hooks/useRapat';
import { usePolling } from '../../hooks/usePolling';
import { useKeuangan } from '../../hooks/useKeuangan';
import { useAnggota } from '../../hooks/useAnggota';
import { useLanguageStore } from '../../store/useLanguageStore';

export default function AnggotaDashboard() {
  const { user } = useAuth();
  const { t } = useLanguageStore();
  const { pengumumanList, isLoading: loadingP } = usePengumuman();
  const { rapatList, presensiList, isLoading: loadingR } = useRapat();
  const { polls, isLoading: loadingPoll } = usePolling();
  const { iuranList } = useKeuangan();
  const { anggotaList } = useAnggota();

  const myRecord = anggotaList.find(a => a.userId === user?.uid || a.namaLengkap.toLowerCase() === user?.username.toLowerCase());
  const myIuranCount = iuranList.filter(i => i.anggotaId === myRecord?.id).length;
  const myAttendance = presensiList.filter(p => p.anggotaId === myRecord?.id && p.status === 'hadir').length;

  const activePolling = polls.filter(p => p.status === 'aktif');
  const latestPengumuman = pengumumanList.slice(0, 3);
  const nextRapat = rapatList
    .filter(r => new Date(r.tanggal) >= new Date())
    .sort((a, b) => new Date(a.tanggal).getTime() - new Date(b.tanggal).getTime())[0];

  return (
    <div className="p-4 sm:p-8 max-w-7xl mx-auto space-y-8 bg-gray-50 dark:bg-slate-950 min-h-screen">
      {/* Header */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
            Halo, {user?.username}! 👋
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">Selamat datang di portal anggota orbin</p>
        </motion.div>
        
        <div className="flex items-center gap-3">
          <Link to="/profil" className="flex items-center gap-3 bg-white dark:bg-slate-900 p-2 border border-gray-100 dark:border-slate-800 rounded-2xl shadow-sm hover:shadow-md transition-all">
            <div className="px-4 py-2 bg-blue-50 dark:bg-blue-900/40 rounded-xl text-blue-700 dark:text-blue-400 text-sm font-bold flex items-center gap-2">
              <UserIcon className="w-4 h-4" />
              Profil Saya
            </div>
          </Link>
        </div>
      </header>

      {/* Stats Quick View */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-800 p-4 rounded-3xl border border-gray-100 dark:border-slate-700 shadow-sm">
          <p className="text-[10px] font-bold text-gray-400 dark:text-slate-500 uppercase tracking-widest mb-1">Status Iuran</p>
          <div className="flex items-center gap-2">
            <Wallet className="w-4 h-4 text-green-600 dark:text-green-400" />
            <span className="text-lg font-bold text-slate-900 dark:text-white">{myIuranCount} Terbayar</span>
          </div>
        </div>
        <div className="bg-white dark:bg-slate-800 p-4 rounded-3xl border border-gray-100 dark:border-slate-700 shadow-sm">
          <p className="text-[10px] font-bold text-gray-400 dark:text-slate-500 uppercase tracking-widest mb-1">Kehadiran</p>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            <span className="text-lg font-bold text-slate-900 dark:text-white">{myAttendance} Rapat</span>
          </div>
        </div>
        <div className="bg-white dark:bg-slate-800 p-4 rounded-3xl border border-gray-100 dark:border-slate-700 shadow-sm">
          <p className="text-[10px] font-bold text-gray-400 dark:text-slate-500 uppercase tracking-widest mb-1">Polling Aktif</p>
          <div className="flex items-center gap-2">
            <Vote className="w-4 h-4 text-amber-600 dark:text-amber-400" />
            <span className="text-lg font-bold text-slate-900 dark:text-white">{activePolling.length} Tersedia</span>
          </div>
        </div>
        <div className="bg-white dark:bg-slate-800 p-4 rounded-3xl border border-gray-100 dark:border-slate-700 shadow-sm">
          <p className="text-[10px] font-bold text-gray-400 dark:text-slate-500 uppercase tracking-widest mb-1">Jabatan</p>
          <div className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
            <span className="text-lg font-bold text-slate-900 dark:text-white truncate">{myRecord?.jabatan || 'Anggota'}</span>
          </div>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* News & Announcements */}
        <section className="lg:col-span-2 space-y-6">
          <div className="flex items-baseline justify-between">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Megaphone className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              {t('announcement')}
            </h2>
            <Link to="/pengumuman" className="text-sm font-bold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1">
              Lihat Semua <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-1 gap-4">
            {loadingP ? (
              [1, 2].map(i => (
                <div key={i} className="h-32 bg-gray-100 dark:bg-slate-800 animate-pulse rounded-2xl" />
              ))
            ) : latestPengumuman.length > 0 ? (
              latestPengumuman.map((item, index) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-white dark:bg-slate-800 p-6 rounded-3xl border border-gray-100 dark:border-slate-700 shadow-sm hover:shadow-md transition-all group"
                >
                  <div className="flex justify-between items-start mb-3">
                    <span className="px-3 py-1 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 text-[10px] font-bold uppercase tracking-wider rounded-full">
                      Terbaru
                    </span>
                    <span className="text-xs text-gray-400 dark:text-slate-500 font-mono">
                      {new Date(item.tanggalDibuat).toLocaleDateString('id-ID')}
                    </span>
                  </div>
                  <h3 className="font-bold text-lg text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors mb-2">
                    {item.judul}
                  </h3>
                  <p className="text-gray-500 dark:text-slate-400 text-sm line-clamp-2 leading-relaxed">
                    {item.isi}
                  </p>
                </motion.div>
              ))
            ) : (
              <div className="bg-slate-50 dark:bg-slate-800/50 border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-3xl p-12 text-center text-gray-400 dark:text-slate-500">
                Belum ada pengumuman baru.
              </div>
            )}
          </div>
        </section>

        {/* Sidebar Features */}
        <aside className="space-y-8">
          {/* Active Polls */}
          <div className="space-y-4">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Vote className="w-5 h-5 text-amber-600" />
              E-Voting Aktif
            </h2>
            {loadingPoll ? (
              <div className="h-40 bg-gray-100 dark:bg-slate-800 animate-pulse rounded-2xl" />
            ) : activePolling.length > 0 ? (
              <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="bg-amber-50 dark:bg-amber-900/20 border border-amber-100 dark:border-amber-900/30 p-6 rounded-3xl"
              >
                <h3 className="font-bold text-amber-900 dark:text-amber-200 mb-2">{activePolling[0].judul}</h3>
                <p className="text-amber-800 dark:text-amber-400 text-sm mb-4 line-clamp-2">
                  {activePolling[0].deskripsi || 'Berikan suara Anda sekarang!'}
                </p>
                <Link
                  to={`/polling/${activePolling[0].id}`}
                  className="w-full flex items-center justify-center gap-2 py-3 bg-amber-600 text-white rounded-xl font-bold text-sm hover:bg-amber-700 transition-colors"
                >
                  Ikut Memilih <ChevronRight className="w-4 h-4" />
                </Link>
              </motion.div>
            ) : (
              <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl border border-gray-100 dark:border-slate-700 text-center text-gray-400 dark:text-slate-500 text-sm italic">
                Tidak ada pemungutan suara aktif.
              </div>
            )}
          </div>

          {/* Next Meeting */}
          <div className="space-y-4">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <ClipboardList className="w-5 h-5 text-green-600" />
              Agenda Rapat
            </h2>
            {loadingR ? (
              <div className="h-40 bg-gray-100 dark:bg-slate-800 animate-pulse rounded-2xl" />
            ) : nextRapat ? (
              <div className="bg-green-50 dark:bg-green-900/20 border border-green-100 dark:border-green-900/30 p-6 rounded-3xl">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 bg-white dark:bg-slate-900 rounded-2xl flex flex-col items-center justify-center shadow-sm">
                    <span className="text-[10px] font-bold text-green-600 dark:text-green-400 uppercase">
                      {new Intl.DateTimeFormat('id-ID', { month: 'short' }).format(new Date(nextRapat.tanggal))}
                    </span>
                    <span className="text-lg font-bold text-green-900 dark:text-green-200 leading-tight">
                      {new Date(nextRapat.tanggal).getDate()}
                    </span>
                  </div>
                  <div>
                    <h3 className="font-bold text-green-900 dark:text-green-200 text-sm">{nextRapat.judul}</h3>
                    <p className="text-green-700 dark:text-green-400 text-[10px] font-mono">{nextRapat.waktuMulai} - {nextRapat.waktuSelesai}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-xs text-green-700 dark:text-green-400 mb-4">
                  <Calendar className="w-4 h-4" />
                  <span>{nextRapat.tempat}</span>
                </div>
                <Link
                  to="/rapat"
                  className="w-full flex items-center justify-center gap-2 py-3 bg-green-600 text-white rounded-xl font-bold text-sm hover:bg-green-700 transition-colors"
                >
                  Detail Agenda
                </Link>
              </div>
            ) : (
              <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl border border-gray-100 dark:border-slate-700 text-center text-gray-400 dark:text-slate-500 text-sm italic">
                Belum ada jadwal rapat terdekat.
              </div>
            )}
          </div>

          {/* Social Media */}
          <div className="bg-gradient-to-br from-purple-600 via-pink-500 to-orange-400 p-[1px] rounded-3xl shadow-lg">
            <div className="bg-white dark:bg-slate-800 p-6 rounded-[calc(1.5rem-1px)] h-full">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-pink-100 dark:bg-pink-900/30 text-pink-600 dark:text-pink-400 rounded-xl flex items-center justify-center">
                  <Instagram className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 dark:text-white text-sm">Instagram Resmi</h3>
                  <p className="text-pink-500 text-[10px] font-bold">@orbin_est.17</p>
                </div>
              </div>
              <p className="text-gray-500 dark:text-slate-400 text-xs mb-4 leading-relaxed">
                Pantau terus kegiatan terbaru kita di Instagram. Jangan lupa tag @orbin_est.17 ya!
              </p>
              <a
                href="https://www.instagram.com/orbin_est.17"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full flex items-center justify-center gap-2 py-3 bg-slate-900 dark:bg-pink-600 text-white rounded-xl font-bold text-sm hover:opacity-90 transition-all shadow-md"
              >
                Ikuti Sekarang
              </a>
            </div>
          </div>
        </aside>
      </div>

      {/* Quick Access Grid */}
      <section className="space-y-6">
        <h2 className="text-xl font-bold text-slate-900 dark:text-white">Akses Cepat</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Link to="/galeri" className="bg-white dark:bg-slate-800 p-6 rounded-3xl border border-gray-100 dark:border-slate-700 shadow-sm hover:shadow-md transition-all group flex flex-col items-center text-center gap-3">
            <div className="w-12 h-12 bg-pink-50 dark:bg-pink-900/20 rounded-2xl flex items-center justify-center text-pink-600 dark:text-pink-400 group-hover:bg-pink-600 group-hover:text-white transition-all">
              <Camera className="w-6 h-6" />
            </div>
            <span className="font-bold text-sm text-slate-900 dark:text-white">Galeri Foto</span>
          </Link>
          <Link to="/kalender" className="bg-white dark:bg-slate-800 p-6 rounded-3xl border border-gray-100 dark:border-slate-700 shadow-sm hover:shadow-md transition-all group flex flex-col items-center text-center gap-3">
            <div className="w-12 h-12 bg-indigo-50 dark:bg-indigo-900/20 rounded-2xl flex items-center justify-center text-indigo-600 dark:text-indigo-400 group-hover:bg-indigo-600 group-hover:text-white transition-all">
              <Calendar className="w-6 h-6" />
            </div>
            <span className="font-bold text-sm text-slate-900 dark:text-white">Kalender</span>
          </Link>
          <Link to="/pengumuman" className="bg-white dark:bg-slate-800 p-6 rounded-3xl border border-gray-100 dark:border-slate-700 shadow-sm hover:shadow-md transition-all group flex flex-col items-center text-center gap-3">
            <div className="w-12 h-12 bg-blue-50 dark:bg-blue-900/20 rounded-2xl flex items-center justify-center text-blue-600 dark:text-blue-400 group-hover:bg-blue-600 group-hover:text-white transition-all">
              <Megaphone className="w-6 h-6" />
            </div>
            <span className="font-bold text-sm text-slate-900 dark:text-white">Pengumuman</span>
          </Link>
          <Link to="/polling" className="bg-white dark:bg-slate-800 p-6 rounded-3xl border border-gray-100 dark:border-slate-700 shadow-sm hover:shadow-md transition-all group flex flex-col items-center text-center gap-3">
            <div className="w-12 h-12 bg-amber-50 dark:bg-amber-900/20 rounded-2xl flex items-center justify-center text-amber-600 dark:text-amber-400 group-hover:bg-amber-600 group-hover:text-white transition-all">
              <Vote className="w-6 h-6" />
            </div>
            <span className="font-bold text-sm text-slate-900 dark:text-white">E-Voting</span>
          </Link>
        </div>
      </section>
    </div>
  );
}
