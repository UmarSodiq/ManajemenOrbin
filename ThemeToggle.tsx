/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { FileText, Download, Filter, ArrowUpCircle, ArrowDownCircle, Search, Wallet } from 'lucide-react';
import { useKeuangan } from '../../hooks/useKeuangan';
import { useAnggota } from '../../hooks/useAnggota';
import { cn, formatDate, formatCurrency } from '../../lib/utils';
import { validateRentangTanggal } from '../../utils/validation';
import { motion } from 'motion/react';
import { toJpeg } from 'html-to-image';

export default function LaporanKeuangan() {
  const { kasMasukList, kasKeluarList, iuranList, saldoKas } = useKeuangan();
  const { anggotaList } = useAnggota();
  
  const [startDate, setStartDate] = useState(
    new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0]
  );
  const [endDate, setEndDate] = useState(
    new Date().toISOString().split('T')[0]
  );
  const [isExporting, setIsExporting] = useState(false);

  const transactions = useMemo(() => {
    const list = [
      ...kasMasukList.map(item => ({ ...item, type: 'masuk' })),
      ...kasKeluarList.map(item => ({ ...item, type: 'keluar' }))
    ];

    const start = new Date(startDate);
    const end = new Date(endDate);
    end.setHours(23, 59, 59, 999);

    return list
      .filter(item => item.tanggal >= start && item.tanggal <= end)
      .sort((a, b) => b.tanggal.getTime() - a.tanggal.getTime());
  }, [kasMasukList, kasKeluarList, iuranList, startDate, endDate]);

  const stats = useMemo(() => {
    let masuk = 0;
    let keluar = 0;
    transactions.forEach(t => {
      if (t.type === 'masuk') masuk += t.jumlah;
      else keluar += t.jumlah;
    });
    return { masuk, keluar, saldo: masuk - keluar };
  }, [transactions]);

  const handleDownloadJPG = async () => {
    setIsExporting(true);
    const element = document.getElementById('report-content');
    if (!element) return;

    try {
      const dataUrl = await toJpeg(element, { 
        quality: 0.95,
        backgroundColor: '#ffffff',
        pixelRatio: 2
      });
      
      const link = document.createElement('a');
      link.download = `Laporan_Keuangan_${startDate}_to_${endDate}.jpg`;
      link.href = dataUrl;
      link.click();
    } catch (error) {
      console.error('JPG Download Error:', error);
      alert('Gagal mengunduh Gambar. Silakan coba lagi.');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 bg-gray-50 dark:bg-slate-950 min-h-full">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6 sm:mb-8">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white">Laporan Keuangan</h1>
          <p className="text-xs sm:text-sm text-gray-500 dark:text-slate-400 mt-1">Pantau arus kas dan saldo organisasi secara transparan.</p>
        </div>
        <button
          onClick={handleDownloadJPG}
          disabled={isExporting}
          className="w-full md:w-auto bg-slate-900 dark:bg-blue-600 text-white px-5 py-2.5 rounded-xl flex items-center justify-center gap-2 font-semibold hover:bg-slate-800 dark:hover:bg-blue-700 transition-all shadow-sm disabled:opacity-50"
        >
          {isExporting ? (
            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
             <Download className="w-4 h-4" />
          )}
          <span className="text-sm">Download JPG</span>
        </button>
      </div>

      <div className="bg-white dark:bg-slate-900 p-4 sm:p-6 rounded-2xl border border-gray-200 dark:border-slate-800 shadow-sm mb-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-slate-100 dark:bg-slate-800 rounded-lg">
            <Filter className="w-4 h-4 text-slate-600 dark:text-slate-400" />
          </div>
          <span className="text-[10px] sm:text-[11px] font-bold text-gray-400 dark:text-slate-500 uppercase tracking-widest">Filter Waktu</span>
        </div>
        <div className="flex items-center gap-2 sm:gap-4 w-full md:w-auto">
          <input 
            type="date" 
            value={startDate} 
            onChange={(e) => setStartDate(e.target.value)}
            className="flex-1 md:w-auto bg-slate-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl px-3 sm:px-4 py-2 text-xs sm:text-sm font-medium focus:ring-2 focus:ring-blue-600 transition-all outline-none dark:text-white" 
          />
          <span className="text-gray-300 dark:text-slate-700 font-bold">-</span>
          <input 
            type="date" 
            value={endDate} 
            onChange={(e) => setEndDate(e.target.value)}
            className="flex-1 md:w-auto bg-slate-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl px-3 sm:px-4 py-2 text-xs sm:text-sm font-medium focus:ring-2 focus:ring-blue-600 transition-all outline-none dark:text-white" 
          />
        </div>
      </div>

      <div id="report-content" className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-200 dark:border-slate-800 shadow-sm overflow-hidden p-4 sm:p-8">
        {/* Export Header (Visible in image) */}
        <div className="border-b-4 border-slate-900 dark:border-slate-700 pb-6 mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-black tracking-tighter uppercase leading-none dark:text-white">ORBIN</h1>
            <p className="text-[10px] font-bold text-slate-500 dark:text-slate-400 tracking-[0.2em] mt-1 uppercase">Organisasi Remaja Britania Nglempong</p>
          </div>
          <div className="text-right">
            <h2 className="text-xl font-bold tracking-tight uppercase dark:text-white">LAPORAN KEUANGAN</h2>
            <p className="text-[10px] font-mono font-bold text-slate-400 dark:text-slate-500 mt-1 uppercase tracking-widest">
              Generated: {new Date().toLocaleDateString('id-ID')}
            </p>
          </div>
        </div>

        <div className="border-b border-gray-100 dark:border-slate-800 pb-6 sm:pb-8 mb-6 sm:mb-8 flex flex-col md:flex-row justify-between items-start gap-6">
           <div>
             <h2 className="text-lg sm:text-xl font-bold tracking-tight text-slate-900 dark:text-white uppercase">Rekapitulasi Kas</h2>
             <p className="text-gray-400 dark:text-slate-500 font-mono text-[9px] sm:text-[10px] mt-1 font-bold uppercase tracking-widest">Periode: {formatDate(new Date(startDate))} - {formatDate(new Date(endDate))}</p>
           </div>
           <div className="flex gap-2 sm:gap-4 w-full sm:w-auto">
              <div className="flex-1 sm:px-5 py-3 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-100 dark:border-blue-900/40 text-center sm:text-left">
                <p className="text-[8px] sm:text-[10px] font-bold text-blue-400 dark:text-blue-500 uppercase tracking-widest mb-1">Total Masuk</p>
                <p className="font-bold text-blue-600 dark:text-blue-400 text-sm sm:text-lg">{formatCurrency(stats.masuk)}</p>
              </div>
              <div className="flex-1 sm:px-5 py-3 bg-red-50 dark:bg-red-900/20 rounded-xl border border-red-100 dark:border-red-900/40 text-center sm:text-left">
                <p className="text-[8px] sm:text-[10px] font-bold text-red-300 dark:text-red-400 uppercase tracking-widest mb-1">Total Keluar</p>
                <p className="font-bold text-red-600 dark:text-red-400 text-sm sm:text-lg">{formatCurrency(stats.keluar)}</p>
              </div>
           </div>
        </div>

        {/* Mobile View */}
        <div className="md:hidden space-y-4 mb-6">
          <div className="bg-slate-900 dark:bg-slate-800 text-white rounded-2xl p-6 flex justify-between items-center shadow-lg dark:shadow-none shadow-slate-200">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] opacity-60 mb-1">Kas Bersih</p>
              <h3 className="font-bold text-xl">{formatCurrency(stats.saldo)}</h3>
            </div>
            <div className="p-3 bg-white/10 rounded-xl">
               <Wallet className="w-6 h-6" />
            </div>
          </div>
          
          <div className="space-y-3">
            {transactions.length === 0 ? (
               <div className="py-12 text-center text-gray-300 dark:text-slate-700 italic text-sm border border-dashed border-gray-200 dark:border-slate-800 rounded-2xl">Belum ada transaksi di periode ini.</div>
            ) : transactions.map(t => (
              <div key={t.id} className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-gray-100 dark:border-slate-800 flex justify-between items-center shadow-sm">
                <div className="flex gap-3 items-start min-w-0">
                  <div className={cn(
                    "w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0",
                    t.type === 'masuk' ? "bg-blue-50 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400" : "bg-red-50 dark:bg-red-900/40 text-red-600 dark:text-red-400"
                  )}>
                    {t.type === 'masuk' ? <ArrowUpCircle className="w-4 h-4" /> : <ArrowDownCircle className="w-4 h-4" />}
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-slate-900 dark:text-white leading-tight truncate">{t.keterangan}</p>
                    <p className="text-[9px] text-gray-400 dark:text-slate-500 font-mono mt-1">{formatDate(t.tanggal)}</p>
                  </div>
                </div>
                <p className={cn(
                  "font-bold text-xs font-mono whitespace-nowrap ml-3",
                  t.type === 'masuk' ? "text-blue-600 dark:text-blue-400" : "text-red-600 dark:text-red-400"
                )}>
                  {t.type === 'masuk' ? '+' : '-'} {formatCurrency(t.jumlah)}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Desktop View Table */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50/50 dark:bg-slate-800/50 border-y border-gray-100 dark:border-slate-800">
                <th className="px-4 py-4 text-[11px] font-bold text-gray-400 dark:text-slate-500 uppercase tracking-widest">Tanggal</th>
                <th className="px-4 py-4 text-[11px] font-bold text-gray-400 dark:text-slate-500 uppercase tracking-widest">Keterangan</th>
                <th className="px-4 py-4 text-[11px] font-bold text-gray-400 dark:text-slate-500 uppercase tracking-widest">Jenis</th>
                <th className="px-4 py-4 text-[11px] font-bold text-gray-400 dark:text-slate-500 uppercase tracking-widest text-right">Jumlah</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 dark:divide-slate-800">
              {transactions.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-4 py-16 text-center text-gray-300 dark:text-slate-700 italic">Tidak ada aktivitas transaksi pada periode ini.</td>
                </tr>
              ) : transactions.map(t => (
                <tr key={t.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                  <td className="px-4 py-4 text-xs text-gray-400 dark:text-slate-500 font-mono font-medium">{formatDate(t.tanggal)}</td>
                  <td className="px-4 py-4">
                    <span className="font-semibold text-slate-900 dark:text-white text-sm block">{t.keterangan}</span>
                    {(t as any).isIuran && <span className="text-[9px] text-blue-500 dark:text-blue-400 font-bold uppercase tracking-tighter">Penerimaan Iuran Anggota</span>}
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-2">
                       <span className={cn(
                         "w-1.5 h-1.5 rounded-full",
                         t.type === 'masuk' ? "bg-blue-500 shadow-sm shadow-blue-500/50" : "bg-red-500 shadow-sm shadow-red-500/50"
                       )} />
                       <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400 dark:text-slate-500">{t.type}</span>
                    </div>
                  </td>
                  <td className={cn(
                    "px-4 py-4 text-right font-bold font-mono text-sm",
                    t.type === 'masuk' ? "text-blue-600 dark:text-blue-400" : "text-red-600 dark:text-red-400"
                  )}>
                    {t.type === 'masuk' ? '+' : '-'} {formatCurrency(t.jumlah)}
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="bg-slate-900 dark:bg-slate-800 text-white rounded-xl overflow-hidden">
                <td colSpan={3} className="px-6 py-6 font-bold text-xs uppercase tracking-[0.2em] opacity-60">Arus Kas Bersih (Netto)</td>
                <td className="px-6 py-6 text-right font-bold text-xl">
                  {formatCurrency(stats.saldo)}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>

        {/* Footer Signatures */}
        <div className="mt-16 pt-12 border-t border-slate-100 dark:border-slate-800 flex justify-between px-8">
          <div className="text-center w-64">
            <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-16 underline">Bendahara</p>
            <div className="text-sm font-bold text-slate-900 dark:text-white mb-1 uppercase tracking-tight">
              {anggotaList.find(a => a.jabatan.toLowerCase() === 'bendahara')?.namaLengkap || '..........................'}
            </div>
            <div className="w-40 h-px bg-slate-200 dark:bg-slate-800 mx-auto" />
          </div>
          <div className="text-center w-64">
            <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-16 underline">Mengetahui, Ketua</p>
            <div className="text-sm font-bold text-slate-900 dark:text-white mb-1 uppercase tracking-tight">
              {anggotaList.find(a => a.jabatan.toLowerCase() === 'ketua')?.namaLengkap || '..........................'}
            </div>
            <div className="w-40 h-px bg-slate-200 dark:bg-slate-800 mx-auto" />
          </div>
        </div>
      </div>
    </div>
  );
}
