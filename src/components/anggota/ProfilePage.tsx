/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { 
  User, 
  Wallet, 
  Calendar, 
  MapPin, 
  Briefcase, 
  Clock, 
  CheckCircle2, 
  XCircle,
  ChevronRight,
  TrendingUp,
  Award,
  Camera,
  Phone,
  Download,
  Save,
  Loader2,
  Check,
  Star,
  ShieldCheck,
  Users,
  CreditCard
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { useAnggota } from '../../hooks/useAnggota';
import { useKeuangan } from '../../hooks/useKeuangan';
import { useRapat } from '../../hooks/useRapat';
import OrbinLogo from '../shared/OrbinLogo';
import { motion } from 'motion/react';
import { cn, formatDate } from '../../lib/utils';
import { toPng } from 'html-to-image';

export default function ProfilePage() {
  const { user } = useAuth();
  const { anggotaList, isLoading: loadingAnggota, updateAnggota } = useAnggota();
  const { iuranList, NOMINAL_IURAN } = useKeuangan();
  const { rapatList, presensiList } = useRapat();
  
  const cardRef = useRef<HTMLDivElement>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  
  // Find linked member record
  const myRecord = anggotaList.find(a => a.userId === user?.uid || a.id === user?.uid);
  
  const [formData, setFormData] = useState({
    namaLengkap: '',
    noTelp: '',
    fotoUrl: ''
  });

  useEffect(() => {
    if (myRecord) {
      setFormData({
        namaLengkap: myRecord.namaLengkap || '',
        noTelp: myRecord.noTelp || '',
        fotoUrl: myRecord.fotoUrl || ''
      });
    }
  }, [myRecord]);

  const myIuran = iuranList.filter(i => i.anggotaId === myRecord?.id);
  const myPresensi = presensiList.filter(p => p.anggotaId === myRecord?.id);
  
  const attendanceRate = rapatList.length > 0 
    ? Math.round((myPresensi.filter(p => p.status === 'hadir').length / rapatList.length) * 100) 
    : 0;

  const totalDuesPaid = myIuran.reduce((sum, i) => sum + i.jumlah, 0);

  // Tenure calculation and ranking
  const getTenureInfo = () => {
    if (!myRecord) return { years: 0, months: 0, label: 'Anggota Baru', progress: 0 };
    const joinDate = new Date(myRecord.tanggalBergabung);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - joinDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    const months = Math.floor(diffDays / 30.44);
    const years = Math.floor(months / 12);
    
    let label = 'Anggota Muda';
    let progress = (months / 12) * 100;
    
    if (years >= 3) {
      label = 'Anggota Utama';
      progress = 100;
    } else if (years >= 1) {
      label = 'Anggota Madya';
      progress = ((months - 12) / 24) * 100;
    }

    return { years, months, label, progress: Math.min(progress, 100) };
  };

  const tenure = getTenureInfo();

  const compressImage = (base64Str: string, maxWidth = 400, maxHeight = 400): Promise<string> => {
    return new Promise((resolve) => {
      const img = new Image();
      img.src = base64Str;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > maxWidth) {
            height *= maxWidth / width;
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width *= maxHeight / height;
            height = maxHeight;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx?.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL('image/jpeg', 0.7)); // Use JPEG with 0.7 quality for significant size reduction
      };
    });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = async () => {
        const compressed = await compressImage(reader.result as string);
        setFormData(prev => ({ ...prev, fotoUrl: compressed }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async () => {
    if (!myRecord) return;
    setIsSaving(true);
    try {
      await updateAnggota(myRecord.id, {
        namaLengkap: formData.namaLengkap,
        noTelp: formData.noTelp,
        fotoUrl: formData.fotoUrl
      });
      setIsEditing(false);
    } catch (error) {
      console.error('Error updating profile:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const downloadCard = async () => {
    if (cardRef.current === null) return;
    setIsGenerating(true);
    try {
      const dataUrl = await toPng(cardRef.current, { cacheBust: true, pixelRatio: 2 });
      const link = document.createElement('a');
      link.download = `Kartu-Anggota-${formData.namaLengkap || user?.username}.png`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error('Error generating card:', err);
    } finally {
      setIsGenerating(false);
    }
  };

  if (loadingAnggota) {
    return (
      <div className="p-8 flex items-center justify-center min-h-[60vh]">
        <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-8 max-w-5xl mx-auto space-y-8 transition-colors duration-300">
      {/* Hidden Card for export - 65mm x 105mm (Portrait) is approx 246px x 397px at 96dpi */}
      <div className="fixed -left-[2000px] top-0 overflow-hidden pointer-events-none">
        <div 
          ref={cardRef}
          className="w-[246px] h-[397px] bg-slate-900 text-white p-0 relative overflow-hidden border border-slate-800"
          style={{ width: '246px', height: '397px', minWidth: '246px', minHeight: '397px' }}
        >
          {/* Solid Gradient Background (No blurs for sharp rendering) */}
          <div className="absolute inset-0 bg-slate-900" />
          <div className="absolute inset-0 bg-gradient-to-br from-blue-900/40 via-transparent to-indigo-900/40" />
          
          {/* Subtle patterns for texture without filters */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 rounded-full -mr-16 -mt-16" />
          <div className="absolute bottom-0 left-0 w-32 h-32 bg-indigo-500/5 rounded-full -ml-16 -mb-16" />
          
          <div className="relative h-full flex flex-col items-center pt-8 pb-6 px-4 z-10">
            {/* Header */}
            <div className="flex flex-col items-center mb-6 w-full">
              <OrbinLogo size={80} className="mb-4" />
              <h2 className="text-[10px] font-black tracking-[0.25em] uppercase leading-tight text-center text-white">
                Organisasi Remaja<br/>Britania Nglempong
              </h2>
              <div className="h-[2px] w-12 bg-gradient-to-r from-transparent via-[#D4AF37] to-transparent mt-3" />
            </div>

            {/* Photo Section */}
            <div className="flex-shrink-0 w-32 h-40 bg-slate-800 rounded-2xl border-2 border-white/10 overflow-hidden shadow-2xl mb-5">
              {formData.fotoUrl ? (
                <img 
                  src={formData.fotoUrl} 
                  alt="Photo" 
                  className="w-full h-full object-cover" 
                  style={{ display: 'block', width: '100%', height: '100%' }}
                  referrerPolicy="no-referrer" 
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-slate-700 bg-slate-800">
                  <User className="w-16 h-16" />
                </div>
              )}
            </div>

            {/* Profile Info */}
            <div className="flex-1 w-full flex flex-col items-center">
              <h3 className="text-sm font-black tracking-tight uppercase mb-1 text-center w-full px-2 text-white">
                {formData.namaLengkap || user?.username}
              </h3>
              <p className="text-[9px] text-[#D4AF37] font-bold uppercase tracking-[0.2em] mb-6">
                {myRecord?.jabatan || 'Anggota'}
              </p>
              
              <div className="w-full h-[1px] bg-white/10 mb-5" />
              
              <div className="w-full space-y-3">
                <div className="flex flex-col items-center">
                  <span className="text-[6px] text-slate-400 uppercase tracking-[0.3em] font-bold mb-0.5">Nomor Telepon</span>
                  <span className="text-[9px] font-mono font-bold text-slate-200">{formData.noTelp || '-'}</span>
                </div>
                <div className="flex flex-col items-center">
                  <span className="text-[6px] text-slate-400 uppercase tracking-[0.3em] font-bold mb-0.5">Tanggal Bergabung</span>
                  <span className="text-[9px] font-mono font-bold text-slate-200">{myRecord ? formatDate(myRecord.tanggalBergabung) : '-'}</span>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="w-full flex flex-col items-center gap-3">
              <div className="bg-white p-1 rounded-[2px]">
                <div className="px-2 py-0.5 border border-slate-100 flex items-center justify-center font-mono text-[7px] text-slate-800 font-bold tracking-tighter">
                   ID:{myRecord?.id.substring(0, 8).toUpperCase()}
                </div>
              </div>
              <p className="text-[6px] text-slate-500 font-bold tracking-[0.2em]">
                ESTABLISHED 2017 • ORBIN OFFICIAL CARD
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Header / Basic Info */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white dark:bg-slate-900 rounded-3xl border border-gray-100 dark:border-slate-800 shadow-sm overflow-hidden"
      >
        <div className="h-32 bg-gradient-to-r from-blue-600 to-indigo-700 pointer-events-none" />
        <div className="px-8 pb-8 -mt-12 flex flex-col md:flex-row md:items-end gap-6">
          <div className="relative group">
            <div className="w-24 h-24 bg-white dark:bg-slate-900 rounded-3xl p-1 shadow-lg overflow-hidden">
              <div className="w-full h-full bg-slate-100 dark:bg-slate-800 rounded-2xl flex items-center justify-center">
                {formData.fotoUrl ? (
                  <img src={formData.fotoUrl} alt="Profile" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                ) : (
                  <User className="w-12 h-12 text-slate-400 dark:text-slate-600" />
                )}
              </div>
            </div>
            {isEditing && (
              <label className="absolute inset-0 bg-black/40 rounded-3xl flex items-center justify-center cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity">
                <Camera className="text-white w-6 h-6" />
                <input type="file" className="hidden" accept="image/*" onChange={handleFileChange} />
              </label>
            )}
          </div>
          <div className="flex-1">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-3">
                  {isEditing ? (
                    <input 
                      type="text" 
                      value={formData.namaLengkap}
                      onChange={(e) => setFormData(prev => ({ ...prev, namaLengkap: e.target.value }))}
                      className="text-2xl font-bold bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-2 py-1 outline-none focus:ring-2 ring-blue-500 text-slate-900 dark:text-white"
                      placeholder="Nama Lengkap"
                    />
                  ) : (
                    <h1 className="text-3xl font-bold text-slate-900 dark:text-white">{myRecord?.namaLengkap || user?.username}</h1>
                  )}
                  <span className={cn(
                    "px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider",
                    myRecord?.status === 'aktif' ? "bg-green-50 dark:bg-green-900/40 text-green-600 dark:text-green-400" : "bg-gray-50 dark:bg-slate-800 text-gray-400 dark:text-slate-500"
                  )}>
                    {myRecord?.status || 'Aktif'}
                  </span>
                </div>
                <div className="flex flex-wrap items-center gap-4 mt-2">
                  <p className="text-slate-500 dark:text-slate-400 font-medium flex items-center gap-2">
                    <Briefcase className="w-4 h-4" />
                    {myRecord?.jabatan || 'Anggota'}
                  </p>
                  <div className="flex items-center gap-2">
                    <Phone className="w-4 h-4 text-slate-400" />
                    {isEditing ? (
                      <input 
                        type="tel"
                        value={formData.noTelp}
                        onChange={(e) => setFormData(prev => ({ ...prev, noTelp: e.target.value }))}
                        className="text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-2 py-1 outline-none focus:ring-2 ring-blue-500 text-slate-900 dark:text-white"
                        placeholder="Nomor Telepon"
                      />
                    ) : (
                      <p className="text-slate-500 dark:text-slate-400">{formData.noTelp || 'Belum ada nomor'}</p>
                    )}
                  </div>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                {isEditing ? (
                  <button 
                    onClick={handleSave}
                    disabled={isSaving}
                    className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 text-white rounded-xl font-bold text-sm hover:bg-blue-700 transition-all disabled:opacity-50"
                  >
                    {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                    Simpan Perubahan
                  </button>
                ) : (
                  <button 
                    onClick={() => setIsEditing(true)}
                    className="px-6 py-2.5 bg-slate-900 dark:bg-slate-800 text-white rounded-xl font-bold text-sm hover:bg-slate-800 dark:hover:bg-slate-700 transition-all"
                  >
                    Edit Profil
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Member Card Generator Section */}
      <section className="bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 rounded-[2rem] p-8 text-white shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-10">
          <Award className="w-32 h-32" />
        </div>
        <div className="relative z-10 flex flex-col lg:flex-row items-center gap-12">
          <div className="flex-1 space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-500/20 text-blue-300 rounded-full text-[10px] font-bold uppercase tracking-widest ring-1 ring-blue-500/30">
              Identity System
            </div>
            <h2 className="text-3xl font-black italic tracking-tight">KARTU ANGGOTA ORBIN</h2>
            <p className="text-blue-100/70 text-sm leading-relaxed max-w-md">
              Kartu identitas resmi Anda. Versi digital berukuran standar B2 (105x65mm). Gunakan identitas ini untuk keperluan administrasi dan kegiatan resmi organisasi.
            </p>
            <div className="flex flex-wrap gap-4 pt-4">
              <button 
                onClick={downloadCard}
                disabled={isGenerating || !myRecord}
                className="flex items-center gap-3 px-8 py-4 bg-white text-blue-900 rounded-2xl font-black text-sm uppercase tracking-widest hover:scale-105 active:scale-95 transition-all shadow-xl disabled:opacity-50"
              >
                {isGenerating ? <Loader2 className="w-5 h-5 animate-spin" /> : <Download className="w-5 h-5" />}
                Generate & Simpan Kartu
              </button>
              <div className="flex items-center gap-3 px-4 py-2 bg-slate-800/50 rounded-xl border border-white/10">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                <span className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">Siap Generate</span>
              </div>
            </div>
          </div>

          {/* Visual Preview of the card */}
          <div className="lg:w-[350px] flex justify-center perspective-[1000px] py-10">
             <motion.div 
               whileHover={{ rotateY: 15, rotateX: -5, scale: 1.05 }}
               transition={{ type: "spring", stiffness: 300, damping: 20 }}
               className="w-[200px] h-[320px] bg-[#0F172A] rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] overflow-hidden border border-white/20 relative group cursor-pointer"
             >
                {/* Decorative scanline effect */}
                <div className="absolute inset-0 bg-gradient-to-b from-transparent via-white/5 to-transparent h-14 w-full -top-14 opacity-0 group-hover:opacity-100 animate-scanline pointer-events-none" />
                
                <div className="w-full h-full p-4 flex flex-col items-center text-center relative z-10">
                   <div className="mb-4">
                      <OrbinLogo size={40} className="mx-auto mb-2 drop-shadow-lg" />
                      <p className="text-[5px] font-black tracking-widest uppercase text-white/80">Organisasi Remaja Britania Nglempong</p>
                   </div>
                   
                   <div className="w-20 h-28 bg-slate-700/50 rounded-xl border border-white/10 flex items-center justify-center overflow-hidden mb-4 shadow-lg relative">
                      {formData.fotoUrl ? (
                        <img src={formData.fotoUrl} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                      ) : <User className="w-8 h-8 opacity-20 text-white" />}
                      
                      <div className="absolute bottom-1 right-1 w-5 h-5 bg-blue-600 rounded-full border-2 border-[#0F172A] flex items-center justify-center shadow-lg">
                        <Check className="w-3 h-3 text-white stroke-[3px]" />
                      </div>
                   </div>

                   <div className="space-y-1 w-full">
                      <div className="h-0.5 w-12 bg-[#D4AF37]/50 mx-auto mb-2" />
                      <h4 className="text-[10px] font-black text-white uppercase tracking-tight truncate px-2">
                        {formData.namaLengkap || user?.username}
                      </h4>
                      <div className="flex flex-col items-center gap-0.5">
                        <p className="text-[8px] font-bold text-[#D4AF37] uppercase tracking-wider">
                          {myRecord?.jabatan || 'Anggota'}
                        </p>
                        <span className="text-[6px] text-white/40 font-mono uppercase tracking-[2px]">Rank: {tenure.label}</span>
                      </div>
                   </div>
                   
                   <div className="mt-auto pb-4 w-full px-4">
                      {/* Tenure Progress Bar on Card */}
                      <div className="w-full h-0.5 bg-white/10 rounded-full overflow-hidden mb-2">
                        <motion.div 
                          initial={{ width: 0 }}
                          animate={{ width: `${tenure.progress}%` }}
                          className="h-full bg-[#D4AF37]"
                        />
                      </div>
                      <div className="flex justify-center gap-1">
                        {[1, 2, 3].map(i => (
                          <div key={i} className="w-1 h-1 rounded-full bg-[#D4AF37]/30" />
                        ))}
                      </div>
                   </div>
                </div>

                {/* Holographic reflection effect */}
                <div className="absolute inset-0 bg-gradient-to-tr from-white/10 via-transparent to-white/5 opacity-0 group-hover:opacity-100 transition-opacity" />
             </motion.div>
          </div>
        </div>
      </section>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Stats Cards */}
        {/* Achievement Badges - UNIQUE FEATURE */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="col-span-full bg-gradient-to-br from-slate-900 to-indigo-950 p-8 rounded-[2rem] border border-white/10 shadow-2xl relative overflow-hidden group"
        >
          {/* Background Highlight */}
          <div className="absolute -right-20 -top-20 w-64 h-64 bg-blue-500/10 rounded-full blur-[80px] group-hover:bg-blue-500/20 transition-all duration-700" />
          
          <div className="relative z-10">
            <div className="flex items-center gap-4 mb-8">
              <div className="w-12 h-12 bg-yellow-500/20 rounded-2xl flex items-center justify-center text-yellow-500 border border-yellow-500/30">
                <Star className="w-6 h-6 fill-yellow-500/20" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white tracking-tight">Pencapaian Anggota</h3>
                <p className="text-xs text-slate-400 uppercase tracking-widest font-bold">Member Milestone & Badges</p>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {/* Badge 1: Tenure */}
              <div className={cn(
                "p-4 rounded-2xl border flex flex-col items-center text-center transition-all duration-300",
                myRecord && new Date().getFullYear() - new Date(myRecord.tanggalBergabung).getFullYear() >= 1
                  ? "bg-white/5 border-white/10" 
                  : "bg-slate-900/50 border-white/5 opacity-40 grayscale"
              )}>
                <div className="w-10 h-10 bg-blue-500/20 rounded-full flex items-center justify-center mb-3">
                  <ShieldCheck className="w-5 h-5 text-blue-400" />
                </div>
                <span className="text-[10px] font-bold text-white mb-1 uppercase tracking-tighter">Pilar Orbin</span>
                <p className="text-[8px] text-slate-500 leading-tight">Pengabdian lebih dari 1 tahun</p>
              </div>

              {/* Badge 2: Finance */}
              <div className={cn(
                "p-4 rounded-2xl border flex flex-col items-center text-center transition-all duration-300",
                myIuran.length >= 3
                  ? "bg-white/5 border-white/10" 
                  : "bg-slate-900/50 border-white/5 opacity-40 grayscale"
              )}>
                <div className="w-10 h-10 bg-green-500/20 rounded-full flex items-center justify-center mb-3">
                  <CreditCard className="w-5 h-5 text-green-400" />
                </div>
                <span className="text-[10px] font-bold text-white mb-1 uppercase tracking-tighter">Donor Teladan</span>
                <p className="text-[8px] text-slate-500 leading-tight">Lunas iuran 3x berturut-turut</p>
              </div>

              {/* Badge 3: Attendance */}
              <div className={cn(
                "p-4 rounded-2xl border flex flex-col items-center text-center transition-all duration-300",
                attendanceRate >= 80
                  ? "bg-white/5 border-white/10" 
                  : "bg-slate-900/50 border-white/5 opacity-40 grayscale"
              )}>
                <div className="w-10 h-10 bg-purple-500/20 rounded-full flex items-center justify-center mb-3">
                  <Users className="w-5 h-5 text-purple-400" />
                </div>
                <span className="text-[10px] font-bold text-white mb-1 uppercase tracking-tighter">Aktif Berdikari</span>
                <p className="text-[8px] text-slate-500 leading-tight">Kehadiran rapat di atas 80%</p>
              </div>

              {/* Badge 4: Special */}
              <div className={cn(
                "p-4 rounded-2xl border flex flex-col items-center text-center transition-all duration-300",
                myRecord?.jabatan !== 'Anggota'
                  ? "bg-white/5 border-white/10 shadow-[0_0_20px_rgba(234,179,8,0.1)]" 
                  : "bg-slate-900/50 border-white/5 opacity-40 grayscale"
              )}>
                <div className="w-10 h-10 bg-yellow-500/20 rounded-full flex items-center justify-center mb-3">
                  <Award className="w-5 h-5 text-yellow-400" />
                </div>
                <span className="text-[10px] font-bold text-white mb-1 uppercase tracking-tighter">Elemen Elit</span>
                <p className="text-[8px] text-slate-500 leading-tight">Memiliki jabatan struktural</p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Stats Cards */}
        <motion.div 
          whileHover={{ y: -5 }}
          className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-gray-100 dark:border-slate-800 shadow-sm flex flex-col justify-between"
        >
          <div className="flex items-center gap-4 mb-4">
            <div className="w-10 h-10 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-2xl flex items-center justify-center">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-bold text-gray-400 dark:text-slate-500 uppercase tracking-widest">Masa Pengabdian</p>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">{tenure.years} Tahun {tenure.months % 12} Bulan</h3>
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between text-[10px] uppercase font-bold tracking-wider">
              <span className="text-slate-400">Rank: <span className="text-blue-500">{tenure.label}</span></span>
              <span className="text-slate-500">{Math.round(tenure.progress)}%</span>
            </div>
            <div className="w-full h-1.5 bg-gray-100 dark:bg-slate-800 rounded-full overflow-hidden">
              <div 
                className="h-full bg-indigo-500 transition-all duration-500" 
                style={{ width: `${tenure.progress}%` }} 
              />
            </div>
            <p className="text-[9px] text-gray-400 dark:text-slate-500 leading-tight">Teruslah mengabdi untuk mencapai Rank Anggota Utama!</p>
          </div>
        </motion.div>

        <motion.div 
          whileHover={{ y: -5 }}
          className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-gray-100 dark:border-slate-800 shadow-sm flex items-center gap-4"
        >
          <div className="w-12 h-12 bg-blue-50 dark:bg-blue-900/30 rounded-2xl flex items-center justify-center text-blue-600 dark:text-blue-400">
            <TrendingUp className="w-6 h-6" />
          </div>
          <div>
            <p className="text-[10px] font-bold text-gray-400 dark:text-slate-500 uppercase tracking-widest">Tingkat Kehadiran</p>
            <p className="text-2xl font-bold text-slate-900 dark:text-white">{attendanceRate}%</p>
          </div>
        </motion.div>

        <motion.div 
          whileHover={{ y: -5 }}
          className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-gray-100 dark:border-slate-800 shadow-sm flex items-center gap-4"
        >
          <div className="w-12 h-12 bg-green-50 dark:bg-green-900/30 rounded-2xl flex items-center justify-center text-green-600 dark:text-green-400">
            <Wallet className="w-6 h-6" />
          </div>
          <div>
            <p className="text-[10px] font-bold text-gray-400 dark:text-slate-500 uppercase tracking-widest">Total Iuran Terbayar</p>
            <p className="text-2xl font-bold text-slate-900 dark:text-white">Rp {totalDuesPaid.toLocaleString()}</p>
          </div>
        </motion.div>

        <motion.div 
          whileHover={{ y: -5 }}
          className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-gray-100 dark:border-slate-800 shadow-sm flex items-center gap-4"
        >
          <div className="w-12 h-12 bg-amber-50 dark:bg-amber-900/30 rounded-2xl flex items-center justify-center text-amber-600 dark:text-amber-400">
            <Award className="w-6 h-6" />
          </div>
          <div>
            <p className="text-[10px] font-bold text-gray-400 dark:text-slate-500 uppercase tracking-widest">Poin Keaktifan</p>
            <p className="text-2xl font-bold text-slate-900 dark:text-white">{myPresensi.filter(p => p.status === 'hadir').length * 10} pts</p>
          </div>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Iuran Section */}
        <section className="space-y-4">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Wallet className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            Riwayat Iuran
          </h2>
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-gray-100 dark:border-slate-800 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-gray-50 dark:border-slate-800 flex justify-between items-center bg-slate-50/50 dark:bg-slate-800/50">
              <span className="text-xs font-bold text-slate-500 dark:text-slate-400">Nominal per Bulan: Rp {NOMINAL_IURAN.toLocaleString()}</span>
            </div>
            <div className="divide-y divide-gray-50 dark:divide-slate-800 max-h-[400px] overflow-y-auto">
              {myIuran.length > 0 ? (
                myIuran.map((item) => (
                  <div key={item.id} className="p-4 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-green-50 dark:bg-green-900/30 rounded-xl flex items-center justify-center text-green-600 dark:text-green-400">
                        <CheckCircle2 className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-slate-900 dark:text-white">Periode {item.periode}</p>
                        <p className="text-[10px] text-gray-400 dark:text-slate-500 font-mono uppercase">{formatDate(item.tanggalBayar)}</p>
                      </div>
                    </div>
                    <span className="text-sm font-bold text-slate-700 dark:text-slate-300">Rp {item.jumlah.toLocaleString()}</span>
                  </div>
                ))
              ) : (
                <div className="p-12 text-center text-gray-400 dark:text-slate-600 italic text-sm">
                  Belum ada riwayat iuran tercatat.
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Attendance Section */}
        <section className="space-y-4">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Calendar className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            Riwayat Kehadiran (5 Rapat Terakhir)
          </h2>
          <div className="space-y-3">
            {rapatList.slice(0, 5).map(rapat => {
              const presensi = myPresensi.find(p => p.rapatId === rapat.id);
              return (
                <div key={rapat.id} className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-gray-100 dark:border-slate-800 shadow-sm flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white">{rapat.judul}</h3>
                    <div className="flex items-center gap-3 mt-1">
                      <p className="text-[10px] font-mono text-gray-400 dark:text-slate-500 uppercase">{formatDate(rapat.tanggal)}</p>
                      <div className="flex items-center gap-1 text-[10px] text-gray-400 dark:text-slate-500">
                        <MapPin className="w-3 h-3" />
                        {rapat.tempat}
                      </div>
                    </div>
                  </div>
                  <div className={cn(
                    "flex items-center gap-2 px-3 py-1.5 rounded-xl text-[10px] font-bold uppercase tracking-wider",
                    presensi?.status === 'hadir' ? "bg-green-50 dark:bg-green-900/40 text-green-600 dark:text-green-400" : "bg-red-50 dark:bg-red-900/40 text-red-600 dark:text-red-400"
                  )}>
                    {presensi?.status === 'hadir' ? <CheckCircle2 className="w-3.5 h-3.5" /> : <XCircle className="w-3.5 h-3.5" />}
                    {presensi?.status === 'hadir' ? 'Hadir' : 'Absen'}
                  </div>
                </div>
              );
            })}
            {rapatList.length === 0 && (
              <div className="bg-slate-50 dark:bg-slate-800/50 border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-3xl p-12 text-center text-gray-400 dark:text-slate-600">
                Belum ada agenda rapat tercatat.
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}

