import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Trophy, RefreshCw, X, Circle, ChevronLeft, UserPlus, Play } from 'lucide-react';
import { useMultiplayerGame } from '../../hooks/useMultiplayerGame';
import { useAuth } from '../../hooks/useAuth';

interface TicTacToeGameState {
  board: (string | null)[];
  isDraw: boolean;
}

export default function TicTacToeMultiplayer({ onBack }: { onBack: () => void }) {
  const { user } = useAuth();
  const { 
    room, 
    isLoading, 
    createRoom, 
    joinRoom, 
    updateGameState, 
    findAvailableRoom,
    subscribeToRoom 
  } = useMultiplayerGame('tictactoe');

  const [localRoomId, setLocalRoomId] = useState<string | null>(null);

  useEffect(() => {
    if (localRoomId) {
      const unsubscribe = subscribeToRoom(localRoomId);
      return () => unsubscribe();
    }
  }, [localRoomId]);

  const handleCreateOrJoin = async () => {
    if (!user) return;
    const available = await findAvailableRoom();
    if (available) {
      await joinRoom(available.id, user.uid, user.username || 'Guest', available.players);
      setLocalRoomId(available.id);
    } else {
      const id = await createRoom(user.uid, user.username || 'Guest', {
        board: Array(9).fill(null),
        isDraw: false
      });
      if (id) setLocalRoomId(id);
    }
  };

  const checkWinner = (board: (string | null)[]) => {
    const lines = [
      [0, 1, 2], [3, 4, 5], [6, 7, 8], // rows
      [0, 3, 6], [1, 4, 7], [2, 5, 8], // cols
      [0, 4, 8], [2, 4, 6]             // diags
    ];
    for (let line of lines) {
      if (board[line[0]] && board[line[0]] === board[line[1]] && board[line[0]] === board[line[2]]) {
        return board[line[0]];
      }
    }
    return null;
  };

  const handleCellClick = (index: number) => {
    if (!room || !user || room.status !== 'playing' || room.turn !== user.uid || room.winner) return;
    if (room.gameState.board[index]) return;

    const newBoard = [...room.gameState.board];
    newBoard[index] = room.players.p1.uid === user.uid ? 'X' : 'O';
    
    const winnerSymbol = checkWinner(newBoard);
    const isDraw = !winnerSymbol && newBoard.every(cell => cell !== null);
    
    let winnerId = null;
    if (winnerSymbol) {
      winnerId = winnerSymbol === 'X' ? room.players.p1.uid : room.players.p2!.uid;
    }

    const nextTurn = room.players.p1.uid === user.uid ? room.players.p2!.uid : room.players.p1.uid;
    
    updateGameState(room.id, { board: newBoard, isDraw }, winnerSymbol ? nextTurn : nextTurn, winnerId);
  };

  if (!localRoomId) {
    return (
      <div className="flex flex-col h-full bg-slate-900 items-center justify-center p-6 text-white text-center">
        <div className="w-20 h-20 bg-indigo-600/20 text-indigo-500 rounded-3xl flex items-center justify-center mb-6">
           <UserPlus className="w-10 h-10" />
        </div>
        <h2 className="text-3xl font-black mb-2 uppercase italic">Multiplayer XO</h2>
        <p className="text-slate-400 text-sm mb-12 max-w-xs">Cari lawan main secara real-time dan buktikan strategimu!</p>
        
        <div className="flex flex-col gap-4 w-full max-w-xs">
          <button 
            onClick={handleCreateOrJoin}
            disabled={isLoading}
            className="w-full py-4 bg-indigo-600 rounded-2xl font-black uppercase flex items-center justify-center gap-3 hover:bg-indigo-500 transition-all disabled:opacity-50"
          >
            {isLoading ? <RefreshCw className="w-5 h-5 animate-spin" /> : <Play className="w-5 h-5" />}
            Cari Pertandingan
          </button>
          <button 
            onClick={onBack}
            className="w-full py-4 bg-white/5 border border-white/10 rounded-2xl font-black uppercase flex items-center justify-center gap-3"
          >
            Kembali
          </button>
        </div>
      </div>
    );
  }

  if (room && room.status === 'waiting') {
    return (
      <div className="flex flex-col h-full bg-slate-900 items-center justify-center p-6 text-white text-center">
        <div className="relative mb-8">
           <div className="absolute inset-0 bg-indigo-500/20 blur-3xl rounded-full animate-pulse" />
           <RefreshCw className="w-16 h-16 text-indigo-500 animate-spin relative z-10" strokeWidth={3} />
        </div>
        <h2 className="text-2xl font-black mb-2 uppercase italic">Mencari Lawan...</h2>
        <p className="text-slate-500 text-sm uppercase tracking-widest font-bold">Harap tunggu sebentar</p>
        <button onClick={() => setLocalRoomId(null)} className="mt-12 text-slate-400 font-bold uppercase text-xs hover:text-white transition-colors">Batalkan</button>
      </div>
    );
  }

  const isMyTurn = room?.turn === user?.uid;
  const board = room?.gameState.board || Array(9).fill(null);
  const mySymbol = room?.players.p1.uid === user?.uid ? 'X' : 'O';

  return (
    <div className="flex flex-col h-full bg-slate-900 font-sans text-white overflow-hidden relative">
      <div className="p-6 flex items-center justify-between z-20">
        <div className="flex flex-col">
           <span className="text-[10px] font-black text-indigo-500 uppercase tracking-widest mb-1">Room ID: {localRoomId.slice(-4)}</span>
           <div className="flex items-center gap-2">
              <span className="font-black text-lg text-white">XO BATTLE</span>
           </div>
        </div>
        <button onClick={onBack} className="p-2 hover:bg-white/10 rounded-xl transition-colors">
          <X className="w-5 h-5" />
        </button>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center px-6">
         {/* Players Info */}
         <div className="flex items-center justify-between w-full max-w-sm mb-12">
            <div className={`flex flex-col items-center gap-2 transition-all ${room?.turn === room?.players.p1.uid ? 'scale-110 opacity-100' : 'opacity-40'}`}>
                <div className="w-12 h-12 rounded-2xl bg-indigo-600 flex items-center justify-center text-white font-black text-xl">X</div>
                <span className="text-[10px] font-black uppercase text-slate-400">{room?.players.p1.name}</span>
            </div>
            <div className="p-2 bg-white/5 rounded-xl text-[10px] font-black text-slate-500 uppercase tracking-widest">VS</div>
            <div className={`flex flex-col items-center gap-2 transition-all ${room?.turn === room?.players.p2?.uid ? 'scale-110 opacity-100' : 'opacity-40'}`}>
                <div className="w-12 h-12 rounded-2xl bg-pink-600 flex items-center justify-center text-white font-black text-xl">O</div>
                <span className="text-[10px] font-black uppercase text-slate-400">{room?.players.p2?.name}</span>
            </div>
         </div>

         {/* Board */}
         <div className="grid grid-cols-3 gap-3 w-full max-w-sm aspect-square bg-white/5 p-3 rounded-3xl border border-white/10 relative">
            {board.map((cell: any, i: number) => (
               <button 
                key={i}
                onClick={() => handleCellClick(i)}
                className={`bg-white/5 rounded-2xl flex items-center justify-center transition-all ${!cell && isMyTurn ? 'hover:bg-white/10' : ''}`}
               >
                  {cell === 'X' && <X className="w-12 h-12 text-indigo-500 stroke-[3px]" />}
                  {cell === 'O' && <Circle className="w-10 h-10 text-pink-500 stroke-[3px]" />}
               </button>
            ))}
            
            {/* Winner Overlay */}
            <AnimatePresence>
               {room?.status === 'finished' && (
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="absolute inset-0 bg-slate-900/90 backdrop-blur-md rounded-3xl flex flex-col items-center justify-center p-6 text-center"
                  >
                     {room.winner ? (
                        <>
                           <Trophy className="w-16 h-16 text-yellow-500 mb-4" />
                           <h3 className="text-2xl font-black uppercase italic mb-1">Winner!</h3>
                           <p className="text-slate-400 font-bold uppercase text-xs tracking-widest mb-8">
                             {room.winner === user?.uid ? 'Kamu Menang!' : `${room.winner === room.players.p1.uid ? room.players.p1.name : room.players.p2?.name} Menang`}
                           </p>
                        </>
                     ) : (
                        <>
                           <RefreshCw className="w-16 h-16 text-slate-500 mb-4" />
                           <h3 className="text-2xl font-black uppercase italic mb-1">Seri!</h3>
                           <p className="text-slate-400 font-bold uppercase text-xs tracking-widest mb-8">Permainan Seimbang</p>
                        </>
                     )}
                     <button onClick={() => setLocalRoomId(null)} className="px-8 py-3 bg-white text-slate-900 rounded-xl font-black uppercase text-sm">Kembali</button>
                  </motion.div>
               )}
            </AnimatePresence>
         </div>

         {/* Turn Notification */}
         <div className="mt-12">
            <span className={`px-6 py-2 rounded-full font-black text-xs uppercase tracking-widest ${isMyTurn ? 'bg-indigo-500 text-white animate-pulse' : 'bg-white/5 text-slate-500'}`}>
               {isMyTurn ? 'Giliranmu!' : 'Menunggu Lawan...'}
            </span>
         </div>
      </div>
    </div>
  );
}
