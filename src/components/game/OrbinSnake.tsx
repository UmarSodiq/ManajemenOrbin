import React, { useRef, useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { RefreshCw, Play, AlertTriangle, ChevronLeft, Target } from 'lucide-react';

interface Point {
  x: number;
  y: number;
}

export default function OrbinSnake({ onBack }: { onBack: () => void }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [gameState, setGameState] = useState<'start' | 'playing' | 'over'>('start');
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);

  const gridSize = 20;
  const snakeRef = useRef<Point[]>([]);
  const foodRef = useRef<Point>({ x: 10, y: 10 });
  const directionRef = useRef<Point>({ x: 1, y: 0 });
  const nextDirectionRef = useRef<Point>({ x: 1, y: 0 });
  const frameRef = useRef<number>(0);
  const lastUpdateRef = useRef<number>(0);

  const resetGame = () => {
    snakeRef.current = [
      { x: 10, y: 10 },
      { x: 9, y: 10 },
      { x: 8, y: 10 }
    ];
    directionRef.current = { x: 1, y: 0 };
    nextDirectionRef.current = { x: 1, y: 0 };
    setScore(0);
    spawnFood();
    setGameState('playing');
  };

  const spawnFood = () => {
    const x = Math.floor(Math.random() * 20);
    const y = Math.floor(Math.random() * 20);
    foodRef.current = { x, y };
  };

  const gameLoop = (time: number) => {
    const diff = time - lastUpdateRef.current;
    const speed = Math.max(80, 150 - score * 2);

    if (diff > speed) {
      lastUpdateRef.current = time;
      directionRef.current = nextDirectionRef.current;

      const head = { ...snakeRef.current[0] };
      head.x += directionRef.current.x;
      head.y += directionRef.current.y;

      // Wall collision
      if (head.x < 0 || head.x >= 20 || head.y < 0 || head.y >= 20) {
        setGameState('over');
        return;
      }

      // Self collision
      if (snakeRef.current.some(p => p.x === head.x && p.y === head.y)) {
        setGameState('over');
        return;
      }

      snakeRef.current.unshift(head);

      // Food collision
      if (head.x === foodRef.current.x && head.y === foodRef.current.y) {
        setScore(s => s + 10);
        spawnFood();
      } else {
        snakeRef.current.pop();
      }
    }

    draw();
    if (gameState === 'playing') {
      frameRef.current = requestAnimationFrame(gameLoop);
    }
  };

  const draw = () => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!ctx) return;

    ctx.fillStyle = '#0f172a';
    ctx.fillRect(0, 0, 400, 400);

    // Food
    ctx.fillStyle = '#f43f5e';
    ctx.beginPath();
    ctx.arc(foodRef.current.x * 20 + 10, foodRef.current.y * 20 + 10, 8, 0, Math.PI * 2);
    ctx.fill();

    // Snake
    snakeRef.current.forEach((p, i) => {
      ctx.fillStyle = i === 0 ? '#3b82f6' : '#1d4ed8';
      ctx.fillRect(p.x * 20 + 1, p.y * 20 + 1, 18, 18);
    });
  };

  useEffect(() => {
    if (gameState === 'playing') {
      lastUpdateRef.current = performance.now();
      frameRef.current = requestAnimationFrame(gameLoop);
    } else {
      cancelAnimationFrame(frameRef.current);
    }
    return () => cancelAnimationFrame(frameRef.current);
  }, [gameState]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (gameState !== 'playing') return;
      const d = directionRef.current;
      switch (e.key) {
        case 'ArrowUp': if (d.y === 0) nextDirectionRef.current = { x: 0, y: -1 }; break;
        case 'ArrowDown': if (d.y === 0) nextDirectionRef.current = { x: 0, y: 1 }; break;
        case 'ArrowLeft': if (d.x === 0) nextDirectionRef.current = { x: -1, y: 0 }; break;
        case 'ArrowRight': if (d.x === 0) nextDirectionRef.current = { x: 1, y: 0 }; break;
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [gameState]);

  return (
    <div className="flex flex-col h-full bg-slate-950 text-white items-center p-6">
      <div className="w-full max-w-md flex items-center justify-between mb-8">
        <button onClick={onBack} className="p-2 hover:bg-white/10 rounded-xl">
          <ChevronLeft className="w-5 h-5" />
        </button>
        <div className="text-right">
           <p className="text-[10px] font-black uppercase text-slate-500">Score</p>
           <p className="text-xl font-black text-blue-400">{score}</p>
        </div>
      </div>

      <div className="relative w-[320px] h-[320px] sm:w-[400px] sm:h-[400px] bg-slate-900 rounded-3xl border border-white/5 overflow-hidden shadow-2xl">
         <canvas ref={canvasRef} width={400} height={400} className="w-full h-full" />
         
         <AnimatePresence>
            {gameState === 'start' && (
              <motion.div className="absolute inset-0 bg-slate-900/90 flex flex-col items-center justify-center p-8 text-center backdrop-blur-sm">
                 <Target className="w-12 h-12 text-blue-500 mb-4" />
                 <h2 className="text-2xl font-black uppercase italic mb-2">Orbin Snake</h2>
                 <p className="text-slate-400 text-sm mb-8 font-medium">Gunakan panah keyboard atau swipe untuk mengontrol ular!</p>
                 <button onClick={resetGame} className="px-10 py-4 bg-blue-600 rounded-2xl font-black uppercase shadow-lg shadow-blue-500/20">Mulai</button>
              </motion.div>
            )}
            
            {gameState === 'over' && (
              <motion.div className="absolute inset-0 bg-red-950/90 flex flex-col items-center justify-center p-8 text-center backdrop-blur-md">
                 <AlertTriangle className="w-12 h-12 text-red-500 mb-4" />
                 <h2 className="text-3xl font-black uppercase italic mb-2 text-red-500">Mati!</h2>
                 <p className="text-xl font-black mb-12">{score} POIN</p>
                 <button onClick={resetGame} className="px-10 py-4 bg-white text-slate-900 rounded-2xl font-black uppercase">Coba Lagi</button>
              </motion.div>
            )}
         </AnimatePresence>
      </div>

      {/* On-screen controls for mobile */}
      <div className="mt-12 grid grid-cols-3 gap-2 sm:hidden">
         <div />
         <button 
           onClick={() => { if (directionRef.current.y === 0) nextDirectionRef.current = { x: 0, y: -1 } }}
           className="p-4 bg-white/5 rounded-2xl flex items-center justify-center"
         >
           <ChevronLeft className="w-6 h-6 rotate-90" />
         </button>
         <div />
         <button 
           onClick={() => { if (directionRef.current.x === 0) nextDirectionRef.current = { x: -1, y: 0 } }}
           className="p-4 bg-white/5 rounded-2xl flex items-center justify-center"
         >
           <ChevronLeft className="w-6 h-6" />
         </button>
         <button 
           onClick={() => { if (directionRef.current.y === 0) nextDirectionRef.current = { x: 0, y: 1 } }}
           className="p-4 bg-white/5 rounded-2xl flex items-center justify-center"
         >
           <ChevronLeft className="w-6 h-6 -rotate-90" />
         </button>
         <button 
           onClick={() => { if (directionRef.current.x === 0) nextDirectionRef.current = { x: 1, y: 0 } }}
           className="p-4 bg-white/5 rounded-2xl flex items-center justify-center"
         >
           <ChevronLeft className="w-6 h-6 rotate-180" />
         </button>
      </div>
    </div>
  );
}
