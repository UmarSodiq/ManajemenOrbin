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
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto min-w-full">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-2">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[var(--text-primary)]">{title}</h1>
          <p className="text-sm text-[var(--text-secondary)] mt-1">{description}</p>
        </div>
        <button
          onClick={() => handleOpenModal()}
          className={cn(
            "btn-primary w-full md:w-auto",
            type === 'masuk' ? "bg-blue-600 hover:bg-blue-700" : "bg-red-600 hover:bg-red-700"
          )}
        >
          <Plus className="w-4 h-4" />
          Input {type === 'masuk' ? 'Pemasukan' : 'Pengeluaran'}
        </button>
      </div>

      <div className="card-base overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50/50 dark:bg-white/5 border-b border-[var(--border-base)]">
                <th className="px-6 py-4 text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider">Tanggal</th>
                <th className="px-6 py-4 text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider">Keterangan</th>
                <th className="px-6 py-4 text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider">Jumlah</th>
                <th className="px-6 py-4 text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 dark:divide-white/5">
              {isLoading ? (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-slate-400 italic">Memuat data transaksi...</td>
                </tr>
              ) : dataList.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-slate-400 italic">Belum ada catatan transaksi.</td>
                </tr>
              ) : dataList.map((item) => (
                <tr key={item.id} className="hover:bg-slate-50/50 dark:hover:bg-white/5 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <Calendar className="w-4 h-4 text-[var(--text-muted)]" />
                      <span className="text-xs text-[var(--text-secondary)] font-medium">{formatDate(item.tanggal)}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm font-semibold text-[var(--text-primary)]">{item.keterangan}</td>
                  <td className={cn(
                    "px-6 py-4 font-bold text-sm",
                    type === 'masuk' ? "text-blue-600 dark:text-blue-400" : "text-red-500 dark:text-red-400"
                  )}>
                    {type === 'masuk' ? '+' : '-'} {formatCurrency(item.jumlah)}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button 
                        onClick={() => handleOpenModal(item)} 
                        className="p-2 hover:bg-white dark:hover:bg-white/5 rounded-lg text-slate-400 hover:text-blue-600 transition-all"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => type === 'masuk' ? hapusKasMasuk(item.id) : hapusKasKeluar(item.id)} 
                        className="p-2 hover:bg-white dark:hover:bg-white/5 rounded-lg text-slate-400 hover:text-red-500 transition-all opacity-0 group-hover:opacity-100"
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
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsModalOpen(false)} className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" />
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 10 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 10 }} className="bg-[var(--bg-card)] border border-[var(--border-base)] rounded-2xl shadow-2xl w-full max-w-md overflow-hidden relative z-10">
              <div className={cn("p-6 text-white flex justify-between items-center", type === 'masuk' ? "bg-slate-900 dark:bg-slate-800" : "bg-red-600 dark:bg-red-800")}>
                <h2 className="text-xl font-bold tracking-tight">{editingItem ? 'Edit Transaksi' : `Tambah ${title}`}</h2>
              </div>
              <form onSubmit={handleSubmit} className="p-8 space-y-6">
                <div>
                  <label className="block text-[11px] font-bold text-[var(--text-muted)] uppercase tracking-widest mb-2">Tanggal</label>
                  <input type="date" value={tanggal} onChange={(e) => setTanggal(e.target.value)} className="w-full px-4 py-3 bg-slate-50 dark:bg-white/5 border border-[var(--border-base)] rounded-xl focus:ring-2 focus:ring-blue-600 transition-all text-sm font-medium text-[var(--text-primary)]" />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-[var(--text-muted)] uppercase tracking-widest mb-2">Keterangan</label>
                  <input type="text" value={keterangan} onChange={(e) => setKeterangan(e.target.value)} className={cn("w-full px-4 py-3 bg-slate-50 dark:bg-white/5 border rounded-xl focus:ring-2 focus:ring-blue-600 transition-all text-sm font-medium text-[var(--text-primary)]", errors.keterangan ? "border-red-300" : "border-[var(--border-base)]")} placeholder="Keterangan transaksi" />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-[var(--text-muted)] uppercase tracking-widest mb-2">Jumlah (Rp)</label>
                  <input type="number" step="0.01" value={jumlah} onChange={(e) => setJumlah(e.target.value)} className={cn("w-full px-4 py-3 bg-slate-50 dark:bg-white/5 border rounded-xl font-bold text-[var(--text-primary)] focus:ring-2 focus:ring-blue-600 transition-all", errors.jumlah ? "border-red-300" : "border-[var(--border-base)]")} placeholder="50000" />
                  {errors.jumlah && <p className="text-red-500 text-[10px] mt-1 font-bold">{errors.jumlah}</p>}
                </div>
                <div className="pt-4 flex gap-3">
                  <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 px-6 py-3 border border-[var(--border-base)] rounded-xl font-bold text-[var(--text-secondary)] hover:bg-slate-50 dark:hover:bg-white/5 transition-all">Batal</button>
                  <button type="submit" className={cn("flex-1 px-6 py-3 text-white rounded-xl font-bold shadow-lg transition-all", type === 'masuk' ? "bg-slate-900 hover:bg-slate-800 dark:bg-blue-600 dark:hover:bg-blue-700 shadow-slate-200 dark:shadow-blue-900/20" : "bg-red-600 hover:bg-red-700 shadow-red-200 dark:shadow-red-900/20")}>Simpan</button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
