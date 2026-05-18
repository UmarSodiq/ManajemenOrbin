import React, { useRef, useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { RefreshCw, Play, AlertTriangle, ChevronLeft, Zap } from 'lucide-react';
import OrbinLogo from '../shared/OrbinLogo';

interface Pipe {
  x: number;
  topHeight: number;
}

interface OrbinDashProps {
  onGameOver: (score: number) => void;
  highScore: number;
  onBack: () => void;
}

export default function OrbinDash({ onGameOver, highScore, onBack }: OrbinDashProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  
  const [gameState, setGameState] = useState<'start' | 'playing' | 'over'>('start');
  const [score, setScore] = useState(0);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

  const playerRef = useRef({
    y: 0,
    size: 24,
    velocity: 0,
    gravity: 0.25,
    jump: -5
  });

  const pipesRef = useRef<Pipe[]>([]);
  const frameRef = useRef<number>(0);
  const lastTimeRef = useRef<number>(0);
  const pipeGap = 160;
  const pipeWidth = 50;

  useEffect(() => {
    const handleResize = () => {
      if (containerRef.current) {
        const { clientWidth, clientHeight } = containerRef.current;
        setDimensions({ width: clientWidth, height: clientHeight });
      }
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const resetGame = () => {
    setScore(0);
    playerRef.current.y = dimensions.height / 2;
    playerRef.current.velocity = 0;
    
    // Initial pipe
    pipesRef.current = [{
      x: dimensions.width + 100,
      topHeight: dimensions.height / 2 - 50
    }];
    
    setGameState('playing');
  };

  const gameLoop = (time: number) => {
    lastTimeRef.current = time;

    // Movement
    playerRef.current.velocity += playerRef.current.gravity;
    playerRef.current.y += playerRef.current.velocity;

    // Pipes update
    pipesRef.current.forEach(p => {
      p.x -= 3 + (score / 10); // Speed up
    });

    if (pipesRef.current[0] && pipesRef.current[0].x < -pipeWidth) {
      pipesRef.current.shift();
      setScore(s => s + 1);
    }

    if (pipesRef.current[pipesRef.current.length - 1].x < dimensions.width - 250) {
      pipesRef.current.push({
        x: dimensions.width,
        topHeight: 50 + Math.random() * (dimensions.height - pipeGap - 100)
      });
    }

    // Collision
    const p = playerRef.current;
    const px = 50; // Player fixed x
    
    if (p.y < 0 || p.y + p.size > dimensions.height) {
      setGameState('over');
      onGameOver(score);
    }

    pipesRef.current.forEach(pipe => {
      if (
        px + p.size > pipe.x &&
        px < pipe.x + pipeWidth &&
        (p.y < pipe.topHeight || p.y + p.size > pipe.topHeight + pipeGap)
      ) {
        setGameState('over');
        onGameOver(score);
      }
    });

    draw();
    if (gameState === 'playing') {
      frameRef.current = requestAnimationFrame(gameLoop);
    }
  };

  const draw = () => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, dimensions.width, dimensions.height);

    // Pipes
    ctx.fillStyle = '#10B981';
    pipesRef.current.forEach(p => {
      // Top
      ctx.fillRect(p.x, 0, pipeWidth, p.topHeight);
      // Bottom
      ctx.fillRect(p.x, p.topHeight + pipeGap, pipeWidth, dimensions.height - p.topHeight - pipeGap);
    });

    // Player
    ctx.fillStyle = '#3B82F6';
    ctx.shadowBlur = 10;
    ctx.shadowColor = '#3B82F6';
    ctx.beginPath();
    ctx.arc(50 + playerRef.current.size/2, playerRef.current.y + playerRef.current.size/2, playerRef.current.size/2, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;
  };

  useEffect(() => {
    if (gameState === 'playing') {
      frameRef.current = requestAnimationFrame(gameLoop);
    } else {
      cancelAnimationFrame(frameRef.current);
    }
    return () => cancelAnimationFrame(frameRef.current);
  }, [gameState]);

  const handleInteraction = () => {
    if (gameState === 'playing') {
      playerRef.current.velocity = playerRef.current.jump;
    }
  };

  return (
    <div className="flex flex-col h-full bg-slate-950 font-sans text-white overflow-hidden relative">
      <div className="p-6 flex items-center justify-between z-20">
        <button onClick={onBack} className="p-2 hover:bg-white/10 rounded-xl">
          <ChevronLeft className="w-5 h-5" />
        </button>
        <div className="text-right">
          <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest leading-none mb-1">Passes</p>
          <p className="text-xl font-black text-blue-400 tabular-nums leading-none">{score}</p>
        </div>
      </div>

      <div 
        ref={containerRef}
        className="flex-1 relative cursor-pointer overflow-hidden touch-none"
        onMouseDown={handleInteraction}
        onTouchStart={handleInteraction}
      >
        <canvas ref={canvasRef} width={dimensions.width} height={dimensions.height} className="w-full h-full" />

        <AnimatePresence>
          {gameState === 'start' && (
            <motion.div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm flex flex-col items-center justify-center p-6 text-center">
               <Zap className="w-16 h-16 text-yellow-500 mb-6 animate-pulse" />
               <h2 className="text-3xl font-black mb-2 uppercase italic italic">Orbin Dash</h2>
               <p className="text-slate-400 text-sm mb-8">Ketuk untuk terbang dan lewati celah rintangan!</p>
               <button onClick={resetGame} className="px-8 py-4 bg-blue-600 rounded-2xl font-black flex items-center gap-3">
                  Mulai Terbang
               </button>
            </motion.div>
          )}

          {gameState === 'over' && (
            <motion.div className="absolute inset-0 bg-slate-950/95 flex flex-col items-center justify-center p-6 text-center">
               <AlertTriangle className="w-16 h-16 text-red-500 mb-6" />
               <h2 className="text-4xl font-black mb-2 uppercase italic text-red-500">Kandas!</h2>
               <p className="text-2xl font-black mb-8">{score} Rintangan</p>
               <div className="flex gap-4">
                  <button onClick={resetGame} className="px-8 py-4 bg-blue-600 rounded-2xl font-black flex items-center gap-3">
                     <RefreshCw className="w-5 h-5" /> Coba Lagi
                  </button>
               </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
