'use client';

import React from 'react';
import Link from 'next/link';
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

const adminItems = [
  { name: 'Groups & Payments', icon: Layers, href: '/admin/dashboard' },
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
  const [collapsed, setCollapsed] = React.useState(false);
  const [role, setRole] = React.useState<string | null>(null);

  React.useEffect(() => {
    setRole(localStorage.getItem('userRole'));
  }, []);

  const items = role === 'admin' ? adminItems : memberItems;

  const [isLoggingOut, setIsLoggingOut] = React.useState(false);

  const handleLogout = () => {
    setIsLoggingOut(true);
    localStorage.removeItem('userRole');
    router.push('/');
  };

  const userName = session?.user?.name || (role === 'admin' ? 'Admin User' : 'Member User');
  const userInitials = userName
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  const SidebarContent = (
    <div 
      className={cn(
        "flex flex-col h-full bg-white dark:bg-slate-950 border-r border-slate-200 dark:border-white/5 transition-all duration-300 ease-in-out overflow-hidden",
        collapsed ? "w-20" : "w-64"
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 h-16 border-b border-slate-100 dark:border-white/5 flex-shrink-0">
        {!collapsed && (
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg gradient-blue flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-blue-500/20">
              C
            </div>
            <span className="font-bold text-xl tracking-tight text-slate-900 dark:text-white">ChitFlow</span>
          </div>
        )}
        {collapsed && (
          <div className="w-8 h-8 rounded-lg gradient-blue flex items-center justify-center text-white font-bold text-xl mx-auto shadow-lg shadow-blue-500/20">
            C
          </div>
        )}
        <button 
          onClick={() => setCollapsed(!collapsed)}
          className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-900 text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors hidden md:block"
        >
          {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
        </button>
      </div>

      {/* Nav — scrollable middle section */}
      <nav className="flex-1 overflow-y-auto py-6 px-3 space-y-1 custom-scrollbar">
        {items.map((item) => {
          const isActive = pathname.startsWith(item.href);
          return (
            <Link
              key={item.name}
              href={item.href}
              onClick={onClose}
              className={cn(
                "flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-200 group relative",
                isActive 
                  ? "bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 font-bold" 
                  : "text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-900/50 hover:text-slate-900 dark:hover:text-white"
              )}
            >
              {isActive && (
                <motion.div 
                  layoutId="active-pill"
                  className="absolute left-0 w-1 h-6 bg-blue-600 dark:bg-blue-500 rounded-r-full"
                />
              )}
              <item.icon size={20} className={cn(
                "min-w-[20px] transition-colors relative z-10",
                isActive ? "text-blue-600 dark:text-blue-400" : "text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-300"
              )} />
              {!collapsed && <span className="text-sm relative z-10">{item.name}</span>}
            </Link>
          );
        })}
      </nav>

      {/* Bottom — always visible, never scrolled away */}
      <div className="flex-shrink-0 p-4 border-t border-slate-100 dark:border-white/5 bg-slate-50/50 dark:bg-slate-900/20">
        <div className={cn(
          "flex items-center gap-3 p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-white/5 mb-3 shadow-sm",
          collapsed ? "justify-center" : "px-3"
        )}>
          <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold text-[10px] shadow-md shadow-blue-600/20">
            {userInitials}
          </div>
          {!collapsed && (
            <div className="flex-1 overflow-hidden">
              <p className="text-xs font-bold text-slate-900 dark:text-white truncate uppercase tracking-tight">{userName}</p>
              <p className="text-[10px] font-bold text-blue-600 dark:text-blue-400 truncate uppercase tracking-widest opacity-80">
                {role === 'admin' ? 'Admin' : 'Member'}
              </p>
            </div>
          )}
        </div>
        
        <button 
          onClick={handleLogout}
          disabled={isLoggingOut}
          className={cn(
            "flex items-center gap-3 w-full px-3 py-3 rounded-xl text-slate-500 dark:text-slate-400 hover:bg-red-50 dark:hover:bg-red-950/30 hover:text-red-600 dark:hover:text-red-400 transition-all font-medium",
            collapsed ? "justify-center" : ""
          )}
        >
          {isLoggingOut ? (
            <Loader2 size={20} className="animate-spin" />
          ) : (
            <LogOut size={20} className="min-w-[20px]" />
          )}
          {!collapsed && <span className="text-sm">Logout</span>}
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
              className="fixed top-0 left-0 h-screen z-50 lg:hidden shadow-2xl"
            >
              {SidebarContent}
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
