/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { UserPlus, Search, Edit2, Trash2, CheckCircle, XCircle } from 'lucide-react';
import { useAnggota } from '../../hooks/useAnggota';
import { Anggota, AnggotaInput } from '../../types';
import { cn, formatDate } from '../../lib/utils';
import { validateRequiredFields } from '../../utils/validation';
import { motion, AnimatePresence } from 'motion/react';

export default function AnggotaList() {
  const { anggotaList, isLoading, tambahAnggota, updateAnggota, toggleStatusAnggota } = useAnggota();
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAnggota, setEditingAnggota] = useState<Anggota | null>(null);
  
  // Form state
  const [namaLengkap, setNamaLengkap] = useState('');
  const [jabatan, setJabatan] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const filteredAnggota = anggotaList.filter(a => 
    a.namaLengkap.toLowerCase().includes(searchTerm.toLowerCase()) ||
    a.jabatan.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const resetForm = () => {
    setNamaLengkap('');
    setJabatan('');
    setErrors({});
    setEditingAnggota(null);
  };

  const handleOpenModal = (anggota?: Anggota) => {
    if (anggota) {
      setEditingAnggota(anggota);
      setNamaLengkap(anggota.namaLengkap);
      setJabatan(anggota.jabatan);
    } else {
      resetForm();
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const formErrors = validateRequiredFields({ namaLengkap, jabatan });
    
    if (Object.keys(formErrors).length > 0) {
      setErrors(formErrors);
      return;
    }

    const data: AnggotaInput = {
      namaLengkap,
      jabatan,
      status: editingAnggota ? editingAnggota.status : 'aktif'
    };

    if (editingAnggota) {
      await updateAnggota(editingAnggota.id, data);
    } else {
      await tambahAnggota(data);
    }
    
    setIsModalOpen(false);
    resetForm();
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto min-w-full">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[var(--text-primary)]">Manajemen Anggota</h1>
          <p className="text-sm text-[var(--text-secondary)] mt-1">Kelola data seluruh anggota aktif organisasi.</p>
        </div>
        <button
          onClick={() => handleOpenModal()}
          className="btn-primary w-full md:w-auto"
        >
          <UserPlus className="w-4 h-4" />
          Tambah Anggota
        </button>
      </div>

      <div className="card-base overflow-hidden">
        <div className="p-4 sm:p-6 border-b border-slate-100 dark:border-white/5 bg-slate-50/50 dark:bg-white/5">
          <div className="relative max-w-md w-full">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Cari nama atau jabatan..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-11 pr-4 py-2.5 bg-[var(--bg-card)] border border-[var(--border-base)] rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all text-sm dark:text-white"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50/50 dark:bg-white/5 border-b border-[var(--border-base)]">
                <th className="px-6 py-4 text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider">Anggota</th>
                <th className="px-6 py-4 text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider">Jabatan</th>
                <th className="px-6 py-4 text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider">Bergabung</th>
                <th className="px-6 py-4 text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 dark:divide-white/5">
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-slate-400 italic">Memuat data anggota...</td>
                </tr>
              ) : filteredAnggota.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-slate-400 italic">Tidak ada anggota ditemukan.</td>
                </tr>
              ) : filteredAnggota.map((a) => (
                <tr key={a.id} className="hover:bg-slate-50/50 dark:hover:bg-white/5 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold text-sm">
                        {a.namaLengkap.charAt(0).toUpperCase()}
                      </div>
                      <span className="font-semibold text-[var(--text-primary)] text-sm">{a.namaLengkap}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-xs font-bold text-[var(--text-secondary)]">{a.jabatan}</td>
                  <td className="px-6 py-4">
                    <span className={cn(
                      "inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider",
                      a.status === 'aktif' ? "bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400" : "bg-slate-100 dark:bg-white/10 text-slate-400 dark:text-slate-500"
                    )}>
                      {a.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-xs text-[var(--text-muted)]">{formatDate(a.tanggalBergabung)}</td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button 
                        onClick={() => handleOpenModal(a)}
                        className="p-2 hover:bg-white dark:hover:bg-white/5 rounded-lg text-slate-400 hover:text-blue-600 transition-all"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => toggleStatusAnggota(a.id, a.status)}
                        className={cn(
                          "p-2 hover:bg-white dark:hover:bg-white/5 rounded-lg transition-all",
                          a.status === 'aktif' ? "text-slate-400 hover:text-red-500" : "text-slate-400 hover:text-green-600"
                        )}
                      >
                        {a.status === 'aktif' ? <XCircle className="w-4 h-4" /> : <CheckCircle className="w-4 h-4" />}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Form */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsModalOpen(false)}
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="bg-[var(--bg-card)] rounded-2xl shadow-2xl w-full max-w-md overflow-hidden relative z-10 border border-[var(--border-base)]"
            >
              <div className="p-6 border-b border-[var(--border-base)] flex justify-between items-center bg-slate-50/50 dark:bg-white/5">
                <h2 className="text-xl font-bold text-[var(--text-primary)]">
                  {editingAnggota ? 'Edit Anggota' : 'Tambah Anggota Baru'}
                </h2>
                <button onClick={() => setIsModalOpen(false)} className="hover:rotate-90 transition-transform">
                  <XCircle className="w-6 h-6 text-slate-400 hover:text-red-500" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="p-8 space-y-6">
                <div>
                  <label className="block text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider mb-2">Nama Lengkap</label>
                  <input
                    type="text"
                    value={namaLengkap}
                    onChange={(e) => setNamaLengkap(e.target.value)}
                    className={cn(
                      "w-full px-4 py-2.5 bg-slate-50 dark:bg-white/5 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600 transition-all text-sm text-[var(--text-primary)]",
                      errors.namaLengkap ? "border-red-300 ring-1 ring-red-300" : "border-[var(--border-base)]"
                    )}
                    placeholder="Masukkan nama lengkap..."
                  />
                  {errors.namaLengkap && <p className="text-red-500 text-[10px] mt-1 font-semibold">{errors.namaLengkap}</p>}
                </div>

                <div>
                  <label className="block text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider mb-2">Jabatan</label>
                  <input
                    type="text"
                    value={jabatan}
                    onChange={(e) => setJabatan(e.target.value)}
                    className={cn(
                      "w-full px-4 py-2.5 bg-slate-50 dark:bg-white/5 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600 transition-all text-sm text-[var(--text-primary)]",
                      errors.jabatan ? "border-red-300 ring-1 ring-red-300" : "border-[var(--border-base)]"
                    )}
                    placeholder="Masukkan jabatan..."
                  />
                  {errors.jabatan && <p className="text-red-500 text-[10px] mt-1 font-semibold">{errors.jabatan}</p>}
                </div>

                <div className="pt-4 flex gap-3">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="flex-1 px-6 py-2.5 border border-[var(--border-base)] rounded-xl font-semibold text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-white/5 transition-all"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    className="flex-1 btn-primary"
                  >
                    {editingAnggota ? 'Simpan' : 'Tambah'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
