'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Phone, ArrowRight, ShieldCheck, CheckCircle2, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { clearAllAuthSessions } from '@/lib/auth-client';
import { cn } from '@/lib/utils';

function ChitFlowMark({ size = 32 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 44 44" fill="none" xmlns="http://www.w3.org/2000/svg" className="shrink-0">
      <defs>
        <linearGradient id="memMarkGrad" x1="0" y1="0" x2="44" y2="44" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#2563eb" />
          <stop offset="100%" stopColor="#4f46e5" />
        </linearGradient>
      </defs>
      <rect width="44" height="44" rx="10" fill="url(#memMarkGrad)" />
      <path d="M 12 16 L 19 22 L 12 28" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" opacity="0.8" />
      <path d="M 21 16 L 28 22 L 21 28" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
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
      toast.success(`Welcome back, ${data.name}!`);
      router.push('/member/dashboard');
    } catch (err) {
      setError('Something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#f8fafc] flex flex-col font-sans relative overflow-hidden text-slate-800">
      
      {/* ════════ HEADER ════════ */}
      <header className="sticky top-0 z-40 bg-white border-b border-slate-200 px-6 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-3 no-underline">
          <ChitFlowMark size={32} />
          <div>
            <span className="font-bold text-sm tracking-tight text-slate-900 block leading-none">ChitFlow</span>
            <span className="text-[9px] font-bold text-slate-400 uppercase block mt-1 tracking-wider">Member Portal</span>
          </div>
        </Link>

        <Link 
          href="/" 
          className="inline-flex items-center gap-1.5 h-9 px-4 rounded-lg bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-600 text-xs font-bold transition-all"
        >
          <span>Back to site</span>
          <ArrowRight size={13} />
        </Link>
      </header>

      {/* Main Body Split */}
      <div className="flex-1 flex w-full relative z-10">

        {/* ════════ LEFT PANEL ════════ */}
        <div className="hidden lg:flex w-[52%] p-16 flex-col justify-between border-r border-slate-200 bg-white relative overflow-hidden">
          <div className="absolute top-[-80px] left-[-60px] w-96 h-96 rounded-full bg-blue-500/5 blur-3xl pointer-events-none" />
          
          <div className="flex items-center gap-3">
            <ChitFlowMark size={36} />
            <div>
              <p className="font-extrabold text-slate-900 text-base leading-none m-0">ChitFlow</p>
              <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-1 m-0">Secure Member Portal</p>
            </div>
          </div>

          {/* Hero Copy */}
          <motion.div 
            initial={{ opacity: 0, y: 15 }} 
            animate={{ opacity: 1, y: 0 }} 
            transition={{ duration: 0.4 }} 
            className="space-y-6 max-w-sm"
          >
            <div className="space-y-2">
              <span className="text-[10px] font-bold text-blue-600 uppercase tracking-wider block">Live Ledger Sync</span>
              <h1 className="text-3xl font-black text-slate-900 leading-tight tracking-tight">
                Access your chit savings in one click.
              </h1>
            </div>

            <p className="text-slate-500 text-xs sm:text-sm leading-relaxed">
              Enter your registered mobile number to immediately track monthly dividends, outstanding schedules, and download receipts.
            </p>

            <div className="flex flex-col gap-3.5 pt-2">
              {[
                'Instant monthly dividend breakdown',
                'Payment logs & active due notifications',
                'Official printable receipts & history'
              ].map(f => (
                <div key={f} className="flex items-center gap-2.5">
                  <CheckCircle2 size={15} className="text-blue-600 shrink-0" />
                  <span className="color-slate-700 text-xs font-semibold">{f}</span>
                </div>
              ))}
            </div>
          </motion.div>

          <div className="text-slate-400 text-[11px] font-semibold">
            © {new Date().getFullYear()} ChitFlow Systems. Audited & Secure circle ledger.
          </div>
        </div>

        {/* ════════ RIGHT PANEL (Form) ════════ */}
        <div className="flex-1 flex items-center justify-center p-6 md:p-12">
          
          <motion.div 
            initial={{ opacity: 0, y: 15 }} 
            animate={{ opacity: 1, y: 0 }} 
            transition={{ duration: 0.4, delay: 0.05 }}
            className="w-full max-w-sm"
          >
            {/* Card Wrapper */}
            <div className="bg-white border border-slate-200 rounded-2xl p-8 shadow-sm relative overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-600 to-indigo-600" />

              <div className="mb-6">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-blue-50 border border-blue-100 mb-3.5">
                  <ShieldCheck size={12} className="text-blue-600" />
                  <span className="text-[9px] font-black uppercase tracking-wider text-blue-700">Member Verification</span>
                </div>
                <h2 className="text-xl font-black text-slate-900 tracking-tight">Access Account</h2>
                <p className="text-slate-400 text-xs mt-1 font-semibold">Enter your registered 10-digit phone number</p>
              </div>

              <form onSubmit={handleLogin} className="space-y-4">
                <div>
                  <label className="block text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Mobile Number</label>
                  <div className={cn(
                    'relative flex items-center rounded-xl border bg-slate-50 transition-all px-3.5',
                    error ? 'border-rose-300 bg-rose-50/20' : focused ? 'border-blue-500 bg-white ring-2 ring-blue-500/5' : 'border-slate-200'
                  )}>
                    <Phone size={14} className={cn('text-slate-400 mr-2.5', focused && 'text-blue-600')} />
                    <input
                      type="tel"
                      value={phone}
                      maxLength={10}
                      onFocus={() => setFocused(true)}
                      onBlur={() => setFocused(false)}
                      onChange={e => { setPhone(e.target.value.replace(/\D/g, '').slice(0, 10)); setError(''); }}
                      placeholder="e.g. 9876543210"
                      className="w-full h-11 bg-transparent text-slate-800 text-xs font-extrabold focus:outline-none placeholder:text-slate-400 placeholder:font-semibold"
                    />
                  </div>
                  {error && (
                    <p className="text-rose-500 text-[10px] font-bold mt-1.5 pl-1">{error}</p>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full h-11 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2 transition-all shadow-md shadow-blue-500/10 cursor-pointer"
                >
                  {isLoading ? (
                    <Loader2 size={15} className="animate-spin" />
                  ) : (
                    <>
                      <span>Open Dashboard</span>
                      <ArrowRight size={14} />
                    </>
                  )}
                </button>
              </form>

              <div className="mt-6 pt-5 border-t border-slate-100 text-center">
                <p className="text-slate-400 text-xs font-semibold m-0">
                  Are you an administrator?{' '}
                  <Link href="/auth/admin/login" className="text-blue-600 font-bold hover:underline">
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
