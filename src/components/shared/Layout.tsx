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
  Package,
  LogOut,
  Menu,
  X,
  HelpCircle,
  Camera,
  Vote,
  User,
  Instagram
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import ConnectionBanner from './ConnectionBanner';
import ThemeToggle from './ThemeToggle';
import { useLanguageStore } from '../../store/useLanguageStore';
import { cn, calculateAge } from '../../lib/utils';
import { motion, AnimatePresence } from 'motion/react';

interface NavItem {
  id: string;
  path: string;
  icon: any;
  roles: ('bendahara' | 'sekretaris' | 'anggota')[] | 'all';
}

const NAV_ITEMS: NavItem[] = [
  { id: 'dashboard', path: '/', icon: LayoutDashboard, roles: 'all' },
  // Bendahara view
  { id: 'income', path: '/bendahara/kas-masuk', icon: ArrowUpCircle, roles: ['bendahara'] },
  { id: 'dues', path: '/bendahara/iuran', icon: Wallet, roles: ['bendahara'] },
  { id: 'expense', path: '/bendahara/kas-keluar', icon: ArrowDownCircle, roles: ['bendahara'] },
  { id: 'report', path: '/bendahara/laporan', icon: FileText, roles: ['bendahara'] },
  // Sekretaris view
  { id: 'members', path: '/sekretaris/anggota', icon: UsersIcon, roles: ['sekretaris'] },
  { id: 'presence', path: '/sekretaris/presensi', icon: Calendar, roles: ['sekretaris'] },
  // Shared / Member accessible (But excluded from Bendahara as per request)
  { id: 'announcement', path: '/pengumuman', icon: Megaphone, roles: ['sekretaris', 'anggota'] },
  { id: 'minutes', path: '/rapat', icon: ClipboardList, roles: ['sekretaris', 'anggota'] },
  { id: 'polling', path: '/polling', icon: Vote, roles: ['sekretaris', 'anggota'] },
  { id: 'gallery', path: '/galeri', icon: Camera, roles: 'all' },
  { id: 'calendar', path: '/kalender', icon: Calendar, roles: 'all' },
  { id: 'profile', path: '/profil', icon: User, roles: ['anggota'] },
  { id: 'assets', path: '/assets', icon: Package, roles: ['sekretaris'] },
];

