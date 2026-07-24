'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Shield,
  ArrowRight,
  Layers,
  Users,
  Wallet,
  FileText,
  ChevronDown,
  CheckCircle2,
} from 'lucide-react';
import { motion } from 'framer-motion';

/* ── Brand Logo Mark ── */
function ChitFlowMark({ size = 36 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 44 44" fill="none" xmlns="http://www.w3.org/2000/svg" className="shrink-0">
      <defs>
        <linearGradient id="hpMarkGradMain" x1="0" y1="0" x2="44" y2="44" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#3b82f6" />
          <stop offset="100%" stopColor="#6366f1" />
        </linearGradient>
      </defs>
      <rect width="44" height="44" rx="12" fill="url(#hpMarkGradMain)" />
      <path d="M 10 15 L 17 22 L 10 29" stroke="white" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round" opacity="0.6" />
      <path d="M 19 15 L 26 22 L 19 29" stroke="white" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="33" cy="22" r="2.2" fill="white" opacity="0.9" />
    </svg>
  );
}

const SCHEMES = [
  { name: 'Silver Pool', value: 500000, duration: 20, monthly: 25000, winner: 475000 },
  { name: 'Gold Pool', value: 1000000, duration: 20, monthly: 50000, winner: 950000 },
  { name: 'Diamond Pool', value: 2000000, duration: 40, monthly: 50000, winner: 1900000 },
];

const FAQS = [
  {
    q: 'How does ChitFlow compute monthly payouts and dividend splits?',
    a: 'ChitFlow automatically deducts the 5% organizer commission from the pool, then divides the remaining auction discount equally across all non-winning members in real-time.'
  },
  {
    q: 'Can members log in to view their individual payment ledgers?',
    a: 'Yes. Members access their own dedicated portal using their mobile number to track monthly credits, view upcoming due dates, and download payment receipts.'
  },
  {
    q: 'Are reports available for offline record-keeping and printing?',
    a: 'Yes. You can export complete scheme summary sheets, member directories, and transaction ledgers directly into print-ready PDF files.'
  },
  {
    q: 'Is there any complex software installation required?',
    a: 'No installation required. ChitFlow is a 100% cloud-based responsive web platform accessible from any mobile phone, tablet, or laptop.'
  }
];

