'use client';

import React from 'react';
import { Search, Bell, Menu, MessageCircle, X } from 'lucide-react';
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

  React.useEffect(() => { if (session) fetchNotifications(); }, [session]);

  React.useEffect(() => {
    if (!isNotifOpen) return;
    const onPointerDown = (e: MouseEvent | TouchEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) setIsNotifOpen(false);
    };
    const onKeyDown = (e: KeyboardEvent) => { if (e.key === 'Escape') setIsNotifOpen(false); };
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
    } catch { /* ignore */ }
  };

  const markAsRead = async (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
    try {
      const res = await fetch('/api/notifications', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id }) });
      if (!res.ok) fetchNotifications();
    } catch { fetchNotifications(); }
  };

  const clearAllMessages = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (notifications.length === 0) return;
    setNotifications([]);
    try {
      const res = await fetch('/api/notifications', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ clearAll: true }) });
      if (!res.ok) fetchNotifications();
    } catch { fetchNotifications(); }
  };

  React.useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 0);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const isAdmin = session?.user?.role === 'ADMIN';
  const unreadCount = notifications.filter(n => !n.read).length;
  const memberMessages = notifications.filter(n => n.type === 'member_message');
  const userName = session?.user?.name || 'Agent';
  const userInitials = userName.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2);

  return (
    <header
      style={{
        position: 'sticky', top: 0, zIndex: 30,
        display: 'flex', height: 60, alignItems: 'center', gap: 12,
        padding: '0 20px',
        background: isScrolled ? 'rgba(255,255,255,0.98)' : '#ffffff',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        borderBottom: '1px solid #e2e8f0',
        boxShadow: isScrolled ? '0 4px 20px rgba(0,0,0,0.04)' : 'none',
        transition: 'box-shadow 0.2s ease',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Inter", "Segoe UI", sans-serif',
      }}
    >
      {/* Left — Mobile/Desktop Hamburger + Search */}
      <div style={{ display: 'flex', flex: 1, alignItems: 'center', gap: 12, minWidth: 0 }}>
        <button
          type="button"
          onClick={onMenuClick}
          style={{
            width: 36, height: 36, borderRadius: 10,
            border: '1px solid #e2e8f0', background: '#f8fafc',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: '#475569', cursor: 'pointer', flexShrink: 0, transition: 'all 0.15s ease'
          }}
          aria-label="Toggle menu"
          onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = '#f1f5f9'; (e.currentTarget as HTMLButtonElement).style.color = '#0f172a'; }}
          onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = '#f8fafc'; (e.currentTarget as HTMLButtonElement).style.color = '#475569'; }}
        >
          <Menu size={18} />
        </button>

        <p className="lg:hidden" style={{ fontSize: 15, fontWeight: 800, color: '#0f172a', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
          Dashboard
        </p>

        {/* Search */}
        <div className="hidden md:flex" style={{ position: 'relative', width: '100%', maxWidth: 380, minWidth: 0 }}>
          <Search size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#94a3b8', pointerEvents: 'none' }} />
          <input
            type="text"
            placeholder="Search groups, members..."
            style={{ width: '100%', height: 38, paddingLeft: 36, paddingRight: 14, borderRadius: 10, border: '1px solid #e2e8f0', background: '#f8fafc', color: '#0f172a', fontSize: 13, outline: 'none', transition: 'all 0.15s ease' }}
            onFocus={e => { e.currentTarget.style.borderColor = '#93c5fd'; e.currentTarget.style.background = '#ffffff'; e.currentTarget.style.boxShadow = '0 0 0 3px rgba(37,99,235,0.08)'; }}
            onBlur={e => { e.currentTarget.style.borderColor = '#e2e8f0'; e.currentTarget.style.background = '#f8fafc'; e.currentTarget.style.boxShadow = 'none'; }}
          />
        </div>
      </div>

      {/* Right — Notifications Bell + User Avatar */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }} ref={notifRef}>

        {/* Bell */}
        <button
          type="button"
          onClick={() => setIsNotifOpen(open => !open)}
          style={{
            position: 'relative', width: 36, height: 36, borderRadius: 10,
            border: '1px solid #e2e8f0', background: isNotifOpen ? '#eff6ff' : '#f8fafc',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: isNotifOpen ? '#2563eb' : '#64748b', cursor: 'pointer', transition: 'all 0.15s'
          }}
          aria-label="Notifications"
        >
          <Bell size={17} />
          {unreadCount > 0 && (
            <span style={{ position: 'absolute', top: -3, right: -3, minWidth: 16, height: 16, padding: '0 4px', background: '#2563eb', color: 'white', fontSize: 9, fontWeight: 900, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', border: '2px solid #ffffff' }}>
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </button>

        {/* Notifications dropdown */}
        {isNotifOpen && (
          <>
            <div className="fixed inset-0 sm:hidden" style={{ background: 'rgba(15,23,42,0.3)', zIndex: 40 }} aria-hidden />
            <div
              style={{ zIndex: 50, background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: 16, overflow: 'hidden', display: 'flex', flexDirection: 'column', boxShadow: '0 16px 40px rgba(0,0,0,0.08)' }}
              className="fixed left-3 right-3 top-[3.75rem] max-h-[min(28rem,calc(100dvh-5rem))] sm:absolute sm:left-auto sm:right-0 sm:top-full sm:mt-3 sm:w-[min(22rem,calc(100vw-2rem))] sm:max-h-[min(24rem,70dvh)]"
              onMouseDown={e => e.stopPropagation()}
            >
              <div style={{ padding: '14px 16px', borderBottom: '1px solid #f1f5f9', background: '#f8fafc', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexShrink: 0 }}>
                <div>
                  <span style={{ fontSize: 12, fontWeight: 800, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#0f172a' }}>Messages</span>
                  {memberMessages.length > 0 && (
                    <p style={{ fontSize: 10, color: '#2563eb', fontWeight: 600, marginTop: 2 }}>{memberMessages.filter(m => !m.read).length} from members</p>
                  )}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  {notifications.length > 0 && (
                    <button type="button" onClick={clearAllMessages} style={{ fontSize: 11, fontWeight: 700, color: '#dc2626', background: 'none', border: 'none', cursor: 'pointer' }}>Clear all</button>
                  )}
                  <button type="button" onClick={() => setIsNotifOpen(false)} style={{ width: 26, height: 26, borderRadius: 8, border: '1px solid #e2e8f0', background: '#ffffff', color: '#64748b', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <X size={14} />
                  </button>
                </div>
              </div>

              <div style={{ flex: 1, overflowY: 'auto' }}>
                {notifications.length === 0 ? (
                  <div style={{ padding: 40, textAlign: 'center' }}>
                    <MessageCircle size={28} style={{ color: '#cbd5e1', margin: '0 auto 8px' }} />
                    <p style={{ fontSize: 12, color: '#94a3b8', fontWeight: 600 }}>No messages yet</p>
                  </div>
                ) : (
                  notifications.slice(0, 8).map(n => (
                    <button key={n.id} type="button" onClick={() => markAsRead(n.id)}
                      style={{ width: '100%', padding: '12px 16px', textAlign: 'left', background: !n.read ? '#eff6ff' : '#ffffff', borderBottom: '1px solid #f1f5f9', cursor: 'pointer', display: 'block', transition: 'background 0.15s' }}
                      onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = '#f8fafc'; }}
                      onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = !n.read ? '#eff6ff' : '#ffffff'; }}
                    >
                      {n.type === 'member_message' && <span style={{ fontSize: 9, fontWeight: 800, textTransform: 'uppercase', color: '#2563eb', background: '#dbeafe', padding: '2px 6px', borderRadius: 4, marginBottom: 6, display: 'inline-block' }}>Member</span>}
                      <p style={{ fontSize: 12, fontWeight: 700, color: '#0f172a', margin: 0 }}>{n.title}</p>
                      <p style={{ fontSize: 11, color: '#64748b', margin: '3px 0 0', lineHeight: 1.5 }}>{n.message}</p>
                      <p style={{ fontSize: 10, color: '#94a3b8', fontWeight: 600, marginTop: 4 }}>{formatTimeAgo(n.createdAt)}</p>
                    </button>
                  ))
                )}
              </div>

              {isAdmin && (
                <div style={{ padding: '12px 16px', borderTop: '1px solid #f1f5f9', background: '#f8fafc', flexShrink: 0 }}>
                  <Link href="/admin/notifications" onClick={() => setIsNotifOpen(false)}
                    style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 36, borderRadius: 10, background: '#2563eb', color: 'white', fontSize: 12, fontWeight: 700, textDecoration: 'none' }}>
                    Open Messages Center
                  </Link>
                </div>
              )}
            </div>
          </>
        )}

        {/* User avatar */}
        <div style={{ width: 36, height: 36, borderRadius: 10, background: 'linear-gradient(135deg, #2563eb, #1d4ed8)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: 12, fontWeight: 900, flexShrink: 0, cursor: 'default' }}
          title={userName}>
          {userInitials}
        </div>
      </div>
    </header>
  );
}
