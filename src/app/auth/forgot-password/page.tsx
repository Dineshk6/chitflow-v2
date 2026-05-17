'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Mail, ArrowLeft, ArrowRight, ShieldCheck } from 'lucide-react';

export default function ForgotPasswordPage() {
  const [submitted, setSubmitted] = React.useState(false);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-[40px] border border-slate-200 dark:border-slate-800 p-10 md:p-14 shadow-2xl relative overflow-hidden">
        {/* Decorative */}
        <div className="absolute top-0 right-0 w-32 h-32 gradient-blue opacity-10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2"></div>
        
        <div className="relative z-10">
          <Link href="/auth/login" className="inline-flex items-center gap-2 text-xs font-bold text-slate-400 hover:text-blue-600 transition-colors mb-10 group">
            <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform" />
            Back to Login
          </Link>

          {!submitted ? (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <h1 className="text-3xl font-black text-slate-900 dark:text-white mb-3">Reset Password</h1>
              <p className="text-slate-500 dark:text-slate-400 text-sm font-medium leading-relaxed mb-10">
                Enter your email address and we'll send you a link to reset your password.
              </p>

              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Email Address</label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input 
                      type="email" 
                      placeholder="name@company.com" 
                      className="w-full h-14 pl-12 pr-4 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                    />
                  </div>
                </div>

                <button 
                  onClick={() => setSubmitted(true)}
                  className="w-full h-14 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold shadow-lg shadow-blue-500/25 transition-all flex items-center justify-center gap-2 group"
                >
                  Send Reset Link
                  <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-4"
            >
              <div className="w-20 h-20 rounded-full bg-emerald-50 dark:bg-emerald-900/20 flex items-center justify-center text-emerald-600 mx-auto mb-8">
                <ShieldCheck size={40} />
              </div>
              <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-3">Email Sent!</h2>
              <p className="text-slate-500 dark:text-slate-400 text-sm font-medium leading-relaxed mb-10">
                We've sent password reset instructions to your email address. Please check your inbox.
              </p>
              <button 
                onClick={() => setSubmitted(false)}
                className="text-sm font-bold text-blue-600 hover:underline"
              >
                Didn't receive the email? Try again
              </button>
            </motion.div>
          )}
        </div>
      </div>
      
      <p className="mt-12 text-xs font-bold text-slate-400 uppercase tracking-widest">
        Need help? <Link href="#" className="text-blue-600 hover:underline">Contact Support</Link>
      </p>
    </div>
  );
}
