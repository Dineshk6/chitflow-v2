'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { Phone, ArrowRight, ShieldCheck, ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { clearAllAuthSessions } from '@/lib/auth-client';

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

      // Drop any leftover agent (NextAuth) session before member login
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
    <div className="min-h-screen bg-slate-950 flex items-center justify-center relative overflow-hidden p-6">
      {/* Animated background orbs */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-emerald-600/30 rounded-full blur-[120px] animate-pulse" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-teal-600/30 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: '2s' }} />

      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className="w-full max-w-sm relative z-10"
      >
        <div className="bg-slate-900/50 backdrop-blur-2xl border border-white/10 rounded-[32px] shadow-2xl p-8 relative overflow-hidden">
          <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500" />

          <div className="flex items-center justify-start mb-6">
            <Link href="/" className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-emerald-400 transition-colors group">
              <ArrowLeft size={14} className="group-hover:-translate-x-0.5 transition-transform" />
              Back to Home
            </Link>
          </div>

          <div className="text-center mb-8">
            <Link href="/" className="block w-max mx-auto mb-6">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-600 flex items-center justify-center text-white font-black text-3xl shadow-lg shadow-emerald-500/30 transform -rotate-3 hover:rotate-0 transition-transform cursor-pointer">
                C
              </div>
            </Link>
            <h1 className="text-3xl font-black text-white tracking-tight mb-2">Member Portal</h1>
            <p className="text-slate-400 font-medium text-sm">Enter your registered mobile number to view your chit history.</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Mobile Number</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Phone className="text-slate-500 group-focus-within:text-emerald-400 transition-colors" size={18} />
                </div>
                <input
                  type="tel"
                  value={phone}
                  maxLength={10}
                  onChange={(e) => {
                    setPhone(e.target.value.replace(/\D/g, '').slice(0, 10));
                    setError('');
                  }}
                  placeholder="9876543210"
                  className={cn(
                    'w-full h-14 pl-12 pr-4 rounded-2xl bg-white/5 border text-sm text-white focus:outline-none transition-all placeholder:text-slate-600',
                    error
                      ? 'border-red-500 focus:ring-4 focus:ring-red-500/10 bg-red-500/5'
                      : 'border-white/10 focus:ring-4 focus:ring-emerald-500/20 focus:border-emerald-500 focus:bg-white/10 hover:border-white/20'
                  )}
                />
              </div>
              <AnimatePresence>
                {error && (
                  <motion.p
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -5 }}
                    className="text-[10px] font-bold text-red-400 uppercase tracking-wider ml-2"
                  >
                    {error}
                  </motion.p>
                )}
              </AnimatePresence>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full h-14 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-black uppercase tracking-widest shadow-[0_0_40px_-10px_rgba(16,185,129,0.5)] transition-all flex items-center justify-center gap-3 group disabled:opacity-70 disabled:cursor-not-allowed hover:shadow-[0_0_60px_-15px_rgba(16,185,129,0.7)] hover:-translate-y-0.5 active:translate-y-0"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  View My Dashboard
                  <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-white/10 text-center">
            <p className="text-xs text-slate-400">
              Are you an agent?{' '}
              <Link href="/auth/admin/login" className="text-emerald-400 font-bold hover:text-emerald-300 transition-colors">
                Agent Login
              </Link>
            </p>
          </div>
        </div>

        <p className="text-center text-slate-500 text-[10px] font-bold uppercase tracking-widest mt-8 flex items-center justify-center gap-2">
          <ShieldCheck size={12} />
          Read-only · Your data is safe
        </p>
      </motion.div>
    </div>
  );
}
