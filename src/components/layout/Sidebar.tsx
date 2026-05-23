'use client';

import React from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { Bell, LogOut, ChevronRight, Layers, Loader2, Sparkles, Settings } from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigation } from './NavigationProgress';
import { useSession } from 'next-auth/react';
import { clearAllAuthSessions } from '@/lib/auth-client';

const springSmooth = { type: 'spring' as const, stiffness: 380, damping: 30 };

const navItems = [
  { name: 'Groups & Payments', icon: Layers, href: '/admin/dashboard' },
  { name: 'Messages', icon: Bell, href: '/admin/notifications' },
  { name: 'Settings', icon: Settings, href: '/admin/settings' },
];

interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export default function Sidebar({ isOpen, onClose }: SidebarProps) {
  const { data: session } = useSession();
  const pathname = usePathname();
  const router = useRouter();
  const { startNavigation } = useNavigation();
  const [collapsed, setCollapsed] = React.useState(false);
  const [pendingHref, setPendingHref] = React.useState<string | null>(null);
  const [isLoggingOut, setIsLoggingOut] = React.useState(false);
  const [showLogoutModal, setShowLogoutModal] = React.useState(false);
  const [hoveredItem, setHoveredItem] = React.useState<string | null>(null);

  React.useEffect(() => {
    setPendingHref(null);
  }, [pathname]);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await clearAllAuthSessions();
    } finally {
      setIsLoggingOut(false);
      setShowLogoutModal(false);
      router.push('/');
    }
  };

  const userName = session?.user?.name || 'Agent';
  const userInitials = userName
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  const SidebarContent = (
    <div className="flex flex-col h-full bg-slate-50/70 dark:bg-slate-900/60 backdrop-blur-xl border-r border-slate-200/50 dark:border-slate-800/40 overflow-hidden">
      
      {/* Brand Header */}
      <div
        className={cn(
          'flex-shrink-0 border-b border-slate-200/40 dark:border-slate-800/40 bg-gradient-to-b from-indigo-50/30 to-transparent',
          collapsed ? 'flex flex-col items-center gap-2 py-5 px-2' : 'flex items-center gap-3 p-5'
        )}
      >
        <motion.div
          layout
          className={cn(
            'bg-gradient-to-tr from-indigo-600 via-indigo-600 to-blue-600 text-white font-black flex items-center justify-center shrink-0 transition-transform duration-300 shadow-lg shadow-indigo-600/20 hover:scale-105',
            collapsed ? 'w-11 h-11 text-lg rounded-xl' : 'w-10 h-10 text-base rounded-xl'
          )}
        >
          CF
        </motion.div>

        <AnimatePresence mode="wait">
          {!collapsed && (
            <motion.div
              key="brand"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              transition={{ duration: 0.15 }}
              className="min-w-0 flex-1 overflow-hidden"
            >
              <h2 className="font-extrabold text-slate-800 dark:text-white text-sm tracking-tight truncate flex items-center gap-1.5">
                ChitFlow
                <Sparkles size={12} className="text-indigo-600 shrink-0" />
              </h2>
              <p className="text-[9px] font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-widest leading-none mt-0.5">Agent Portal</p>
            </motion.div>
          )}
        </AnimatePresence>

        <button
          type="button"
          onClick={() => setCollapsed((c) => !c)}
          className={cn(
            'hidden lg:flex rounded-xl text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-slate-800 transition-all duration-200 items-center justify-center shrink-0 border border-slate-200/30',
            collapsed ? 'w-9 h-9' : 'w-8 h-8'
          )}
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          <motion.span animate={{ rotate: collapsed ? 0 : 180 }} transition={springSmooth}>
            <ChevronRight size={16} />
          </motion.span>
        </button>
      </div>

      {/* Navigation Links */}
      <nav className={cn('flex-1 overflow-y-auto py-6 space-y-1.5', collapsed ? 'px-2' : 'px-3')}>
        {navItems.map((item) => {
          const isActive = pathname.startsWith(item.href);
          const isPending = pendingHref === item.href;
          return (
            <button
              key={item.name}
              type="button"
              title={collapsed ? item.name : undefined}
              onMouseEnter={() => setHoveredItem(item.name)}
              onMouseLeave={() => setHoveredItem(null)}
              onClick={() => {
                if (pathname.startsWith(item.href)) {
                  onClose?.();
                  return;
                }
                startNavigation();
                setPendingHref(item.href);
                onClose?.();
                router.push(item.href);
              }}
              disabled={isPending}
              className={cn(
                'relative flex items-center rounded-xl transition-all duration-200 w-full group overflow-hidden',
                collapsed ? 'justify-center p-3' : 'gap-3 px-3.5 py-3 text-left',
                isActive
                  ? 'text-white shadow-md shadow-indigo-600/10 font-bold'
                  : 'text-slate-600 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 font-semibold',
                isPending && 'opacity-60'
              )}
            >
              {/* Active Background Slide */}
              {isActive && (
                <motion.div
                  layoutId="active-nav-pill"
                  className="absolute inset-0 bg-gradient-to-r from-indigo-600 to-blue-600 -z-10"
                  transition={springSmooth}
                />
              )}

              {/* Hover highlight background */}
              {!isActive && hoveredItem === item.name && (
                <motion.div
                  layoutId="hover-nav-pill"
                  className="absolute inset-0 bg-indigo-500/5 dark:bg-indigo-500/10 -z-10"
                  transition={{ duration: 0.15 }}
                />
              )}

              <item.icon
                size={18}
                className={cn(
                  'shrink-0 transition-transform duration-200 group-hover:scale-105',
                  isActive ? 'text-white' : 'text-slate-400 dark:text-slate-500 group-hover:text-indigo-600 dark:group-hover:text-indigo-400'
                )}
              />
              {!collapsed && <span className="text-xs tracking-wide truncate">{item.name}</span>}
            </button>
          );
        })}
      </nav>

      {/* Sidebar Footer */}
      <div className={cn('flex-shrink-0 border-t border-slate-200/40 dark:border-slate-800/40 bg-gradient-to-t from-slate-100/50 to-transparent', collapsed ? 'p-2 space-y-3' : 'p-4 space-y-3')}>
        
        {/* User Card */}
        <div
          className={cn(
            'flex items-center rounded-xl bg-white/70 dark:bg-slate-900/60 border border-slate-200/50 dark:border-slate-800/60 shadow-sm transition-all',
            collapsed ? 'justify-center p-2' : 'gap-3 p-2.5'
          )}
          title={collapsed ? userName : undefined}
        >
          <div className="w-9 h-9 rounded-lg bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center text-white text-[11px] font-black shrink-0 shadow-sm">
            {userInitials}
          </div>
          {!collapsed && (
            <div className="min-w-0 flex-1">
              <p className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate">{userName}</p>
              <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">Agent</p>
            </div>
          )}
        </div>

        {/* Logout Button */}
        <button
          type="button"
          onClick={() => setShowLogoutModal(true)}
          disabled={isLoggingOut}
          title={collapsed ? 'Sign out' : undefined}
          className={cn(
            'w-full flex items-center justify-center gap-2 font-bold text-xs border border-slate-200/60 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300',
            'hover:border-red-200 dark:hover:border-red-950/40 hover:bg-red-50/50 dark:hover:bg-red-950/20 hover:text-red-600 transition-all duration-200 active:scale-[0.98]',
            collapsed ? 'p-3 rounded-xl' : 'px-4 py-2.5 rounded-xl'
          )}
        >
          {isLoggingOut ? <Loader2 size={16} className="animate-spin text-red-500" /> : <LogOut size={14} />}
          {!collapsed && <span>Sign out</span>}
        </button>
      </div>

    </div>
  );

  return (
    <>
      <motion.aside
        initial={false}
        animate={{ width: collapsed ? 80 : 256 }}
        transition={springSmooth}
        className="hidden lg:flex flex-col flex-shrink-0 h-screen sticky top-0 z-20 overflow-hidden"
      >
        {SidebarContent}
      </motion.aside>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            key="mobile-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-slate-900/30 backdrop-blur-sm z-40 lg:hidden"
          />
        )}
        {isOpen && (
          <motion.aside
            key="mobile-sidebar"
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={springSmooth}
            className="fixed inset-y-0 left-0 w-64 z-50 lg:hidden shadow-2xl flex flex-col"
          >
            {SidebarContent}
          </motion.aside>
        )}
      </AnimatePresence>
      <AnimatePresence>
        {showLogoutModal && (
          <LogoutModal
            onClose={() => setShowLogoutModal(false)}
            onConfirm={handleLogout}
            isLoggingOut={isLoggingOut}
          />
        )}
      </AnimatePresence>
    </>
  );
}

