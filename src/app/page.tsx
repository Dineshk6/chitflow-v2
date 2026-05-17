'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { 
  ChevronRight, 
  Shield, 
  Zap, 
  Smartphone, 
  Users, 
  ArrowRight,
  CheckCircle2,
  PieChart,
  BarChart3,
  Lock
} from 'lucide-react';
import { cn } from '@/lib/utils';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 overflow-x-hidden">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 h-20 bg-white/70 dark:bg-slate-950/70 backdrop-blur-xl border-b border-slate-200/50 dark:border-slate-800/50">
        <div className="max-w-7xl mx-auto h-full px-6 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl gradient-blue flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-blue-500/30">
              C
            </div>
            <span className="font-bold text-2xl tracking-tight text-slate-900 dark:text-white">ChitFlow</span>
          </div>
          
          <div className="hidden md:flex items-center gap-8">
            <Link href="#features" className="text-sm font-semibold text-slate-600 dark:text-slate-400 hover:text-blue-600 transition-colors">Features</Link>
            <Link href="#pricing" className="text-sm font-semibold text-slate-600 dark:text-slate-400 hover:text-blue-600 transition-colors">Pricing</Link>
            <Link href="#about" className="text-sm font-semibold text-slate-600 dark:text-slate-400 hover:text-blue-600 transition-colors">About</Link>
          </div>

          <div className="flex items-center gap-4">
            <Link href="/auth/admin/login" className="h-11 px-6 rounded-full bg-blue-600 text-white text-sm font-bold shadow-lg shadow-blue-500/20 transition-all flex items-center gap-2 hover:opacity-90">
              <Shield size={16} />
              Agent Portal Login
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-40 pb-20 px-6">
        <div className="max-w-7xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800 mb-8"
          >
            <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></span>
            <span className="text-xs font-bold text-blue-600 dark:text-blue-400 tracking-wide uppercase">New: Automated Auction Engine</span>
          </motion.div>
          
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-5xl md:text-7xl font-black text-slate-900 dark:text-white leading-tight mb-8"
          >
            Manage Your Chit Fund <br />
            <span className="text-transparent bg-clip-text gradient-blue">With Confidence</span>
          </motion.h1>
          
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-xl text-slate-500 dark:text-slate-400 max-w-3xl mx-auto mb-12 leading-relaxed"
          >
            Modern ROSCA management platform designed for agents and customers. 
            Automate collections, track winners, and grow your community with ease.
          </motion.p>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="flex items-center justify-center"
          >
            <Link href="/auth/admin/register" className="h-14 px-10 rounded-full bg-blue-600 text-white font-bold shadow-2xl shadow-blue-500/30 transition-all hover:scale-105 flex items-center gap-3">
              Start as Agent Control Hub
              <Shield size={20} />
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { label: 'Total Volume', value: '₹50Cr+' },
              { label: 'Active Users', value: '25,000+' },
              { label: 'Successful Auctions', value: '1,200+' },
              { label: 'States Reached', value: '12' },
            ].map((stat, idx) => (
              <div key={idx} className="text-center">
                <p className="text-4xl font-black text-slate-900 dark:text-white mb-2">{stat.value}</p>
                <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="py-32 px-6 bg-white dark:bg-slate-900/50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20">
            <h2 className="text-4xl font-black text-slate-900 dark:text-white mb-4">Powerful Features for Agents</h2>
            <p className="text-slate-500 dark:text-slate-400">Everything you need to run a professional chit fund business.</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { title: 'Digital Collections', desc: 'Accept payments via UPI, Cards, and Net Banking with automated reconciliation.', icon: Smartphone, color: 'bg-blue-500' },
              { title: 'Member Management', desc: 'Keep track of customer profiles, KYC, and historical participation data.', icon: Users, color: 'bg-emerald-500' },
              { title: 'Smart Auctions', desc: 'Run fair, transparent auctions with automated dividend calculations.', icon: Zap, color: 'bg-amber-500' },
              { title: 'Advanced Reports', desc: 'Get deep insights into collection trends and member payment behavior.', icon: BarChart3, color: 'bg-indigo-500' },
              { title: 'Secure & Compliant', desc: 'Built-in security and audit logs to keep your business data safe.', icon: Lock, color: 'bg-red-500' },
              { title: 'Real-time Alerts', desc: 'Send automated SMS and WhatsApp reminders for dues and auctions.', icon: Shield, color: 'bg-violet-500' },
            ].map((feature, idx) => (
              <motion.div
                key={idx}
                whileHover={{ y: -10 }}
                className="p-8 rounded-3xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 transition-all shadow-sm hover:shadow-2xl"
              >
                <div className={cn("w-14 h-14 rounded-2xl mb-6 flex items-center justify-center text-white shadow-lg", feature.color)}>
                  <feature.icon size={28} />
                </div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3">{feature.title}</h3>
                <p className="text-slate-500 dark:text-slate-400 leading-relaxed text-sm">{feature.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-32 px-6">
        <div className="max-w-5xl mx-auto rounded-[40px] gradient-blue p-12 md:p-20 text-center text-white shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-400/20 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2"></div>
          
          <h2 className="text-4xl md:text-5xl font-black mb-8 relative z-10">Ready to Transform Your <br /> Chit Fund Business?</h2>
          <p className="text-blue-100 text-lg mb-12 max-w-2xl mx-auto relative z-10">Join 2,000+ agents who are already scaling their operations with ChitFlow.</p>
          
          <div className="flex items-center justify-center relative z-10">
            <Link href="/auth/admin/register" className="h-16 px-12 rounded-full bg-white text-blue-600 font-black shadow-xl hover:scale-105 transition-all flex items-center gap-3">
              Register as Agent
              <Shield size={20} />
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-20 px-6 border-t border-slate-200 dark:border-slate-800">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-12">
          <div className="md:col-span-2">
            <div className="flex items-center gap-2 mb-6">
              <div className="w-8 h-8 rounded-lg gradient-blue flex items-center justify-center text-white font-bold text-lg">
                C
              </div>
              <span className="font-bold text-xl tracking-tight text-slate-900 dark:text-white">ChitFlow</span>
            </div>
            <p className="text-slate-500 dark:text-slate-400 max-w-sm leading-relaxed text-sm">
              The next generation platform for decentralized savings and credit. 
              Empowering communities with transparent and efficient financial management tools.
            </p>
          </div>
          <div>
            <h4 className="font-bold text-slate-900 dark:text-white mb-6">Product</h4>
            <ul className="space-y-4 text-sm font-semibold text-slate-500 dark:text-slate-400">
              <li><Link href="#" className="hover:text-blue-600 transition-colors">Features</Link></li>
              <li><Link href="#" className="hover:text-blue-600 transition-colors">Dashboard</Link></li>
              <li><Link href="#" className="hover:text-blue-600 transition-colors">Mobile App</Link></li>
              <li><Link href="#" className="hover:text-blue-600 transition-colors">Security</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold text-slate-900 dark:text-white mb-6">Company</h4>
            <ul className="space-y-4 text-sm font-semibold text-slate-500 dark:text-slate-400">
              <li><Link href="#" className="hover:text-blue-600 transition-colors">About Us</Link></li>
              <li><Link href="#" className="hover:text-blue-600 transition-colors">Careers</Link></li>
              <li><Link href="#" className="hover:text-blue-600 transition-colors">Blog</Link></li>
              <li><Link href="#" className="hover:text-blue-600 transition-colors">Contact</Link></li>
            </ul>
          </div>
        </div>
        <div className="max-w-7xl mx-auto mt-20 pt-8 border-t border-slate-100 dark:border-slate-900 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-xs font-bold text-slate-400">© 2024 ChitFlow Technologies Pvt Ltd. All rights reserved.</p>
          <div className="flex gap-8 text-xs font-bold text-slate-400">
            <Link href="#" className="hover:text-slate-600">Privacy Policy</Link>
            <Link href="#" className="hover:text-slate-600">Terms of Service</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
