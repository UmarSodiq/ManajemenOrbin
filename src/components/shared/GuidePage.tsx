/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { 
  BookOpen, 
  Wallet, 
  Users, 
  Calendar, 
  FileText, 
  Megaphone, 
  ArrowUpCircle, 
  ArrowDownCircle,
  HelpCircle,
  Info
} from 'lucide-react';
import { motion } from 'motion/react';
import { useAuth } from '../../hooks/useAuth';

export default function GuidePage() {
  const { role } = useAuth();

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  return (
    <div className="p-8 max-w-5xl mx-auto">
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-12"
      >
        <div className="flex items-center gap-4 mb-4">
          <div className="p-3 bg-blue-100 text-blue-600 rounded-2xl">
            <BookOpen className="w-8 h-8" />
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-slate-900">Petunjuk Penggunaan</h1>
            <p className="text-gray-500 mt-1">Panduan lengkap menggunakan sistem Organisasi Remaja Britania Nglempong.</p>
          </div>
        </div>
      </motion.div>

      <motion.div 
        variants={container}
        initial="hidden"
        animate="show"
        className="space-y-12"
      >
        {/* Intro */}
        <motion.section variants={item} className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm">
          <div className="flex items-center gap-3 mb-4 text-blue-600">
            <Info className="w-6 h-6" />
            <h2 className="text-xl font-bold">Pendahuluan</h2>
          </div>
          <p className="text-gray-600 leading-relaxed">
            Aplikasi ini dirancang untuk memudahkan manajemen administrasi dan keuangan Organisasi Remaja Britania Nglempong. 
            Sistem dibagi menjadi dua akses utama: <span className="font-bold text-slate-900">Bendahara</span> dan <span className="font-bold text-slate-900">Sekretaris</span>. 
            Setiap peran memiliki fitur khusus yang saling terintegrasi secara real-time.
          </p>
        </motion.section>

        {/* Bendahara Section */}
        {(role === 'bendahara' || !role) && (
          <motion.section variants={item} className="space-y-6">
            <div className="flex items-center gap-3 px-4">
              <Wallet className="w-6 h-6 text-emerald-600" />
              <h2 className="text-2xl font-bold text-slate-900">Panduan Bendahara</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm border-l-4 border-l-emerald-500">
                <div className="flex items-center gap-2 mb-3 font-bold text-slate-900">
                  <ArrowUpCircle className="w-5 h-5 text-emerald-500" />
                  Kas Masuk & Iuran
                </div>
                <ul className="text-sm text-gray-600 space-y-2 list-disc pl-5">
                  <li>Gunakan menu <span className="font-medium text-slate-900">Kas Masuk</span> untuk mencatat pendapatan di luar iuran warga.</li>
                  <li>Menu <span className="font-medium text-slate-900">Iuran</span> digunakan khusus untuk mencatat iuran rutin anggota. Anda dapat memilih nama anggota dari daftar yang ada.</li>
                  <li>Setiap input akan otomatis memperbarui saldo total di dashboard.</li>
                </ul>
              </div>

              <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm border-l-4 border-l-red-500">
                <div className="flex items-center gap-2 mb-3 font-bold text-slate-900">
                  <ArrowDownCircle className="w-5 h-5 text-red-500" />
                  Kas Keluar
                </div>
                <ul className="text-sm text-gray-600 space-y-2 list-disc pl-5">
                  <li>Catat semua pengeluaran organisasi dengan detail keterangan dan nominal.</li>
                  <li>Pastikan nominal yang diinput benar sebelum menekan tombol simpan.</li>
                  <li>Data pengeluaran akan ditampilkan dalam bentuk daftar kronologis.</li>
                </ul>
              </div>

              <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm border-l-4 border-l-blue-500 md:col-span-2">
                <div className="flex items-center gap-2 mb-3 font-bold text-slate-900">
                  <FileText className="w-5 h-5 text-blue-500" />
                  Laporan Keuangan
                </div>
                <p className="text-sm text-gray-600 mb-4">
                  Fitur ini menyediakan ringkasan otomatis dari seluruh transaksi. Anda dapat melihat:
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="bg-blue-50 p-4 rounded-2xl text-center">
                    <p className="text-[10px] uppercase font-bold text-blue-500 mb-1">Total Masuk</p>
                    <p className="text-lg font-bold text-blue-700">Otomatis</p>
                  </div>
                  <div className="bg-red-50 p-4 rounded-2xl text-center">
                    <p className="text-[10px] uppercase font-bold text-red-500 mb-1">Total Keluar</p>
                    <p className="text-lg font-bold text-red-700">Otomatis</p>
                  </div>
                  <div className="bg-emerald-50 p-4 rounded-2xl text-center">
                    <p className="text-[10px] uppercase font-bold text-emerald-500 mb-1">Saldo Akhir</p>
                    <p className="text-lg font-bold text-emerald-700">Real-time</p>
                  </div>
                </div>
              </div>
            </div>
          </motion.section>
        )}

        {/* Sekretaris Section */}
        {(role === 'sekretaris' || !role) && (
          <motion.section variants={item} className="space-y-6">
            <div className="flex items-center gap-3 px-4">
              <Users className="w-6 h-6 text-indigo-600" />
              <h2 className="text-2xl font-bold text-slate-900">Panduan Sekretaris</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm border-l-4 border-l-indigo-500">
                <div className="flex items-center gap-2 mb-3 font-bold text-slate-900">
                  <Users className="w-5 h-5 text-indigo-500" />
                  Manajemen Anggota
                </div>
                <ul className="text-sm text-gray-600 space-y-2 list-disc pl-5">
                  <li>Tambah, edit, atau hapus data anggota organisasi.</li>
                  <li>Data anggota ini digunakan oleh Bendahara untuk pencatatan iuran, jadi pastikan data tetap akurat.</li>
                  <li>Status keaktifan anggota dapat dikelola di sini.</li>
                </ul>
              </div>

              <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm border-l-4 border-l-orange-500">
                <div className="flex items-center gap-2 mb-3 font-bold text-slate-900">
                  <Calendar className="w-5 h-5 text-orange-500" />
                  Rapat & Presensi
                </div>
                <ul className="text-sm text-gray-600 space-y-2 list-disc pl-5">
                  <li>Buat agenda rapat baru untuk memberitahu anggota.</li>
                  <li>Isi <span className="font-medium text-slate-900">Notulensi</span> setelah rapat selesai untuk mendokumentasikan keputusan.</li>
                  <li>Gunakan fitur <span className="font-medium text-slate-900">Presensi</span> untuk mencatat siapa saja yang hadir dalam pertemuan tersebut.</li>
                </ul>
              </div>

              <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm border-l-4 border-l-purple-500 md:col-span-2">
                <div className="flex items-center gap-2 mb-3 font-bold text-slate-900">
                  <Megaphone className="w-5 h-5 text-purple-500" />
                  Pengumuman
                </div>
                <p className="text-sm text-gray-600">
                  Posting informasi penting yang akan muncul di dashboard semua pengurus. 
                  Fitur ini mendukung pengumuman real-time, sehingga informasi tersampaikan dengan cepat.
                </p>
              </div>
            </div>
          </motion.section>
        )}

        {/* Support Section */}
        <motion.section variants={item} className="bg-slate-900 p-8 rounded-3xl text-white overflow-hidden relative">
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-6">
              <HelpCircle className="w-8 h-8 text-blue-400" />
              <h2 className="text-2xl font-bold">Butuh Bantuan Lebih Lanjut?</h2>
            </div>
            <p className="text-slate-400 mb-8 max-w-2xl leading-relaxed">
              Jika Anda menemui kendala teknis atau memiliki saran pengembangan, silakan hubungi tim administrator IT organisasi atau pengembang aplikasi ini.
            </p>
            <div className="flex flex-wrap gap-4">
              <button 
                onClick={() => window.print()}
                className="px-6 py-3 bg-white text-slate-900 rounded-2xl font-bold text-sm hover:bg-blue-50 transition-colors flex items-center gap-2"
              >
                <FileText className="w-4 h-4" />
                Cetak Panduan (PDF)
              </button>
            </div>
          </div>
          <div className="absolute -right-20 -bottom-20 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl" />
        </motion.section>
      </motion.div>

      <footer className="mt-16 pt-8 border-t border-gray-100 text-center text-sm text-gray-400">
        &copy; {new Date().getFullYear()} Organisasi Remaja Britania Nglempong. Seluruh hak cipta dilindungi.
      </footer>
    </div>
  );
}