function LogoutModal({
  onClose,
  onConfirm,
  isLoggingOut,
}: {
  onClose: () => void;
  onConfirm: () => void;
  isLoggingOut: boolean;
}) {
  return (
    <motion.div
      initial="hidden"
      animate="visible"
      exit="hidden"
      className="fixed inset-0 z-[100] flex items-center justify-center p-4"
    >
      <motion.div
        variants={{
          hidden: { opacity: 0 },
          visible: { opacity: 1 }
        }}
        onClick={onClose}
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
      />
      <motion.div
        variants={{
          hidden: { opacity: 0, scale: 0.95, y: 12 },
          visible: { opacity: 1, scale: 1, y: 0 }
        }}
        transition={springSmooth}
        className="relative w-full max-w-sm bg-white dark:bg-slate-900 p-6 text-center shadow-2xl rounded-3xl border border-slate-100 dark:border-slate-800"
      >
        <div className="w-14 h-14 rounded-2xl bg-red-50 dark:bg-red-950/30 flex items-center justify-center text-red-600 dark:text-red-400 mx-auto mb-4">
          <LogOut size={28} />
        </div>
        <h3 className="text-xl font-extrabold text-slate-900 dark:text-white mb-2">Sign out?</h3>
        <p className="text-xs text-slate-600 dark:text-slate-400 mb-6 leading-relaxed">You&apos;ll need to sign in again to access the agent dashboard.</p>
        <div className="grid grid-cols-2 gap-3 mt-6">
          <button 
            type="button" 
            onClick={onClose} 
            disabled={isLoggingOut} 
            className="h-11 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold active:scale-[0.98] transition-all duration-200 text-xs"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isLoggingOut}
            className="h-11 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold flex items-center justify-center gap-2 shadow-lg shadow-red-500/25 active:scale-[0.98] transition-all duration-200 text-xs"
          >
            {isLoggingOut ? <Loader2 size={18} className="animate-spin" /> : 'Sign out'}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}
