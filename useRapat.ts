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
  Info,
  Package,
  Camera,
  Vote,
  LayoutDashboard,
  ClipboardList
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
    <div className="p-8 max-w-5xl mx-auto bg-white dark:bg-slate-950">
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-12"
      >
        <div className="flex items-center gap-4 mb-4">
          <div className="p-3 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-2xl">
            <BookOpen className="w-8 h-8" />
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">Petunjuk Penggunaan</h1>
            <p className="text-gray-500 dark:text-slate-400 mt-1">Panduan lengkap menggunakan sistem Organisasi Remaja Britania Nglempong.</p>
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
        <motion.section variants={item} className="bg-white dark:bg-slate-900 p-8 rounded-3xl border border-gray-100 dark:border-slate-800 shadow-sm">
          <div className="flex items-center gap-3 mb-4 text-blue-600 dark:text-blue-400">
            <Info className="w-6 h-6" />
            <h2 className="text-xl font-bold">Pendahuluan</h2>
          </div>
          <p className="text-gray-600 dark:text-slate-400 leading-relaxed">
            Aplikasi ini dirancang untuk memudahkan manajemen administrasi dan keuangan Organisasi Remaja Britania Nglempong. 
            Sistem dibagi menjadi dua akses utama: <span className="font-bold text-slate-900 dark:text-slate-200">Bendahara</span> dan <span className="font-bold text-slate-900 dark:text-slate-200">Sekretaris</span>. 
            Setiap peran memiliki fitur khusus yang saling terintegrasi secara real-time.
          </p>
        </motion.section>

        {/* Bendahara Section */}
        {(role === 'bendahara' || !role) && (
          <motion.section variants={item} className="space-y-6">
            <div className="flex items-center gap-3 px-4">
              <Wallet className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Panduan Bendahara</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-gray-100 dark:border-slate-800 shadow-sm border-l-4 border-l-emerald-500 dark:border-l-emerald-600">
                <div className="flex items-center gap-2 mb-3 font-bold text-slate-900 dark:text-white">
                  <ArrowUpCircle className="w-5 h-5 text-emerald-500" />
                  Kas Masuk & Iuran
                </div>
                <ul className="text-sm text-gray-600 dark:text-slate-400 space-y-2 list-disc pl-5">
                  <li>Gunakan menu <span className="font-medium text-slate-900 dark:text-slate-200">Kas Masuk</span> untuk mencatat pendapatan di luar iuran warga.</li>
                  <li>Menu <span className="font-medium text-slate-900 dark:text-slate-200">Iuran</span> digunakan khusus untuk mencatat iuran rutin anggota. Anda dapat memilih nama anggota dari daftar yang ada.</li>
                  <li>Setiap input akan otomatis memperbarui saldo total di dashboard.</li>
                </ul>
              </div>

              <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-gray-100 dark:border-slate-800 shadow-sm border-l-4 border-l-red-500 dark:border-l-red-600">
                <div className="flex items-center gap-2 mb-3 font-bold text-slate-900 dark:text-white">
                  <ArrowDownCircle className="w-5 h-5 text-red-500" />
                  Kas Keluar
                </div>
                <ul className="text-sm text-gray-600 dark:text-slate-400 space-y-2 list-disc pl-5">
                  <li>Catat semua pengeluaran organisasi dengan detail keterangan dan nominal.</li>
                  <li>Pastikan nominal yang diinput benar sebelum menekan tombol simpan.</li>
                  <li>Data pengeluaran akan ditampilkan dalam bentuk daftar kronologis.</li>
                </ul>
              </div>

              <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-gray-100 dark:border-slate-800 shadow-sm border-l-4 border-l-blue-500 dark:border-l-blue-600 md:col-span-2">
                <div className="flex items-center gap-2 mb-3 font-bold text-slate-900 dark:text-white">
                  <FileText className="w-5 h-5 text-blue-500" />
                  Laporan Keuangan
                </div>
                <p className="text-sm text-gray-600 dark:text-slate-400 mb-4">
                  Fitur ini menyediakan ringkasan otomatis dari seluruh transaksi. Anda dapat melihat:
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-2xl text-center">
                    <p className="text-[10px] uppercase font-bold text-blue-500 mb-1">Total Masuk</p>
                    <p className="text-lg font-bold text-blue-700 dark:text-blue-400">Otomatis</p>
                  </div>
                  <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-2xl text-center">
                    <p className="text-[10px] uppercase font-bold text-red-500 mb-1">Total Keluar</p>
                    <p className="text-lg font-bold text-red-700 dark:text-red-400">Otomatis</p>
                  </div>
                  <div className="bg-emerald-50 dark:bg-emerald-900/20 p-4 rounded-2xl text-center">
                    <p className="text-[10px] uppercase font-bold text-emerald-500 mb-1">Saldo Akhir</p>
                    <p className="text-lg font-bold text-emerald-700 dark:text-emerald-400">Real-time</p>
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
              <Users className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Panduan Sekretaris</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-gray-100 dark:border-slate-800 shadow-sm border-l-4 border-l-indigo-500 dark:border-l-indigo-600">
                <div className="flex items-center gap-2 mb-3 font-bold text-slate-900 dark:text-white">
                  <Users className="w-5 h-5 text-indigo-500" />
                  Manajemen Anggota
                </div>
                <ul className="text-sm text-gray-600 dark:text-slate-400 space-y-2 list-disc pl-5">
                  <li>Tambah, edit, atau hapus data anggota organisasi.</li>
                  <li>Data anggota ini digunakan oleh Bendahara untuk pencatatan iuran, jadi pastikan data tetap akurat.</li>
                  <li>Status keaktifan anggota dapat dikelola di sini.</li>
                </ul>
              </div>

              <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-gray-100 dark:border-slate-800 shadow-sm border-l-4 border-l-orange-500 dark:border-l-orange-600">
                <div className="flex items-center gap-2 mb-3 font-bold text-slate-900 dark:text-white">
                  <Calendar className="w-5 h-5 text-orange-500" />
                  Rapat & Presensi
                </div>
                <ul className="text-sm text-gray-600 dark:text-slate-400 space-y-2 list-disc pl-5">
                  <li>Buat agenda rapat baru untuk memberitahu anggota.</li>
                  <li>Isi <span className="font-medium text-slate-900 dark:text-slate-200">Notulensi</span> setelah rapat selesai untuk mendokumentasikan keputusan.</li>
                  <li>Gunakan fitur <span className="font-medium text-slate-900 dark:text-slate-200">Presensi</span> untuk mencatat siapa saja yang hadir dalam pertemuan tersebut.</li>
                </ul>
              </div>

              <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-gray-100 dark:border-slate-800 shadow-sm border-l-4 border-l-purple-500 dark:border-l-purple-600 md:col-span-2">
                <div className="flex items-center gap-2 mb-3 font-bold text-slate-900 dark:text-white">
                  <Megaphone className="w-5 h-5 text-purple-500" />
                  Pengumuman
                </div>
                <p className="text-sm text-gray-600 dark:text-slate-400">
                  Posting informasi penting yang akan muncul di dashboard semua pengurus. 
                  Fitur ini mendukung pengumuman real-time, sehingga informasi tersampaikan dengan cepat.
                </p>
              </div>
            </div>
          </motion.section>
        )}

        {/* Anggota Section */}
        {(role === 'anggota' || !role) && (
          <motion.section variants={item} className="space-y-6">
            <div className="flex items-center gap-3 px-4">
              <Users className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Panduan Anggota</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-gray-100 dark:border-slate-800 shadow-sm border-l-4 border-l-blue-500 dark:border-l-blue-600">
                <div className="flex items-center gap-2 mb-3 font-bold text-slate-900 dark:text-white">
                  <LayoutDashboard className="w-5 h-5 text-blue-500" />
                  Dashboard Personal
                </div>
                <p className="text-sm text-gray-600 dark:text-slate-400">
                  Melihat pengumuman terbaru, jadwal rapat terdekat, dan polling yang sedang aktif secara langsung saat Anda masuk.
                </p>
              </div>

              <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-gray-100 dark:border-slate-800 shadow-sm border-l-4 border-l-amber-500 dark:border-l-amber-600">
                <div className="flex items-center gap-2 mb-3 font-bold text-slate-900 dark:text-white">
                  <Vote className="w-5 h-5 text-amber-500" />
                  Berpartisipasi Voting
                </div>
                <p className="text-sm text-gray-600 dark:text-slate-400">
                  Berikan suara Anda pada setiap polling atau pemilihan ketua yang diadakan oleh pengurus. Suara Anda bersifat rahasia dan aman.
                </p>
              </div>

              <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-gray-100 dark:border-slate-800 shadow-sm border-l-4 border-l-green-500 dark:border-l-green-600 md:col-span-2">
                <div className="flex items-center gap-2 mb-3 font-bold text-slate-900 dark:text-white">
                  <ClipboardList className="w-5 h-5 text-green-500" />
                  Akses Informasi
                </div>
                <p className="text-sm text-gray-600 dark:text-slate-400">
                  Anggota memiliki akses baca untuk melihat seluruh notulensi rapat, kalender kegiatan, dan galeri dokumentasi foto organisasi.
                </p>
              </div>
            </div>
          </motion.section>
        )}

        {/* Global/Shared Section (Manajemen Aset) */}
        <motion.section variants={item} className="space-y-6">
          <div className="flex items-center gap-3 px-4">
            <Package className="w-6 h-6 text-amber-600 dark:text-amber-400" />
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Manajemen Aset (Umum)</h2>
          </div>
          
          <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-gray-100 dark:border-slate-800 shadow-sm border-l-4 border-l-amber-500 dark:border-l-amber-600">
            <p className="text-sm text-gray-600 dark:text-slate-400 mb-4">
              Fitur ini dapat diakses baik oleh Bendahara maupun Sekretaris untuk mengelola barang milik organisasi.
            </p>
            <ul className="text-sm text-gray-600 dark:text-slate-400 space-y-2 list-disc pl-5">
              <li>Input <span className="font-medium text-slate-900 dark:text-slate-200">Nama Barang</span> dan <span className="font-medium text-slate-900 dark:text-slate-200">Lokasi</span> (misal: Gudang Masjid, Rumah Ketua).</li>
              <li>Data ini membantu saat akan mengadakan acara untuk mengetahui ketersediaan alat.</li>
              <li>Pastikan melakukan update jika ada barang yang pindah lokasi penyimpanan.</li>
            </ul>
          </div>

          <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-gray-100 dark:border-slate-800 shadow-sm border-l-4 border-l-indigo-500 dark:border-l-indigo-600">
            <div className="flex items-center gap-2 mb-3 font-bold text-slate-900 dark:text-white">
               <Camera className="w-5 h-5 text-indigo-500" />
               Galeri Dokumentasi
            </div>
            <p className="text-sm text-gray-600 dark:text-slate-400 mb-4">
              Gunakan fitur ini untuk menyimpan foto-foto setelah kegiatan selesai sebagai arsip visual.
            </p>
            <ul className="text-sm text-gray-600 dark:text-slate-400 space-y-2 list-disc pl-5">
              <li>Masukkan <span className="font-medium text-slate-900 dark:text-slate-200">Judul Kegiatan</span> dan <span className="font-medium text-slate-900 dark:text-slate-200">URL Gambar</span>.</li>
              <li>Karena sistem tidak menyimpan file gambar secara langsung, Anda perlu mengunggah foto ke layanan hosting gambar (seperti Imgur, Google Drive, dsb) lalu menempelkan link-nya di sini.</li>
              <li>Sertakan deskripsi singkat untuk menceritakan momen penting dalam foto tersebut.</li>
            </ul>
          </div>
          
          <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-gray-100 dark:border-slate-800 shadow-sm border-l-4 border-l-indigo-600">
            <div className="flex items-center gap-2 mb-3 font-bold text-slate-900 dark:text-white">
               <Calendar className="w-5 h-5 text-indigo-600" />
               Kalender Kegiatan
            </div>
            <p className="text-sm text-gray-600 dark:text-slate-400 mb-4">
              Fitur ini membantu memantau jadwal organisasi, baik yang rutin maupun acara khusus.
            </p>
            <ul className="text-sm text-gray-600 dark:text-slate-400 space-y-2 list-disc pl-5">
              <li><span className="font-medium text-slate-900 dark:text-slate-200">Rutin Selapanan:</span> Muncul otomatis setiap 35 hari sekali (Sabtu Malam Minggu) untuk memudahkan perencanaan.</li>
              <li><span className="font-medium text-slate-900 dark:text-slate-200">Agenda Khusus:</span> Klik pada tanggal di kalender untuk menambah acara satu kali (seperti Baksos, Rapat, atau Syukuran).</li>
              <li>Membantu seluruh pengurus melihat jadwal yang bentrok sebelum memutuskan tanggal kegiatan baru.</li>
            </ul>
          </div>

          <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-gray-100 dark:border-slate-800 shadow-sm border-l-4 border-l-indigo-600">
            <div className="flex items-center gap-2 mb-3 font-bold text-slate-900 dark:text-white">
               <Vote className="w-5 h-5 text-indigo-600" />
               E-Voting & Polling
            </div>
            <p className="text-sm text-gray-600 dark:text-slate-400 mb-4">
              Gunakan fitur ini untuk pengambilan keputusan bersama atau pemilihan ketua secara digital.
            </p>
            <ul className="text-sm text-gray-600 dark:text-slate-400 space-y-2 list-disc pl-5">
              <li><span className="font-medium text-slate-900 dark:text-slate-200">Buat Polling:</span> Sekretaris dapat membuat polling pilihan ganda atau input manual (terserah pemilih).</li>
              <li><span className="font-medium text-slate-900 dark:text-slate-200">Satu Akun Satu Suara:</span> Sistem otomatis mengunci pemilihan berdasarkan akun login untuk mencegah kecurangan.</li>
              <li><span className="font-medium text-slate-900 dark:text-slate-200">Bagikan Link:</span> Salin link polling tertentu untuk dibagikan ke anggota agar mereka langsung diarahkan ke halaman voting.</li>
              <li>Hasil voting muncul secara real-time dalam bentuk grafik persentase.</li>
            </ul>
          </div>
        </motion.section>

        {/* Support Section */}
        <motion.section variants={item} className="bg-slate-900 dark:bg-slate-900 p-8 rounded-3xl text-white overflow-hidden relative border border-slate-800">
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
                className="px-6 py-3 bg-white dark:bg-slate-800 text-slate-900 dark:text-white rounded-2xl font-bold text-sm hover:bg-blue-50 dark:hover:bg-slate-700 transition-colors flex items-center gap-2"
              >
                <FileText className="w-4 h-4" />
                Cetak Panduan (PDF)
              </button>
            </div>
          </div>
          <div className="absolute -right-20 -bottom-20 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl" />
        </motion.section>
      </motion.div>

      <footer className="mt-16 pt-8 border-t border-gray-100 dark:border-slate-800 text-center text-sm text-gray-400 dark:text-slate-600">
        &copy; {new Date().getFullYear()} Organisasi Remaja Britania Nglempong. Seluruh hak cipta dilindungi.
      </footer>
    </div>
  );
}
