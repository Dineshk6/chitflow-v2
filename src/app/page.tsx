'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { motion, useScroll, useTransform } from 'framer-motion';
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
} from 'lucide-react';
import { cn } from '@/lib/utils';

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
    desc: 'Fair winner selection with dividend calculations built in.',
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
  { label: 'States', value: '12' },
];

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  show: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, delay: i * 0.08, ease: [0.22, 1, 0.36, 1] },
  }),
};

export default function LandingPage() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { scrollY } = useScroll();
  const navBg = useTransform(scrollY, [0, 80], ['rgba(255,255,255,0)', 'rgba(255,255,255,0.92)']);
  const navBorder = useTransform(scrollY, [0, 80], ['rgba(255,255,255,0)', 'rgba(226,232,240,0.9)']);

  return (
    <div className="min-h-screen page-mesh overflow-x-hidden">
      {/* Nav */}
      <motion.nav
        style={{ backgroundColor: navBg, borderBottomColor: navBorder }}
        className="fixed top-0 left-0 right-0 z-50 border-b backdrop-blur-xl"
      >
        <div className="max-w-6xl mx-auto h-16 sm:h-[4.5rem] px-4 sm:px-6 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 rounded-xl gradient-blue flex items-center justify-center text-white font-black text-lg shadow-lg shadow-blue-500/30 group-hover:scale-105 transition-transform">
              C
            </div>
            <span className="font-black text-xl tracking-tight text-slate-900">ChitFlow</span>
          </Link>

          <div className="hidden md:flex items-center gap-8">
            {['Features', 'How it works', 'Stats'].map((item) => (
              <a
                key={item}
                href={`#${item.toLowerCase().replace(/\s/g, '-')}`}
                className="text-sm font-semibold text-slate-600 hover:text-blue-600 transition-colors"
              >
                {item}
              </a>
            ))}
          </div>

          <div className="hidden md:flex items-center gap-3">
            <Link href="/auth/member/login" className="text-sm font-bold text-slate-600 hover:text-blue-600 px-4 py-2 transition-colors">
              Member Login
            </Link>
            <Link href="/auth/admin/login" className="btn-primary !h-11 !px-5 !rounded-xl text-sm">
              <Shield size={16} />
              Agent Login
            </Link>
          </div>

          <button
            type="button"
            className="md:hidden p-2 rounded-xl text-slate-700 hover:bg-white/80"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Menu"
          >
            {mobileOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>

        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="md:hidden border-t border-slate-200/80 bg-white/95 backdrop-blur-xl px-4 py-4 space-y-3"
          >
            <a href="#features" className="block py-2 text-sm font-semibold text-slate-700" onClick={() => setMobileOpen(false)}>
              Features
            </a>
            <a href="#how-it-works" className="block py-2 text-sm font-semibold text-slate-700" onClick={() => setMobileOpen(false)}>
              How it works
            </a>
            <Link href="/auth/member/login" className="block btn-secondary w-full !rounded-xl" onClick={() => setMobileOpen(false)}>
              Member Login
            </Link>
            <Link href="/auth/admin/login" className="block btn-primary w-full !rounded-xl" onClick={() => setMobileOpen(false)}>
              Agent Login
            </Link>
          </motion.div>
        )}
      </motion.nav>

      {/* Hero */}
      <section className="pt-28 sm:pt-36 pb-16 sm:pb-24 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            <div>
              <motion.div
                custom={0}
                variants={fadeUp}
                initial="hidden"
                animate="show"
                className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-100/80 border border-blue-200/60 mb-6"
              >
                <Sparkles size={14} className="text-blue-600" />
                <span className="text-[11px] font-bold text-blue-700 uppercase tracking-wider">
                  Built for chit fund agents
                </span>
              </motion.div>

              <motion.h1
                custom={1}
                variants={fadeUp}
                initial="hidden"
                animate="show"
                className="text-4xl sm:text-5xl lg:text-[3.25rem] font-black text-slate-900 leading-[1.1] tracking-tight"
              >
                Run your chit fund{' '}
                <span className="text-gradient-blue">smarter</span>, not harder
              </motion.h1>

              <motion.p
                custom={2}
                variants={fadeUp}
                initial="hidden"
                animate="show"
                className="mt-5 text-base sm:text-lg text-slate-600 leading-relaxed max-w-lg"
              >
                Manage groups, track monthly payments, pick winners, and keep members informed — all from one beautiful blue dashboard.
              </motion.p>

              <motion.div
                custom={3}
                variants={fadeUp}
                initial="hidden"
                animate="show"
                className="mt-8 flex flex-col sm:flex-row gap-3"
              >
                <Link href="/auth/admin/register" className="btn-primary h-13 px-8">
                  Start as Agent
                  <ArrowRight size={18} />
                </Link>
                <Link href="/auth/member/login" className="btn-secondary h-13 px-8">
                  Member Portal
                </Link>
              </motion.div>

              <motion.div
                custom={4}
                variants={fadeUp}
                initial="hidden"
                animate="show"
                className="mt-10 flex flex-wrap gap-6 text-sm"
              >
                {['No spreadsheets', 'Phone-based member login', 'Real-time messages'].map((t) => (
                  <span key={t} className="flex items-center gap-2 text-slate-600 font-medium">
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                    {t}
                  </span>
                ))}
              </motion.div>
            </div>

            {/* Preview card */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 30 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.2 }}
              className="relative"
            >
              <div className="absolute -inset-4 bg-gradient-to-br from-blue-400/20 to-indigo-500/20 rounded-[2rem] blur-2xl" />
              <div className="relative glass rounded-3xl p-5 sm:p-6 shadow-2xl shadow-blue-500/10 border-blue-100/80 animate-float">
                <div className="flex items-center justify-between mb-5">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg gradient-blue flex items-center justify-center text-white text-xs font-black">C</div>
                    <div>
                      <p className="text-xs font-black text-slate-900">Agent Dashboard</p>
                      <p className="text-[10px] text-slate-500 font-semibold">Live overview</p>
                    </div>
                  </div>
                  <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full">Online</span>
                </div>

                <div className="grid grid-cols-2 gap-3 mb-4">
                  {[
                    { label: 'Groups', val: '8', icon: Layers, bg: 'bg-blue-50 text-blue-600' },
                    { label: 'Collected', val: '₹4.2L', icon: IndianRupee, bg: 'bg-indigo-50 text-indigo-600' },
                  ].map((s) => (
                    <div key={s.label} className="surface-card !shadow-none p-4 rounded-2xl">
                      <div className={cn('w-9 h-9 rounded-xl flex items-center justify-center mb-2', s.bg)}>
                        <s.icon size={18} />
                      </div>
                      <p className="text-xl font-black text-slate-900">{s.val}</p>
                      <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">{s.label}</p>
                    </div>
                  ))}
                </div>

                <div className="space-y-2">
                  {['Family Chit — Month 6', 'Office Pool — Month 3'].map((name, i) => (
                    <div
                      key={name}
                      className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100"
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <div className="w-2 h-2 rounded-full bg-blue-500 shrink-0" />
                        <span className="text-xs font-bold text-slate-800 truncate">{name}</span>
                      </div>
                      <span className="text-[10px] font-bold text-blue-600 shrink-0 ml-2">
                        {i === 0 ? '92% paid' : '78% paid'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <motion.div
                animate={{ y: [0, -8, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
                className="absolute -bottom-4 -left-2 sm:-left-6 glass rounded-2xl px-4 py-3 shadow-lg hidden sm:flex items-center gap-2"
              >
                <Bell size={16} className="text-blue-600" />
                <span className="text-xs font-bold text-slate-700">3 new member messages</span>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section id="stats" className="py-12 sm:py-16 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {stats.map((stat, i) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.06 }}
                className="surface-card p-5 sm:p-6 text-center"
              >
                <p className="text-2xl sm:text-3xl font-black text-gradient-blue">{stat.value}</p>
                <p className="text-[10px] sm:text-xs font-bold text-slate-500 uppercase tracking-widest mt-1">{stat.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-16 sm:py-24 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12 sm:mb-16"
          >
            <h2 className="text-3xl sm:text-4xl font-black text-slate-900">Everything agents need</h2>
            <p className="text-slate-600 mt-3 max-w-xl mx-auto text-sm sm:text-base">
              A focused toolkit for daily chit operations — no clutter, no learning curve.
            </p>
          </motion.div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {features.map((f, i) => (
              <motion.div
                key={f.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
                whileHover={{ y: -6 }}
                className="surface-card p-6 sm:p-7 group"
              >
                <div className="w-12 h-12 rounded-2xl gradient-blue flex items-center justify-center text-white shadow-lg shadow-blue-500/25 mb-5 group-hover:scale-110 transition-transform">
                  <f.icon size={22} />
                </div>
                <h3 className="text-lg font-black text-slate-900 mb-2">{f.title}</h3>
                <p className="text-sm text-slate-600 leading-relaxed">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="how-it-works" className="py-16 sm:py-20 px-4 sm:px-6 bg-white/60 border-y border-slate-200/60">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 text-center mb-10">How it works</h2>
          <div className="grid md:grid-cols-3 gap-6 sm:gap-8">
            {[
              { step: '01', title: 'Register as agent', desc: 'Create your account and set up your first chit group in minutes.' },
              { step: '02', title: 'Add members & track', desc: 'Record monthly payments, mark winners, and send updates instantly.' },
              { step: '03', title: 'Members stay informed', desc: 'Members log in with their phone to view dues, wins, and message you.' },
            ].map((item, i) => (
              <motion.div
                key={item.step}
                initial={{ opacity: 0, x: -12 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="relative p-6 rounded-2xl border border-blue-100 bg-gradient-to-br from-white to-blue-50/50"
              >
                <span className="text-4xl font-black text-blue-100 absolute top-4 right-4">{item.step}</span>
                <h3 className="text-lg font-black text-slate-900 mb-2 relative z-10">{item.title}</h3>
                <p className="text-sm text-slate-600 relative z-10">{item.desc}</p>
                {i < 2 && (
                  <ChevronRight className="hidden md:block absolute -right-4 top-1/2 -translate-y-1/2 text-blue-300 z-20" size={24} />
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 sm:py-24 px-4 sm:px-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="max-w-4xl mx-auto rounded-[2rem] gradient-blue p-10 sm:p-14 text-center text-white relative overflow-hidden shadow-2xl shadow-blue-600/30"
        >
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-indigo-400/30 rounded-full blur-3xl translate-y-1/2 -translate-x-1/4" />
          <h2 className="text-3xl sm:text-4xl font-black mb-4 relative z-10">
            Ready to modernize your chit business?
          </h2>
          <p className="text-blue-100 text-sm sm:text-base mb-8 max-w-md mx-auto relative z-10">
            Join agents who manage collections with confidence and clarity.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center relative z-10">
            <Link
              href="/auth/admin/register"
              className="inline-flex items-center justify-center gap-2 h-13 px-8 rounded-2xl bg-white text-blue-700 font-black shadow-xl hover:scale-[1.02] transition-transform"
            >
              Register as Agent
              <Shield size={18} />
            </Link>
            <Link
              href="/auth/member/login"
              className="inline-flex items-center justify-center gap-2 h-13 px-8 rounded-2xl bg-white/15 border border-white/30 text-white font-bold hover:bg-white/25 transition-colors"
            >
              Member Login
            </Link>
          </div>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-4 sm:px-6 border-t border-slate-200/80 bg-white/50">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg gradient-blue flex items-center justify-center text-white font-black text-sm">C</div>
            <span className="font-black text-slate-900">ChitFlow</span>
          </div>
          <p className="text-xs font-semibold text-slate-500 text-center sm:text-right">
            © {new Date().getFullYear()} ChitFlow. Transparent chit fund management.
          </p>
        </div>
      </footer>
    </div>
  );
}
