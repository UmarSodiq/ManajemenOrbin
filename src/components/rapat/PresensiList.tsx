/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Calendar, CheckCircle2, Circle, ChevronLeft, Search, BarChart3 } from 'lucide-react';
import { useRapat } from '../../hooks/useRapat';
import { useAnggota } from '../../hooks/useAnggota';
import { cn, formatDate } from '../../lib/utils';
import { motion } from 'motion/react';

export default function PresensiList() {
  const { anggotaList } = useAnggota();
  const { rapatList, presensiList, togglePresensi, isLoading } = useRapat();
  
  const [selectedRapatId, setSelectedRapatId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const selectedRapat = rapatList.find(r => r.id === selectedRapatId) || rapatList[0];
  const anggotaAktif = anggotaList.filter(a => a.status === 'aktif');
  
  const filteredAnggota = anggotaAktif.filter(a => 
    a.namaLengkap.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatus = (anggotaId: string) => {
    if (!selectedRapat) return 'tidak_hadir';
    const p = presensiList.find(p => p.rapatId === selectedRapat.id && p.anggotaId === anggotaId);
    return p ? p.status : 'tidak_hadir';
  };

  const presensiRapat = selectedRapat ? presensiList.filter(p => p.rapatId === selectedRapat.id) : [];
  const hadirCount = presensiRapat.filter(p => p.status === 'hadir').length;

  if (!isLoading && rapatList.length === 0) {
    return (
      <div className="p-8 flex flex-col items-center justify-center min-h-[60vh] text-center">
        <Calendar className="w-20 h-20 text-gray-200 mb-6" />
        <h1 className="text-2xl font-bold text-gray-900">Belum Ada Rapat</h1>
        <p className="text-gray-500 mt-2">Buat rapat terlebih dahulu untuk mencatat presensi.</p>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 bg-gray-50 dark:bg-slate-950 min-h-full">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6 sm:mb-8">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white">Presensi Anggota</h1>
          <p className="text-xs sm:text-sm text-gray-500 dark:text-slate-400 mt-1">Catat kehadiran anggota pada setiap rapat resmi.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 lg:gap-8">
        {/* Rapat Selector */}
        <div className="lg:col-span-1 space-y-3 sm:space-y-4">
          <div className="flex justify-between items-center px-1">
            <h3 className="text-[10px] sm:text-[11px] font-bold uppercase tracking-[0.15em] text-gray-400 dark:text-slate-500">Daftar Pertemuan</h3>
            <span className="lg:hidden text-[9px] font-bold text-blue-500 dark:text-blue-400 uppercase tracking-widest animate-pulse">Geser &rsaquo;</span>
          </div>
          <div className="flex lg:flex-col gap-2 overflow-x-auto pb-4 lg:pb-0 scrollbar-hide -mx-4 px-4 lg:mx-0 lg:px-0">
            {rapatList.map(r => (
              <button
                key={r.id}
                onClick={() => setSelectedRapatId(r.id)}
                className={cn(
                  "flex-shrink-0 lg:flex-shrink-1 w-48 lg:w-full text-left p-4 rounded-xl border transition-all group",
                  (selectedRapatId === r.id || (!selectedRapatId && rapatList[0].id === r.id))
                    ? "border-blue-600 dark:border-blue-500 bg-white dark:bg-slate-900 shadow-md ring-1 ring-blue-600 dark:ring-blue-500"
                    : "border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-900/50 hover:border-blue-300 dark:hover:border-blue-900 shadow-sm"
                )}
              >
                <p className={cn(
                  "text-[9px] sm:text-[10px] font-bold mb-1 uppercase tracking-wider",
                  (selectedRapatId === r.id || (!selectedRapatId && rapatList[0].id === r.id)) ? "text-blue-600 dark:text-blue-400" : "text-gray-400 dark:text-slate-500"
                )}>{formatDate(r.tanggal)}</p>
                <p className="font-bold text-xs sm:text-sm truncate text-slate-900 dark:text-white">{r.judul}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Attendance List */}
        <div className="lg:col-span-3 space-y-6">
          <div className="bg-slate-900 dark:bg-slate-800 p-6 sm:p-8 rounded-2xl text-white flex flex-col md:flex-row justify-between items-center gap-6 shadow-sm">
             <div className="w-full text-center md:text-left">
               <h2 className="text-lg sm:text-xl font-bold tracking-tight">{selectedRapat?.judul}</h2>
               <div className="flex flex-col sm:flex-row items-center justify-center md:justify-start gap-2 sm:gap-3 mt-2 text-slate-400 text-[10px] sm:text-xs">
                 <div className="flex items-center gap-1.5 font-medium">
                   <Calendar className="w-3.5 h-3.5" />
                   {selectedRapat && formatDate(selectedRapat.tanggal)}
                 </div>
                 <span className="hidden sm:inline opacity-30">•</span>
                 <div className="flex items-center gap-1.5 font-medium min-w-0 max-w-full">
                   <span className="font-bold">@</span>
                   <span className="truncate">{selectedRapat?.tempat}</span>
                 </div>
               </div>
             </div>
             <div className="flex items-center gap-4 sm:gap-6 bg-white/5 p-4 rounded-xl px-6 sm:px-10 border border-white/10 backdrop-blur-sm w-full sm:w-auto justify-center">
                <div className="text-center">
                  <p className="text-2xl sm:text-3xl font-bold text-blue-400">{hadirCount}</p>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mt-1">Hadir</p>
                </div>
                <div className="w-px h-8 bg-white/10" />
                <div className="text-center">
                  <p className="text-2xl sm:text-3xl font-bold text-slate-300">{anggotaAktif.length - hadirCount}</p>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mt-1">Absen</p>
                </div>
             </div>
          </div>

          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-200 dark:border-slate-800 shadow-sm overflow-hidden">
            <div className="p-4 sm:p-5 border-b border-gray-100 dark:border-slate-800 flex items-center gap-4 bg-slate-50/50 dark:bg-slate-800/30">
              <Search className="w-4 h-4 text-gray-400 dark:text-slate-500" />
              <input 
                type="text" 
                placeholder="Cari nama anggota..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="bg-transparent border-none focus:ring-0 text-xs sm:text-sm w-full font-medium placeholder:text-gray-400 dark:placeholder:text-slate-600 dark:text-white" 
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-px bg-gray-100 dark:bg-slate-800">
              {filteredAnggota.map(a => {
                const status = getStatus(a.id);
                const isHadir = status === 'hadir';
                return (
                  <button
                    key={a.id}
                    onClick={() => selectedRapat && togglePresensi(selectedRapat.id, a.id)}
                    className="flex items-center justify-between p-4 sm:p-6 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all group"
                  >
                    <div className="flex items-center gap-3 sm:gap-4 min-w-0">
                      <div className={cn(
                        "w-9 h-9 sm:w-10 sm:h-10 rounded-lg flex items-center justify-center font-bold text-sm transition-all flex-shrink-0",
                        isHadir ? "bg-blue-50 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 ring-1 ring-blue-100 dark:ring-blue-900/40" : "bg-gray-50 dark:bg-slate-800 text-gray-400 dark:text-slate-500 border border-gray-100 dark:border-slate-700"
                      )}>
                        {a.namaLengkap.charAt(0).toUpperCase()}
                      </div>
                      <div className="text-left min-w-0">
                        <p className="font-bold text-slate-900 dark:text-white text-xs sm:text-sm leading-tight truncate uppercase">{a.namaLengkap}</p>
                        <p className="text-[9px] sm:text-[11px] text-blue-500 dark:text-blue-400 font-bold mt-0.5 tracking-tight uppercase truncate">{a.jabatan}</p>
                      </div>
                    </div>
                    {isHadir ? (
                      <div className="w-6 h-6 sm:w-7 sm:h-7 bg-blue-500 dark:bg-blue-600 rounded-full flex items-center justify-center text-white shadow-lg dark:shadow-none shadow-blue-500/30 ring-4 ring-blue-50 dark:ring-blue-900/20 flex-shrink-0">
                        <CheckCircle2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                      </div>
                    ) : (
                      <div className="w-6 h-6 sm:w-7 sm:h-7 bg-white dark:bg-slate-800 border-2 border-gray-200 dark:border-slate-700 rounded-full flex items-center justify-center transition-all group-hover:border-gray-300 dark:group-hover:border-slate-600 flex-shrink-0" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
