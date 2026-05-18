import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Trophy, RefreshCw, X, UserPlus, Play, Layers, AlertCircle } from 'lucide-react';
import { useMultiplayerGame } from '../../hooks/useMultiplayerGame';
import { useAuth } from '../../hooks/useAuth';

interface Card {
  color: 'red' | 'blue' | 'green' | 'yellow';
  value: string;
}

interface CardGameState {
  deck: Card[];
  discardPile: Card[];
  hands: { [uid: string]: Card[] };
  lastAction: string;
}

const COLORS: Card['color'][] = ['red', 'blue', 'green', 'yellow'];
const VALUES = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', 'SKIP', '+2'];

export default function CardDuel({ onBack }: { onBack: () => void }) {
  const { user } = useAuth();
  const { 
    room, 
    isLoading, 
    createRoom, 
    joinRoom, 
    updateGameState, 
    findAvailableRoom,
    subscribeToRoom 
  } = useMultiplayerGame('card_duel');

  const [localRoomId, setLocalRoomId] = useState<string | null>(null);

  useEffect(() => {
    if (localRoomId) {
      const unsubscribe = subscribeToRoom(localRoomId);
      return () => unsubscribe();
    }
  }, [localRoomId]);

  const generateDeck = () => {
    const deck: Card[] = [];
    COLORS.forEach(color => {
      VALUES.forEach(value => {
        deck.push({ color, value });
        deck.push({ color, value }); // 2 of each
      });
    });
    return deck.sort(() => Math.random() - 0.5);
  };

  const handleStart = async () => {
    if (!user) return;
    const available = await findAvailableRoom();
    if (available) {
      // Room found, join it and initialize hands
      const deck = [...available.gameState.deck];
      const p1Hand = deck.splice(0, 7);
      const p2Hand = deck.splice(0, 7);
      const initialDiscard = deck.splice(0, 1)[0];

      await joinRoom(available.id, user.uid, user.username || 'Guest', available.players);
      await updateGameState(available.id, {
        deck,
        discardPile: [initialDiscard],
        hands: {
          [available.players.p1.uid]: p1Hand,
          [user.uid]: p2Hand
        },
        lastAction: 'Game Started!'
      });
      setLocalRoomId(available.id);
    } else {
      // Create new room
      const id = await createRoom(user.uid, user.username || 'Guest', {
        deck: generateDeck(),
        discardPile: [],
        hands: {},
        lastAction: 'Waiting for opponent...'
      });
      if (id) setLocalRoomId(id);
    }
  };

  const canPlayCard = (card: Card) => {
    if (!room) return false;
    const top = room.gameState.discardPile[room.gameState.discardPile.length - 1];
    if (!top) return true;
    return card.color === top.color || card.value === top.value;
  };

  const playCard = async (cardIndex: number) => {
    if (!room || !user || room.turn !== user.uid || room.status !== 'playing' || room.winner) return;

    const myId = user.uid;
    const oppId = room.players.p1.uid === myId ? room.players.p2!.uid : room.players.p1.uid;
    const myHand = [...room.gameState.hands[myId]];
    const card = myHand[cardIndex];

    if (!canPlayCard(card)) return;

    myHand.splice(cardIndex, 1);
    const newDiscard = [...room.gameState.discardPile, card];
    let nextTurn = oppId;
    let winnerId = myHand.length === 0 ? myId : null;
    let lastAction = `${user.username} played ${card.color} ${card.value}`;

    // Special card logic
    const newState = { ...room.gameState, discardPile: newDiscard, hands: { ...room.gameState.hands, [myId]: myHand } };

    if (card.value === 'SKIP') {
      nextTurn = myId; // My turn again
      lastAction += ' - Opponent skipped!';
    } else if (card.value === '+2') {
      const deck = [...room.gameState.deck];
      const drawn = deck.splice(0, 2);
      newState.deck = deck;
      newState.hands[oppId] = [...room.gameState.hands[oppId], ...drawn];
      lastAction += ' - Opponent draws 2!';
    }

    await updateGameState(room.id, { ...newState, lastAction }, nextTurn, winnerId);
  };

  const drawCard = async () => {
    if (!room || !user || room.turn !== user.uid || room.status !== 'playing' || room.winner) return;

    const myId = user.uid;
    const oppId = room.players.p1.uid === myId ? room.players.p2!.uid : room.players.p1.uid;
    const deck = [...room.gameState.deck];
    
    if (deck.length === 0) return; // Rare case

    const drawn = deck.shift()!;
    const myHand = [...room.gameState.hands[myId], drawn];
    
    await updateGameState(room.id, {
      ...room.gameState,
      deck,
      hands: { ...room.gameState.hands, [myId]: myHand },
      lastAction: `${user.username} drew a card`
    }, oppId);
  };

  if (!localRoomId) {
    return (
      <div className="flex flex-col h-full bg-slate-900 items-center justify-center p-6 text-white text-center">
        <Layers className="w-20 h-20 text-blue-500 mb-6" />
        <h2 className="text-3xl font-black mb-2 uppercase italic tracking-tighter">Orbin Card Duel</h2>
        <p className="text-slate-400 text-sm mb-12 max-w-xs leading-relaxed">Habiskan kartu di tanganmu dengan mencocokkan warna atau angka. Awas kartu spesial!</p>
        <button 
          onClick={handleStart}
          disabled={isLoading}
          className="w-full max-w-xs py-4 bg-blue-600 rounded-2xl font-black uppercase flex items-center justify-center gap-3 hover:bg-blue-500 transition-all shadow-xl shadow-blue-600/20"
        >
          {isLoading ? <RefreshCw className="w-5 h-5 animate-spin" /> : <Play className="w-5 h-5" />}
          Cari Duel Online
        </button>
        <button onClick={onBack} className="mt-4 text-slate-500 font-bold uppercase text-xs tracking-widest">Kembali</button>
      </div>
    );
  }

  if (room?.status === 'waiting') {
    return (
      <div className="flex flex-col h-full bg-slate-900 items-center justify-center text-white">
        <div className="relative mb-8">
           <div className="absolute inset-0 bg-blue-500/20 blur-3xl rounded-full animate-pulse" />
           <Layers className="w-16 h-16 text-blue-500 animate-bounce relative z-10" />
        </div>
        <h2 className="text-xl font-black uppercase italic mb-2">Mengocok Kartu...</h2>
        <p className="text-slate-500 text-xs font-bold uppercase tracking-widest">Menunggu lawan bergabung</p>
        <button onClick={() => setLocalRoomId(null)} className="mt-12 text-slate-400 font-bold uppercase text-[10px]">Batalkan</button>
      </div>
    );
  }

  if (!room) {
    return (
      <div className="flex flex-col h-full bg-slate-950 items-center justify-center p-6 text-white text-center">
        <RefreshCw className="w-10 h-10 text-blue-500 animate-spin mb-4" />
        <p className="text-slate-500 font-black uppercase text-[10px] tracking-widest text-center">Memuat Kartu...</p>
      </div>
    );
  }

  const myId = user?.uid || '';
  const myHand = room?.gameState?.hands?.[myId] || [];
  const oppId = room?.players?.p1?.uid === myId ? room?.players?.p2?.uid : room?.players?.p1?.uid;
  const oppHandCount = room?.gameState?.hands?.[oppId || '']?.length || 0;
  const topCard = room?.gameState?.discardPile?.[room.gameState.discardPile.length - 1];
  const isMyTurn = room?.turn === myId;

  return (
    <div className="flex flex-col h-full bg-slate-950 font-sans text-white overflow-hidden relative">
      <div className="p-4 flex items-center justify-between border-b border-white/5 bg-slate-900/50 backdrop-blur-md z-20">
         <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${isMyTurn ? 'bg-emerald-500 animate-pulse' : 'bg-slate-700'}`} />
            <span className="font-black text-sm uppercase italic">Duel Kartu</span>
         </div>
         <button onClick={onBack} className="p-2 hover:bg-white/10 rounded-xl transition-colors"><X className="w-5 h-5" /></button>
      </div>

      <div className="flex-1 flex flex-col justify-between p-6">
         {/* Opponent Area */}
         <div className="flex flex-col items-center">
            <div className="flex items-center gap-2 mb-4 bg-white/5 px-4 py-2 rounded-2xl border border-white/5">
                <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-[10px] font-black uppercase">
                  {room?.players.p1.uid === myId ? room?.players.p2?.name?.[0] : room?.players.p1.name?.[0]}
                </div>
                <span className="text-[10px] font-black uppercase text-slate-400">
                  {room?.players.p1.uid === myId ? room?.players.p2?.name : room?.players.p1.name}
                </span>
            </div>
            <div className="flex gap-1">
               {Array.from({ length: oppHandCount }).map((_, i) => (
                  <div key={i} className="w-8 h-12 bg-blue-900 rounded-lg border border-blue-400/30 flex items-center justify-center -ml-4 first:ml-0 shadow-lg">
                     <Layers className="w-4 h-4 text-blue-400 opacity-20" />
                  </div>
               ))}
            </div>
         </div>

         {/* Center Area (Discard & Deck) */}
         <div className="flex items-center justify-center gap-12 relative">
            {/* Last Action text */}
            <div className="absolute -top-12 left-0 right-0 text-center">
               <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">{room?.gameState.lastAction}</span>
            </div>

            {/* Deck */}
            <button 
              onClick={drawCard}
              disabled={!isMyTurn}
              className={`w-20 h-28 bg-gradient-to-br from-blue-700 to-indigo-900 rounded-xl border-2 border-blue-400/50 flex flex-col items-center justify-center gap-2 shadow-2xl relative transition-transform ${isMyTurn ? 'hover:scale-110 active:scale-95 cursor-pointer' : 'opacity-40 grayscale pointer-events-none'}`}
            >
               <Layers className="w-8 h-8 text-white/50" />
               <span className="text-[10px] font-black uppercase text-white/70">Draw</span>
               <div className="absolute -top-2 -right-2 bg-blue-500 text-[10px] font-black px-2 py-1 rounded-full">{room?.gameState.deck.length}</div>
            </button>

            {/* Discard Pile */}
            {topCard && (
               <div className={`w-24 h-32 rounded-2xl flex flex-col items-center justify-center shadow-[0_0_40px_rgba(0,0,0,0.5)] border-4 border-white/20 relative ${
                 topCard.color === 'red' ? 'bg-red-500 shadow-red-500/20' : 
                 topCard.color === 'blue' ? 'bg-blue-500 shadow-blue-500/20' : 
                 topCard.color === 'green' ? 'bg-emerald-500 shadow-emerald-500/20' : 
                 'bg-yellow-400 shadow-yellow-400/20'
               }`}>
                  <div className="absolute top-2 left-2 text-[10px] font-black uppercase opacity-50">{topCard.value}</div>
                  <span className="text-3xl font-black tracking-tighter text-white drop-shadow-lg">{topCard.value}</span>
                  <div className="absolute bottom-2 right-2 text-[10px] font-black uppercase opacity-50 rotate-180">{topCard.value}</div>
               </div>
            )}
         </div>

         {/* My Hand */}
         <div className="flex flex-col items-center">
            <div className="mb-6">
                <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${isMyTurn ? 'bg-emerald-600 text-white animate-pulse' : 'bg-white/5 text-slate-500'}`}>
                  {isMyTurn ? 'Giliranmu!' : 'Menunggu Lawan...'}
                </span>
            </div>
            <div className="flex gap-2 overflow-x-auto pb-4 w-full justify-center scrollbar-hide px-8">
               {myHand.map((card: Card, i: number) => {
                  const playable = isMyTurn && canPlayCard(card);
                  return (
                    <motion.button
                      key={i}
                      whileHover={playable ? { y: -20, scale: 1.1 } : {}}
                      onClick={() => playCard(i)}
                      disabled={!playable}
                      className={`min-w-[70px] h-28 rounded-xl flex flex-col items-center justify-center relative transition-all shadow-xl -ml-6 first:ml-0 border-2 border-white/20 ${
                        card.color === 'red' ? 'bg-red-500' : 
                        card.color === 'blue' ? 'bg-blue-500' : 
                        card.color === 'green' ? 'bg-emerald-500' : 
                        'bg-yellow-400'
                      } ${playable ? 'z-10' : 'opacity-40 grayscale-50 scale-90 translate-y-4'}`}
                    >
                      <span className="text-xl font-black text-white">{card.value}</span>
                      {playable && <div className="absolute -top-1 -right-1 w-3 h-3 bg-white rounded-full animate-bounce" />}
                    </motion.button>
                  );
               })}
            </div>
         </div>
      </div>

      {/* Results */}
      <AnimatePresence>
        {room?.status === 'finished' && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="absolute inset-0 bg-slate-950/95 backdrop-blur-xl flex flex-col items-center justify-center p-8 z-50 text-center"
          >
             <Trophy className={`w-24 h-24 mb-6 ${room.winner === myId ? 'text-yellow-500 animate-bounce' : 'text-slate-600'}`} />
             <h2 className="text-5xl font-black uppercase italic mb-2 tracking-tighter">
               {room.winner === myId ? 'MAESTRO!' : 'DUEL SELESAI'}
             </h2>
             <p className="text-slate-400 font-bold uppercase text-xs tracking-[0.3em] mb-12">
               {room.winner === myId ? 'Kamu memenangkan duel kartu ini!' : 'Lawan berhasil menghabiskan kartunya lebih dulu.'}
             </p>
             <button 
              onClick={() => setLocalRoomId(null)}
              className="px-12 py-5 bg-white text-slate-950 rounded-[2.5rem] font-black uppercase tracking-widest text-sm shadow-2xl hover:scale-105 transition-transform"
             >
               Kembali Ke Lobi
             </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
