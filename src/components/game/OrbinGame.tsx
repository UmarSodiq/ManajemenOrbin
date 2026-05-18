import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Gamepad2, 
  Trophy, 
  Star, 
  RefreshCw,
  Play,
  Users,
  Compass,
  ArrowUpCircle,
  Hash,
  X,
  Zap,
  Rocket,
  Layers,
  ChevronLeft,
  Target,
  Shield,
  LayoutGrid,
  Disc,
  Dice6,
  Keyboard
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { useGameScores } from '../../hooks/useGameScores';
import OrbitSurvivor from './OrbitSurvivor';
import OrbinJump from './OrbinJump';
import OrbinDash from './OrbinDash';
import TappingBattle from './TappingBattle';
import TicTacToeMultiplayer from './TicTacToeMultiplayer';
import OrbinSnake from './OrbinSnake';
import OrbinBreaker from './OrbinBreaker';
import ConnectFourMultiplayer from './ConnectFour';
import CardDuel from './CardDuel';
import LudoClassic from './LudoClassic';
import WordBattle from './WordBattle';

type GameType = 'orbit' | 'jump' | 'dash' | 'tapping' | 'tictactoe' | 'snake' | 'breaker' | 'connect4' | 'card_duel' | 'ludo_classic' | 'word_battle' | null;

