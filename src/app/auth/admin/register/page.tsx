'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { User, Mail, Lock, ArrowRight, Building } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';

import { signIn } from 'next-auth/react';
import { toast } from 'sonner';

export default function AdminRegisterPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = React.useState(false);

  const [formData, setFormData] = React.useState({
    firstName: '',
    lastName: '',
    businessName: '',
    email: '',
    password: ''
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
    } 

    if (!formData.password) newErrors.password = 'Password required';

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
          role: 'ADMIN'
        })
      });

      const data = await response.json();

      if (!response.ok) {
        setErrors({ general: 'Something went wrong' });
        toast.error("Something went wrong");
      } else {
        localStorage.setItem('userRole', 'admin');
        toast.success("Admin account created successfully!");
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
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col md:flex-row">
      <div className="hidden md:flex md:w-1/2 bg-slate-900 p-12 flex-col justify-between text-white relative overflow-hidden">
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-20">
            <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white font-bold text-2xl shadow-xl">
              C
            </div>
            <span className="font-bold text-2xl tracking-tight">ChitFlow <span className="text-blue-500">Admin</span></span>
          </div>
          
          <h2 className="text-5xl font-black leading-tight mb-8">
            Build Your <br />
            Chit Empire.
          </h2>
          <p className="text-slate-400 text-lg max-w-md leading-relaxed">
            Create an administrator account to start managing groups, automating collections, and growing your chit fund business.
          </p>
        </div>

        <div className="relative z-10">
          <div className="p-6 bg-white/5 rounded-2xl border border-white/10">
            <h4 className="font-bold mb-2">Admin Account Includes:</h4>
            <ul className="text-sm text-slate-400 space-y-2">
              <li className="flex items-center gap-2">
                <div className="w-1 h-1 rounded-full bg-blue-500"></div>
                Full Group Management
              </li>
              <li className="flex items-center gap-2">
                <div className="w-1 h-1 rounded-full bg-blue-500"></div>
                Collection Automation
              </li>
              <li className="flex items-center gap-2">
                <div className="w-1 h-1 rounded-full bg-blue-500"></div>
                Financial Analytics
              </li>
            </ul>
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
              <span className="font-bold text-xl tracking-tight text-slate-900 dark:text-white">ChitFlow Admin</span>
            </div>
            <h1 className="text-3xl font-black text-slate-900 dark:text-white mb-2">Admin Registration</h1>
            <p className="text-slate-500 dark:text-slate-400 font-medium">Create your administrative workspace.</p>
          </div>

          <form onSubmit={handleRegister} className="space-y-6">
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">First Name</label>
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input 
                      type="text" 
                      value={formData.firstName}
                      onChange={(e) => {
                        setFormData({...formData, firstName: e.target.value});
                        if (errors.firstName) setErrors({...errors, firstName: ''});
                      }}
                      placeholder="John" 
                      className={cn(
                        "w-full h-14 pl-12 pr-4 rounded-2xl bg-slate-50 dark:bg-slate-900 border text-sm focus:outline-none transition-all",
                        errors.firstName ? "border-red-500" : "border-slate-200 dark:border-slate-800"
                      )}
                    />
                  </div>
                  {errors.firstName && <p className="text-[10px] font-bold text-red-500 uppercase tracking-wider ml-2">{errors.firstName}</p>}
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Last Name</label>
                  <input 
                    type="text" 
                    value={formData.lastName}
                    onChange={(e) => {
                      setFormData({...formData, lastName: e.target.value});
                      if (errors.lastName) setErrors({...errors, lastName: ''});
                    }}
                    placeholder="Doe" 
                    className={cn(
                      "w-full h-14 px-4 rounded-2xl bg-slate-50 dark:bg-slate-900 border text-sm focus:outline-none transition-all",
                      errors.lastName ? "border-red-500" : "border-slate-200 dark:border-slate-800"
                    )}
                  />
                  {errors.lastName && <p className="text-[10px] font-bold text-red-500 uppercase tracking-wider ml-2">{errors.lastName}</p>}
                </div>
              </div>
              
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Business Name</label>
                <div className="relative">
                  <Building className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <input 
                    type="text" 
                    value={formData.businessName}
                    onChange={(e) => {
                      setFormData({...formData, businessName: e.target.value});
                      if (errors.businessName) setErrors({...errors, businessName: ''});
                    }}
                    placeholder="ChitFlow Solutions" 
                    className={cn(
                      "w-full h-14 pl-12 pr-4 rounded-2xl bg-slate-50 dark:bg-slate-900 border text-sm focus:outline-none transition-all",
                      errors.businessName ? "border-red-500" : "border-slate-200 dark:border-slate-800"
                    )}
                  />
                </div>
                {errors.businessName && <p className="text-[10px] font-bold text-red-500 uppercase tracking-wider ml-2">{errors.businessName}</p>}
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Work Email or Mobile</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <input 
                    type="text" 
                    value={formData.email}
                    onChange={(e) => {
                      setFormData({...formData, email: e.target.value});
                      if (errors.email) setErrors({...errors, email: ''});
                    }}
                    placeholder="admin@company.com or 9876543210" 
                    className={cn(
                      "w-full h-14 pl-12 pr-4 rounded-2xl bg-slate-50 dark:bg-slate-900 border text-sm focus:outline-none transition-all",
                      errors.email ? "border-red-500" : "border-slate-200 dark:border-slate-800"
                    )}
                  />
                </div>
                {errors.email && <p className="text-[10px] font-bold text-red-500 uppercase tracking-wider ml-2">{errors.email}</p>}
              </div>
              
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Password</label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <input 
                    type="password" 
                    value={formData.password}
                    onChange={(e) => {
                      setFormData({...formData, password: e.target.value});
                      if (errors.password) setErrors({...errors, password: ''});
                    }}
                    placeholder="••••••••" 
                    className={cn(
                      "w-full h-14 pl-12 pr-4 rounded-2xl bg-slate-50 dark:bg-slate-900 border text-sm focus:outline-none transition-all",
                      errors.password ? "border-red-500" : "border-slate-200 dark:border-slate-800"
                    )}
                  />
                </div>
                {errors.password && <p className="text-[10px] font-bold text-red-500 uppercase tracking-wider ml-2">{errors.password}</p>}
              </div>
            </div>

            {errors.general && (
              <motion.div 
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-4 rounded-2xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 text-xs font-bold text-center"
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
                  Create Admin Account
                  <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </form>

          <p className="text-center text-sm font-medium text-slate-500 dark:text-slate-400">
            Already have an admin account? <Link href="/auth/admin/login" className="text-slate-900 dark:text-white font-bold hover:underline">Log in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
