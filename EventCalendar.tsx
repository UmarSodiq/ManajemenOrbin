/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Package, MapPin, Plus, Trash2, Edit2, X, Check, Search } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useAssets } from '../../hooks/useAssets';
import { Asset, AssetInput } from '../../types';

export default function AssetManagement() {
  const { assets, isLoading, addAsset, updateAsset, deleteAsset } = useAssets();
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  
  const [formData, setFormData] = useState<AssetInput>({
    namaBarang: '',
    lokasi: '',
  });

  const filteredAssets = assets.filter(asset => 
    asset.namaBarang.toLowerCase().includes(searchTerm.toLowerCase()) ||
    asset.lokasi.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editingId) {
      await updateAsset(editingId, formData);
      setEditingId(null);
    } else {
      await addAsset(formData);
      setIsAdding(false);
    }
    setFormData({ namaBarang: '', lokasi: '' });
  };

  const handleEdit = (asset: Asset) => {
    setFormData({ namaBarang: asset.namaBarang, lokasi: asset.lokasi });
    setEditingId(asset.id);
    setIsAdding(true);
  };

  const closeModal = () => {
    setIsAdding(false);
    setEditingId(null);
    setFormData({ namaBarang: '', lokasi: '' });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 space-y-8 bg-gray-50 dark:bg-slate-950 min-h-screen">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Package className="text-blue-500 dark:text-blue-400" />
            Manajemen Aset
          </h1>
          <p className="text-gray-500 dark:text-slate-400 mt-1">Daftar inventaris dan properti organisasi.</p>
        </div>
        <button
          onClick={() => setIsAdding(true)}
          className="flex items-center justify-center gap-2 bg-blue-600 dark:bg-blue-600 text-white px-6 py-3 rounded-2xl font-bold hover:bg-blue-700 dark:hover:bg-blue-700 transition-all shadow-lg shadow-blue-200 dark:shadow-none active:scale-95"
        >
          <Plus className="w-5 h-5" />
          Tambah Aset
        </button>
      </div>

      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 dark:text-slate-500 w-5 h-5" />
        <input
          type="text"
          placeholder="Cari nama barang atau lokasi..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-12 pr-4 py-4 bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 rounded-3xl shadow-sm focus:outline-none focus:ring-4 focus:ring-blue-100 dark:focus:ring-blue-900/20 transition-all dark:text-white"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <AnimatePresence mode="popLayout">
          {filteredAssets.map((asset) => (
            <motion.div
              key={asset.id}
              layout
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-gray-100 dark:border-slate-800 shadow-sm hover:shadow-md transition-shadow relative group"
            >
              <div className="flex items-start justify-between">
                <div className="p-3 bg-blue-50 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 rounded-2xl mb-4">
                  <Package className="w-6 h-6" />
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleEdit(asset)}
                    className="p-2 text-gray-400 dark:text-slate-500 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/40 rounded-xl transition-all"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => deleteAsset(asset.id)}
                    className="p-2 text-gray-400 dark:text-slate-500 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/40 rounded-xl transition-all"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">{asset.namaBarang}</h3>
              <div className="flex items-center gap-2 text-gray-500 dark:text-slate-400 text-sm">
                <MapPin className="w-4 h-4" />
                {asset.lokasi}
              </div>
              
              <div className="mt-4 pt-4 border-t border-gray-50 dark:border-slate-800 text-[10px] text-gray-400 dark:text-slate-600 flex justify-between">
                <span>ID: {asset.id.slice(0, 8)}</span>
                <span>{new Date(asset.tanggalInput).toLocaleDateString('id-ID')}</span>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {filteredAssets.length === 0 && (
        <div className="text-center py-20 bg-gray-50 dark:bg-slate-900/50 rounded-3xl border-2 border-dashed border-gray-200 dark:border-slate-800">
          <div className="bg-white dark:bg-slate-800 p-4 rounded-full w-fit mx-auto mb-4 shadow-sm">
            <Package className="w-8 h-8 text-gray-300 dark:text-slate-700" />
          </div>
          <p className="text-gray-500 dark:text-slate-400 font-medium">Tidak ada aset ditemukan</p>
        </div>
      )}

      {/* Modal Form */}
      <AnimatePresence>
        {isAdding && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="bg-white dark:bg-slate-900 w-full max-w-md rounded-3xl shadow-2xl overflow-hidden border border-gray-100 dark:border-slate-800"
            >
              <div className="p-6 border-b border-gray-100 dark:border-slate-800 flex items-center justify-between">
                <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                  {editingId ? 'Edit Aset' : 'Tambah Aset Baru'}
                </h2>
                <button onClick={closeModal} className="p-2 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-xl transition-all">
                  <X className="w-5 h-5 text-gray-500 dark:text-slate-400" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="p-6 space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Nama Barang</label>
                  <input
                    required
                    type="text"
                    value={formData.namaBarang}
                    onChange={(e) => setFormData({ ...formData, namaBarang: e.target.value })}
                    placeholder="Contoh: Kursi Lipat"
                    className="w-full px-4 py-3 bg-gray-50 dark:bg-slate-800 border border-transparent dark:border-slate-700 rounded-2xl focus:bg-white dark:focus:bg-slate-900 focus:ring-4 focus:ring-blue-100 dark:focus:ring-blue-900/20 focus:border-blue-200 dark:focus:border-blue-800 transition-all outline-none dark:text-white"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Lokasi Penyimpanan</label>
                  <input
                    required
                    type="text"
                    value={formData.lokasi}
                    onChange={(e) => setFormData({ ...formData, lokasi: e.target.value })}
                    placeholder="Contoh: Gudang Masjid"
                    className="w-full px-4 py-3 bg-gray-50 dark:bg-slate-800 border border-transparent dark:border-slate-700 rounded-2xl focus:bg-white dark:focus:bg-slate-900 focus:ring-4 focus:ring-blue-100 dark:focus:ring-blue-900/20 focus:border-blue-200 dark:focus:border-blue-800 transition-all outline-none dark:text-white"
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={closeModal}
                    className="flex-1 px-6 py-3 border border-gray-200 dark:border-slate-700 text-gray-600 dark:text-slate-400 rounded-2xl font-bold hover:bg-gray-50 dark:hover:bg-slate-800 transition-all"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-6 py-3 bg-blue-600 dark:bg-blue-600 text-white rounded-2xl font-bold hover:bg-blue-700 dark:hover:bg-blue-700 transition-all flex items-center justify-center gap-2"
                  >
                    <Check className="w-5 h-5" />
                    Simpan
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
