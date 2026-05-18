/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Wallet, CheckCircle2, Circle, ChevronLeft, ChevronRight, TrendingUp } from 'lucide-react';
import { useKeuangan } from '../../hooks/useKeuangan';
import { useAnggota } from '../../hooks/useAnggota';
import { cn } from '../../lib/utils';
import { motion, AnimatePresence } from 'motion/react';

export default function IuranList() {
  const { anggotaList } = useAnggota();
  const { iuranList, toggleIuran, NOMINAL_IURAN, rekapIuranKeKasMasuk } = useKeuangan();
  
  const [currentDate, setCurrentDate] = useState(new Date());
  const [tanggalKumpulan, setTanggalKumpulan] = useState(new Date().toISOString().split('T')[0]);
  const [isRekapLoading, setIsRekapLoading] = useState(false);
  const [rekapSuccess, setRekapSuccess] = useState(false);
  
  const [showModal, setShowModal] = useState(false);
  const [selectedMember, setSelectedMember] = useState<{ id: string, nama: string } | null>(null);
  const [amount, setAmount] = useState<number>(NOMINAL_IURAN);

  const periode = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}`;

  const anggotaAktif = anggotaList.filter(a => a.status === 'aktif');
  
  const sudahBayar = anggotaAktif.filter(a => 
    iuranList.some(i => i.anggotaId === a.id && i.periode === periode)
  );
  
  const belumBayar = anggotaAktif.filter(a => 
    !iuranList.some(i => i.anggotaId === a.id && i.periode === periode)
  );

  const totalDiterima = iuranList
    .filter(i => i.periode === periode)
    .reduce((sum, item) => sum + (item.jumlah || 0), 0);

  const handleRekap = async () => {
    if (!tanggalKumpulan) return;
    setIsRekapLoading(true);
    try {
      await rekapIuranKeKasMasuk(periode, new Date(tanggalKumpulan));
      setRekapSuccess(true);
      setTimeout(() => setRekapSuccess(false), 3000);
    } finally {
      setIsRekapLoading(false);
    }
  };

  const handleToggle = (a: { id: string, namaLengkap: string }) => {
    const isPaid = iuranList.some(i => i.anggotaId === a.id && i.periode === periode);
    if (isPaid) {
      // Jika sudah bayar, langsung toggle untuk hapus (seperti perilaku sebelumnya)
      toggleIuran(a.id, periode, 0); 
    } else {
      // Jika belum bayar, munculkan modal
      setSelectedMember({ id: a.id, nama: a.namaLengkap });
      setAmount(NOMINAL_IURAN);
      setShowModal(true);
    }
  };

  const confirmPayment = async () => {
    if (selectedMember) {
      await toggleIuran(selectedMember.id, periode, amount);
      setShowModal(false);
      setSelectedMember(null);
    }
  };

  const persentaseKepatuhan = anggotaAktif.length > 0 
    ? (sudahBayar.length / anggotaAktif.length) * 100 
    : 0;

  const handlePrevMonth = () => {
    setCurrentDate(new Date(currentDate.setMonth(currentDate.getMonth() - 1)));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(currentDate.setMonth(currentDate.getMonth() + 1)));
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 bg-gray-50 dark:bg-slate-950 min-h-full">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6 sm:mb-8">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white">Pencatatan Iuran</h1>
          <p className="text-xs sm:text-sm text-gray-500 dark:text-slate-400 mt-1">Kelola iuran bulanan wajib seluruh anggota aktif.</p>
        </div>
        
        <div className="flex items-center justify-between w-full md:w-auto gap-2 bg-white dark:bg-slate-900 p-1 rounded-xl border border-gray-200 dark:border-slate-800 shadow-sm">
          <button onClick={handlePrevMonth} className="p-2 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg text-gray-400 dark:text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors">
            <ChevronLeft className="w-4 h-4" />
          </button>
          <div className="px-2 font-bold text-slate-800 dark:text-white min-w-[120px] sm:min-w-[150px] text-center text-xs sm:text-sm">
            {new Intl.DateTimeFormat('id-ID', { month: 'long', year: 'numeric' }).format(currentDate)}
          </div>
          <button onClick={handleNextMonth} className="p-2 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg text-gray-400 dark:text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors">
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6 mb-8">
        <div className="bg-white dark:bg-slate-900 p-4 sm:p-6 rounded-2xl border border-gray-200 dark:border-slate-800 shadow-sm">
          <p className="text-[9px] sm:text-[11px] font-bold text-gray-400 dark:text-slate-500 uppercase tracking-widest mb-1 sm:mb-2">Sudah Bayar</p>
          <div className="flex items-end gap-1 sm:gap-2">
            <span className="text-xl sm:text-3xl font-bold text-slate-900 dark:text-white">{sudahBayar.length}</span>
            <span className="text-gray-400 dark:text-slate-500 text-[10px] mb-0.5 sm:mb-1 font-semibold">/ {anggotaAktif.length}</span>
          </div>
        </div>
        <div className="bg-white dark:bg-slate-900 p-4 sm:p-6 rounded-2xl border border-gray-200 dark:border-slate-800 shadow-sm">
          <p className="text-[9px] sm:text-[11px] font-bold text-gray-400 dark:text-slate-500 uppercase tracking-widest mb-1 sm:mb-2">Belum Bayar</p>
          <div className="flex items-end gap-1 sm:gap-2 text-red-600 dark:text-red-400">
            <span className="text-xl sm:text-3xl font-bold">{belumBayar.length}</span>
            <span className="text-red-300 dark:text-red-900/50 text-[8px] sm:text-[10px] mb-0.5 sm:mb-1 font-bold uppercase tracking-tighter">Delay</span>
          </div>
        </div>
        <div className="bg-white dark:bg-slate-900 p-4 sm:p-6 rounded-2xl border border-emerald-100 dark:border-emerald-900/20 shadow-sm col-span-2 sm:col-span-1">
          <p className="text-[9px] sm:text-[11px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-widest mb-1 sm:mb-2">Total Diterima</p>
          <div className="flex flex-col">
            <span className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white">Rp {totalDiterima.toLocaleString('id-ID')}</span>
          </div>
        </div>
        <div className="bg-blue-600 dark:bg-blue-700 p-4 sm:p-6 rounded-2xl border border-blue-700 dark:border-blue-800 shadow-sm text-white col-span-2 sm:col-span-1">
          <p className="text-[9px] sm:text-[11px] font-bold text-blue-200 dark:text-blue-300 uppercase tracking-widest mb-1 sm:mb-2">Kepatuhan</p>
          <div className="flex items-center gap-3 sm:gap-4">
            <span className="text-xl sm:text-3xl font-bold">{persentaseKepatuhan.toFixed(0)}%</span>
            <div className="flex-1 h-1.5 bg-white/20 rounded-full overflow-hidden">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: `${persentaseKepatuhan}%` }}
                className="h-full bg-white rounded-full"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-2xl p-4 sm:p-6 mb-8 flex flex-col md:flex-row items-start sm:items-center justify-between gap-4 sm:gap-6">
        <div className="flex items-start sm:items-center gap-3 sm:gap-4">
          <div className="w-10 h-10 sm:w-12 sm:h-12 bg-amber-100 dark:bg-amber-900/40 rounded-xl flex items-center justify-center text-amber-600 dark:text-amber-400 flex-shrink-0">
            <TrendingUp className="w-5 h-5 sm:w-6 sm:h-6" />
          </div>
          <div>
            <h3 className="font-bold text-slate-900 dark:text-white text-xs sm:text-sm">Rekap iuran ke Kas</h3>
            <p className="text-[10px] sm:text-xs text-amber-700 dark:text-amber-400/70 mt-0.5">Salin total iuran bulan ini ke catatan Kas Masuk.</p>
          </div>
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto">
          <div className="flex-1 md:w-40">
            <input 
              type="date" 
              value={tanggalKumpulan}
              onChange={(e) => setTanggalKumpulan(e.target.value)}
              className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-amber-200 dark:border-amber-800 rounded-xl text-xs sm:text-sm font-semibold focus:outline-none dark:text-white"
            />
          </div>
          <button
            onClick={handleRekap}
            disabled={isRekapLoading || totalDiterima === 0}
            className={cn(
              "px-4 sm:px-6 py-2 sm:py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all shadow-sm flex items-center gap-2",
              rekapSuccess 
                ? "bg-emerald-500 text-white" 
                : "bg-amber-500 text-white hover:bg-amber-600 disabled:opacity-50 disabled:grayscale"
            )}
          >
            {isRekapLoading ? "..." : rekapSuccess ? "OK" : "Rekap"}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 dark:bg-slate-950/60 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white dark:bg-slate-900 rounded-3xl p-8 w-full max-w-md shadow-2xl border border-white dark:border-slate-800"
            >
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/40 rounded-2xl flex items-center justify-center text-blue-600 dark:text-blue-400">
                  <Wallet className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 dark:text-white leading-tight">Catat Iuran</h3>
                  <p className="text-xs text-gray-500 dark:text-slate-400">{selectedMember?.nama}</p>
                </div>
              </div>

              <div className="space-y-6">
                <div>
                  <label className="block text-[11px] font-bold text-gray-400 dark:text-slate-500 uppercase tracking-widest mb-3">Pilih Nominal Cepat</label>
                  <button 
                    onClick={() => setAmount(NOMINAL_IURAN)}
                    className={cn(
                      "w-full py-4 rounded-2xl border-2 transition-all flex flex-col items-center justify-center gap-1",
                      amount === NOMINAL_IURAN 
                        ? "border-blue-600 dark:border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400" 
                        : "border-gray-100 dark:border-slate-800 text-gray-400 dark:text-slate-500 hover:border-gray-200 dark:hover:border-slate-700"
                    )}
                  >
                    <span className="text-[10px] font-bold uppercase tracking-wider">Default</span>
                    <span className="text-lg font-bold">Rp {NOMINAL_IURAN.toLocaleString('id-ID')}</span>
                  </button>
                </div>

                <div className="relative">
                  <div className="absolute inset-0 flex items-center" aria-hidden="true">
                    <div className="w-full border-t border-gray-100 dark:border-slate-800"></div>
                  </div>
                  <div className="relative flex justify-center text-[10px] font-bold">
                    <span className="bg-white dark:bg-slate-900 px-3 text-gray-300 dark:text-slate-600 uppercase tracking-widest">Atau Input Manual</span>
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-gray-400 dark:text-slate-500 uppercase tracking-widest mb-2 font-mono">Input Jumlah</label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-slate-400 dark:text-slate-500 text-sm">Rp</span>
                    <input 
                      type="number"
                      value={amount}
                      onChange={(e) => setAmount(Number(e.target.value))}
                      className="w-full pl-11 pr-4 py-3.5 bg-slate-50 dark:bg-slate-800 border border-gray-100 dark:border-slate-700 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-600 transition-all font-bold text-slate-900 dark:text-white"
                      placeholder="Contoh: 10000"
                    />
                  </div>
                </div>

                <div className="flex gap-3 pt-2">
                  <button 
                    onClick={() => setShowModal(false)}
                    className="flex-1 px-4 py-3 bg-gray-100 dark:bg-slate-800 text-gray-600 dark:text-slate-400 rounded-2xl font-bold text-sm hover:bg-gray-200 dark:hover:bg-slate-700 transition-colors"
                  >
                    Batal
                  </button>
                  <button 
                    onClick={confirmPayment}
                    className="flex-1 px-4 py-3 bg-blue-600 dark:bg-blue-500 text-white rounded-2xl font-bold text-sm hover:bg-blue-700 dark:hover:bg-blue-600 transition-shadow shadow-lg dark:shadow-none"
                  >
                    Simpan
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-200 dark:border-slate-800 shadow-sm overflow-hidden">
        {anggotaAktif.length === 0 ? (
          <div className="p-16 text-center text-gray-300 dark:text-slate-700 italic">
            <Wallet className="w-12 h-12 mx-auto mb-4 opacity-10" />
            <p className="text-sm">Belum ada anggota aktif terdaftar.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2 sm:gap-3 p-4 sm:p-8">
            {anggotaAktif.map(a => {
              const matches = iuranList.some(i => i.anggotaId === a.id && i.periode === periode);
              return (
                <button
                  key={a.id}
                  onClick={() => handleToggle(a)}
                  className={cn(
                    "flex items-center justify-between p-3 sm:p-4 rounded-xl border transition-all group",
                    matches 
                      ? "border-blue-100 dark:border-blue-900/60 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400" 
                      : "border-gray-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 text-gray-500 dark:text-slate-500 hover:border-gray-300 dark:hover:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-800"
                  )}
                >
                  <div className="flex items-center gap-2 sm:gap-3">
                    <div className={cn(
                      "w-7 h-7 sm:w-8 sm:h-8 rounded-lg flex items-center justify-center font-bold text-xs shadow-sm flex-shrink-0",
                      matches ? "bg-blue-600 dark:bg-blue-500 text-white" : "bg-white dark:bg-slate-800 text-gray-400 dark:text-slate-500"
                    )}>
                      {a.namaLengkap.charAt(0).toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <p className="font-semibold text-xs sm:text-sm text-left truncate leading-tight dark:text-slate-300">{a.namaLengkap}</p>
                      {matches && (
                        <p className="text-[8px] sm:text-[9px] font-bold text-blue-400 dark:text-blue-500 mt-0.5">
                          Rp {iuranList.find(i => i.anggotaId === a.id && i.periode === periode)?.jumlah?.toLocaleString('id-ID')}
                        </p>
                      )}
                    </div>
                  </div>
                  {matches ? <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" /> : <Circle className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0 opacity-20" />}
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
