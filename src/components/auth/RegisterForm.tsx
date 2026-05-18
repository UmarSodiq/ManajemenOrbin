/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { UserPlus, User, Lock, Users, ArrowLeft } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { motion } from 'motion/react';

interface RegisterFormProps {
  onBack: () => void;
}

export default function RegisterForm({ onBack }: RegisterFormProps) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);
  
  const { register } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError(null);
    
    if (username.length < 3) {
      setLocalError('Username minimal 3 karakter');
      return;
    }

    if (password.length < 8) {
      setLocalError('Password minimal 8 karakter');
      return;
    }

    if (password !== confirmPassword) {
      setLocalError('Konfirmasi password tidak cocok');
      return;
    }

    setIsSubmitting(true);
    try {
      await register(username, password);
      setIsSuccess(true);
    } catch (err: any) {
      if (err.code === 'auth/email-already-in-use') {
        setLocalError('Username sudah digunakan oleh orang lain.');
      } else {
        setLocalError(err.message || 'Terjadi kesalahan sistem saat registrasi');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="p-8 text-center bg-white dark:bg-slate-900 rounded-3xl">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-green-100 dark:bg-green-900/40 mb-6">
          <UserPlus className="w-8 h-8 text-green-600 dark:text-green-400" />
        </div>
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Pendaftaran Berhasil!</h2>
        <p className="text-gray-500 dark:text-slate-400 text-sm mb-8">Akun Anda telah berhasil dibuat sebagai Anggota.</p>
        <button
          onClick={() => window.location.reload()}
          className="w-full bg-slate-900 dark:bg-blue-600 text-white py-4 rounded-xl font-bold transition-all"
        >
          Masuk ke Dashboard
        </button>
      </div>
    );
  }

  return (
    <div className="p-8">
      <button 
        onClick={onBack}
        className="flex items-center gap-2 text-gray-400 dark:text-slate-500 hover:text-slate-900 dark:hover:text-white text-sm font-bold mb-8 transition-colors group"
      >
        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
        Kembali ke Login
      </button>

      <div className="text-center mb-10">
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">Daftar Akun Baru</h2>
        <p className="text-gray-400 dark:text-slate-500 text-xs mt-2 uppercase tracking-widest font-mono">Pendaftaran Anggota Remaja Britania Nglempong</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-[11px] font-bold text-gray-400 dark:text-slate-500 uppercase tracking-widest mb-2">Pilih Username</label>
          <div className="relative">
            <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 dark:text-slate-600" />
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600 dark:focus:ring-blue-500 focus:border-transparent transition-all placeholder:text-gray-300 dark:placeholder:text-slate-600 text-slate-900 dark:text-white"
              placeholder="Username anda"
              maxLength={20}
            />
          </div>
          <p className="text-[10px] text-gray-400 dark:text-slate-500 mt-1.5 ml-1 italic">* Jangan gunakan spasi</p>
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
              placeholder="Minimal 8 karakter"
              minLength={8}
            />
          </div>
        </div>

        <div>
          <label className="block text-[11px] font-bold text-gray-400 dark:text-slate-500 uppercase tracking-widest mb-2">Ulangi Password</label>
          <div className="relative">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 dark:text-slate-600" />
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600 dark:focus:ring-blue-500 focus:border-transparent transition-all placeholder:text-gray-300 dark:placeholder:text-slate-600 text-slate-900 dark:text-white"
              placeholder="Konfirmasi password"
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
          className="w-full bg-blue-600 dark:bg-blue-600 hover:bg-blue-700 dark:hover:bg-blue-700 text-white py-4 rounded-xl font-bold flex items-center justify-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-blue-100 dark:shadow-none"
        >
          {isSubmitting ? (
            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            <>
              Buat Akun Sekarang
              <UserPlus className="w-5 h-5" />
            </>
          )}
        </button>
      </form>
    </div>
  );
}
