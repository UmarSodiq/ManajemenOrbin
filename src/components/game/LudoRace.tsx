import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Trophy, RefreshCw, X, UserPlus, Play, Disc, Dice6 } from 'lucide-react';
import { useMultiplayerGame } from '../../hooks/useMultiplayerGame';
import { useAuth } from '../../hooks/useAuth';

interface LudoState {
  p1Pos: number;
  p2Pos: number;
  lastRoll: number;
  isRolling: boolean;
}

export default function LudoRace({ onBack }: { onBack: () => void }) {
  const { user } = useAuth();
  const { 
    room, 
    isLoading, 
    createRoom, 
    joinRoom, 
    updateGameState, 
    findAvailableRoom,
    subscribeToRoom 
  } = useMultiplayerGame('ludo_race');

  const [localRoomId, setLocalRoomId] = useState<string | null>(null);
  const [selectedMode, setSelectedMode] = useState<number | null>(null);

  useEffect(() => {
    if (localRoomId) {
      const unsubscribe = subscribeToRoom(localRoomId);
      return () => unsubscribe();
    }
  }, [localRoomId]);

  const handleStart = async (mode: number) => {
    if (!user) return;
    const available = await findAvailableRoom(mode);
    if (available) {
      await joinRoom(available.id, user.uid, user.username || 'Guest', available.players, mode);
      setLocalRoomId(available.id);
    } else {
      const id = await createRoom(user.uid, user.username || 'Guest', {
        p1Pos: 0,
        p2Pos: 0,
        p3Pos: 0,
        p4Pos: 0,
        lastRoll: 0,
        isRolling: false
      }, mode);
      if (id) setLocalRoomId(id);
    }
  };

  const rollDice = async () => {
    if (!room || !user || room.status !== 'playing' || room.turn !== user.uid || room.winner || room.gameState.isRolling) return;

    // Start rolling animation
    await updateGameState(room.id, { ...room.gameState, isRolling: true });

    setTimeout(async () => {
      const roll = Math.floor(Math.random() * 6) + 1;
      
      // Determine which player am I
      let playerKey = '';
      if (room.players.p1.uid === user.uid) playerKey = 'p1';
      else if (room.players.p2?.uid === user.uid) playerKey = 'p2';
      else if (room.players.p3?.uid === user.uid) playerKey = 'p3';
      else if (room.players.p4?.uid === user.uid) playerKey = 'p4';

      if (!playerKey) return;

      const posKey = `${playerKey}Pos`;
      let newPos = (room.gameState[posKey] || 0) + roll;
      newPos = Math.min(30, newPos);

      // Special squares
      if (newPos === 5) newPos = 12;
      if (newPos === 15) newPos = 8;
      if (newPos === 22) newPos = 28;
      if (newPos === 27) newPos = 18;

      const newState = {
        ...room.gameState,
        [posKey]: newPos,
        lastRoll: roll,
        isRolling: false
      };

      const winnerId = newPos === 30 ? user.uid : null;
      
      // Next turn logic (p1 -> p2 -> p3 -> p4 -> p1) - filtered by room.maxPlayers
      const playerUids = [
        room.players.p1.uid,
        room.players.p2?.uid,
        room.players.p3?.uid,
        room.players.p4?.uid
      ].filter(Boolean) as string[];

      let nextTurnUid = room.turn;
      if (roll !== 6) {
        const currentIndex = playerUids.indexOf(user.uid);
        const nextIndex = (currentIndex + 1) % playerUids.length;
        nextTurnUid = playerUids[nextIndex];
      }
      
      await updateGameState(room.id, newState, nextTurnUid, winnerId);
    }, 1000);
  };

  if (!localRoomId) {
    return (
      <div className="flex flex-col h-full bg-slate-900 items-center justify-center p-6 text-white text-center">
        <Disc className="w-20 h-20 text-emerald-500 mb-6 animate-spin-slow" />
        <h2 className="text-3xl font-black mb-2 uppercase italic">Ludo Race</h2>
        <p className="text-slate-400 text-sm mb-12 max-w-xs leading-relaxed">Balapan sampai ke garis finish 30! Pilih jumlah pemain:</p>
        
        <div className="grid grid-cols-1 w-full max-w-xs gap-3 mb-8">
           {[2, 3, 4].map(num => (
             <button 
               key={num}
               onClick={() => { setSelectedMode(num); handleStart(num); }}
               disabled={isLoading}
               className="py-4 bg-slate-800 border border-white/5 rounded-2xl font-black uppercase flex items-center justify-between px-6 hover:bg-emerald-600 transition-all group"
             >
               <span className="text-lg">{num} Players</span>
               {isLoading && selectedMode === num ? <RefreshCw className="w-5 h-5 animate-spin" /> : <Play className="w-5 h-5 opacity-0 group-hover:opacity-100 transition-opacity" />}
             </button>
           ))}
        </div>

        <button onClick={onBack} className="mt-4 text-slate-500 font-bold uppercase text-xs">Kembali</button>
      </div>
    );
  }

  if (room?.status === 'waiting') {
    const playerCount = Object.keys(room.players || {}).length;
    const maxPlayers = room.maxPlayers || 2;
    return (
      <div className="flex flex-col h-full bg-slate-900 items-center justify-center text-white">
        <Dice6 className="w-16 h-16 text-emerald-500 animate-bounce mb-6" />
        <h2 className="text-xl font-black uppercase italic">Menunggu Pemain... ({playerCount}/{maxPlayers})</h2>
        <p className="text-slate-500 text-[10px] mt-2 uppercase font-black tracking-widest text-center px-6">Permainan {maxPlayers}P akan dimulai segera setelah kuota penuh</p>
        <button onClick={() => setLocalRoomId(null)} className="mt-8 text-slate-500 font-bold uppercase text-[10px]">Batalkan</button>
      </div>
    );
  }

  if (!room) {
    return (
      <div className="flex flex-col h-full bg-slate-900 items-center justify-center p-6 text-white text-center">
        <RefreshCw className="w-10 h-10 text-emerald-500 animate-spin mb-4" />
        <p className="text-slate-500 font-black uppercase text-[10px] tracking-widest text-center">Memuat Balapan...</p>
      </div>
    );
  }

  const isMyTurn = room?.turn === user?.uid;
  const { p1Pos, p2Pos, p3Pos, p4Pos, lastRoll, isRolling } = room?.gameState || { p1Pos: 0, p2Pos: 0, p3Pos: 0, p4Pos: 0, lastRoll: 0, isRolling: false };

  return (
    <div className="flex flex-col h-full bg-slate-950 font-sans text-white overflow-hidden relative">
      <div className="p-6 flex items-center justify-between border-b border-white/5">
         <span className="font-black text-sm uppercase italic tracking-widest text-emerald-500">Ludo Quad Dash</span>
         <button onClick={onBack} className="p-2 hover:bg-white/10 rounded-xl transition-colors"><X className="w-5 h-5" /></button>
      </div>

      <div className="flex-1 flex flex-col items-center justify-between py-10 px-6 overflow-y-auto">
         {/* The Track */}
         <div className="w-full max-w-sm flex flex-col gap-2">
            {Array.from({ length: 31 }).map((_, i) => {
              const isP1Here = p1Pos === i;
              const isP2Here = p2Pos === i;
              const isP3Here = p3Pos === i;
              const isP4Here = p4Pos === i;
              const isSpecial = [5, 12, 15, 8, 22, 28, 27, 18].includes(i);
              
              return (
                 <div key={i} className={`h-12 rounded-xl flex items-center justify-between px-4 text-xs font-black relative ${
                   i === 30 ? 'bg-emerald-600 border-2 border-white/20' : 
                   isSpecial ? 'bg-blue-600/20 text-blue-400' : 'bg-slate-900/50'
                 }`}>
                    <span className="opacity-20">{i}</span>
                    {i === 30 && <Trophy className="w-5 h-5 text-yellow-400" />}
                    
                    <div className="flex gap-1">
                       <AnimatePresence>
                          {isP1Here && <motion.div layoutId="p1" className="w-6 h-6 rounded-full bg-red-500 border border-white shadow-lg flex items-center justify-center text-[7px]">P1</motion.div>}
                          {isP2Here && <motion.div layoutId="p2" className="w-6 h-6 rounded-full bg-yellow-400 border border-white shadow-lg flex items-center justify-center text-[7px] text-slate-900">P2</motion.div>}
                          {isP3Here && <motion.div layoutId="p3" className="w-6 h-6 rounded-full bg-blue-500 border border-white shadow-lg flex items-center justify-center text-[7px]">P3</motion.div>}
                          {isP4Here && <motion.div layoutId="p4" className="w-6 h-6 rounded-full bg-pink-500 border border-white shadow-lg flex items-center justify-center text-[7px]">P4</motion.div>}
                       </AnimatePresence>
                    </div>
                 </div>
              );
            }).reverse()}
         </div>

         {/* Dice Area */}
         <div className="mt-8 flex flex-col items-center gap-6 bg-slate-900 w-full rounded-[2.5rem] p-8 border border-white/5 relative flex-shrink-0">
            <div className={`absolute -top-4 px-6 py-2 rounded-full text-xs font-black uppercase tracking-widest ${isMyTurn ? 'bg-emerald-600 animate-pulse' : 'bg-slate-800 text-slate-500'}`}>
              {isMyTurn ? 'Giliranmu!' : 'Menunggu Lawan...'}
            </div>

            <div className="flex gap-4">
                {[
                  { key: 'p1', color: 'bg-red-500', name: room?.players.p1?.name },
                  { key: 'p2', color: 'bg-yellow-400', name: room?.players.p2?.name },
                  { key: 'p3', color: 'bg-blue-500', name: room?.players.p3?.name },
                  { key: 'p4', color: 'bg-pink-500', name: room?.players.p4?.name },
                ].filter(p => p.name).map((p) => (
                  <div key={p.key} className={`flex flex-col items-center gap-1 transition-opacity ${room?.turn === (room?.players as any)[p.key]?.uid ? 'opacity-100 scale-110' : 'opacity-20'}`}>
                    <div className={`w-8 h-8 rounded-lg ${p.color}`} />
                    <span className="text-[8px] font-black uppercase truncate w-12 text-center">{p.name}</span>
                  </div>
                ))}
            </div>

            <motion.div 
              animate={isRolling ? { rotate: [0, 90, 180, 270, 360], scale: [1, 1.2, 1] } : {}}
              transition={{ repeat: isRolling ? Infinity : 0, duration: 0.2 }}
              className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center shadow-2xl"
            >
               {lastRoll === 0 ? <Dice6 className="w-8 h-8 text-slate-200" /> : (
                 <span className="text-3xl font-black text-slate-900 tabular-nums">{lastRoll}</span>
               )}
            </motion.div>

            <button 
              onClick={rollDice}
              disabled={!isMyTurn || isRolling}
              className={`px-12 py-5 rounded-[2rem] font-black uppercase tracking-widest text-sm transition-all ${
                isMyTurn && !isRolling ? 'bg-emerald-600 hover:scale-105 active:scale-95 shadow-xl shadow-emerald-600/20' : 'bg-slate-800 text-slate-500 grayscale cursor-not-allowed'
              }`}
            >
               Roll Dice
            </button>
         </div>
      </div>

      <AnimatePresence>
        {room?.status === 'finished' && (
          <motion.div className="absolute inset-0 bg-slate-950/95 backdrop-blur-xl flex flex-col items-center justify-center p-8 z-50 text-center">
             <Trophy className={`w-24 h-24 mb-6 ${room.winner === user?.uid ? 'text-yellow-500 animate-bounce' : 'text-slate-600'}`} />
             <h2 className="text-5xl font-black uppercase italic mb-2 tracking-tighter">
               {room.winner === user?.uid ? 'JUARA!' : 'COBALAGI'}
             </h2>
             <p className="text-slate-400 font-bold uppercase text-xs tracking-widest mb-12">
               {room.winner === user?.uid ? 'Kamu berhasil mencapai garis finish!' : 'Lawanmu lebih cepat mencapai finish.'}
             </p>
             <button onClick={() => setLocalRoomId(null)} className="px-10 py-5 bg-white text-slate-900 rounded-[2.5rem] font-black uppercase">Ke Lobi</button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
