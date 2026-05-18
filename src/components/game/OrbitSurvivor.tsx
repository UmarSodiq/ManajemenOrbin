import React, { useRef, useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Trophy, RefreshCw, Play, Star, AlertTriangle, ChevronLeft } from 'lucide-react';
import OrbinLogo from '../shared/OrbinLogo';
import { GameScore } from '../../types';

interface GameObject {
  id: number;
  angle: number;
  distance: number;
  speed: number;
  size: number;
  type: 'star' | 'meteor';
}

interface OrbitSurvivorProps {
  onGameOver: (score: number) => void;
  scores: GameScore[];
  highScore: number;
  onBack: () => void;
  user: any;
}

export default function OrbitSurvivor({ onGameOver, scores, highScore, onBack, user }: OrbitSurvivorProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  
  const [gameState, setGameState] = useState<'start' | 'playing' | 'over'>('start');
  const [score, setScore] = useState(0);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

  const playerRef = useRef({ 
    angle: 0, 
    radius: 120, 
    direction: 1, 
    speed: 0.05,
    size: 15
  });
  const objectsRef = useRef<GameObject[]>([]);
  const frameRef = useRef<number>(0);
  const lastTimeRef = useRef<number>(0);
  const spawnTimerRef = useRef<number>(0);
  const nextIdRef = useRef(0);

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
    objectsRef.current = [];
    playerRef.current.angle = 0;
    playerRef.current.direction = 1;
    spawnTimerRef.current = 0;
    setGameState('playing');
  };

  const spawnObject = () => {
    const isMeteor = Math.random() > 0.4;
    const size = isMeteor ? 15 + Math.random() * 15 : 20;
    const angle = Math.random() * Math.PI * 2;
    const distance = isMeteor ? Math.max(dimensions.width, dimensions.height) / 2 : playerRef.current.radius;
    
    objectsRef.current.push({
      id: nextIdRef.current++,
      angle,
      distance,
      size,
      speed: isMeteor ? 2 + (score / 20) : 0,
      type: isMeteor ? 'meteor' : 'star'
    });
  };

  const gameLoop = (time: number) => {
    const deltaTime = time - lastTimeRef.current;
    lastTimeRef.current = time;

    playerRef.current.angle += playerRef.current.speed * playerRef.current.direction;

    spawnTimerRef.current += deltaTime;
    const spawnRate = Math.max(300, 1000 - (score * 20));
    if (spawnTimerRef.current > spawnRate) {
      spawnObject();
      spawnTimerRef.current = 0;
    }

    const cx = dimensions.width / 2;
    const cy = dimensions.height / 2;
    const px = cx + Math.cos(playerRef.current.angle) * playerRef.current.radius;
    const py = cy + Math.sin(playerRef.current.angle) * playerRef.current.radius;

    objectsRef.current = objectsRef.current.filter(obj => {
      if (obj.type === 'meteor') {
        obj.distance -= obj.speed;
      }

      const ox = cx + Math.cos(obj.angle) * obj.distance;
      const oy = cy + Math.sin(obj.angle) * obj.distance;

      const dx = ox - px;
      const dy = oy - py;
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (dist < (obj.size/2 + playerRef.current.size/2)) {
        if (obj.type === 'star') {
          setScore(s => s + 1);
          return false;
        } else {
          setGameState('over');
          onGameOver(score);
          return false;
        }
      }

      if (obj.type === 'meteor' && obj.distance < -100) return false;
      return true;
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
    const cx = dimensions.width / 2;
    const cy = dimensions.height / 2;

    ctx.strokeStyle = 'rgba(59, 130, 246, 0.2)';
    ctx.setLineDash([5, 10]);
    ctx.beginPath();
    ctx.arc(cx, cy, playerRef.current.radius, 0, Math.PI * 2);
    ctx.stroke();
    ctx.setLineDash([]);

    objectsRef.current.forEach(obj => {
      const ox = cx + Math.cos(obj.angle) * obj.distance;
      const oy = cy + Math.sin(obj.angle) * obj.distance;

      if (obj.type === 'star') {
        ctx.fillStyle = '#FBBF24';
        ctx.shadowBlur = 15;
        ctx.shadowColor = '#FBBF24';
        ctx.beginPath();
        for (let i = 0; i < 5; i++) {
          ctx.lineTo(ox + Math.cos((18 + i * 72) / 180 * Math.PI) * obj.size/2,
                     oy + Math.sin((18 + i * 72) / 180 * Math.PI) * obj.size/2);
          ctx.lineTo(ox + Math.cos((54 + i * 72) / 180 * Math.PI) * obj.size/4,
                     oy + Math.sin((54 + i * 72) / 180 * Math.PI) * obj.size/4);
        }
        ctx.closePath();
        ctx.fill();
        ctx.shadowBlur = 0;
      } else {
        ctx.fillStyle = '#EF4444';
        ctx.shadowBlur = 10;
        ctx.shadowColor = '#EF4444';
        ctx.beginPath();
        ctx.arc(ox, oy, obj.size / 2, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;
      }
    });

    const px = cx + Math.cos(playerRef.current.angle) * playerRef.current.radius;
    const py = cy + Math.sin(playerRef.current.angle) * playerRef.current.radius;

    ctx.fillStyle = '#3B82F6';
    ctx.shadowBlur = 20;
    ctx.shadowColor = '#3B82F6';
    ctx.beginPath();
    ctx.arc(px, py, playerRef.current.size / 2, 0, Math.PI * 2);
    ctx.fill();
    
    ctx.strokeStyle = 'white';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(px, py, playerRef.current.size / 4, 0, Math.PI * 2);
    ctx.stroke();
    ctx.shadowBlur = 0;
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

  const handleInteraction = () => {
    if (gameState === 'playing') {
      playerRef.current.direction *= -1;
    }
  };

  return (
    <div className="flex flex-col h-full bg-slate-950 font-sans text-white overflow-hidden relative">
      <div className="p-6 flex items-center justify-between z-20 backdrop-blur-md bg-slate-950/50">
        <div className="flex items-center gap-4">
          <button onClick={onBack} className="p-2 hover:bg-white/10 rounded-xl transition-colors">
            <ChevronLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-lg font-black tracking-tighter uppercase flex items-center gap-2">
              Orbit Survivor
            </h1>
          </div>
        </div>
        <div className="flex items-center gap-6">
          <div className="text-center">
            <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest leading-none mb-1">Score</p>
            <p className="text-xl font-black text-blue-400 tabular-nums leading-none">{score}</p>
          </div>
          <div className="text-center opacity-50 hidden sm:block">
            <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest leading-none mb-1">Best</p>
            <p className="text-xl font-black text-white tabular-nums leading-none">{highScore}</p>
          </div>
        </div>
      </div>

      <div 
        ref={containerRef}
        className="flex-1 relative cursor-pointer select-none overflow-hidden touch-none"
        onMouseDown={handleInteraction}
        onTouchStart={handleInteraction}
      >
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-10">
           <OrbinLogo size={200} className="grayscale brightness-0 invert" />
        </div>

        <canvas 
          ref={canvasRef}
          width={dimensions.width}
          height={dimensions.height}
          className="w-full h-full"
        />

        <AnimatePresence>
          {gameState === 'start' && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm flex flex-col items-center justify-center p-6 z-30"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="relative mb-8">
                 <div className="absolute inset-0 bg-blue-500/20 blur-3xl rounded-full" />
                 <OrbinLogo size={100} className="relative z-10" />
              </div>
              <h2 className="text-3xl font-black mb-2 tracking-tighter uppercase italic">Ready to Orbit?</h2>
              <p className="text-slate-400 text-sm max-w-xs mb-8 text-center font-medium">Klik untuk merubah arah putaran dan hindari meteor!</p>
              
              <button 
                onClick={resetGame}
                className="group relative px-8 py-4 bg-blue-600 rounded-2xl font-black text-lg uppercase tracking-tight flex items-center gap-3 hover:bg-blue-500 transition-all"
              >
                <Play className="w-5 h-5 fill-current" />
                Mulai Orbit
              </button>
            </motion.div>
          )}

          {gameState === 'over' && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="absolute inset-0 bg-slate-950/90 backdrop-blur-xl flex flex-col items-center justify-center p-6 z-30"
              onClick={(e) => e.stopPropagation()}
            >
              <AlertTriangle className="w-16 h-16 text-red-500 mb-6" />
              <h2 className="text-4xl font-black mb-2 tracking-tighter uppercase italic text-red-500">Orbit Hancur!</h2>
              <p className="text-2xl font-black mb-8">{score} Poin</p>
              
              <div className="flex gap-4">
                <button 
                  onClick={resetGame}
                  className="px-8 py-4 bg-white text-slate-900 rounded-2xl font-black flex items-center gap-3"
                >
                  <RefreshCw className="w-5 h-5" />
                  Coba Lagi
                </button>
                <button 
                  onClick={onBack}
                  className="px-8 py-4 bg-white/10 rounded-2xl font-black"
                >
                  Menu Utama
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
