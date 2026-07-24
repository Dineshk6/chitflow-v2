'use client';

import React from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Lock, Eye, EyeOff, ShieldCheck, ArrowRight, CheckCircle2, ArrowLeft, Home } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { signIn, useSession } from 'next-auth/react';
import { toast } from 'sonner';

/* ─────────────────────────
   Custom SVG Logo Mark
───────────────────────── */
function ChitFlowMark({ size = 40 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 44 44" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="markGrad" x1="0" y1="0" x2="44" y2="44" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#3b82f6" />
          <stop offset="100%" stopColor="#6366f1" />
        </linearGradient>
        <linearGradient id="markGrad2" x1="0" y1="0" x2="44" y2="44" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#60a5fa" />
          <stop offset="100%" stopColor="#818cf8" />
        </linearGradient>
      </defs>
      <rect width="44" height="44" rx="13" fill="url(#markGrad)" />
      <rect width="44" height="44" rx="13" fill="url(#markGrad2)" opacity="0.15" />
      <path d="M 10 15 L 17 22 L 10 29" stroke="white" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" opacity="0.55" />
      <path d="M 19 15 L 26 22 L 19 29" stroke="white" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="33" cy="22" r="2.2" fill="white" opacity="0.85" />
    </svg>
  );
}

const features = [
  'Automated dividend & contribution tracking',
  'Real-time payment monitoring across all groups',
  'Instant member SMS & email notifications',
];

