'use client';

import React from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { Bell, LogOut, Layers, Loader2, Settings } from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigation } from './NavigationProgress';
import { useSession } from 'next-auth/react';
import { clearAllAuthSessions } from '@/lib/auth-client';

const springSmooth = { type: 'spring' as const, stiffness: 300, damping: 32 };

const navItems = [
  { name: 'Groups & Payments', icon: Layers, href: '/admin/dashboard' },
  { name: 'Messages', icon: Bell, href: '/admin/notifications' },
  { name: 'Settings', icon: Settings, href: '/admin/settings' },
];

/* ── Clean Light Mark ── */
function ChitFlowMark({ size = 34 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 44 44"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={{ width: size, height: size, minWidth: size, minHeight: size, flexShrink: 0, display: 'block' }}
    >
      <defs>
        <linearGradient id="sbMarkGradLight" x1="0" y1="0" x2="44" y2="44" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#2563eb" />
          <stop offset="100%" stopColor="#4f46e5" />
        </linearGradient>
      </defs>
      <rect width="44" height="44" rx="12" fill="url(#sbMarkGradLight)" />
      <path d="M 10 15 L 17 22 L 10 29" stroke="white" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round" opacity="0.6" />
      <path d="M 19 15 L 26 22 L 19 29" stroke="white" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="33" cy="22" r="2.2" fill="white" opacity="0.9" />
    </svg>
  );
}

interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
  collapsed?: boolean;
}

