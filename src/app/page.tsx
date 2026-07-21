'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion';
import {
  Shield,
  Zap,
  Smartphone,
  Users,
  ArrowRight,
  BarChart3,
  Lock,
  Menu,
  X,
  Sparkles,
  Bell,
  IndianRupee,
  Layers,
  ChevronRight,
  CheckCircle2,
} from 'lucide-react';

const features = [
  {
    title: 'Digital Collections',
    desc: 'Track UPI and cash collections with automatic reconciliation per month.',
    icon: Smartphone,
  },
  {
    title: 'Member Management',
    desc: 'Profiles, phone login, and participation history in one place.',
    icon: Users,
  },
  {
    title: 'Smart Auctions',
    desc: 'Fair winner selection and lift tracking built right into the platform.',
    icon: Zap,
  },
  {
    title: 'Live Reports',
    desc: 'See collection trends, pending dues, and group health instantly.',
    icon: BarChart3,
  },
  {
    title: 'Secure by Design',
    desc: 'Role-based access for agents and read-only member portals.',
    icon: Lock,
  },
  {
    title: 'Instant Alerts',
    desc: 'Notify members about dues, wins, and messages from your desk.',
    icon: Bell,
  },
];

const stats = [
  { label: 'Funds Managed', value: '₹50Cr+' },
  { label: 'Active Members', value: '25K+' },
  { label: 'Groups Running', value: '1,200+' },
  { label: 'Locations', value: '12 States' },
];

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  show: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, delay: i * 0.1, ease: 'easeOut' },
  }),
};

