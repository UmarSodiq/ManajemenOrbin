import React, { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Trophy, RefreshCw, X, Zap, UserPlus, Play, Rocket } from 'lucide-react';
import { useMultiplayerGame } from '../../hooks/useMultiplayerGame';
import { useAuth } from '../../hooks/useAuth';

interface TappingState {
  p1Taps: number;
  p2Taps: number;
  endTime: number | null;
}

export default function TappingBattle({ onBack }: { onBack: () => void }) {
  const { user } = useAuth();
  const { 
    room, 
    isLoading, 
    createRoom, 
    joinRoom, 
    updateGameState, 
    findAvailableRoom,
    subscribeToRoom 
  } = useMultiplayerGame('tapping');

  const [localRoomId, setLocalRoomId] = useState<string | null>(null);
  const [timeLeft, setTimeLeft] = useState(10);
  const timerRef = useRef<number>(0);

  useEffect(() => {
    if (localRoomId) {
      const unsubscribe = subscribeToRoom(localRoomId);
      return () => unsubscribe();
    }
  }, [localRoomId]);

  useEffect(() => {
    if (room?.status === 'playing' && room.gameState.endTime) {
      const interval = setInterval(() => {
        const now = Date.now();
        const diff = Math.max(0, Math.ceil((room.gameState.endTime - now) / 1000));
        setTimeLeft(diff);
        
        if (diff === 0 && room.status !== 'finished') {
          // Determine winner
          let winnerId = null;
          if (room.gameState.p1Taps > room.gameState.p2Taps) winnerId = room.players.p1.uid;
          else if (room.gameState.p2Taps > room.gameState.p1Taps) winnerId = room.players.p2!.uid;
          
          updateGameState(room.id, room.gameState, undefined, winnerId);
        }
      }, 100);
      return () => clearInterval(interval);
    }
  }, [room?.status, room?.gameState.endTime]);

  const handleStart = async () => {
    if (!user) return;
    const available = await findAvailableRoom();
    if (available) {
      const startTime = Date.now();
      await joinRoom(available.id, user.uid, user.username || 'Guest', available.players);
      await updateGameState(available.id, {
          p1Taps: 0,
          p2Taps: 0,
          endTime: startTime + 10000 // 10 seconds battle
      });
      setLocalRoomId(available.id);
    } else {
      const id = await createRoom(user.uid, user.username || 'Guest', {
        p1Taps: 0,
        p2Taps: 0,
        endTime: null
      });
      if (id) setLocalRoomId(id);
    }
  };

  const handleTap = () => {
    if (!room || !user || room.status !== 'playing' || timeLeft === 0 || room.winner) return;

    const isP1 = room.players.p1.uid === user.uid;
    const newState = { ...room.gameState };
    if (isP1) newState.p1Taps++;
    else newState.p2Taps++;

    updateGameState(room.id, newState);
  };

  if (!localRoomId) {
    return (
      <div className="flex flex-col h-full bg-slate-950 items-center justify-center p-6 text-white text-center">
        <div className="w-20 h-20 bg-yellow-600/20 text-yellow-500 rounded-3xl flex items-center justify-center mb-6">
           <Zap className="w-10 h-10 fill-current" />
        </div>
        <h2 className="text-3xl font-black mb-2 uppercase italic tracking-tighter">Tapping Battle</h2>
        <p className="text-slate-400 text-sm mb-12 max-w-xs">Adu kecepatan jempol 1v1 secara real-time. Siapa yang tercepat dialah pemenangnya!</p>
        
        <div className="flex flex-col gap-4 w-full max-w-xs">
          <button 
            onClick={handleStart}
            disabled={isLoading}
            className="w-full py-4 bg-yellow-600 rounded-2xl font-black uppercase flex items-center justify-center gap-3 hover:bg-yellow-500 transition-all shadow-xl shadow-yellow-600/20"
          >
            {isLoading ? <RefreshCw className="w-5 h-5 animate-spin" /> : <Rocket className="w-5 h-5" />}
            Cari Lawan Duel
          </button>
          <button onClick={onBack} className="w-full py-4 bg-white/5 border border-white/10 rounded-2xl font-black uppercase text-sm">Kembali</button>
        </div>
      </div>
    );
  }

  if (room?.status === 'waiting') {
    return (
      <div className="flex flex-col h-full bg-slate-950 items-center justify-center p-6 text-white">
        <RefreshCw className="w-16 h-16 text-yellow-500 animate-spin mb-6" />
        <h2 className="text-xl font-black uppercase italic">Mencari Pejuang...</h2>
        <button onClick={() => setLocalRoomId(null)} className="mt-8 text-slate-500 font-bold uppercase text-xs">Batalkan</button>
      </div>
    );
  }

  if (!room) {
    return (
      <div className="flex flex-col h-full bg-slate-950 items-center justify-center p-6 text-white text-center">
        <RefreshCw className="w-10 h-10 text-yellow-500 animate-spin mb-4" />
        <p className="text-slate-500 font-black uppercase text-[10px] tracking-widest text-center">Menyiapkan Arena...</p>
      </div>
    );
  }

  const isP1 = room?.players?.p1?.uid === user?.uid;
  const myTaps = isP1 ? room?.gameState.p1Taps : room?.gameState.p2Taps;
  const oppTaps = isP1 ? room?.gameState.p2Taps : room?.gameState.p1Taps;

  return (
    <div className="flex flex-col h-full bg-slate-950 font-sans text-white overflow-hidden relative">
      <div className="p-6 flex items-center justify-between z-20">
        <div>
          <h1 className="text-lg font-black tracking-tighter uppercase italic leading-none">Tap Duel</h1>
          <p className="text-[9px] font-black text-yellow-500 uppercase tracking-[0.2em] mt-1">Real-time Session</p>
        </div>
        <div className="bg-red-600 px-4 py-2 rounded-xl flex items-center gap-2">
           <span className="text-xs font-black tabular-nums">{timeLeft}s</span>
        </div>
      </div>

      <div className="flex-1 flex flex-col pt-10" onMouseDown={handleTap}>
         {/* Arena */}
         <div className="flex flex-col items-center justify-between flex-1 px-6 pb-20 relative">
            {/* Enemy Side */}
            <div className="w-full text-center opacity-40">
               <span className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2 block">Lawan ({room?.players.p2?.name || room?.players.p1.name})</span>
               <div className="text-6xl font-black text-slate-700">{oppTaps}</div>
            </div>

            {/* My Side */}
            <motion.div 
               animate={myTaps > 0 ? { scale: [1, 1.1, 1] } : {}}
               className="w-full text-center"
            >
               <div className="text-[120px] font-black leading-none bg-gradient-to-t from-yellow-600 to-yellow-400 bg-clip-text text-transparent italic select-none">
                 {myTaps}
               </div>
               <span className="text-xs font-black uppercase tracking-[0.3em] text-yellow-500/50 mt-4 block">KETUK SECEPAT MUNGKIN!</span>
            </motion.div>

            {/* Tap Feedback Effect (Visual only) */}
            <div className="absolute inset-x-0 bottom-1/4 pointer-events-none flex justify-center">
                <div className="w-64 h-64 bg-yellow-500/5 blur-[100px] rounded-full" />
            </div>
         </div>

         {/* Result Overlay */}
         <AnimatePresence>
            {room?.status === 'finished' && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="absolute inset-0 bg-slate-950/95 backdrop-blur-xl flex flex-col items-center justify-center p-6 z-50 text-center"
              >
                 <Trophy className={`w-20 h-20 mb-6 ${room.winner === user?.uid ? 'text-yellow-500 animate-bounce' : 'text-slate-600'}`} />
                 <h2 className="text-5xl font-black uppercase italic tracking-tighter mb-2">
                   {room.winner === user?.uid ? 'MENANG!' : room.winner === null ? 'SERI!' : 'KALAH!'}
                 </h2>
                 <p className="text-slate-400 font-bold uppercase text-xs tracking-widest mb-12">
                   Kamu berhasil melakukan {myTaps} ketukan!
                 </p>
                 <button 
                  onClick={() => setLocalRoomId(null)}
                  className="px-12 py-5 bg-white text-slate-950 rounded-[2rem] font-black uppercase tracking-widest text-sm hover:scale-105 transition-transform"
                 >
                   Ke Menu Game
                 </button>
              </motion.div>
            )}
         </AnimatePresence>
      </div>
    </div>
  );
}