export default function Sidebar({ isOpen, onClose, collapsed = false }: SidebarProps) {
  const { data: session } = useSession();
  const pathname = usePathname();
  const router = useRouter();
  const { startNavigation } = useNavigation();
  const [pendingHref, setPendingHref] = React.useState<string | null>(null);
  const [isLoggingOut, setIsLoggingOut] = React.useState(false);
  const [showLogoutModal, setShowLogoutModal] = React.useState(false);

  React.useEffect(() => { setPendingHref(null); }, [pathname]);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try { await clearAllAuthSessions(); }
    finally { setIsLoggingOut(false); setShowLogoutModal(false); router.push('/'); }
  };

  const userName = session?.user?.name || 'Agent';
  const userInitials = userName.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2);

  const SidebarContent = (
    <div style={{
      display: 'flex', flexDirection: 'column', height: '100%',
      background: '#ffffff',
      borderRight: '1px solid #e2e8f0',
      overflow: 'hidden',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Inter", "Segoe UI", sans-serif',
      position: 'relative',
    }}>

      {/* ── Brand Header — 60px height to match Navbar exactly ── */}
      <div style={{
        flexShrink: 0,
        height: 60,
        padding: collapsed ? '0 12px' : '0 16px',
        borderBottom: '1px solid #f1f5f9',
        display: 'flex',
        alignItems: 'center',
        justifyContent: collapsed ? 'center' : 'flex-start',
        gap: 12,
        position: 'relative',
        zIndex: 1,
        transition: 'padding 0.25s ease',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0 }}>
          <ChitFlowMark size={collapsed ? 36 : 32} />
          <AnimatePresence mode="wait">
            {!collapsed && (
              <motion.div key="brand" initial={{ opacity: 0, x: -6 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -6 }} transition={{ duration: 0.12 }}
                style={{ minWidth: 0, overflow: 'hidden' }}>
                <p style={{ color: '#0f172a', fontWeight: 900, fontSize: 16, letterSpacing: '-0.03em', margin: 0, lineHeight: 1 }}>ChitFlow</p>
                <p style={{ color: '#2563eb', fontWeight: 700, fontSize: 9, letterSpacing: '0.14em', textTransform: 'uppercase', margin: 0, marginTop: 3 }}>Admin Console</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* ── Navigation ── */}
      <nav style={{ flex: 1, overflowY: 'auto', padding: collapsed ? '16px 8px' : '20px 12px', display: 'flex', flexDirection: 'column', gap: 4, position: 'relative', zIndex: 1 }}>
        {/* Section label */}
        {!collapsed && (
          <p style={{ fontSize: 10, fontWeight: 800, letterSpacing: '0.14em', textTransform: 'uppercase', color: '#94a3b8', paddingLeft: 10, marginBottom: 6 }}>Menu</p>
        )}
        {navItems.map((item) => {
          const isActive = pathname.startsWith(item.href);
          const isPending = pendingHref === item.href;
          return (
            <button
              key={item.name}
              type="button"
              title={collapsed ? item.name : undefined}
              onClick={() => {
                if (pathname.startsWith(item.href)) { onClose?.(); return; }
                startNavigation(); setPendingHref(item.href); onClose?.(); router.push(item.href);
              }}
              disabled={isPending}
              style={{
                width: '100%', display: 'flex', alignItems: 'center',
                justifyContent: collapsed ? 'center' : 'flex-start',
                gap: 12,
                padding: collapsed ? '10px' : '10px 12px',
                borderRadius: 12, border: isActive ? '1px solid #bfdbfe' : '1px solid transparent',
                cursor: isPending ? 'not-allowed' : 'pointer',
                opacity: isPending ? 0.6 : 1,
                background: isActive ? '#eff6ff' : 'transparent',
                transition: 'all 0.15s ease',
                textAlign: 'left',
              }}
              onMouseEnter={e => { if (!isActive) (e.currentTarget as HTMLButtonElement).style.background = '#f8fafc'; }}
              onMouseLeave={e => { if (!isActive) (e.currentTarget as HTMLButtonElement).style.background = 'transparent'; }}
            >
              <item.icon size={18} style={{ flexShrink: 0, color: isActive ? '#2563eb' : '#64748b', transition: 'color 0.15s' }} />
              {!collapsed && (
                <span style={{ fontSize: 13, fontWeight: isActive ? 800 : 600, color: isActive ? '#1e40af' : '#475569', letterSpacing: '-0.01em', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {item.name}
                </span>
              )}
              {!collapsed && isActive && (
                <div style={{ marginLeft: 'auto', width: 6, height: 6, borderRadius: '50%', background: '#2563eb', flexShrink: 0 }} />
              )}
            </button>
          );
        })}

        {/* Spacer + platform card */}
        <div style={{ flex: 1, minHeight: 24 }} />
      </nav>

      {/* ── Footer ── */}
      <div style={{
        flexShrink: 0, padding: collapsed ? '12px 8px' : '14px 12px',
        borderTop: '1px solid #f1f5f9',
        display: 'flex', flexDirection: 'column', gap: 8,
        position: 'relative', zIndex: 1,
      }}>
        {/* User card */}
        <div style={{
          display: 'flex', alignItems: 'center',
          justifyContent: collapsed ? 'center' : 'flex-start',
          gap: 10, padding: collapsed ? '8px' : '10px 12px',
          borderRadius: 12, background: '#f8fafc',
          border: '1px solid #e2e8f0',
        }} title={collapsed ? userName : undefined}>
          <div style={{ width: 32, height: 32, borderRadius: 10, background: 'linear-gradient(135deg, #2563eb, #1d4ed8)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: 11, fontWeight: 900, flexShrink: 0 }}>
            {userInitials}
          </div>
          {!collapsed && (
            <div style={{ minWidth: 0, flex: 1 }}>
              <p style={{ color: '#0f172a', fontSize: 13, fontWeight: 800, margin: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{userName}</p>
              <p style={{ color: '#64748b', fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', margin: 0, marginTop: 1 }}>Admin Agent</p>
            </div>
          )}
        </div>

        {/* Logout */}
        <button
          type="button"
          onClick={() => setShowLogoutModal(true)}
          disabled={isLoggingOut}
          title={collapsed ? 'Sign out' : undefined}
          style={{
            width: '100%', height: 38, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
            borderRadius: 10, border: '1px solid #e2e8f0',
            background: '#ffffff', color: '#64748b',
            fontSize: 12, fontWeight: 700, cursor: 'pointer', transition: 'all 0.15s ease',
          }}
          onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = '#fef2f2'; (e.currentTarget as HTMLButtonElement).style.borderColor = '#fca5a5'; (e.currentTarget as HTMLButtonElement).style.color = '#dc2626'; }}
          onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = '#ffffff'; (e.currentTarget as HTMLButtonElement).style.borderColor = '#e2e8f0'; (e.currentTarget as HTMLButtonElement).style.color = '#64748b'; }}
        >
          {isLoggingOut ? <Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} /> : <LogOut size={14} />}
          {!collapsed && <span>Sign out</span>}
        </button>
      </div>
    </div>
  );

  return (
    <>
      <motion.aside
        initial={false}
        animate={{ width: collapsed ? 72 : 240 }}
        transition={{ type: 'tween', duration: 0.25, ease: [0.25, 0.46, 0.45, 0.94] }}
        className="hidden lg:flex flex-col flex-shrink-0 h-screen sticky top-0 z-20 overflow-hidden"
      >
        {SidebarContent}
      </motion.aside>

      <AnimatePresence>
        {isOpen && (
          <motion.div key="mobile-backdrop" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={onClose} className="fixed inset-0 bg-slate-900/30 backdrop-blur-sm z-40 lg:hidden" />
        )}
        {isOpen && (
          <motion.aside key="mobile-sidebar" initial={{ x: '-100%' }} animate={{ x: 0 }} exit={{ x: '-100%' }}
            transition={springSmooth} className="fixed inset-y-0 left-0 w-60 z-50 lg:hidden shadow-2xl flex flex-col">
            {SidebarContent}
          </motion.aside>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showLogoutModal && (
          <LogoutModal onClose={() => setShowLogoutModal(false)} onConfirm={handleLogout} isLoggingOut={isLoggingOut} />
        )}
      </AnimatePresence>
    </>
  );
}

function LogoutModal({ onClose, onConfirm, isLoggingOut }: { onClose: () => void; onConfirm: () => void; isLoggingOut: boolean; }) {
  return (
    <motion.div initial="hidden" animate="visible" exit="hidden"
      className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <motion.div variants={{ hidden: { opacity: 0 }, visible: { opacity: 1 } }}
        onClick={onClose} className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" />
      <motion.div
        variants={{ hidden: { opacity: 0, scale: 0.95, y: 12 }, visible: { opacity: 1, scale: 1, y: 0 } }}
        transition={springSmooth}
        style={{ position: 'relative', width: '100%', maxWidth: 360, background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: 24, padding: '28px 24px', textAlign: 'center', boxShadow: '0 20px 50px rgba(0,0,0,0.1)' }}
      >
        <div style={{ width: 52, height: 52, borderRadius: 16, background: '#fef2f2', border: '1px solid #fee2e2', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
          <LogOut size={22} style={{ color: '#dc2626' }} />
        </div>
        <h3 style={{ color: '#0f172a', fontSize: 18, fontWeight: 900, letterSpacing: '-0.03em', margin: 0 }}>Sign out?</h3>
        <p style={{ color: '#64748b', fontSize: 13, margin: '8px 0 24px', lineHeight: 1.6 }}>You&apos;ll need to sign in again to access the admin dashboard.</p>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
          <button type="button" onClick={onClose} disabled={isLoggingOut}
            style={{ height: 42, borderRadius: 12, border: '1px solid #e2e8f0', background: '#f8fafc', color: '#475569', fontSize: 13, fontWeight: 700, cursor: 'pointer', transition: 'all 0.15s' }}
            onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = '#f1f5f9'; }}
            onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = '#f8fafc'; }}
          >Cancel</button>
          <button type="button" onClick={onConfirm} disabled={isLoggingOut}
            style={{ height: 42, borderRadius: 12, border: 'none', background: '#dc2626', color: 'white', fontSize: 13, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, boxShadow: '0 4px 14px rgba(220,38,38,0.25)', transition: 'all 0.15s' }}
            onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = '#b91c1c'; }}
            onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = '#dc2626'; }}
          >
            {isLoggingOut ? <Loader2 size={15} className="animate-spin" /> : 'Sign out'}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}
