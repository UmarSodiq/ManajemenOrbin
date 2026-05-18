import React, { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Trophy, RefreshCw, X, Play, Disc, Dice6, Star, Home, ArrowRight } from 'lucide-react';
import { useMultiplayerGame } from '../../hooks/useMultiplayerGame';
import { useAuth } from '../../hooks/useAuth';

// Board helper constants
const BOARD_SIZE = 15;
const CELL_SIZE = '100%';

// Step mapping (simplified path coordinates for a 15x15 grid)
const PATH = [
  {x: 6, y: 13}, {x: 6, y: 12}, {x: 6, y: 11}, {x: 6, y: 10}, {x: 6, y: 9}, // Start Blue bottom
  {x: 5, y: 8}, {x: 4, y: 8}, {x: 3, y: 8}, {x: 2, y: 8}, {x: 1, y: 8}, {x: 0, y: 8}, {x: 0, y: 7}, {x: 0, y: 6},
  {x: 1, y: 6}, {x: 2, y: 6}, {x: 3, y: 6}, {x: 4, y: 6}, {x: 5, y: 6}, {x: 6, y: 5}, {x: 6, y: 4}, {x: 6, y: 3}, {x: 6, y: 2}, {x: 6, y: 1}, {x: 6, y: 0}, {x: 7, y: 0}, {x: 8, y: 0},
  {x: 8, y: 1}, {x: 8, y: 2}, {x: 8, y: 3}, {x: 8, y: 4}, {x: 8, y: 5}, {x: 9, y: 6}, {x: 10, y: 6}, {x: 11, y: 6}, {x: 12, y: 6}, {x: 13, y: 6}, {x: 14, y: 6}, {x: 14, y: 7}, {x: 14, y: 8},
  {x: 13, y: 8}, {x: 12, y: 8}, {x: 11, y: 8}, {x: 10, y: 8}, {x: 9, y: 8}, {x: 8, y: 9}, {x: 8, y: 10}, {x: 8, y: 11}, {x: 8, y: 12}, {x: 8, y: 13}, {x: 8, y: 14}, {x: 7, y: 14}, {x: 6, y: 14},
];

interface LudoPiece {
  id: number;
  pos: number; // -1: Base, 0-51: Main Path, 52-57: Home Path, 58: Finished
}

interface LudoGameState {
  pieces: {
    p1: number[];
    p2: number[];
    p3: number[];
    p4: number[];
  };
  lastRoll: number;
  isRolling: boolean;
  canMove: boolean;
  lastAction: string;
}

