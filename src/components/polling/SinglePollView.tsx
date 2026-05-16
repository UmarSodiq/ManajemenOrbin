/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Vote as VoteIcon } from 'lucide-react';
import { usePollingActions, useSinglePoll } from '../../hooks/usePolling';
import PollingManager, { PollCard } from './PollingManager';

// We reuse the PollCard logic within the main manager pattern or a streamlined view
export default function SinglePollView() {
  const { id } = useParams<{ id: string }>();
  const { poll, isLoading, error } = useSinglePoll(id);
  const { deletePoll, updatePollStatus } = usePollingActions();
  
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen p-4">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  if (error || !poll) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4 text-center">
        <VoteIcon className="w-16 h-16 text-slate-200 mb-4" />
        <h2 className="text-2xl font-black text-slate-900 mb-2 uppercase italic tracking-tight">Polling Tidak Ditemukan</h2>
        <p className="text-slate-500 mb-8 font-medium">
          {error ? `Terjadi kesalahan: ${error}` : 'Link mungkin sudah kedaluwarsa atau dihapus.'}
        </p>
        <Link to="/polling" className="px-8 py-3 bg-indigo-600 text-white rounded-full font-black text-xs uppercase tracking-widest shadow-lg active:scale-95 transition-all">
          Lihat Semua Polling
        </Link>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 max-w-2xl mx-auto space-y-8 min-h-screen flex flex-col justify-center">
      <Link to="/polling" className="flex items-center gap-2 text-slate-400 hover:text-indigo-600 font-black text-[10px] uppercase tracking-widest transition-all mb-4 self-start">
        <ArrowLeft className="w-4 h-4" />
        Kembali ke Semua Polling
      </Link>

      <div className="shadow-2xl shadow-indigo-100/50 rounded-[3rem]">
        {/* We need to re-import PollCard or export it from PollingManager */}
        {/* For now we'll assume it's exported. Let's fix that if needed. */}
        <PollCard 
           poll={poll} 
           onDelete={() => deletePoll(poll.id)}
           onToggleStatus={() => updatePollStatus(poll.id, poll.status === 'aktif' ? 'selesai' : 'aktif')}
        />
      </div>

      <div className="text-center">
         <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest leading-relaxed">
            Satu perangkat hanya dapat memberikan satu suara. <br/> Gunakan hak pilih Anda secara jujur.
         </p>
      </div>
    </div>
  );
}