export default function AgentLoginPage() {
  const router = useRouter();
  const { status } = useSession();
  React.useEffect(() => { if (status === 'authenticated') router.replace('/admin/dashboard'); }, [status, router]);

  const [isLoading, setIsLoading] = React.useState(false);
  const [identifier, setIdentifier] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [showPassword, setShowPassword] = React.useState(false);
  const [focused, setFocused] = React.useState<string | null>(null);
  const [errors, setErrors] = React.useState<{ identifier?: string; password?: string; general?: string }>({});

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrors({});
    const newErrors: { identifier?: string; password?: string } = {};
    if (!identifier) newErrors.identifier = 'Email or Mobile is required';
    else if (!identifier.includes('@') && !/^\d{10}$/.test(identifier)) newErrors.identifier = 'Enter a valid email or 10-digit mobile';
    if (!password) newErrors.password = 'Password is required';
    if (Object.keys(newErrors).length > 0) { setErrors(newErrors); setIsLoading(false); return; }
    try {
      const result = await signIn('credentials', { identifier, password, expectedRole: 'ADMIN', redirect: false });
      if (result?.error) {
        setErrors({ general: result.error === 'CredentialsSignin' ? 'Invalid credentials. Please try again.' : result.error });
        toast.error('Authentication failed');
      } else {
        localStorage.removeItem('memberSession');
        localStorage.setItem('userRole', 'admin');
        toast.success('Welcome back!');
        router.push('/admin/dashboard');
      }
    } catch { setErrors({ general: 'Something went wrong.' }); toast.error('Error'); }
    finally { setIsLoading(false); }
  };

  const getFieldWrapStyle = (field: string, hasError?: boolean): React.CSSProperties => ({
    position: 'relative', display: 'flex', alignItems: 'center', borderRadius: 14,
    border: hasError
      ? '1px solid rgba(239,68,68,0.5)'
      : focused === field
        ? '1px solid rgba(99,102,241,0.65)'
        : '1px solid rgba(255,255,255,0.08)',
    background: hasError
      ? 'rgba(239,68,68,0.04)'
      : focused === field
        ? 'rgba(99,102,241,0.07)'
        : 'rgba(255,255,255,0.04)',
    boxShadow: focused === field && !hasError ? '0 0 0 3px rgba(99,102,241,0.13)' : 'none',
    transition: 'all 0.18s ease',
  });

  return (
    <main style={{ minHeight: '100vh', background: '#05091a', display: 'flex', flexDirection: 'column', overflow: 'hidden', fontFamily: '-apple-system, BlinkMacSystemFont, "Inter", "Segoe UI", sans-serif', position: 'relative' }}>

      {/* ── Global aurora background ── */}
      <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 0,
        background: [
          'radial-gradient(ellipse 70% 55% at 15% 80%, rgba(37,99,235,0.18) 0%, transparent 65%)',
          'radial-gradient(ellipse 55% 45% at 85% 15%, rgba(99,102,241,0.14) 0%, transparent 60%)',
          '#05091a'
        ].join(', ')
      }} />

      {/* SVG noise grain overlay */}
      <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', opacity: 0.028, pointerEvents: 'none', zIndex: 0 }} aria-hidden>
        <filter id="grain">
          <feTurbulence type="fractalNoise" baseFrequency="0.72" numOctaves="4" stitchTiles="stitch" />
          <feColorMatrix type="saturate" values="0" />
        </filter>
        <rect width="100%" height="100%" filter="url(#grain)" />
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
            <span style={{ color: '#6366f1', fontWeight: 700, fontSize: 9, letterSpacing: '0.14em', textTransform: 'uppercase', display: 'block', marginTop: 2 }}>Admin Console</span>
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
            width: '56%', padding: '60px 56px 40px', position: 'relative', overflow: 'hidden',
            borderRight: '1px solid rgba(255,255,255,0.05)',
          }}
        >
          <div style={{ position: 'absolute', top: -80, left: -60, width: 480, height: 480, borderRadius: '50%', background: 'radial-gradient(circle, rgba(37,99,235,0.13) 0%, transparent 65%)', pointerEvents: 'none' }} />

          {/* Logo */}
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="flex items-center gap-3">
            <ChitFlowMark size={40} />
            <div>
              <p style={{ color: 'white', fontWeight: 800, fontSize: 18, letterSpacing: '-0.04em', lineHeight: 1, margin: 0 }}>ChitFlow</p>
              <p style={{ color: '#6366f1', fontWeight: 700, fontSize: 10, letterSpacing: '0.16em', textTransform: 'uppercase', margin: 0, marginTop: 1 }}>Admin Console</p>
            </div>
          </motion.div>

          {/* Hero copy */}
          <motion.div initial={{ opacity: 0, y: 28 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.55, delay: 0.1 }} className="space-y-8 max-w-[440px]">
            <div className="space-y-3">
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ width: 20, height: 2, background: 'linear-gradient(90deg,#3b82f6,#6366f1)', borderRadius: 2 }} />
                <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.22em', textTransform: 'uppercase', color: 'rgba(99,102,241,0.85)' }}>Enterprise Platform</span>
              </div>
              <h1 style={{ fontSize: 46, fontWeight: 900, color: 'white', lineHeight: 1.06, letterSpacing: '-0.035em', margin: 0 }}>
                The smartest way to{' '}
                <span style={{ background: 'linear-gradient(100deg, #60a5fa 10%, #818cf8 90%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                  run chit funds.
                </span>
              </h1>
            </div>

            <p style={{ color: '#64748b', fontSize: 14, lineHeight: 1.75, maxWidth: 360, margin: 0 }}>
              Manage members, automate dividends, track payments and send notifications — all from a single powerful dashboard.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {features.map((f, i) => (
                <motion.div key={f} initial={{ opacity: 0, x: -14 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.35 + i * 0.1 }}
                  style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <CheckCircle2 size={15} style={{ color: '#3b82f6', flexShrink: 0 }} />
                  <span style={{ color: '#94a3b8', fontSize: 13, fontWeight: 500 }}>{f}</span>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Footer */}
          <div className="flex items-center justify-between">
            <p style={{ color: '#475569', fontSize: 11, fontWeight: 600, margin: 0 }}>© {new Date().getFullYear()} ChitFlow Systems</p>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#22c55e', display: 'inline-block' }} />
              <span style={{ color: '#475569', fontSize: 11, fontWeight: 600 }}>All systems operational</span>
            </div>
          </div>
        </div>

        {/* ════════ RIGHT PANEL ════════ */}
        <div className="flex-1 flex items-center justify-center p-6 md:p-12 relative">

          <motion.div
            initial={{ opacity: 0, y: 24, scale: 0.97 }} animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.18 }}
            style={{ width: '100%', maxWidth: 400 }}
          >
            {/* Card */}
            <div style={{ position: 'relative', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 26, padding: '36px 30px', boxShadow: '0 32px 80px rgba(0,0,0,0.55)', overflow: 'hidden' }}>

              <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 2, background: 'linear-gradient(90deg, #3b82f6, #6366f1)' }} />

              <div style={{ marginBottom: 28 }}>
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '4px 12px', borderRadius: 100, background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.22)', marginBottom: 14 }}>
                  <ShieldCheck size={10} style={{ color: '#818cf8' }} />
                  <span style={{ fontSize: 9, fontWeight: 800, letterSpacing: '0.18em', textTransform: 'uppercase', color: '#818cf8' }}>Secure Agent Login</span>
                </div>
                <h2 style={{ color: 'white', fontSize: 26, fontWeight: 900, letterSpacing: '-0.04em', margin: 0, lineHeight: 1.1 }}>Welcome back</h2>
                <p style={{ color: '#64748b', fontSize: 13, fontWeight: 500, marginTop: 4 }}>Sign in to your admin workspace</p>
              </div>

              {/* General error */}
              <AnimatePresence>
                {errors.general && (
                  <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden" style={{ marginBottom: 16 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 14px', borderRadius: 12, background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', color: '#f87171', fontSize: 12, fontWeight: 600 }}>
                      <ShieldCheck size={13} />{errors.general}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

                {/* Identifier */}
                <div>
                  <label style={{ display: 'block', fontSize: 10, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#64748b', marginBottom: 8 }}>Email or Mobile</label>
                  <div style={getFieldWrapStyle('id', !!errors.identifier)}>
                    <Mail size={14} style={{ position: 'absolute', left: 14, color: focused === 'id' ? '#818cf8' : '#64748b', transition: 'color 0.2s', pointerEvents: 'none' }} />
                    <input
                      type="text" value={identifier} placeholder="admin@chitflow.com"
                      onFocus={() => setFocused('id')} onBlur={() => setFocused(null)}
                      onChange={e => { setIdentifier(e.target.value); if (errors.identifier) setErrors({ ...errors, identifier: '' }); }}
                      style={{ width: '100%', height: 46, paddingLeft: 40, paddingRight: 14, background: 'transparent', border: 'none', outline: 'none', color: 'white', fontSize: 14, fontWeight: 500 }}
                    />
                  </div>
                  <AnimatePresence>
                    {errors.identifier && <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} style={{ fontSize: 11, fontWeight: 700, color: '#f87171', marginTop: 6, paddingLeft: 2 }}>{errors.identifier}</motion.p>}
                  </AnimatePresence>
                </div>

                {/* Password */}
                <div>
                  <label style={{ display: 'block', fontSize: 10, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#64748b', marginBottom: 8 }}>Password</label>
                  <div style={getFieldWrapStyle('pw', !!errors.password)}>
                    <Lock size={14} style={{ position: 'absolute', left: 14, color: focused === 'pw' ? '#818cf8' : '#64748b', transition: 'color 0.2s', pointerEvents: 'none' }} />
                    <input
                      type={showPassword ? 'text' : 'password'} value={password} placeholder="••••••••••••"
                      onFocus={() => setFocused('pw')} onBlur={() => setFocused(null)}
                      onChange={e => { setPassword(e.target.value); if (errors.password) setErrors({ ...errors, password: '' }); }}
                      style={{ width: '100%', height: 46, paddingLeft: 40, paddingRight: 46, background: 'transparent', border: 'none', outline: 'none', color: 'white', fontSize: 14, fontWeight: 500 }}
                    />
                    <button type="button" onClick={() => setShowPassword(!showPassword)}
                      style={{ position: 'absolute', right: 14, color: '#64748b', background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', padding: 0 }}
                    >
                      {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                    </button>
                  </div>
                  <AnimatePresence>
                    {errors.password && <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} style={{ fontSize: 11, fontWeight: 700, color: '#f87171', marginTop: 6, paddingLeft: 2 }}>{errors.password}</motion.p>}
                  </AnimatePresence>
                </div>

                {/* Submit */}
                <button
                  type="submit" disabled={isLoading}
                  style={{ width: '100%', height: 48, marginTop: 4, borderRadius: 14, background: 'linear-gradient(135deg, #2563eb, #4f46e5)', color: 'white', fontSize: 14, fontWeight: 800, border: 'none', cursor: isLoading ? 'not-allowed' : 'pointer', opacity: isLoading ? 0.6 : 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, boxShadow: '0 8px 28px rgba(37,99,235,0.38)' }}
                >
                  {isLoading
                    ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    : <><span>Sign In to Dashboard</span><ArrowRight size={16} /></>
                  }
                </button>
              </form>

              {/* Footer link */}
              <div style={{ marginTop: 24, paddingTop: 18, borderTop: '1px solid rgba(255,255,255,0.06)', textAlign: 'center' }}>
                <p style={{ color: '#64748b', fontSize: 13, fontWeight: 500, margin: 0 }}>
                  No account?{' '}
                  <Link href="/auth/admin/register" style={{ color: '#818cf8', fontWeight: 700, textDecoration: 'none' }}>
                    Request access
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
