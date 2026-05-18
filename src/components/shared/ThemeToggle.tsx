/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Sun, Moon } from 'lucide-react';
import { useThemeStore } from '../../store/useThemeStore';
import { motion } from 'motion/react';

export default function ThemeToggle() {
  const { theme, toggleTheme } = useThemeStore();

  return (
    <motion.button
      whileTap={{ scale: 0.9 }}
      onClick={toggleTheme}
      className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 transition-all border border-slate-200 dark:border-slate-700 shadow-sm group"
      title={theme === 'light' ? 'Ganti ke Mode Gelap' : 'Ganti ke Mode Terang'}
    >
      <div className="relative w-5 h-5 flex items-center justify-center overflow-hidden">
        <motion.div
          animate={{
            y: theme === 'light' ? 0 : 25,
            opacity: theme === 'light' ? 1 : 0
          }}
          transition={{ type: 'spring', stiffness: 200, damping: 20 }}
          className="absolute"
        >
          <Sun className="w-5 h-5 text-amber-500" />
        </motion.div>
        <motion.div
          animate={{
            y: theme === 'dark' ? 0 : -25,
            opacity: theme === 'dark' ? 1 : 0
          }}
          transition={{ type: 'spring', stiffness: 200, damping: 20 }}
          className="absolute"
        >
          <Moon className="w-5 h-5 text-indigo-400" />
        </motion.div>
      </div>
      <span className="text-[10px] font-bold uppercase tracking-wider hidden sm:inline">
        {theme === 'light' ? 'Terang' : 'Gelap'}
      </span>
    </motion.button>
  );
}
