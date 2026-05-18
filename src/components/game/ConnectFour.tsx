import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Trophy, RefreshCw, X, ChevronLeft, UserPlus, Play, LayoutGrid } from 'lucide-react';
import { useMultiplayerGame } from '../../hooks/useMultiplayerGame';
import { useAuth } from '../../hooks/useAuth';

export default function ConnectFourMultiplayer({ onBack }: { onBack: () => void }) {
  const { user } = useAuth();
  const { 
    room, 
    isLoading, 
    createRoom, 
    joinRoom, 
    updateGameState, 
    findAvailableRoom,
    subscribeToRoom 
  } = useMultiplayerGame('connect4');

  const [localRoomId, setLocalRoomId] = useState<string | null>(null);

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
        board: Array(42).fill(null), // 6 rows x 7 cols
        isDraw: false
      });
      if (id) setLocalRoomId(id);
    }
  };

  const getWinner = (board: (string | null)[]) => {
    const rows = 6;
    const cols = 7;
    // Check rows
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c <= cols - 4; c++) {
        const i = r * cols + c;
        if (board[i] && board[i] === board[i+1] && board[i] === board[i+2] && board[i] === board[i+3]) return board[i];
      }
    }
    // Check columns
    for (let r = 0; r <= rows - 4; r++) {
      for (let c = 0; c < cols; c++) {
        const i = r * cols + c;
        if (board[i] && board[i] === board[i+cols] && board[i] === board[i+2*cols] && board[i] === board[i+3*cols]) return board[i];
      }
    }
    // Check diagonals
    for (let r = 0; r <= rows - 4; r++) {
      for (let c = 0; c <= cols - 4; c++) {
        const i = r * cols + c;
        if (board[i] && board[i] === board[i+cols+1] && board[i] === board[i+2*cols+2] && board[i] === board[i+3*cols+3]) return board[i];
      }
      for (let c = 3; c < cols; c++) {
        const i = r * cols + c;
        if (board[i] && board[i] === board[i+cols-1] && board[i] === board[i+2*cols-2] && board[i] === board[i+3*cols-3]) return board[i];
      }
    }
    return null;
  };

  const handleColumnClick = (col: number) => {
    if (!room || !user || room.status !== 'playing' || room.turn !== user.uid || room.winner) return;
    
    const board = [...room.gameState.board];
    const rows = 6;
    const cols = 7;
    
    // Find lowest empty row in this column
    let row = -1;
    for (let r = rows - 1; r >= 0; r--) {
      if (!board[r * cols + col]) {
        row = r;
        break;
      }
    }

    if (row === -1) return; // Column full

    const symbol = room.players.p1.uid === user.uid ? 'R' : 'Y';
    board[row * cols + col] = symbol;

    const winnerSymbol = getWinner(board);
    const isDraw = !winnerSymbol && board.every(c => c !== null);
    
    let winnerId = null;
    if (winnerSymbol) winnerId = winnerSymbol === 'R' ? room.players.p1.uid : room.players.p2!.uid;
    
    const nextTurn = room.players.p1.uid === user.uid ? room.players.p2!.uid : room.players.p1.uid;
    
    updateGameState(room.id, { board, isDraw }, nextTurn, winnerId);
  };

  if (!localRoomId) {
    return (
      <div className="flex flex-col h-full bg-slate-900 items-center justify-center p-6 text-white text-center">
        <div className="w-20 h-20 bg-blue-600/20 text-blue-500 rounded-3xl flex items-center justify-center mb-6">
           <LayoutGrid className="w-10 h-10" />
        </div>
        <h2 className="text-3xl font-black mb-2 uppercase italic">Connect 4 Royale</h2>
        <p className="text-slate-400 text-sm mb-12 max-w-xs">Jatuhkan koinmu dan buat garis 4 sebelum lawanmu!</p>
        <button onClick={handleStart} className="w-full max-w-xs py-4 bg-blue-600 rounded-2xl font-black uppercase flex items-center justify-center gap-3">
          <Play className="w-5 h-5" /> Cari Lawan
        </button>
        <button onClick={onBack} className="mt-4 text-slate-500 font-bold uppercase text-xs">Kembali</button>
      </div>
    );
  }

  if (room?.status === 'waiting') {
    return (
      <div className="flex flex-col h-full bg-slate-900 items-center justify-center text-white">
        <RefreshCw className="w-16 h-16 text-blue-500 animate-spin mb-4" />
        <h2 className="text-xl font-black uppercase italic">Menunggu Tantangan...</h2>
        <button onClick={() => setLocalRoomId(null)} className="mt-8 text-slate-500 font-bold text-xs uppercase">Batalkan</button>
      </div>
    );
  }

  const isMyTurn = room?.turn === user?.uid;
  const board = room?.gameState.board || Array(42).fill(null);

  return (
    <div className="flex flex-col h-full bg-slate-950 font-sans text-white overflow-hidden relative">
      <div className="p-6 flex items-center justify-between">
        <div className="flex items-center gap-4">
           <div className={`w-3 h-3 rounded-full ${isMyTurn ? 'bg-emerald-500 shadow-[0_0_10px_#10b981]' : 'bg-slate-700'}`} />
           <h2 className="font-black uppercase italic text-lg tracking-tight">Connect 4</h2>
        </div>
        <button onClick={onBack} className="p-2 hover:bg-white/10 rounded-xl"><X className="w-5 h-5" /></button>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center px-4">
         <div className="bg-blue-700 p-3 rounded-3xl grid grid-cols-7 gap-2 shadow-2xl relative">
            {board.map((cell: string|null, i: number) => (
               <button 
                key={i} 
                onClick={() => handleColumnClick(i % 7)}
                className={`w-8 h-8 sm:w-11 sm:h-11 rounded-full transition-all ${
                  cell === 'R' ? 'bg-red-500 shadow-inner' : 
                  cell === 'Y' ? 'bg-yellow-400 shadow-inner' : 
                  'bg-blue-900/50'
                } ${!cell && isMyTurn ? 'hover:bg-blue-800' : ''}`}
               />
            ))}

            {/* Turn Marker */}
            <div className="absolute -top-12 left-0 right-0 flex justify-around px-3">
               {Array.from({length: 7}).map((_, i) => (
                  <button 
                    key={i}
                    onClick={() => handleColumnClick(i)}
                    className={`w-8 sm:w-11 h-8 rounded-full flex items-center justify-center transition-all ${
                      isMyTurn ? 'bg-blue-600/20 hover:bg-white/10' : 'opacity-0 pointer-events-none'
                    }`}
                  >
                    <Play className="w-3 h-3 rotate-90 fill-current opacity-50" />
                  </button>
               ))}
            </div>
         </div>

         <div className="mt-12 flex items-center gap-10">
            <div className={`flex flex-col items-center gap-2 ${room?.turn === room?.players.p1.uid ? 'opacity-100 scale-110' : 'opacity-30 grayscale'}`}>
               <div className="w-10 h-10 rounded-2xl bg-red-500" />
               <span className="text-[10px] font-black uppercase text-slate-500">{room?.players.p1.name}</span>
            </div>
            <div className="text-[10px] font-black text-slate-700 uppercase tracking-[0.4em]">VS</div>
            <div className={`flex flex-col items-center gap-2 ${room?.turn === room?.players.p2?.uid ? 'opacity-100 scale-110' : 'opacity-30 grayscale'}`}>
               <div className="w-10 h-10 rounded-2xl bg-yellow-400" />
               <span className="text-[10px] font-black uppercase text-slate-500">{room?.players.p2?.name}</span>
            </div>
         </div>
      </div>

      <AnimatePresence>
        {room?.status === 'finished' && (
          <motion.div className="absolute inset-0 bg-slate-950/95 backdrop-blur-xl flex flex-col items-center justify-center p-8 z-50 text-center">
             <Trophy className="w-20 h-20 text-yellow-500 mb-6" />
             <h2 className="text-4xl font-black uppercase italic mb-2">Game Over!</h2>
             <p className="text-slate-400 font-bold uppercase text-xs tracking-widest mb-12">
               {room.winner === user?.uid ? 'Kemenangan Mutlak!' : room.winner ? 'Lawan Menang!' : 'Seri!'}
             </p>
             <button onClick={() => setLocalRoomId(null)} className="px-10 py-4 bg-white text-slate-900 rounded-3xl font-black uppercase">Ke Lobi</button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
