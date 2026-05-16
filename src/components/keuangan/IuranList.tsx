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
    <div className="p-4 sm:p-6 lg:p-8 bg-[var(--bg-main)] min-h-full transition-colors">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6 sm:mb-8">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[var(--text-primary)]">Pencatatan Iuran</h1>
          <p className="text-xs sm:text-sm text-[var(--text-secondary)] mt-1">Kelola iuran bulanan wajib seluruh anggota aktif.</p>
        </div>
        
        <div className="flex items-center justify-between w-full md:w-auto gap-2 bg-[var(--bg-card)] p-1 rounded-xl border border-[var(--border-base)] shadow-sm">
          <button onClick={handlePrevMonth} className="p-2 hover:bg-slate-50 dark:hover:bg-white/5 rounded-lg text-gray-400 hover:text-[var(--text-primary)] transition-colors">
            <ChevronLeft className="w-4 h-4" />
          </button>
          <div className="px-2 font-bold text-[var(--text-primary)] min-w-[120px] sm:min-w-[150px] text-center text-xs sm:text-sm">
            {new Intl.DateTimeFormat('id-ID', { month: 'long', year: 'numeric' }).format(currentDate)}
          </div>
          <button onClick={handleNextMonth} className="p-2 hover:bg-slate-50 dark:hover:bg-white/5 rounded-lg text-gray-400 hover:text-[var(--text-primary)] transition-colors">
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6 mb-8">
        <div className="card-base p-4 sm:p-6 rounded-2xl border border-[var(--border-base)] shadow-sm">
          <p className="text-[9px] sm:text-[11px] font-bold text-[var(--text-muted)] uppercase tracking-widest mb-1 sm:mb-2">Sudah Bayar</p>
          <div className="flex items-end gap-1 sm:gap-2">
            <span className="text-xl sm:text-3xl font-bold text-[var(--text-primary)]">{sudahBayar.length}</span>
            <span className="text-[var(--text-muted)] text-[10px] mb-0.5 sm:mb-1 font-semibold">/ {anggotaAktif.length}</span>
          </div>
        </div>
        <div className="card-base p-4 sm:p-6 rounded-2xl border border-[var(--border-base)] shadow-sm">
          <p className="text-[9px] sm:text-[11px] font-bold text-[var(--text-muted)] uppercase tracking-widest mb-1 sm:mb-2">Belum Bayar</p>
          <div className="flex items-end gap-1 sm:gap-2 text-red-600">
            <span className="text-xl sm:text-3xl font-bold">{belumBayar.length}</span>
            <span className="text-red-300 text-[8px] sm:text-[10px] mb-0.5 sm:mb-1 font-bold uppercase tracking-tighter">Delay</span>
          </div>
        </div>
        <div className="card-base p-4 sm:p-6 rounded-2xl border border-emerald-100 dark:border-emerald-900/20 shadow-sm col-span-2 sm:col-span-1">
          <p className="text-[9px] sm:text-[11px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-widest mb-1 sm:mb-2">Total Diterima</p>
          <div className="flex flex-col">
            <span className="text-lg sm:text-xl font-bold text-[var(--text-primary)]">Rp {totalDiterima.toLocaleString('id-ID')}</span>
          </div>
        </div>
        <div className="bg-blue-600 p-4 sm:p-6 rounded-2xl border border-blue-700 shadow-sm text-white col-span-2 sm:col-span-1">
          <p className="text-[9px] sm:text-[11px] font-bold text-blue-200 uppercase tracking-widest mb-1 sm:mb-2">Kepatuhan</p>
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

      <div className="bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-900/30 rounded-2xl p-4 sm:p-6 mb-8 flex flex-col md:flex-row items-start sm:items-center justify-between gap-4 sm:gap-6">
        <div className="flex items-start sm:items-center gap-3 sm:gap-4">
          <div className="w-10 h-10 sm:w-12 sm:h-12 bg-amber-100 dark:bg-amber-900/20 rounded-xl flex items-center justify-center text-amber-600 dark:text-amber-400 flex-shrink-0">
            <TrendingUp className="w-5 h-5 sm:w-6 sm:h-6" />
          </div>
          <div>
            <h3 className="font-bold text-[var(--text-primary)] text-xs sm:text-sm">Rekap iuran ke Kas</h3>
            <p className="text-[10px] sm:text-xs text-amber-700 dark:text-amber-500 mt-0.5">Saring total iuran bulan ini ke catatan Kas Masuk.</p>
          </div>
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto">
          <div className="flex-1 md:w-40">
            <input 
              type="date" 
              value={tanggalKumpulan}
              onChange={(e) => setTanggalKumpulan(e.target.value)}
              className="w-full px-3 py-2 bg-white dark:bg-white/5 border border-amber-200 dark:border-amber-900/30 rounded-xl text-xs sm:text-sm font-semibold focus:outline-none dark:text-white"
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
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-[var(--bg-card)] rounded-3xl p-8 w-full max-w-md shadow-2xl border border-[var(--border-base)]"
            >
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/20 rounded-2xl flex items-center justify-center text-blue-600 dark:text-blue-400">
                  <Wallet className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-bold text-[var(--text-primary)] leading-tight">Catat Iuran</h3>
                  <p className="text-xs text-[var(--text-secondary)]">{selectedMember?.nama}</p>
                </div>
              </div>

              <div className="space-y-6">
                <div>
                  <label className="block text-[11px] font-bold text-[var(--text-muted)] uppercase tracking-widest mb-3">Pilih Nominal Cepat</label>
                  <button 
                    onClick={() => setAmount(NOMINAL_IURAN)}
                    className={cn(
                      "w-full py-4 rounded-2xl border-2 transition-all flex flex-col items-center justify-center gap-1",
                      amount === NOMINAL_IURAN 
                        ? "border-blue-600 bg-blue-50 text-blue-700" 
                        : "border-[var(--border-base)] text-[var(--text-muted)] hover:border-blue-200"
                    )}
                  >
                    <span className="text-[10px] font-bold uppercase tracking-wider">Default</span>
                    <span className="text-lg font-bold">Rp {NOMINAL_IURAN.toLocaleString('id-ID')}</span>
                  </button>
                </div>

                <div className="relative">
                  <div className="absolute inset-0 flex items-center" aria-hidden="true">
                    <div className="w-full border-t border-[var(--border-base)]"></div>
                  </div>
                  <div className="relative flex justify-center text-[10px] font-bold">
                    <span className="bg-[var(--bg-card)] px-3 text-[var(--text-muted)] uppercase tracking-widest">Atau Input Manual</span>
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-[var(--text-muted)] uppercase tracking-widest mb-2 font-mono">Input Jumlah</label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-slate-400 text-sm">Rp</span>
                    <input 
                      type="number"
                      value={amount}
                      onChange={(e) => setAmount(Number(e.target.value))}
                      className="w-full pl-11 pr-4 py-3.5 bg-slate-50 dark:bg-white/5 border border-[var(--border-base)] rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-600 font-bold text-[var(--text-primary)] transition-all"
                      placeholder="Contoh: 10000"
                    />
                  </div>
                </div>

                <div className="flex gap-3 pt-2">
                  <button 
                    onClick={() => setShowModal(false)}
                    className="flex-1 px-4 py-3 bg-slate-100 dark:bg-white/5 text-[var(--text-secondary)] rounded-2xl font-bold text-sm hover:bg-slate-200 dark:hover:bg-white/10 transition-colors"
                  >
                    Batal
                  </button>
                  <button 
                    onClick={confirmPayment}
                    className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-2xl font-bold text-sm hover:bg-blue-700 transition-shadow shadow-lg shadow-blue-200"
                  >
                    Simpan
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <div className="bg-[var(--bg-card)] rounded-2xl border border-[var(--border-base)] shadow-sm overflow-hidden">
        {anggotaAktif.length === 0 ? (
          <div className="p-16 text-center text-[var(--text-muted)] italic">
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
                      ? "border-blue-100 dark:border-blue-900/50 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400" 
                      : "border-[var(--border-base)] bg-[var(--bg-main)] text-[var(--text-secondary)] hover:border-blue-200 hover:bg-[var(--bg-card)] shadow-sm"
                  )}
                >
                  <div className="flex items-center gap-2 sm:gap-3">
                    <div className={cn(
                      "w-7 h-7 sm:w-8 sm:h-8 rounded-lg flex items-center justify-center font-bold text-xs shadow-sm flex-shrink-0",
                      matches ? "bg-blue-600 dark:bg-blue-500 text-white" : "bg-[var(--bg-card)] border border-[var(--border-base)] text-[var(--text-muted)]"
                    )}>
                      {a.namaLengkap.charAt(0).toUpperCase()}
                    </div>
                    <div className="min-w-0 text-left">
                      <p className="font-semibold text-xs sm:text-sm truncate leading-tight text-[var(--text-primary)]">{a.namaLengkap}</p>
                      {matches && (
                        <p className="text-[8px] sm:text-[9px] font-bold text-blue-400 mt-0.5">
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
