import React, { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Trophy, RefreshCw, X, UserPlus, Play, Keyboard, Zap } from 'lucide-react';
import { useMultiplayerGame } from '../../hooks/useMultiplayerGame';
import { useAuth } from '../../hooks/useAuth';

interface WordState {
  currentWord: string;
  p1Score: number;
  p2Score: number;
  lastWinner: string | null;
}

const WORDS = ['ORBIN', 'GALAXY', 'SPACE', 'FUTURE', 'CODING', 'MEMBER', 'GAMER', 'VICTORY', 'ROCKET', 'BATTLE', 'DRAGON', 'PHOENIX', 'CYBER', 'PIXEL', 'MATRIX'];

export default function WordBattle({ onBack }: { onBack: () => void }) {
  const { user } = useAuth();
  const { 
    room, 
    isLoading, 
    createRoom, 
    joinRoom, 
    updateGameState, 
    findAvailableRoom,
    subscribeToRoom 
  } = useMultiplayerGame('word_battle');

  const [localRoomId, setLocalRoomId] = useState<string | null>(null);
  const [input, setInput] = useState('');

  useEffect(() => {
    if (localRoomId) {
      const unsubscribe = subscribeToRoom(localRoomId);
      return () => unsubscribe();
    }
  }, [localRoomId]);

  const handleStart = async () => {
    if (!user) return;
    const available = await findAvailableRoom();
    if (available) {
      await joinRoom(available.id, user.uid, user.username || 'Guest', available.players);
      setLocalRoomId(available.id);
    } else {
      const id = await createRoom(user.uid, user.username || 'Guest', {
        currentWord: WORDS[Math.floor(Math.random() * WORDS.length)],
        p1Score: 0,
        p2Score: 0,
        lastWinner: null
      });
      if (id) setLocalRoomId(id);
    }
  };

  const checkInput = async (val: string) => {
    setInput(val.toUpperCase());
    if (!room || !user || room.status !== 'playing' || room.winner) return;

    if (val.toUpperCase() === room.gameState.currentWord) {
      const isP1 = room.players.p1.uid === user.uid;
      let newP1Score = room.gameState.p1Score;
      let newP2Score = room.gameState.p2Score;

      if (isP1) newP1Score++;
      else newP2Score++;

      const nextWord = WORDS[Math.floor(Math.random() * WORDS.length)];
      const winnerId = newP1Score >= 10 ? room.players.p1.uid : newP2Score >= 10 ? room.players.p2!.uid : null;

      await updateGameState(room.id, {
        currentWord: nextWord,
        p1Score: newP1Score,
        p2Score: newP2Score,
        lastWinner: user.uid
      }, undefined, winnerId);
      
      setInput('');
    }
  };

  if (!localRoomId) {
    return (
      <div className="flex flex-col h-full bg-slate-900 items-center justify-center p-6 text-white text-center">
        <Keyboard className="w-20 h-20 text-pink-500 mb-6" />
        <h2 className="text-3xl font-black mb-2 uppercase italic">Word Battle</h2>
        <p className="text-slate-400 text-sm mb-12 max-w-xs">Ketik kata yang muncul secepat mungkin. Siapa paling cepat dia dapat poin!</p>
        <button 
          onClick={handleStart}
          disabled={isLoading}
          className="w-full max-w-xs py-4 bg-pink-600 rounded-2xl font-black uppercase flex items-center justify-center gap-3 hover:bg-pink-500 transition-all shadow-xl shadow-pink-600/20"
        >
          {isLoading ? <RefreshCw className="w-5 h-5 animate-spin" /> : <Play className="w-5 h-5" />}
          Cari Lawan Ketik
        </button>
        <button onClick={onBack} className="mt-4 text-slate-500 font-bold uppercase text-xs">Kembali</button>
      </div>
    );
  }

  if (room?.status === 'waiting') {
    return (
      <div className="flex flex-col h-full bg-slate-900 items-center justify-center text-white">
        <RefreshCw className="w-16 h-16 text-pink-500 animate-spin mb-6" />
        <h2 className="text-xl font-black uppercase italic tracking-widest">Menyiapkan Kamus...</h2>
        <button onClick={() => setLocalRoomId(null)} className="mt-8 text-slate-500 font-bold uppercase text-[10px]">Batalkan</button>
      </div>
    );
  }

  const isP1 = room?.players.p1.uid === user?.uid;
  const myScore = isP1 ? room?.gameState.p1Score : room?.gameState.p2Score;
  const oppScore = isP1 ? room?.gameState.p2Score : room?.gameState.p1Score;

  return (
    <div className="flex flex-col h-full bg-slate-950 font-sans text-white overflow-hidden relative">
      <div className="p-6 flex items-center justify-between z-20">
         <div className="flex items-center gap-2">
            <Zap className="w-4 h-4 text-pink-500" />
            <span className="font-black text-sm uppercase italic">Word Battle</span>
         </div>
         <button onClick={onBack} className="p-2 hover:bg-white/10 rounded-xl transition-colors"><X className="w-5 h-5" /></button>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center p-6 gap-10">
         {/* Scores */}
         <div className="flex items-center gap-20">
            <div className="text-center">
               <p className="text-[10px] font-black uppercase text-slate-500 mb-1">Kamu</p>
               <p className="text-4xl font-black text-pink-500">{myScore}</p>
            </div>
            <div className="text-slate-800 font-black text-xs uppercase tracking-widest">VS</div>
            <div className="text-center">
               <p className="text-[10px] font-black uppercase text-slate-500 mb-1">Lawan</p>
               <p className="text-4xl font-black text-slate-600">{oppScore}</p>
            </div>
         </div>

         {/* Word Display */}
         <div className="w-full max-w-sm bg-slate-900 aspect-video rounded-[3rem] border border-white/5 flex flex-col items-center justify-center relative overflow-hidden shadow-2xl">
            <div className="absolute inset-0 bg-pink-500/5 blur-3xl rounded-full" />
            <motion.h2 
              key={room?.gameState.currentWord}
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="text-6xl font-black uppercase italic tracking-tighter text-white relative z-10"
            >
              {room?.gameState.currentWord}
            </motion.h2>
            <div className="absolute bottom-6 left-0 right-0 text-center">
               <span className="text-[10px] font-black text-pink-500/50 uppercase tracking-[0.4em]">Ketik Secepatnya!</span>
            </div>
         </div>

         {/* Input Area */}
         <div className="w-full max-w-sm">
            <input 
              autoFocus
              type="text" 
              value={input}
              onChange={(e) => checkInput(e.target.value)}
              className="w-full bg-white/5 border-b-4 border-pink-600 p-6 text-center text-3xl font-black uppercase tracking-widest focus:outline-none focus:bg-white/10 rounded-t-3xl transition-all"
              placeholder="..."
            />
         </div>
      </div>

      <AnimatePresence>
        {room?.status === 'finished' && (
          <motion.div className="absolute inset-0 bg-slate-950/95 backdrop-blur-xl flex flex-col items-center justify-center p-8 z-50 text-center">
             <Trophy className={`w-24 h-24 mb-6 ${room.winner === user?.uid ? 'text-yellow-500 animate-bounce' : 'text-slate-600'}`} />
             <h2 className="text-5xl font-black uppercase italic mb-2 tracking-tighter">
               {room.winner === user?.uid ? 'TYPIST PRO!' : 'GAME OVER'}
             </h2>
             <p className="text-slate-400 font-bold uppercase text-xs tracking-widest mb-12">
               {room.winner === user?.uid ? 'Kamu adalah pengetik tercepat di Orbin!' : 'Lawanmu memiliki jari yang lebih lincah.'}
             </p>
             <button onClick={() => setLocalRoomId(null)} className="px-10 py-5 bg-white text-slate-900 rounded-[2.5rem] font-black uppercase">Ke Lobi</button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
