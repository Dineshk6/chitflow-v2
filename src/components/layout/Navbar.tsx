'use client';

import React from 'react';
import { 
  Search, 
  Bell, 
  Menu, 
  Sun, 
  Moon,
  Plus
} from 'lucide-react';
import { useTheme } from 'next-themes';
import { cn } from '@/lib/utils';

interface NavbarProps {
  onMenuClick?: () => void;
}

import { useSession } from 'next-auth/react';
import Link from 'next/link';

export default function Navbar({ onMenuClick }: NavbarProps) {
  const { theme, setTheme } = useTheme();
  const { data: session } = useSession();
  const [isScrolled, setIsScrolled] = React.useState(false);
  const [notifications, setNotifications] = React.useState<any[]>([]);
  const [isNotifOpen, setIsNotifOpen] = React.useState(false);

  React.useEffect(() => {
    if (session) fetchNotifications();
  }, [session]);

  const fetchNotifications = async () => {
    try {
      const res = await fetch('/api/notifications');
      const data = await res.json();
      setNotifications(Array.isArray(data) ? data : []);
    } catch (err) {}
  };

  const markAsRead = async (id: string) => {
    try {
      await fetch('/api/notifications', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      });
      fetchNotifications();
    } catch (err) {}
  };

  React.useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 0);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const isAdmin = session?.user?.role === 'ADMIN';

  return (
    <header className={cn(
      "sticky top-0 z-30 flex h-16 items-center gap-4 border-b px-6 transition-all duration-300",
      isScrolled 
        ? "glass border-slate-200/50 dark:border-white/5 shadow-sm" 
        : "bg-white dark:bg-slate-950 border-transparent"
    )}>
      <div className="flex flex-1 items-center gap-4">
        <button 
          onClick={onMenuClick}
          className="p-2 -ml-2 rounded-xl text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-900 lg:hidden"
        >
          <Menu size={20} />
        </button>
        
        <div className="relative w-full max-w-md hidden lg:block group">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors" size={18} />
          <input 
            type="text" 
            placeholder="Search groups, customers, transactions..." 
            className="w-full h-11 pl-10 pr-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 focus:outline-none focus:ring-4 focus:ring-blue-500/5 focus:border-blue-500 transition-all text-sm"
          />
        </div>
      </div>

      <div className="flex items-center gap-3">
        {/* Group creation removed for simplified flow */}

        <div className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-slate-900 rounded-xl border border-slate-200/50 dark:border-slate-800">
          <button 
            onClick={() => setTheme('light')}
            className={cn(
              "p-1.5 rounded-lg transition-all duration-200",
              theme === 'light' ? "bg-white text-blue-600 shadow-md" : "text-slate-400 hover:text-slate-600"
            )}
          >
            <Sun size={18} />
          </button>
          <button 
            onClick={() => setTheme('dark')}
            className={cn(
              "p-1.5 rounded-lg transition-all duration-200",
              theme === 'dark' ? "bg-slate-800 text-blue-400 shadow-md" : "text-slate-400 hover:text-slate-300"
            )}
          >
            <Moon size={18} />
          </button>
        </div>

        <div className="relative">
          <button 
            onClick={() => setIsNotifOpen(!isNotifOpen)}
            className="relative p-2.5 rounded-xl text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-900 border border-transparent hover:border-slate-200 dark:hover:border-slate-800 transition-all"
          >
            <Bell size={20} />
            {notifications.some(n => !n.read) && (
              <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-blue-600 rounded-full border-2 border-white dark:border-slate-950"></span>
            )}
          </button>

          {isNotifOpen && (
            <div className="absolute right-0 mt-3 w-80 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden py-2 z-50">
              <div className="px-5 py-3 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
                <span className="text-xs font-black uppercase tracking-widest text-slate-900 dark:text-white">Alerts</span>
                <button className="text-[10px] font-bold text-blue-600">Clear All</button>
              </div>
              <div className="max-h-80 overflow-y-auto">
                {notifications.length === 0 ? (
                  <div className="p-10 text-center text-slate-400 text-[10px] font-bold uppercase italic">No new alerts</div>
                ) : (
                  notifications.map(n => (
                    <button 
                      key={n.id} 
                      onClick={() => markAsRead(n.id)}
                      className={cn(
                        "w-full px-5 py-4 text-left hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors border-b border-slate-50 dark:border-slate-800 last:border-0",
                        !n.read && "bg-blue-50/50 dark:bg-blue-900/10"
                      )}
                    >
                      <p className="text-xs font-bold text-slate-900 dark:text-white">{n.title}</p>
                      <p className="text-[10px] text-slate-500 line-clamp-2 mt-1">{n.message}</p>
                    </button>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        <div className="h-8 w-px bg-slate-200 dark:border-slate-800 mx-1 hidden lg:block"></div>
      </div>
    </header>
  );
}
