'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Mail, ArrowLeft, ArrowRight, ShieldCheck } from 'lucide-react';

export default function ForgotPasswordPage() {
  const [submitted, setSubmitted] = useState(false);

  return (
    <div className="min-h-screen bg-[#f8fafc] flex flex-col items-center justify-center p-6 text-slate-800 font-sans relative">
      {/* Floating Back to Home */}
      <Link 
        href="/" 
        className="absolute top-6 left-6 inline-flex items-center gap-1.5 h-9 px-4 rounded-lg bg-white hover:bg-slate-50 border border-slate-200 text-slate-650 text-xs font-bold transition-all no-underline"
      >
        <ArrowLeft size={13} className="text-slate-450" />
        <span>Back to Home</span>
      </Link>

      <div className="w-full max-w-sm bg-white rounded-2xl border border-slate-200 p-8 shadow-sm relative overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-600 to-indigo-600" />
        
        <div className="relative z-10">
          <Link 
            href="/auth/admin/login" 
            className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-450 hover:text-blue-600 transition-colors mb-8 no-underline group"
          >
            <ArrowLeft size={13} className="group-hover:-translate-x-0.5 transition-transform" />
            <span>Back to Login</span>
          </Link>

          {!submitted ? (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <h1 className="text-xl font-black text-slate-900 tracking-tight mb-2">Reset Password</h1>
              <p className="text-slate-550 text-xs font-semibold leading-relaxed mb-6">
                Enter your email address and we will send you a secure link to reset your administrator password.
              </p>

              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label className="block text-[9px] font-black text-slate-400 uppercase tracking-widest">Email Address</label>
                  <div className="relative flex items-center rounded-xl border border-slate-200 bg-slate-50 transition-all px-3.5 focus-within:border-blue-500 focus-within:bg-white focus-within:ring-2 focus-within:ring-blue-500/5">
                    <Mail className="text-slate-400 mr-2.5" size={14} />
                    <input 
                      type="email" 
                      placeholder="name@company.com" 
                      className="w-full h-11 bg-transparent text-slate-800 text-xs font-extrabold focus:outline-none placeholder:text-slate-400 placeholder:font-semibold"
                    />
                  </div>
                </div>

                <button 
                  onClick={() => setSubmitted(true)}
                  className="w-full h-11 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2 transition-all shadow-md shadow-blue-500/10 cursor-pointer pt-0.5"
                >
                  <span>Send Reset Link</span>
                  <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-4"
            >
              <div className="w-16 h-16 rounded-full bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600 mx-auto mb-6">
                <ShieldCheck size={32} />
              </div>
              <h2 className="text-lg font-black text-slate-900 tracking-tight mb-2">Instructions Sent!</h2>
              <p className="text-slate-500 text-xs font-semibold leading-relaxed mb-8">
                We've sent password reset instructions to your email address. Please check your inbox.
              </p>
              <button 
                onClick={() => setSubmitted(false)}
                className="text-xs font-bold text-blue-600 hover:underline bg-transparent border-none outline-none cursor-pointer"
              >
                Didn't receive the email? Try again
              </button>
            </motion.div>
          )}
        </div>
      </div>
      
      <p className="mt-8 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
        Need assistance? <Link href="#" className="text-blue-600 hover:underline">Contact Support</Link>
      </p>
    </div>
  );
}
