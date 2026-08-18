'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Mail, Lock, Building, Phone, ShieldCheck, ArrowRight, CheckCircle2, Eye, EyeOff, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { signIn } from 'next-auth/react';
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

export default function AgentRegisterPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [focused, setFocused] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    firstName: '', lastName: '', businessName: '',
    email: '', phone: '', password: '', inviteCode: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

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
    } catch { 
      setErrors({ general: 'Something went wrong' }); 
      toast.error('Something went wrong'); 
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
      <div className="flex-1 flex w-full relative z-10 overflow-hidden">

        {/* ════════ LEFT PANEL ════════ */}
        <div className="hidden lg:flex w-[50%] p-16 flex-col justify-between border-r border-slate-200 bg-white relative overflow-hidden">
          <div className="absolute top-[-80px] left-[-60px] w-96 h-96 rounded-full bg-blue-500/5 blur-3xl pointer-events-none" />
          
          <div className="flex items-center gap-3">
            <ChitFlowMark size={36} />
            <div>
              <p className="font-extrabold text-slate-900 text-base leading-none m-0">ChitFlow</p>
              <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-1 m-0">Admin Workspace Registration</p>
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
              <span className="text-[10px] font-bold text-blue-600 uppercase tracking-wider block">Get Started Free</span>
              <h1 className="text-3xl font-black text-slate-900 leading-tight tracking-tight">
                Launch your custom chit workspace.
              </h1>
            </div>

            <p className="text-slate-500 text-xs sm:text-sm leading-relaxed">
              Create an admin account to host chit fund circles, register members, and generate transparent schedules automatically.
            </p>

            <div className="flex flex-col gap-3.5 pt-2">
              {[
                'Host unlimited chit groups with custom schemes',
                'Automated dividend & contribution calculations',
                'Real-time payment tracking across all members',
                'Instant notifications built-in'
              ].map((f, i) => (
                <div key={i} className="flex items-center gap-2.5">
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

        {/* ════════ RIGHT PANEL — Scrollable Form ════════ */}
        <div className="flex-1 flex items-center justify-center p-6 md:p-10 overflow-y-auto">
          
          <motion.div 
            initial={{ opacity: 0, y: 15 }} 
            animate={{ opacity: 1, y: 0 }} 
            transition={{ duration: 0.4, delay: 0.05 }}
            className="w-full max-w-md my-auto"
          >
            {/* Card Wrapper */}
            <div className="bg-white border border-slate-200 rounded-2xl p-7 shadow-sm relative overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-600 to-indigo-600" />

              <div className="mb-5">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-blue-50 border border-blue-100 mb-3">
                  <ShieldCheck size={12} className="text-blue-600" />
                  <span className="text-[9px] font-black uppercase tracking-wider text-blue-700">Workspace Invitation Required</span>
                </div>
                <h2 className="text-xl font-black text-slate-900 tracking-tight">Request Admin Access</h2>
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

              <form onSubmit={handleRegister} className="space-y-3.5">
                
                {/* First Name & Last Name Row */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">First Name</label>
                    <div className={cn(
                      'relative flex items-center rounded-xl border bg-slate-50 transition-all px-3',
                      errors.firstName ? 'border-rose-300 bg-rose-50/20' : focused === 'fn' ? 'border-blue-500 bg-white ring-2 ring-blue-500/5' : 'border-slate-200'
                    )}>
                      <User size={13} className={cn('text-slate-400 mr-2 shrink-0', focused === 'fn' && 'text-blue-600')} />
                      <input
                        type="text"
                        value={formData.firstName}
                        onFocus={() => setFocused('fn')}
                        onBlur={() => setFocused(null)}
                        onChange={e => set('firstName', e.target.value)}
                        placeholder="Rajesh"
                        className="w-full h-10 bg-transparent text-slate-800 text-xs font-extrabold focus:outline-none placeholder:text-slate-400 placeholder:font-semibold"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Last Name</label>
                    <div className={cn(
                      'relative flex items-center rounded-xl border bg-slate-50 transition-all px-3',
                      errors.lastName ? 'border-rose-300 bg-rose-50/20' : focused === 'ln' ? 'border-blue-500 bg-white ring-2 ring-blue-500/5' : 'border-slate-200'
                    )}>
                      <User size={13} className={cn('text-slate-400 mr-2 shrink-0', focused === 'ln' && 'text-blue-600')} />
                      <input
                        type="text"
                        value={formData.lastName}
                        onFocus={() => setFocused('ln')}
                        onBlur={() => setFocused(null)}
                        onChange={e => set('lastName', e.target.value)}
                        placeholder="Kumar"
                        className="w-full h-10 bg-transparent text-slate-800 text-xs font-extrabold focus:outline-none placeholder:text-slate-400 placeholder:font-semibold"
                      />
                    </div>
                  </div>
                </div>

                {/* Business Name */}
                <div>
                  <label className="block text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Agency / Business Name</label>
                  <div className={cn(
                    'relative flex items-center rounded-xl border bg-slate-50 transition-all px-3',
                    errors.businessName ? 'border-rose-300 bg-rose-50/20' : focused === 'bn' ? 'border-blue-500 bg-white ring-2 ring-blue-500/5' : 'border-slate-200'
                  )}>
                    <Building size={13} className={cn('text-slate-400 mr-2 shrink-0', focused === 'bn' && 'text-blue-600')} />
                    <input
                      type="text"
                      value={formData.businessName}
                      onFocus={() => setFocused('bn')}
                      onBlur={() => setFocused(null)}
                      onChange={e => set('businessName', e.target.value)}
                      placeholder="e.g. Kumar Chit Funds"
                      className="w-full h-10 bg-transparent text-slate-800 text-xs font-extrabold focus:outline-none placeholder:text-slate-400 placeholder:font-semibold"
                    />
                  </div>
                </div>

                {/* Email Address & Phone Number Row */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Email</label>
                    <div className={cn(
                      'relative flex items-center rounded-xl border bg-slate-50 transition-all px-3',
                      errors.email ? 'border-rose-300 bg-rose-50/20' : focused === 'em' ? 'border-blue-500 bg-white ring-2 ring-blue-500/5' : 'border-slate-200'
                    )}>
                      <Mail size={13} className={cn('text-slate-400 mr-2 shrink-0', focused === 'em' && 'text-blue-600')} />
                      <input
                        type="email"
                        value={formData.email}
                        onFocus={() => setFocused('em')}
                        onBlur={() => setFocused(null)}
                        onChange={e => set('email', e.target.value)}
                        placeholder="rajesh@agency.com"
                        className="w-full h-10 bg-transparent text-slate-800 text-xs font-extrabold focus:outline-none placeholder:text-slate-400 placeholder:font-semibold"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Mobile</label>
                    <div className={cn(
                      'relative flex items-center rounded-xl border bg-slate-50 transition-all px-3',
                      errors.phone ? 'border-rose-300 bg-rose-50/20' : focused === 'ph' ? 'border-blue-500 bg-white ring-2 ring-blue-500/5' : 'border-slate-200'
                    )}>
                      <Phone size={13} className={cn('text-slate-400 mr-2 shrink-0', focused === 'ph' && 'text-blue-600')} />
                      <input
                        type="tel"
                        value={formData.phone}
                        maxLength={10}
                        onFocus={() => setFocused('ph')}
                        onBlur={() => setFocused(null)}
                        onChange={e => set('phone', e.target.value.replace(/\D/g, '').slice(0, 10))}
                        placeholder="9876543210"
                        className="w-full h-10 bg-transparent text-slate-800 text-xs font-extrabold focus:outline-none placeholder:text-slate-400 placeholder:font-semibold"
                      />
                    </div>
                  </div>
                </div>

                {/* Password */}
                <div>
                  <label className="block text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Password</label>
                  <div className={cn(
                    'relative flex items-center rounded-xl border bg-slate-50 transition-all px-3 pr-10',
                    errors.password ? 'border-rose-300 bg-rose-50/20' : focused === 'pw' ? 'border-blue-500 bg-white ring-2 ring-blue-500/5' : 'border-slate-200'
                  )}>
                    <Lock size={13} className={cn('text-slate-400 mr-2 shrink-0', focused === 'pw' && 'text-blue-600')} />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={formData.password}
                      onFocus={() => setFocused('pw')}
                      onBlur={() => setFocused(null)}
                      onChange={e => set('password', e.target.value)}
                      placeholder="••••••••••••"
                      className="w-full h-10 bg-transparent text-slate-800 text-xs font-extrabold focus:outline-none placeholder:text-slate-400 placeholder:font-semibold"
                    />
                    <button 
                      type="button" 
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 text-slate-400 hover:text-slate-655 outline-none border-none bg-transparent cursor-pointer flex items-center"
                    >
                      {showPassword ? <EyeOff size={13} /> : <Eye size={13} />}
                    </button>
                  </div>
                </div>

                {/* Invite Code */}
                <div>
                  <label className="block text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Registration Access Code</label>
                  <div className={cn(
                    'relative flex items-center rounded-xl border bg-slate-50 transition-all px-3',
                    errors.inviteCode ? 'border-rose-300 bg-rose-50/20' : focused === 'inv' ? 'border-blue-500 bg-white ring-2 ring-blue-500/5' : 'border-slate-200'
                  )}>
                    <ShieldCheck size={13} className={cn('text-slate-400 mr-2 shrink-0', focused === 'inv' && 'text-blue-600')} />
                    <input
                      type="text"
                      value={formData.inviteCode}
                      onFocus={() => setFocused('inv')}
                      onBlur={() => setFocused(null)}
                      onChange={e => set('inviteCode', e.target.value)}
                      placeholder="Enter access code"
                      className="w-full h-10 bg-transparent text-slate-800 text-xs font-extrabold focus:outline-none placeholder:text-slate-400 placeholder:font-semibold"
                    />
                  </div>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full h-11 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2 transition-all shadow-md shadow-blue-500/10 cursor-pointer pt-0.5"
                >
                  {isLoading ? (
                    <Loader2 size={15} className="animate-spin" />
                  ) : (
                    <>
                      <span>Register Workspace</span>
                      <ArrowRight size={14} />
                    </>
                  )}
                </button>
              </form>

              <div className="mt-5 pt-4 border-t border-slate-100 text-center">
                <p className="text-slate-400 text-xs font-semibold m-0">
                  Already have a workspace?{' '}
                  <Link href="/auth/admin/login" className="text-blue-600 font-bold hover:underline">
                    Sign In
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