export default function LudoClassic({ onBack }: { onBack: () => void }) {
  const { user } = useAuth();
  const { 
    room, 
    isLoading, 
    createRoom, 
    joinRoom, 
    updateGameState, 
    findAvailableRoom,
    subscribeToRoom 
  } = useMultiplayerGame('ludo_classic');

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
        pieces: {
          p1: [-1, -1, -1, -1],
          p2: [-1, -1, -1, -1],
          p3: [-1, -1, -1, -1],
          p4: [-1, -1, -1, -1]
        },
        lastRoll: 0,
        isRolling: false,
        canMove: false,
        lastAction: 'Game Started'
      }, mode);
      if (id) setLocalRoomId(id);
    }
  };

  const rollDice = async () => {
    if (!room || !user || room.turn !== user.uid || room.gameState.isRolling || room.gameState.canMove) return;

    await updateGameState(room.id, { ...room.gameState, isRolling: true });

    setTimeout(async () => {
      const roll = Math.floor(Math.random() * 6) + 1;
      const playerKey = getPlayerKey(room, user.uid);
      const myPieces = room.gameState.pieces[playerKey] as number[];
      
      // Check if any piece can move
      const canMoveAny = myPieces.some(pos => (pos === -1 && roll === 6) || (pos >= 0 && pos < 58));
      
      const nextTurn = !canMoveAny && roll !== 6 ? getNextTurn(room) : user.uid;

      await updateGameState(room.id, {
        ...room.gameState,
        lastRoll: roll,
        isRolling: false,
        canMove: canMoveAny,
        lastAction: `${user.username} rolled a ${roll}!`
      }, nextTurn);
    }, 800);
  };

  const movePiece = async (pieceIndex: number) => {
    if (!room || !user || room.turn !== user.uid || !room.gameState.canMove) return;

    const playerKey = getPlayerKey(room, user.uid);
    const roll = room.gameState.lastRoll;
    const pieces = { ...room.gameState.pieces };
    const myPieces = [...pieces[playerKey]];
    const currentPos = myPieces[pieceIndex];

    let newPos = currentPos;
    if (currentPos === -1) {
      if (roll === 6) newPos = 0; // Release from base
      else return; // Only 6 can release
    } else {
      newPos += roll;
    }

    if (newPos > 58) return; // Excess roll

    myPieces[pieceIndex] = newPos;
    pieces[playerKey] = myPieces;

    // Capture logic (simplified)
    // If newPos on main track, check other players
    if (newPos < 52) {
       Object.keys(pieces).forEach(pKey => {
         if (pKey !== playerKey) {
            pieces[pKey] = (pieces[pKey] as number[]).map(pPos => pPos === newPos ? -1 : pPos);
         }
       });
    }

    const winnerId = myPieces.every(p => p === 58) ? user.uid : null;
    const nextTurn = roll === 6 ? user.uid : getNextTurn(room);

    await updateGameState(room.id, {
      ...room.gameState,
      pieces,
      canMove: false,
      lastAction: `${user.username} moved a piece!`
    }, nextTurn, winnerId);
  };

  const getPlayerKey = (room: any, uid: string) => {
    if (room.players.p1.uid === uid) return 'p1';
    if (room.players.p2?.uid === uid) return 'p2';
    if (room.players.p3?.uid === uid) return 'p3';
    return 'p4';
  };

  const getNextTurn = (room: any) => {
    const uids = [room.players.p1.uid, room.players.p2?.uid, room.players.p3?.uid, room.players.p4?.uid].filter(Boolean);
    const idx = uids.indexOf(room.turn);
    return uids[(idx + 1) % uids.length];
  };

  if (!localRoomId) {
    return (
      <div className="flex flex-col h-full bg-slate-950 items-center justify-center p-6 text-white text-center">
        <Disc className="w-24 h-24 text-red-500 mb-8 animate-spin-slow drop-shadow-[0_0_20px_rgba(239,68,68,0.3)]" />
        <h2 className="text-4xl font-black mb-2 uppercase italic tracking-tighter">Ludo Classic</h2>
        <p className="text-slate-400 text-sm mb-12 max-w-xs font-medium">Bawa ke-4 koinmu ke pusat bintang untuk menang! Butuh angka 6 untuk keluar.</p>
        
        <div className="grid grid-cols-1 w-full max-w-xs gap-3 mb-10">
           {[2, 3, 4].map(num => (
             <button 
               key={num}
               onClick={() => { setSelectedMode(num); handleStart(num); }}
               disabled={isLoading}
               className="py-5 bg-slate-900 border border-white/5 rounded-3xl font-black uppercase flex items-center justify-between px-8 hover:bg-red-600 transition-all group overflow-hidden relative"
             >
               <span className="text-lg relative z-10">{num} Pemain</span>
               <Play className="w-5 h-5 relative z-10 opacity-0 group-hover:opacity-100 transition-all translate-x-4 group-hover:translate-x-0" />
               <div className="absolute inset-0 bg-gradient-to-r from-red-600/0 to-red-600/20 group-hover:to-red-600/0 transition-all" />
             </button>
           ))}
        </div>
        <button onClick={onBack} className="text-slate-600 font-black uppercase text-xs tracking-widest hover:text-white transition-colors">Batal</button>
      </div>
    );
  }

  if (room?.status === 'waiting') {
    const playerCount = Object.keys(room.players || {}).length;
    return (
      <div className="flex flex-col h-full bg-slate-950 items-center justify-center text-white p-6 text-center">
        <div className="relative mb-8">
           <Dice6 className="w-20 h-20 text-red-500 animate-bounce relative z-10" />
           <div className="absolute inset-0 bg-red-500/20 blur-3xl animate-pulse" />
        </div>
        <h2 className="text-2xl font-black uppercase italic mb-2 tracking-tight">Kumpulkan Pasukan...</h2>
        <p className="px-10 text-slate-500 text-[10px] font-black uppercase tracking-[0.2em] leading-relaxed">
          Menunggu {(room.maxPlayers || 2) - playerCount} orang lagi untuk mulai pertempuran di papan.
        </p>
        <button onClick={() => setLocalRoomId(null)} className="mt-16 text-slate-700 font-black uppercase text-[10px] border border-slate-800 px-6 py-2 rounded-full hover:text-red-500 hover:border-red-500 transition-all">Keluar Lobi</button>
      </div>
    );
  }

  if (!room) {
    return (
      <div className="flex flex-col h-full bg-slate-950 items-center justify-center p-6 text-white text-center">
        <RefreshCw className="w-10 h-10 text-red-500 animate-spin mb-4" />
        <p className="text-slate-500 font-black uppercase text-[10px] tracking-widest">Memuat Arena...</p>
      </div>
    );
  }

  const isMyTurn = room?.turn === user?.uid;
  const myKey = getPlayerKey(room, user?.uid || '');
  
  // Color mapping
  const PLAYER_COLORS: Record<string, string> = {
    p1: 'bg-red-500',
    p2: 'bg-emerald-500',
    p3: 'bg-yellow-400',
    p4: 'bg-blue-500'
  };

