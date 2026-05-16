/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './hooks/useAuth';
import LoginForm from './components/auth/LoginForm';
import Layout from './components/shared/Layout';
import AnggotaList from './components/anggota/AnggotaList';
import IuranList from './components/keuangan/IuranList';
import TransactionPage from './components/keuangan/TransactionPage';
import LaporanKeuangan from './components/keuangan/LaporanKeuangan';
import RapatManager from './components/rapat/RapatManager';
import PresensiList from './components/rapat/PresensiList';
import PengumumanList from './components/pengumuman/PengumumanList';
import BendaharaDashboard from './components/dashboard/BendaharaDashboard';
import SekretarisDashboard from './components/dashboard/SekretarisDashboard';
import { Role } from './types';

// Placeholder components for routes
const DashboardPage = ({ role }: { role: Role }) => (
  <div className="p-8">
    <div className="flex justify-between items-center mb-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-gray-900">Dasbor {role.charAt(0).toUpperCase() + role.slice(1)}</h1>
        <p className="text-gray-500 mt-1">Ringkasan aktivitas organisasi Anda hari ini.</p>
      </div>
      <div className="bg-white px-4 py-2 rounded-xl border border-gray-100 shadow-sm text-sm font-medium">
        {new Intl.DateTimeFormat('id-ID', { dateStyle: 'full' }).format(new Date())}
      </div>
    </div>
    
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm h-48 flex items-center justify-center text-gray-400 italic">
        Komponen ringkasan akan muncul di sini
      </div>
      <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm h-48 flex items-center justify-center text-gray-400 italic">
        Komponen aktivitas akan muncul di sini
      </div>
      <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm h-48 flex items-center justify-center text-gray-400 italic">
        Komponen pengumuman akan muncul di sini
      </div>
    </div>
  </div>
);

const PlaceholderPage = ({ title }: { title: string }) => (
  <div className="p-8 flex flex-col items-center justify-center min-h-[60vh] text-center">
    <div className="w-20 h-20 bg-gray-100 rounded-3xl flex items-center justify-center mb-6">
      <div className="w-10 h-10 border-4 border-gray-300 border-t-gray-500 rounded-full animate-spin" />
    </div>
    <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
    <p className="text-gray-500 mt-2">Halaman ini sedang dalam pengembangan.</p>
  </div>
);

function ProtectedRoute({ children, requiredRole }: { children: React.ReactNode, requiredRole?: Role }) {
  const { user, role, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 text-gray-400 font-mono text-sm tracking-widest uppercase animate-pulse">
        Memuat Sistem...
      </div>
    );
  }

  if (!user) {
    return <Navigate replace to="/login" />;
  }

  if (requiredRole && role !== requiredRole) {
    return <Navigate replace to="/" />;
  }

  return <Layout>{children}</Layout>;
}

export default function App() {
  const { user, role } = useAuth();

  return (
    <Router>
      <Routes>
        <Route path="/login" element={!user ? <LoginForm /> : <Navigate replace to="/" />} />
        
        <Route path="/" element={
          <ProtectedRoute>
            {role === 'bendahara' ? <Navigate replace to="/bendahara" /> : <Navigate replace to="/sekretaris" />}
          </ProtectedRoute>
        } />

        {/* Bendahara Routes */}
        <Route path="/bendahara" element={
          <ProtectedRoute requiredRole="bendahara">
            <BendaharaDashboard />
          </ProtectedRoute>
        } />
        <Route path="/bendahara/kas-masuk" element={
          <ProtectedRoute requiredRole="bendahara">
            <TransactionPage type="masuk" />
          </ProtectedRoute>
        } />
        <Route path="/bendahara/iuran" element={
          <ProtectedRoute requiredRole="bendahara">
            <IuranList />
          </ProtectedRoute>
        } />
        <Route path="/bendahara/kas-keluar" element={
          <ProtectedRoute requiredRole="bendahara">
            <TransactionPage type="keluar" />
          </ProtectedRoute>
        } />
        <Route path="/bendahara/laporan" element={
          <ProtectedRoute requiredRole="bendahara">
            <LaporanKeuangan />
          </ProtectedRoute>
        } />

        {/* Sekretaris Routes */}
        <Route path="/sekretaris" element={
          <ProtectedRoute requiredRole="sekretaris">
            <SekretarisDashboard />
          </ProtectedRoute>
        } />
        <Route path="/sekretaris/anggota" element={
          <ProtectedRoute requiredRole="sekretaris">
            <AnggotaList />
          </ProtectedRoute>
        } />
        <Route path="/sekretaris/rapat" element={
          <ProtectedRoute requiredRole="sekretaris">
            <RapatManager />
          </ProtectedRoute>
        } />
        <Route path="/sekretaris/presensi" element={
          <ProtectedRoute requiredRole="sekretaris">
            <PresensiList />
          </ProtectedRoute>
        } />
        <Route path="/sekretaris/pengumuman" element={
          <ProtectedRoute requiredRole="sekretaris">
            <PengumumanList />
          </ProtectedRoute>
        } />

        <Route path="*" element={<Navigate replace to="/" />} />
      </Routes>
    </Router>
  );
}
