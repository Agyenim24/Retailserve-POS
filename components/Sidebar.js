import Link from 'next/link';
import { useRouter } from 'next/router';
import { useSession } from 'next-auth/react';
import {
  HomeIcon,
  ShoppingCartIcon,
  CubeIcon,
  UsersIcon,
  ChartBarIcon,
  InboxStackIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';

export default function Sidebar({ isOpen, onClose }) {
  const router = useRouter();
  const { data: session } = useSession();
  const role = session?.user?.role;

  const links = [
    { name: 'Dashboard', href: '/dashboard', icon: HomeIcon, roles: ['ADMIN', 'MANAGER', 'CASHIER'] },
    { name: 'Point of Sale', href: '/pos', icon: ShoppingCartIcon, roles: ['ADMIN', 'MANAGER', 'CASHIER'] },
    { name: 'Products', href: '/products', icon: CubeIcon, roles: ['ADMIN', 'MANAGER'] },
    { name: 'Inventory', href: '/inventory', icon: InboxStackIcon, roles: ['ADMIN', 'MANAGER'] },
    { name: 'Customers', href: '/customers', icon: UsersIcon, roles: ['ADMIN', 'MANAGER', 'CASHIER'] },
    { name: 'Reports', href: '/reports', icon: ChartBarIcon, roles: ['ADMIN', 'MANAGER'] },
    { name: 'Users', href: '/users', icon: UsersIcon, roles: ['ADMIN', 'MANAGER'] },
    { name: 'Settings', href: '/settings', icon: InboxStackIcon, roles: ['ADMIN'] },
  ];

  const visibleLinks = links.filter(link => link.roles.includes(role));

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div 
          className="lg:hidden fixed inset-0 z-40 bg-slate-900/40 dark:bg-black/60 backdrop-blur-sm"
          onClick={onClose}
        />
      )}

      {/* Sidebar - fixed and toggled on mobile, relative and always visible on lg */}
      <aside className={`
        fixed inset-y-0 left-0 z-50 w-64 bg-surface-card border-r border-slate-200 dark:border-slate-700/50 flex flex-col 
        h-[calc(100vh-64px)] top-16 lg:top-0 lg:h-full lg:static lg:block
        transform transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        <div className="flex justify-between items-center p-5 lg:hidden border-b border-slate-200 dark:border-slate-700/50 bg-slate-50 dark:bg-slate-800/30">
          <span className="font-extrabold text-slate-900 dark:text-white uppercase tracking-widest text-xs">Navigation Menu</span>
          <button onClick={onClose} className="p-2 -mr-2 text-slate-400 hover:text-slate-900 dark:text-slate-500 dark:hover:text-white transition-colors">
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        <nav className="flex-1 py-4 lg:py-6 px-4 space-y-2 overflow-y-auto">
          {visibleLinks.map((link) => {
            const isActive = router.pathname.startsWith(link.href);
            return (
              <Link
                key={link.name}
                href={link.href}
                onClick={() => onClose?.()}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group ${
                  isActive
                    ? 'bg-primary-600 shadow-md shadow-primary-900/20 text-white dark:text-white'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-surface-elevated hover:text-slate-900 dark:hover:text-slate-200'
                }`}
              >
                <link.icon className={`h-5 w-5 ${isActive ? 'text-white' : 'text-slate-500 dark:text-slate-500 group-hover:text-primary-600 dark:group-hover:text-primary-400'}`} />
                <span className="font-medium text-sm">{link.name}</span>
              </Link>
            );
          })}
        </nav>
        <div className="p-4 border-t border-slate-200 dark:border-slate-700/50">
          <div className="bg-surface p-4 rounded-xl border border-slate-200 dark:border-slate-700/50">
            <p className="text-xs text-slate-500 dark:text-slate-500 font-medium">Logged in as</p>
            <p className="text-sm font-semibold text-primary-600 dark:text-primary-400 mt-1">{session?.user?.name}</p>
            <div className="mt-2 inline-flex">
              <span className="badge-blue text-[10px] px-2 py-0.5">{role}</span>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
