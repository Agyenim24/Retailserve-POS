import { signOut } from 'next-auth/react';
import { useTheme } from 'next-themes';
import { useState, useEffect } from 'react';
import { ArrowRightOnRectangleIcon, ShoppingBagIcon, SunIcon, MoonIcon, Bars3Icon } from '@heroicons/react/24/outline';
import LogoutConfirmModal from './LogoutConfirmModal';

export default function Navbar({ onMenuClick }) {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <header className="h-16 bg-surface-card border-b border-slate-200 dark:border-slate-700/50 flex items-center justify-between px-4 sm:px-6 sticky top-0 z-30">
      <div className="flex items-center gap-2 sm:gap-3">
        {onMenuClick && (
          <button 
            onClick={onMenuClick}
            className="p-2 lg:hidden text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition-colors"
          >
            <Bars3Icon className="h-6 w-6" />
          </button>
        )}
        <div className="p-2 bg-primary-600 rounded-lg shadow-lg shadow-primary-900/30 hidden sm:block">
          <ShoppingBagIcon className="h-6 w-6 text-slate-900 dark:text-white" />
        </div>
        <h1 className="text-lg sm:text-xl font-bold bg-gradient-to-r from-primary-400 to-primary-200 bg-clip-text text-transparent tracking-tight">
          RetailServe
        </h1>
      </div>

      <div className="flex items-center gap-4">
        {mounted && (
          <button
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            className="p-2 rounded-lg text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white bg-surface-elevated border border-slate-300 dark:border-slate-700 transition-colors"
            title="Toggle theme"
          >
            {theme === 'dark' ? (
              <SunIcon className="h-5 w-5" />
            ) : (
              <MoonIcon className="h-5 w-5" />
            )}
          </button>
        )}

        <button
          onClick={() => setIsLogoutModalOpen(true)}
          className="flex items-center gap-2 text-sm font-bold text-slate-500 dark:text-slate-400 hover:text-red-400 transition-all bg-surface-elevated hover:bg-red-500/10 px-3 sm:px-4 py-2 rounded-xl border border-slate-300 dark:border-slate-700/50 hover:border-red-500/30"
        >
          <ArrowRightOnRectangleIcon className="h-4 w-4" />
          <span className="hidden sm:inline">Logout</span>
        </button>

        <LogoutConfirmModal 
          isOpen={isLogoutModalOpen}
          onClose={() => setIsLogoutModalOpen(false)}
          onConfirm={() => signOut({ callbackUrl: '/login' })}
        />
      </div>
    </header>
  );
}
