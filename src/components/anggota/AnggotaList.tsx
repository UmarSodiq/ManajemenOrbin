/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { UserPlus, Search, Edit2, Trash2, CheckCircle, XCircle, MoreVertical } from 'lucide-react';
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
  const [userId, setUserId] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const filteredAnggota = anggotaList.filter(a => 
    a.namaLengkap.toLowerCase().includes(searchTerm.toLowerCase()) ||
    a.jabatan.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const resetForm = () => {
    setNamaLengkap('');
    setJabatan('');
    setUserId('');
    setErrors({});
    setEditingAnggota(null);
  };

  const handleOpenModal = (anggota?: Anggota) => {
    if (anggota) {
      setEditingAnggota(anggota);
      setNamaLengkap(anggota.namaLengkap);
      setJabatan(anggota.jabatan);
      setUserId(anggota.userId || '');
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
      status: editingAnggota ? editingAnggota.status : 'aktif',
      userId: userId || undefined
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
    <div className="p-4 sm:p-6 lg:p-8 bg-gray-50 dark:bg-slate-950 min-h-full">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6 sm:mb-8">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white">Manajemen Anggota</h1>
          <p className="text-xs sm:text-sm text-gray-500 dark:text-slate-400 mt-1">Kelola data seluruh anggota aktif organisasi.</p>
        </div>
        <button
          onClick={() => handleOpenModal()}
          className="w-full md:w-auto bg-slate-900 dark:bg-blue-600 text-white px-5 py-2.5 rounded-xl flex items-center justify-center gap-2 font-semibold hover:bg-slate-800 dark:hover:bg-blue-700 transition-all shadow-sm"
        >
          <UserPlus className="w-4 h-4" />
          <span className="text-sm">Tambah Anggota</span>
        </button>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-200 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="p-4 sm:p-6 border-b border-gray-100 dark:border-slate-800">
          <div className="relative max-w-md w-full">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-slate-500" />
            <input
              type="text"
              placeholder="Cari nama atau jabatan..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-11 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600 transition-all text-xs sm:text-sm dark:text-white"
            />
          </div>
        </div>

        {/* Mobile Grid View */}
        <div className="md:hidden divide-y divide-gray-50 dark:divide-slate-800">
          {isLoading ? (
            <div className="p-12 text-center text-gray-400 dark:text-slate-500 italic text-sm">Memuat data...</div>
          ) : filteredAnggota.length === 0 ? (
            <div className="p-12 text-center text-gray-400 dark:text-slate-500 italic text-sm">Tidak ada anggota.</div>
          ) : filteredAnggota.map((a) => (
            <div key={a.id} className="p-4 flex flex-col gap-3">
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-9 h-9 rounded-full bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 flex items-center justify-center font-bold text-sm flex-shrink-0">
                    {a.namaLengkap.charAt(0).toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <p className="font-semibold text-slate-900 dark:text-white text-sm truncate leading-tight uppercase mb-0.5">{a.namaLengkap}</p>
                    <p className="text-[10px] font-bold text-blue-600 dark:text-blue-400 uppercase tracking-tighter">{a.jabatan}</p>
                  </div>
                </div>
                <div className="flex gap-1 ml-4">
                  <button 
                    onClick={() => handleOpenModal(a)}
                    className="p-2 bg-slate-50 dark:bg-slate-800 text-gray-400 dark:text-slate-500 rounded-lg"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button 
                    onClick={() => toggleStatusAnggota(a.id, a.status)}
                    className={cn(
                      "p-2 rounded-lg",
                      a.status === 'aktif' ? "bg-red-50 dark:bg-red-900/20 text-red-500 dark:text-red-400" : "bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400"
                    )}
                  >
                    {a.status === 'aktif' ? <XCircle className="w-3.5 h-3.5" /> : <CheckCircle className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>
              <div className="flex justify-between items-center text-[10px] font-medium text-gray-400 dark:text-slate-500">
                <span>Bergabung: {formatDate(a.tanggalBergabung)}</span>
                <span className={cn(
                  "px-2 py-0.5 rounded-full font-bold uppercase tracking-wider",
                  a.status === 'aktif' ? "bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400" : "bg-gray-100 dark:bg-slate-800 text-gray-400 dark:text-slate-500"
                )}>
                  {a.status}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Desktop Table View */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50/50 dark:bg-slate-800/50 border-b border-gray-100 dark:border-slate-800">
                <th className="px-6 py-4 text-[11px] font-bold text-gray-400 dark:text-slate-500 uppercase tracking-widest">Anggota</th>
                <th className="px-6 py-4 text-[11px] font-bold text-gray-400 dark:text-slate-500 uppercase tracking-widest">Jabatan</th>
                <th className="px-6 py-4 text-[11px] font-bold text-gray-400 dark:text-slate-500 uppercase tracking-widest">Status</th>
                <th className="px-6 py-4 text-[11px] font-bold text-gray-400 dark:text-slate-500 uppercase tracking-widest">Bergabung</th>
                <th className="px-6 py-4 text-[11px] font-bold text-gray-400 dark:text-slate-500 uppercase tracking-widest text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 dark:divide-slate-800">
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-gray-400 dark:text-slate-500 italic">Memuat data anggota...</td>
                </tr>
              ) : filteredAnggota.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-gray-400 dark:text-slate-500 italic">Tidak ada anggota ditemukan.</td>
                </tr>
              ) : filteredAnggota.map((a) => (
                <tr key={a.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 flex items-center justify-center font-bold text-sm">
                        {a.namaLengkap.charAt(0).toUpperCase()}
                      </div>
                      <span className="font-semibold text-slate-900 dark:text-white text-sm">{a.namaLengkap}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 font-bold text-xs text-blue-600 dark:text-blue-400 uppercase tracking-tight">{a.jabatan}</td>
                  <td className="px-6 py-4">
                    <span className={cn(
                      "inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider",
                      a.status === 'aktif' ? "bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400" : "bg-gray-100 dark:bg-slate-800 text-gray-400 dark:text-slate-500"
                    )}>
                      {a.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-xs font-medium text-slate-500 dark:text-slate-400">{formatDate(a.tanggalBergabung)}</td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button 
                        onClick={() => handleOpenModal(a)}
                        className="p-2 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg text-gray-400 dark:text-slate-500 hover:text-blue-600 dark:hover:text-blue-400 transition-all"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => toggleStatusAnggota(a.id, a.status)}
                        className={cn(
                          "p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-all",
                          a.status === 'aktif' ? "text-gray-400 dark:text-slate-500 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30" : "text-gray-400 dark:text-slate-500 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30"
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
              className="absolute inset-0 bg-slate-900/40 dark:bg-slate-950/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-md overflow-hidden relative z-10 border border-gray-200 dark:border-slate-800"
            >
              <div className="bg-slate-900 dark:bg-slate-800 p-6 text-white flex justify-between items-center">
                <h2 className="text-xl font-bold tracking-tight">
                  {editingAnggota ? 'Edit Anggota' : 'Tambah Anggota Baru'}
                </h2>
                <button onClick={() => setIsModalOpen(false)} className="hover:rotate-90 transition-transform">
                  <XCircle className="w-6 h-6 opacity-60 hover:opacity-100" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="p-8 space-y-6">
                <div>
                  <label className="block text-[11px] font-bold text-gray-400 dark:text-slate-500 uppercase tracking-widest mb-2">Nama Lengkap</label>
                  <input
                    type="text"
                    value={namaLengkap}
                    onChange={(e) => setNamaLengkap(e.target.value)}
                    className={cn(
                      "w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600 transition-all text-sm font-medium dark:text-white",
                      errors.namaLengkap ? "border-red-300 ring-1 ring-red-300 dark:border-red-900" : "border-gray-200 dark:border-slate-700"
                    )}
                    placeholder="Contoh: Ahmad Sodiq"
                  />
                  {errors.namaLengkap && <p className="text-red-500 dark:text-red-400 text-[10px] mt-1 font-bold">{errors.namaLengkap}</p>}
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-gray-400 dark:text-slate-500 uppercase tracking-widest mb-2">Jabatan</label>
                  <input
                    type="text"
                    value={jabatan}
                    onChange={(e) => setJabatan(e.target.value)}
                    className={cn(
                      "w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600 transition-all text-sm font-semibold text-slate-900 dark:text-white",
                      errors.jabatan ? "border-red-300 ring-1 ring-red-300 dark:border-red-900" : "border-gray-200 dark:border-slate-700"
                    )}
                    placeholder="Contoh: Sekretaris / Anggota"
                  />
                  {errors.jabatan && <p className="text-red-500 dark:text-red-400 text-[10px] mt-1 font-bold">{errors.jabatan}</p>}
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-gray-400 dark:text-slate-500 uppercase tracking-widest mb-2">Link User UID (Opsional)</label>
                  <input
                    type="text"
                    value={userId}
                    onChange={(e) => setUserId(e.target.value)}
                    className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600 transition-all text-[10px] font-mono dark:text-blue-400"
                    placeholder="UID dari Firebase Auth / Users collection"
                  />
                  <p className="text-[9px] text-gray-400 dark:text-slate-500 mt-1 italic leading-tight">Hubungkan record anggota ini dengan akun login user (UID) agar data personal (kehadiran, iuran) muncul di dashboard mereka.</p>
                </div>

                <div className="pt-4 flex gap-3">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="flex-1 px-6 py-3 border border-gray-200 dark:border-slate-700 rounded-xl font-bold text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-6 py-3 bg-slate-900 dark:bg-blue-600 text-white rounded-xl font-bold hover:bg-slate-800 dark:hover:bg-blue-700 transition-all shadow-lg dark:shadow-none"
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