export default function LandingPage() {
  const [selectedScheme, setSelectedScheme] = useState(1);
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [consoleTab, setConsoleTab] = useState<'overview' | 'auction' | 'reports'>('overview');

  const scheme = SCHEMES[selectedScheme];

  return (
    <div style={{ minHeight: '100vh', background: '#05091a', color: '#f8fafc', fontFamily: '-apple-system, BlinkMacSystemFont, "Inter", "Segoe UI", sans-serif', position: 'relative', overflowX: 'hidden' }}>

      {/* ════════ AURORA MESH BACKGROUND ════════ */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div style={{ position: 'absolute', top: -160, left: '15%', width: 'min(800px, 90vw)', height: 'min(800px, 90vw)', borderRadius: '50%', background: 'radial-gradient(circle, rgba(37,99,235,0.15) 0%, transparent 65%)' }} />
        <div style={{ position: 'absolute', top: '40%', right: -100, width: 'min(750px, 85vw)', height: 'min(750px, 85vw)', borderRadius: '50%', background: 'radial-gradient(circle, rgba(99,102,241,0.12) 0%, transparent 65%)' }} />
      </div>

      {/* SVG NOISE GRAIN */}
      <svg className="fixed top-0 left-0 w-full h-full pointer-events-none z-0 opacity-20">
        <filter id="hpNoiseGrad">
          <feTurbulence type="fractalNoise" baseFrequency="0.8" numOctaves="3" stitchTiles="stitch" />
        </filter>
        <rect width="100%" height="100%" filter="url(#hpNoiseGrad)" />
      </svg>

      {/* ════════ NAVBAR ════════ */}
      <nav style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 50,
        height: 68, background: 'rgba(5,9,26,0.92)', backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)',
        borderBottom: '1px solid rgba(255,255,255,0.06)',
      }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full flex items-center justify-between">
          
          {/* Left: Brand Logo */}
          <Link href="/" className="flex items-center gap-3 no-underline">
            <ChitFlowMark size={34} />
            <div>
              <p style={{ color: 'white', fontWeight: 900, fontSize: 17, letterSpacing: '-0.03em', margin: 0, lineHeight: 1 }}>ChitFlow</p>
              <p style={{ color: '#6366f1', fontWeight: 700, fontSize: 9, letterSpacing: '0.14em', textTransform: 'uppercase', margin: 0, marginTop: 2 }}>Admin Suite</p>
            </div>
          </Link>

          {/* Desktop Nav Links (Hidden on small mobile) */}
          <div className="hidden lg:flex items-center gap-8">
            <a href="#features" className="text-slate-400 hover:text-white text-xs font-semibold tracking-wide uppercase transition-colors">Features</a>
            <a href="#calculator" className="text-slate-400 hover:text-white text-xs font-semibold tracking-wide uppercase transition-colors">Calculator</a>
            <a href="#faq" className="text-slate-400 hover:text-white text-xs font-semibold tracking-wide uppercase transition-colors">FAQ</a>
          </div>

          {/* Right Action: Agent Sign In Button */}
          <div className="flex items-center gap-2 sm:gap-3">
            <Link href="/auth/member/login" className="hidden sm:inline-block text-slate-300 hover:text-white text-xs font-bold px-3 py-2 transition-colors">
              Member Login
            </Link>
            <Link href="/auth/admin/login" style={{
              display: 'inline-flex', alignItems: 'center', gap: 7, height: 38, padding: '0 14px', borderRadius: 10,
              background: 'linear-gradient(135deg, #2563eb, #4f46e5)', color: 'white', fontSize: 12, fontWeight: 800,
              textDecoration: 'none', boxShadow: '0 4px 16px rgba(37,99,235,0.3)', transition: 'all 0.15s ease'
            }}>
              <Shield size={14} />
              <span>Agent Sign In</span>
            </Link>
          </div>

        </div>
      </nav>

      {/* ════════ HERO SECTION ════════ */}
      <header className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-32 sm:pt-40 pb-16 sm:pb-24">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          
          {/* Left Column: Copy & Actions */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="lg:col-span-7 flex flex-col gap-6 text-left"
          >
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 w-fit">
              <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
              <span className="text-[11px] font-extrabold tracking-wider uppercase text-blue-300">
                Digital Chit Fund Platform
              </span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black leading-[1.08] tracking-tight text-white">
              Manage chit funds with{' '}
              <span className="bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">
                absolute clarity.
              </span>
            </h1>

            <p className="text-slate-400 text-base sm:text-lg leading-relaxed max-w-xl">
              ChitFlow replaces manual ledgers with structured financial records, real-time dividend calculations, and instant member notifications.
            </p>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-2">
              <Link href="/auth/admin/register" style={{
                display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 10, height: 48, padding: '0 26px', borderRadius: 12,
                background: 'linear-gradient(135deg, #2563eb, #4f46e5)', color: 'white', fontSize: 13, fontWeight: 800,
                textDecoration: 'none', boxShadow: '0 6px 24px rgba(37,99,235,0.35)', transition: 'all 0.15s ease'
              }}>
                Register as Agent
                <ArrowRight size={15} />
              </Link>
              <Link href="/auth/member/login" style={{
                display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 8, height: 48, padding: '0 24px', borderRadius: 12,
                background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', fontSize: 13, fontWeight: 700,
                textDecoration: 'none', transition: 'all 0.15s ease'
              }}>
                Member Portal
              </Link>
            </div>

            {/* Feature Metrics Bar */}
            <div className="grid grid-cols-3 gap-4 pt-6 border-t border-white/5">
              <div>
                <p className="text-xl sm:text-2xl font-black text-white">100%</p>
                <p className="text-xs font-semibold text-slate-500 mt-1">Automated Math</p>
              </div>
              <div>
                <p className="text-xl sm:text-2xl font-black text-white">5%</p>
                <p className="text-xs font-semibold text-slate-500 mt-1">Fixed Commission</p>
              </div>
              <div>
                <p className="text-xl sm:text-2xl font-black text-white">Instant</p>
                <p className="text-xs font-semibold text-slate-500 mt-1">PDF Reports</p>
              </div>
            </div>
          </motion.div>

          {/* Right Column: Console Showcase */}
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4, delay: 0.12 }}
            className="lg:col-span-5 relative"
          >
            <div style={{
              background: '#0c1228', borderRadius: 24, border: '1px solid rgba(255,255,255,0.08)',
              padding: '24px', boxShadow: '0 32px 80px rgba(0,0,0,0.6)', position: 'relative', overflow: 'hidden'
            }}>
              <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 2, background: 'linear-gradient(90deg, #3b82f6, #6366f1)' }} />

              {/* Console Header Bar */}
              <div className="flex items-center justify-between pb-4 border-b border-white/5 mb-5">
                <div className="flex items-center gap-3">
                  <ChitFlowMark size={32} />
                  <div>
                    <p style={{ color: 'white', fontWeight: 800, fontSize: 14, margin: 0, lineHeight: 1 }}>Console Preview</p>
                    <p style={{ color: '#6366f1', fontWeight: 700, fontSize: 9, letterSpacing: '0.14em', textTransform: 'uppercase', margin: 0, marginTop: 3 }}>Live Dashboard</p>
                  </div>
                </div>
                <span className="text-[10px] font-black text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded-full">
                  Active
                </span>
              </div>

              {/* Console Tabs */}
              <div className="grid grid-cols-3 gap-1 bg-white/5 p-1 rounded-xl mb-4">
                {(['overview', 'auction', 'reports'] as const).map(tab => (
                  <button
                    key={tab}
                    onClick={() => setConsoleTab(tab)}
                    className={`py-1.5 text-[11px] font-bold rounded-lg capitalize transition-all ${
                      consoleTab === tab ? 'bg-blue-600 text-white shadow' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    {tab}
                  </button>
                ))}
              </div>

              {/* Tab Content */}
              {consoleTab === 'overview' && (
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-3.5 rounded-xl bg-white/[0.03] border border-white/[0.06]">
                      <p className="text-[9px] font-bold text-slate-500 uppercase tracking-wider mb-1">Gold Scheme Pool</p>
                      <p className="text-lg sm:text-xl font-black text-white">₹10,00,000</p>
                    </div>
                    <div className="p-3.5 rounded-xl bg-blue-500/10 border border-blue-500/20">
                      <p className="text-[9px] font-bold text-blue-400 uppercase tracking-wider mb-1">Winner Payout</p>
                      <p className="text-lg sm:text-xl font-black text-blue-400">₹9,50,000</p>
                    </div>
                  </div>

                  <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/[0.05] flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400 font-bold text-xs">
                        RK
                      </div>
                      <div>
                        <p className="text-xs font-bold text-white">Rajesh Kumar</p>
                        <p className="text-[10px] text-slate-500 mt-0.5">Month 1 • Gold Scheme</p>
                      </div>
                    </div>
                    <span className="text-xs font-black text-emerald-400">₹4,85,000</span>
                  </div>
                </div>
              )}

              {consoleTab === 'auction' && (
                <div className="space-y-3">
                  <div className="p-3.5 rounded-xl bg-indigo-500/10 border border-indigo-500/20 space-y-2">
                    <div className="flex justify-between text-xs">
                      <span className="text-slate-400 font-medium">Lowest Bid Margin:</span>
                      <span className="text-white font-bold">₹50,000 (5%)</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-slate-400 font-medium">Dividends / Member:</span>
                      <span className="text-emerald-400 font-bold">₹2,375</span>
                    </div>
                  </div>
                  <div className="text-[11px] text-slate-400 p-2 bg-white/[0.02] rounded-lg text-center font-medium">
                    Auction automatically recorded with audit timestamp
                  </div>
                </div>
              )}

              {consoleTab === 'reports' && (
                <div className="space-y-2">
                  <div className="p-3 rounded-xl bg-white/[0.03] border border-white/[0.06] flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <FileText size={14} className="text-blue-400" />
                      <span className="text-white font-bold">Monthly_Dividend_Report.pdf</span>
                    </div>
                    <span className="text-[10px] text-emerald-400 font-bold">Ready</span>
                  </div>
                  <div className="p-3 rounded-xl bg-white/[0.03] border border-white/[0.06] flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <FileText size={14} className="text-indigo-400" />
                      <span className="text-white font-bold">Group_Ledger_Summary.pdf</span>
                    </div>
                    <span className="text-[10px] text-emerald-400 font-bold">Ready</span>
                  </div>
                </div>
              )}
            </div>
          </motion.div>

        </div>
      </header>

      {/* ════════ SCHEME CALCULATOR SECTION ════════ */}
      <section id="calculator" className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 border-t border-white/5">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-white tracking-tight">
            Scheme Schedule Calculator
          </h2>
          <p className="text-slate-400 text-sm sm:text-base font-medium mt-3">
            Select a scheme preset to preview instant schedule estimates.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 max-w-4xl mx-auto">
          {/* Controls */}
          <div className="lg:col-span-6 p-6 sm:p-8 rounded-2xl bg-white/[0.02] border border-white/[0.06] flex flex-col gap-6">
            <div>
              <label className="text-[10px] font-extrabold tracking-wider uppercase text-slate-500 block mb-3">
                Select Scheme Preset
              </label>
              <div className="grid grid-cols-3 gap-2">
                {SCHEMES.map((s, idx) => (
                  <button
                    key={s.name}
                    type="button"
                    onClick={() => setSelectedScheme(idx)}
                    className={`h-10 rounded-xl border text-xs font-bold transition-all ${
                      selectedScheme === idx
                        ? 'bg-gradient-to-r from-blue-600 to-indigo-600 border-transparent text-white shadow-md'
                        : 'bg-white/5 border-white/10 text-slate-400 hover:text-white'
                    }`}
                  >
                    {s.name.split(' ')[0]}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <span className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider block mb-1">
                Total Chit Value
              </span>
              <p className="text-3xl font-black text-white tracking-tight">
                ₹{scheme.value.toLocaleString('en-IN')}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="p-3.5 rounded-xl bg-white/[0.03] border border-white/[0.05]">
                <p className="text-[9px] font-extrabold text-slate-500 uppercase mb-1">Regular Pay</p>
                <p className="text-base font-black text-white">₹{scheme.monthly.toLocaleString('en-IN')}</p>
              </div>
              <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
                <p className="text-[9px] font-extrabold text-emerald-400 uppercase mb-1">Max Winner Payout</p>
                <p className="text-base font-black text-emerald-400">₹{scheme.winner.toLocaleString('en-IN')}</p>
              </div>
            </div>
          </div>

          {/* Details */}
          <div className="lg:col-span-6 p-6 sm:p-8 rounded-2xl bg-[#0c1228] border border-white/[0.08] flex flex-col justify-between gap-6 relative overflow-hidden">
            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 2, background: 'linear-gradient(90deg, #3b82f6, #6366f1)' }} />

            <div className="space-y-4">
              <span className="text-xs font-extrabold text-indigo-400 tracking-wider uppercase">Estimated Metrics</span>
              
              <div className="space-y-3 pt-2">
                <div className="flex justify-between text-xs sm:text-sm">
                  <span className="text-slate-400 font-medium">Organiser Commission (5%):</span>
                  <span className="text-white font-bold">₹{(scheme.value * 0.05).toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between text-xs sm:text-sm">
                  <span className="text-slate-400 font-medium">Duration Limit:</span>
                  <span className="text-white font-bold">{scheme.duration} Months</span>
                </div>
                <div className="flex justify-between text-xs sm:text-sm">
                  <span className="text-slate-400 font-medium">Max Monthly Dividend / Member:</span>
                  <span className="text-emerald-400 font-bold">Dynamic</span>
                </div>
              </div>
            </div>

            <Link href="/auth/admin/register" style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, height: 46, borderRadius: 12,
              background: 'linear-gradient(135deg, #2563eb, #4f46e5)', color: 'white', fontSize: 13, fontWeight: 800,
              textDecoration: 'none', boxShadow: '0 4px 16px rgba(37,99,235,0.35)'
            }}>
              Create Group with this Schedule
              <ArrowRight size={15} />
            </Link>
          </div>
        </div>
      </section>

      {/* ════════ FEATURES GRID ════════ */}
      <section id="features" className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 border-t border-white/5">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-white tracking-tight">
            Platform Capabilities
          </h2>
          <p className="text-slate-400 text-sm sm:text-base font-medium mt-3">
            Built specifically for organizers running modern chit funds.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          
          <div className="p-6 sm:p-8 rounded-2xl bg-white/[0.02] border border-white/[0.06] hover:border-blue-500/30 transition-all">
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 mb-5">
              <Layers size={20} />
            </div>
            <h3 className="text-white text-lg font-bold mb-2">Automated Math</h3>
            <p className="text-slate-400 text-xs sm:text-sm leading-relaxed">
              ChitFlow dynamically handles regular contributions, auction margins, 5% organizer commissions, and dividend payouts.
            </p>
          </div>

          <div className="p-6 sm:p-8 rounded-2xl bg-white/[0.02] border border-white/[0.06] hover:border-indigo-500/30 transition-all">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 mb-5">
              <Users size={20} />
            </div>
            <h3 className="text-white text-lg font-bold mb-2">Member Directories</h3>
            <p className="text-slate-400 text-xs sm:text-sm leading-relaxed">
              Easily review historical payment records, payment statuses, pending invoices, and verified profiles in real-time.
            </p>
          </div>

          <div className="p-6 sm:p-8 rounded-2xl bg-white/[0.02] border border-white/[0.06] hover:border-emerald-500/30 transition-all sm:col-span-2 lg:col-span-1">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 mb-5">
              <Wallet size={20} />
            </div>
            <h3 className="text-white text-lg font-bold mb-2">PDF Exports &amp; Reports</h3>
            <p className="text-slate-400 text-xs sm:text-sm leading-relaxed">
              Generate professional PDF statements, scheme calendars, and payment audit logs ready for printing or instant sharing.
            </p>
          </div>

        </div>
      </section>

      {/* ════════ FAQ SECTION ════════ */}
      <section id="faq" className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-20 border-t border-white/5">
        <div className="text-center mb-12">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-white tracking-tight">
            Frequently Asked Questions
          </h2>
        </div>

        <div className="space-y-3">
          {FAQS.map((faq, idx) => {
            const isOpen = openFaq === idx;
            return (
              <div key={faq.q} className="rounded-2xl bg-white/[0.02] border border-white/[0.06] overflow-hidden">
                <button
                  type="button"
                  onClick={() => setOpenFaq(isOpen ? null : idx)}
                  className="w-full p-5 sm:p-6 flex items-center justify-between text-left bg-transparent border-none text-white text-sm sm:text-base font-bold cursor-pointer gap-4"
                >
                  <span>{faq.q}</span>
                  <ChevronDown size={18} className={`shrink-0 text-slate-500 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
                </button>
                {isOpen && (
                  <div className="px-5 sm:px-6 pb-6 text-slate-400 text-xs sm:text-sm leading-relaxed">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* ════════ CTA SECTION ════════ */}
      <section className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        <div className="p-8 sm:p-12 rounded-3xl bg-gradient-to-br from-blue-900/60 to-indigo-950/80 border border-blue-500/25 text-center relative overflow-hidden">
          <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight mb-3">
            Ready to modernize your operations?
          </h2>
          <p className="text-blue-300 text-xs sm:text-sm max-w-lg mx-auto mb-8 leading-relaxed">
            Join organizers executing automated distributions daily with total clarity.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/auth/admin/register" style={{
              display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 8, height: 46, padding: '0 26px', borderRadius: 12,
              background: 'white', color: '#1e3a8a', fontSize: 13, fontWeight: 800, textDecoration: 'none'
            }}>
              Register as Agent
              <ArrowRight size={15} />
            </Link>
            <Link href="/auth/member/login" style={{
              display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 8, height: 46, padding: '0 24px', borderRadius: 12,
              background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)', color: 'white', fontSize: 13, fontWeight: 700, textDecoration: 'none'
            }}>
              Member Login
            </Link>
          </div>
        </div>
      </section>

      {/* ════════ FOOTER ════════ */}
      <footer className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 border-t border-white/5 flex flex-col sm:flex-row justify-between items-center gap-4 text-xs text-slate-500 font-semibold">
        <div className="flex items-center gap-2">
          <ChitFlowMark size={24} />
          <span>© {new Date().getFullYear()} ChitFlow Systems. All rights reserved.</span>
        </div>
        <div className="flex gap-6">
          <a href="#" className="text-slate-500 hover:text-slate-300 transition-colors no-underline">Privacy Policy</a>
          <a href="#" className="text-slate-500 hover:text-slate-300 transition-colors no-underline">Terms of Service</a>
        </div>
      </footer>

    </div>
  );
}
