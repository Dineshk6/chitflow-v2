'use client';

import React from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Mail, Lock, ArrowRight, Building, ShieldCheck, ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';

import { signIn } from 'next-auth/react';
import { toast } from 'sonner';

export default function AgentRegisterPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = React.useState(false);

  const [formData, setFormData] = React.useState({
    firstName: '',
    lastName: '',
    businessName: '',
    email: '',
    password: '',
    inviteCode: ''
  });
  const [errors, setErrors] = React.useState<Record<string, string>>({});

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrors({});

    const newErrors: Record<string, string> = {};

    if (!formData.firstName) newErrors.firstName = 'Required';
    if (!formData.lastName) newErrors.lastName = 'Required';
    if (!formData.businessName) newErrors.businessName = 'Business name required';
    
    if (!formData.email) {
      newErrors.email = 'Email or Mobile is required';
    } else if (!formData.email.includes('@') && !/^\d{10}$/.test(formData.email)) {
      newErrors.email = 'Enter a valid email or 10-digit mobile number';
    }

    if (!formData.password) newErrors.password = 'Password required';
    if (!formData.inviteCode) newErrors.inviteCode = 'Access Code required';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      setIsLoading(false);
      return;
    }
    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: `${formData.firstName} ${formData.lastName}`,
          email: formData.email.includes('@') ? formData.email : undefined,
          phone: !formData.email.includes('@') ? formData.email : undefined,
          password: formData.password,
          role: 'ADMIN',
          inviteCode: formData.inviteCode
        })
      });

      const data = await response.json();

      if (!response.ok) {
        setErrors({ general: data.error || 'Something went wrong' });
        toast.error(data.error || "Something went wrong");
      } else {
        localStorage.setItem('userRole', 'admin');
        toast.success("Agent account created successfully!");
        const result = await signIn('credentials', {
          identifier: formData.email,
          password: formData.password,
          redirect: false,
        });
        if (result?.ok) {
          router.push('/admin/dashboard');
        } else {
          toast.success("Account created! Please log in.");
          router.push('/auth/admin/login');
        }
      }
    } catch (error) {
      setErrors({ general: 'Something went wrong' });
      toast.error("Something went wrong");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center relative overflow-hidden p-6 py-12">
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
        <div className="bg-slate-900/50 backdrop-blur-2xl border border-white/10 rounded-[32px] shadow-2xl p-8 overflow-hidden relative">
          <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500"></div>
          
          <div className="flex items-center justify-start mb-6">
            <Link href="/" className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-blue-400 transition-colors group">
              <ArrowLeft size={14} className="group-hover:-translate-x-0.5 transition-transform" />
              Back to Home
            </Link>
          </div>

          <div className="text-center mb-8">
            <Link href="/" className="block w-max mx-auto mb-6">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white font-black text-3xl shadow-lg shadow-blue-500/30 transform -rotate-3 hover:rotate-0 transition-transform cursor-pointer">
                C
              </div>
            </Link>
            <h1 className="text-3xl font-black text-white tracking-tight mb-2">Agent Registration</h1>
            <p className="text-slate-400 font-medium text-sm">Create your workspace to automate collections and grow your chit fund.</p>
          </div>

          <form onSubmit={handleRegister} className="space-y-5">
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">First Name</label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <User className="text-slate-500 group-focus-within:text-blue-400 transition-colors" size={16} />
                    </div>
                    <input 
                      type="text" 
                      value={formData.firstName}
                      onChange={(e) => {
                        setFormData({...formData, firstName: e.target.value});
                        if (errors.firstName) setErrors({...errors, firstName: ''});
                      }}
                      placeholder="John" 
                      className={cn(
                        "w-full h-12 pl-11 pr-4 rounded-2xl bg-white/5 border text-sm text-white focus:outline-none transition-all placeholder:text-slate-600",
                        errors.firstName 
                          ? "border-red-500 focus:ring-4 focus:ring-red-500/10 bg-red-500/5" 
                          : "border-white/10 focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white/10 hover:border-white/20"
                      )}
                    />
                  </div>
                  {errors.firstName && <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-[10px] font-bold text-red-400 uppercase tracking-wider ml-2">{errors.firstName}</motion.p>}
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Last Name</label>
                  <input 
                    type="text" 
                    value={formData.lastName}
                    onChange={(e) => {
                      setFormData({...formData, lastName: e.target.value});
                      if (errors.lastName) setErrors({...errors, lastName: ''});
                    }}
                    placeholder="Doe" 
                    className={cn(
                      "w-full h-12 px-4 rounded-2xl bg-white/5 border text-sm text-white focus:outline-none transition-all placeholder:text-slate-600",
                      errors.lastName 
                        ? "border-red-500 focus:ring-4 focus:ring-red-500/10 bg-red-500/5" 
                        : "border-white/10 focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white/10 hover:border-white/20"
                    )}
                  />
                  {errors.lastName && <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-[10px] font-bold text-red-400 uppercase tracking-wider ml-2">{errors.lastName}</motion.p>}
                </div>
              </div>
              
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Business Name</label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Building className="text-slate-500 group-focus-within:text-blue-400 transition-colors" size={16} />
                  </div>
                  <input 
                    type="text" 
                    value={formData.businessName}
                    onChange={(e) => {
                      setFormData({...formData, businessName: e.target.value});
                      if (errors.businessName) setErrors({...errors, businessName: ''});
                    }}
                    placeholder="ChitFlow Solutions" 
                    className={cn(
                      "w-full h-12 pl-11 pr-4 rounded-2xl bg-white/5 border text-sm text-white focus:outline-none transition-all placeholder:text-slate-600",
                      errors.businessName 
                        ? "border-red-500 focus:ring-4 focus:ring-red-500/10 bg-red-500/5" 
                        : "border-white/10 focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white/10 hover:border-white/20"
                    )}
                  />
                </div>
                {errors.businessName && <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-[10px] font-bold text-red-400 uppercase tracking-wider ml-2">{errors.businessName}</motion.p>}
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Email or Mobile</label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Mail className="text-slate-500 group-focus-within:text-blue-400 transition-colors" size={16} />
                  </div>
                  <input 
                    type="text" 
                    value={formData.email}
                    onChange={(e) => {
                      setFormData({...formData, email: e.target.value});
                      if (errors.email) setErrors({...errors, email: ''});
                    }}
                    placeholder="agent@company.com or 9876543210" 
                    className={cn(
                      "w-full h-12 pl-11 pr-4 rounded-2xl bg-white/5 border text-sm text-white focus:outline-none transition-all placeholder:text-slate-600",
                      errors.email 
                        ? "border-red-500 focus:ring-4 focus:ring-red-500/10 bg-red-500/5" 
                        : "border-white/10 focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white/10 hover:border-white/20"
                    )}
                  />
                </div>
                {errors.email && <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-[10px] font-bold text-red-400 uppercase tracking-wider ml-2">{errors.email}</motion.p>}
              </div>
              
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Password</label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Lock className="text-slate-500 group-focus-within:text-blue-400 transition-colors" size={16} />
                  </div>
                  <input 
                    type="password" 
                    value={formData.password}
                    onChange={(e) => {
                      setFormData({...formData, password: e.target.value});
                      if (errors.password) setErrors({...errors, password: ''});
                    }}
                    placeholder="••••••••" 
                    className={cn(
                      "w-full h-12 pl-11 pr-4 rounded-2xl bg-white/5 border text-sm text-white focus:outline-none transition-all placeholder:text-slate-600",
                      errors.password 
                        ? "border-red-500 focus:ring-4 focus:ring-red-500/10 bg-red-500/5" 
                        : "border-white/10 focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white/10 hover:border-white/20"
                    )}
                  />
                </div>
                {errors.password && <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-[10px] font-bold text-red-400 uppercase tracking-wider ml-2">{errors.password}</motion.p>}
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Admin Access Code</label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <ShieldCheck className="text-slate-500 group-focus-within:text-amber-400 transition-colors" size={16} />
                  </div>
                  <input 
                    type="password" 
                    value={formData.inviteCode}
                    onChange={(e) => {
                      setFormData({...formData, inviteCode: e.target.value});
                      if (errors.inviteCode) setErrors({...errors, inviteCode: ''});
                    }}
                    placeholder="Enter Secret Code" 
                    className={cn(
                      "w-full h-12 pl-11 pr-4 rounded-2xl bg-amber-500/5 border text-sm text-amber-200 focus:outline-none transition-all placeholder:text-slate-600",
                      errors.inviteCode 
                        ? "border-red-500 focus:ring-4 focus:ring-red-500/10 bg-red-500/5" 
                        : "border-amber-500/30 focus:ring-4 focus:ring-amber-500/20 focus:border-amber-500 hover:border-amber-500/50"
                    )}
                  />
                </div>
                {errors.inviteCode && <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-[10px] font-bold text-red-400 uppercase tracking-wider ml-2">{errors.inviteCode}</motion.p>}
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
              className="w-full h-14 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-black uppercase tracking-widest shadow-[0_0_40px_-10px_rgba(79,70,229,0.5)] transition-all flex items-center justify-center gap-3 group disabled:opacity-70 disabled:cursor-not-allowed hover:shadow-[0_0_60px_-15px_rgba(79,70,229,0.7)] hover:-translate-y-0.5 active:translate-y-0 mt-4"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              ) : (
                <>
                  Create Account
                  <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-white/10 text-center">
            <p className="text-xs text-slate-400 font-medium">
              Already have an agent account?{' '}
              <Link href="/auth/admin/login" className="text-blue-400 font-bold hover:text-blue-300 transition-colors">
                Log In
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
