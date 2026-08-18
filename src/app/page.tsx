'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Shield,
  ArrowRight,
  Layers,
  FileText,
  ChevronDown,
  Coins,
  TrendingUp,
  Download,
  Mail,
  Phone,
  ArrowUp,
  Activity,
  Award,
  Info,
  X,
  Menu
} from 'lucide-react';

/* ── Brand Logo Mark (Solid Blue to prevent SVG rendering blur) ── */
function ChitFlowMark({ size = 30 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 44 44" fill="none" xmlns="http://www.w3.org/2000/svg" className="shrink-0">
      <rect width="44" height="44" rx="8" fill="#2563eb" />
      <path d="M 13 16 L 19 22 L 13 28" stroke="white" strokeWidth="3.2" strokeLinecap="round" strokeLinejoin="round" opacity="0.8" />
      <path d="M 21 16 L 27 22 L 21 28" stroke="white" strokeWidth="3.2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

const FAQS = [
  {
    q: 'How does ChitFlow compute monthly payouts and dividend splits?',
    a: 'ChitFlow automatically deducts the 5% organizer commission from the pool, then divides the remaining auction discount equally across all non-winning members in real-time. This guarantees mathematical precision and prevents manual miscalculations.'
  },
  {
    q: 'Can members log in to view their individual payment ledgers?',
    a: 'Yes. Members access their own dedicated portal using their mobile number. They can track monthly credits, view upcoming due dates, see historical dividends, and download official payment receipts.'
  },
  {
    q: 'Are reports available for offline record-keeping and printing?',
    a: 'Yes. You can export complete scheme summary sheets, member directories, and transaction ledgers directly into print-ready PDF files. These documents are designed to be clear and professional.'
  }
];

export default function LandingPage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  // Interactive Calculator State
  const [totalValue, setTotalValue] = useState<number>(1000000);
  const [months, setMonths] = useState<number>(20);
  const [bidDiscount, setBidDiscount] = useState<number>(25);

  // Calculate Calculator Metrics
  const organiserCommission = totalValue * 0.05;
  const winnerPayout = totalValue - (totalValue * (bidDiscount / 100));
  const totalDividendPool = Math.max(0, (totalValue * (bidDiscount / 100)) - organiserCommission);
  const dividendPerMember = totalDividendPool / months;
  const regularInstallment = totalValue / months;
  const netContribution = regularInstallment - dividendPerMember;

  const applyPreset = (val: number, dur: number, disc: number) => {
    setTotalValue(val);
    setMonths(dur);
    setBidDiscount(disc);
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-800 font-sans relative overflow-x-hidden selection:bg-blue-500/10 selection:text-blue-700">
      
      {/* ════════ HEADER (Sticky top 0 - Solid background, no blur) ════════ */}
      <nav className="sticky top-0 z-50 bg-white border-b border-slate-200">
        <div className="max-w-5xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            
            {/* Brand Logo */}
            <Link href="/" className="flex items-center gap-2.5 no-underline">
              <ChitFlowMark size={26} />
              <div>
                <p className="text-slate-900 font-bold text-sm tracking-tight leading-none">ChitFlow</p>
                <p className="text-slate-400 font-bold text-[8px] tracking-[0.14em] uppercase mt-0.5 leading-none">Smart Savings Circles</p>
              </div>
            </Link>

            {/* Nav Links */}
            <div className="hidden md:flex items-center gap-7">
              <a href="#features" className="text-xs font-bold text-slate-500 hover:text-slate-900 uppercase tracking-wider">Features</a>
              <a href="#calculator" className="text-xs font-bold text-slate-500 hover:text-slate-900 uppercase tracking-wider">Simulator</a>
              <a href="#faq" className="text-xs font-bold text-slate-500 hover:text-slate-900 uppercase tracking-wider">FAQ</a>
            </div>

            {/* Action Buttons */}
            <div className="hidden sm:flex items-center gap-3.5">
              <Link href="/auth/member/login" className="text-slate-500 hover:text-slate-800 text-xs font-bold tracking-wider uppercase">
                Member Login
              </Link>
              <Link href="/auth/admin/login" className="inline-flex items-center gap-1 h-9 px-4 rounded bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold uppercase tracking-wider">
                <Shield size={12} className="mr-1" />
                <span>Agent Login</span>
              </Link>
            </div>

            {/* Mobile Menu Icon */}
            <button 
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-1.5 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-50"
            >
              {mobileMenuOpen ? <X size={18} /> : <Menu size={18} />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="absolute top-14 left-4 right-4 bg-white border border-slate-200 rounded-xl p-5 shadow-sm flex flex-col gap-3.5 md:hidden z-50">
            <a 
              href="#features" 
              onClick={() => setMobileMenuOpen(false)}
              className="text-slate-700 hover:text-slate-900 text-xs font-bold tracking-wider uppercase py-2 border-b border-slate-100"
            >
              Features
            </a>
            <a 
              href="#calculator" 
              onClick={() => setMobileMenuOpen(false)}
              className="text-slate-700 hover:text-slate-900 text-xs font-bold tracking-wider uppercase py-2 border-b border-slate-100"
            >
              Simulator
            </a>
            <a 
              href="#faq" 
              onClick={() => setMobileMenuOpen(false)}
              className="text-slate-700 hover:text-slate-900 text-xs font-bold tracking-wider uppercase py-2 border-b border-slate-100"
            >
              FAQ
            </a>
            <div className="flex flex-col gap-2 pt-1.5">
              <Link 
                href="/auth/member/login"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full text-center py-2 rounded-lg border border-slate-200 text-slate-700 text-xs font-bold uppercase"
              >
                Member Login
              </Link>
              <Link 
                href="/auth/admin/login"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full text-center py-2 rounded-lg bg-blue-600 text-white text-xs font-bold uppercase"
              >
                Agent Login
              </Link>
            </div>
          </div>
        )}
      </nav>

      {/* ════════ HERO SECTION (Balanced spacing) ════════ */}
      <header className="relative z-10 max-w-5xl mx-auto px-4 pt-10 sm:pt-14 pb-8 sm:pb-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          
          {/* Copy and Actions Column */}
          <div className="lg:col-span-7 flex flex-col gap-5 text-left">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black leading-[1.12] tracking-tight text-slate-900">
              The new standard for collective{' '}
              <span className="text-blue-600">
                savings.
              </span>
            </h1>

            <p className="text-slate-550 text-sm sm:text-base leading-relaxed max-w-lg font-semibold">
              ChitFlow replaces outdated registers with digital records, automated auction math, instant dividend credits, and unified organizer portals.
            </p>

            <div className="flex flex-row items-center gap-3 pt-1">
              <Link href="/auth/admin/register" className="inline-flex items-center justify-center gap-1.5 h-10 px-4.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-black uppercase tracking-wider">
                <span>Start Workspace</span>
                <ArrowRight size={13} />
              </Link>
              <Link href="/auth/member/login" className="inline-flex items-center justify-center gap-2 h-10 px-4.5 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 text-xs font-black uppercase tracking-wider">
                <span>Member Portal</span>
              </Link>
            </div>

            {/* Badges */}
            <div className="grid grid-cols-3 gap-4 pt-5 border-t border-slate-200 mt-2">
              <div>
                <span className="text-base font-black text-slate-900 block">0% Error</span>
                <span className="text-[8px] font-black text-slate-400 uppercase tracking-wider mt-0.5 block">Dividend Math</span>
              </div>
              <div>
                <span className="text-base font-black text-slate-900 block">5% Flat</span>
                <span className="text-[8px] font-black text-slate-400 uppercase tracking-wider mt-0.5 block">Commission</span>
              </div>
              <div>
                <span className="text-base font-black text-slate-900 block">Instant</span>
                <span className="text-[8px] font-black text-slate-400 uppercase tracking-wider mt-0.5 block">PDF Ledgers</span>
              </div>
            </div>
          </div>

          {/* Right Column: Console Showcase Card (Solid styling) ── */}
          <div className="lg:col-span-5">
            <div className="bg-white border border-slate-200 rounded-xl p-5 relative overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-[3px] bg-blue-600" />

              <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-3">
                <div className="flex items-center gap-2">
                  <ChitFlowMark size={22} />
                  <div>
                    <p className="text-slate-900 font-extrabold text-xs leading-none">Circle Workspace</p>
                    <p className="text-blue-600 font-bold text-[7px] tracking-wider uppercase mt-1 leading-none">Live Audit Feed</p>
                  </div>
                </div>
                <span className="text-[8px] font-black text-emerald-700 bg-emerald-50 border border-emerald-100 px-2 py-0.5 rounded uppercase leading-none">
                  Active
                </span>
              </div>

              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-2.5">
                  <div className="p-3 rounded-lg bg-slate-50 border border-slate-200/60">
                    <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest mb-1 flex items-center gap-0.5">
                      <Activity size={9} /> Total Pool
                    </p>
                    <p className="text-base font-black text-slate-900">₹10,00,000</p>
                  </div>
                  <div className="p-3 rounded-lg bg-blue-50/50 border border-blue-100">
                    <p className="text-[8px] font-bold text-blue-600 uppercase tracking-widest mb-1 flex items-center gap-0.5">
                      <Award size={9} /> Winner Payout
                    </p>
                    <p className="text-base font-black text-blue-600">₹9,50,000</p>
                  </div>
                </div>

                <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200/60 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 font-extrabold text-[10px]">
                      RK
                    </div>
                    <div>
                      <p className="text-[11px] font-extrabold text-slate-800 leading-none">Rajesh Kumar</p>
                      <p className="text-[7px] text-slate-400 mt-1 leading-none">Month 1 • Gold Scheme</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-[11px] font-black text-emerald-600 leading-none">₹4,85,000</span>
                    <p className="text-[7px] text-slate-400 mt-1 leading-none">Disbursed</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

        </div>
      </header>

      {/* ════════ CORE FEATURES GRID ════════ */}
      <section id="features" className="max-w-5xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          
          <div className="bg-white border border-slate-200 p-5 rounded-xl">
            <div className="w-8 h-8 rounded bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 mb-3">
              <Layers size={16} />
            </div>
            <h3 className="text-slate-900 text-xs font-black uppercase tracking-wider mb-2">Automated Ledgers</h3>
            <p className="text-slate-550 text-xs sm:text-sm leading-relaxed font-semibold">
              ChitFlow computes member payments, commission cuts, and monthly dividend splits automatically with zero calculation error.
            </p>
          </div>

          <div className="bg-white border border-slate-200 p-5 rounded-xl">
            <div className="w-8 h-8 rounded bg-purple-50 border border-purple-100 flex items-center justify-center text-purple-600 mb-3">
              <Shield size={16} />
            </div>
            <h3 className="text-slate-900 text-xs font-black uppercase tracking-wider mb-2">Audited Trail</h3>
            <p className="text-slate-555 text-xs sm:text-sm leading-relaxed font-semibold">
              Track historical logs easily. Every bid declaration and dividend dispatch is logged permanently in your server.
            </p>
          </div>

          <div className="bg-white border border-slate-200 p-5 rounded-xl">
            <div className="w-8 h-8 rounded bg-cyan-50 border border-cyan-100 flex items-center justify-center text-cyan-600 mb-3">
              <FileText size={16} />
            </div>
            <h3 className="text-slate-900 text-xs font-black uppercase tracking-wider mb-2">PDF Receipts</h3>
            <p className="text-slate-555 text-xs sm:text-sm leading-relaxed font-semibold">
              Download clean offline summary reports and transaction receipts ready to be printed or shared.
            </p>
          </div>

        </div>
      </section>

      {/* ════════ INTERACTIVE SAVINGS SIMULATOR ════════ */}
      <section id="calculator" className="max-w-5xl mx-auto px-4 py-8">
        <div className="text-center mb-6">
          <span className="text-[8px] font-black tracking-wider uppercase text-blue-700 bg-blue-50 border border-blue-100 px-2 py-0.5 rounded">Simulator</span>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight mt-2">
            Smart Savings Simulator
          </h2>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
          
          {/* Controls */}
          <div className="lg:col-span-7 p-5 rounded-xl bg-white border border-slate-200 flex flex-col justify-between gap-5">
            
            {/* Presets */}
            <div>
              <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest block mb-2">Preset Models</span>
              <div className="grid grid-cols-3 gap-2.5">
                <button 
                  onClick={() => applyPreset(500000, 20, 20)}
                  className={`py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider border ${
                    totalValue === 500000 && months === 20 && bidDiscount === 20
                      ? 'bg-blue-50 border-blue-500 text-blue-600 font-bold'
                      : 'bg-slate-50 border-slate-200 text-slate-500 hover:bg-slate-100'
                  }`}
                >
                  Silver
                </button>
                <button 
                  onClick={() => applyPreset(1000000, 20, 25)}
                  className={`py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider border ${
                    totalValue === 1000000 && months === 20 && bidDiscount === 25
                      ? 'bg-blue-50 border-blue-500 text-blue-600 font-bold'
                      : 'bg-slate-50 border-slate-200 text-slate-500 hover:bg-slate-100'
                  }`}
                >
                  Gold
                </button>
                <button 
                  onClick={() => applyPreset(2000000, 40, 30)}
                  className={`py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider border ${
                    totalValue === 2000000 && months === 40 && bidDiscount === 30
                      ? 'bg-blue-50 border-blue-500 text-blue-600 font-bold'
                      : 'bg-slate-50 border-slate-200 text-slate-500 hover:bg-slate-100'
                  }`}
                >
                  Diamond
                </button>
              </div>
            </div>

            {/* Pool Value slider */}
            <div className="space-y-1.5">
              <div className="flex justify-between items-center">
                <label className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Total Pool value</label>
                <span className="text-xs font-black text-slate-900 bg-slate-50 py-0.5 px-2 rounded border border-slate-200">
                  ₹{totalValue.toLocaleString('en-IN')}
                </span>
              </div>
              <input 
                type="range" 
                min={100000} 
                max={5000000} 
                step={50000}
                value={totalValue}
                onChange={(e) => setTotalValue(Number(e.target.value))}
                className="w-full accent-blue-600 h-1 bg-slate-100 rounded cursor-pointer"
              />
            </div>

            {/* Duration slider */}
            <div className="space-y-1.5">
              <div className="flex justify-between items-center">
                <label className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Duration (Months)</label>
                <span className="text-xs font-black text-slate-900 bg-slate-50 py-0.5 px-2 rounded border border-slate-200">
                  {months} Months
                </span>
              </div>
              <input 
                type="range" 
                min={10} 
                max={50} 
                step={5}
                value={months}
                onChange={(e) => setMonths(Number(e.target.value))}
                className="w-full accent-blue-600 h-1 bg-slate-100 rounded cursor-pointer"
              />
            </div>

            {/* Bid Discount slider */}
            <div className="space-y-1.5">
              <div className="flex justify-between items-center">
                <label className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Simulated Bid Discount</label>
                <span className="text-xs font-black text-slate-900 bg-slate-50 py-0.5 px-2 rounded border border-slate-200">
                  {bidDiscount}%
                </span>
              </div>
              <input 
                type="range" 
                min={5} 
                max={40} 
                step={1}
                value={bidDiscount}
                onChange={(e) => setBidDiscount(Number(e.target.value))}
                className="w-full accent-blue-600 h-1 bg-slate-100 rounded cursor-pointer"
              />
            </div>

          </div>

          {/* Ledger Details */}
          <div className="lg:col-span-5">
            <div className="p-5 rounded-xl bg-white border border-slate-200 flex flex-col justify-between h-full">
              <div className="space-y-3.5">
                <div className="flex justify-between items-center pb-2.5 border-b border-slate-100">
                  <span className="text-xs font-black text-blue-600 tracking-wider uppercase">Ledger Receipt</span>
                  <span className="text-[8px] font-black text-slate-400 uppercase">v2</span>
                </div>

                <div className="space-y-3">
                  <div>
                    <div className="flex justify-between text-xs font-semibold mb-0.5">
                      <span className="text-slate-550">Regular Installment</span>
                      <span className="text-slate-900 font-bold">₹{regularInstallment.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</span>
                    </div>
                    <div className="w-full bg-slate-100 h-1 rounded-full overflow-hidden">
                      <div className="bg-slate-400 h-full" style={{ width: '100%' }} />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-xs font-semibold mb-0.5">
                      <span className="text-slate-550">Net Monthly Pay</span>
                      <span className="text-emerald-600 font-bold">₹{netContribution.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</span>
                    </div>
                    <div className="w-full bg-slate-100 h-1 rounded-full overflow-hidden">
                      <div className="bg-emerald-500 h-full" style={{ width: `${(netContribution / regularInstallment) * 100}%` }} />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-xs font-semibold mb-0.5">
                      <span className="text-slate-550">Dividend Savings</span>
                      <span className="text-blue-600 font-bold">₹{dividendPerMember.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</span>
                    </div>
                    <div className="w-full bg-slate-100 h-1 rounded-full overflow-hidden">
                      <div className="bg-blue-600 h-full" style={{ width: `${(dividendPerMember / regularInstallment) * 100}%` }} />
                    </div>
                  </div>
                </div>

                <div className="border-t border-slate-100 pt-3 space-y-2">
                  <div className="flex justify-between text-xs font-semibold">
                    <span className="text-slate-550">Winner Claimable:</span>
                    <span className="text-indigo-650 font-black">₹{winnerPayout.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="flex justify-between text-xs font-semibold">
                    <span className="text-slate-550">Commission (5%):</span>
                    <span className="text-slate-800">₹{organiserCommission.toLocaleString('en-IN')}</span>
                  </div>
                </div>
              </div>

              <div className="pt-4">
                <Link href="/auth/admin/register" className="w-full inline-flex items-center justify-center gap-1.5 h-10 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-black uppercase tracking-wider">
                  <span>Open Workspace</span>
                  <ArrowRight size={13} />
                </Link>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* ════════ FAQ SECTION ════════ */}
      <section id="faq" className="max-w-2xl mx-auto px-4 py-8">
        <div className="text-center mb-6">
          <span className="text-[8px] font-black tracking-wider uppercase text-teal-700 bg-teal-50 border border-teal-100 px-2 py-0.5 rounded">FAQ</span>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight mt-2">
            Frequently Asked Questions
          </h2>
        </div>

        <div className="space-y-3.5 max-w-xl mx-auto">
          {FAQS.map((faq, idx) => {
            const isOpen = openFaq === idx;
            return (
              <div 
                key={faq.q} 
                className={`rounded-xl border bg-white ${
                  isOpen 
                    ? 'border-blue-500' 
                    : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                <button
                  type="button"
                  onClick={() => setOpenFaq(isOpen ? null : idx)}
                  className="w-full p-4 flex items-center justify-between text-left bg-transparent border-none text-slate-800 text-xs sm:text-sm font-bold cursor-pointer gap-4"
                >
                  <span className={isOpen ? 'text-blue-600' : ''}>{faq.q}</span>
                  <ChevronDown size={14} className={`shrink-0 text-slate-400 ${isOpen ? 'rotate-180 text-blue-600' : ''}`} />
                </button>
                
                {isOpen && (
                  <div className="px-4 pb-4 text-slate-555 text-xs sm:text-sm leading-relaxed border-t border-slate-100 pt-3 font-semibold">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* ════════ FOOTER ════════ */}
      <footer className="relative z-10 bg-white mt-6">
        <div className="max-w-5xl mx-auto px-4 py-8">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 pb-8 border-b border-slate-200">
            
            <div className="md:col-span-6 space-y-3.5">
              <div className="flex items-center gap-2.5">
                <ChitFlowMark size={24} />
                <span className="text-slate-900 font-bold text-sm tracking-tight">ChitFlow</span>
              </div>
              <p className="text-slate-550 text-xs sm:text-sm leading-relaxed max-w-sm font-medium">
                The modern, automated platform for managing chit fund groups securely. Simplify monthly bidding, calculate dividends, and export audited financial records.
              </p>
              
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-emerald-50 border border-emerald-100 text-emerald-700 text-[8px] font-black uppercase tracking-wider">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <span>All systems operational</span>
              </div>
            </div>

            <div className="md:col-span-3 space-y-2.5">
              <h4 className="text-slate-900 font-extrabold text-[9px] uppercase tracking-wider">Resources</h4>
              <ul className="space-y-2 text-[11px] text-slate-555 font-semibold list-none p-0 m-0">
                <li><Link href="/auth/admin/login" className="hover:text-blue-650">Agent Console</Link></li>
                <li><Link href="/auth/member/login" className="hover:text-blue-650">Member Portal</Link></li>
                <li><Link href="/auth/admin/register" className="hover:text-blue-650">Create Account</Link></li>
              </ul>
            </div>

            <div className="md:col-span-3 space-y-2.5">
              <h4 className="text-slate-900 font-extrabold text-[9px] uppercase tracking-wider">Support</h4>
              <ul className="space-y-2 text-[11px] text-slate-555 font-semibold list-none p-0 m-0">
                <li className="flex items-center gap-1.5">
                  <Mail size={11} className="text-slate-400" />
                  <span>support@chitflow.com</span>
                </li>
                <li className="flex items-center gap-1.5">
                  <Phone size={11} className="text-slate-400" />
                  <span>+91 98765 43210</span>
                </li>
              </ul>
            </div>

          </div>

          <div className="pt-5 flex flex-col sm:flex-row justify-between items-center gap-3 text-[9px] text-slate-400 font-bold uppercase tracking-widest">
            <span>© {new Date().getFullYear()} ChitFlow Systems. Secure circles.</span>
            
            <div className="flex items-center gap-3">
              <a href="#" className="hover:text-slate-600 transition-colors">Privacy Policy</a>
              <a href="#" className="hover:text-slate-600 transition-colors">Terms of Service</a>
              <button 
                onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                className="h-8 px-2.5 rounded bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-505 flex items-center gap-1.5 cursor-pointer"
              >
                <ArrowUp size={11} /> Top
              </button>
            </div>
          </div>
        </div>
      </footer>

    </div>
  );
}
