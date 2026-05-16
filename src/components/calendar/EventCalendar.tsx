/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { 
  Calendar as CalendarIcon, 
  ChevronLeft, 
  ChevronRight, 
  Plus, 
  Trash2, 
  Clock, 
  Info, 
  Check, 
  X,
  History
} from 'lucide-react';
import { 
  format, 
  addDays, 
  startOfMonth, 
  endOfMonth, 
  startOfWeek, 
  endOfWeek, 
  isSameMonth, 
  isSameDay, 
  addMonths, 
  subMonths,
  parseISO,
  isAfter,
  startOfDay
} from 'date-fns';
import { id } from 'date-fns/locale';
import { motion, AnimatePresence } from 'motion/react';
import { useEvents } from '../../hooks/useEvents';
import { Kegiatan, KegiatanInput } from '../../types';
import { useAuth } from '../../hooks/useAuth';

export default function EventCalendar() {
  const { events, isLoading, addEvent, deleteEvent } = useEvents();
  const { role } = useAuth();
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [isAdding, setIsAdding] = useState(false);
  
  const [formData, setFormData] = useState<KegiatanInput>({
    judul: '',
    kategori: 'Khusus',
    deskripsi: '',
    tanggal: format(new Date(), 'yyyy-MM-dd'),
  });

  // Logika Selapanan (35 Hari)
  // Seed: 18 April 2026 / 23 Mei 2026
  const recurringEvents = useMemo(() => {
    const seedDate = new Date(2026, 3, 18); // 18 April 2026 (JS Month is 0-indexed)
    const list: Partial<Kegiatan>[] = [];
    
    // Generate for 2 years
    let current = seedDate;
    for (let i = 0; i < 24; i++) {
      list.push({
        id: `rutin-${i}`,
        judul: 'Kumpulan Rutin Selapanan',
        kategori: 'Rutin',
        tanggal: format(current, 'yyyy-MM-dd'),
        deskripsi: 'Pertemuan rutin organisasi setiap 35 hari (Sabtu Malam Minggu).'
      });
      current = addDays(current, 35);
    }
    return list;
  }, []);

  const allEvents = useMemo(() => [...recurringEvents, ...events], [recurringEvents, events]);

  const calendarDays = useMemo(() => {
    const start = startOfWeek(startOfMonth(currentMonth));
    const end = endOfWeek(endOfMonth(currentMonth));
    const days = [];
    let day = start;
    
    while (day <= end) {
      days.push(day);
      day = addDays(day, 1);
    }
    return days;
  }, [currentMonth]);

  const eventsOnSelectedDate = useMemo(() => {
    return allEvents.filter(e => isSameDay(parseISO(e.tanggal!), selectedDate));
  }, [allEvents, selectedDate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await addEvent(formData);
    setIsAdding(false);
    setFormData({ judul: '', kategori: 'Khusus', deskripsi: '', tanggal: format(selectedDate, 'yyyy-MM-dd') });
  };

  const openAddModal = (date: Date) => {
    setSelectedDate(date);
    setFormData(prev => ({ ...prev, tanggal: format(date, 'yyyy-MM-dd') }));
    setIsAdding(true);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 max-w-6xl mx-auto space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tighter flex items-center gap-3">
            <CalendarIcon className="w-10 h-10 text-indigo-600" />
            KALENDER KEGIATAN
          </h1>
          <p className="text-gray-500 mt-1 font-medium italic">Monitor jadwal rutin 35 harian dan agenda khusus organisasi.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Calendar Grid */}
        <div className="lg:col-span-2 bg-white rounded-[2.5rem] shadow-xl shadow-slate-100 border border-slate-50 overflow-hidden">
          <div className="p-8 border-b border-slate-50 flex items-center justify-between bg-slate-50/50">
            <h2 className="text-xl font-black text-slate-900 uppercase tracking-widest italic">
              {format(currentMonth, 'MMMM yyyy', { locale: id })}
            </h2>
            <div className="flex gap-2">
              <button 
                onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
                className="p-2 hover:bg-white rounded-full transition-all shadow-sm border border-slate-100"
              >
                <ChevronLeft className="w-5 h-5 text-slate-600" />
              </button>
              <button 
                onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
                className="p-2 hover:bg-white rounded-full transition-all shadow-sm border border-slate-100"
              >
                <ChevronRight className="w-5 h-5 text-slate-600" />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-7 border-b border-slate-50">
            {['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'].map((d) => (
              <div key={d} className="py-4 text-center text-[10px] font-black text-slate-400 uppercase tracking-widest">
                {d}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-7">
            {calendarDays.map((day, idx) => {
              const dayEvents = allEvents.filter(e => isSameDay(parseISO(e.tanggal!), day));
              const isSelected = isSameDay(day, selectedDate);
              const isToday = isSameDay(day, new Date());
              const isCurrentMonth = isSameMonth(day, currentMonth);

              return (
                <button
                  key={idx}
                  onClick={() => setSelectedDate(day)}
                  className={`
                    relative h-24 md:h-32 border-r border-b border-slate-50 p-2 transition-all group
                    ${!isCurrentMonth ? 'bg-slate-50/30' : 'bg-white'}
                    ${isSelected ? 'ring-2 ring-inset ring-indigo-500 z-10' : ''}
                    hover:bg-indigo-50/30
                  `}
                >
                  <span className={`
                    text-xs font-bold w-6 h-6 flex items-center justify-center rounded-full
                    ${isToday ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-400'}
                    ${isCurrentMonth && !isToday ? 'text-slate-600' : ''}
                  `}>
                    {format(day, 'd')}
                  </span>

                  <div className="mt-1 space-y-1 overflow-hidden">
                    {dayEvents.slice(0, 2).map((e, ei) => (
                      <div 
                        key={ei} 
                        className={`
                          text-[8px] md:text-[10px] px-1.5 py-0.5 rounded-md truncate font-bold uppercase tracking-tighter
                          ${e.kategori === 'Rutin' ? 'bg-amber-100 text-amber-700' : 'bg-indigo-100 text-indigo-700'}
                        `}
                      >
                        {e.judul}
                      </div>
                    ))}
                    {dayEvents.length > 2 && (
                      <div className="text-[8px] text-indigo-400 font-bold px-1.5">+{dayEvents.length - 2} lagi</div>
                    )}
                  </div>

                  {(role === 'sekretaris' || role === 'bendahara') && isCurrentMonth && (
                    <div 
                      onClick={(e) => { e.stopPropagation(); openAddModal(day); }}
                      className="absolute bottom-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity p-1 bg-indigo-600 text-white rounded-md shadow-sm"
                    >
                      <Plus className="w-3 h-3" />
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Selected Date Details */}
        <div className="space-y-6">
          <div className="bg-slate-900 rounded-[2.5rem] p-8 text-white shadow-2xl relative overflow-hidden">
             <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/20 blur-3xl rounded-full translate-x-10 -translate-y-10"></div>
            
            <div className="relative z-10">
              <p className="text-indigo-400 text-xs font-black uppercase tracking-[0.2em] mb-2">Agenda Terpilih</p>
              <h3 className="text-3xl font-black italic tracking-tighter mb-1">
                {format(selectedDate, 'EEEE,', { locale: id })}
              </h3>
              <h3 className="text-xl font-bold text-slate-300">
                {format(selectedDate, 'd MMMM yyyy', { locale: id })}
              </h3>
            </div>
          </div>

          <div className="space-y-4">
            <AnimatePresence mode="popLayout">
              {eventsOnSelectedDate.length > 0 ? (
                eventsOnSelectedDate.map((event) => (
                  <motion.div
                    key={event.id}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm group"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex gap-4">
                        <div className={`
                          p-3 rounded-2xl
                          ${event.kategori === 'Rutin' ? 'bg-amber-50 text-amber-600' : 'bg-indigo-50 text-indigo-600'}
                        `}>
                          {event.kategori === 'Rutin' ? <History className="w-5 h-5" /> : <Clock className="w-5 h-5" />}
                        </div>
                        <div>
                          <div className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">
                            {event.kategori}
                          </div>
                          <h4 className="font-black text-slate-900 text-lg leading-tight">{event.judul}</h4>
                          {event.deskripsi && (
                            <p className="text-gray-500 text-sm mt-2 leading-relaxed italic">"{event.deskripsi}"</p>
                          )}
                        </div>
                      </div>
                      {(role === 'sekretaris' || role === 'bendahara') && event.kategori !== 'Rutin' && (
                        <button
                          onClick={() => deleteEvent(event.id!)}
                          className="p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </motion.div>
                ))
              ) : (
                <div className="text-center py-12 bg-slate-50 rounded-[2rem] border-2 border-dashed border-slate-200">
                  <Info className="w-8 h-8 text-slate-300 mx-auto mb-3" />
                  <p className="text-slate-400 font-bold text-sm">Tidak ada kegiatan</p>
                </div>
              )}
            </AnimatePresence>

            {(role === 'sekretaris' || role === 'bendahara') && (
              <button
                onClick={() => openAddModal(selectedDate)}
                className="w-full py-4 bg-white border-2 border-dashed border-indigo-200 text-indigo-600 rounded-[2rem] font-black text-sm uppercase tracking-widest hover:bg-indigo-50 hover:border-indigo-300 transition-all active:scale-95 flex items-center justify-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Tambah Agenda Khusus
              </button>
            )}
          </div>

          <div className="bg-amber-50 p-6 rounded-[2rem] border border-amber-100">
             <div className="flex items-center gap-2 font-black text-amber-800 text-xs uppercase tracking-widest mb-2">
                <Info className="w-4 h-4" />
                Info Sistem
             </div>
             <p className="text-xs text-amber-700 leading-relaxed font-medium">
                Logika otomatis mendeteksi kumpulan rutin setiap 35 hari (selapanan). Jika hari tersebut jatuh pada hari Sabtu, maka agenda akan otomatis muncul sebagai "Sabtu Malam Minggu".
             </p>
          </div>
        </div>
      </div>

      {/* Modal Form */}
      <AnimatePresence>
        {isAdding && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 40 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 40 }}
              className="bg-white w-full max-w-md rounded-[2.5rem] shadow-2xl overflow-hidden"
            >
              <div className="p-8 border-b border-slate-50 flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-black text-slate-900 tracking-tight uppercase italic">TAMBAH AGENDA</h2>
                  <p className="text-indigo-600 text-xs font-black uppercase tracking-widest mt-1">
                    {format(selectedDate, 'd MMMM yyyy', { locale: id })}
                  </p>
                </div>
                <button onClick={() => setIsAdding(false)} className="p-2 hover:bg-slate-100 rounded-full transition-all">
                  <X className="w-6 h-6 text-slate-400" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="p-8 space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Judul Kegiatan</label>
                  <input
                    required
                    type="text"
                    value={formData.judul}
                    onChange={(e) => setFormData({ ...formData, judul: e.target.value })}
                    placeholder="Contoh: Baksos atau Rapat Besar"
                    className="w-full px-5 py-4 bg-slate-50 border-none rounded-2xl focus:ring-4 focus:ring-indigo-100 transition-all outline-none font-bold text-slate-700"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Kategori</label>
                  <select
                    value={formData.kategori}
                    onChange={(e) => setFormData({ ...formData, kategori: e.target.value as any })}
                    className="w-full px-5 py-4 bg-slate-50 border-none rounded-2xl focus:ring-4 focus:ring-indigo-100 transition-all outline-none font-bold text-slate-700 appearance-none"
                  >
                    <option value="Khusus">Khusus / Sekali Jalan</option>
                    <option value="Sosial">Kegiatan Sosial</option>
                    <option value="Rapat">Rapat Organisasi</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Deskripsi (Opsional)</label>
                  <textarea
                    rows={3}
                    value={formData.deskripsi}
                    onChange={(e) => setFormData({ ...formData, deskripsi: e.target.value })}
                    placeholder="Keterangan tambahan..."
                    className="w-full px-5 py-4 bg-slate-50 border-none rounded-2xl focus:ring-4 focus:ring-indigo-100 transition-all outline-none text-slate-600 font-medium italic"
                  />
                </div>

                <div className="flex gap-4 pt-4">
                  <button
                    type="button"
                    onClick={() => setIsAdding(false)}
                    className="flex-1 px-8 py-4 border border-slate-100 text-slate-400 rounded-full font-bold hover:bg-slate-50 transition-all uppercase tracking-widest text-[10px]"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-8 py-4 bg-indigo-600 text-white rounded-full font-bold hover:bg-indigo-700 transition-all flex items-center justify-center gap-2 shadow-xl shadow-indigo-100 active:scale-95 uppercase tracking-widest text-[10px]"
                  >
                    <Check className="w-5 h-5" />
                    Simpan Agenda
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
