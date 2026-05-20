'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, 
  Users, 
  Wallet, 
  Trophy, 
  Bell, 
  PieChart, 
  Settings, 
  LogOut,
  ChevronLeft,
  ChevronRight,
  TrendingUp,
  Layers,
  Loader2
} from 'lucide-react';
import { cn } from '@/lib/utils';

import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigation } from './NavigationProgress';

const adminItems = [
  { name: 'Groups & Payments', icon: Layers, href: '/admin/dashboard' },
  { name: 'Messages', icon: Bell, href: '/admin/notifications' },
];

const memberItems = [
  { name: 'Dashboard', icon: LayoutDashboard, href: '/customer/dashboard' },
  { name: 'My Groups', icon: Layers, href: '/customer/my-groups' },
  { name: 'Payment History', icon: Wallet, href: '/customer/history' },
  { name: 'Notifications', icon: Bell, href: '/customer/notifications' },
  { name: 'Settings', icon: Settings, href: '/customer/settings' },
];

interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

import { useSession } from 'next-auth/react';

export default function Sidebar({ isOpen, onClose }: SidebarProps) {
  const { data: session } = useSession();
  const pathname = usePathname();
  const router = useRouter();
  const { startNavigation } = useNavigation();
  const [collapsed, setCollapsed] = React.useState(false);
  const [role, setRole] = React.useState<string | null>(null);
  const [pendingHref, setPendingHref] = React.useState<string | null>(null);

  React.useEffect(() => {
    setRole(localStorage.getItem('userRole'));
  }, []);

  React.useEffect(() => {
    setPendingHref(null);
  }, [pathname]);

  const items = role === 'admin' ? adminItems : memberItems;

  const [isLoggingOut, setIsLoggingOut] = React.useState(false);
  const [showLogoutModal, setShowLogoutModal] = React.useState(false);

  const handleLogout = () => {
    setIsLoggingOut(true);
    localStorage.removeItem('userRole');
    router.push('/');
  };

  const userName = session?.user?.name || (role === 'admin' ? 'Agent User' : 'Member User');
  const userInitials = userName
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  const handleNavigate = (href: string) => {
    if (pathname.startsWith(href)) {
      onClose?.();
      return;
    }
    startNavigation();
    setPendingHref(href);
    onClose?.();
    router.push(href);
  };

  const SidebarContent = (
    <div 
      className={cn(
        "flex flex-col h-full bg-white border-r border-slate-200 transition-all duration-300 ease-in-out overflow-hidden",
        collapsed ? "w-20" : "w-64"
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 h-16 border-b border-indigo-900/20 bg-gradient-to-r from-slate-900 to-indigo-950 flex-shrink-0">
        {!collapsed && (
          <div className="flex items-center gap-2 min-w-0">
            <div className="w-8 h-8 rounded-lg bg-blue-500 flex items-center justify-center text-white font-bold text-xl shadow-md shrink-0">
              C
            </div>
            <span className="font-bold text-lg tracking-tight text-white truncate">ChitFlow</span>
          </div>
        )}
        {collapsed && (
          <div className="w-8 h-8 rounded-lg bg-blue-500 flex items-center justify-center text-white font-bold text-xl mx-auto shadow-md">
            C
          </div>
        )}
        <button 
          type="button"
          onClick={() => setCollapsed(!collapsed)}
          className="p-1.5 rounded-lg hover:bg-white/10 text-slate-300 hover:text-white transition-colors hidden md:block shrink-0"
        >
          {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
        </button>
      </div>

      {/* Nav — scrollable middle section */}
      <nav className="flex-1 overflow-y-auto py-6 px-3 space-y-1 custom-scrollbar">
        {items.map((item) => {
          const isActive = pathname.startsWith(item.href);
          const isPending = pendingHref === item.href;
          return (
            <button
              key={item.name}
              type="button"
              onClick={() => handleNavigate(item.href)}
              disabled={isPending}
              className={cn(
                "flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-200 group relative w-full text-left",
                isActive 
                  ? "bg-blue-50 text-blue-700 font-bold" 
                  : "text-slate-600 hover:bg-slate-50 hover:text-slate-900",
                isPending && "opacity-80"
              )}
            >
              {isActive && (
                <motion.div 
                  layoutId="active-pill"
                  className="absolute left-0 w-1 h-6 bg-blue-600 rounded-r-full"
                />
              )}
              {isPending ? (
                <Loader2 size={20} className="min-w-[20px] animate-spin text-blue-600 relative z-10" />
              ) : (
                <item.icon size={20} className={cn(
                  "min-w-[20px] transition-colors relative z-10",
                  isActive ? "text-blue-600" : "text-slate-400 group-hover:text-slate-600"
                )} />
              )}
              {!collapsed && (
                <span className="text-sm relative z-10 flex-1 truncate">
                  {isPending ? 'Loading...' : item.name}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Bottom — always visible, never scrolled away */}
      <div className="flex-shrink-0 p-4 border-t border-slate-100 bg-slate-50">
        <div className={cn(
          "flex items-center gap-3 p-2.5 rounded-xl bg-white border border-slate-200 mb-3 shadow-sm",
          collapsed ? "justify-center" : "px-3"
        )}>
          <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center text-white font-bold text-[10px] shadow-md shrink-0">
            {userInitials}
          </div>
          {!collapsed && (
            <div className="flex-1 overflow-hidden min-w-0">
              <p className="text-xs font-bold text-slate-900 truncate uppercase tracking-tight">{userName}</p>
              <p className="text-[10px] font-bold text-indigo-600 truncate uppercase tracking-widest">
                {role === 'admin' ? 'Agent' : 'Member'}
              </p>
            </div>
          )}
        </div>
        
        <button 
          type="button"
          onClick={() => setShowLogoutModal(true)}
          disabled={isLoggingOut}
          className={cn(
            "flex items-center gap-3 w-full px-3 py-3 rounded-xl text-slate-500 hover:bg-red-500 hover:text-white transition-all font-bold group border border-transparent hover:border-red-500",
            collapsed ? "justify-center" : ""
          )}
        >
          {isLoggingOut ? (
            <Loader2 size={20} className="animate-spin" />
          ) : (
            <LogOut size={20} className="min-w-[20px] transition-transform group-hover:-translate-x-1" />
          )}
          {!collapsed && <span className="text-sm">Logout safely</span>}
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden lg:block sticky top-0 h-screen flex-shrink-0">
        {SidebarContent}
      </aside>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={onClose}
              className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-40 lg:hidden"
            />
            <motion.aside
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed inset-y-0 left-0 h-[100dvh] z-50 lg:hidden shadow-2xl"
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

const LogoutModal = ({ isOpen, onClose, onConfirm, isLoggingOut }: { isOpen: boolean; onClose: () => void; onConfirm: () => void; isLoggingOut: boolean; }) => {
  if (!isOpen) return null;
  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
        />
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative w-full max-w-sm bg-white dark:bg-slate-900 rounded-3xl shadow-2xl p-6 border border-slate-200 dark:border-slate-800 text-center"
        >
          <div className="w-16 h-16 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center text-red-600 dark:text-red-500 mx-auto mb-4">
            <LogOut size={32} />
          </div>
          <h3 className="text-xl font-black text-slate-900 dark:text-white mb-2">Ready to leave?</h3>
          <p className="text-sm text-slate-500 dark:text-slate-400 mb-8">
            You are about to securely log out of your session. You'll need your credentials to access the dashboard again.
          </p>
          <div className="flex gap-3">
            <button
              onClick={onClose}
              disabled={isLoggingOut}
              className="flex-1 h-12 rounded-xl border border-slate-200 dark:border-slate-800 font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all"
            >
              Cancel
            </button>
            <button
              onClick={onConfirm}
              disabled={isLoggingOut}
              className="flex-1 h-12 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold shadow-lg shadow-red-500/25 transition-all flex items-center justify-center gap-2"
            >
              {isLoggingOut ? <Loader2 size={18} className="animate-spin" /> : 'Yes, Log Out'}
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
