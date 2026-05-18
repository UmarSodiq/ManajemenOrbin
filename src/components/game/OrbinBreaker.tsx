import React, { useRef, useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { RefreshCw, Play, AlertTriangle, ChevronLeft, Shield } from 'lucide-react';

interface Brick {
  x: number;
  y: number;
  active: boolean;
  color: string;
}

export default function OrbinBreaker({ onBack }: { onBack: () => void }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [gameState, setGameState] = useState<'start' | 'playing' | 'over' | 'win'>('start');
  const [score, setScore] = useState(0);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

  const paddleRef = useRef({ x: 0, width: 100, height: 10 });
  const ballRef = useRef({ x: 0, y: 0, vx: 3, vy: -3, radius: 6 });
  const bricksRef = useRef<Brick[]>([]);
  const frameRef = useRef<number>(0);

  useEffect(() => {
    const handleResize = () => {
      if (containerRef.current) {
        setDimensions({ width: containerRef.current.clientWidth, height: containerRef.current.clientHeight });
      }
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const resetGame = () => {
    setScore(0);
    const w = dimensions.width;
    const h = dimensions.height;
    
    paddleRef.current.x = w / 2 - 50;
    ballRef.current = { x: w / 2, y: h - 50, vx: 3, vy: -3, radius: 7 };
    
    bricksRef.current = [];
    const rows = 5;
    const cols = Math.floor(w / 65);
    const colors = ['#ef4444', '#f59e0b', '#10b981', '#3b82f6', '#8b5cf6'];
    
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        bricksRef.current.push({
          x: c * 65 + (w - cols * 65) / 2,
          y: r * 25 + 60,
          active: true,
          color: colors[r % colors.length]
        });
      }
    }
    setGameState('playing');
  };

  const gameLoop = () => {
    const b = ballRef.current;
    const p = paddleRef.current;
    const w = dimensions.width;
    const h = dimensions.height;

    // Movement
    b.x += b.vx;
    b.y += b.vy;

    // Wall collision
    if (b.x + b.radius > w || b.x - b.radius < 0) b.vx *= -1;
    if (b.y - b.radius < 0) b.vy *= -1;
    
    // Paddle collision
    if (b.y + b.radius > h - 30 && b.x > p.x && b.x < p.x + p.width) {
      b.vy = -Math.abs(b.vy);
      // Add angle based on hit position
      const hitPos = (b.x - (p.x + p.width / 2)) / (p.width / 2);
      b.vx = hitPos * 4;
    }

    // Brick collision
    bricksRef.current.forEach(brick => {
      if (brick.active) {
        if (b.x > brick.x && b.x < brick.x + 60 && b.y > brick.y && b.y < brick.y + 20) {
          brick.active = false;
          b.vy *= -1;
          setScore(s => s + 50);
        }
      }
    });

    // Game Over
    if (b.y > h) {
      setGameState('over');
    }

    // Win check
    if (bricksRef.current.every(b => !b.active)) {
      setGameState('win');
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

    // Paddle
    ctx.fillStyle = '#3b82f6';
    ctx.beginPath();
    ctx.roundRect(paddleRef.current.x, dimensions.height - 30, paddleRef.current.width, paddleRef.current.height, 5);
    ctx.fill();

    // Ball
    ctx.fillStyle = 'white';
    ctx.beginPath();
    ctx.arc(ballRef.current.x, ballRef.current.y, ballRef.current.radius, 0, Math.PI * 2);
    ctx.fill();

    // Bricks
    bricksRef.current.forEach(brick => {
      if (brick.active) {
        ctx.fillStyle = brick.color;
        ctx.beginPath();
        ctx.roundRect(brick.x, brick.y, 60, 20, 4);
        ctx.fill();
      }
    });
  };

  useEffect(() => {
    if (gameState === 'playing') {
      frameRef.current = requestAnimationFrame(gameLoop);
    } else {
      cancelAnimationFrame(frameRef.current);
    }
    return () => cancelAnimationFrame(frameRef.current);
  }, [gameState]);

  const handleMouseMove = (e: React.MouseEvent) => {
    if (gameState !== 'playing' || !containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left - paddleRef.current.width / 2;
    paddleRef.current.x = Math.max(0, Math.min(x, dimensions.width - paddleRef.current.width));
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (gameState !== 'playing' || !containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = e.touches[0].clientX - rect.left - paddleRef.current.width / 2;
    paddleRef.current.x = Math.max(0, Math.min(x, dimensions.width - paddleRef.current.width));
  };

  return (
    <div className="flex flex-col h-full bg-slate-950 text-white overflow-hidden font-sans">
      <div className="p-6 flex items-center justify-between border-b border-white/5">
         <button onClick={onBack} className="p-2 hover:bg-white/10 rounded-xl">
           <ChevronLeft className="w-5 h-5" />
         </button>
         <div>
            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest text-center">Score</p>
            <p className="text-xl font-black text-blue-400 leading-none">{score}</p>
         </div>
         <div className="w-10" />
      </div>

      <div 
        ref={containerRef}
        className="flex-1 relative cursor-crosshair touch-none"
        onMouseMove={handleMouseMove}
        onTouchMove={handleTouchMove}
      >
        <canvas ref={canvasRef} width={dimensions.width} height={dimensions.height} className="w-full h-full" />
        
        <AnimatePresence>
           {gameState === 'start' && (
             <motion.div className="absolute inset-0 bg-slate-950/80 backdrop-blur-md flex flex-col items-center justify-center p-8 text-center">
                <Shield className="w-16 h-16 text-blue-500 mb-6" />
                <h2 className="text-3xl font-black uppercase italic mb-2">Orbin Breaker</h2>
                <p className="text-slate-400 text-sm mb-12">Gunakan paddle untuk memantulkan bola dan hancurkan semua balok!</p>
                <button onClick={resetGame} className="px-10 py-5 bg-blue-600 rounded-3xl font-black uppercase shadow-xl shadow-blue-600/30">Mulai Bermain</button>
             </motion.div>
           )}

           {(gameState === 'over' || gameState === 'win') && (
             <motion.div className="absolute inset-0 bg-slate-950/95 flex flex-col items-center justify-center p-8 text-center">
                {gameState === 'over' ? (
                  <>
                    <AlertTriangle className="w-16 h-16 text-red-500 mb-6" />
                    <h2 className="text-4xl font-black uppercase text-red-500 italic mb-2">Game Over</h2>
                  </>
                ) : (
                  <>
                    <Shield className="w-16 h-16 text-emerald-500 mb-6 animate-bounce" />
                    <h2 className="text-4xl font-black uppercase text-emerald-500 italic mb-2">You Win!</h2>
                  </>
                )}
                <p className="text-2xl font-black mb-12">{score} POIN</p>
                <button onClick={resetGame} className="px-10 py-5 bg-white text-slate-900 rounded-3xl font-black uppercase">Main Lagi</button>
             </motion.div>
           )}
        </AnimatePresence>
      </div>
    </div>
  );
}
