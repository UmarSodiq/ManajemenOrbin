/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Wallet, 
  ArrowUpCircle, 
  ArrowDownCircle, 
  FileText, 
  Users as UsersIcon, 
  Calendar, 
  ClipboardList, 
  Megaphone,
  LogOut,
  Menu,
  X
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import ConnectionBanner from './ConnectionBanner';
import { cn } from '../../lib/utils';
import { motion, AnimatePresence } from 'motion/react';

interface NavItem {
  label: string;
  path: string;
  icon: any;
  role: 'bendahara' | 'sekretaris' | 'all';
}

const NAV_ITEMS: NavItem[] = [
  { label: 'Dasbor', path: '/', icon: LayoutDashboard, role: 'all' },
  // Bendahara
  { label: 'Kas Masuk', path: '/bendahara/kas-masuk', icon: ArrowUpCircle, role: 'bendahara' },
  { label: 'Iuran', path: '/bendahara/iuran', icon: Wallet, role: 'bendahara' },
  { label: 'Kas Keluar', path: '/bendahara/kas-keluar', icon: ArrowDownCircle, role: 'bendahara' },
  { label: 'Laporan Keuangan', path: '/bendahara/laporan', icon: FileText, role: 'bendahara' },
  // Sekretaris
  { label: 'Manajemen Anggota', path: '/sekretaris/anggota', icon: UsersIcon, role: 'sekretaris' },
  { label: 'Notulensi Rapat', path: '/sekretaris/rapat', icon: ClipboardList, role: 'sekretaris' },
  { label: 'Presensi', path: '/sekretaris/presensi', icon: Calendar, role: 'sekretaris' },
  { label: 'Pengumuman', path: '/sekretaris/pengumuman', icon: Megaphone, role: 'sekretaris' },
];

export default function Layout({ children }: { children: React.ReactNode }) {
  const { user, role, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);

  const filteredNav = NAV_ITEMS.filter(item => 
    item.role === 'all' || item.role === role
  ).map(item => {
    // Correct paths based on role if it's Root
    if (item.path === '/') {
      return { ...item, path: `/${role}` };
    }
    return item;
  });

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <ConnectionBanner />
      
      <div className="flex flex-1 overflow-hidden">
        {/* Desktop Sidebar */}
        <aside className="hidden lg:flex w-72 bg-white border-r border-gray-200 flex-col">
          <div className="p-8">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-xs">OP</span>
              </div>
              <div>
                <h2 className="text-lg font-bold tracking-tight text-slate-900 leading-none">REMAJA BRIATANIA NGLEMPONG</h2>
                <p className="text-gray-400 text-[10px] font-mono uppercase tracking-[0.1em] mt-1">Organisasi Management</p>
              </div>
            </div>
          </div>

          <nav className="flex-1 px-4 space-y-1">
            <div className="px-4 mb-4">
              <h3 className="text-[11px] font-bold text-gray-400 uppercase tracking-[0.1em]">Navigasi Utama</h3>
            </div>
            {filteredNav.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={cn(
                  "flex items-center gap-3 px-4 py-3 rounded-xl transition-all text-sm font-medium group",
                  location.pathname === item.path
                    ? "bg-blue-50 text-blue-600"
                    : "text-gray-500 hover:text-slate-900 hover:bg-slate-50"
                )}
              >
                <item.icon className={cn(
                  "w-5 h-5 transition-colors",
                  location.pathname === item.path ? "text-blue-600" : "text-gray-400 group-hover:text-slate-900"
                )} />
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="p-6 border-t border-gray-100">
            <div className="p-4 bg-slate-50 rounded-2xl border border-gray-100 mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-sm">
                  {user?.username.charAt(0).toUpperCase()}
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-bold text-slate-900 truncate">{user?.username}</p>
                  <p className="text-[10px] font-mono uppercase text-gray-400 tracking-wider">
                    {role === 'bendahara' ? 'Bendahara' : 'Sekretaris'}
                  </p>
                </div>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-4 py-3 text-sm font-medium text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all group"
            >
              <LogOut className="w-5 h-5" />
              Keluar Sesi
            </button>
          </div>
        </aside>

        {/* Mobile Header & Nav */}
        <div className="flex-1 flex flex-col min-w-0 relative">
          <header className="lg:hidden bg-white border-b border-gray-200 p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white text-xs font-bold">OP</div>
              <h1 className="font-bold tracking-tight text-slate-900">ORBIN</h1>
            </div>
            <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="text-slate-900">
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </header>

          <main className="flex-1 overflow-y-auto bg-gray-50">
            {children}
          </main>

          <AnimatePresence>
            {isMobileMenuOpen && (
              <motion.div
                initial={{ opacity: 0, x: '100%' }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: '100%' }}
                className="fixed inset-0 z-50 bg-white lg:hidden flex flex-col"
              >
                <div className="p-6 flex justify-between items-center border-b border-gray-100">
                  <h2 className="text-xl font-bold text-slate-900 tracking-tight">MENU</h2>
                  <button onClick={() => setIsMobileMenuOpen(false)}>
                    <X className="w-8 h-8 text-slate-900" />
                  </button>
                </div>
                <nav className="p-6 space-y-4">
                  {filteredNav.map((item) => (
                    <Link
                      key={item.path}
                      to={item.path}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className={cn(
                        "flex items-center gap-6 px-6 py-4 rounded-2xl text-lg font-medium",
                        location.pathname === item.path
                          ? "bg-blue-50 text-blue-600"
                          : "text-gray-500"
                      )}
                    >
                      <item.icon className="w-6 h-6" />
                      {item.label}
                    </Link>
                  ))}
                  <div className="pt-8 mt-8 border-t border-gray-100">
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-6 px-6 py-4 rounded-2xl text-lg font-medium text-red-600 bg-red-50"
                    >
                      <LogOut className="w-6 h-6" />
                      Keluar Sistem
                    </button>
                  </div>
                </nav>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
