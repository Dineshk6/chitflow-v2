'use client';

import React from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { Bell, LogOut, ChevronRight, Layers, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigation } from './NavigationProgress';
import { useSession } from 'next-auth/react';
import { clearAllAuthSessions } from '@/lib/auth-client';

const springSmooth = { type: 'spring' as const, stiffness: 400, damping: 34 };

const navItems = [
  { name: 'Groups & Payments', icon: Layers, href: '/admin/dashboard' },
  { name: 'Messages', icon: Bell, href: '/admin/notifications' },
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
    <div className="flex flex-col h-full bg-white overflow-hidden">
      <div
        className={cn(
          'flex-shrink-0 border-b border-slate-100 bg-gradient-to-b from-blue-50/80 to-white',
          collapsed ? 'flex flex-col items-center gap-2 py-4 px-2' : 'flex items-center gap-2 p-4'
        )}
      >
        <motion.div
          layout
          className={cn(
            'rounded-xl gradient-blue flex items-center justify-center text-white font-black shadow-md shadow-blue-500/25 shrink-0',
            collapsed ? 'w-11 h-11 text-lg' : 'w-10 h-10 text-base'
          )}
        >
          C
        </motion.div>

        <button
          type="button"
          onClick={() => setCollapsed((c) => !c)}
          className={cn(
            'hidden lg:flex rounded-xl text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-all duration-200 items-center justify-center shrink-0',
            collapsed ? 'w-9 h-9' : 'w-8 h-8'
          )}
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          <motion.span animate={{ rotate: collapsed ? 0 : 180 }} transition={springSmooth}>
            <ChevronRight size={18} />
          </motion.span>
        </button>

        <AnimatePresence mode="wait">
          {!collapsed && (
            <motion.div
              key="brand"
              initial={{ opacity: 0, width: 0 }}
              animate={{ opacity: 1, width: 'auto' }}
              exit={{ opacity: 0, width: 0 }}
              transition={{ duration: 0.2 }}
              className="min-w-0 flex-1 overflow-hidden"
            >
              <p className="font-black text-slate-900 text-sm leading-tight truncate">ChitFlow</p>
              <p className="text-[9px] font-bold text-blue-600 uppercase tracking-widest">Agent</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <nav className={cn('flex-1 overflow-y-auto py-4 space-y-1', collapsed ? 'px-2' : 'px-3')}>
        {navItems.map((item) => {
          const isActive = pathname.startsWith(item.href);
          const isPending = pendingHref === item.href;
          return (
            <button
              key={item.name}
              type="button"
              title={collapsed ? item.name : undefined}
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
                'flex items-center rounded-xl transition-all duration-200 w-full',
                collapsed ? 'justify-center p-3' : 'gap-3 px-3 py-3 text-left',
                isActive
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/25 font-semibold'
                  : 'text-slate-600 hover:bg-blue-50 hover:text-blue-700',
                isPending && 'opacity-70'
              )}
            >
              <item.icon size={20} className={cn('shrink-0', isActive ? 'text-white' : 'text-slate-400')} />
              {!collapsed && <span className="text-sm truncate">{item.name}</span>}
            </button>
          );
        })}
      </nav>

      <div className={cn('flex-shrink-0 border-t border-slate-100', collapsed ? 'p-2 space-y-2' : 'p-3 space-y-2')}>
        <div
          className={cn(
            'flex items-center rounded-xl bg-slate-50 border border-slate-100',
            collapsed ? 'justify-center p-2' : 'gap-3 p-2.5'
          )}
          title={collapsed ? userName : undefined}
        >
          <div className="w-9 h-9 rounded-full gradient-blue flex items-center justify-center text-white text-[10px] font-bold shrink-0">
            {userInitials}
          </div>
          {!collapsed && (
            <div className="min-w-0 flex-1">
              <p className="text-xs font-bold text-slate-900 truncate">{userName}</p>
              <p className="text-[10px] text-blue-600 font-semibold">Agent account</p>
            </div>
          )}
        </div>
        <button
          type="button"
          onClick={() => setShowLogoutModal(true)}
          disabled={isLoggingOut}
          title={collapsed ? 'Sign out' : undefined}
          className={cn(
            'w-full flex items-center justify-center gap-2 font-semibold text-sm border border-slate-200 bg-white text-slate-700',
            'hover:border-red-200 hover:bg-red-50 hover:text-red-600 transition-all duration-200 active:scale-[0.98]',
            collapsed ? 'p-3 rounded-xl' : 'px-4 py-3 rounded-2xl'
          )}
        >
          {isLoggingOut ? <Loader2 size={18} className="animate-spin text-red-500" /> : <LogOut size={16} />}
          {!collapsed && <span>Sign out</span>}
        </button>
      </div>
    </div>
  );

  return (
    <>
      <motion.aside
        initial={false}
        animate={{ width: collapsed ? 84 : 256 }}
        transition={springSmooth}
        className="hidden lg:flex flex-col flex-shrink-0 h-screen sticky top-0 z-20 border-r border-slate-200/80 shadow-sm overflow-hidden"
      >
        {SidebarContent}
      </motion.aside>

      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={onClose}
              className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-40 lg:hidden"
            />
            <motion.aside
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={springSmooth}
              className="fixed inset-y-0 left-0 w-64 z-50 lg:hidden shadow-2xl flex flex-col"
            >
              {SidebarContent}
            </motion.aside>
          </>
        )}
      </AnimatePresence>
      <LogoutModal
        isOpen={showLogoutModal}
        onClose={() => setShowLogoutModal(false)}
        onConfirm={handleLogout}
        isLoggingOut={isLoggingOut}
      />
    </>
  );
}

function LogoutModal({
  isOpen,
  onClose,
  onConfirm,
  isLoggingOut,
}: {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  isLoggingOut: boolean;
}) {
  if (!isOpen) return null;
  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm"
        />
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 12 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 12 }}
          className="relative w-full max-w-sm surface-card p-6 text-center shadow-2xl"
        >
          <div className="w-14 h-14 rounded-2xl bg-red-50 flex items-center justify-center text-red-600 mx-auto mb-4">
            <LogOut size={28} />
          </div>
          <h3 className="text-xl font-black text-slate-900 mb-2">Sign out?</h3>
          <p className="text-sm text-slate-600 mb-6">You&apos;ll need to sign in again to access the agent dashboard.</p>
          <div className="flex flex-col-reverse sm:flex-row gap-3">
            <button type="button" onClick={onClose} disabled={isLoggingOut} className="btn-secondary flex-1 !h-11">
              Cancel
            </button>
            <button
              type="button"
              onClick={onConfirm}
              disabled={isLoggingOut}
              className="flex-1 h-11 rounded-2xl bg-red-600 hover:bg-red-700 text-white font-bold flex items-center justify-center gap-2"
            >
              {isLoggingOut ? <Loader2 size={18} className="animate-spin" /> : 'Sign out'}
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
