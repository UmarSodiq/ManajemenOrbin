/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { ClipboardList, Calendar, MapPin, Clock, Plus, Edit2, Trash2, ChevronRight, FileText, Download } from 'lucide-react';
import { useRapat } from '../../hooks/useRapat';
import { useAnggota } from '../../hooks/useAnggota';
import { Rapat, RapatInput, NotulensiInput } from '../../types';
import { cn, formatDate } from '../../lib/utils';
import { validateRequiredFields } from '../../utils/validation';
import { motion, AnimatePresence } from 'motion/react';
import { toPng } from 'html-to-image';

export default function RapatManager() {
  const { rapatList, isLoading, tambahRapat, updateRapat, hapusRapat, simpanNotulensi } = useRapat();
  const { anggotaList } = useAnggota();
  const [selectedRapat, setSelectedRapat] = useState<Rapat | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isNotulensiModalOpen, setIsNotulensiModalOpen] = useState(false);
  const [editingRapat, setEditingRapat] = useState<Rapat | null>(null);

  // Rapat form state
  const [judul, setJudul] = useState('');
  const [tanggal, setTanggal] = useState(new Date().toISOString().split('T')[0]);
  const [waktuMulai, setWaktuMulai] = useState('09:00');
  const [waktuSelesai, setWaktuSelesai] = useState('11:00');
  const [tempat, setTempat] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Notulensi form state
  const [agenda, setAgenda] = useState('');
  const [pembahasan, setPembahasan] = useState('');
  const [keputusan, setKeputusan] = useState('');

  const resetRapatForm = () => {
    setJudul('');
    setTanggal(new Date().toISOString().split('T')[0]);
    setWaktuMulai('09:00');
    setWaktuSelesai('11:00');
    setTempat('');
    setErrors({});
    setEditingRapat(null);
  };

  const handleOpenRapatModal = (rapat?: Rapat) => {
    if (rapat) {
      setEditingRapat(rapat);
      setJudul(rapat.judul);
      setTanggal(rapat.tanggal.toISOString().split('T')[0]);
      setWaktuMulai(rapat.waktuMulai);
      setWaktuSelesai(rapat.waktuSelesai);
      setTempat(rapat.tempat);
    } else {
      resetRapatForm();
    }
    setIsModalOpen(true);
  };

  const handleOpenNotulensiModal = (rapat: Rapat) => {
    setSelectedRapat(rapat);
    setAgenda(rapat.notulensi?.agenda || '');
    setPembahasan(rapat.notulensi?.pembahasan || '');
    setKeputusan(rapat.notulensi?.keputusan || '');
    setIsNotulensiModalOpen(true);
  };

  const handleRapatSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const formErrors = validateRequiredFields({ judul, tanggal, waktuMulai, waktuSelesai, tempat });
    if (Object.keys(formErrors).length > 0) {
      setErrors(formErrors);
      return;
    }

    const data: RapatInput = {
      judul,
      tanggal: new Date(tanggal),
      waktuMulai,
      waktuSelesai,
      tempat
    };

    if (editingRapat) {
      await updateRapat(editingRapat.id, data);
    } else {
      await tambahRapat(data);
    }
    setIsModalOpen(false);
  };

  const handleNotulensiSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRapat) return;
    
    const notulensi: NotulensiInput = { agenda, pembahasan, keputusan };
    await simpanNotulensi(selectedRapat.id, notulensi);
    setIsNotulensiModalOpen(false);
  };

  const handleDownloadImage = async () => {
    const element = document.getElementById('notulensi-export-view');
    if (!element) return;
    try {
      const dataUrl = await toPng(element, { 
        backgroundColor: '#ffffff',
        pixelRatio: 2,
        quality: 1
      });
      const link = document.createElement('a');
      link.download = `NOTULENSI_${selectedRapat?.judul || 'Rapat'}_${formatDate(selectedRapat?.tanggal || new Date())}.png`;
      link.href = dataUrl;
      link.click();
    } catch (error) {
      console.error('Download Error:', error);
      alert('Gagal mengunduh Notulensi. Silakan coba lagi.');
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 bg-[var(--bg-main)] min-h-full transition-colors">
      {/* Hidden Export View */}
      <div className="fixed -left-[2000px] top-0 pointer-events-none">
        <div 
          id="notulensi-export-view" 
          className="w-[800px] bg-white p-12 text-slate-900 font-sans"
        >
          {/* Header */}
          <div className="border-b-4 border-slate-900 pb-6 mb-8 flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-black tracking-tighter uppercase leading-none">ORBIN</h1>
              <p className="text-[10px] font-bold text-slate-500 tracking-[0.2em] mt-1 uppercase">Organisasi Remaja Britania Nglempong</p>
            </div>
            <div className="text-right">
              <h2 className="text-xl font-bold tracking-tight uppercase">NOTULENSI RAPAT</h2>
              <p className="text-xs font-mono font-bold text-slate-400 mt-1">{formatDate(selectedRapat?.tanggal || new Date())}</p>
            </div>
          </div>

          {/* Info Section */}
          <div className="grid grid-cols-2 gap-8 mb-10 bg-slate-50 p-6 rounded-2xl border border-slate-100">
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Judul Pertemuan</p>
              <p className="font-bold text-slate-900 uppercase">{selectedRapat?.judul}</p>
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Lokasi</p>
              <p className="font-bold text-slate-900">{selectedRapat?.tempat}</p>
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Waktu</p>
              <p className="font-bold text-slate-900">{selectedRapat?.waktuMulai} - {selectedRapat?.waktuSelesai}</p>
            </div>
          </div>

          {/* Content Sections */}
          <div className="space-y-8">
            <div className="border-l-4 border-blue-600 pl-6 py-1">
              <h3 className="text-xs font-black uppercase tracking-widest text-blue-600 mb-3">Agenda Utama</h3>
              <p className="text-base text-slate-800 leading-relaxed font-semibold whitespace-pre-wrap">{agenda || '-'}</p>
            </div>

            <div className="border-l-4 border-slate-200 pl-6 py-1">
              <h3 className="text-xs font-black uppercase tracking-widest text-slate-400 mb-3">Risalah Pembahasan</h3>
              <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-wrap">{pembahasan || '-'}</p>
            </div>

            <div className="border-l-4 border-emerald-500 pl-6 py-2 bg-emerald-50/50 rounded-r-2xl pr-6">
              <h3 className="text-xs font-black uppercase tracking-widest text-emerald-600 mb-3">Simpulan & Keputusan</h3>
              <p className="text-base text-slate-900 font-bold leading-relaxed whitespace-pre-wrap">{keputusan || '-'}</p>
            </div>
          </div>

          {/* Footer */}
          <div className="mt-20 pt-12 border-t border-slate-100 flex justify-between">
            <div className="text-center w-64">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-16 underline">Sekretaris</p>
              <div className="text-sm font-bold text-slate-900 mb-1 uppercase tracking-tight">
                {anggotaList.find(a => a.jabatan.toLowerCase() === 'sekretaris')?.namaLengkap || '..........................'}
              </div>
              <div className="w-40 h-px bg-slate-200 mx-auto" />
            </div>
            <div className="text-center w-64">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-16 underline">Mengetahui, Ketua</p>
              <div className="text-sm font-bold text-slate-900 mb-1 uppercase tracking-tight">
                {anggotaList.find(a => a.jabatan.toLowerCase() === 'ketua')?.namaLengkap || '..........................'}
              </div>
              <div className="w-40 h-px bg-slate-200 mx-auto" />
            </div>
          </div>
        </div>
      </div>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6 sm:mb-8">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[var(--text-primary)]">Manajemen Rapat</h1>
          <p className="text-xs sm:text-sm text-[var(--text-secondary)] mt-1">Kelola jadwal rapat dan notulensi resmi organisasi.</p>
        </div>
        <button
          onClick={() => handleOpenRapatModal()}
          className="w-full md:w-auto bg-slate-900 text-white px-5 py-2.5 rounded-xl flex items-center justify-center gap-2 font-semibold hover:bg-slate-800 transition-all shadow-sm"
        >
          <Plus className="w-4 h-4" />
          <span className="text-sm">Buat Rapat Baru</span>
        </button>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:gap-4">
        {isLoading ? (
          <div className="p-12 text-center text-[var(--text-muted)] italic bg-[var(--bg-card)] rounded-2xl border border-[var(--border-base)] text-sm">Memuat data rapat...</div>
        ) : rapatList.length === 0 ? (
          <div className="p-12 text-center text-[var(--text-muted)] italic bg-[var(--bg-card)] rounded-2xl border border-[var(--border-base)] text-sm">Belum ada rapat terjadwal.</div>
        ) : rapatList.map((rapat) => (
          <motion.div
            layout
            key={rapat.id}
            className="card-base group hover:border-blue-600 dark:hover:border-blue-400 transition-all"
          >
            <div className="p-4 sm:p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 sm:gap-6">
              <div className="flex items-start gap-3 sm:gap-5 flex-1 w-full">
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-slate-50 dark:bg-white/5 flex flex-col items-center justify-center border border-[var(--border-base)] flex-shrink-0">
                  <span className="text-[8px] sm:text-[9px] font-bold text-[var(--text-muted)] uppercase tracking-tighter">
                    {rapat.tanggal.toLocaleString('id-ID', { month: 'short' })}
                  </span>
                  <span className="text-base sm:text-lg font-bold text-[var(--text-primary)] leading-tight">
                    {rapat.tanggal.getDate()}
                  </span>
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="text-sm sm:text-base font-bold text-[var(--text-primary)] truncate">{rapat.judul}</h3>
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 mt-1 sm:mt-1.5 text-[var(--text-secondary)]">
                    <div className="flex items-center gap-1.5 text-[10px] sm:text-xs">
                      <Clock className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-blue-600" />
                      <span className="font-mono font-medium">{rapat.waktuMulai} - {rapat.waktuSelesai}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-[10px] sm:text-xs min-w-0">
                      <MapPin className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-blue-600 flex-shrink-0" />
                      <span className="font-medium truncate">{rapat.tempat}</span>
                    </div>
                    {rapat.notulensi && (
                      <span className="bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full text-[9px] sm:text-[10px] font-bold uppercase tracking-wider flex items-center gap-1">
                        <FileText className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                        Notulen
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-1 w-full md:w-auto">
                <button
                  onClick={() => handleOpenNotulensiModal(rapat)}
                  className="flex-1 md:flex-none bg-slate-100 px-3 py-2 rounded-lg text-[10px] sm:text-xs font-bold text-slate-600 hover:bg-slate-200 transition-all flex items-center justify-center gap-2"
                >
                  <FileText className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  Notulensi
                </button>
                <div className="flex">
                  <button
                    onClick={() => handleOpenRapatModal(rapat)}
                    className="p-2 hover:bg-blue-50 rounded-lg text-gray-400 hover:text-blue-600 transition-all"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => hapusRapat(rapat.id)}
                    className="p-2 hover:bg-red-50 rounded-lg text-gray-400 hover:text-red-500 transition-all"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Rapat Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsModalOpen(false)} className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" />
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 10 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 10 }} className="bg-[var(--bg-card)] rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden relative z-10 border border-[var(--border-base)]">
              <div className="bg-slate-900 dark:bg-slate-800 p-6 text-white flex justify-between items-center">
                <h2 className="text-xl font-bold tracking-tight">{editingRapat ? 'Ubah Informasi Rapat' : 'Penjadwalan Rapat'}</h2>
              </div>
              <form onSubmit={handleRapatSubmit} className="p-8 space-y-5">
                <div>
                  <label className="block text-[11px] font-bold text-[var(--text-muted)] uppercase tracking-widest mb-2">Judul Pertemuan</label>
                  <input type="text" value={judul} onChange={(e) => setJudul(e.target.value)} className="w-full px-4 py-3 bg-slate-50 dark:bg-white/5 border border-[var(--border-base)] rounded-xl focus:ring-2 focus:ring-blue-600 outline-none transition-all text-sm font-medium text-[var(--text-primary)]" placeholder="Rapat Rutin Bulanan" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] font-bold text-[var(--text-muted)] uppercase tracking-widest mb-2">Tanggal</label>
                    <input type="date" value={tanggal} onChange={(e) => setTanggal(e.target.value)} className="w-full px-4 py-3 bg-slate-50 dark:bg-white/5 border border-[var(--border-base)] rounded-xl focus:ring-2 focus:ring-blue-600 outline-none transition-all text-sm font-medium text-[var(--text-primary)]" />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-[var(--text-muted)] uppercase tracking-widest mb-2">Lokasi</label>
                    <input type="text" value={tempat} onChange={(e) => setTempat(e.target.value)} className="w-full px-4 py-3 bg-slate-50 dark:bg-white/5 border border-[var(--border-base)] rounded-xl focus:ring-2 focus:ring-blue-600 outline-none transition-all text-sm font-medium text-[var(--text-primary)]" placeholder="Aula Utama" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] font-bold text-[var(--text-muted)] uppercase tracking-widest mb-2">Waktu Mulai</label>
                    <input type="time" value={waktuMulai} onChange={(e) => setWaktuMulai(e.target.value)} className="w-full px-4 py-3 bg-slate-50 dark:bg-white/5 border border-[var(--border-base)] rounded-xl focus:ring-2 focus:ring-blue-600 outline-none transition-all text-sm font-mono font-bold text-[var(--text-primary)]" />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-[var(--text-muted)] uppercase tracking-widest mb-2">Waktu Selesai</label>
                    <input type="time" value={waktuSelesai} onChange={(e) => setWaktuSelesai(e.target.value)} className="w-full px-4 py-3 bg-slate-50 dark:bg-white/5 border border-[var(--border-base)] rounded-xl focus:ring-2 focus:ring-blue-600 outline-none transition-all text-sm font-mono font-bold text-[var(--text-primary)]" />
                  </div>
                </div>
                <div className="pt-4 flex gap-3">
                  <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 px-6 py-3 border border-[var(--border-base)] rounded-xl font-bold text-[var(--text-secondary)] hover:bg-slate-50 dark:hover:bg-white/5 transition-all">Batal</button>
                  <button type="submit" className="flex-1 px-6 py-3 bg-slate-900 text-white rounded-xl font-bold shadow-lg shadow-slate-200 hover:bg-slate-800 transition-all">Simpan Jadwal</button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Notulensi Modal */}
      <AnimatePresence>
        {isNotulensiModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsNotulensiModalOpen(false)} className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" />
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 10 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 10 }} className="bg-[var(--bg-card)] rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden relative z-10 border border-[var(--border-base)]">
              <div className="bg-slate-900 dark:bg-slate-800 p-6 text-white flex justify-between items-center">
                <div>
                  <h2 className="text-lg font-bold tracking-tight">Lembar Notulensi</h2>
                  <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-1">{selectedRapat?.judul} | {selectedRapat && formatDate(selectedRapat.tanggal)}</p>
                </div>
                <div className="flex items-center gap-3">
                   <button 
                     onClick={handleDownloadImage}
                     className="px-3 py-1.5 bg-white/10 rounded-lg text-white hover:bg-white/20 transition-all flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider"
                   >
                     <Download className="w-3.5 h-3.5" />
                     Download
                   </button>
                   <button onClick={() => setIsNotulensiModalOpen(false)} className="hover:rotate-90 transition-transform">
                     <XCircle className="w-6 h-6 opacity-60 hover:opacity-100" />
                   </button>
                </div>
              </div>
              <form onSubmit={handleNotulensiSubmit} id="notulensi-area" className="p-8 space-y-6 max-h-[70vh] overflow-y-auto">
                <div className="p-6 bg-slate-50 dark:bg-white/5 rounded-xl border border-[var(--border-base)]">
                  <label className="block text-[11px] font-bold text-[var(--text-muted)] uppercase tracking-widest mb-3">Agenda Utama</label>
                  <textarea value={agenda} onChange={(e) => setAgenda(e.target.value)} className="w-full px-0 py-0 bg-transparent border-none focus:ring-0 text-[var(--text-primary)] font-semibold min-h-[60px]" placeholder="Masukkan poin agenda..." />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-[var(--text-muted)] uppercase tracking-widest mb-2">Risalah Pembahasan</label>
                  <textarea value={pembahasan} onChange={(e) => setPembahasan(e.target.value)} className="w-full px-4 py-3 bg-slate-50 dark:bg-white/5 border border-[var(--border-base)] rounded-xl min-h-[150px] text-sm text-[var(--text-primary)] focus:ring-2 focus:ring-blue-600 outline-none transition-all" placeholder="Tuliskan detail jalannya diskusi..." />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-[var(--text-muted)] uppercase tracking-widest mb-2">Simpulan & Keputusan Akhir</label>
                  <textarea value={keputusan} onChange={(e) => setKeputusan(e.target.value)} className="w-full px-4 py-3 bg-slate-50 dark:bg-white/5 border border-[var(--border-base)] rounded-xl min-h-[100px] text-sm font-semibold text-blue-700 dark:text-blue-400 focus:ring-2 focus:ring-blue-600 outline-none transition-all" placeholder="Hasil kesepakatan akhir..." />
                </div>
                <div className="pt-4 flex gap-3">
                  <button type="button" onClick={() => setIsNotulensiModalOpen(false)} className="flex-1 px-6 py-3 border border-[var(--border-base)] rounded-xl font-bold text-[var(--text-secondary)] hover:bg-slate-50 dark:hover:bg-white/5 transition-all">Batal</button>
                  <button type="submit" className="flex-1 px-6 py-3 bg-slate-900 text-white rounded-xl font-bold shadow-lg shadow-slate-100 hover:bg-slate-800 transition-all">Perbarui Notulensi</button>
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
