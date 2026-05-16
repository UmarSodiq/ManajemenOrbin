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
    { label: 'Total Saldo Kas', value: saldoKas, icon: Wallet, color: 'text-[var(--text-primary)]', bg: 'bg-white', isCurrency: true },
    { label: 'Belum Bayar Iuran', value: `${belumBayarCount} Orang`, icon: Users, color: 'text-blue-600', bg: 'bg-white' },
    { label: 'Anggota Aktif', value: `${anggotaAktif.length} Jiwa`, icon: Users, color: 'text-[var(--text-secondary)]', bg: 'bg-white' },
  ];

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[var(--text-primary)]">Dasbor Bendahara</h1>
          <p className="text-sm text-[var(--text-secondary)] mt-1">Ringkasan aktivitas keuangan organisasi Anda.</p>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="text-right hidden sm:block">
            <p className="text-[11px] font-semibold text-[var(--text-muted)] font-mono">SINKRONISASI AKTIF</p>
            <p className="text-xs font-bold text-green-600 dark:text-green-500">{new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
          </div>
        </div>
      </header>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {stats.map((stat, i) => (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            key={stat.label}
            className="p-6 card-base relative group"
          >
            <div className={cn(
              "w-12 h-12 rounded-xl flex items-center justify-center mb-4 transition-colors",
              stat.color.includes('blue') ? "bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400" : stat.color.includes('red') ? "bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400" : "bg-slate-50 dark:bg-white/5 text-[var(--text-secondary)]"
            )}>
              <stat.icon className="w-6 h-6" />
            </div>
            <p className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider mb-1">{stat.label}</p>
            <p className={cn("text-2xl font-bold tracking-tight", stat.color)}>
              {stat.isCurrency ? formatCurrency(stat.value as number) : stat.value}
            </p>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card-base flex flex-col">
          <div className="p-6 border-b border-slate-100 dark:border-white/5 flex justify-between items-center">
            <h2 className="font-bold text-[var(--text-primary)]">Transaksi Terakhir</h2>
            <Link to="/bendahara/laporan" className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 flex items-center gap-1 transition-colors">
              Lihat Semua <ChevronRight className="w-3 h-3" />
            </Link>
          </div>
          <div className="divide-y divide-slate-50 dark:divide-white/5 overflow-y-auto max-h-[400px]">
             {latestTransactions.length === 0 ? (
               <div className="p-12 text-center text-slate-400 italic text-sm">Tidak ada transaksi baru.</div>
             ) : latestTransactions.map(t => (
               <div key={t.id} className="p-4 flex justify-between items-center hover:bg-slate-50 dark:hover:bg-white/5 transition-colors">
                 <div className="flex items-center gap-3">
                    <div className={cn(
                      "w-10 h-10 rounded-lg flex items-center justify-center",
                      t.type === 'masuk' ? "bg-blue-50 dark:bg-blue-900/20 text-blue-600" : "bg-red-50 dark:bg-red-900/20 text-red-600"
                    )}>
                      {t.type === 'masuk' ? <ArrowUpCircle className="w-5 h-5" /> : <ArrowDownRight className="w-5 h-5" />}
                    </div>
                    <div>
                      <p className="font-semibold text-sm text-[var(--text-primary)]">{t.keterangan}</p>
                      <p className="text-[11px] text-[var(--text-muted)]">{formatDate(t.tanggal)}</p>
                    </div>
                 </div>
                 <p className={cn("font-bold text-sm", t.type === 'masuk' ? "text-blue-600" : "text-red-500")}>
                   {t.type === 'masuk' ? '+' : '-'} {formatCurrency(t.jumlah)}
                 </p>
               </div>
             ))}
          </div>
        </div>

        <div className="card-base flex flex-col">
          <div className="p-6 border-b border-slate-100 dark:border-white/5 flex justify-between items-center">
            <h2 className="font-bold text-[var(--text-primary)]">Pengumuman Terbaru</h2>
            <Link to="/sekretaris/pengumuman" className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 flex items-center gap-1">
               Lihat Semua <ChevronRight className="w-3 h-3" />
            </Link>
          </div>
          <div className="p-4 space-y-3">
             {pengumumanList.length === 0 ? (
               <div className="p-12 text-center text-[var(--text-muted)] italic text-sm">Belum ada pengumuman.</div>
             ) : pengumumanList.slice(0, 4).map(p => (
               <Link key={p.id} to="/sekretaris/pengumuman" className="block p-4 bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/5 rounded-xl hover:border-blue-200 dark:hover:border-blue-900/50 hover:bg-blue-50 dark:hover:bg-blue-900/10 transition-all group">
                 <h3 className="font-bold text-sm text-[var(--text-primary)] group-hover:text-blue-700 dark:group-hover:text-blue-400 transition-colors uppercase tracking-tight">{p.judul}</h3>
                 <p className="text-[11px] text-[var(--text-muted)] mt-1">{formatDate(p.tanggalDibuat)}</p>
               </Link>
             ))}
          </div>
          <div className="mt-auto p-4 border-t border-[var(--border-base)] bg-[var(--bg-main)]/50">
             <div className="flex items-center gap-3 text-[var(--text-muted)] text-xs p-2">
                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                <p>Status: Sistem Keuangan Terpusat</p>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
}
