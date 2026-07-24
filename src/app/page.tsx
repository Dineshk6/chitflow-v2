'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Shield,
  ArrowRight,
  Layers,
  Users,
  Wallet
} from 'lucide-react';

const PRESETS = [
  {
    name: 'Silver Group',
    value: 500000,
    duration: 20,
    monthly: 25000,
    lifted: 30000,
    type: 'Return Pay'
  },
  {
    name: 'Gold Group',
    value: 1000000,
    duration: 20,
    monthly: 50000,
    lifted: 60000,
    type: 'Return Pay'
  },
  {
    name: 'Diamond Group',
    value: 2000000,
    duration: 40,
    monthly: 40500,
    lifted: 48600,
    type: 'Fixed Pay'
  }
];

export default function LandingPage() {
  const [activePreset, setActivePreset] = useState(1);
  const selected = PRESETS[activePreset];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans antialiased selection:bg-blue-600/10 selection:text-blue-700 relative overflow-x-hidden">
      
      {/* Subtle top decoration */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[450px] bg-gradient-to-b from-blue-50 to-transparent pointer-events-none z-0" />

      {/* Sticky Header */}
      <nav className="fixed top-0 left-0 right-0 z-50 w-full border-b border-slate-200 bg-white/95 backdrop-blur-md shadow-sm">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3.5 group">
            <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white font-black text-sm shadow-md transition-transform group-hover:scale-105">
              CF
            </div>
            <span className="font-black text-xl tracking-tight text-slate-900">
              Chit<span className="text-blue-600">Flow</span>
            </span>
          </Link>

          <div className="hidden md:flex items-center gap-8">
            <a href="#features" className="text-xs font-bold text-slate-700 hover:text-blue-600 transition-colors">Features</a>
            <a href="#calculator" className="text-xs font-bold text-slate-700 hover:text-blue-600 transition-colors">Calculator</a>
            <a href="#workflow" className="text-xs font-bold text-slate-700 hover:text-blue-600 transition-colors">Workflow</a>
          </div>

          <div className="flex items-center gap-3">
            <Link href="/auth/member/login" className="hidden sm:block text-xs font-bold text-slate-700 hover:text-blue-650 transition-colors px-2 py-1">
              Member Login
            </Link>
            <Link 
              href="/auth/admin/login" 
              className="inline-flex items-center justify-center gap-1.5 h-10 px-4 sm:px-5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold transition-all duration-200 active:scale-95 text-xs shadow-sm"
            >
              <Shield size={13} />
              Agent Portal
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section (With top spacer padding for the fixed header) */}
      <header className="relative z-10 max-w-7xl mx-auto px-6 pb-20 md:pb-32" style={{ paddingTop: '140px' }}>
        <div className="grid lg:grid-cols-12 gap-12 items-center">
          
          {/* Left Text content */}
          <div className="lg:col-span-6 flex flex-col text-center lg:text-left items-center lg:items-start space-y-6">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-50 border border-blue-200 shadow-sm">
              <span className="text-[10px] font-bold text-blue-800 uppercase tracking-widest">
                Digital Chit Fund Management
              </span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-slate-900 leading-[1.08] tracking-tight">
              Manage chit funds with{' '}
              <span className="text-blue-600">
                absolute clarity.
              </span>
            </h1>

            <p className="text-slate-750 text-sm sm:text-base leading-relaxed max-w-xl font-medium">
              ChitFlow replaces unorganized manual ledgers with structured database records, automated payment schedules, and professional PDF reports.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto pt-4">
              <Link 
                href="/auth/admin/register" 
                className="inline-flex items-center justify-center gap-2 h-12 px-6 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs shadow-md shadow-blue-500/10 transition-all duration-200 active:scale-95"
              >
                Register as Agent
                <ArrowRight size={14} />
              </Link>
              <Link 
                href="/auth/member/login" 
                className="inline-flex items-center justify-center h-12 px-6 rounded-xl bg-white hover:bg-slate-50 text-slate-800 font-semibold border border-slate-300 shadow-sm transition-all duration-200 active:scale-95 text-xs"
              >
                Member Portal
              </Link>
            </div>
          </div>

          {/* Right Visual Console Mockup */}
          <div className="lg:col-span-6 relative w-full max-w-md lg:max-w-none mx-auto">
            <div className="absolute -inset-4 bg-gradient-to-tr from-blue-500 to-indigo-500 rounded-[2.5rem] opacity-5 blur-xl -z-10" />
            
            <div className="relative bg-white rounded-3xl p-6 md:p-8 shadow-xl border border-slate-200">
              {/* Window Bar */}
              <div className="flex items-center justify-between pb-4 border-b border-slate-200 mb-6">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-blue-600 flex items-center justify-center text-white font-black text-xs">CF</div>
                  <div>
                    <p className="text-xs font-bold text-slate-900 leading-none">Console Preview</p>
                    <p className="text-[8px] text-slate-550 font-black uppercase tracking-wider mt-1">SaaS Interface</p>
                  </div>
                </div>
                <span className="text-[9px] font-black text-emerald-700 bg-emerald-50 border border-emerald-250 px-2 py-0.5 rounded-full uppercase">Active</span>
              </div>

              {/* Grid cards inside mockup */}
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                  <p className="text-[9px] font-black text-slate-555 uppercase tracking-widest mb-1">Total Pool</p>
                  <p className="text-xl font-black text-slate-900">₹10,00,000</p>
                </div>
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                  <p className="text-[9px] font-black text-slate-555 uppercase tracking-widest mb-1">Winner Pay</p>
                  <p className="text-xl font-black text-blue-600">₹9,50,000</p>
                </div>
              </div>

              {/* Row logs */}
              <div className="space-y-3">
                <p className="text-[9px] font-black text-slate-555 uppercase tracking-widest">Bidding Sequence</p>
                
                <div className="flex items-center justify-between p-3.5 rounded-xl bg-white border border-slate-200">
                  <div className="flex items-center gap-3">
                    <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-xs">RK</div>
                    <div>
                      <p className="text-xs font-bold text-slate-900">Rajesh Kumar</p>
                      <p className="text-[9px] text-slate-550 font-bold">Month 1 • Gold Scheme</p>
                    </div>
                  </div>
                  <span className="text-xs font-black text-emerald-700">₹4,85,000</span>
                </div>
              </div>
            </div>
          </div>

        </div>
      </header>

      {/* Comparison Section (Old vs New) */}
      <section className="relative z-10 max-w-7xl mx-auto px-6 py-20 border-t border-slate-200">
        <div className="text-center mb-16">
          <h2 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight">The Modern Standard</h2>
          <p className="text-slate-655 text-xs sm:text-sm font-bold mt-2">Why organizers are moving from physical sheets to ChitFlow.</p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {/* Traditional */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm relative overflow-hidden">
            <div className="flex items-center gap-3 mb-4">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
              <h3 className="text-base font-bold text-slate-900">Traditional Ledgers</h3>
            </div>
            <ul className="space-y-3.5 text-xs text-slate-750 font-semibold">
              <li className="flex items-start gap-2.5">
                <span className="text-rose-600 font-black">✕</span>
                <span>Manual calculation errors on monthly payouts.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="text-rose-600 font-black">✕</span>
                <span>No digital records for members to access.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="text-rose-600 font-black">✕</span>
                <span>High risks of calculation discrepancies and disputes.</span>
              </li>
            </ul>
          </div>

          {/* ChitFlow */}
          <div className="bg-blue-50/50 p-6 rounded-3xl border border-blue-200 shadow-sm relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/10 rounded-full blur-xl" />
            <div className="flex items-center gap-3 mb-4">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-600 animate-pulse" />
              <h3 className="text-base font-bold text-slate-900">ChitFlow Digital</h3>
            </div>
            <ul className="space-y-3.5 text-xs text-slate-800 font-bold">
              <li className="flex items-start gap-2.5">
                <span className="text-blue-600 font-black">✓</span>
                <span>Instant automated calculations for contributions & bids.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="text-blue-600 font-black">✓</span>
                <span>One-click PDF reporting sheets ready for print.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="text-blue-600 font-black">✓</span>
                <span>Secure separate portals for organizers and members.</span>
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* Simulator Section */}
      <section id="calculator" className="relative z-10 max-w-7xl mx-auto px-6 py-20 border-t border-slate-200 bg-slate-50">
        <div className="text-center mb-16">
          <h2 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight">Scheme Schedule Calculator</h2>
          <p className="text-slate-655 text-xs sm:text-sm font-bold mt-2">Adjust values or select presets to view schedule estimates instantly.</p>
        </div>

        <div className="grid lg:grid-cols-12 gap-8 items-stretch max-w-5xl mx-auto">
          {/* Controls */}
          <div className="lg:col-span-6 bg-white rounded-3xl p-6 border border-slate-200 flex flex-col justify-between space-y-6">
            
            {/* Presets */}
            <div className="space-y-2.5">
              <label className="text-[9px] font-bold text-slate-600 uppercase tracking-widest">Select Preset Group</label>
              <div className="grid grid-cols-3 gap-2 bg-slate-100 p-1.5 rounded-xl border border-slate-200/60">
                {PRESETS.map((p, idx) => (
                  <button
                    key={p.name}
                    type="button"
                    onClick={() => setActivePreset(idx)}
                    className={`h-11 rounded-lg text-xs font-semibold transition-all duration-200 active:scale-95 ${
                      activePreset === idx ? 'bg-blue-600 text-white shadow-sm border border-slate-200' : 'text-slate-600 hover:text-slate-900 hover:bg-white'
                    }`}
                  >
                    {p.name.split(' ')[0]}
                  </button>
                ))}
              </div>
            </div>

            {/* Value Display */}
            <div className="space-y-2">
              <label className="text-[9px] font-bold text-slate-650 uppercase tracking-widest block">Chit Value</label>
              <p className="text-2xl font-black text-slate-900">₹{selected.value.toLocaleString('en-IN')}</p>
            </div>

            {/* Metrics Display */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                <p className="text-[9px] font-black text-slate-550 uppercase tracking-widest mb-1">Regular Pay</p>
                <p className="text-lg font-black text-slate-900">₹{selected.monthly.toLocaleString('en-IN')}</p>
              </div>
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                <p className="text-[9px] font-black text-emerald-700 uppercase tracking-widest mb-1">Lifted Pay</p>
                <p className="text-lg font-black text-emerald-750" style={{ color: '#047857' }}>₹{selected.lifted.toLocaleString('en-IN')}</p>
              </div>
            </div>

            <div className="space-y-3 pt-2 text-xs font-bold text-slate-650">
              <div className="flex justify-between items-center">
                <span>Duration Limit:</span>
                <span className="font-bold text-slate-900">{selected.duration} Months</span>
              </div>
              <div className="flex justify-between items-center">
                <span>Calculation Model:</span>
                <span className="font-bold text-slate-900">{selected.type}</span>
              </div>
            </div>
          </div>

          {/* Details card */}
          <div className="lg:col-span-6 bg-slate-900 rounded-3xl p-6 sm:p-8 text-white flex flex-col justify-between relative overflow-hidden">
            <div className="space-y-6">
              <span className="text-[9px] font-black text-blue-400 uppercase tracking-widest block">Estimated Schedule Metrics</span>
              
              <div className="space-y-3 pt-2 text-xs font-bold text-slate-300">
                <div className="flex justify-between items-center">
                  <span>Organiser Commission (5%):</span>
                  <span className="font-bold text-white">₹{(selected.value * 0.05).toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span>Estimated Winner Prize:</span>
                  <span className="font-bold text-emerald-400">₹{(selected.value * 0.95).toLocaleString('en-IN')}</span>
                </div>
              </div>
            </div>

            <div className="pt-6 border-t border-slate-800">
              <Link
                href="/auth/admin/register"
                className="w-full inline-flex items-center justify-center h-12 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs shadow-md transition-all duration-200 active:scale-95"
              >
                Create Group with this Schedule
                <ArrowRight size={13} />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Workflow Roadmap */}
      <section id="workflow" className="relative z-10 max-w-7xl mx-auto px-6 py-20 border-t border-slate-200">
        <div className="text-center mb-16">
          <h2 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight">The Chit Cycle Workflow</h2>
          <p className="text-slate-655 text-xs sm:text-sm font-bold mt-2">How scheme payments circulate transparently every month.</p>
        </div>

        <div className="grid md:grid-cols-4 gap-6 max-w-5xl mx-auto">
          {[
            { step: '01', title: 'Start Cycle', desc: 'Members pay their monthly contribution to the organizer pool.' },
            { step: '02', title: 'Open Auction', desc: 'Members bid discounts to claim the pool prize value.' },
            { step: '03', title: 'Payout Lift', desc: 'Highest bidder lifts the pool value minus discount & commission.' },
            { step: '04', title: 'Disburse Dividends', desc: 'The discount value is divided equally among other members.' }
          ].map((item, i) => (
            <div key={item.step} className="bg-white p-6 rounded-2xl border border-slate-200 flex flex-col justify-between hover:shadow-md transition-all duration-300">
              <div className="text-2xl font-black text-blue-600/30 mb-3">{item.step}</div>
              <div>
                <h4 className="text-sm font-bold text-slate-955 mb-1.5">{item.title}</h4>
                <p className="text-slate-700 text-[11px] font-bold leading-relaxed">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="relative z-10 max-w-7xl mx-auto px-6 py-20 border-t border-slate-200">
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
          
          {/* Feature 1 */}
          <div className="p-6 bg-white rounded-2xl border border-slate-200 flex flex-col justify-between hover:shadow-lg transition-all duration-300">
            <div>
              <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center mb-5">
                <Layers size={18} />
              </div>
              <h3 className="text-base font-bold text-slate-955 mb-2">Automated Calculations</h3>
              <p className="text-slate-700 text-xs leading-relaxed font-bold">
                Eliminate errors. ChitFlow dynamically handles regular contributions, auction margins, organizer commissions, and dividend payouts instantly.
              </p>
            </div>
          </div>

          {/* Feature 2 */}
          <div className="p-6 bg-white rounded-2xl border border-slate-200 flex flex-col justify-between hover:shadow-lg transition-all duration-300">
            <div>
              <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-5">
                <Users size={18} />
              </div>
              <h3 className="text-base font-bold text-slate-955 mb-2">Member Profiles</h3>
              <p className="text-slate-700 text-xs leading-relaxed font-bold">
                Easily monitor and review historical records, payments statuses, pending invoices, and verified statuses inside clean profile directories.
              </p>
            </div>
          </div>

          {/* Feature 3 */}
          <div className="p-6 bg-white rounded-2xl border border-slate-200 flex flex-col justify-between hover:shadow-lg transition-all duration-300">
            <div>
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-5">
                <Wallet size={18} />
              </div>
              <h3 className="text-base font-bold text-slate-955 mb-2">Live Reporting &amp; Exports</h3>
              <p className="text-slate-700 text-xs leading-relaxed font-bold">
                Generate professional PDF reports including scheme calendars, lifted pay summaries, outstanding dues, and audit histories directly on demand.
              </p>
            </div>
          </div>

        </div>
      </section>

      {/* CTA Card */}
      <section className="relative z-10 max-w-4xl mx-auto px-6 pb-24">
        <div className="rounded-[2.5rem] bg-gradient-to-tr from-blue-600 via-blue-500 to-indigo-600 p-8 md:p-12 text-center text-white relative overflow-hidden shadow-xl shadow-blue-500/10">
          <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-white/10 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/3 pointer-events-none" />
          
          <h2 className="text-2xl md:text-3xl font-black mb-3 relative z-10 tracking-tight">Ready to modernize your operations?</h2>
          <p className="text-blue-100 text-xs sm:text-sm mb-8 max-w-md mx-auto relative z-10 leading-relaxed font-medium">
            Join the digital standard of chit fund organizers executing automated distributions daily.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-5 justify-center relative z-10">
            <Link
              href="/auth/admin/register"
              className="inline-flex items-center justify-center h-12 px-6 rounded-xl bg-white hover:bg-blue-50 text-blue-600 font-bold text-xs transition-all duration-200 active:scale-95 shadow-md"
            >
              Register as Agent
              <ArrowRight size={14} className="ml-1.5" />
            </Link>
            <Link
              href="/auth/member/login"
              className="inline-flex items-center justify-center h-12 px-6 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold border border-white/20 transition-all duration-200 active:scale-95 text-xs"
            >
              Member Login
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 max-w-7xl mx-auto px-6 py-8 border-t border-slate-200 flex flex-col sm:flex-row justify-between items-center gap-4 bg-white/30">
        <span className="text-xs font-black text-slate-550">© {new Date().getFullYear()} ChitFlow. All rights reserved.</span>
        <div className="flex gap-4 text-xs font-bold text-slate-555">
          <a href="#" className="hover:text-slate-700">Privacy Policy</a>
          <a href="#" className="hover:text-slate-700">Terms of Service</a>
        </div>
      </footer>

    </div>
  );
}
