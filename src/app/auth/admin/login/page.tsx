'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Lock, Eye, EyeOff, ShieldCheck, ArrowRight, CheckCircle2, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { signIn, useSession } from 'next-auth/react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

function ChitFlowMark({ size = 32 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 44 44" fill="none" xmlns="http://www.w3.org/2000/svg" className="shrink-0">
      <defs>
        <linearGradient id="markGrad" x1="0" y1="0" x2="44" y2="44" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#2563eb" />
          <stop offset="100%" stopColor="#4f46e5" />
        </linearGradient>
      </defs>
      <rect width="44" height="44" rx="10" fill="url(#markGrad)" />
      <path d="M 12 16 L 19 22 L 12 28" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" opacity="0.8" />
      <path d="M 21 16 L 28 22 L 21 28" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
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
  
  useEffect(() => { 
    if (status === 'authenticated') {
      router.replace('/admin/dashboard'); 
    }
  }, [status, router]);

  const [isLoading, setIsLoading] = useState(false);
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [focused, setFocused] = useState<string | null>(null);
  const [errors, setErrors] = useState<{ identifier?: string; password?: string; general?: string }>({});

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrors({});
    const newErrors: { identifier?: string; password?: string } = {};
    
    if (!identifier) {
      newErrors.identifier = 'Email or Mobile is required';
    } else if (!identifier.includes('@') && !/^\d{10}$/.test(identifier)) {
      newErrors.identifier = 'Enter a valid email or 10-digit mobile';
    }
    
    if (!password) {
      newErrors.password = 'Password is required';
    }
    
    if (Object.keys(newErrors).length > 0) { 
      setErrors(newErrors); 
      setIsLoading(false); 
      return; 
    }
    
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
    } catch { 
      setErrors({ general: 'Something went wrong.' }); 
      toast.error('Error'); 
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
            <span className="text-[9px] font-bold text-slate-400 uppercase block mt-1 tracking-wider">Admin Console</span>
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
              <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-1 m-0">Admin Console</p>
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
              <span className="text-[10px] font-bold text-blue-600 uppercase tracking-wider block">Enterprise Platform</span>
              <h1 className="text-3xl font-black text-slate-900 leading-tight tracking-tight">
                The smartest way to run chit funds.
              </h1>
            </div>

            <p className="text-slate-500 text-xs sm:text-sm leading-relaxed">
              Manage members, automate dividends, track payments and broadcast notifications — all from a single powerful dashboard.
            </p>

            <div className="flex flex-col gap-3.5 pt-2">
              {features.map(f => (
                <div key={f} className="flex items-center gap-2.5">
                  <CheckCircle2 size={15} className="text-blue-600 shrink-0" />
                  <span className="text-slate-700 text-xs font-semibold">{f}</span>
                </div>
              ))}
            </div>
          </motion.div>

          <div className="text-slate-400 text-[11px] font-semibold flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>All systems operational • © {new Date().getFullYear()} ChitFlow</span>
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
                  <span className="text-[9px] font-black uppercase tracking-wider text-blue-700">Organizer Portal</span>
                </div>
                <h2 className="text-xl font-black text-slate-900 tracking-tight">Welcome Back</h2>
                <p className="text-slate-400 text-xs mt-1 font-semibold">Sign in to your admin workspace</p>
              </div>

              {/* General Error Banner */}
              <AnimatePresence>
                {errors.general && (
                  <motion.div 
                    initial={{ opacity: 0, height: 0 }} 
                    animate={{ opacity: 1, height: 'auto' }} 
                    exit={{ opacity: 0, height: 0 }} 
                    className="overflow-hidden mb-4"
                  >
                    <div className="flex items-center gap-2 p-3 rounded-xl bg-rose-50 border border-rose-100 text-rose-600 text-xs font-bold">
                      <ShieldCheck size={14} className="shrink-0" />
                      <span>{errors.general}</span>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <form onSubmit={handleLogin} className="space-y-4">
                
                {/* Identifier */}
                <div>
                  <label className="block text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Email or Mobile</label>
                  <div className={cn(
                    'relative flex items-center rounded-xl border bg-slate-50 transition-all px-3.5',
                    errors.identifier ? 'border-rose-300 bg-rose-50/20' : focused === 'id' ? 'border-blue-500 bg-white ring-2 ring-blue-500/5' : 'border-slate-200'
                  )}>
                    <Mail size={14} className={cn('text-slate-400 mr-2.5', focused === 'id' && 'text-blue-600')} />
                    <input
                      type="text"
                      value={identifier}
                      onFocus={() => setFocused('id')}
                      onBlur={() => setFocused(null)}
                      onChange={e => { setIdentifier(e.target.value); if (errors.identifier) setErrors({ ...errors, identifier: '' }); }}
                      placeholder="e.g. admin@chitflow.com"
                      className="w-full h-11 bg-transparent text-slate-800 text-xs font-extrabold focus:outline-none placeholder:text-slate-400 placeholder:font-semibold"
                    />
                  </div>
                  {errors.identifier && (
                    <p className="text-rose-500 text-[10px] font-bold mt-1.5 pl-1">{errors.identifier}</p>
                  )}
                </div>

                {/* Password */}
                <div>
                  <label className="block text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Password</label>
                  <div className={cn(
                    'relative flex items-center rounded-xl border bg-slate-50 transition-all px-3.5 pr-10',
                    errors.password ? 'border-rose-300 bg-rose-50/20' : focused === 'pw' ? 'border-blue-500 bg-white ring-2 ring-blue-500/5' : 'border-slate-200'
                  )}>
                    <Lock size={14} className={cn('text-slate-400 mr-2.5', focused === 'pw' && 'text-blue-600')} />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onFocus={() => setFocused('pw')}
                      onBlur={() => setFocused(null)}
                      onChange={e => { setPassword(e.target.value); if (errors.password) setErrors({ ...errors, password: '' }); }}
                      placeholder="••••••••••••"
                      className="w-full h-11 bg-transparent text-slate-800 text-xs font-extrabold focus:outline-none placeholder:text-slate-400 placeholder:font-semibold"
                    />
                    <button 
                      type="button" 
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3.5 text-slate-450 hover:text-slate-650 outline-none border-none bg-transparent cursor-pointer flex items-center"
                    >
                      {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                    </button>
                  </div>
                  {errors.password && (
                    <p className="text-rose-500 text-[10px] font-bold mt-1.5 pl-1">{errors.password}</p>
                  )}
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full h-11 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2 transition-all shadow-md shadow-blue-500/10 cursor-pointer"
                >
                  {isLoading ? (
                    <Loader2 size={15} className="animate-spin" />
                  ) : (
                    <>
                      <span>Sign In</span>
                      <ArrowRight size={14} />
                    </>
                  )}
                </button>
              </form>

              <div className="mt-6 pt-5 border-t border-slate-100 text-center">
                <p className="text-slate-400 text-xs font-semibold m-0">
                  New to ChitFlow?{' '}
                  <Link href="/auth/admin/register" className="text-blue-600 font-bold hover:underline">
                    Request Workspace
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
