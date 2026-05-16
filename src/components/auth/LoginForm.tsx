/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { LogIn, User, Lock, Users } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { cn } from '../../lib/utils';
import { motion } from 'motion/react';

export default function LoginForm() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);
  
  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError(null);
    
    if (username.length === 0 || password.length === 0) {
      setLocalError('Username dan password wajib diisi');
      return;
    }

    if (password.length < 8) {
      setLocalError('Password minimal 8 karakter');
      return;
    }

    setIsSubmitting(true);
    try {
      await login(username, password);
    } catch (err: any) {
      if (err.code === 'auth/operation-not-allowed') {
        setLocalError('Fitur Email/Password belum diaktifkan di Firebase Console. Silakan aktifkan di menu Authentication > Sign-in method.');
      } else if (err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password' || err.code === 'auth/invalid-credential') {
        setLocalError('Username atau password tidak terdaftar / salah.');
      } else {
        setLocalError(err.message || 'Terjadi kesalahan sistem saat login');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--bg-main)] transition-colors p-4">
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-[340px] bg-[var(--bg-card)] border border-[var(--border-base)] shadow-2xl relative overflow-hidden rounded-2xl"
      >
        <div className="absolute top-0 left-0 w-full h-1 bg-slate-900 dark:bg-blue-600" />
        
        <div className="p-4 pb-0 text-center">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-slate-900 dark:bg-blue-600 mb-4 shadow-xl shadow-slate-200 dark:shadow-blue-900/20 relative group">
            <div className="absolute inset-0 bg-blue-500 rounded-xl blur-lg opacity-0 group-hover:opacity-20 transition-opacity" />
            <Users className="w-5 h-5 text-white relative z-10" />
            <div className="absolute -bottom-0.5 -right-0.5 w-4.5 h-4.5 bg-blue-600 border-2 border-white dark:border-slate-800 rounded-full" />
          </div>
          <h1 className="text-base font-black text-slate-900 dark:text-white tracking-tighter uppercase leading-none">ORBIN PUSAT</h1>
          <p className="text-slate-400 text-[7px] font-mono mt-1.5 uppercase tracking-[0.3em] font-bold">Operasi Terenkripsi</p>
        </div>

        <div className="p-5 pt-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between items-center px-1">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Identitas</label>
                <span className="text-[9px] font-mono text-slate-300">ID PENGGUNA</span>
              </div>
              <div className="relative group">
                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-slate-900 dark:group-focus-within:text-white transition-colors" />
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50/50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-900/5 dark:focus:ring-blue-500/10 focus:border-slate-900 dark:focus:border-blue-500 transition-all font-medium text-xs placeholder:text-slate-300 dark:text-white"
                  placeholder="USERNAME"
                  maxLength={50}
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex justify-between items-center px-1">
                <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Kunci Rahasia</label>
                <span className="text-[8px] font-mono text-slate-300">KATA SANDI</span>
              </div>
              <div className="relative group">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-slate-900 dark:group-focus-within:text-white transition-colors" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50/50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-900/5 dark:focus:ring-blue-500/10 focus:border-slate-900 dark:focus:border-blue-500 transition-all font-medium text-xs placeholder:text-slate-300 font-mono dark:text-white"
                  placeholder="••••••••"
                  minLength={8}
                />
              </div>
            </div>

            {localError && (
              <motion.div 
                initial={{ opacity: 0, x: -4 }}
                animate={{ opacity: 1, x: 0 }}
                className="bg-red-50 dark:bg-red-900/10 text-red-600 dark:text-red-400 p-4 rounded-xl text-[12px] font-bold border border-red-100/50 flex items-start gap-3"
              >
                <div className="w-1 h-4 bg-red-500 rounded-full shrink-0 mt-0.5" />
                <p className="leading-tight uppercase tracking-tight">{localError}</p>
              </motion.div>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-slate-900 dark:bg-blue-600 hover:bg-slate-800 dark:hover:bg-blue-700 text-white py-3.5 rounded-xl font-black text-xs uppercase tracking-[0.2em] flex items-center justify-center gap-3 transition-all disabled:opacity-50 disabled:cursor-not-allowed group shadow-xl shadow-slate-200 dark:shadow-blue-900/20 active:scale-[0.98]"
            >
              {isSubmitting ? (
                <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
              ) : (
                <>
            Mulai Masuk
            <LogIn className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </>
        )}
      </button>
    </form>
    
    <div className="mt-6 flex items-center justify-between opacity-30">
      <div className="h-px bg-slate-200 dark:bg-white/10 flex-1" />
      <span className="text-[8px] font-mono font-black tracking-[0.4em] uppercase px-4 dark:text-white">PUSAT KONTROL V1.0</span>
      <div className="h-px bg-slate-200 dark:bg-white/10 flex-1" />
    </div>
  </div>
</motion.div>
    </div>
  );
}
