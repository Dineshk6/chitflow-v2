'use client';

import React from 'react';
import { Search, Bell, Menu, MessageCircle } from 'lucide-react';
import { cn, formatTimeAgo } from '@/lib/utils';
import { useSession } from 'next-auth/react';
import Link from 'next/link';

interface NavbarProps {
  onMenuClick?: () => void;
}

export default function Navbar({ onMenuClick }: NavbarProps) {
  const { data: session } = useSession();
  const [isScrolled, setIsScrolled] = React.useState(false);
  const [notifications, setNotifications] = React.useState<any[]>([]);
  const [isNotifOpen, setIsNotifOpen] = React.useState(false);
  const notifRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (session) fetchNotifications();
  }, [session]);

  React.useEffect(() => {
    if (!isNotifOpen) return;

    const onPointerDown = (e: MouseEvent | TouchEvent) => {
      const target = e.target as Node;
      if (notifRef.current && !notifRef.current.contains(target)) {
        setIsNotifOpen(false);
      }
    };

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsNotifOpen(false);
    };

    document.body.style.overflow = 'hidden';
    document.addEventListener('mousedown', onPointerDown);
    document.addEventListener('touchstart', onPointerDown);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.body.style.overflow = '';
      document.removeEventListener('mousedown', onPointerDown);
      document.removeEventListener('touchstart', onPointerDown);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [isNotifOpen]);

  const fetchNotifications = async () => {
    try {
      const res = await fetch('/api/notifications');
      const data = await res.json();
      setNotifications(Array.isArray(data) ? data : []);
    } catch {
      /* ignore */
    }
  };

  const markAsRead = async (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
    try {
      const res = await fetch('/api/notifications', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      });
      if (!res.ok) fetchNotifications();
    } catch {
      fetchNotifications();
    }
  };

  const clearAllMessages = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (notifications.length === 0) return;
    setNotifications([]);
    try {
      const res = await fetch('/api/notifications', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ clearAll: true }),
      });
      if (!res.ok) fetchNotifications();
    } catch {
      fetchNotifications();
    }
  };

  React.useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 0);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const isAdmin = session?.user?.role === 'ADMIN';
  const unreadCount = notifications.filter((n) => !n.read).length;
  const memberMessages = notifications.filter((n) => n.type === 'member_message');

  return (
    <header
      className={cn(
        'sticky top-0 z-30 flex h-14 sm:h-16 items-center gap-2 sm:gap-4 border-b border-slate-200 px-3 sm:px-6 transition-all duration-300 bg-white',
        isScrolled && 'shadow-sm'
      )}
    >
      <div className="flex flex-1 items-center gap-2 sm:gap-4 min-w-0">
        <button
          type="button"
          onClick={onMenuClick}
          className="p-2 -ml-1 rounded-xl text-slate-500 hover:bg-slate-100 lg:hidden shrink-0"
          aria-label="Open menu"
        >
          <Menu size={20} />
        </button>

        <div className="relative w-full max-w-md hidden lg:block group min-w-0">
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors"
            size={18}
          />
          <input
            type="text"
            placeholder="Search groups, customers..."
            className="w-full h-10 sm:h-11 pl-10 pr-4 rounded-xl border border-slate-200 bg-slate-50 focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all text-sm text-slate-800"
          />
        </div>
      </div>

      <div className="flex items-center gap-2 shrink-0" ref={notifRef}>
        <button
          type="button"
          onClick={() => setIsNotifOpen((open) => !open)}
          className="relative p-2 sm:p-2.5 rounded-xl text-slate-600 hover:bg-slate-100 border border-slate-200 transition-all"
          aria-label="Messages"
          aria-expanded={isNotifOpen}
        >
          <Bell size={18} className="sm:w-5 sm:h-5" />
          {unreadCount > 0 && (
            <span className="absolute -top-0.5 -right-0.5 min-w-[16px] sm:min-w-[18px] h-4 sm:h-[18px] px-1 bg-blue-600 text-white text-[9px] sm:text-[10px] font-black rounded-full flex items-center justify-center border-2 border-white">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </button>

        {isNotifOpen && (
          <>
            <div
              className="fixed inset-0 bg-slate-900/40 z-40 sm:hidden"
              aria-hidden
            />
            <div
              className={cn(
                'z-50 bg-white border border-slate-200 shadow-xl overflow-hidden flex flex-col',
                'fixed left-3 right-3 top-[3.75rem] max-h-[min(28rem,calc(100dvh-5rem))] rounded-2xl',
                'sm:absolute sm:left-auto sm:right-0 sm:top-full sm:mt-3 sm:w-[min(22rem,calc(100vw-2rem))] sm:max-h-[min(24rem,70dvh)]'
              )}
              onMouseDown={(e) => e.stopPropagation()}
            >
              <div className="px-3 sm:px-4 py-3 border-b border-slate-100 bg-gradient-to-r from-blue-50 to-slate-50 flex justify-between items-start gap-2 shrink-0">
                <div className="min-w-0">
                  <span className="text-xs font-black uppercase tracking-widest text-slate-800">
                    Messages
                  </span>
                  {memberMessages.length > 0 && (
                    <p className="text-[10px] text-violet-600 font-bold mt-0.5 truncate">
                      {memberMessages.filter((m) => !m.read).length} from members
                    </p>
                  )}
                </div>
                {notifications.length > 0 && (
                  <button
                    type="button"
                    onClick={clearAllMessages}
                    className="text-[10px] font-bold text-red-600 hover:underline shrink-0 py-1"
                  >
                    Clear all
                  </button>
                )}
              </div>
              <div className="flex-1 overflow-y-auto overscroll-contain min-h-0">
                {notifications.length === 0 ? (
                  <div className="p-8 sm:p-10 text-center">
                    <MessageCircle size={32} className="text-slate-300 mx-auto mb-2" />
                    <p className="text-xs font-bold text-slate-400">No messages yet</p>
                  </div>
                ) : (
                  notifications.slice(0, 8).map((n) => (
                    <button
                      key={n.id}
                      type="button"
                      onClick={() => markAsRead(n.id)}
                      className={cn(
                        'w-full px-3 sm:px-4 py-3 text-left hover:bg-slate-50 transition-colors border-b border-slate-50 last:border-0',
                        !n.read && 'bg-blue-50/80',
                        n.type === 'member_message' && !n.read && 'bg-violet-50/80'
                      )}
                    >
                      <div className="flex flex-col sm:flex-row sm:items-start gap-1.5 sm:gap-2">
                        {n.type === 'member_message' && (
                          <span className="self-start text-[9px] font-black uppercase text-violet-600 bg-violet-100 px-1.5 py-0.5 rounded">
                            Member
                          </span>
                        )}
                        <div className="min-w-0 flex-1 w-full">
                          <p className="text-xs font-bold text-slate-900 break-words">{n.title}</p>
                          <p className="text-[11px] text-slate-500 line-clamp-3 mt-0.5 break-words">{n.message}</p>
                          <p className="text-[9px] text-slate-400 font-bold mt-1">
                            {formatTimeAgo(n.createdAt)}
                          </p>
                        </div>
                      </div>
                    </button>
                  ))
                )}
              </div>
              {isAdmin && (
                <div className="px-3 sm:px-4 py-3 border-t border-slate-100 bg-slate-50 shrink-0 safe-area-pb">
                  <Link
                    href="/admin/notifications"
                    onClick={() => setIsNotifOpen(false)}
                    className="block w-full text-center h-10 sm:h-9 rounded-lg bg-blue-600 text-white text-xs font-bold hover:bg-blue-700 transition-colors flex items-center justify-center"
                  >
                    Open Messages Center
                  </Link>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </header>
  );
}