// Piece position calculation helper
const getPiecePosition = (pKey: string, pos: number, index: number) => {
  // Base positions
  if (pos === -1) {
    const bases: any = {
      p1: { x: 1, y: 1 },
      p2: { x: 9, y: 1 },
      p3: { x: 9, y: 9 },
      p4: { x: 1, y: 9 }
    };
    const b = bases[pKey];
    const ox = index % 2 === 0 ? 1 : 3;
    const oy = index < 2 ? 1 : 3;
    return { x: b.x + ox, y: b.y + oy };
  }

  // Final center
  if (pos === 57) return { x: 7, y: 7 };

  // Home stretch logic
  if (pos >= 52) {
    const step = pos - 51;
    if (pKey === 'p1') return { x: 7, y: step }; // Red (Top)
    if (pKey === 'p2') return { x: 14 - step, y: 7 }; // Green (Right)
    if (pKey === 'p3') return { x: 7, y: 14 - step }; // Yellow (Bottom)
    if (pKey === 'p4') return { x: step, y: 7 }; // Blue (Left)
  }

  // Main Track (52 steps)
  // Mapping a standard 15x15 Ludo path
  const fullPath = [
    {x:6, y:1}, {x:6, y:2}, {x:6, y:3}, {x:6, y:4}, {x:6, y:5}, // Red path
    {x:5, y:6}, {x:4, y:6}, {x:3, y:6}, {x:2, y:6}, {x:1, y:6}, {x:0, y:6}, // Blue path entrance
    {x:0, y:7}, {x:0, y:8}, {x:1, y:8}, {x:2, y:8}, {x:3, y:8}, {x:4, y:8}, {x:5, y:8},
    {x:6, y:9}, {x:6, y:10}, {x:6, y:11}, {x:6, y:12}, {x:6, y:13}, {x:6, y:14},
    {x:7, y:14}, {x:8, y:14}, {x:8, y:13}, {x:8, y:12}, {x:8, y:11}, {x:8, y:10}, {x:8, y:9},
    {x:9, y:8}, {x:10, y:8}, {x:11, y:8}, {x:12, y:8}, {x:13, y:8}, {x:14, y:8},
    {x:14, y:7}, {x:14, y:6}, {x:13, y:6}, {x:12, y:6}, {x:11, y:6}, {x:10, y:6}, {x:9, y:6},
    {x:8, y:5}, {x:8, y:4}, {x:8, y:3}, {x:8, y:2}, {x:8, y:1}, {x:8, y:0},
    {x:7, y:0}, {x:6, y:0}
  ];

  // Adjust start positions based on player color
  const offsetMap: any = { p1: 0, p2: 39, p3: 26, p4: 13 };
  const globalIdx = (pos + offsetMap[pKey]) % 52;
  return fullPath[globalIdx];
};

  return (
    <div className="flex flex-col h-full bg-slate-950 font-sans text-white overflow-hidden select-none">
      <div className="p-4 flex items-center justify-between border-b border-white/5 bg-slate-900/40 backdrop-blur-md z-30">
         <div className="flex items-center gap-3">
            <Home className="w-4 h-4 text-red-500" />
            <h1 className="font-black italic text-sm uppercase tracking-tighter">Orbin Ludo Royale</h1>
         </div>
         <div className="flex gap-1">
            {['p1', 'p2', 'p3', 'p4'].map(p => {
               const pData = (room?.players as any)[p];
               if (!pData) return null;
               return (
                  <div key={p} className={`w-2 h-2 rounded-full ${PLAYER_COLORS[p]} ${room?.turn === pData.uid ? 'ring-4 ring-white/20 scale-125' : 'opacity-20'}`} />
               )
            })}
         </div>
         <button onClick={onBack} className="p-1 hover:bg-white/10 rounded-lg transition-colors"><X className="w-4 h-4" /></button>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center p-4">
          {/* THE BOARD */}
          <div className="relative w-full max-w-[360px] aspect-square bg-slate-900 rounded-[2rem] shadow-[0_0_80px_rgba(0,0,0,0.5)] border-4 border-slate-800 overflow-hidden grid grid-cols-15 grid-rows-15">
              {/* Home Bases */}
              <div className="col-start-1 col-end-7 row-start-1 row-end-7 bg-red-600/20 border-r-4 border-b-4 border-red-500/30 flex flex-col items-center justify-center relative">
                  <div className="absolute inset-0 bg-red-500/5 backdrop-blur-[2px]" />
                  <div className="w-12 h-12 rounded-full bg-red-500 border-4 border-white/20 animate-pulse-slow" />
              </div>
              <div className="col-start-10 col-end-16 row-start-1 row-end-7 bg-emerald-600/20 border-l-4 border-b-4 border-emerald-500/30">
                  <div className="w-full h-full flex items-center justify-center">
                    <div className="w-12 h-12 rounded-full bg-emerald-500 border-4 border-white/20 opacity-50" />
                  </div>
              </div>
              <div className="col-start-1 col-end-7 row-start-10 row-end-16 bg-blue-600/20 border-r-4 border-t-4 border-blue-500/30">
                  <div className="w-full h-full flex items-center justify-center">
                    <div className="w-12 h-12 rounded-full bg-blue-500 border-4 border-white/20 opacity-50" />
                  </div>
              </div>
              <div className="col-start-10 col-end-16 row-start-10 row-end-16 bg-yellow-600/20 border-l-4 border-t-4 border-yellow-500/30">
                  <div className="w-full h-full flex items-center justify-center">
                    <div className="w-12 h-12 rounded-full bg-yellow-400 border-4 border-white/20 opacity-50" />
                  </div>
              </div>

              {/* Finish Area */}
              <div className="col-start-7 col-end-10 row-start-7 row-end-10 bg-slate-950 flex items-center justify-center relative border-4 border-slate-800 rounded-2xl rotate-45 scale-75">
                  <Star className="w-10 h-10 text-yellow-500 animate-spin-slow" />
              </div>

              {/* Steps (Visual grid only) */}
              {Array.from({ length: 15 * 15 }).map((_, i) => {
                 const x = i % 15;
                 const y = Math.floor(i / 15);
                 const isPath = (x >= 6 && x <= 8) || (y >= 6 && y <= 8);
                 const isCenter = x >= 6 && x <= 8 && y >= 6 && y <= 8;
                 if (!isPath || isCenter) return <div key={i} />;
                 return <div key={i} className="border border-white/5 bg-slate-800/20" />;
              })}

              {/* Safe Zone Stars */}
              {[
                {x:6, y:2, color:'text-red-500'}, 
                {x:2, y:8, color:'text-blue-500'}, 
                {x:8, y:12, color:'text-yellow-500'}, 
                {x:12, y:6, color:'text-emerald-500'}
              ].map((s, idx) => (
                <div 
                  key={idx} 
                  className="absolute z-10 flex items-center justify-center opacity-40"
                  style={{
                    left: `${(s.x / 15) * 100}%`,
                    top: `${(s.y / 15) * 100}%`,
                    width: '6.66%',
                    height: '6.66%'
                  }}
                >
                  <Star className={`w-4 h-4 ${s.color} fill-current`} />
                </div>
              ))}

              {/* Pieces */}
              {room?.gameState && ['p1', 'p2', 'p3', 'p4'].map(pKey => {
                 const pPieces = room.gameState.pieces[pKey] as number[];
                 if (!pPieces) return null;
                 return pPieces.map((pos, i) => {
                    if (pos === 58) return null;
                    const coords = getPiecePosition(pKey, pos, i);
                    const isMine = pKey === myKey;
                    const canM = isMine && isMyTurn && room.gameState.canMove && ((pos === -1 && room.gameState.lastRoll === 6) || pos >= 0);
                    
                    return (
                       <motion.button
                         key={`${pKey}-${i}`}
                         layout
                         onClick={() => canM && movePiece(i)}
                         disabled={!canM}
                         className={`absolute z-20 w-[6%] h-[6%] rounded-full shadow-2xl border-2 border-white/80 transition-all ${PLAYER_COLORS[pKey]} ${canM ? 'ring-4 ring-white animate-bounce cursor-pointer scale-110' : ''}`}
                         style={{
                           left: `${(coords.x / 14) * 94 + 3}%`,
                           top: `${(coords.y / 14) * 94 + 3}%`
                         }}
                       >
                          <div className="w-full h-full rounded-full bg-white/20" />
                       </motion.button>
                    )
                 })
              })}
          </div>

          {/* GAME CONTROLS */}
          <div className="mt-8 w-full max-w-[360px] flex flex-col items-center gap-6">
              <div className="flex items-center gap-10">
                 <div className="text-center">
                    <p className="text-[10px] font-black uppercase text-slate-500 mb-2">Terakhir</p>
                    <div className="w-16 h-16 bg-white rounded-3xl flex items-center justify-center shadow-xl text-3xl font-black text-slate-900 border-b-4 border-slate-300">
                      {room?.gameState.lastRoll || '?'}
                    </div>
                 </div>
                 
                 <div className="flex flex-col items-center gap-3">
                    <p className={`text-[10px] font-black uppercase transition-colors tracking-[0.2em] ${isMyTurn ? 'text-red-500' : 'text-slate-600'}`}>
                      {isMyTurn ? 'GILIRANMU' : 'TUNGGU LAWAN'}
                    </p>
                    <button 
                      onClick={rollDice}
                      disabled={!isMyTurn || room?.gameState.isRolling || room?.gameState.canMove}
                      className={`w-28 h-28 rounded-full border-4 border-white/5 flex items-center justify-center shadow-2xl transition-all ${
                        isMyTurn && !room?.gameState.isRolling && !room?.gameState.canMove 
                        ? 'bg-red-600 hover:scale-105 active:scale-95 cursor-pointer ring-8 ring-red-600/20' 
                        : 'bg-slate-900 grayscale opacity-40 cursor-not-allowed'
                      }`}
                    >
                       {room?.gameState.isRolling ? <RefreshCw className="w-10 h-10 animate-spin" /> : <Dice6 className="w-12 h-12 text-white" />}
                    </button>
                    <p className="text-[9px] font-bold text-slate-500 uppercase max-w-[120px] text-center leading-tight">
                       {room?.gameState.lastAction}
                    </p>
                 </div>

                 <div className="text-center opacity-30">
                    <p className="text-[10px] font-black uppercase text-slate-500 mb-2">Status</p>
                    <div className="w-16 h-16 bg-slate-900 rounded-3xl flex items-center justify-center border-b-4 border-slate-800">
                      <Disc className="w-6 h-6" />
                    </div>
                 </div>
              </div>
          </div>
      </div>

      {/* Win Modal */}
      <AnimatePresence>
        {room?.status === 'finished' && (
          <motion.div className="absolute inset-0 bg-slate-950/95 backdrop-blur-xl flex flex-col items-center justify-center p-8 z-50 text-center">
             <Trophy className="w-32 h-32 text-yellow-500 mb-8 animate-bounce drop-shadow-[0_0_30px_rgba(234,179,8,0.3)]" />
             <h2 className="text-5xl font-black uppercase italic italic mb-4 tracking-tighter">KING OF ORBIN</h2>
             <p className="text-slate-400 font-bold uppercase text-xs tracking-[0.4em] mb-16">
               {room.winner === user?.uid ? 'Papan Ini Milikmu!' : 'Lawan Mencapai Pusat Lebih Dulu.'}
             </p>
             <button 
               onClick={() => setLocalRoomId(null)}
               className="px-16 py-6 bg-red-600 rounded-[3rem] font-black uppercase tracking-widest shadow-2xl hover:bg-red-500 transition-all active:scale-95"
             >
               Kembali Ke Lobi
             </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
