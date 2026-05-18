import React, { useRef, useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { RefreshCw, Play, AlertTriangle, ChevronLeft, ArrowUp } from 'lucide-react';
import OrbinLogo from '../shared/OrbinLogo';

interface Platform {
  x: number;
  y: number;
  width: number;
  height: number;
}

interface OrbinJumpProps {
  onGameOver: (score: number) => void;
  highScore: number;
  onBack: () => void;
}

export default function OrbinJump({ onGameOver, highScore, onBack }: OrbinJumpProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  
  const [gameState, setGameState] = useState<'start' | 'playing' | 'over'>('start');
  const [score, setScore] = useState(0);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

  const playerRef = useRef({
    x: 0,
    y: 0,
    width: 30,
    height: 30,
    vy: 0,
    vx: 0,
    jumpStrength: -10,
    gravity: 0.35
  });

  const platformsRef = useRef<Platform[]>([]);
  const frameRef = useRef<number>(0);
  const lastTimeRef = useRef<number>(0);
  const scrollYRef = useRef(0);

  useEffect(() => {
    const handleResize = () => {
      if (containerRef.current) {
        const { clientWidth, clientHeight } = containerRef.current;
        setDimensions({ width: clientWidth, height: clientHeight });
      }
    };
    handleResize();
    const observer = new ResizeObserver(handleResize);
    if (containerRef.current) observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  const resetGame = () => {
    setScore(0);
    scrollYRef.current = 0;
    
    // Initial platforms
    platformsRef.current = [];
    const count = 10;
    for (let i = 0; i < count; i++) {
        platformsRef.current.push({
            x: Math.random() * (dimensions.width - 60),
            y: dimensions.height - (i * 100) - 50,
            width: 60,
            height: 10
        });
    }

    playerRef.current = {
      x: dimensions.width / 2,
      y: dimensions.height - 100,
      width: 30,
      height: 30,
      vy: 0,
      vx: 0,
      jumpStrength: -10,
      gravity: 0.35
    };
    
    setGameState('playing');
  };

  const gameLoop = (time: number) => {
    const deltaTime = time - lastTimeRef.current;
    lastTimeRef.current = time;

    // Movement
    playerRef.current.vy += playerRef.current.gravity;
    playerRef.current.y += playerRef.current.vy;
    playerRef.current.x += playerRef.current.vx;

    // Boundary wrap
    if (playerRef.current.x < -playerRef.current.width) playerRef.current.x = dimensions.width;
    if (playerRef.current.x > dimensions.width) playerRef.current.x = -playerRef.current.width;

    // Platform collision (only when falling)
    if (playerRef.current.vy > 0) {
      platformsRef.current.forEach(p => {
        if (
          playerRef.current.x + playerRef.current.width > p.x &&
          playerRef.current.x < p.x + p.width &&
          playerRef.current.y + playerRef.current.height > p.y &&
          playerRef.current.y + playerRef.current.height < p.y + p.height + playerRef.current.vy
        ) {
          playerRef.current.y = p.y - playerRef.current.height;
          playerRef.current.vy = playerRef.current.jumpStrength;
        }
      });
    }

    // Scroll
    if (playerRef.current.y < dimensions.height / 2) {
      const diff = dimensions.height / 2 - playerRef.current.y;
      playerRef.current.y = dimensions.height / 2;
      scrollYRef.current += diff;
      setScore(Math.floor(scrollYRef.current / 10));

      platformsRef.current.forEach(p => {
        p.y += diff;
      });

      // Remove old platforms and add new ones
      platformsRef.current = platformsRef.current.filter(p => p.y < dimensions.height);
      while (platformsRef.current.length < 10) {
          const lastY = platformsRef.current[platformsRef.current.length - 1]?.y || 0;
          platformsRef.current.push({
              x: Math.random() * (dimensions.width - 60),
              y: lastY - 100 - (Math.random() * 20),
              width: 60,
              height: 10
          });
      }
    }

    // Game Over
    if (playerRef.current.y > dimensions.height) {
      setGameState('over');
      onGameOver(score);
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

    ctx.clearRect(0, 0, dimensions.width, dimensions.height);

    // Platforms
    ctx.fillStyle = '#10B981';
    platformsRef.current.forEach(p => {
      ctx.fillRect(p.x, p.y, p.width, p.height);
    });

    // Player
    ctx.fillStyle = '#3B82F6';
    ctx.beginPath();
    ctx.roundRect(playerRef.current.x, playerRef.current.y, playerRef.current.width, playerRef.current.height, 8);
    ctx.fill();
    
    // Eyes
    ctx.fillStyle = 'white';
    ctx.beginPath();
    ctx.arc(playerRef.current.x + 8, playerRef.current.y + 10, 3, 0, Math.PI * 2);
    ctx.arc(playerRef.current.x + 22, playerRef.current.y + 10, 3, 0, Math.PI * 2);
    ctx.fill();
  };

  useEffect(() => {
    if (gameState === 'playing') {
      lastTimeRef.current = performance.now();
      frameRef.current = requestAnimationFrame(gameLoop);
    } else {
      cancelAnimationFrame(frameRef.current);
    }
    return () => cancelAnimationFrame(frameRef.current);
  }, [gameState]);

  const handleMouseMove = (e: React.MouseEvent) => {
    if (gameState !== 'playing') return;
    const rect = canvasRef.current?.getBoundingClientRect();
    if (rect) {
      const relX = e.clientX - rect.left;
      playerRef.current.vx = (relX - playerRef.current.x - playerRef.current.width/2) * 0.08;
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (gameState !== 'playing') return;
    const rect = canvasRef.current?.getBoundingClientRect();
    if (rect && e.touches[0]) {
      const relX = e.touches[0].clientX - rect.left;
      playerRef.current.vx = (relX - playerRef.current.x - playerRef.current.width/2) * 0.08;
    }
  };

  return (
    <div className="flex flex-col h-full bg-slate-900 font-sans text-white overflow-hidden relative">
      <div className="p-6 flex items-center justify-between z-20">
        <button onClick={onBack} className="p-2 hover:bg-white/10 rounded-xl transition-colors">
          <ChevronLeft className="w-5 h-5" />
        </button>
        <div className="text-right">
          <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest leading-none mb-1">Height</p>
          <p className="text-xl font-black text-emerald-400 tabular-nums leading-none">{score}m</p>
        </div>
      </div>

      <div 
        ref={containerRef}
        className="flex-1 relative overflow-hidden touch-none"
        onMouseMove={handleMouseMove}
        onTouchMove={handleTouchMove}
      >
        <canvas 
          ref={canvasRef}
          width={dimensions.width}
          height={dimensions.height}
          className="w-full h-full"
        />

        <AnimatePresence>
          {gameState === 'start' && (
            <motion.div className="absolute inset-0 bg-slate-900/80 backdrop-blur-sm flex flex-col items-center justify-center p-6 z-30">
               <ArrowUp className="w-16 h-16 text-emerald-500 mb-6 animate-bounce" />
               <h2 className="text-3xl font-black mb-2 uppercase italic">Orbin Jump</h2>
               <p className="text-slate-400 text-sm mb-8 text-center">Tahan & geser untuk melompat setinggi-tingginya!</p>
               <button onClick={resetGame} className="px-8 py-4 bg-emerald-600 rounded-2xl font-black flex items-center gap-3">
                  Mulai Lompat
               </button>
            </motion.div>
          )}

          {gameState === 'over' && (
            <motion.div className="absolute inset-0 bg-slate-950/95 flex flex-col items-center justify-center p-6 z-40">
               <AlertTriangle className="w-16 h-16 text-red-500 mb-6" />
               <h2 className="text-4xl font-black mb-2 uppercase italic text-red-500">Terjatuh!</h2>
               <p className="text-2xl font-black mb-8">{score}m</p>
               <div className="flex gap-4">
                  <button onClick={resetGame} className="px-8 py-4 bg-emerald-600 rounded-2xl font-black flex items-center gap-3">
                     <RefreshCw className="w-5 h-5" /> Main Lagi
                  </button>
               </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
