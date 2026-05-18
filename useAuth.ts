/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Plus, Search, Trash2, Edit2, Wallet, Calendar, AlertCircle } from 'lucide-react';
import { useKeuangan } from '../../hooks/useKeuangan';
import { KasMasuk, KasKeluar, KasMasukInput, KasKeluarInput } from '../../types';
import { cn, formatDate, formatCurrency } from '../../lib/utils';
import { validateRequiredFields, validateJumlah } from '../../utils/validation';
import { motion, AnimatePresence } from 'motion/react';

interface TransactionPageProps {
  type: 'masuk' | 'keluar';
}

export default function TransactionPage({ type }: TransactionPageProps) {
  const { 
    kasMasukList, 
    kasKeluarList, 
    tambahKasMasuk, 
    updateKasMasuk, 
    hapusKasMasuk,
    tambahKasKeluar,
    updateKasKeluar,
    hapusKasKeluar,
    isLoading 
  } = useKeuangan();

  const dataList = type === 'masuk' ? kasMasukList : kasKeluarList;
  const title = type === 'masuk' ? 'Kas Masuk' : 'Kas Keluar';
  const description = type === 'masuk' 
    ? 'Catat seluruh pemasukan kas organisasi selain iuran.' 
    : 'Catat pengeluaran operasional organisasi.';

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<KasMasuk | KasKeluar | null>(null);
  
  // Form state
  const [keterangan, setKeterangan] = useState('');
  const [jumlah, setJumlah] = useState('');
  const [tanggal, setTanggal] = useState(new Date().toISOString().split('T')[0]);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const resetForm = () => {
    setKeterangan('');
    setJumlah('');
    setTanggal(new Date().toISOString().split('T')[0]);
    setErrors({});
    setEditingItem(null);
  };

  const handleOpenModal = (item?: KasMasuk | KasKeluar) => {
    if (item) {
      setEditingItem(item);
      setKeterangan(item.keterangan);
      setJumlah(item.jumlah.toString());
      setTanggal(item.tanggal.toISOString().split('T')[0]);
    } else {
      resetForm();
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const formErrors = validateRequiredFields({ keterangan, jumlah, tanggal });
    const jumlahError = validateJumlah(jumlah);
    if (jumlahError) formErrors.jumlah = jumlahError;

    if (Object.keys(formErrors).length > 0) {
      setErrors(formErrors);
      return;
    }

    const payload = {
      keterangan,
      jumlah: parseFloat(jumlah),
      tanggal: new Date(tanggal)
    };

    if (type === 'masuk') {
      if (editingItem) {
        await updateKasMasuk(editingItem.id, payload as KasMasukInput);
      } else {
        await tambahKasMasuk(payload as KasMasukInput);
      }
    } else {
      if (editingItem) {
        await updateKasKeluar(editingItem.id, payload as KasKeluarInput);
      } else {
        await tambahKasKeluar(payload as KasKeluarInput);
      }
    }
    
    setIsModalOpen(false);
    resetForm();
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 bg-gray-50 dark:bg-slate-950 min-h-full">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6 sm:mb-8">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white">{title}</h1>
          <p className="text-xs sm:text-sm text-gray-500 dark:text-slate-400 mt-1">{description}</p>
        </div>
        <button
          onClick={() => handleOpenModal()}
          className={cn(
            "w-full md:w-auto px-5 py-2.5 rounded-xl flex items-center justify-center gap-2 font-semibold transition-all shadow-sm text-white",
            type === 'masuk' ? "bg-blue-600 dark:bg-blue-500 hover:bg-blue-700 dark:hover:bg-blue-600 shadow-blue-100 dark:shadow-none" : "bg-red-600 dark:bg-red-500 hover:bg-red-700 dark:hover:bg-red-600 shadow-red-100 dark:shadow-none"
          )}
        >
          <Plus className="w-4 h-4" />
          <span className="text-sm">Tambah {type === 'masuk' ? 'Pemasukan' : 'Pengeluaran'}</span>
        </button>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-200 dark:border-slate-800 shadow-sm overflow-hidden">
        {/* Mobile List View */}
        <div className="md:hidden divide-y divide-gray-50 dark:divide-slate-800">
          {isLoading ? (
            <div className="p-12 text-center text-gray-400 dark:text-slate-500 italic text-sm">Memuat data...</div>
          ) : dataList.length === 0 ? (
            <div className="p-12 text-center text-gray-400 dark:text-slate-500 italic text-sm">Belum ada catatan transaksi.</div>
          ) : dataList.map((item) => (
            <div key={item.id} className="p-4 flex flex-col gap-3">
              <div className="flex justify-between items-start">
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-slate-900 dark:text-white leading-tight mb-1">{item.keterangan}</p>
                  <p className="text-[10px] text-gray-400 dark:text-slate-500 font-mono">{formatDate(item.tanggal)}</p>
                </div>
                <div className="flex gap-1 ml-4">
                  <button onClick={() => handleOpenModal(item)} className="p-2 bg-slate-50 dark:bg-slate-800 text-gray-400 dark:text-slate-500 rounded-lg">
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button 
                    onClick={() => type === 'masuk' ? hapusKasMasuk(item.id) : hapusKasKeluar(item.id)} 
                    className="p-2 bg-red-50 dark:bg-red-900/30 text-red-400 rounded-lg"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
              <p className={cn(
                "text-base font-bold font-mono",
                type === 'masuk' ? "text-blue-600 dark:text-blue-400" : "text-red-600 dark:text-red-400"
              )}>
                {type === 'masuk' ? '+' : '-'} {formatCurrency(item.jumlah)}
              </p>
            </div>
          ))}
        </div>

        {/* Desktop Table View */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50/50 dark:bg-slate-800/50 border-b border-gray-100 dark:border-slate-800">
                <th className="px-6 py-4 text-[11px] font-bold text-gray-400 dark:text-slate-500 uppercase tracking-widest">Tanggal</th>
                <th className="px-6 py-4 text-[11px] font-bold text-gray-400 dark:text-slate-500 uppercase tracking-widest">Keterangan</th>
                <th className="px-6 py-4 text-[11px] font-bold text-gray-400 dark:text-slate-500 uppercase tracking-widest">Jumlah</th>
                <th className="px-6 py-4 text-[11px] font-bold text-gray-400 dark:text-slate-500 uppercase tracking-widest text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 dark:divide-slate-800">
              {isLoading ? (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-gray-400 dark:text-slate-500 italic">Memuat data transaksi...</td>
                </tr>
              ) : dataList.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-gray-400 dark:text-slate-500 italic">Belum ada catatan transaksi.</td>
                </tr>
              ) : dataList.map((item) => (
                <tr key={item.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-colors group">
                  <td className="px-6 py-4 text-xs text-gray-500 dark:text-slate-400 font-mono font-medium">{formatDate(item.tanggal)}</td>
                  <td className="px-6 py-4 text-sm font-semibold text-slate-900 dark:text-white">{item.keterangan}</td>
                  <td className={cn(
                    "px-6 py-4 font-bold text-sm",
                    type === 'masuk' ? "text-blue-600 dark:text-blue-400" : "text-red-600 dark:text-red-400"
                  )}>
                    {type === 'masuk' ? '+' : '-'} {formatCurrency(item.jumlah)}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button onClick={() => handleOpenModal(item)} className="p-2 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg text-gray-400 dark:text-slate-500 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => type === 'masuk' ? hapusKasMasuk(item.id) : hapusKasKeluar(item.id)} 
                        className="p-2 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg text-gray-400 dark:text-slate-500 hover:text-red-600 dark:hover:text-red-400 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsModalOpen(false)} className="absolute inset-0 bg-slate-900/40 dark:bg-slate-950/60 backdrop-blur-sm" />
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 10 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 10 }} className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-md overflow-hidden relative z-10 border border-gray-200 dark:border-slate-800">
              <div className={cn("p-6 text-white flex justify-between items-center", type === 'masuk' ? "bg-slate-900 dark:bg-slate-800" : "bg-red-600 dark:bg-red-700")}>
                <h2 className="text-xl font-bold tracking-tight">{editingItem ? 'Edit Transaksi' : `Tambah ${title}`}</h2>
              </div>
              <form onSubmit={handleSubmit} className="p-8 space-y-6">
                <div>
                  <label className="block text-[11px] font-bold text-gray-400 dark:text-slate-500 uppercase tracking-widest mb-2">Tanggal</label>
                  <input type="date" value={tanggal} onChange={(e) => setTanggal(e.target.value)} className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-600 transition-all text-sm font-medium dark:text-white" />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-gray-400 dark:text-slate-500 uppercase tracking-widest mb-2">Keterangan</label>
                  <input type="text" value={keterangan} onChange={(e) => setKeterangan(e.target.value)} className={cn("w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border rounded-xl focus:ring-2 focus:ring-blue-600 transition-all text-sm font-medium dark:text-white", errors.keterangan ? "border-red-300 dark:border-red-900/50" : "border-gray-200 dark:border-slate-700")} placeholder="Membeli alat tulis kantor" />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-gray-400 dark:text-slate-500 uppercase tracking-widest mb-2">Jumlah (Rp)</label>
                  <input type="number" step="0.01" value={jumlah} onChange={(e) => setJumlah(e.target.value)} className={cn("w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border rounded-xl font-bold text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-600 transition-all", errors.jumlah ? "border-red-300 dark:border-red-900/50" : "border-gray-200 dark:border-slate-700")} placeholder="50000" />
                  {errors.jumlah && <p className="text-red-500 dark:text-red-400 text-[10px] mt-1 font-bold">{errors.jumlah}</p>}
                </div>
                <div className="pt-4 flex gap-3">
                  <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 px-6 py-3 border border-gray-200 dark:border-slate-700 rounded-xl font-bold text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all">Batal</button>
                  <button type="submit" className={cn("flex-1 px-6 py-3 text-white rounded-xl font-bold shadow-lg transition-all", type === 'masuk' ? "bg-slate-900 dark:bg-blue-600 hover:bg-slate-800 dark:hover:bg-blue-700 shadow-slate-200 dark:shadow-none" : "bg-red-600 dark:bg-red-500 hover:bg-red-700 dark:hover:bg-red-600 shadow-red-200 dark:shadow-none")}>Simpan</button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
