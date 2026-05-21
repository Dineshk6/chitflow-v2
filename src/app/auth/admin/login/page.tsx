'use client';

import React from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Lock, ArrowRight, ShieldCheck } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';

import { signIn, useSession } from 'next-auth/react';
import { toast } from 'sonner';

export default function AgentLoginPage() {
  const router = useRouter();
  const { data: session, status } = useSession();

  React.useEffect(() => {
    if (status === 'authenticated') {
      router.replace('/admin/dashboard');
    }
  }, [status, router]);
  const [isLoading, setIsLoading] = React.useState(false);

  const [identifier, setIdentifier] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [errors, setErrors] = React.useState<{identifier?: string; password?: string; general?: string}>({});

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrors({});

    const newErrors: {identifier?: string; password?: string} = {};

    if (!identifier) {
      newErrors.identifier = 'Email or Mobile is required';
    } else if (!identifier.includes('@') && !/^\d{10}$/.test(identifier)) {
      newErrors.identifier = 'Enter a valid email or 10-digit mobile number';
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
      const result = await signIn('credentials', {
        identifier,
        password,
        expectedRole: 'ADMIN',
        redirect: false
      });

      if (result?.error) {
        setErrors({ general: result.error === "CredentialsSignin" ? 'Invalid agent credentials' : result.error });
        toast.error("Something went wrong");
      } else {
        localStorage.removeItem('memberSession');
        localStorage.setItem('userRole', 'admin');
        toast.success("Welcome back, Agent!");
        router.push('/admin/dashboard');
      }
    } catch (error) {
      setErrors({ general: 'Auth failed. Please try again.' });
      toast.error("Something went wrong");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center relative overflow-hidden p-6">
      {/* Animated Background Elements */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-600/30 rounded-full blur-[120px] animate-pulse"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-indigo-600/30 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: '2s' }}></div>
      <div className="absolute top-[20%] right-[20%] w-[20%] h-[20%] bg-purple-600/20 rounded-full blur-[100px] animate-pulse" style={{ animationDelay: '4s' }}></div>

      <motion.div 
        initial={{ opacity: 0, y: 20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="w-full max-w-md relative z-10"
      >
        {/* Glassmorphism Card */}
        <div className="bg-slate-900/50 backdrop-blur-2xl border border-white/10 rounded-[32px] shadow-2xl p-8 md:p-10 overflow-hidden relative">
          <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500"></div>
          
          <div className="text-center mb-10">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white font-black text-3xl shadow-lg shadow-blue-500/30 mx-auto mb-6 transform -rotate-3 hover:rotate-0 transition-transform">
              C
            </div>
            <h1 className="text-3xl font-black text-white tracking-tight mb-2">Agent Portal</h1>
            <p className="text-slate-400 font-medium text-sm">Welcome back. Enter your credentials to manage your chit funds.</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Email or Mobile</label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Mail className="text-slate-500 group-focus-within:text-blue-400 transition-colors" size={18} />
                  </div>
                  <input 
                    type="text" 
                    value={identifier}
                    onChange={(e) => {
                      setIdentifier(e.target.value);
                      if (errors.identifier) setErrors({...errors, identifier: ''});
                    }}
                    placeholder="agent@chitflow.com or 9876543210" 
                    className={cn(
                      "w-full h-14 pl-12 pr-4 rounded-2xl bg-white/5 border text-sm text-white focus:outline-none transition-all placeholder:text-slate-600",
                      errors.identifier 
                        ? "border-red-500 focus:ring-4 focus:ring-red-500/10 focus:border-red-500 bg-red-500/5" 
                        : "border-white/10 focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white/10 hover:border-white/20"
                    )}
                  />
                </div>
                {errors.identifier && (
                  <motion.p initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} className="text-[10px] font-bold text-red-400 uppercase tracking-wider ml-2">{errors.identifier}</motion.p>
                )}
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-center pl-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Password</label>
                </div>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Lock className="text-slate-500 group-focus-within:text-blue-400 transition-colors" size={18} />
                  </div>
                  <input 
                    type="password" 
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      if (errors.password) setErrors({...errors, password: ''});
                    }}
                    placeholder="••••••••" 
                    className={cn(
                      "w-full h-14 pl-12 pr-4 rounded-2xl bg-white/5 border text-sm text-white focus:outline-none transition-all placeholder:text-slate-600",
                      errors.password 
                        ? "border-red-500 focus:ring-4 focus:ring-red-500/10 focus:border-red-500 bg-red-500/5" 
                        : "border-white/10 focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white/10 hover:border-white/20"
                    )}
                  />
                </div>
                {errors.password && (
                  <motion.p initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} className="text-[10px] font-bold text-red-400 uppercase tracking-wider ml-2">{errors.password}</motion.p>
                )}
              </div>
            </div>

            <AnimatePresence>
              {errors.general && (
                <motion.div 
                  initial={{ opacity: 0, height: 0, y: -10 }}
                  animate={{ opacity: 1, height: 'auto', y: 0 }}
                  exit={{ opacity: 0, height: 0 }}
                  className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-bold text-center flex items-center justify-center gap-2"
                >
                  <ShieldCheck size={16} />
                  {errors.general}
                </motion.div>
              )}
            </AnimatePresence>

            <button 
              type="submit" 
              disabled={isLoading}
              className="w-full h-14 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-black uppercase tracking-widest shadow-[0_0_40px_-10px_rgba(79,70,229,0.5)] transition-all flex items-center justify-center gap-3 group disabled:opacity-70 disabled:cursor-not-allowed hover:shadow-[0_0_60px_-15px_rgba(79,70,229,0.7)] hover:-translate-y-0.5 active:translate-y-0"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              ) : (
                <>
                  Access Dashboard
                  <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </form>

          <div className="mt-8 pt-8 border-t border-white/10 text-center">
            <p className="text-xs text-slate-400 font-medium">
              Don't have an agent account?{' '}
              <Link href="/auth/admin/register" className="text-blue-400 font-bold hover:text-blue-300 transition-colors">
                Apply Now
              </Link>
            </p>
          </div>
        </div>
        
        {/* Footer info */}
        <p className="text-center text-slate-500 text-[10px] font-bold uppercase tracking-widest mt-8 flex items-center justify-center gap-2">
          <ShieldCheck size={12} />
          Enterprise Grade Security
        </p>
      </motion.div>
    </div>
  );
}
