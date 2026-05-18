import React from 'react';
import { cn } from '../../lib/utils';

interface OrbinLogoProps {
  className?: string;
  size?: number;
}

export default function OrbinLogo({ className, size = 40 }: OrbinLogoProps) {
  return (
    <div 
      className={cn(
        "relative flex items-center justify-center select-none overflow-hidden rounded-xl border border-gray-200 dark:border-white/10 shadow-md bg-slate-900", 
        className
      )}
      style={{ width: size, height: size }}
    >
      <img 
        src="/logo.png" 
        alt="ORBIN Logo" 
        className="w-full h-full object-cover scale-110"
        onError={(e) => {
          // Fallback if image fails to load
          const target = e.target as HTMLImageElement;
          target.style.display = 'none';
          target.parentElement!.innerHTML = `
            <div class="w-full h-full bg-slate-800 rounded-lg flex items-center justify-center border border-white/10 shadow-lg">
              <span class="font-black text-xl bg-gradient-to-br from-blue-400 to-indigo-400 bg-clip-text text-transparent">O</span>
            </div>
          `;
        }}
      />
    </div>
  );
}
