'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import {
  CheckCircle2,
  Clock,
  Trophy,
  Layers,
  LogOut,
  Phone,
  ChevronDown,
  Loader2,
  User,
  Send,
  MessageCircle,
  Inbox,
  X,
  Search,
  Wallet,
  ShieldCheck
} from 'lucide-react';
import { formatCurrency, cn, formatTimeAgo } from '@/lib/utils';
import { toast } from 'sonner';
import { clearAllAuthSessions } from '@/lib/auth-client';
import { MemberDashboardSkeleton } from '@/components/ui/Skeleton';

function ChitFlowMark({ size = 32 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 44 44" fill="none" xmlns="http://www.w3.org/2000/svg" className="shrink-0">
      <defs>
        <linearGradient id="dbMarkGrad" x1="0" y1="0" x2="44" y2="44" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#2563eb" />
          <stop offset="100%" stopColor="#4f46e5" />
        </linearGradient>
      </defs>
      <rect width="44" height="44" rx="10" fill="url(#dbMarkGrad)" />
      <path d="M 13 16 L 20 22 L 13 28" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" opacity="0.8" />
      <path d="M 21 16 L 28 22 L 21 28" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function getPaidCount(gd: { paidCount?: number; payments?: { status: string; month: number }[] }) {
  if (typeof gd.paidCount === 'number') return gd.paidCount;
  return new Set((gd.payments ?? []).filter((p) => p.status === 'PAID').map((p) => p.month)).size;
}

export default function MemberDashboard() {
  const router = useRouter();
  const [session, setSession] = useState<{ name: string; phone: string; memberId: string } | null>(null);
  const [groupData, setGroupData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [expandedGroup, setExpandedGroup] = useState<string | null>(null);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [messageTab, setMessageTab] = useState<'inbox' | 'send'>('inbox');
  const [memberMessage, setMemberMessage] = useState('');
  const [messageGroupId, setMessageGroupId] = useState('');
  const [isSendingMessage, setIsSendingMessage] = useState(false);
  const [filterStatus, setFilterStatus] = useState<'ALL' | 'ACTIVE' | 'WON'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const stored = localStorage.getItem('memberSession');
    if (!stored) {
      router.replace('/auth/member/login');
      return;
    }
    const parsed = JSON.parse(stored);
    setSession(parsed);
    fetchDashboard(parsed.memberId);
    fetchNotifications(parsed.memberId);
  }, [router]);

  const fetchNotifications = async (memberId: string) => {
    try {
      const res = await fetch(`/api/member/notifications?memberId=${memberId}`);
      if (res.ok) {
        const data = await res.json();
        setNotifications(Array.isArray(data) ? data : []);
      }
    } catch {
      // non-blocking
    }
  };

  const markNotifRead = async (id: string) => {
    const memberId = session?.memberId;
    if (!memberId) return;
    try {
      await fetch('/api/member/notifications', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ memberId, id }),
      });
      setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
    } catch {
      // ignore
    }
  };

  const sendMessageToAgent = async () => {
    const memberId = session?.memberId;
    if (!memberId || !memberMessage.trim()) {
      toast.error('Type a message first');
      return;
    }
    setIsSendingMessage(true);
    try {
      const res = await fetch('/api/member/notifications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          memberId,
          message: memberMessage.trim(),
          ...(messageGroupId ? { groupId: messageGroupId } : {}),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed');
      toast.success('Message sent successfully!');
      setMemberMessage('');
      setIsNotifOpen(false);
    } catch (err: any) {
      toast.error(err.message || 'Could not send message');
    } finally {
      setIsSendingMessage(false);
    }
  };

  const fetchDashboard = async (memberId: string) => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/member/dashboard?memberId=${memberId}`);
      if (!res.ok) throw new Error('Failed');
      const data = await res.json();
      setGroupData(data);
      if (data.length > 0) setExpandedGroup(data[0].group.id);
    } catch {
      toast.error('Failed to load dashboard data.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    await clearAllAuthSessions();
    localStorage.removeItem('memberSession');
    router.push('/auth/member/login');
  };

  const totalPaid = groupData.reduce((s, g) => s + (g.totalPaid || 0), 0);
  const totalWins = groupData.reduce((s, g) => s + (g.myWins?.length || 0), 0);

  const filteredGroups = groupData.filter(g => {
    const matchesSearch = g.group?.name?.toLowerCase().includes(searchQuery.toLowerCase());
    if (!matchesSearch) return false;

    if (filterStatus === 'WON') return (g.myWins?.length || 0) > 0;
    if (filterStatus === 'ACTIVE') {
      const paid = getPaidCount(g);
      return paid < (g.group?.duration || 0);
    }
    return true;
  });

  const unreadNotifCount = notifications.filter((n) => !n.read).length;

  if (isLoading) {
    return <MemberDashboardSkeleton />;
  }

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-800 font-sans antialiased pb-24">
      
      {/* ════════ HEADER ════════ */}
      <header className="sticky top-0 z-40 bg-white border-b border-slate-200">
        <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between gap-4">
          
          <div className="flex items-center gap-3">
            <ChitFlowMark size={32} />
            <div>
              <span className="font-bold text-sm tracking-tight text-slate-900 block leading-none">ChitFlow</span>
              <span className="text-[9px] font-bold text-slate-400 uppercase block mt-1 tracking-wider">Member Area</span>
            </div>
          </div>

          {/* Clean Search Input */}
          <div className="hidden sm:flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 w-64 focus-within:bg-white focus-within:ring-2 focus-within:ring-blue-500/10 transition-all">
            <Search size={14} className="text-slate-400" />
            <input
              type="text"
              placeholder="Search holding name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-transparent text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none w-full font-medium"
            />
            {searchQuery && (
              <button type="button" onClick={() => setSearchQuery('')} className="text-slate-400 hover:text-slate-600">
                <X size={12} />
              </button>
            )}
          </div>

          {/* Actions */}
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handleLogout}
              className="h-9 px-3.5 rounded-lg bg-slate-50 hover:bg-rose-50 hover:text-rose-600 border border-slate-200 text-slate-600 font-bold text-xs flex items-center gap-1.5 transition-all"
            >
              <LogOut size={14} />
              <span>Log out</span>
            </button>
          </div>

        </div>
      </header>

      {/* ════════ MAIN CONTENT ════════ */}
      <main className="max-w-5xl mx-auto px-4 pt-8 space-y-6">
        
        {/* Profile Card & Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-stretch">
          
          {/* Welcome User info */}
          <div className="md:col-span-5 bg-white border border-slate-200 rounded-2xl p-5 flex flex-col justify-between shadow-sm">
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 shrink-0">
                <User size={22} />
              </div>
              <div className="min-w-0">
                <span className="text-[9px] font-extrabold uppercase tracking-widest text-blue-600">Verified Member</span>
                <h2 className="text-lg font-black text-slate-900 tracking-tight leading-tight truncate mt-0.5">
                  {session?.name}
                </h2>
                <p className="text-xs text-slate-500 font-medium mt-1 flex items-center gap-1">
                  <Phone size={11} className="text-slate-400" />
                  <span>{session?.phone}</span>
                </p>
              </div>
            </div>
            
            <div className="mt-5 pt-3.5 border-t border-slate-100 flex justify-between items-center text-[10px] text-slate-400 font-bold uppercase tracking-wider">
              <span>Secure Session</span>
              <span className="text-emerald-600 flex items-center gap-1.5 font-bold">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" /> Sync Online
              </span>
            </div>
          </div>

          {/* Quick Portfolio Stats Grid (Horizontal snap carousel on mobile, 3-column grid on desktop) */}
          <div 
            className="md:col-span-7 flex overflow-x-auto snap-x snap-mandatory gap-4 pb-3 sm:grid sm:grid-cols-3 sm:overflow-visible sm:pb-0 no-scrollbar"
          >
            {/* Inline CSS to hide scrollbar */}
            <style dangerouslySetInnerHTML={{ __html: `
              .no-scrollbar::-webkit-scrollbar {
                display: none;
              }
              .no-scrollbar {
                -ms-overflow-style: none;
                scrollbar-width: none;
              }
            `}} />
            
            {/* Stat 1: Total Contribution */}
            <div className="bg-white border border-slate-200 rounded-2xl p-4.5 flex flex-col justify-between shadow-sm min-w-[80%] sm:min-w-0 snap-center shrink-0">
              <div className="w-8 h-8 rounded-lg bg-blue-50 border border-blue-100 text-blue-600 flex items-center justify-center">
                <Wallet size={16} />
              </div>
              <div className="mt-4">
                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Total Contribution</span>
                <span className="text-lg font-black text-slate-900 block tracking-tight mt-1">
                  {formatCurrency(totalPaid)}
                </span>
              </div>
            </div>

            {/* Stat 2: Active Groups */}
            <div className="bg-white border border-slate-200 rounded-2xl p-4.5 flex flex-col justify-between shadow-sm min-w-[80%] sm:min-w-0 snap-center shrink-0">
              <div className="w-8 h-8 rounded-lg bg-slate-50 border border-slate-200 text-slate-600 flex items-center justify-center">
                <Layers size={16} />
              </div>
              <div className="mt-4">
                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Group Holdings</span>
                <span className="text-lg font-black text-slate-900 block mt-1">
                  {groupData.length} Circles
                </span>
              </div>
            </div>

            {/* Stat 3: Wins */}
            <div className="bg-white border border-slate-200 rounded-2xl p-4.5 flex flex-col justify-between shadow-sm min-w-[80%] sm:min-w-0 snap-center shrink-0">
              <div className="w-8 h-8 rounded-lg bg-amber-50 border border-amber-100 text-amber-600 flex items-center justify-center">
                <Trophy size={16} />
              </div>
              <div className="mt-4">
                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Prize Claims</span>
                <span className="text-lg font-black text-slate-900 block mt-1">
                  {totalWins} Won
                </span>
              </div>
            </div>

          </div>

        </div>

        {/* Filter Tabs Bar (Fully Responsive Layout) */}
        <div className="bg-white border border-slate-200 rounded-2xl p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-sm">
          <span className="text-xs font-black uppercase tracking-wider text-slate-800 pl-1.5">Chit Groups</span>
          
          <div className="flex items-center gap-1 bg-slate-50 border border-slate-200 p-1 rounded-xl w-full sm:w-auto">
            {(['ALL', 'ACTIVE', 'WON'] as const).map((st) => (
              <button
                key={st}
                type="button"
                onClick={() => setFilterStatus(st)}
                className={cn(
                  'flex-1 sm:flex-none px-4 py-1.5 rounded-lg text-xs font-bold transition-all duration-150',
                  filterStatus === st 
                    ? 'bg-white text-blue-600 shadow-sm border border-slate-200/60' 
                    : 'text-slate-400 hover:text-slate-700'
                )}
              >
                {st === 'ALL' ? 'All Groups' : st === 'ACTIVE' ? 'Active' : 'Won'}
              </button>
            ))}
          </div>
        </div>

        {/* Groups Listing Area */}
        {filteredGroups.length === 0 ? (
          <div className="bg-white border border-slate-200 rounded-2xl p-16 text-center shadow-sm">
            <Inbox size={40} className="text-slate-300 mx-auto mb-3" />
            <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest">No Schemes Found</h3>
            <p className="text-xs text-slate-500 mt-1 font-medium">There are no chit groups matching this selection.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredGroups.map((gd) => {
              const isExpanded = expandedGroup === gd.group.id;
              const duration = gd.group?.duration ?? 0;
              const paidCount = getPaidCount(gd);
              const pending = typeof gd.pendingMonths === 'number' ? gd.pendingMonths : Math.max(0, duration - paidCount);
              const pct = duration > 0 ? Math.min(Math.round((paidCount / duration) * 100), 100) : 0;
              const hasWon = gd.myWins?.length > 0;

              return (
                <div 
                  key={gd.group.id} 
                  className={cn(
                    'bg-white border rounded-2xl overflow-hidden transition-all duration-200 shadow-sm',
                    isExpanded ? 'border-blue-500/80 ring-2 ring-blue-500/5' : 'border-slate-200 hover:border-slate-300'
                  )}
                >
                  {/* Card Header clickable row */}
                  <button
                    type="button"
                    onClick={() => setExpandedGroup(isExpanded ? null : gd.group.id)}
                    className="w-full text-left p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-5 bg-transparent border-none outline-none"
                  >
                    
                    <div className="flex items-start gap-4">
                      <div className="w-11 h-11 rounded-xl bg-blue-50 border border-blue-100 text-blue-600 flex items-center justify-center shrink-0">
                        <Layers size={20} />
                      </div>
                      <div>
                        <div className="flex items-center gap-2.5 flex-wrap">
                          <h3 className="font-extrabold text-sm sm:text-base text-slate-900 tracking-tight">{gd.group.name}</h3>
                          {hasWon && (
                            <span className="inline-flex items-center gap-1 text-[9px] font-extrabold bg-amber-50 text-amber-700 border border-amber-200 px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                              <Trophy size={10} className="text-amber-600" /> Won Round {gd.myWins.join(', ')}
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-slate-500 font-semibold mt-1.5">
                          Value: <span className="text-blue-600 font-black">{formatCurrency(gd.group.totalAmount)}</span> • Term: {duration} months
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between sm:justify-end gap-5 pt-3.5 sm:pt-0 border-t sm:border-t-0 border-slate-100">
                      <div className="text-left sm:text-right">
                        <span className="text-xs font-black text-slate-900 block">{paidCount} Paid Months</span>
                        <span className="text-[9px] font-bold uppercase text-slate-400 block tracking-widest mt-0.5">{pending} Pending</span>
                      </div>
                      <ChevronDown size={16} className={cn('text-slate-400 transition-transform duration-200', isExpanded && 'rotate-180 text-blue-600')} />
                    </div>

                  </button>

                  {/* Progress Line */}
                  <div className="px-5 sm:px-6 pb-4">
                    <div className="w-full h-1 bg-slate-100 rounded-full overflow-hidden">
                      <div className="bg-blue-600 h-full rounded-full" style={{ width: `${pct}%` }} />
                    </div>
                  </div>

                  {/* Expanded Grid */}
                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="border-t border-slate-100 bg-slate-50/50 p-5 sm:p-6"
                      >
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-4">Installment Schedule Ledger</span>
                        
                        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 gap-3">
                          {Array.from({ length: duration }, (_, i) => i + 1).map((month) => {
                            const payment = gd.payments?.find((p: { month: number }) => p.month === month);
                            const isPaid = payment?.status === 'PAID';
                            const isWin = gd.myWins?.includes(month);

                            return (
                              <div
                                key={month}
                                className={cn(
                                  'p-3.5 rounded-xl border flex flex-col justify-between min-h-[78px] transition-all',
                                  isWin
                                    ? 'bg-amber-50 border-amber-200 text-amber-900 shadow-2xs'
                                    : isPaid
                                      ? 'bg-white border-slate-200 text-slate-800'
                                      : 'bg-slate-100 border-slate-200/60 text-slate-400'
                                )}
                              >
                                <div className="flex justify-between items-center">
                                  <span className="text-[10px] font-black">Month {month}</span>
                                  {isWin ? (
                                    <Trophy size={11} className="text-amber-600" />
                                  ) : isPaid ? (
                                    <CheckCircle2 size={11} className="text-blue-600" />
                                  ) : (
                                    <Clock size={11} className="text-slate-400" />
                                  )}
                                </div>
                                
                                <div className="mt-3.5 text-xs font-black leading-none">
                                  {isWin ? (
                                    <span className="text-amber-700">Winner</span>
                                  ) : isPaid ? (
                                    <span className="text-blue-600">{formatCurrency(payment?.amount || 0)}</span>
                                  ) : (
                                    <span className="text-slate-400 font-semibold text-[10px]">Pending</span>
                                  )}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                </div>
              );
            })}
          </div>
        )}

      </main>

      {/* ════════ FLOATING MESSAGES BUTTON ════════ */}
      <div className="fixed bottom-6 right-6 z-50">
        <button
          type="button"
          onClick={() => setIsNotifOpen(true)}
          className="w-13 h-13 rounded-full bg-blue-600 text-white flex items-center justify-center shadow-lg shadow-blue-600/20 hover:scale-105 active:scale-95 transition-all relative border border-white"
        >
          <MessageCircle size={22} />
          {unreadNotifCount > 0 && (
            <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-rose-600 text-white text-[9px] font-black flex items-center justify-center shadow-sm">
              {unreadNotifCount}
            </span>
          )}
        </button>
      </div>

      {/* ════════ MESSAGES SLIDE-UP TRAY DRAWER ════════ */}
      <AnimatePresence>
        {isNotifOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-slate-950/20 backdrop-blur-xs z-[60]"
              onClick={() => setIsNotifOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, y: 100 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 100 }}
              transition={{ type: 'spring', damping: 25, stiffness: 220 }}
              className="fixed bottom-0 right-0 left-0 sm:left-auto sm:right-6 max-w-md w-full bg-white border border-slate-200 rounded-t-3xl sm:rounded-3xl shadow-2xl z-[70] overflow-hidden flex flex-col h-[500px]"
            >
              
              {/* Drawer Header */}
              <div className="px-5 py-4 bg-slate-900 border-b border-slate-800 shrink-0 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
                    <MessageCircle size={16} />
                  </div>
                  <div>
                    <h3 className="text-xs font-black uppercase tracking-wider text-white">Agent Desk Messages</h3>
                    <p className="text-[9px] text-slate-400 font-semibold">Contact your circle manager</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setIsNotifOpen(false)}
                  className="w-7 h-7 rounded-lg bg-slate-950 border border-slate-800 text-slate-400 hover:text-white flex items-center justify-center transition-colors"
                >
                  <X size={14} />
                </button>
              </div>

              {/* Drawer Tab Headers */}
              <div className="flex bg-slate-50 p-1.5 gap-1 border-b border-slate-200">
                {(['inbox', 'send'] as const).map((tab) => (
                  <button
                    key={tab}
                    type="button"
                    onClick={() => setMessageTab(tab)}
                    className={cn(
                      'flex-1 py-1.5 rounded-lg text-xs font-bold transition-all',
                      messageTab === tab 
                        ? 'bg-white text-blue-600 shadow-sm border border-slate-200/80' 
                        : 'text-slate-400 hover:text-slate-700'
                    )}
                  >
                    {tab === 'inbox' ? `Inbox (${unreadNotifCount})` : 'New Message'}
                  </button>
                ))}
              </div>

              {/* Drawer Tab Contents */}
              <div className="flex-1 overflow-y-auto p-4 bg-white">
                
                {/* 1. Inbox List */}
                {messageTab === 'inbox' ? (
                  <div className="space-y-3">
                    {notifications.length === 0 ? (
                      <div className="py-16 text-center">
                        <Inbox size={28} className="text-slate-300 mx-auto mb-2" />
                        <h4 className="text-xs font-bold text-slate-450 uppercase tracking-wider">No updates yet</h4>
                        <p className="text-[11px] text-slate-450">Official notices will appear here.</p>
                      </div>
                    ) : (
                      notifications.map((n) => (
                        <div
                          key={n.id}
                          onClick={() => markNotifRead(n.id)}
                          className={cn(
                            'p-3.5 rounded-xl border transition-all cursor-pointer',
                            !n.read ? 'bg-blue-50/50 border-blue-200' : 'bg-white border-slate-200 hover:bg-slate-50'
                          )}
                        >
                          <div className="flex items-center justify-between gap-2">
                            <span className="text-xs font-bold text-slate-900 truncate">{n.title}</span>
                            {!n.read && <span className="w-1.5 h-1.5 rounded-full bg-blue-600 shrink-0" />}
                          </div>
                          <p className="text-[11px] text-slate-650 mt-1 leading-relaxed font-semibold">{n.message}</p>
                          <span className="text-[9px] text-slate-450 mt-2 block">{formatTimeAgo(n.createdAt)}</span>
                        </div>
                      ))
                    )}
                  </div>
                ) : (
                  /* 2. New message Form */
                  <div className="space-y-4 pt-1">
                    <p className="text-[11px] text-slate-500 leading-relaxed font-semibold">
                      Send a secure message directly to your circle administrator.
                    </p>

                    {groupData.length > 1 && (
                      <div>
                        <label className="text-[9px] font-black text-slate-500 uppercase tracking-wider block mb-1">Circle Group</label>
                        <select
                          value={messageGroupId}
                          onChange={(e) => setMessageGroupId(e.target.value)}
                          className="w-full h-10 rounded-xl bg-white border border-slate-200 text-xs font-bold text-slate-800 px-3 focus:outline-none focus:border-slate-350 shadow-3xs"
                        >
                          <option value="">General Inquiry</option>
                          {groupData.map((gd) => (
                            <option key={gd.group.id} value={gd.group.id}>
                              {gd.group.name}
                            </option>
                          ))}
                        </select>
                      </div>
                    )}

                    <div>
                      <label className="text-[9px] font-black text-slate-500 uppercase tracking-wider block mb-1">Message Content</label>
                      <textarea
                        value={memberMessage}
                        onChange={(e) => setMemberMessage(e.target.value)}
                        placeholder="Write your query here..."
                        rows={5}
                        className="w-full rounded-xl bg-white border border-slate-200 p-3 text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-slate-350 resize-none shadow-3xs font-medium"
                      />
                    </div>

                    <button
                      type="button"
                      onClick={sendMessageToAgent}
                      disabled={isSendingMessage || !memberMessage.trim()}
                      className="w-full h-10 rounded-xl bg-blue-600 disabled:opacity-50 text-white text-xs font-extrabold flex items-center justify-center gap-2 shadow-md hover:bg-blue-700"
                    >
                      {isSendingMessage ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
                      Submit Message
                    </button>
                  </div>
                )}

              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

    </div>
  );
}
