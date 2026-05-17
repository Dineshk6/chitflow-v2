'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Mail, Lock, ArrowRight, ShieldCheck } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';

import { signIn } from 'next-auth/react';
import { toast } from 'sonner';

export default function AgentLoginPage() {
  const router = useRouter();
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
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col md:flex-row">
      <div className="hidden md:flex md:w-1/2 bg-slate-900 p-12 flex-col justify-between text-white relative overflow-hidden">
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-20">
            <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white font-bold text-2xl shadow-xl">
              C
            </div>
            <span className="font-bold text-2xl tracking-tight">ChitFlow <span className="text-blue-500">Agent</span></span>
          </div>
          
          <h2 className="text-5xl font-black leading-tight mb-8">
            Control Center for <br />
            Modern Chit Funds.
          </h2>
          <p className="text-slate-400 text-lg max-w-md leading-relaxed">
            Securely manage members, track collections, and oversee auctions from your centralized agent dashboard.
          </p>
        </div>

        <div className="relative z-10">
          <div className="flex items-center gap-3 py-3 px-4 bg-white/5 rounded-2xl border border-white/10 w-fit">
            <ShieldCheck className="text-blue-400" size={20} />
            <p className="text-sm font-bold">Enterprise-grade security enabled</p>
          </div>
        </div>

        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2"></div>
      </div>

      <div className="flex-1 flex items-center justify-center p-8 md:p-20 bg-white dark:bg-slate-950">
        <div className="w-full max-w-md space-y-10">
          <div>
            <div className="md:hidden flex items-center gap-2 mb-10">
              <div className="w-8 h-8 rounded-lg bg-slate-900 flex items-center justify-center text-white font-bold text-lg">C</div>
              <span className="font-bold text-xl tracking-tight text-slate-900 dark:text-white">ChitFlow Agent</span>
            </div>
            <h1 className="text-3xl font-black text-slate-900 dark:text-white mb-2">Agent Portal</h1>
            <p className="text-slate-500 dark:text-slate-400 font-medium">Log in with your agent credentials.</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Email or Mobile</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <input 
                    type="text" 
                    value={identifier}
                    onChange={(e) => {
                      setIdentifier(e.target.value);
                      if (errors.identifier) setErrors({...errors, identifier: ''});
                    }}
                    placeholder="agent@chitflow.com or 9876543210" 
                    className={cn(
                      "w-full h-14 pl-12 pr-4 rounded-2xl bg-slate-50 dark:bg-slate-900 border text-sm focus:outline-none transition-all",
                      errors.identifier 
                        ? "border-red-500 focus:ring-red-500/10 focus:border-red-500" 
                        : "border-slate-200 dark:border-slate-800 focus:ring-blue-500/20 focus:border-blue-500"
                    )}
                  />
                </div>
                {errors.identifier && (
                  <p className="text-[10px] font-bold text-red-500 uppercase tracking-wider ml-2">{errors.identifier}</p>
                )}
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Password</label>
                </div>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <input 
                    type="password" 
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      if (errors.password) setErrors({...errors, password: ''});
                    }}
                    placeholder="••••••••" 
                    className={cn(
                      "w-full h-14 pl-12 pr-4 rounded-2xl bg-slate-50 dark:bg-slate-900 border text-sm focus:outline-none transition-all",
                      errors.password 
                        ? "border-red-500 focus:ring-red-500/10 focus:border-red-500" 
                        : "border-slate-200 dark:border-slate-800 focus:ring-blue-500/20 focus:border-blue-500"
                    )}
                  />
                </div>
                {errors.password && (
                  <p className="text-[10px] font-bold text-red-500 uppercase tracking-wider ml-2">{errors.password}</p>
                )}
              </div>
            </div>

            {errors.general && (
              <motion.div 
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-3 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 text-xs font-bold text-center"
              >
                {errors.general}
              </motion.div>
            )}

            <button 
              type="submit" 
              disabled={isLoading}
              className="w-full h-14 rounded-2xl bg-blue-600 text-white font-bold shadow-lg shadow-blue-500/25 transition-all flex items-center justify-center gap-2 group disabled:bg-blue-400"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              ) : (
                <>
                  Access Agent Dashboard
                  <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </form>

          <div className="space-y-4">
            <p className="text-xs text-slate-500 text-center">
              Don't have an agent account? <Link href="/auth/admin/register" className="text-blue-600 font-bold hover:underline">Register as Agent</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
