/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Wallet, Users, ArrowUpCircle, Megaphone, ArrowDownRight, ChevronRight } from 'lucide-react';
import { useKeuangan } from '../../hooks/useKeuangan';
import { usePengumuman } from '../../hooks/usePengumuman';
import { useAnggota } from '../../hooks/useAnggota';
import { formatCurrency, formatDate, cn } from '../../lib/utils';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';

export default function BendaharaDashboard() {
  const { saldoKas, kasMasukList, kasKeluarList, iuranList } = useKeuangan();
  const { pengumumanList } = usePengumuman();
  const { anggotaList } = useAnggota();
  
  const currentMonth = new Date().getMonth() + 1;
  const currentYear = new Date().getFullYear();
  const periode = `${currentYear}-${String(currentMonth).padStart(2, '0')}`;

  const anggotaAktif = anggotaList.filter(a => a.status === 'aktif');
  const belumBayarCount = anggotaAktif.filter(a => 
    !iuranList.some(i => i.anggotaId === a.id && i.periode === periode)
  ).length;

  const latestTransactions = [
    ...kasMasukList.map(item => ({ ...item, type: 'masuk' })),
    ...kasKeluarList.map(item => ({ ...item, type: 'keluar' }))
  ].sort((a, b) => b.tanggal.getTime() - a.tanggal.getTime()).slice(0, 5);

  const stats = [
    { label: 'Total Saldo Kas', value: formatCurrency(saldoKas), icon: Wallet, color: 'text-slate-900', bg: 'bg-white' },
    { label: 'Belum Bayar Iuran', value: `${belumBayarCount} Orang`, icon: Users, color: 'text-blue-600', bg: 'bg-white' },
    { label: 'Anggota Aktif', value: `${anggotaAktif.length} Jiwa`, icon: Users, color: 'text-slate-600', bg: 'bg-white' },
  ];

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-8 bg-gray-50 min-h-full">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">Selamat Datang, Bendahara</h1>
          <p className="text-xs sm:text-sm text-gray-500 mt-1">Status keuangan organisasi hari ini.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        {stats.map((stat, i) => (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            key={stat.label}
            className={cn("p-5 sm:p-6 rounded-2xl border border-gray-200 shadow-sm bg-white")}
          >
            <div className="flex justify-between items-start mb-4">
              <div className="p-2.5 bg-slate-50 rounded-xl">
                <stat.icon className="w-5 h-5 text-slate-600" />
              </div>
            </div>
            <p className="text-[10px] sm:text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-1">{stat.label}</p>
            <p className={cn("text-xl sm:text-2xl font-semibold tracking-tight", stat.color)}>{stat.value}</p>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden flex flex-col">
          <div className="p-6 border-b border-gray-100 flex justify-between items-center">
            <h2 className="text-sm font-semibold text-slate-900 uppercase tracking-wider">Transaksi Terbaru</h2>
            <Link to="/bendahara/laporan" className="text-xs font-medium text-blue-600 hover:underline flex items-center gap-1">
              Semua Laporan <ChevronRight className="w-3 h-3" />
            </Link>
          </div>
          <div className="flex-1 divide-y divide-gray-50">
            {latestTransactions.length === 0 ? (
              <div className="p-12 text-center text-gray-300 italic">Belum ada transaksi tercatat.</div>
            ) : latestTransactions.map(t => (
              <div key={t.id} className="p-5 flex justify-between items-center hover:bg-slate-50/50 transition-colors">
                <div className="flex items-center gap-4">
                   <div className={cn(
                     "w-10 h-10 rounded-xl flex items-center justify-center",
                     t.type === 'masuk' ? "bg-blue-50 text-blue-600" : "bg-red-50 text-red-600"
                   )}>
                     {t.type === 'masuk' ? <ArrowUpCircle className="w-5 h-5" /> : <ArrowDownRight className="w-5 h-5" />}
                   </div>
                   <div>
                     <p className="font-semibold text-sm text-slate-900">{t.keterangan}</p>
                     <p className="text-[10px] text-gray-400 font-mono mt-0.5">{formatDate(t.tanggal)}</p>
                   </div>
                </div>
                <p className={cn(
                  "font-bold text-sm font-mono",
                  t.type === 'masuk' ? "text-blue-600" : "text-red-600"
                )}>
                  {t.type === 'masuk' ? '+' : '-'} {formatCurrency(t.jumlah)}
                </p>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden flex flex-col">
          <div className="p-6 border-b border-gray-100 flex justify-between items-center">
            <h2 className="text-sm font-semibold text-slate-900 uppercase tracking-wider">Pengumuman</h2>
            <Link to="/sekretaris/pengumuman" className="text-xs font-medium text-blue-600 hover:underline flex items-center gap-1">
              Lihat Semua <ChevronRight className="w-3 h-3" />
            </Link>
          </div>
          <div className="flex-1 p-6 space-y-5">
            {pengumumanList.length === 0 ? (
              <div className="text-center text-gray-300 italic py-10">Belum ada pengumuman.</div>
            ) : pengumumanList.slice(0, 4).map(p => (
              <Link key={p.id} to="/sekretaris/pengumuman" className="block group">
                <div className="flex gap-3">
                  <div className="w-1 bg-gray-100 group-hover:bg-blue-600 rounded-full transition-all" />
                  <div>
                    <h3 className="font-semibold text-sm text-slate-800 group-hover:text-blue-600 transition-colors line-clamp-1">{p.judul}</h3>
                    <p className="text-[10px] font-mono text-gray-400 mt-1 uppercase tracking-widest">{formatDate(p.tanggalDibuat)}</p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
          <div className="p-4 mt-auto">
            <div className="p-4 bg-blue-50 rounded-xl border border-blue-100">
               <p className="text-xs text-blue-600 font-bold mb-1">Status Keuangan</p>
               <p className="text-[10px] text-blue-400">Verifikasi saldo terakhir dilakukan hari ini oleh sistem.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
