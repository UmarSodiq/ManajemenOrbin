/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Megaphone, Plus, Search, Edit2, Trash2, Calendar, Clock, ChevronRight } from 'lucide-react';
import { usePengumuman } from '../../hooks/usePengumuman';
import { useAuth } from '../../hooks/useAuth';
import { Pengumuman, PengumumanInput } from '../../types';
import { cn, formatDate } from '../../lib/utils';
import { validateRequiredFields } from '../../utils/validation';
import { motion, AnimatePresence } from 'motion/react';

export default function PengumumanList() {
  const { role } = useAuth();
  const { pengumumanList, isLoading, tambahPengumuman, updatePengumuman, hapusPengumuman } = usePengumuman();
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Pengumuman | null>(null);
  const [selectedItem, setSelectedItem] = useState<Pengumuman | null>(null);

  // Form state
  const [judul, setJudul] = useState('');
  const [isi, setIsi] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleOpenModal = (item?: Pengumuman) => {
    if (item) {
      setEditingItem(item);
      setJudul(item.judul);
      setIsi(item.isi);
    } else {
      setEditingItem(null);
      setJudul('');
      setIsi('');
    }
    setErrors({});
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const formErrors = validateRequiredFields({ judul, isi });
    if (Object.keys(formErrors).length > 0) {
      setErrors(formErrors);
      return;
    }

    const data: PengumumanInput = { judul, isi };
    if (editingItem) {
      await updatePengumuman(editingItem.id, data);
    } else {
      await tambahPengumuman(data);
    }
    setIsModalOpen(false);
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 bg-[var(--bg-main)] min-h-full transition-colors">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6 sm:mb-8">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[var(--text-primary)]">Pengumuman</h1>
          <p className="text-xs sm:text-sm text-[var(--text-secondary)] mt-1">Informasi terkini dari organisasi pemuda.</p>
        </div>
        {role === 'sekretaris' && (
          <button
            onClick={() => handleOpenModal()}
            className="w-full md:w-auto bg-slate-900 text-white px-5 py-2.5 rounded-xl flex items-center justify-center gap-2 font-semibold hover:bg-slate-800 transition-all shadow-sm"
          >
            <Plus className="w-4 h-4" />
            <span className="text-sm">Buat Pengumuman</span>
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* List */}
        <div className="space-y-3 sm:space-y-4">
          {isLoading ? (
            <div className="p-12 text-center text-[var(--text-muted)] italic bg-[var(--bg-card)] rounded-2xl border border-[var(--border-base)] shadow-sm text-sm">Memuat pengumuman...</div>
          ) : pengumumanList.length === 0 ? (
            <div className="p-12 text-center text-[var(--text-muted)] italic bg-[var(--bg-card)] rounded-2xl border border-[var(--border-base)] shadow-sm text-sm">Belum ada pengumuman.</div>
          ) : pengumumanList.map((item) => (
            <motion.div
              layout
              key={item.id}
              onClick={() => setSelectedItem(item)}
              className={cn(
                "p-4 sm:p-6 rounded-2xl border transition-all cursor-pointer group relative",
                selectedItem?.id === item.id 
                  ? "bg-slate-900 dark:bg-blue-600 border-slate-900 dark:border-blue-600 text-white shadow-lg ring-1 ring-slate-900 dark:ring-blue-600" 
                  : "bg-[var(--bg-card)] border-[var(--border-base)] hover:border-blue-300 dark:hover:border-blue-500"
              )}
            >
              <div className="flex justify-between items-start gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2 sm:mb-3">
                    <span className={cn(
                      "text-[8px] sm:text-[9px] font-bold uppercase tracking-[0.15em] px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-lg border transition-colors",
                      selectedItem?.id === item.id 
                        ? "bg-white/10 border-white/20 text-white/70 font-bold" 
                        : "bg-slate-50 dark:bg-white/5 border-[var(--border-base)] text-[var(--text-muted)]"
                    )}>
                      {formatDate(item.tanggalDibuat)}
                    </span>
                  </div>
                  <h3 className={cn(
                    "font-bold text-sm sm:text-base truncate pr-8 leading-tight uppercase",
                    selectedItem?.id === item.id ? "text-white" : "text-[var(--text-primary)]"
                  )}>{item.judul}</h3>
                  <p className={cn(
                    "text-xs sm:text-[13px] mt-1.5 sm:mt-2 line-clamp-2 leading-relaxed transition-colors",
                    selectedItem?.id === item.id ? "text-slate-300" : "text-[var(--text-secondary)]"
                  )}>
                    {item.isi}
                  </p>
                </div>
                {role === 'sekretaris' && (
                  <div className={cn(
                    "flex items-center gap-1 transition-all absolute top-4 sm:top-6 right-4 sm:right-6",
                    selectedItem?.id === item.id ? "opacity-100" : "opacity-0 group-hover:opacity-100"
                  )}>
                    <button 
                      onClick={(e) => { e.stopPropagation(); handleOpenModal(item); }} 
                      className={cn("p-1.5 rounded-lg transition-all", selectedItem?.id === item.id ? "text-white/40 hover:text-white" : "text-gray-400 hover:text-slate-900")}
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button 
                      onClick={(e) => { e.stopPropagation(); hapusPengumuman(item.id); }} 
                      className={cn("p-1.5 rounded-lg transition-all", selectedItem?.id === item.id ? "text-white/40 hover:text-red-400" : "text-gray-400 hover:text-red-500")}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </div>

        {/* Detail */}
        <div className="hidden lg:block sticky top-8">
          <AnimatePresence mode="wait">
            {selectedItem ? (
              <motion.div
                key={selectedItem.id}
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                className="bg-[var(--bg-card)] rounded-2xl border border-[var(--border-base)] p-10 shadow-sm"
              >
                <div className="flex items-center gap-4 mb-8">
                  <div className="w-12 h-12 rounded-xl bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center border border-blue-100/50 dark:border-blue-900/50">
                    <Megaphone className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-[var(--text-muted)]">Pengumuman Resmi</p>
                    <p className="text-sm font-semibold text-[var(--text-primary)] mt-0.5">{formatDate(selectedItem.tanggalDibuat)}</p>
                  </div>
                </div>
                <h2 className="text-2xl font-bold text-[var(--text-primary)] tracking-tight leading-[1.2] mb-6">{selectedItem.judul}</h2>
                <div className="w-12 h-1 bg-blue-600 rounded-full mb-8 shadow-sm shadow-blue-600/30" />
                <div className="prose prose-slate dark:prose-invert max-w-none">
                  <p className="text-[var(--text-secondary)] leading-relaxed whitespace-pre-wrap font-medium">{selectedItem.isi}</p>
                </div>
              </motion.div>
            ) : (
              <div className="bg-slate-50/50 dark:bg-white/5 rounded-2xl border-2 border-dashed border-[var(--border-base)] p-20 flex flex-col items-center justify-center text-center">
                <div className="p-4 bg-[var(--bg-card)] rounded-full shadow-sm mb-4 border border-[var(--border-base)]">
                  <Megaphone className="w-10 h-10 text-slate-200 dark:text-slate-800" />
                </div>
                <p className="text-[var(--text-muted)] text-sm font-medium">Pilih salah satu pengumuman<br />untuk melihat detail informasi lengkap.</p>
              </div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Mobile Detail Modal */}
      <AnimatePresence>
        {selectedItem && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 lg:hidden">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setSelectedItem(null)} className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" />
            <motion.div 
               initial={{ opacity: 0, scale: 0.9, y: 20 }} 
               animate={{ opacity: 1, scale: 1, y: 0 }} 
               exit={{ opacity: 0, scale: 0.9, y: 20 }} 
               className="bg-[var(--bg-card)] rounded-3xl shadow-2xl w-full max-w-sm overflow-hidden relative z-10 border border-[var(--border-base)]"
            >
              <div className="p-6 sm:p-8">
                <div className="flex justify-between items-start mb-6">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center border border-blue-100/50 dark:border-blue-900/50">
                      <Megaphone className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                      <p className="text-[9px] font-bold uppercase tracking-[0.15em] text-[var(--text-muted)]">Pengumuman</p>
                      <p className="text-xs font-semibold text-[var(--text-primary)] mt-0.5">{formatDate(selectedItem.tanggalDibuat)}</p>
                    </div>
                  </div>
                  <button onClick={() => setSelectedItem(null)} className="p-2 hover:bg-slate-50 dark:hover:bg-white/5 rounded-full transition-colors">
                    <XCircle className="w-5 h-5 text-[var(--text-muted)]" />
                  </button>
                </div>
                <h2 className="text-xl font-bold text-[var(--text-primary)] tracking-tight leading-tight mb-4 uppercase">{selectedItem.judul}</h2>
                <div className="w-10 h-1 bg-blue-600 rounded-full mb-6" />
                <div className="max-h-[50vh] overflow-y-auto pr-2">
                  <p className="text-[var(--text-secondary)] text-sm leading-relaxed whitespace-pre-wrap font-medium">{selectedItem.isi}</p>
                </div>
                <button 
                  onClick={() => setSelectedItem(null)}
                  className="w-full mt-8 py-3 bg-slate-900 text-white rounded-xl font-bold text-sm"
                >
                  Tutup
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Modal Form */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsModalOpen(false)} className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" />
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 10 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 10 }} className="bg-[var(--bg-card)] rounded-2xl shadow-2xl w-full max-w-xl overflow-hidden relative z-10 border border-[var(--border-base)]">
              <div className="bg-slate-900 dark:bg-slate-800 p-6 text-white flex justify-between items-center">
                <h2 className="text-xl font-bold tracking-tight">{editingItem ? 'Edit Konten Pengumuman' : 'Publikasi Pengumuman Baru'}</h2>
              </div>
              <form onSubmit={handleSubmit} className="p-8 space-y-6">
                <div>
                  <label className="block text-[11px] font-bold text-[var(--text-muted)] uppercase tracking-widest mb-2">Judul Pengumuman</label>
                  <input 
                    type="text" 
                    value={judul} 
                    onChange={(e) => setJudul(e.target.value)} 
                    className={cn(
                      "w-full px-4 py-3 bg-slate-50 dark:bg-white/5 border rounded-xl font-bold text-[var(--text-primary)] focus:ring-2 focus:ring-blue-600 outline-none transition-all",
                      errors.judul ? "border-red-300 ring-2 ring-red-100" : "border-[var(--border-base)]"
                    )} 
                    placeholder="Masukkan judul yang informatif..." 
                  />
                  {errors.judul && <p className="text-red-500 text-[10px] mt-2 font-bold uppercase tracking-wide">{errors.judul}</p>}
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-[var(--text-muted)] uppercase tracking-widest mb-2">Konten Detail</label>
                  <textarea 
                    value={isi} 
                    onChange={(e) => setIsi(e.target.value)} 
                    className={cn(
                      "w-full px-4 py-3 bg-slate-50 dark:bg-white/5 border rounded-xl min-h-[220px] text-sm font-medium text-[var(--text-secondary)] leading-relaxed focus:ring-2 focus:ring-blue-600 outline-none transition-all",
                      errors.isi ? "border-red-300 ring-2 ring-red-100" : "border-[var(--border-base)]"
                    )} 
                    placeholder="Sampaikan pesan atau detail informasi selengkap mungkin kepada seluruh anggota..." 
                  />
                  {errors.isi && <p className="text-red-500 text-[10px] mt-2 font-bold uppercase tracking-wide">{errors.isi}</p>}
                </div>
                <div className="pt-4 flex gap-3">
                  <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 px-6 py-3 border border-[var(--border-base)] rounded-xl font-bold text-[var(--text-secondary)] hover:bg-slate-50 dark:hover:bg-white/5 transition-all">Batal</button>
                  <button type="submit" className="flex-1 px-6 py-3 bg-slate-900 text-white rounded-xl font-bold shadow-lg shadow-slate-100 hover:bg-slate-800 transition-all">Publish</button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

function XCircle({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <circle cx="12" cy="12" r="10" />
      <path d="m15 9-6 6" />
      <path d="m9 9 6 6" />
    </svg>
  );
}
