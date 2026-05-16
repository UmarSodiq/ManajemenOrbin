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
  Clock,
  Sun,
  Moon,
  Menu,
  X,
  LogOut
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { useTheme } from '../../contexts/ThemeContext';
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
  const { theme, toggleTheme } = useTheme();
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
    <div className="min-h-screen bg-[var(--bg-main)] flex flex-col transition-colors">
      <ConnectionBanner />
      
      <div className="flex flex-1 overflow-hidden">
        {/* Desktop Sidebar */}
        <aside className="hidden lg:flex w-64 bg-slate-900 flex-col relative z-20">
          <div className="p-6">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center shadow-lg shadow-blue-900/20">
                <span className="text-white font-bold text-xs tracking-tighter">OBN</span>
              </div>
              <h2 className="text-sm font-bold tracking-tight text-white uppercase">Sistem Orbin</h2>
            </div>
          </div>

          <nav className="flex-1 px-3 space-y-1 mt-4">
            {filteredNav.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={cn(
                  "flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all text-sm font-medium group",
                  location.pathname === item.path
                    ? "bg-blue-600 text-white shadow-md shadow-blue-900/20"
                    : "text-slate-400 hover:text-white hover:bg-white/5"
                )}
              >
                <item.icon className={cn(
                  "w-4 h-4 transition-colors",
                  location.pathname === item.path ? "text-white" : "text-slate-500 group-hover:text-slate-300"
                )} />
                <span className="tracking-tight">{item.label}</span>
              </Link>
            ))}
          </nav>

          <div className="p-4 border-t border-white/5 space-y-4">
            <button
              onClick={toggleTheme}
              className="w-full flex items-center justify-between px-4 py-2 text-xs font-bold text-slate-400 hover:text-white hover:bg-white/5 rounded-lg transition-all group"
            >
              <div className="flex items-center gap-3">
                {theme === 'light' ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
                <span>{theme === 'light' ? 'Mode Gelap' : 'Mode Terang'}</span>
              </div>
              <div className="w-8 h-4 bg-slate-800 rounded-full relative transition-colors group-hover:bg-slate-700">
                <motion.div 
                  animate={{ x: theme === 'light' ? 2 : 18 }}
                  className="absolute top-1 w-2 h-2 rounded-full bg-slate-400 group-hover:bg-white"
                />
              </div>
            </button>

            <div className="p-4 rounded-xl bg-white/5 border border-white/5">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-blue-600/20 text-blue-400 flex items-center justify-center font-bold text-xs">
                  {user?.username.charAt(0).toUpperCase()}
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-bold text-white truncate">{user?.username}</p>
                  <p className="text-[10px] uppercase text-slate-500 tracking-wider font-semibold">
                    {role === 'bendahara' ? 'Bendahara' : 'Sekretaris'}
                  </p>
                </div>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-4 py-2 text-xs font-bold text-slate-500 hover:text-red-400 hover:bg-white/5 rounded-lg transition-all group"
            >
              <LogOut className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
              Keluar Sesi
            </button>
          </div>
        </aside>

        {/* Mobile Header & Nav */}
        <div className="flex-1 flex flex-col min-w-0 relative">
          <header className="lg:hidden bg-[var(--bg-card)] border-b border-[var(--border-base)] p-4 flex items-center justify-between transition-colors">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white text-xs font-black tracking-tighter shadow-sm">OBN</div>
              <h1 className="font-black tracking-tighter text-[var(--text-primary)]">SISTEM ORBIN</h1>
            </div>
            <div className="flex items-center gap-1.5 px-0.5">
              <button 
                onClick={toggleTheme}
                className="p-2.5 text-[var(--text-primary)] bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 rounded-xl transition-all border border-slate-200 dark:border-white/5"
                aria-label="Toggle Theme"
              >
                {theme === 'light' ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
              </button>
              <button 
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} 
                className="p-2.5 text-[var(--text-primary)] bg-slate-900 dark:bg-blue-600 text-white dark:text-white rounded-xl transition-all shadow-sm"
                aria-label="Toggle Menu"
              >
                {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </header>

          <main className="flex-1 overflow-y-auto bg-[var(--bg-main)] transition-colors">
            {children}
          </main>

          <AnimatePresence>
            {isMobileMenuOpen && (
              <motion.div
                initial={{ opacity: 0, x: '100%' }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: '100%' }}
                className="fixed inset-0 z-50 bg-[var(--bg-main)] lg:hidden flex flex-col transition-colors"
              >
                <div className="p-6 flex justify-between items-center border-b border-[var(--border-base)]">
                  <h2 className="text-xl font-black text-[var(--text-primary)] tracking-tighter">MENU NAVIGASI</h2>
                  <button onClick={() => setIsMobileMenuOpen(false)}>
                    <X className="w-8 h-8 text-[var(--text-primary)]" />
                  </button>
                </div>
                <nav className="p-6 space-y-4 overflow-y-auto">
                  {filteredNav.map((item) => (
                    <Link
                      key={item.path}
                      to={item.path}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className={cn(
                        "flex items-center gap-6 px-6 py-4 rounded-2xl text-lg font-medium transition-all",
                        location.pathname === item.path
                          ? "bg-blue-600 text-white shadow-lg shadow-blue-200 dark:shadow-blue-900/10"
                          : "text-[var(--text-secondary)] hover:bg-[var(--bg-card)]"
                      )}
                    >
                      <item.icon className="w-6 h-6" />
                      {item.label}
                    </Link>
                  ))}
                  <div className="pt-8 mt-8 border-t border-[var(--border-base)]">
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-6 px-6 py-4 rounded-2xl text-lg font-medium text-red-600 bg-red-50 dark:bg-red-900/10"
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
