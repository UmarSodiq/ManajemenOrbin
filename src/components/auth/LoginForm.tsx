/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { LogIn, User, Lock, Users, UserPlus } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { cn } from '../../lib/utils';
import { motion, AnimatePresence } from 'motion/react';
import RegisterForm from './RegisterForm';

export default function LoginForm() {
  const [isRegistering, setIsRegistering] = useState(false);
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
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-slate-950 p-4 transition-colors duration-300">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl shadow-xl overflow-hidden border border-gray-200 dark:border-slate-800"
      >
        <div className="bg-white dark:bg-slate-900 p-8 pb-4 text-center border-b border-gray-100 dark:border-slate-800">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-blue-600 mb-6 shadow-lg shadow-blue-200 dark:shadow-none">
            <Users className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight uppercase">Remaja Britania Nglempong</h1>
          <p className="text-gray-400 dark:text-slate-500 text-[10px] mt-2 font-mono uppercase tracking-[0.2em] font-bold">Portal Anggota Resmi</p>
        </div>

        <AnimatePresence mode="wait">
          {!isRegistering ? (
            <motion.div 
              key="login"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="p-8 pt-10"
            >
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block text-[11px] font-bold text-gray-400 dark:text-slate-500 uppercase tracking-widest mb-2">Username</label>
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 dark:text-slate-600" />
                    <input
                      type="text"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      className="w-full pl-12 pr-4 py-3 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600 dark:focus:ring-blue-500 focus:border-transparent transition-all placeholder:text-gray-300 dark:placeholder:text-slate-600 text-slate-900 dark:text-white"
                      placeholder="Masukkan username"
                      maxLength={50}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-gray-400 dark:text-slate-500 uppercase tracking-widest mb-2">Password</label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 dark:text-slate-600" />
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full pl-12 pr-4 py-3 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600 dark:focus:ring-blue-500 focus:border-transparent transition-all placeholder:text-gray-300 dark:placeholder:text-slate-600 text-slate-900 dark:text-white"
                      placeholder="********"
                      minLength={8}
                    />
                  </div>
                </div>

                {localError && (
                  <motion.div 
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-4 rounded-xl text-[13px] font-medium border border-red-100 dark:border-red-900/30 flex items-center gap-3"
                  >
                    <div className="w-1 h-4 bg-red-600 dark:bg-red-400 rounded-full" />
                    {localError}
                  </motion.div>
                )}

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-slate-900 dark:bg-blue-600 hover:bg-slate-800 dark:hover:bg-blue-700 text-white py-4 rounded-xl font-bold flex items-center justify-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed group shadow-sm"
                >
                  {isSubmitting ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      Portal Masuk
                      <LogIn className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </>
                  )}
                </button>
              </form>

              <div className="mt-8 pt-6 border-t border-gray-100 dark:border-slate-800 text-center">
                <p className="text-gray-500 dark:text-slate-400 text-sm">Belum punya akun?</p>
                <button 
                  onClick={() => setIsRegistering(true)}
                  className="mt-2 text-blue-600 dark:text-blue-400 font-bold hover:underline flex items-center gap-2 mx-auto justify-center"
                >
                  <UserPlus className="w-4 h-4" />
                  Daftar Sebagai Anggota
                </button>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="register"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              <RegisterForm onBack={() => setIsRegistering(false)} />
            </motion.div>
          )}
        </AnimatePresence>
        
        <div className="px-8 pb-8 text-center">
          <p className="text-gray-400 dark:text-slate-600 text-[10px] font-mono font-bold tracking-widest uppercase">
            Secure Interface &copy; 2026 Alpha-7
          </p>
        </div>
      </motion.div>
    </div>
  );
}