export default function LandingPage() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { scrollY } = useScroll();
  const navBg = useTransform(scrollY, [0, 50], ['rgba(255,255,255,0)', 'rgba(255,255,255,1)']);
  const navBorder = useTransform(scrollY, [0, 50], ['rgba(226,232,240,0)', 'rgba(226,232,240,1)']);
  const navShadow = useTransform(scrollY, [0, 50], ['none', '0 4px 6px -1px rgba(0,0,0,0.05)']);

  return (
    <div className="min-h-screen bg-slate-50 font-sans overflow-x-hidden selection:bg-blue-200 selection:text-blue-900">
      
      {/* Dynamic Background Elements */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-blue-200/30 rounded-full blur-[120px]" />
        <div className="absolute top-[20%] right-[-10%] w-[400px] h-[600px] bg-slate-300/30 rounded-full blur-[150px]" />
      </div>

      {/* Navigation */}
      <motion.nav
        style={{ backgroundColor: navBg, borderBottomColor: navBorder, boxShadow: navShadow }}
        className="fixed top-0 left-0 right-0 z-50 border-b transition-all duration-300"
      >
        <div className="max-w-7xl mx-auto h-20 px-6 lg:px-8 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3 group relative z-10">
            <div className="w-10 h-10 rounded-xl bg-slate-900 flex items-center justify-center text-white font-black text-lg shadow-md group-hover:bg-blue-600 transition-colors duration-300">
              C
            </div>
            <span className="font-black text-2xl tracking-tight text-slate-900 group-hover:text-blue-600 transition-colors">
              ChitFlow
            </span>
          </Link>

          <div className="hidden lg:flex items-center gap-8">
            {['Features', 'How it works', 'Stats'].map((item) => (
              <a
                key={item}
                href={`#${item.toLowerCase().replace(/\s/g, '-')}`}
                className="text-sm font-bold text-slate-600 hover:text-blue-600 transition-colors"
              >
                {item}
              </a>
            ))}
          </div>

          <div className="hidden lg:flex items-center gap-4">
            <Link href="/auth/member/login" className="text-sm font-bold text-slate-600 hover:text-slate-900 px-4 py-2 transition-colors">
              Member Login
            </Link>
            <Link href="/auth/admin/login" className="inline-flex items-center justify-center gap-2 h-12 px-6 rounded-xl bg-slate-900 hover:bg-blue-600 text-white font-bold shadow-md hover:shadow-lg transition-all duration-300 active:scale-95 text-sm">
              <Shield size={16} />
              Agent Portal
            </Link>
          </div>

          {/* Mobile Menu Toggle */}
          <button
            type="button"
            className="lg:hidden p-2 rounded-lg text-slate-700 hover:bg-slate-200 transition-colors z-10"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Toggle Menu"
          >
            {mobileOpen ? <X size={28} /> : <Menu size={28} />}
          </button>
        </div>

        {/* Mobile Dropdown */}
        <AnimatePresence>
          {mobileOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="lg:hidden border-t border-slate-200 bg-white px-6 py-6 space-y-4 shadow-xl overflow-hidden absolute w-full"
            >
              <div className="flex flex-col gap-1">
                {['Features', 'How it works', 'Stats'].map((item) => (
                  <a
                    key={item}
                    href={`#${item.toLowerCase().replace(/\s/g, '-')}`}
                    className="block py-3 px-4 rounded-xl text-lg font-bold text-slate-700 hover:bg-slate-50 hover:text-blue-600 transition-colors"
                    onClick={() => setMobileOpen(false)}
                  >
                    {item}
                  </a>
                ))}
              </div>
              <div className="h-px bg-slate-100 my-4" />
              <div className="flex flex-col gap-3">
                <Link href="/auth/member/login" className="flex items-center justify-center w-full h-14 rounded-xl bg-slate-100 text-slate-800 font-bold hover:bg-slate-200 transition-colors text-lg" onClick={() => setMobileOpen(false)}>
                  Member Login
                </Link>
                <Link href="/auth/admin/login" className="flex items-center justify-center w-full h-14 rounded-xl bg-blue-600 text-white font-bold hover:bg-blue-700 shadow-md transition-colors text-lg" onClick={() => setMobileOpen(false)}>
                  Agent Portal
                </Link>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.nav>

      {/* Hero Section */}
      <section className="relative z-10 pt-32 pb-16 md:pt-40 md:pb-24 px-6 lg:px-8 min-h-[90vh] flex items-center">
        <div className="max-w-7xl mx-auto w-full">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-8 items-center">
            
            {/* Left Content */}
            <div className="flex flex-col text-center lg:text-left items-center lg:items-start pt-8 lg:pt-0">
              <motion.div
                custom={0}
                variants={fadeUp}
                initial="hidden"
                animate="show"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-slate-200 mb-8 shadow-sm"
              >
                <Sparkles size={16} className="text-blue-600" />
                <span className="text-xs font-bold text-slate-700 uppercase tracking-widest">
                  Modern Chit Fund Management
                </span>
              </motion.div>

              <motion.h1
                custom={1}
                variants={fadeUp}
                initial="hidden"
                animate="show"
                className="text-4xl md:text-5xl lg:text-6xl font-black text-slate-900 leading-[1.1] tracking-tight mb-6"
              >
                Manage your chits with <span className="text-blue-600">clarity</span>.
              </motion.h1>

              <motion.p
                custom={2}
                variants={fadeUp}
                initial="hidden"
                animate="show"
                className="text-lg md:text-xl text-slate-600 leading-relaxed max-w-xl mb-10"
              >
                A professional, easy-to-use platform for agents to track collections, organize auctions, and keep members updated in real-time.
              </motion.p>

              <motion.div
                custom={3}
                variants={fadeUp}
                initial="hidden"
                animate="show"
                className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto"
              >
                <Link href="/auth/admin/register" className="inline-flex items-center justify-center gap-2 h-14 px-8 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold shadow-lg shadow-blue-600/20 transition-transform active:scale-95 w-full sm:w-auto text-base">
                  Start as Agent
                  <ArrowRight size={18} />
                </Link>
                <Link href="/auth/member/login" className="inline-flex items-center justify-center gap-2 h-14 px-8 rounded-xl bg-white text-slate-800 font-bold border border-slate-200 shadow-sm hover:border-slate-300 hover:bg-slate-50 transition-colors w-full sm:w-auto text-base">
                  Member Portal
                </Link>
              </motion.div>
            </div>

            {/* Right Interactive Preview */}
            <div className="relative mx-auto w-full max-w-lg lg:max-w-none mt-8 lg:mt-0">
              <motion.div
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, ease: "easeOut", delay: 0.3 }}
                className="relative"
              >
                {/* Decorative background blur */}
                <div className="absolute -inset-4 bg-gradient-to-br from-blue-200/50 to-slate-300/40 rounded-[2rem] blur-2xl -z-10" />
                
                <div className="relative bg-white rounded-3xl p-6 md:p-8 shadow-2xl border border-slate-100">
                  {/* Mock UI Header */}
                  <div className="flex items-center justify-between mb-8 border-b border-slate-100 pb-5">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-xl bg-slate-900 flex items-center justify-center text-white text-base font-black shadow-md">C</div>
                      <div>
                        <p className="text-base font-black text-slate-900">Dashboard</p>
                        <p className="text-xs text-slate-500 font-semibold">Agent Overview</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 px-4 py-2 bg-slate-50 rounded-full border border-slate-200">
                      <div className="w-2.5 h-2.5 rounded-full bg-blue-500 animate-pulse" />
                      <span className="text-[10px] font-bold text-slate-700 uppercase tracking-widest">Online</span>
                    </div>
                  </div>

                  {/* Mock UI Stats */}
                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100">
                      <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center mb-3">
                        <Layers size={20} />
                      </div>
                      <p className="text-3xl font-black text-slate-900">12</p>
                      <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mt-1">Active Groups</p>
                    </div>
                    <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100">
                      <div className="w-10 h-10 rounded-xl bg-slate-200 text-slate-700 flex items-center justify-center mb-3">
                        <IndianRupee size={20} />
                      </div>
                      <p className="text-3xl font-black text-slate-900">₹8.5L</p>
                      <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mt-1">This Month</p>
                    </div>
                  </div>

                  {/* Mock UI List */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-4 rounded-xl bg-white border border-slate-200 shadow-sm">
                      <div className="flex items-center gap-3">
                        <div className="w-3 h-3 rounded-full bg-blue-500" />
                        <span className="text-sm font-bold text-slate-800">Diwali Pool 2026</span>
                      </div>
                      <span className="text-xs font-black text-blue-600 bg-blue-50 px-3 py-1.5 rounded-lg border border-blue-100">Month 8/20</span>
                    </div>
                    <div className="flex items-center justify-between p-4 rounded-xl bg-slate-50 border border-slate-100 opacity-60">
                      <div className="flex items-center gap-3">
                        <div className="w-3 h-3 rounded-full bg-slate-400" />
                        <span className="text-sm font-bold text-slate-800">Office Chit Fund</span>
                      </div>
                      <span className="text-xs font-black text-slate-500 bg-slate-200 px-3 py-1.5 rounded-lg">Completed</span>
                    </div>
                  </div>
                </div>

                {/* Floating Notification */}
                <motion.div
                  animate={{ y: [0, -10, 0] }}
                  transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
                  className="absolute -bottom-6 -left-4 md:-left-8 bg-slate-900 rounded-2xl p-4 shadow-xl border border-slate-800 flex items-center gap-4 z-20"
                >
                  <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white">
                    <CheckCircle2 size={20} />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-white">Payment Received</p>
                    <p className="text-xs font-medium text-slate-400">₹20,000 via UPI</p>
                  </div>
                </motion.div>
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section id="stats" className="py-16 md:py-24 px-6 lg:px-8 bg-white border-y border-slate-200">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12">
            {stats.map((stat, i) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ delay: i * 0.1, duration: 0.5 }}
                className="text-center p-6"
              >
                <p className="text-4xl md:text-5xl lg:text-6xl font-black text-slate-900 mb-3">{stat.value}</p>
                <p className="text-xs md:text-sm font-bold text-slate-500 uppercase tracking-widest">{stat.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 md:py-32 px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20 md:mb-24">
            <h2 className="text-3xl md:text-5xl font-black text-slate-900 tracking-tight mb-4">Everything you need.</h2>
            <p className="text-slate-600 max-w-2xl mx-auto text-lg">
              A comprehensive suite of tools designed specifically for chit fund managers to operate flawlessly.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((f, i) => (
              <motion.div
                key={f.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm hover:shadow-lg hover:border-slate-300 transition-all duration-300"
              >
                <div className="w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-800 mb-6 border border-slate-200">
                  <f.icon size={28} strokeWidth={2} />
                </div>
                <h3 className="text-xl font-black text-slate-900 mb-3">{f.title}</h3>
                <p className="text-slate-600 leading-relaxed text-base">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-24 md:py-32 px-6 lg:px-8 bg-slate-900 text-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20 md:mb-24">
            <h2 className="text-3xl md:text-5xl font-black tracking-tight mb-4">How it works</h2>
            <p className="text-slate-400 text-lg">Three simple steps to digitize your entire operation.</p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-12 relative">
            {/* Connecting line for desktop */}
            <div className="hidden md:block absolute top-12 left-1/6 right-1/6 h-0.5 bg-slate-800 z-0" />
            
            {[
              { step: '01', title: 'Register Account', desc: 'Sign up as an agent, configure your settings, and invite your members.' },
              { step: '02', title: 'Create Groups', desc: 'Define chit value, duration, and variations. Add members to the newly created group.' },
              { step: '03', title: 'Manage Monthly', desc: 'Track payments, run auctions, and distribute payouts with automated schedules.' },
            ].map((item, i) => (
              <motion.div
                key={item.step}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.2 }}
                className="relative z-10 flex flex-col items-center text-center"
              >
                <div className="w-24 h-24 rounded-full bg-slate-900 border-[8px] border-slate-800 flex items-center justify-center text-2xl font-black text-blue-500 mb-6 shadow-xl">
                  {item.step}
                </div>
                <h3 className="text-2xl font-black mb-3">{item.title}</h3>
                <p className="text-slate-400 text-base px-4 leading-relaxed">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-slate-900 pb-24 md:pb-32 px-6 lg:px-8">
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="rounded-[2.5rem] bg-blue-600 p-12 md:p-20 text-center relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-white/10 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/3 pointer-events-none" />
            
            <h2 className="text-3xl md:text-5xl lg:text-6xl font-black mb-6 relative z-10 text-white tracking-tight">
              Ready to modernize?
            </h2>
            <p className="text-blue-100 text-lg md:text-xl mb-12 max-w-2xl mx-auto relative z-10 leading-relaxed">
              Join agents who manage collections with confidence, clarity, and complete transparency.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center relative z-10">
              <Link
                href="/auth/admin/register"
                className="inline-flex items-center justify-center gap-2 h-16 px-10 rounded-2xl bg-slate-900 text-white font-black hover:bg-slate-800 transition-transform active:scale-95 w-full sm:w-auto text-lg shadow-xl"
              >
                Start as Agent
                <ArrowRight size={20} />
              </Link>
              <Link
                href="/auth/member/login"
                className="inline-flex items-center justify-center gap-2 h-16 px-10 rounded-2xl bg-white/10 border border-white/20 text-white font-bold hover:bg-white/20 transition-colors w-full sm:w-auto text-lg"
              >
                Member Login
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 md:py-16 px-6 lg:px-8 bg-slate-50 border-t border-slate-200">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-slate-900 flex items-center justify-center text-white font-black text-lg">C</div>
            <span className="font-black text-xl text-slate-900">ChitFlow</span>
          </div>
          <p className="text-sm font-semibold text-slate-500 text-center md:text-right">
            © {new Date().getFullYear()} ChitFlow. Transparent chit fund management.
          </p>
        </div>
      </footer>
    </div>
  );
}