export default function Layout({ children }: { children: React.ReactNode }) {
  const { user, role, logout } = useAuth();
  const { t } = useLanguageStore();
  const location = useLocation();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);

  const orgAge = calculateAge(new Date('2017-12-31'));

  const filteredNav = NAV_ITEMS.filter(item => {
    if (item.roles === 'all') return true;
    return (item.roles as string[]).includes(role || '');
  }).map(item => {
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
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900 flex flex-col transition-colors duration-300">
      <ConnectionBanner />
      
      <div className="flex flex-1 overflow-hidden">
        {/* Desktop Sidebar */}
        <aside className="hidden lg:flex w-72 bg-white dark:bg-slate-900 border-r border-gray-200 dark:border-slate-800 flex-col">
          <div className="p-8">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white">
                  <span className="font-bold text-xs">OP</span>
                </div>
                <div>
                  <h2 className="text-[14px] font-bold tracking-tight text-slate-900 dark:text-white leading-none">{t('org_name')}</h2>
                  <p className="text-gray-400 dark:text-slate-500 text-[10px] font-mono uppercase tracking-[0.1em] mt-1">{t('org_desc')}</p>
                </div>
              </div>
            </div>
            <ThemeToggle />
          </div>

          <nav className="flex-1 px-4 space-y-1">
            <div className="px-4 mb-4">
              <h3 className="text-[11px] font-bold text-gray-400 dark:text-slate-500 uppercase tracking-[0.1em]">{t('nav_main')}</h3>
            </div>
            {filteredNav.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={cn(
                  "flex items-center gap-3 px-4 py-3 rounded-xl transition-all text-sm font-medium group",
                  location.pathname === item.path
                    ? "bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400"
                    : "text-gray-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800"
                )}
              >
                <item.icon className={cn(
                  "w-5 h-5 transition-colors",
                  location.pathname === item.path 
                    ? "text-blue-600 dark:text-blue-400" 
                    : "text-gray-400 dark:text-slate-500 group-hover:text-slate-900 dark:group-hover:text-white"
                )} />
                {t(item.id)}
              </Link>
            ))}
          </nav>

          <div className="p-6 border-t border-gray-100 dark:border-slate-800">
            <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-gray-100 dark:border-slate-800 mb-4">
              <p className="text-[10px] font-bold text-gray-400 dark:text-slate-500 uppercase tracking-widest mb-2">{t('org_age')}</p>
              <div className="flex items-baseline gap-1">
                <span className="text-xl font-bold text-slate-900 dark:text-white">{orgAge.years}</span>
                <span className="text-xs text-gray-400 dark:text-slate-500 font-medium">{t('year')}</span>
                <span className="text-xl font-bold text-slate-900 dark:text-white ml-2">{orgAge.months}</span>
                <span className="text-xs text-gray-400 dark:text-slate-500 font-medium">{t('month')}</span>
              </div>
              <p className="text-[9px] text-gray-400 dark:text-slate-500 mt-1 font-mono">{t('standing_since')} 2017</p>
            </div>
            
            <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-gray-100 dark:border-slate-800 mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 flex items-center justify-center font-bold text-sm">
                  {user?.username.charAt(0).toUpperCase()}
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-bold text-slate-900 dark:text-white truncate">{user?.username}</p>
                  <p className="text-[10px] font-mono uppercase text-gray-400 dark:text-slate-500 tracking-wider">
                    {role === 'bendahara' ? 'Bendahara' : role === 'sekretaris' ? 'Sekretaris' : 'Anggota'}
                  </p>
                </div>
              </div>
            </div>
            <Link
              to="/guide"
              className={cn(
                "flex items-center gap-3 px-4 py-3 rounded-xl transition-all text-sm font-medium group mb-2",
                location.pathname === '/guide'
                  ? "bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400"
                  : "text-gray-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-amber-50 dark:hover:bg-amber-900/20"
              )}
            >
              <HelpCircle className={cn(
                "w-5 h-5 transition-colors",
                location.pathname === '/guide' ? "text-amber-600" : "text-gray-400 dark:text-slate-500 group-hover:text-slate-900 dark:group-hover:text-white"
              )} />
              {t('guide')}
            </Link>
            <a
              href="https://www.instagram.com/orbin_est.17"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 px-4 py-3 rounded-xl transition-all text-sm font-medium group mb-2 text-gray-500 dark:text-slate-400 hover:text-pink-600 dark:hover:text-pink-400 hover:bg-pink-50 dark:hover:bg-pink-900/10"
            >
              <Instagram className="w-5 h-5 transition-colors group-hover:text-pink-600" />
              Instagram (@orbin_est.17)
            </a>
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-4 py-3 text-sm font-medium text-gray-500 dark:text-slate-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-all group"
            >
              <LogOut className="w-5 h-5" />
              {t('logout')}
            </button>
          </div>
        </aside>

        {/* Mobile Header & Nav */}
        <div className="flex-1 flex flex-col min-w-0 relative">
          <header className="lg:hidden bg-white dark:bg-slate-900 border-b border-gray-200 dark:border-slate-800 p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white text-xs font-bold">OP</div>
              <h1 className="font-bold tracking-tight text-slate-900 dark:text-white leading-tight">ORBIN</h1>
            </div>
            <div className="flex items-center gap-2">
              <ThemeToggle />
              <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="text-slate-900 dark:text-white p-2">
                {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </header>

          <main className="flex-1 overflow-y-auto bg-gray-50 dark:bg-slate-950 transition-colors duration-300">
            {children}
          </main>

          <AnimatePresence>
            {isMobileMenuOpen && (
              <motion.div
                initial={{ opacity: 0, x: '100%' }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: '100%' }}
                className="fixed inset-0 z-50 bg-white dark:bg-slate-900 lg:hidden flex flex-col"
              >
                <div className="p-6 flex justify-between items-center border-b border-gray-100 dark:border-slate-800">
                  <h2 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">{t('menu')}</h2>
                  <button onClick={() => setIsMobileMenuOpen(false)}>
                    <X className="w-8 h-8 text-slate-900 dark:text-white" />
                  </button>
                </div>
                <nav className="p-6 space-y-4 overflow-y-auto">
                  {filteredNav.map((item) => (
                    <Link
                      key={item.path}
                      to={item.path}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className={cn(
                        "flex items-center gap-6 px-6 py-4 rounded-2xl text-lg font-medium",
                        location.pathname === item.path
                          ? "bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400"
                          : "text-gray-500 dark:text-slate-400"
                      )}
                    >
                      <item.icon className="w-6 h-6" />
                      {t(item.id)}
                    </Link>
                  ))}
                  <div className="pt-8 mt-8 border-t border-gray-100 dark:border-slate-800">
                    <div className="px-6 mb-6">
                      <p className="text-xs font-bold text-gray-400 dark:text-slate-500 uppercase tracking-widest mb-2">{t('org_age')}</p>
                      <div className="flex items-baseline gap-2">
                        <span className="text-2xl font-bold text-slate-900 dark:text-white">{orgAge.years}</span>
                        <span className="text-sm text-gray-400 dark:text-slate-500 font-medium">{t('year')}</span>
                        <span className="text-2xl font-bold text-slate-900 dark:text-white ml-4">{orgAge.months}</span>
                        <span className="text-sm text-gray-400 dark:text-slate-500 font-medium">{t('month')}</span>
                      </div>
                    </div>
                    <Link
                      to="/guide"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className={cn(
                        "flex items-center gap-6 px-6 py-4 rounded-2xl text-lg font-medium mb-4",
                        location.pathname === '/guide'
                          ? "bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400"
                          : "text-gray-500 dark:text-slate-400"
                      )}
                    >
                      <HelpCircle className="w-6 h-6" />
                      {t('guide')}
                    </Link>
                    <a
                      href="https://www.instagram.com/orbin_est.17"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-6 px-6 py-4 rounded-2xl text-lg font-medium mb-4 text-gray-500 dark:text-slate-400 hover:text-pink-600 dark:hover:text-pink-400 hover:bg-pink-50 dark:hover:bg-pink-900/10"
                    >
                      <Instagram className="w-6 h-6 text-pink-500" />
                      Instagram (@orbin_est.17)
                    </a>
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-6 px-6 py-4 rounded-2xl text-lg font-medium text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20"
                    >
                      <LogOut className="w-6 h-6" />
                      {t('logout_confirm')}
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
