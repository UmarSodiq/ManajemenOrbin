/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './hooks/useAuth';
import { useThemeStore } from './store/useThemeStore';
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
import AnggotaDashboard from './components/dashboard/AnggotaDashboard';
import ProfilePage from './components/anggota/ProfilePage';
import GuidePage from './components/shared/GuidePage';
import AssetManagement from './components/assets/AssetManagement';
import GalleryPage from './components/gallery/GalleryPage';
import EventCalendar from './components/calendar/EventCalendar';
import PollingManager from './components/polling/PollingManager';
import SinglePollView from './components/polling/SinglePollView';
import OrbinGame from './components/game/OrbinGame';
import { Role } from './types';

// Placeholder components for routes
const DashboardPage = ({ role }: { role: Role }) => (
  <div className="p-8 bg-gray-50 dark:bg-slate-950 min-h-screen">
    <div className="flex justify-between items-center mb-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">Dasbor {role.charAt(0).toUpperCase() + role.slice(1)}</h1>
        <p className="text-gray-500 dark:text-slate-400 mt-1">Ringkasan aktivitas organisasi Anda hari ini.</p>
      </div>
      <div className="bg-white dark:bg-slate-900 px-4 py-2 rounded-xl border border-gray-100 dark:border-slate-800 shadow-sm text-sm font-medium text-slate-900 dark:text-white">
        {new Intl.DateTimeFormat('id-ID', { dateStyle: 'full' }).format(new Date())}
      </div>
    </div>
    
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-gray-100 dark:border-slate-800 shadow-sm h-48 flex items-center justify-center text-gray-400 dark:text-slate-600 italic">
        Komponen ringkasan akan muncul di sini
      </div>
      <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-gray-100 dark:border-slate-800 shadow-sm h-48 flex items-center justify-center text-gray-400 dark:text-slate-600 italic">
        Komponen aktivitas akan muncul di sini
      </div>
      <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-gray-100 dark:border-slate-800 shadow-sm h-48 flex items-center justify-center text-gray-400 dark:text-slate-600 italic">
        Komponen pengumuman akan muncul di sini
      </div>
    </div>
  </div>
);

const PlaceholderPage = ({ title }: { title: string }) => (
  <div className="p-8 flex flex-col items-center justify-center min-h-[60vh] text-center bg-gray-50 dark:bg-slate-950">
    <div className="w-20 h-20 bg-gray-100 dark:bg-slate-900 rounded-3xl flex items-center justify-center mb-6">
      <div className="w-10 h-10 border-4 border-gray-300 dark:border-slate-800 border-t-gray-500 dark:border-t-slate-400 rounded-full animate-spin" />
    </div>
    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{title}</h1>
    <p className="text-gray-500 dark:text-slate-400 mt-2">Halaman ini sedang dalam pengembangan.</p>
  </div>
);

function ProtectedRoute({ children, requiredRoles }: { children: React.ReactNode, requiredRoles?: Role[] }) {
  const { user, role, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-slate-950 text-gray-400 dark:text-slate-600 font-mono text-sm tracking-widest uppercase animate-pulse">
        Memuat Sistem...
      </div>
    );
  }

  if (!user) {
    return <Navigate replace to="/login" />;
  }

  if (requiredRoles && !requiredRoles.includes(role as Role)) {
    return <Navigate replace to="/" />;
  }

  return <Layout>{children}</Layout>;
}

export default function App() {
  const { user, role } = useAuth();
  const { theme } = useThemeStore();

  React.useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  return (
    <Router>
      <Routes>
        <Route path="/login" element={!user ? <LoginForm /> : <Navigate replace to="/" />} />
        
        <Route path="/" element={
          <ProtectedRoute>
            {role === 'bendahara' ? (
              <Navigate replace to="/bendahara" />
            ) : role === 'sekretaris' ? (
              <Navigate replace to="/sekretaris" />
            ) : (
              <Navigate replace to="/anggota" />
            )}
          </ProtectedRoute>
        } />

        {/* Bendahara Routes */}
        <Route path="/bendahara" element={
          <ProtectedRoute requiredRoles={['bendahara']}>
            <BendaharaDashboard />
          </ProtectedRoute>
        } />
        <Route path="/bendahara/kas-masuk" element={
          <ProtectedRoute requiredRoles={['bendahara']}>
            <TransactionPage type="masuk" />
          </ProtectedRoute>
        } />
        <Route path="/bendahara/iuran" element={
          <ProtectedRoute requiredRoles={['bendahara']}>
            <IuranList />
          </ProtectedRoute>
        } />
        <Route path="/bendahara/kas-keluar" element={
          <ProtectedRoute requiredRoles={['bendahara']}>
            <TransactionPage type="keluar" />
          </ProtectedRoute>
        } />
        <Route path="/bendahara/laporan" element={
          <ProtectedRoute requiredRoles={['bendahara']}>
            <LaporanKeuangan />
          </ProtectedRoute>
        } />

        {/* Sekretaris Routes */}
        <Route path="/sekretaris" element={
          <ProtectedRoute requiredRoles={['sekretaris']}>
            <SekretarisDashboard />
          </ProtectedRoute>
        } />
        <Route path="/sekretaris/anggota" element={
          <ProtectedRoute requiredRoles={['sekretaris']}>
            <AnggotaList />
          </ProtectedRoute>
        } />
        <Route path="/sekretaris/presensi" element={
          <ProtectedRoute requiredRoles={['sekretaris']}>
            <PresensiList />
          </ProtectedRoute>
        } />

        {/* Anggota Routes */}
        <Route path="/anggota" element={
          <ProtectedRoute requiredRoles={['anggota']}>
            <AnggotaDashboard />
          </ProtectedRoute>
        } />

        <Route path="/profil" element={
          <ProtectedRoute requiredRoles={['anggota']}>
            <ProfilePage />
          </ProtectedRoute>
        } />

        {/* Shared Routes (Restricted based on role) */}
        <Route path="/pengumuman" element={
          <ProtectedRoute requiredRoles={['sekretaris', 'anggota']}>
            <PengumumanList />
          </ProtectedRoute>
        } />

        <Route path="/rapat" element={
          <ProtectedRoute requiredRoles={['sekretaris', 'anggota']}>
            <RapatManager />
          </ProtectedRoute>
        } />

        <Route path="/guide" element={
          <ProtectedRoute>
            <GuidePage />
          </ProtectedRoute>
        } />

        <Route path="/assets" element={
          <ProtectedRoute requiredRoles={['sekretaris']}>
            <AssetManagement />
          </ProtectedRoute>
        } />

        <Route path="/galeri" element={
          <ProtectedRoute>
            <GalleryPage />
          </ProtectedRoute>
        } />

        <Route path="/kalender" element={
          <ProtectedRoute>
            <EventCalendar />
          </ProtectedRoute>
        } />

        <Route path="/polling" element={
          <ProtectedRoute requiredRoles={['sekretaris', 'anggota']}>
            <PollingManager />
          </ProtectedRoute>
        } />

        <Route path="/polling/:id" element={
          <ProtectedRoute requiredRoles={['sekretaris', 'anggota']}>
            <SinglePollView />
          </ProtectedRoute>
        } />

        <Route path="/game" element={
          <ProtectedRoute>
            <OrbinGame />
          </ProtectedRoute>
        } />

        <Route path="*" element={<Navigate replace to="/" />} />
      </Routes>
    </Router>
  );
}
