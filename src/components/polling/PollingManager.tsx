/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo, useRef } from 'react';
import { 
  Vote as VoteIcon, 
  Plus, 
  Trash2, 
  Share2, 
  CheckCircle2, 
  XCircle, 
  BarChart3, 
  Users, 
  Info,
  ChevronRight,
  Target,
  Copy,
  Check,
  Download,
  Search,
  Filter,
  PieChart as PieChartIcon
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { usePolling, usePollVotes, usePollingActions } from '../../hooks/usePolling';
import { useAuth } from '../../hooks/useAuth';
import { Polling, PollingInput } from '../../types';
import { format } from 'date-fns';
import { id as localeId } from 'date-fns/locale';
import { toJpeg } from 'html-to-image';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';

export default function PollingManager() {
  const { polls, isLoading, createPoll, deletePoll, updatePollStatus } = usePolling();
  const { role } = useAuth();
  const [isAdding, setIsAdding] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'aktif' | 'selesai'>('all');

  const filteredPolls = useMemo(() => {
    return polls.filter(p => {
      const matchesSearch = p.judul.toLowerCase().includes(searchQuery.toLowerCase()) || 
                            p.deskripsi?.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = statusFilter === 'all' || p.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [polls, searchQuery, statusFilter]);

  const [formData, setFormData] = useState<PollingInput>({
    judul: '',
    deskripsi: '',
    tipe: 'pilihan_ganda',
    pilihan: ['', ''],
    status: 'aktif'
  });

  const handleAddOption = () => {
    setFormData(prev => ({ ...prev, pilihan: [...prev.pilihan, ''] }));
  };

  const handleRemoveOption = (index: number) => {
    setFormData(prev => ({ 
      ...prev, 
      pilihan: prev.pilihan.filter((_, i) => i !== index) 
    }));
  };

  const handleOptionChange = (index: number, value: string) => {
    const newOptions = [...formData.pilihan];
    newOptions[index] = value;
    setFormData(prev => ({ ...prev, pilihan: newOptions }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.tipe === 'pilihan_ganda' && formData.pilihan.some(p => !p.trim())) return;
    
    await createPoll(formData);
    setIsAdding(false);
    setFormData({ judul: '', deskripsi: '', tipe: 'pilihan_ganda', pilihan: ['', ''], status: 'aktif' });
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
      <div className="flex flex-col space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-4xl font-black text-slate-900 tracking-tighter flex items-center gap-3">
              <VoteIcon className="w-10 h-10 text-indigo-600" />
              E-VOTING & POLLING
            </h1>
            <p className="text-gray-500 mt-1 font-medium italic">Satu suara sangat berharga untuk kemajuan organisasi.</p>
          </div>
          {role === 'sekretaris' && (
            <button
              onClick={() => setIsAdding(true)}
              className="px-6 py-3 bg-indigo-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100 flex items-center gap-2 active:scale-95"
            >
              <Plus className="w-4 h-4" />
              Buat Polling Baru
            </button>
          )}
        </div>

        {/* Search & Filter */}
        <div className="flex flex-col md:flex-row gap-4 bg-white p-4 rounded-[2rem] border border-slate-100 shadow-sm">
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input 
              type="text" 
              placeholder="Cari judul polling..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-slate-50 border-none rounded-xl text-xs font-bold outline-none focus:ring-2 focus:ring-indigo-100 transition-all"
            />
          </div>
          <div className="flex gap-2">
            {(['all', 'aktif', 'selesai'] as const).map((s) => (
              <button
                key={s}
                onClick={() => setStatusFilter(s)}
                className={`px-4 py-3 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${statusFilter === s ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-100' : 'bg-slate-50 text-slate-400 hover:bg-slate-100'}`}
              >
                {s === 'all' ? 'Semua' : s}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Poll List */}
        <div className="lg:col-span-12 space-y-4">
          {filteredPolls.length === 0 ? (
            <div className="text-center py-20 bg-white rounded-[3rem] border-2 border-dashed border-slate-100 italic text-slate-400 font-medium">
              {searchQuery || statusFilter !== 'all' ? 'Tidak ada polling yang cocok dengan pencarian.' : 'Belum ada polling yang dibuat.'}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {filteredPolls.map((poll) => (
                <PollCard 
                  key={poll.id} 
                  poll={poll} 
                  onDelete={() => deletePoll(poll.id)}
                  onToggleStatus={() => updatePollStatus(poll.id, poll.status === 'aktif' ? 'selesai' : 'aktif')}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Create Modal */}
      <AnimatePresence>
        {isAdding && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 40 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 40 }}
              className="bg-white w-full max-w-lg rounded-[2.5rem] shadow-2xl overflow-hidden max-h-[90vh] overflow-y-auto"
            >
              <div className="p-8 border-b border-slate-50 flex items-center justify-between sticky top-0 bg-white z-10">
                <h2 className="text-2xl font-black text-slate-900 tracking-tight uppercase italic">BUAT POLLING BARU</h2>
                <button onClick={() => setIsAdding(false)} className="p-2 hover:bg-slate-100 rounded-full transition-all">
                  <XCircle className="w-6 h-6 text-slate-400" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="p-8 space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Judul Polling / Pilih Ketua</label>
                  <input
                    required
                    type="text"
                    value={formData.judul}
                    onChange={(e) => setFormData({ ...formData, judul: e.target.value })}
                    className="w-full px-5 py-4 bg-slate-50 border-none rounded-2xl focus:ring-4 focus:ring-indigo-100 transition-all outline-none font-bold text-slate-700"
                    placeholder="Contoh: Pemilihan Ketua Karang Taruna 2026"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Deskripsi (Opsional)</label>
                  <textarea
                    rows={2}
                    value={formData.deskripsi}
                    onChange={(e) => setFormData({ ...formData, deskripsi: e.target.value })}
                    className="w-full px-5 py-4 bg-slate-50 border-none rounded-2xl focus:ring-4 focus:ring-indigo-100 transition-all outline-none italic font-medium text-slate-600"
                    placeholder="Penjelasan singkat tentang polling ini..."
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Metode Voting</label>
                  <div className="grid grid-cols-2 gap-4">
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, tipe: 'pilihan_ganda' })}
                      className={`p-4 rounded-2xl border-2 transition-all font-black text-[10px] uppercase tracking-widest ${formData.tipe === 'pilihan_ganda' ? 'border-indigo-600 bg-indigo-50 text-indigo-600' : 'border-slate-100 text-slate-400'}`}
                    >
                      Pilihan Ganda
                    </button>
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, tipe: 'manual' })}
                      className={`p-4 rounded-2xl border-2 transition-all font-black text-[10px] uppercase tracking-widest ${formData.tipe === 'manual' ? 'border-indigo-600 bg-indigo-50 text-indigo-600' : 'border-slate-100 text-slate-400'}`}
                    >
                      Isi Nama/Input
                    </button>
                  </div>
                </div>

                {formData.tipe === 'pilihan_ganda' && (
                  <div className="space-y-4">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Opsi Pilihan (Kandidat)</label>
                    {formData.pilihan.map((opt, idx) => (
                      <div key={idx} className="flex gap-2">
                        <input
                          required
                          type="text"
                          value={opt}
                          onChange={(e) => handleOptionChange(idx, e.target.value)}
                          className="flex-1 px-5 py-3 bg-slate-50 border-none rounded-2xl focus:ring-4 focus:ring-indigo-100 transition-all outline-none font-bold text-slate-700 text-sm"
                          placeholder={`Opsi ${idx + 1}`}
                        />
                        {formData.pilihan.length > 2 && (
                          <button
                            type="button"
                            onClick={() => handleRemoveOption(idx)}
                            className="p-3 text-red-400 hover:text-red-600 transition-colors"
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                        )}
                      </div>
                    ))}
                    <button
                      type="button"
                      onClick={handleAddOption}
                      className="w-full py-3 border-2 border-dashed border-slate-200 text-slate-400 rounded-2xl font-bold text-xs hover:bg-slate-50 transition-all"
                    >
                      + Tambah Opsi
                    </button>
                  </div>
                )}

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
                      Publikasikan Polling
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

export function PollCard({ poll, onDelete, onToggleStatus }: { poll: Polling, onDelete: () => void, onToggleStatus: () => void }) {
  const { castVote } = usePollingActions();
  const { votes, userVote, isLoading } = usePollVotes(poll.id);
  const { role, user } = useAuth();
  const [manualVote, setManualVote] = useState('');
  const [isCopied, setIsCopied] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [viewType, setViewType] = useState<'list' | 'chart'>('list');
  const cardRef = useRef<HTMLDivElement>(null);

  const showResults = role === 'sekretaris' || poll.status === 'selesai';

  const chartData = useMemo(() => {
    const data: Array<{ name: string, value: number }> = [];
    votes.forEach(v => {
      const existing = data.find(item => item.name === v.pilihan);
      if (existing) {
        existing.value++;
      } else {
        data.push({ name: v.pilihan, value: 1 });
      }
    });
    return data.sort((a, b) => b.value - a.value);
  }, [votes]);

  const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

  const voteCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    votes.forEach(v => {
      counts[v.pilihan] = (counts[v.pilihan] || 0) + 1;
    });
    return counts;
  }, [votes]);

  const totalVotes = votes.length;

  const handleVote = async (pilihan: string) => {
    if (poll.status !== 'aktif') return;
    await castVote(poll.id, { pilihan, voterName: user?.username || manualVote || 'Anonim' });
    setManualVote('');
  };

  const handleCopyLink = () => {
    const url = `${window.location.origin}/polling/${poll.id}`;
    navigator.clipboard.writeText(url);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const handleDownloadJPG = async () => {
    if (!cardRef.current) return;
    setIsDownloading(true);
    try {
      const dataUrl = await toJpeg(cardRef.current, { 
        quality: 0.95,
        backgroundColor: '#ffffff',
        filter: (node) => {
          if (node instanceof HTMLElement) {
            return !node.hasAttribute('data-html2canvas-ignore');
          }
          return true;
        }
      });
      const link = document.createElement('a');
      link.download = `Hasil-Polling-${poll.judul.replace(/\s+/g, '-')}.jpg`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error('Download failed:', err);
    } finally {
      setIsDownloading(false);
    }
  };

  const handleDownloadCSV = () => {
    const headers = ['Nama Pemilih', 'Pilihan', 'Waktu'];
    const rows = votes.map(v => [
      v.voterName || 'Anonim',
      v.pilihan,
      v.timestamp ? format(v.timestamp, 'yyyy-MM-dd HH:mm:ss') : '-'
    ]);
    
    const csvContent = [
      headers.join(','),
      ...rows.map(r => r.join(','))
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `Detail-Voting-${poll.judul.replace(/\s+/g, '-')}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <motion.div
      ref={cardRef}
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden flex flex-col h-full group"
    >
      <div className="p-8 pb-4">
        <div className="flex items-start justify-between mb-4">
           <span className={`
            px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-[0.2em]
            ${poll.status === 'aktif' ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-100 text-slate-400'}
           `}>
            {poll.status === 'aktif' ? 'SEDANG BERJALAN' : 'HASIL SELESAI'}
           </span>
           <div className="flex gap-2" data-html2canvas-ignore>
             {showResults && totalVotes > 0 && (
               <button 
                onClick={() => setViewType(prev => prev === 'list' ? 'chart' : 'list')} 
                className={`p-2 rounded-lg transition-all ${viewType === 'chart' ? 'text-indigo-600 bg-indigo-50' : 'text-slate-300 hover:text-indigo-600'}`}
                title="Tampilan Grafik"
               >
                 <BarChart3 className="w-4 h-4" />
               </button>
             )}
             <button onClick={handleCopyLink} className="p-2 text-slate-300 hover:text-indigo-600 rounded-lg transition-all" title="Salin Link">
               {isCopied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
             </button>
             {role === 'sekretaris' && (
               <>
                 <button 
                  onClick={handleDownloadJPG} 
                  disabled={isDownloading}
                  className="p-2 text-slate-300 hover:text-indigo-600 rounded-lg transition-all" 
                  title="Unduh JPG"
                 >
                    {isDownloading ? <div className="w-4 h-4 border-2 border-indigo-600 border-t-transparent animate-spin rounded-full" /> : <Download className="w-4 h-4" />}
                 </button>
                 <button 
                  onClick={handleDownloadCSV} 
                  className="p-2 text-slate-300 hover:text-emerald-600 rounded-lg transition-all" 
                  title="Unduh CSV Detail"
                 >
                    <Users className="w-4 h-4" />
                 </button>
                 <button onClick={onToggleStatus} className="p-2 text-slate-300 hover:text-amber-500 rounded-lg transition-all" title="Toggle Status">
                    {poll.status === 'aktif' ? <CheckCircle2 className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                 </button>
                 <button onClick={onDelete} className="p-2 text-slate-300 hover:text-red-500 rounded-lg transition-all" title="Hapus">
                    <Trash2 className="w-4 h-4" />
                 </button>
               </>
             )}
           </div>
        </div>
        
        <h3 className="text-xl font-black text-slate-900 tracking-tight leading-tight">{poll.judul}</h3>
        {poll.deskripsi && <p className="text-gray-500 text-xs mt-2 italic line-clamp-2">{poll.deskripsi}</p>}
      </div>

      <div className="flex-1 p-8 pt-4 space-y-4">
        <div className="space-y-3">
          {viewType === 'chart' && showResults ? (
            <div className="h-[250px] w-full" key="chart-view">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={chartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', fontSize: '10px', fontWeight: 'bold' }}
                  />
                  <Legend 
                    verticalAlign="bottom" 
                    height={36} 
                    content={({ payload }) => (
                      <div className="flex flex-wrap justify-center gap-x-4 gap-y-1 mt-4">
                        {payload?.map((entry: any, index: number) => (
                          <div key={`legend-${index}`} className="flex items-center gap-1.5">
                            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }} />
                            <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">{entry.value}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          ) : (
            poll.tipe === 'pilihan_ganda' ? (
            poll.pilihan.map((p, idx) => {
              const count = (voteCounts as any)[p] || 0;
              const percentage = totalVotes > 0 ? (count / totalVotes) * 100 : 0;
              const isUserChoice = userVote?.pilihan === p;

              return (
                <div key={idx} className="space-y-1">
                  <button
                    disabled={poll.status !== 'aktif' || !!userVote}
                    onClick={() => handleVote(p)}
                    className={`
                      w-full p-4 rounded-2xl text-left transition-all border-2 relative overflow-hidden group/opt
                      ${isUserChoice ? 'border-indigo-600 bg-indigo-50/30' : 'border-slate-50 hover:border-slate-200'}
                      ${poll.status !== 'aktif' || userVote ? 'cursor-default' : 'active:scale-[0.98]'}
                    `}
                  >
                    <div className="relative z-10 flex items-center justify-between font-bold text-xs">
                      <span className="text-slate-700">{p}</span>
                      {isUserChoice && <CheckCircle2 className="w-4 h-4 text-indigo-600" />}
                    </div>
                    {/* Progress Bar Background */}
                    {showResults && (
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${percentage}%` }}
                        className={`absolute inset-0 z-0 opacity-10 ${isUserChoice ? 'bg-indigo-600' : 'bg-slate-400'}`}
                      />
                    )}
                  </button>
                  {showResults && (
                    <div className="flex justify-between px-2 text-[9px] font-black uppercase text-slate-400 tracking-widest">
                      <span>{percentage.toFixed(0)}%</span>
                      <span>{count} Suara</span>
                    </div>
                  )}
                </div>
              );
            })
          ) : (
            <div className="space-y-4">
              {poll.status === 'aktif' && !userVote && (
                <div className="flex flex-col gap-2" data-html2canvas-ignore>
                  <input
                    type="text"
                    value={manualVote}
                    onChange={(e) => setManualVote(e.target.value)}
                    placeholder={poll.tipe === 'manual' ? "Tulis pilihan / nama Anda..." : "Tulis alasan/catatan (opsional)..."}
                    className="flex-1 px-4 py-3 bg-slate-50 border-none rounded-xl font-bold text-xs outline-none focus:ring-2 focus:ring-indigo-100 transition-all"
                  />
                  <button
                    onClick={() => handleVote(manualVote)}
                    disabled={!manualVote.trim()}
                    className="w-full py-3 bg-indigo-600 text-white rounded-xl font-black text-[9px] uppercase tracking-widest hover:bg-indigo-700 disabled:bg-slate-200 transition-all shadow-lg shadow-indigo-100"
                  >
                    Kirim Suara Sekarang
                  </button>
                </div>
              )}
              
              {showResults && (
                <div className="space-y-2 max-h-[150px] overflow-y-auto pr-2 custom-scrollbar">
                   {Object.entries(voteCounts).sort((a,b) => b[1] - a[1]).map(([p, count], idx) => (
                     <div key={idx} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
                        <span className="text-[10px] font-bold text-slate-600">{p}</span>
                        <span className="bg-white px-2 py-0.5 rounded-lg border border-slate-100 text-[9px] font-black text-indigo-600">{count}</span>
                     </div>
                   ))}
                </div>
              )}
              
              {!showResults && totalVotes > 0 && (
                <div className="py-4 text-center text-slate-400 italic text-[10px] font-medium border-2 border-dashed border-slate-50 rounded-2xl">
                  Hasil voting disembunyikan sampai pengelola mengumumkannya.
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="px-8 py-4 bg-slate-50/50 flex items-center justify-between border-t border-slate-50">
        <div className="flex items-center gap-2 text-slate-400">
           <Users className="w-4 h-4" />
           <span className="text-[10px] font-black uppercase tracking-widest">{totalVotes} Berpartisipasi</span>
        </div>
        <div className="text-[10px] font-bold text-slate-400 italic">
          {poll.createdAt instanceof Date && !isNaN(poll.createdAt.getTime()) 
            ? format(poll.createdAt, 'd MMM yy', { locale: localeId })
            : 'Pending...'}
        </div>
      </div>
    </motion.div>
  );
}


