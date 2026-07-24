'use client';

import React from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Mail, Lock, ArrowRight, Building, ShieldCheck, Phone, CheckCircle2, Eye, EyeOff, Home } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { signIn } from 'next-auth/react';
import { toast } from 'sonner';

/* ── Shared logo mark (same as login) ── */
function ChitFlowMark({ size = 40 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 44 44" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="rMarkGrad" x1="0" y1="0" x2="44" y2="44" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#3b82f6" />
          <stop offset="100%" stopColor="#6366f1" />
        </linearGradient>
      </defs>
      <rect width="44" height="44" rx="13" fill="url(#rMarkGrad)" />
      <path d="M 10 15 L 17 22 L 10 29" stroke="white" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" opacity="0.55" />
      <path d="M 19 15 L 26 22 L 19 29" stroke="white" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="33" cy="22" r="2.2" fill="white" opacity="0.85" />
    </svg>
  );
}

export default function AgentRegisterPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = React.useState(false);
  const [showPassword, setShowPassword] = React.useState(false);
  const [focused, setFocused] = React.useState<string | null>(null);
  const [formData, setFormData] = React.useState({
    firstName: '', lastName: '', businessName: '',
    email: '', phone: '', password: '', inviteCode: '',
  });
  const [errors, setErrors] = React.useState<Record<string, string>>({});

  const set = (key: string, val: string) => {
    setFormData(p => ({ ...p, [key]: val }));
    if (errors[key]) setErrors(p => ({ ...p, [key]: '' }));
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrors({});
    const err: Record<string, string> = {};
    if (!formData.firstName) err.firstName = 'Required';
    if (!formData.lastName)  err.lastName  = 'Required';
    if (!formData.businessName) err.businessName = 'Required';
    if (!formData.email) err.email = 'Email is required';
    else if (!formData.email.includes('@')) err.email = 'Enter a valid email';
    if (!formData.phone) err.phone = 'Mobile number is required';
    else if (!/^\d{10}$/.test(formData.phone)) err.phone = 'Enter a valid 10-digit number';
    if (!formData.password) err.password = 'Password is required';
    if (!formData.inviteCode) err.inviteCode = 'Access code is required';
    if (Object.keys(err).length > 0) { setErrors(err); setIsLoading(false); return; }

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: `${formData.firstName} ${formData.lastName}`,
          email: formData.email, phone: formData.phone,
          password: formData.password, role: 'ADMIN',
          inviteCode: formData.inviteCode,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setErrors({ general: data.error || 'Something went wrong' });
        toast.error(data.error || 'Something went wrong');
      } else {
        localStorage.setItem('userRole', 'admin');
        toast.success('Account created successfully!');
        const result = await signIn('credentials', { identifier: formData.email, password: formData.password, redirect: false });
        router.push(result?.ok ? '/admin/dashboard' : '/auth/admin/login');
      }
    } catch { setErrors({ general: 'Something went wrong' }); toast.error('Something went wrong'); }
    finally { setIsLoading(false); }
  };

  const fieldWrap = (field: string, hasError?: boolean): React.CSSProperties => ({
    position: 'relative', display: 'flex', alignItems: 'center', borderRadius: 13,
    border: hasError ? '1px solid rgba(239,68,68,0.5)' : focused === field ? '1px solid rgba(99,102,241,0.65)' : '1px solid rgba(255,255,255,0.08)',
    background: hasError ? 'rgba(239,68,68,0.04)' : focused === field ? 'rgba(99,102,241,0.07)' : 'rgba(255,255,255,0.04)',
    boxShadow: focused === field && !hasError ? '0 0 0 3px rgba(99,102,241,0.13)' : 'none',
    transition: 'all 0.18s ease',
  });

  const inputStyle: React.CSSProperties = {
    width: '100%', height: 44, background: 'transparent', border: 'none',
    outline: 'none', color: 'white', fontSize: 13, fontWeight: 500,
    paddingLeft: 38, paddingRight: 14,
  };

  const labelStyle: React.CSSProperties = {
    display: 'block', fontSize: 10, fontWeight: 700,
    letterSpacing: '0.12em', textTransform: 'uppercase', color: '#64748b', marginBottom: 7,
  };

  const iconStyle = (field: string): React.CSSProperties => ({
    position: 'absolute', left: 13, color: focused === field ? '#818cf8' : '#64748b',
    transition: 'color 0.2s', pointerEvents: 'none', flexShrink: 0,
  });

  const errText = (msg?: string) => msg ? (
    <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      style={{ fontSize: 11, fontWeight: 700, color: '#f87171', marginTop: 5, paddingLeft: 2 }}>
      {msg}
    </motion.p>
  ) : null;

  return (
    <main style={{ minHeight: '100vh', background: '#05091a', display: 'flex', flexDirection: 'column', overflow: 'hidden', fontFamily: '-apple-system, BlinkMacSystemFont, "Inter", "Segoe UI", sans-serif', position: 'relative' }}>

      {/* Global aurora */}
      <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 0,
        background: [
          'radial-gradient(ellipse 70% 55% at 15% 80%, rgba(37,99,235,0.18) 0%, transparent 65%)',
          'radial-gradient(ellipse 55% 45% at 85% 15%, rgba(99,102,241,0.14) 0%, transparent 60%)',
          '#05091a',
        ].join(', '),
      }} />

      {/* SVG noise grain */}
      <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', opacity: 0.028, pointerEvents: 'none', zIndex: 0 }} aria-hidden>
        <filter id="rGrain">
          <feTurbulence type="fractalNoise" baseFrequency="0.72" numOctaves="4" stitchTiles="stitch" />
          <feColorMatrix type="saturate" values="0" />
        </filter>
        <rect width="100%" height="100%" filter="url(#rGrain)" />
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
      <div style={{ flex: 1, display: 'flex', width: '100%', position: 'relative', zIndex: 1, overflow: 'hidden' }}>

        {/* ════════ LEFT PANEL ════════ */}
        <div
          className="hidden lg:flex flex-col justify-between"
          style={{ width: '56%', padding: '60px 56px 40px', position: 'relative', overflow: 'hidden', borderRight: '1px solid rgba(255,255,255,0.05)' }}
        >
          <div style={{ position: 'absolute', top: -80, left: -60, width: 440, height: 440, borderRadius: '50%', background: 'radial-gradient(circle, rgba(37,99,235,0.13) 0%, transparent 65%)', pointerEvents: 'none' }} />

          {/* Logo */}
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}
            className="flex items-center gap-3">
            <ChitFlowMark size={40} />
            <div>
              <p style={{ color: 'white', fontWeight: 800, fontSize: 18, letterSpacing: '-0.04em', lineHeight: 1, margin: 0 }}>ChitFlow</p>
              <p style={{ color: '#6366f1', fontWeight: 700, fontSize: 10, letterSpacing: '0.16em', textTransform: 'uppercase', margin: 0, marginTop: 1 }}>Admin Console</p>
            </div>
          </motion.div>

          {/* Hero */}
          <motion.div
            initial={{ opacity: 0, y: 28 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.55, delay: 0.1 }}
            style={{ position: 'relative', zIndex: 10, display: 'flex', flexDirection: 'column', gap: 28, maxWidth: 440 }}
          >
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{ width: 20, height: 2, background: 'linear-gradient(90deg,#3b82f6,#6366f1)', borderRadius: 2 }} />
                  <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.22em', textTransform: 'uppercase', color: 'rgba(99,102,241,0.85)' }}>Get Started Free</span>
                </div>
                <h1 style={{ fontSize: 44, fontWeight: 900, color: 'white', lineHeight: 1.06, letterSpacing: '-0.035em', margin: 0 }}>
                  Launch your{' '}
                  <span style={{ background: 'linear-gradient(100deg, #60a5fa 10%, #818cf8 90%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                    chit fund
                  </span>{' '}
                  workspace.
                </h1>
              </div>

              <p style={{ color: '#94a3b8', fontSize: 14, lineHeight: 1.75, maxWidth: 360, margin: 0 }}>
                Create your admin account to host groups, manage enrolled members, and run financial summaries — all in one place.
              </p>

              {/* Feature bullets */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                {[
                  'Host unlimited chit groups with custom schemes',
                  'Automated dividend & contribution calculations',
                  'Real-time payment tracking across all members',
                  'Instant SMS & email notifications built-in',
                ].map((f, i) => (
                  <motion.div key={f} initial={{ opacity: 0, x: -14 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.35 + i * 0.1 }}
                    style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <CheckCircle2 size={15} style={{ color: '#3b82f6', flexShrink: 0 }} />
                    <span style={{ color: '#cbd5e1', fontSize: 13, fontWeight: 500 }}>{f}</span>
                  </motion.div>
                ))}
              </div>
          </motion.div>

          {/* Footer */}
          <div className="flex items-center justify-between pt-4">
            <p style={{ color: '#475569', fontSize: 11, fontWeight: 600, margin: 0 }}>© {new Date().getFullYear()} ChitFlow Systems</p>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#22c55e', display: 'inline-block' }} />
              <span style={{ color: '#475569', fontSize: 11, fontWeight: 600 }}>All systems operational</span>
            </div>
          </div>
        </div>

        {/* ════════ RIGHT PANEL — Scrollable form ════════ */}
        <div className="flex-1 flex items-center justify-center p-6 md:p-10 overflow-y-auto" style={{ zIndex: 1 }}>
          <motion.div
            initial={{ opacity: 0, y: 24, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.18 }}
            style={{ width: '100%', maxWidth: 460 }}
          >
            {/* Card */}
            <div style={{ position: 'relative', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 26, padding: '32px 28px', boxShadow: '0 32px 80px rgba(0,0,0,0.55)', overflow: 'hidden' }}>
              <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 2, background: 'linear-gradient(90deg, #3b82f6, #6366f1)' }} />

              {/* Header */}
              <div style={{ marginBottom: 20, position: 'relative' }}>
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '4px 12px', borderRadius: 100, background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.22)', marginBottom: 10 }}>
                  <ShieldCheck size={10} style={{ color: '#818cf8' }} />
                  <span style={{ fontSize: 9, fontWeight: 800, letterSpacing: '0.18em', textTransform: 'uppercase', color: '#818cf8' }}>Agent Registration</span>
                </div>
                <h2 style={{ color: 'white', fontSize: 24, fontWeight: 900, letterSpacing: '-0.04em', margin: 0, lineHeight: 1.1 }}>Request Admin Access</h2>
              </div>

              {/* General error */}
              <AnimatePresence>
                {errors.general && (
                  <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden" style={{ marginBottom: 14 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 14px', borderRadius: 12, background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', color: '#f87171', fontSize: 12, fontWeight: 600 }}>
                      <ShieldCheck size={13} />{errors.general}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <form onSubmit={handleRegister} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>

                {/* Name Row */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                  <div>
                    <label style={labelStyle}>First Name</label>
                    <div style={fieldWrap('fn', !!errors.firstName)}>
                      <User size={13} style={iconStyle('fn')} />
                      <input type="text" value={formData.firstName} placeholder="Rajesh"
                        onFocus={() => setFocused('fn')} onBlur={() => setFocused(null)}
                        onChange={e => set('firstName', e.target.value)} style={inputStyle}
                      />
                    </div>
                    {errText(errors.firstName)}
                  </div>

                  <div>
                    <label style={labelStyle}>Last Name</label>
                    <div style={fieldWrap('ln', !!errors.lastName)}>
                      <User size={13} style={iconStyle('ln')} />
                      <input type="text" value={formData.lastName} placeholder="Kumar"
                        onFocus={() => setFocused('ln')} onBlur={() => setFocused(null)}
                        onChange={e => set('lastName', e.target.value)} style={inputStyle}
                      />
                    </div>
                    {errText(errors.lastName)}
                  </div>
                </div>

                {/* Business Name */}
                <div>
                  <label style={labelStyle}>Business / Agency Name</label>
                  <div style={fieldWrap('bn', !!errors.businessName)}>
                    <Building size={13} style={iconStyle('bn')} />
                    <input type="text" value={formData.businessName} placeholder="Kumar Chits & Investments"
                      onFocus={() => setFocused('bn')} onBlur={() => setFocused(null)}
                      onChange={e => set('businessName', e.target.value)} style={inputStyle}
                    />
                  </div>
                  {errText(errors.businessName)}
                </div>

                {/* Email & Phone */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                  <div>
                    <label style={labelStyle}>Email Address</label>
                    <div style={fieldWrap('em', !!errors.email)}>
                      <Mail size={13} style={iconStyle('em')} />
                      <input type="email" value={formData.email} placeholder="rajesh@agency.com"
                        onFocus={() => setFocused('em')} onBlur={() => setFocused(null)}
                        onChange={e => set('email', e.target.value)} style={inputStyle}
                      />
                    </div>
                    {errText(errors.email)}
                  </div>

                  <div>
                    <label style={labelStyle}>Mobile Number</label>
                    <div style={fieldWrap('ph', !!errors.phone)}>
                      <Phone size={13} style={iconStyle('ph')} />
                      <input type="tel" value={formData.phone} maxLength={10} placeholder="9876543210"
                        onFocus={() => setFocused('ph')} onBlur={() => setFocused(null)}
                        onChange={e => set('phone', e.target.value.replace(/\D/g, '').slice(0, 10))} style={inputStyle}
                      />
                    </div>
                    {errText(errors.phone)}
                  </div>
                </div>

                {/* Password */}
                <div>
                  <label style={labelStyle}>Password</label>
                  <div style={fieldWrap('pw', !!errors.password)}>
                    <Lock size={13} style={iconStyle('pw')} />
                    <input type={showPassword ? 'text' : 'password'} value={formData.password} placeholder="••••••••••••"
                      onFocus={() => setFocused('pw')} onBlur={() => setFocused(null)}
                      onChange={e => set('password', e.target.value)} style={{ ...inputStyle, paddingRight: 40 }}
                    />
                    <button type="button" onClick={() => setShowPassword(!showPassword)}
                      style={{ position: 'absolute', right: 12, color: '#64748b', background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
                    >
                      {showPassword ? <EyeOff size={13} /> : <Eye size={13} />}
                    </button>
                  </div>
                  {errText(errors.password)}
                </div>

                {/* Invite Code */}
                <div>
                  <label style={labelStyle}>Registration Access Code</label>
                  <div style={fieldWrap('inv', !!errors.inviteCode)}>
                    <ShieldCheck size={13} style={iconStyle('inv')} />
                    <input type="text" value={formData.inviteCode} placeholder="CHITFLOW-ADMIN-2026"
                      onFocus={() => setFocused('inv')} onBlur={() => setFocused(null)}
                      onChange={e => set('inviteCode', e.target.value)} style={inputStyle}
                    />
                  </div>
                  {errText(errors.inviteCode)}
                </div>

                {/* Submit */}
                <button
                  type="submit" disabled={isLoading}
                  style={{ width: '100%', height: 46, marginTop: 4, borderRadius: 13, background: 'linear-gradient(135deg, #2563eb, #4f46e5)', color: 'white', fontSize: 13, fontWeight: 800, border: 'none', cursor: isLoading ? 'not-allowed' : 'pointer', opacity: isLoading ? 0.6 : 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, boxShadow: '0 8px 24px rgba(37,99,235,0.35)' }}
                >
                  {isLoading
                    ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    : <><span>Create Admin Account</span><ArrowRight size={15} /></>
                  }
                </button>
              </form>

              <div style={{ marginTop: 18, paddingTop: 14, borderTop: '1px solid rgba(255,255,255,0.05)', textAlign: 'center' }}>
                <p style={{ color: '#64748b', fontSize: 13, fontWeight: 500, margin: 0 }}>
                  Already registered?{' '}
                  <Link href="/auth/admin/login" style={{ color: '#818cf8', fontWeight: 700, textDecoration: 'none' }}>
                    Sign in
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
