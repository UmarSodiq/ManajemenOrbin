/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Image, Plus, Trash2, Edit2, X, Check, Calendar, Info, Camera } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useGallery } from '../../hooks/useGallery';
import { Galeri, GaleriInput } from '../../types';
import { useAuth } from '../../hooks/useAuth';

export default function GalleryPage() {
  const { photos, isLoading, addPhoto, updatePhoto, deletePhoto } = useGallery();
  const { role } = useAuth();
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  const [formData, setFormData] = useState<GaleriInput>({
    judul: '',
    deskripsi: '',
    imageUrl: '',
    tanggalKegiatan: new Date().toISOString().split('T')[0],
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editingId) {
      await updatePhoto(editingId, formData);
      setEditingId(null);
    } else {
      await addPhoto(formData);
      setIsAdding(false);
    }
    setFormData({ judul: '', deskripsi: '', imageUrl: '', tanggalKegiatan: new Date().toISOString().split('T')[0] });
  };

  const handleEdit = (photo: Galeri) => {
    setFormData({ 
      judul: photo.judul, 
      deskripsi: photo.deskripsi || '', 
      imageUrl: photo.imageUrl, 
      tanggalKegiatan: photo.tanggalKegiatan 
    });
    setEditingId(photo.id);
    setIsAdding(true);
  };

  const closeModal = () => {
    setIsAdding(false);
    setEditingId(null);
    setFormData({ judul: '', deskripsi: '', imageUrl: '', tanggalKegiatan: new Date().toISOString().split('T')[0] });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 space-y-8 bg-[#fafafa] min-h-screen">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tighter flex items-center gap-3">
            <Camera className="w-10 h-10 text-indigo-600" />
            GALERI KEGIATAN
          </h1>
          <p className="text-gray-500 mt-1 font-medium italic">Arsip visual perjuangan dan kebersamaan Remaja Britania.</p>
        </div>
        {(role === 'sekretaris' || role === 'bendahara') && (
          <button
            onClick={() => setIsAdding(true)}
            className="flex items-center justify-center gap-2 bg-slate-900 text-white px-8 py-4 rounded-full font-bold hover:bg-indigo-600 transition-all shadow-xl active:scale-95"
          >
            <Plus className="w-5 h-5" />
            Unggah Dokumentasi
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        <AnimatePresence mode="popLayout">
          {photos.map((photo) => (
            <motion.div
              key={photo.id}
              layout
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="group relative bg-white rounded-[2rem] overflow-hidden shadow-sm hover:shadow-2xl transition-all duration-500 border border-gray-100"
            >
              <div className="aspect-[4/5] overflow-hidden relative">
                <img 
                  src={photo.imageUrl} 
                  alt={photo.judul}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  referrerPolicy="no-referrer"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1542038784456-1ea8e935640e?q=80&w=1000';
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex flex-col justify-end p-8">
                   {(role === 'sekretaris' || role === 'bendahara') && (
                    <div className="absolute top-4 right-4 flex gap-2">
                       <button
                        onClick={() => handleEdit(photo)}
                        className="p-3 bg-white/20 backdrop-blur-md text-white hover:bg-white hover:text-slate-900 rounded-full transition-all"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => deletePhoto(photo.id)}
                        className="p-3 bg-white/20 backdrop-blur-md text-white hover:bg-red-500 rounded-full transition-all"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                  <div className="translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
                    <p className="text-white/60 text-xs font-bold uppercase tracking-widest mb-1">
                      {new Date(photo.tanggalKegiatan).toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' })}
                    </p>
                    <h3 className="text-white text-2xl font-bold leading-tight">{photo.judul}</h3>
                  </div>
                </div>
              </div>

              <div className="p-6">
                <div className="flex items-center gap-2 mb-3">
                  <Calendar className="w-4 h-4 text-indigo-500" />
                  <span className="text-xs font-bold text-gray-400 uppercase tracking-tighter">
                    Kegiatan: {photo.tanggalKegiatan}
                  </span>
                </div>
                {photo.deskripsi && (
                  <p className="text-gray-600 text-sm line-clamp-2 leading-relaxed italic">
                    "{photo.deskripsi}"
                  </p>
                )}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {photos.length === 0 && (
        <div className="text-center py-32 bg-white rounded-[3rem] border border-gray-100 shadow-inner">
          <div className="bg-indigo-50 p-6 rounded-full w-fit mx-auto mb-6">
            <Image className="w-12 h-12 text-indigo-300" />
          </div>
          <h3 className="text-2xl font-bold text-slate-900">Belum Ada Kenangan</h3>
          <p className="text-gray-400 max-w-sm mx-auto mt-2">
            Mulai abadikan momen kegiatan organisasi kita di sini.
          </p>
        </div>
      )}

      {/* Modal Form */}
      <AnimatePresence>
        {isAdding && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 40 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 40 }}
              className="bg-white w-full max-w-xl rounded-[2.5rem] shadow-2xl overflow-hidden"
            >
              <div className="p-8 border-b border-gray-50 flex items-center justify-between bg-indigo-50/30">
                <div>
                  <h2 className="text-2xl font-black text-slate-900 tracking-tight">
                    {editingId ? 'EDIT ARSIP' : 'UNGGAH BARU'}
                  </h2>
                  <p className="text-indigo-600 text-sm font-bold uppercase tracking-widest mt-1">Dokumentasi Visual</p>
                </div>
                <button onClick={closeModal} className="p-3 hover:bg-white rounded-full transition-all shadow-sm">
                  <X className="w-6 h-6 text-gray-500" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="p-8 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Judul Kegiatan</label>
                    <input
                      required
                      type="text"
                      value={formData.judul}
                      onChange={(e) => setFormData({ ...formData, judul: e.target.value })}
                      placeholder="Contoh: Baksos Ramadhan"
                      className="w-full px-5 py-4 bg-slate-50 border-none rounded-2xl focus:ring-4 focus:ring-indigo-100 transition-all outline-none font-bold text-slate-700"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Tanggal Kegiatan</label>
                    <input
                      required
                      type="date"
                      value={formData.tanggalKegiatan}
                      onChange={(e) => setFormData({ ...formData, tanggalKegiatan: e.target.value })}
                      className="w-full px-5 py-4 bg-slate-50 border-none rounded-2xl focus:ring-4 focus:ring-indigo-100 transition-all outline-none font-bold text-slate-700"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-black text-slate-400 uppercase tracking-widest">URL Gambar (Link Foto)</label>
                  <input
                    required
                    type="url"
                    value={formData.imageUrl}
                    onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                    placeholder="https://example.com/foto.jpg"
                    className="w-full px-5 py-4 bg-slate-50 border-none rounded-2xl focus:ring-4 focus:ring-indigo-100 transition-all outline-none font-mono text-xs text-indigo-600"
                  />
                   <div className="flex items-center gap-2 mt-2 px-2">
                    <Info className="w-3 h-3 text-amber-500" />
                    <p className="text-[10px] text-gray-400 italic">Gunakan link eksternal (Unsplash, Imgur, Google Drive share direct link, dsb).</p>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Deskripsi (Opsional)</label>
                  <textarea
                    rows={3}
                    value={formData.deskripsi}
                    onChange={(e) => setFormData({ ...formData, deskripsi: e.target.value })}
                    placeholder="Ceritakan sedikit tentang momen ini..."
                    className="w-full px-5 py-4 bg-slate-50 border-none rounded-2xl focus:ring-4 focus:ring-indigo-100 transition-all outline-none text-slate-600 italic"
                  />
                </div>

                <div className="flex gap-4 pt-4">
                  <button
                    type="button"
                    onClick={closeModal}
                    className="flex-1 px-8 py-5 border border-slate-100 text-slate-400 rounded-full font-bold hover:bg-slate-50 transition-all uppercase tracking-widest text-xs"
                  >
                    Batalkan
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-8 py-5 bg-indigo-600 text-white rounded-full font-bold hover:bg-indigo-700 transition-all flex items-center justify-center gap-2 shadow-xl shadow-indigo-200 active:scale-95 uppercase tracking-widest text-xs"
                  >
                    <Check className="w-5 h-5" />
                    Simpan Arsip
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