export default function OrbinGame() {
  const { user } = useAuth();
  const { scores, saveScore } = useGameScores();
  const [activeGame, setActiveGame] = useState<GameType>(null);
  const [showLeaderboard, setShowLeaderboard] = useState(false);

  const handleGameOver = async (score: number) => {
    if (user && score > 0) {
      await saveScore(user.uid, user.username || 'Member', score);
    }
  };

  const games = [
    {
      id: 'orbit',
      title: 'Orbit Survivor',
      description: 'Bertahan di orbit dari hantaman meteor.',
      icon: Compass,
      color: 'from-blue-600 to-indigo-700',
      tag: 'Classic',
      type: 'Single Player'
    },
    {
      id: 'dash',
      title: 'Orbin Dash',
      description: 'Lompat dan lewati celah rintangan kritis.',
      icon: Zap,
      color: 'from-yellow-500 to-orange-600',
      tag: 'New',
      type: 'Single Player'
    },
    {
      id: 'jump',
      title: 'Orbin Jump',
      description: 'Lompat setinggi mungkin dan hindari jatuh.',
      icon: ArrowUpCircle,
      color: 'from-emerald-500 to-teal-700',
      tag: 'Hot',
      type: 'Single Player'
    },
    {
      id: 'snake',
      title: 'Orbin Snake',
      description: 'Klasik retro! Kumpulkan poin tanpa menabrak.',
      icon: Target,
      color: 'from-blue-500 to-cyan-700',
      tag: 'Retro',
      type: 'Single Player'
    },
    {
      id: 'breaker',
      title: 'Orbin Breaker',
      description: 'Hancurkan semua rintangan dengan bola.',
      icon: Shield,
      color: 'from-violet-600 to-fuchsia-700',
      tag: 'Fun',
      type: 'Single Player'
    },
    {
      id: 'tapping',
      title: 'Tapping Battle',
      description: 'Adu kecepatan ketukan jari secara real-time.',
      icon: Rocket,
      color: 'from-pink-600 to-rose-700',
      tag: 'Versus',
      type: 'Multiplayer'
    },
    {
      id: 'tictactoe',
      title: 'Multiplayer XO',
      description: 'Duel strategi 1v1 secara real-time.',
      icon: Hash,
      color: 'from-indigo-600 to-purple-700',
      tag: 'Online',
      type: 'Multiplayer'
    },
    {
      id: 'connect4',
      title: 'Connect 4',
      description: 'Duel 4-sejajar secara real-time.',
      icon: LayoutGrid,
      color: 'from-blue-700 to-blue-900',
      tag: 'Pro',
      type: 'Multiplayer'
    },
    {
      id: 'card_duel',
      title: 'Card Duel',
      description: 'Adu kartu ala Uno secara online 1v1.',
      icon: Layers,
      color: 'from-orange-500 to-red-600',
      tag: 'New',
      type: 'Multiplayer'
    },
    {
      id: 'ludo_classic',
      title: 'Ludo Classic',
      description: 'Papan Ludo klasik real-time (2-4P).',
      icon: Disc,
      color: 'from-emerald-600 to-teal-800',
      tag: 'Race',
      type: 'Multiplayer'
    },
    {
      id: 'word_battle',
      title: 'Word Battle',
      description: 'Siapa paling cepat mengetik kata!',
      icon: Keyboard,
      color: 'from-pink-600 to-fuchsia-800',
      tag: 'Smart',
      type: 'Multiplayer'
    }
  ];

  if (activeGame === 'orbit') {
    return (
      <OrbitSurvivor 
        user={user}
        onGameOver={handleGameOver}
        scores={scores}
        highScore={Math.max(...scores.map(s => s.score), 0)}
        onBack={() => setActiveGame(null)}
      />
    );
  }

  if (activeGame === 'dash') {
    return (
      <OrbinDash 
        onGameOver={handleGameOver}
        highScore={Math.max(...scores.map(s => s.score), 0)}
        onBack={() => setActiveGame(null)}
      />
    );
  }

  if (activeGame === 'jump') {
    return (
      <OrbinJump 
        onGameOver={handleGameOver}
        highScore={Math.max(...scores.map(s => s.score), 0)}
        onBack={() => setActiveGame(null)}
      />
    );
  }

  if (activeGame === 'snake') {
    return <OrbinSnake onBack={() => setActiveGame(null)} />;
  }

  if (activeGame === 'breaker') {
    return <OrbinBreaker onBack={() => setActiveGame(null)} />;
  }

  if (activeGame === 'tapping') {
    return (
      <TappingBattle 
        onBack={() => setActiveGame(null)}
      />
    );
  }

  if (activeGame === 'tictactoe') {
    return (
      <TicTacToeMultiplayer 
        onBack={() => setActiveGame(null)}
      />
    );
  }

  if (activeGame === 'connect4') {
    return <ConnectFourMultiplayer onBack={() => setActiveGame(null)} />;
  }

  if (activeGame === 'card_duel') {
    return <CardDuel onBack={() => setActiveGame(null)} />;
  }

  if (activeGame === 'ludo_classic') {
    return <LudoClassic onBack={() => setActiveGame(null)} />;
  }

  if (activeGame === 'word_battle') {
    return <WordBattle onBack={() => setActiveGame(null)} />;
  }

  return (
    <div className="flex flex-col h-full bg-slate-50 dark:bg-slate-950 font-sans overflow-hidden">
      {/* Header */}
      <div className="p-6 md:p-8 flex items-center justify-between z-20">
        <div className="flex items-center gap-4">
           <div>
              <h1 className="text-2xl md:text-3xl font-black tracking-tighter uppercase flex items-center gap-3 text-slate-900 dark:text-white">
                <Gamepad2 className="w-8 h-8 text-blue-600" />
                Fun Zone
              </h1>
              <p className="text-[10px] text-slate-500 font-bold tracking-widest uppercase mt-1">Select your mission, member</p>
           </div>
        </div>
        <button 
          onClick={() => setShowLeaderboard(true)}
          className="p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm hover:shadow-md transition-all text-yellow-600"
        >
          <Trophy className="w-6 h-6" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-6 pb-8">
        <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
          {games.map((game) => (
            <motion.button
              key={game.id}
              whileHover={{ y: -5 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setActiveGame(game.id as GameType)}
              className={`relative overflow-hidden p-8 rounded-[2.5rem] bg-gradient-to-br ${game.color} text-white text-left group transition-all shadow-xl hover:shadow-2xl h-64 flex flex-col justify-between`}
            >
              <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-125 transition-transform">
                <game.icon size={120} strokeWidth={1} />
              </div>
              
              <div className="relative z-10">
                <div className="flex items-center gap-3 mb-4">
                  <div className="bg-white/20 backdrop-blur-md px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest">
                    {game.tag}
                  </div>
                  <div className="bg-black/20 backdrop-blur-md px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest flex items-center gap-1">
                    {game.type === 'Multiplayer' ? <Users className="w-3 h-3" /> : <Play className="w-3 h-3" />}
                    {game.type}
                  </div>
                </div>
                <h3 className="text-3xl font-black tracking-tighter uppercase italic mb-2 leading-none">{game.title}</h3>
                <p className="text-white/70 text-sm max-w-[200px] leading-snug">{game.description}</p>
              </div>

              <div className="relative z-10 flex items-center gap-3">
                 <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center group-hover:bg-white group-hover:text-slate-900 transition-all">
                    <Play className="w-5 h-5 fill-current" />
                 </div>
                 <span className="text-xs font-black uppercase tracking-widest">Ayo Main!</span>
              </div>
            </motion.button>
          ))}

          {/* Coming Soon Card */}
          <div className="bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 flex flex-col justify-center items-center text-center gap-4">
             <div className="w-16 h-16 bg-blue-50 dark:bg-blue-900/30 rounded-3xl flex items-center justify-center text-blue-600">
                <Users className="w-8 h-8" />
             </div>
             <h4 className="font-black text-xl uppercase tracking-tighter text-slate-900 dark:text-white">More Games Coming</h4>
             <p className="text-slate-500 text-sm max-w-xs leading-relaxed">Hubungi pengurus jika kamu punya ide game keren untuk Orbin!</p>
          </div>
        </div>
      </div>

      {/* Leaderboard Modal */}
      <AnimatePresence>
        {showLeaderboard && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-slate-950/95 backdrop-blur-xl flex flex-col items-center justify-center p-6 z-50 shadow-2xl"
          >
            <div className="w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[2.5rem] overflow-hidden flex flex-col max-h-[80vh]">
              <div className="p-8 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-black tracking-tighter uppercase flex items-center gap-3 text-slate-900 dark:text-white">
                    <Trophy className="w-6 h-6 text-yellow-500" />
                    HALL OF FAME
                  </h3>
                  <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Global Top Scores</p>
                </div>
                <button onClick={() => setShowLeaderboard(false)} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors">
                  <X className="w-6 h-6 text-slate-400" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {scores.length > 0 ? (
                  scores.sort((a,b) => b.score - a.score).slice(0, 10).map((s, i) => (
                    <div key={i} className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-800">
                      <div className="flex items-center gap-4">
                        <div className={`w-8 h-8 rounded-xl flex items-center justify-center font-black text-sm ${
                          i === 0 ? 'bg-yellow-100 text-yellow-700' : 
                          i === 1 ? 'bg-slate-200 text-slate-700' : 
                          i === 2 ? 'bg-orange-100 text-orange-700' : 
                          'bg-slate-100 text-slate-500 dark:bg-slate-800'
                        }`}>
                          {i + 1}
                        </div>
                        <div>
                          <p className="font-bold text-sm uppercase tracking-tight text-slate-900 dark:text-white">{s.namaLengkap}</p>
                          <p className="text-[9px] text-slate-500 font-medium">Survivor Rank</p>
                        </div>
                      </div>
                      <div className="text-right">
                         <p className="text-lg font-black text-blue-600 dark:text-blue-400 tabular-nums">{s.score}</p>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="p-20 text-center flex flex-col items-center">
                    <Star className="w-12 h-12 text-slate-200 dark:text-slate-800 mb-4 animate-pulse" />
                    <p className="text-slate-500 font-bold uppercase text-[10px] tracking-widest">No scores recorded yet</p>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
