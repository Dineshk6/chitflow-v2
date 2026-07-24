'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Phone, ArrowRight, ShieldCheck, ArrowLeft, CheckCircle2, Home } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { clearAllAuthSessions } from '@/lib/auth-client';

/* ── Custom Logo Mark ── */
function ChitFlowMark({ size = 40 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 44 44" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="memMarkGrad" x1="0" y1="0" x2="44" y2="44" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#3b82f6" />
          <stop offset="100%" stopColor="#6366f1" />
        </linearGradient>
      </defs>
      <rect width="44" height="44" rx="13" fill="url(#memMarkGrad)" />
      <path d="M 10 15 L 17 22 L 10 29" stroke="white" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" opacity="0.55" />
      <path d="M 19 15 L 26 22 L 19 29" stroke="white" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="33" cy="22" r="2.2" fill="white" opacity="0.85" />
    </svg>
  );
}

export default function MemberLoginPage() {
  const router = useRouter();

  React.useEffect(() => {
    const memberSession = localStorage.getItem('memberSession');
    if (memberSession) {
      router.replace('/member/dashboard');
    }
  }, [router]);

  const [phone, setPhone] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [focused, setFocused] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!/^\d{10}$/.test(phone)) {
      setError('Please enter a valid 10-digit mobile number.');
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch('/api/member/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Mobile number not found. Contact your agent.');
        return;
      }

      await clearAllAuthSessions();
      localStorage.setItem('memberSession', JSON.stringify({ phone, memberId: data.memberId, name: data.name }));
      toast.success(`Welcome, ${data.name}!`);
      router.push('/member/dashboard');
    } catch (err) {
      setError('Something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main style={{ minHeight: '100vh', background: '#05091a', display: 'flex', flexDirection: 'column', overflow: 'hidden', fontFamily: '-apple-system, BlinkMacSystemFont, "Inter", "Segoe UI", sans-serif', position: 'relative' }}>
      
      {/* ── Background Aurora Mesh ── */}
      <div style={{
        position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 0,
        background: [
          'radial-gradient(ellipse 70% 55% at 15% 80%, rgba(37,99,235,0.18) 0%, transparent 65%)',
          'radial-gradient(ellipse 55% 45% at 85% 15%, rgba(99,102,241,0.14) 0%, transparent 60%)',
          '#05091a'
        ].join(', ')
      }} />

      {/* SVG noise grain */}
      <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', opacity: 0.028, pointerEvents: 'none', zIndex: 0 }}>
        <filter id="memGrain2">
          <feTurbulence type="fractalNoise" baseFrequency="0.72" numOctaves="4" stitchTiles="stitch" />
        </filter>
        <rect width="100%" height="100%" filter="url(#memGrain2)" />
      </svg>

      {/* ════════ RESPONSIVE TOP NAV BAR (Icon Left, Home Right) ════════ */}
      <header style={{
        position: 'relative', zIndex: 30, width: '100%', height: 64, padding: '0 24px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        borderBottom: '1px solid rgba(255,255,255,0.05)', background: 'rgba(5,9,26,0.6)', backdropFilter: 'blur(12px)'
      }}>
        {/* LEFT: Brand Logo & Title */}
        <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none' }}>
          <ChitFlowMark size={32} />
          <div>
            <span style={{ color: 'white', fontWeight: 900, fontSize: 16, letterSpacing: '-0.03em', lineHeight: 1, display: 'block' }}>ChitFlow</span>
            <span style={{ color: '#6366f1', fontWeight: 700, fontSize: 9, letterSpacing: '0.14em', textTransform: 'uppercase', display: 'block', marginTop: 2 }}>Member Portal</span>
          </div>
        </Link>

        {/* RIGHT: Back to Home Button */}
        <Link href="/" style={{
          display: 'inline-flex', alignItems: 'center', gap: 7, padding: '6px 14px', borderRadius: 10,
          background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.09)',
          color: '#e2e8f0', fontSize: 12, fontWeight: 700, textDecoration: 'none', transition: 'all 0.15s ease'
        }}>
          <span>Home</span>
          <ArrowRight size={14} />
        </Link>
      </header>

      {/* Main Body Split */}
      <div style={{ flex: 1, display: 'flex', width: '100%', position: 'relative', zIndex: 1 }}>

        {/* ════════ LEFT PANEL ════════ */}
        <div
          className="hidden lg:flex flex-col justify-between"
          style={{
            width: '54%', padding: '60px 56px 40px', position: 'relative', overflow: 'hidden',
            borderRight: '1px solid rgba(255,255,255,0.05)',
          }}
        >
          <div style={{ position: 'absolute', top: -80, left: -60, width: 480, height: 480, borderRadius: '50%', background: 'radial-gradient(circle, rgba(37,99,235,0.13) 0%, transparent 65%)', pointerEvents: 'none' }} />

          {/* Brand Header */}
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="flex items-center gap-3">
            <ChitFlowMark size={40} />
            <div>
              <p style={{ color: 'white', fontWeight: 900, fontSize: 18, letterSpacing: '-0.04em', margin: 0, lineHeight: 1 }}>ChitFlow</p>
              <p style={{ color: '#6366f1', fontWeight: 700, fontSize: 10, letterSpacing: '0.16em', textTransform: 'uppercase', margin: 0, marginTop: 2 }}>Member Portal</p>
            </div>
          </motion.div>

          {/* Hero copy */}
          <motion.div initial={{ opacity: 0, y: 28 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.1 }} className="space-y-6 max-w-[440px]">
            <div className="space-y-3">
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ width: 20, height: 2, background: 'linear-gradient(90deg,#3b82f6,#6366f1)', borderRadius: 2 }} />
                <span style={{ fontSize: 11, fontWeight: 800, letterSpacing: '0.18em', textTransform: 'uppercase', color: '#60a5fa' }}>Read-Only Member Access</span>
              </div>
              <h1 style={{ fontSize: 44, fontWeight: 900, color: 'white', lineHeight: 1.06, letterSpacing: '-0.035em', margin: 0 }}>
                Track your chits in{' '}
                <span style={{ background: 'linear-gradient(100deg, #60a5fa, #818cf8)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                  real-time.
                </span>
              </h1>
            </div>

            <p style={{ color: '#94a3b8', fontSize: 14, lineHeight: 1.75, margin: 0 }}>
              Enter your registered 10-digit mobile number to access instant dividend records, upcoming payment due dates, and verified ledger histories.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 14, paddingTop: 8 }}>
              {[
                'Instant monthly dividend calculation breakdown',
                'Upcoming due dates and verified payment receipts',
                'Printable scheme statements and winner records'
              ].map(f => (
                <div key={f} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <CheckCircle2 size={16} style={{ color: '#3b82f6', flexShrink: 0 }} />
                  <span style={{ color: '#cbd5e1', fontSize: 13, fontWeight: 500 }}>{f}</span>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Footer */}
          <div style={{ color: '#475569', fontSize: 12, fontWeight: 600 }}>
            © {new Date().getFullYear()} ChitFlow Systems. All rights reserved.
          </div>
        </div>

        {/* ════════ RIGHT PANEL (Form) ════════ */}
        <div className="flex-1 flex items-center justify-center p-6 md:p-12 relative">
          
          <motion.div initial={{ opacity: 0, y: 20, scale: 0.97 }} animate={{ opacity: 1, y: 0, scale: 1 }} transition={{ duration: 0.4, delay: 0.1 }}
            style={{ width: '100%', maxWidth: 400 }}
          >
            {/* Card Wrapper */}
            <div style={{
              position: 'relative', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: 26, padding: '36px 30px', boxShadow: '0 32px 80px rgba(0,0,0,0.55)', overflow: 'hidden'
            }}>
              <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 2, background: 'linear-gradient(90deg, #3b82f6, #6366f1)' }} />

              <div style={{ marginBottom: 28 }}>
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '4px 12px', borderRadius: 100, background: 'rgba(59,130,246,0.1)', border: '1px solid rgba(59,130,246,0.2)', marginBottom: 14 }}>
                  <ShieldCheck size={12} style={{ color: '#60a5fa' }} />
                  <span style={{ fontSize: 9, fontWeight: 800, letterSpacing: '0.16em', textTransform: 'uppercase', color: '#93c5fd' }}>Member Portal</span>
                </div>
                <h2 style={{ color: 'white', fontSize: 26, fontWeight: 900, letterSpacing: '-0.03em', margin: 0 }}>Lookup Account</h2>
                <p style={{ color: '#64748b', fontSize: 13, fontWeight: 500, marginTop: 4 }}>Enter your registered 10-digit mobile number</p>
              </div>

              <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
                <div>
                  <label style={{ display: 'block', fontSize: 10, fontWeight: 800, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#64748b', marginBottom: 8 }}>Mobile Number</label>
                  <div style={{
                    position: 'relative', display: 'flex', alignItems: 'center', borderRadius: 14,
                    border: error ? '1px solid rgba(239,68,68,0.5)' : focused ? '1px solid rgba(99,102,241,0.65)' : '1px solid rgba(255,255,255,0.08)',
                    background: error ? 'rgba(239,68,68,0.04)' : focused ? 'rgba(99,102,241,0.07)' : 'rgba(255,255,255,0.04)',
                    transition: 'all 0.18s ease'
                  }}>
                    <Phone size={15} style={{ position: 'absolute', left: 14, color: focused ? '#818cf8' : '#64748b' }} />
                    <input
                      type="tel"
                      value={phone}
                      maxLength={10}
                      onFocus={() => setFocused(true)}
                      onBlur={() => setFocused(false)}
                      onChange={e => { setPhone(e.target.value.replace(/\D/g, '').slice(0, 10)); setError(''); }}
                      placeholder="9876543210"
                      style={{ width: '100%', height: 48, paddingLeft: 42, paddingRight: 14, background: 'transparent', border: 'none', outline: 'none', color: 'white', fontSize: 14, fontWeight: 600 }}
                    />
                  </div>
                  {error && (
                    <p style={{ fontSize: 11, fontWeight: 700, color: '#f87171', marginTop: 6, margin: '6px 0 0 2px' }}>{error}</p>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  style={{
                    width: '100%', height: 48, borderRadius: 14, background: 'linear-gradient(135deg, #2563eb, #4f46e5)',
                    color: 'white', fontSize: 13, fontWeight: 800, border: 'none', cursor: isLoading ? 'not-allowed' : 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, boxShadow: '0 8px 24px rgba(37,99,235,0.35)',
                    opacity: isLoading ? 0.7 : 1, transition: 'all 0.15s ease'
                  }}
                >
                  {isLoading ? (
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      Access Dashboard
                      <ArrowRight size={15} />
                    </>
                  )}
                </button>
              </form>

              <div style={{ marginTop: 24, paddingTop: 18, borderTop: '1px solid rgba(255,255,255,0.06)', textAlign: 'center' }}>
                <p style={{ color: '#64748b', fontSize: 13, fontWeight: 500, margin: 0 }}>
                  Are you an organizer?{' '}
                  <Link href="/auth/admin/login" style={{ color: '#60a5fa', fontWeight: 700, textDecoration: 'none' }}>
                    Agent Portal
                  </Link>
                </p>
              </div>
            </div>
          </motion.div>

        </div>
      </div>
    </main>
  );
}
