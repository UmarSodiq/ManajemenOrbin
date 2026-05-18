import React from 'react';
import { Sun, Moon, Cloud, Sunrise, Coffee } from 'lucide-react';

interface GreetingProps {
  name: string;
}

export default function DynamicGreeting({ name }: GreetingProps) {
  const hour = new Date().getHours();
  
  let greeting = {
    text: "Halo",
    subtext: "Semangat Membangun Desa!",
    icon: <Sun className="w-6 h-6 text-yellow-500" />,
    color: "from-blue-500 to-indigo-600"
  };

  if (hour >= 5 && hour < 10) {
    greeting = {
      text: "Selamat Pagi",
      subtext: "Awali hari dengan kopi dan semangat baru!",
      icon: <Sunrise className="w-6 h-6 text-orange-400" />,
      color: "from-orange-400 to-yellow-500"
    };
  } else if (hour >= 10 && hour < 15) {
    greeting = {
      text: "Selamat Siang",
      subtext: "Teruslah produktif untuk organisasi kita!",
      icon: <Sun className="w-6 h-6 text-yellow-500" />,
      color: "from-yellow-400 to-orange-500"
    };
  } else if (hour >= 15 && hour < 18) {
    greeting = {
      text: "Selamat Sore",
      subtext: "Waktunya bersantai sejenak, evaluasi hari ini.",
      icon: <Cloud className="w-6 h-6 text-blue-300" />,
      color: "from-blue-400 to-indigo-500"
    };
  } else {
    greeting = {
      text: "Selamat Malam",
      subtext: "Istirahat yang cukup, ORBIN butuh energimu besok.",
      icon: <Moon className="w-6 h-6 text-indigo-400" />,
      color: "from-indigo-600 to-slate-900"
    };
  }

  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
      <div className="flex items-center gap-4">
        <div className={`w-14 h-14 rounded-3xl bg-gradient-to-br ${greeting.color} flex items-center justify-center shadow-lg shadow-blue-500/20`}>
          {greeting.icon}
        </div>
        <div>
          <h1 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white uppercase">
            {greeting.text}, <span className="text-blue-600 dark:text-blue-400">{name}</span>
          </h1>
          <p className="text-sm text-gray-500 dark:text-slate-400 font-medium">{greeting.subtext}</p>
        </div>
      </div>
      
      <div className="hidden lg:flex items-center gap-3 px-6 py-3 bg-white dark:bg-slate-950 border border-gray-100 dark:border-slate-800 rounded-2xl shadow-sm">
        <Coffee className="w-4 h-4 text-blue-500" />
        <span className="text-xs font-bold text-gray-400 dark:text-slate-500 uppercase tracking-widest">ORBIN System v2.0</span>
      </div>
    </div>
  );
}
