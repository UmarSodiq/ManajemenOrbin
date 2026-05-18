/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Wallet, Users, ArrowUpCircle, Megaphone, ArrowDownRight, ChevronRight, Instagram } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { useKeuangan } from '../../hooks/useKeuangan';
import { usePengumuman } from '../../hooks/usePengumuman';
import { useAnggota } from '../../hooks/useAnggota';
import { useLanguageStore } from '../../store/useLanguageStore';
import { formatCurrency, formatDate, cn } from '../../lib/utils';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';

import DynamicGreeting from './DynamicGreeting';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

export default function BendaharaDashboard() {
  const { user } = useAuth();
  const { saldoKas, kasMasukList, kasKeluarList, iuranList } = useKeuangan();
  const { pengumumanList } = usePengumuman();
  const { anggotaList } = useAnggota();
  const { t } = useLanguageStore();
  
  const myRecord = anggotaList.find(a => a.userId === user?.uid || a.id === user?.uid);
  const displayName = myRecord?.namaLengkap || user?.username || 'Anggota';
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

  const chartData = [
    { name: 'Masuk', value: kasMasukList.reduce((acc, curr) => acc + curr.jumlah, 0), color: '#10B981' },
    { name: 'Keluar', value: kasKeluarList.reduce((acc, curr) => acc + curr.jumlah, 0), color: '#EF4444' },
  ];

  const stats = [
    { label: t('total_balance'), value: formatCurrency(saldoKas), icon: Wallet, color: 'text-slate-900 dark:text-white', bg: 'bg-white' },
    { label: t('unpaid_dues'), value: `${belumBayarCount} ${t('person')}`, icon: Users, color: 'text-blue-600 dark:text-blue-400', bg: 'bg-white' },
    { label: t('active_members'), value: `${anggotaAktif.length} ${t('soul')}`, icon: Users, color: 'text-slate-600 dark:text-slate-400', bg: 'bg-white' },
  ];

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-8 bg-gray-50 dark:bg-slate-950 min-h-full transition-colors duration-300">
      <DynamicGreeting name={displayName} />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        {stats.map((stat, i) => (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            key={stat.label}
            className={cn("p-5 sm:p-6 rounded-2xl border border-gray-200 dark:border-slate-800 shadow-sm bg-white dark:bg-slate-900")}
          >
            <div className="flex justify-between items-start mb-4">
              <div className="p-2.5 bg-slate-50 dark:bg-slate-800 rounded-xl">
                <stat.icon className="w-5 h-5 text-slate-600 dark:text-slate-400" />
              </div>
            </div>
            <p className="text-[10px] sm:text-[11px] font-bold text-gray-400 dark:text-slate-500 uppercase tracking-widest mb-1">{stat.label}</p>
            <p className={cn("text-xl sm:text-2xl font-semibold tracking-tight", stat.color)}>{stat.value}</p>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Latest Transactions */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-2xl border border-gray-200 dark:border-slate-800 shadow-sm overflow-hidden flex flex-col">
          <div className="p-6 border-b border-gray-100 dark:border-slate-800 flex justify-between items-center">
            <h2 className="text-sm font-semibold text-slate-900 dark:text-white uppercase tracking-wider">{t('latest_transactions')}</h2>
            <Link to="/bendahara/laporan" className="text-xs font-medium text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1">
              {t('all_reports')} <ChevronRight className="w-3 h-3" />
            </Link>
          </div>
          <div className="flex-1 divide-y divide-gray-50 dark:divide-slate-800">
            {latestTransactions.length === 0 ? (
              <div className="p-12 text-center text-gray-300 dark:text-slate-600 italic">{t('no_transactions')}</div>
            ) : latestTransactions.map(t_item => (
              <div key={t_item.id} className="p-5 flex justify-between items-center hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-colors">
                <div className="flex items-center gap-4">
                   <div className={cn(
                     "w-10 h-10 rounded-xl flex items-center justify-center",
                     t_item.type === 'masuk' ? "bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400" : "bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400"
                   )}>
                     {t_item.type === 'masuk' ? <ArrowUpCircle className="w-5 h-5" /> : <ArrowDownRight className="w-5 h-5" />}
                   </div>
                   <div>
                     <p className="font-semibold text-sm text-slate-900 dark:text-white">{t_item.keterangan}</p>
                     <p className="text-[10px] text-gray-400 dark:text-slate-500 font-mono mt-0.5">{formatDate(t_item.tanggal)}</p>
                   </div>
                </div>
                <p className={cn(
                   "font-bold text-sm font-mono",
                   t_item.type === 'masuk' ? "text-blue-600 dark:text-blue-400" : "text-red-600 dark:text-red-400"
                )}>
                  {t_item.type === 'masuk' ? '+' : '-'} {formatCurrency(t_item.jumlah)}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Financial Pulse Chart - UNIQUE FEATURE */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-200 dark:border-slate-800 shadow-sm p-6 flex flex-col">
          <h2 className="text-sm font-semibold text-slate-900 dark:text-white uppercase tracking-wider mb-6">Arus Kas Organisasi</h2>
          <div className="flex-1 min-h-[250px]">
             <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                   <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={process.env.NODE_ENV === 'production' ? '#334155' : '#e2e8f0'} />
                   <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fontWeight: 600 }} />
                   <Tooltip 
                     cursor={{ fill: 'transparent' }}
                     contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                   />
                   <Bar dataKey="value" radius={[10, 10, 0, 0]}>
                      {chartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                   </Bar>
                </BarChart>
             </ResponsiveContainer>
          </div>
          <div className="mt-4 pt-4 border-t border-gray-50 dark:border-slate-800 text-center">
             <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest leading-loose">Visualisasi data real-time untuk transparansi keuangan remaja.</p>
          </div>
        </div>
      </div>

      <div className="bg-gradient-to-br from-purple-600 via-pink-500 to-orange-400 p-[1px] rounded-2xl shadow-sm overflow-hidden">
        <div className="bg-white dark:bg-slate-900 p-6 rounded-[calc(1rem-1px)] flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-pink-50 dark:bg-pink-900/30 text-pink-600 dark:text-pink-400 rounded-2xl shadow-inner">
              <Instagram className="w-8 h-8" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 dark:text-white">Instagram Organisasi</h3>
              <p className="text-pink-500 font-mono text-sm">@orbin_est.17</p>
            </div>
          </div>
          <p className="text-gray-500 dark:text-slate-400 text-sm max-w-md text-center md:text-left">
            Bagikan laporan kegiatan terbaru dan dokumentasi visual organisasi melalui akun Instagram resmi kita.
          </p>
          <a
            href="https://www.instagram.com/orbin_est.17"
            target="_blank"
            rel="noopener noreferrer"
            className="px-8 py-3 bg-slate-900 dark:bg-pink-600 text-white rounded-xl font-bold text-sm hover:opacity-90 transition-all shadow-lg text-center"
          >
            Kunjungi Instagram
          </a>
        </div>
      </div>
    </div>
  );
}
