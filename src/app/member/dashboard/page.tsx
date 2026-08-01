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
  ChevronRight,
  Loader2,
  TrendingUp,
  ShieldCheck,
  User,
  Bell,
  Send,
  MessageCircle,
  Inbox,
  X,
  Search,
  ArrowUpRight,
  Zap,
  Wallet,
  Activity
} from 'lucide-react';
import { formatCurrency, cn, formatTimeAgo } from '@/lib/utils';
import { toast } from 'sonner';
import { clearAllAuthSessions } from '@/lib/auth-client';
import { MemberDashboardSkeleton } from '@/components/ui/Skeleton';

function ChitFlowMark({ size = 36 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 44 44"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={{ width: size, height: size, minWidth: size, minHeight: size, flexShrink: 0, display: 'block' }}
    >
      <defs>
        <linearGradient id="memberMarkGradUltra" x1="0" y1="0" x2="44" y2="44" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#3b82f6" />
          <stop offset="50%" stopColor="#6366f1" />
          <stop offset="100%" stopColor="#8b5cf6" />
        </linearGradient>
      </defs>
      <rect width="44" height="44" rx="14" fill="url(#memberMarkGradUltra)" />
      <path d="M 10 15 L 17 22 L 10 29" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" opacity="0.7" />
      <path d="M 19 15 L 26 22 L 19 29" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="33" cy="22" r="2.5" fill="white" opacity="0.95" />
    </svg>
  );
}

function getPaidCount(gd: {
  paidCount?: number;
  payments?: { status: string; month: number }[];
}) {
  if (typeof gd.paidCount === 'number') return gd.paidCount;
  return new Set(
    (gd.payments ?? [])
      .filter((p) => p.status === 'PAID')
      .map((p) => p.month)
  ).size;
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

  useEffect(() => {
    if (!isNotifOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsNotifOpen(false);
    };
    document.body.style.overflow = 'hidden';
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.body.style.overflow = '';
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [isNotifOpen]);

  const fetchNotifications = async (memberId: string) => {
    try {
      const res = await fetch(`/api/member/notifications?memberId=${memberId}`);
      if (res.ok) {
        const data = await res.json();
        setNotifications(Array.isArray(data) ? data : []);
      }
    } catch {
      /* non-blocking */
    }
  };

  const markNotifRead = async (id: string, memberId?: string) => {
    const uid = memberId ?? session?.memberId;
    if (!uid) return;
    try {
      await fetch('/api/member/notifications', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ memberId: uid, id }),
      });
      setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
    } catch {
      /* ignore */
    }
  };

  const clearAllMessages = async (e?: React.MouseEvent) => {
    e?.stopPropagation();
    const memberId = session?.memberId;
    if (!memberId || notifications.length === 0) return;
    setNotifications([]);
    try {
      const res = await fetch('/api/member/notifications', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ memberId, clearAll: true }),
      });
      if (!res.ok) {
        const data = await res.json();
        toast.error(data.error || 'Could not clear messages');
        fetchNotifications(memberId);
      } else {
        toast.success('All messages cleared');
      }
    } catch {
      toast.error('Could not clear messages');
      fetchNotifications(memberId);
    }
  };

  const unreadNotifCount = notifications.filter((n) => !n.read).length;

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
      toast.success('Message sent to your agent');
      setMemberMessage('');
      setIsNotifOpen(false);
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Could not send message');
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
      toast.error('Failed to load your data.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    await clearAllAuthSessions();
    router.push('/auth/member/login');
  };

  const totalPaid = groupData.reduce((s, g) => s + (g.totalPaid || 0), 0);
  const totalWins = groupData.reduce((s, g) => s + (g.myWins?.length || 0), 0);
  const totalPendingMonths = groupData.reduce((s, g) => {
    const duration = g.group?.duration ?? 0;
    const paidCount = getPaidCount(g);
    return s + (typeof g.pendingMonths === 'number' ? g.pendingMonths : Math.max(0, duration - paidCount));
  }, 0);

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

  const messagesDrawer = isNotifOpen ? (
    <>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-slate-950/60 backdrop-blur-md z-[60]"
        onClick={() => setIsNotifOpen(false)}
      />
      <motion.div
        initial={{ opacity: 0, x: 20, scale: 0.98 }}
        animate={{ opacity: 1, x: 0, scale: 1 }}
        exit={{ opacity: 0, x: 20, scale: 0.98 }}
        transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
        className={cn(
          'fixed z-[70] flex flex-col bg-white/95 backdrop-blur-2xl border border-slate-200/80 shadow-2xl rounded-3xl overflow-hidden',
          'left-3 right-3 top-16 bottom-6 max-w-md ml-auto'
        )}
        onMouseDown={(e) => e.stopPropagation()}
      >
        <div className="px-6 py-5 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white shrink-0 relative overflow-hidden">
          <div className="absolute right-0 top-0 w-48 h-48 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="flex items-center justify-between relative z-10">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-blue-600/30 border border-blue-400/30 flex items-center justify-center text-blue-400 shadow-inner">
                <MessageCircle size={20} />
              </div>
              <div>
                <h3 className="text-base font-extrabold text-white">Agent Portal Messages</h3>
                <p className="text-[11px] text-slate-400 font-medium">Direct updates & receipts</p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setIsNotifOpen(false)}
              className="w-8 h-8 rounded-xl bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white flex items-center justify-center transition-colors"
            >
              <X size={16} />
            </button>
          </div>

          <div className="flex gap-1.5 mt-5 p-1 bg-slate-800/80 rounded-2xl border border-slate-700/60">
            {(['inbox', 'send'] as const).map((tab) => (
              <button
                key={tab}
                type="button"
                onClick={() => setMessageTab(tab)}
                className={cn(
                  'flex-1 flex items-center justify-center gap-2 py-2 rounded-xl text-xs font-bold transition-all duration-200',
                  messageTab === tab ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-500/25' : 'text-slate-400 hover:text-slate-200'
                )}
              >
                {tab === 'inbox' ? <Inbox size={14} /> : <Send size={14} />}
                {tab === 'inbox' ? `Inbox ${unreadNotifCount > 0 ? `(${unreadNotifCount})` : ''}` : 'New Message'}
              </button>
            ))}
          </div>
        </div>

        {messageTab === 'inbox' ? (
          <div className="flex-1 overflow-y-auto p-4 space-y-2.5 divide-y divide-slate-100">
            {notifications.length === 0 ? (
              <div className="p-12 text-center flex flex-col items-center justify-center h-full">
                <div className="w-14 h-14 rounded-3xl bg-blue-50 text-blue-500 flex items-center justify-center mb-3">
                  <Inbox size={26} />
                </div>
                <h4 className="text-sm font-bold text-slate-800">Inbox is empty</h4>
                <p className="text-xs text-slate-400 mt-1 max-w-xs">Admin notices and transaction updates will appear here.</p>
              </div>
            ) : (
              notifications.map((n) => (
                <button
                  key={n.id}
                  type="button"
                  onClick={() => markNotifRead(n.id, session?.memberId)}
                  className={cn(
                    'w-full p-4 text-left rounded-2xl transition-all duration-200 pt-3.5',
                    !n.read ? 'bg-blue-50/80 border border-blue-200/80 shadow-xs' : 'hover:bg-slate-50 border border-transparent'
                  )}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-extrabold text-slate-900 truncate">{n.title}</span>
                    {!n.read && <span className="w-2 h-2 rounded-full bg-blue-600 shrink-0" />}
                  </div>
                  <p className="text-xs text-slate-600 mt-1.5 leading-relaxed font-medium">{n.message}</p>
                  <span className="text-[10px] text-slate-400 mt-2.5 block font-semibold">{formatTimeAgo(n.createdAt)}</span>
                </button>
              ))
            )}
          </div>
        ) : (
          <div className="p-6 space-y-4 shrink-0 bg-slate-50/60 flex-1">
            <p className="text-xs text-slate-500 leading-relaxed font-medium">
              Have a question about your contributions or chit status? Send a message directly to your chit manager.
            </p>

            {groupData.length > 1 && (
              <div>
                <label className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500 block mb-1.5">Select Chit Group</label>
                <select
                  value={messageGroupId}
                  onChange={(e) => setMessageGroupId(e.target.value)}
                  className="w-full h-11 rounded-2xl bg-white border border-slate-200 text-xs font-semibold text-slate-800 px-3.5 focus:outline-none focus:ring-2 focus:ring-blue-500/25 shadow-xs"
                >
                  <option value="">All Chit Groups / General</option>
                  {groupData.map((gd) => (
                    <option key={gd.group.id} value={gd.group.id}>
                      {gd.group.name}
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div>
              <label className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500 block mb-1.5">Your Message</label>
              <textarea
                value={memberMessage}
                onChange={(e) => setMemberMessage(e.target.value)}
                placeholder="e.g. Please update my June installment receipt..."
                rows={4}
                className="w-full rounded-2xl bg-white border border-slate-200 p-3.5 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/25 resize-none shadow-xs font-medium"
              />
            </div>

            <button
              type="button"
              onClick={sendMessageToAgent}
              disabled={isSendingMessage || !memberMessage.trim()}
              className="w-full h-11 rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:opacity-95 disabled:opacity-50 text-white text-xs font-extrabold flex items-center justify-center gap-2 shadow-lg shadow-blue-500/25 transition-all"
            >
              {isSendingMessage ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
              Send Message Now
            </button>
          </div>
        )}
      </motion.div>
    </>
  ) : null;

  if (isLoading) {
    return <MemberDashboardSkeleton />;
  }

  return (
    <div className="min-h-screen bg-[#f3f6fc] text-slate-900 font-sans antialiased selection:bg-blue-600 selection:text-white relative overflow-x-hidden">
      {/* Background ambient glowing gradient orbs */}
      <div className="fixed top-0 left-1/4 w-96 h-96 bg-blue-400/10 rounded-full blur-3xl pointer-events-none" />
      <div className="fixed bottom-10 right-10 w-96 h-96 bg-purple-400/10 rounded-full blur-3xl pointer-events-none" />

      <AnimatePresence>{messagesDrawer}</AnimatePresence>

      {/* Glass Top Navigation Bar */}
      <header className="sticky top-0 z-40 bg-white/75 backdrop-blur-xl border-b border-slate-200/70 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 sm:h-20 flex items-center justify-between gap-4">
          
          {/* Brand Logo */}
          <div className="flex items-center gap-3">
            <ChitFlowMark size={38} />
            <div>
              <span className="font-black text-lg tracking-tight text-slate-900 block leading-none">ChitFlow</span>
              <span className="text-[9px] font-extrabold tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600 uppercase block mt-1">
                Member Hub
              </span>
            </div>
          </div>

          {/* Search bar on desktop */}
          <div className="hidden md:flex items-center gap-2 bg-slate-100/80 border border-slate-200/80 rounded-2xl px-3.5 py-2 w-72 focus-within:bg-white focus-within:ring-2 focus-within:ring-blue-500/20 transition-all">
            <Search size={16} className="text-slate-400" />
            <input
              type="text"
              placeholder="Search chit group name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-transparent text-xs text-slate-800 placeholder:text-slate-400 font-medium focus:outline-none w-full"
            />
            {searchQuery && (
              <button type="button" onClick={() => setSearchQuery('')} className="text-slate-400 hover:text-slate-600">
                <X size={14} />
              </button>
            )}
          </div>

          {/* Right Action Tools */}
          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={() => setIsNotifOpen(o => !o)}
              className="relative p-2.5 sm:px-4 sm:py-2.5 rounded-2xl bg-white/90 hover:bg-slate-50 border border-slate-200/80 text-slate-700 transition-all flex items-center gap-2.5 font-bold text-xs shadow-xs"
            >
              <Bell size={18} className="text-blue-600" />
              <span className="hidden sm:inline">Messages</span>
              {unreadNotifCount > 0 && (
                <span className="min-w-[20px] h-[20px] bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-[10px] font-black rounded-full flex items-center justify-center px-1 shadow-sm">
                  {unreadNotifCount > 9 ? '9+' : unreadNotifCount}
                </span>
              )}
            </button>

            <button
              type="button"
              onClick={handleLogout}
              className="p-2.5 sm:px-3.5 sm:py-2.5 rounded-2xl bg-slate-100/90 hover:bg-rose-50 hover:text-rose-600 border border-slate-200/80 text-slate-600 transition-all flex items-center gap-2 font-bold text-xs"
              title="Logout"
            >
              <LogOut size={17} />
              <span className="hidden sm:inline">Exit</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        
        {/* ================= 2-COLUMN LEFT/RIGHT LAYOUT ================= */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* ================= LEFT PANEL ================= */}
          <aside className="lg:col-span-4 space-y-6 lg:sticky lg:top-24">
            
            {/* Dark Welcome Card (User Image Banner Design) */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-[#0f1428] rounded-[28px] p-5 text-white shadow-2xl shadow-slate-900/20 border border-slate-800 relative overflow-hidden"
            >
              <div className="flex flex-col gap-4 relative z-10">
                
                {/* User Avatar + Live Sync + Name */}
                <div className="flex items-center gap-3.5">
                  <div className="w-14 h-14 rounded-2xl bg-slate-900 border-2 border-blue-500/80 shadow-[0_0_15px_rgba(59,130,246,0.5)] flex items-center justify-center shrink-0 text-blue-400">
                    <User size={26} />
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="inline-flex items-center gap-1 text-[9px] font-extrabold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full mb-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" /> Live Sync
                    </div>
                    <h2 className="text-lg font-extrabold text-white tracking-tight leading-tight truncate">
                      Welcome back, {session?.name} 👋
                    </h2>
                    <p className="text-xs text-slate-400 font-medium flex items-center gap-1.5 mt-0.5">
                      <Phone size={12} className="text-blue-400" />
                      <span>{session?.phone}</span>
                    </p>
                  </div>
                </div>

                {/* Total Groups & Auction Wins Pills */}
                <div className="grid grid-cols-2 gap-2.5 pt-3 border-t border-slate-800/80">
                  <div className="bg-slate-800/50 border border-slate-700/60 rounded-2xl p-3 text-center">
                    <span className="text-[9px] font-extrabold text-slate-400 uppercase tracking-widest block">Total Groups</span>
                    <span className="text-base font-black text-white mt-0.5 block">{groupData.length} Active</span>
                  </div>

                  <div className="bg-gradient-to-br from-amber-500/10 to-amber-600/5 border border-amber-500/30 rounded-2xl p-3 text-center">
                    <span className="text-[9px] font-extrabold text-amber-400 uppercase tracking-widest block">Auction Wins 🏆</span>
                    <span className="text-base font-black text-amber-400 mt-0.5 block">{totalWins} Lifted</span>
                  </div>
                </div>

              </div>
            </motion.div>

            {/* Main Financial Overview Card */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white/80 backdrop-blur-xl rounded-3xl p-6 border border-slate-200/80 shadow-xl shadow-slate-200/50 space-y-5"
            >
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 text-white flex items-center justify-center shadow-md shadow-blue-500/20">
                    <Wallet size={18} />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-slate-900 text-sm">Portfolio Summary</h3>
                    <p className="text-[10px] font-semibold text-slate-400">Total chit investments</p>
                  </div>
                </div>
                <Activity size={18} className="text-blue-500 animate-pulse" />
              </div>

              {/* Total Paid Card */}
              <div className="p-4 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-500/20 relative overflow-hidden">
                <div className="absolute -right-6 -bottom-6 w-24 h-24 bg-white/10 rounded-full blur-lg pointer-events-none" />
                <span className="text-[11px] font-bold text-blue-100 uppercase tracking-wider block">Total Contribution Paid</span>
                <div className="text-2xl font-black text-white mt-1 tracking-tight">
                  {formatCurrency(totalPaid)}
                </div>
                <div className="mt-3 pt-2.5 border-t border-white/15 flex items-center justify-between text-[11px] text-blue-100 font-medium">
                  <span>Across {groupData.length} groups</span>
                  <span className="inline-flex items-center gap-0.5 text-white font-bold">
                    Updated <ArrowUpRight size={12} />
                  </span>
                </div>
              </div>

              {/* Installments Breakdown */}
              <div className="p-4 rounded-2xl bg-slate-50/90 border border-slate-200/80 flex items-center justify-between">
                <div>
                  <span className="text-[11px] font-bold text-slate-500 block">Pending Installments</span>
                  <span className="text-base font-black text-slate-900 mt-0.5 block">
                    {totalPendingMonths} {totalPendingMonths === 1 ? 'Month' : 'Months'}
                  </span>
                </div>
                <div className="w-10 h-10 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center font-bold">
                  <Clock size={20} />
                </div>
              </div>
            </motion.div>

            {/* Agent Support Box */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
              className="bg-gradient-to-br from-slate-900 to-slate-800 text-white rounded-3xl p-6 shadow-xl border border-slate-700/80 relative overflow-hidden"
            >
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-2xl bg-blue-500/20 border border-blue-400/30 text-blue-400 flex items-center justify-center shrink-0">
                  <Zap size={20} />
                </div>
                <div>
                  <h4 className="font-bold text-sm text-white">Direct Agent Support</h4>
                  <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                    Have questions regarding chit allocations or auction dates?
                  </p>
                  <button
                    type="button"
                    onClick={() => { setMessageTab('send'); setIsNotifOpen(true); }}
                    className="mt-4 px-4 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:opacity-95 text-white rounded-xl text-xs font-extrabold flex items-center gap-2 shadow-md shadow-blue-500/20 transition-all"
                  >
                    <Send size={13} />
                    Send Note to Admin
                  </button>
                </div>
              </div>
            </motion.div>

          </aside>

          {/* ================= RIGHT PANEL ================= */}
          <main className="lg:col-span-8 space-y-6">
            
            {/* Section Controls */}
            <div className="bg-white/80 backdrop-blur-xl rounded-3xl p-4 sm:p-5 border border-slate-200/80 shadow-xl shadow-slate-200/50 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-base font-extrabold text-slate-900 tracking-tight">Active Chit Holdings</h2>
                <p className="text-xs text-slate-500 font-medium">Track chit schedule & monthly breakdown</p>
              </div>

              {/* Status Tabs */}
              <div className="flex items-center gap-1.5 p-1 bg-slate-100/90 rounded-2xl border border-slate-200/80 w-full sm:w-auto">
                {(['ALL', 'ACTIVE', 'WON'] as const).map((st) => (
                  <button
                    key={st}
                    type="button"
                    onClick={() => setFilterStatus(st)}
                    className={cn(
                      'flex-1 sm:flex-none px-4 py-2 rounded-xl text-xs font-bold transition-all duration-200',
                      filterStatus === st
                        ? 'bg-white text-blue-600 shadow-md shadow-slate-200'
                        : 'text-slate-500 hover:text-slate-900'
                    )}
                  >
                    {st === 'ALL' ? 'All Groups' : st === 'ACTIVE' ? 'Active' : 'Auction Won'}
                  </button>
                ))}
              </div>
            </div>

            {/* Groups Listing */}
            {filteredGroups.length === 0 ? (
              <div className="bg-white/80 backdrop-blur-xl rounded-3xl p-12 text-center border border-slate-200/80 shadow-xs">
                <Layers size={44} className="text-slate-300 mx-auto mb-3" />
                <h3 className="text-sm font-bold text-slate-800">No Groups Found</h3>
                <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto font-medium">
                  {searchQuery ? `No chit groups matching "${searchQuery}"` : "You have no chit groups matching this filter."}
                </p>
              </div>
            ) : (
              <div className="space-y-5">
                {filteredGroups.map((gd, idx) => {
                  const isExpanded = expandedGroup === gd.group.id;
                  const duration = gd.group?.duration ?? 0;
                  const paidCount = getPaidCount(gd);
                  const pending = typeof gd.pendingMonths === 'number' ? gd.pendingMonths : Math.max(0, duration - paidCount);
                  const pct = duration > 0 ? Math.min(Math.round((paidCount / duration) * 100), 100) : 0;
                  const hasWon = gd.myWins?.length > 0;

                  return (
                    <motion.article
                      key={gd.group.id}
                      initial={{ opacity: 0, y: 15 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.05 }}
                      className={cn(
                        'bg-white/90 backdrop-blur-xl rounded-3xl border transition-all duration-300 overflow-hidden shadow-xl shadow-slate-200/50',
                        isExpanded
                          ? 'border-blue-500/50 ring-4 ring-blue-500/5'
                          : 'border-slate-200/80 hover:border-slate-300'
                      )}
                    >
                      {/* Main Group Header Row */}
                      <button
                        type="button"
                        onClick={() => setExpandedGroup(isExpanded ? null : gd.group.id)}
                        className="w-full text-left p-6 sm:p-7 transition-colors hover:bg-slate-50/50"
                      >
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-5">
                          <div className="flex items-start gap-4">
                            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600 text-white flex items-center justify-center shrink-0 shadow-lg shadow-blue-500/20 font-bold">
                              <Layers size={24} />
                            </div>
                            <div className="min-w-0">
                              <div className="flex items-center gap-2 flex-wrap">
                                <h3 className="text-lg font-black text-slate-900 tracking-tight">{gd.group.name}</h3>
                                {hasWon && (
                                  <span className="inline-flex items-center gap-1 text-[10px] font-extrabold bg-amber-100 text-amber-800 border border-amber-300/60 px-2.5 py-0.5 rounded-full">
                                    <Trophy size={12} className="text-amber-600" />
                                    Lift Won (M{gd.myWins.join(', M')})
                                  </span>
                                )}
                              </div>

                              <div className="flex items-center gap-3 text-xs text-slate-500 mt-2 font-medium flex-wrap">
                                <span className="font-extrabold text-blue-700 bg-blue-50 border border-blue-100 px-2.5 py-1 rounded-xl">
                                  {formatCurrency(gd.group.totalAmount)} Chit
                                </span>
                                <span>•</span>
                                <span className="font-semibold">{duration} Months Term</span>
                              </div>
                            </div>
                          </div>

                          {/* Stats Pill */}
                          <div className="flex items-center justify-between sm:justify-end gap-4 pt-4 sm:pt-0 border-t sm:border-t-0 border-slate-100">
                            <div className="bg-slate-50/90 border border-slate-200/80 px-4 py-2.5 rounded-2xl text-right">
                              <div className="text-base font-black text-slate-900">
                                {paidCount} <span className="text-slate-400 font-medium text-xs">/ {duration}</span>
                              </div>
                              <div className="text-[9px] font-extrabold uppercase tracking-widest text-blue-600">Paid Months</div>
                            </div>

                            <div className={cn(
                              'w-10 h-10 rounded-2xl border flex items-center justify-center transition-all duration-300',
                              isExpanded ? 'bg-blue-600 border-blue-600 text-white rotate-90 shadow-md shadow-blue-500/25' : 'bg-slate-100 border-slate-200 text-slate-400'
                            )}>
                              <ChevronRight size={20} />
                            </div>
                          </div>
                        </div>

                        {/* Progress Bar */}
                        <div className="mt-6">
                          <div className="flex justify-between items-center text-[11px] font-extrabold mb-2">
                            <span className="text-slate-500 uppercase tracking-wider">{pct}% Completed</span>
                            <span className={pending > 0 ? 'text-rose-500' : 'text-emerald-600'}>
                              {pending > 0 ? `${pending} Installment Pending` : 'All Paid Up'}
                            </span>
                          </div>
                          <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden p-0.5 border border-slate-200/60">
                            <motion.div
                              initial={{ width: 0 }}
                              animate={{ width: `${pct}%` }}
                              transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                              className="h-full bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 rounded-full shadow-xs"
                            />
                          </div>
                        </div>
                      </button>

                      {/* Expanded Section - Monthly Payment Grid */}
                      <AnimatePresence>
                        {isExpanded && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.25 }}
                            className="border-t border-slate-100 bg-slate-50/70 p-6"
                          >
                            <div className="flex items-center justify-between mb-4">
                              <div className="flex items-center gap-2">
                                <TrendingUp size={16} className="text-blue-600" />
                                <h4 className="text-xs font-black uppercase tracking-wider text-slate-800">Monthly Contribution Grid</h4>
                              </div>
                              <span className="text-[11px] font-semibold text-slate-400">Total {duration} Months</span>
                            </div>

                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                              {Array.from({ length: duration }, (_, i) => i + 1).map((month) => {
                                const payment = gd.payments?.find((p: { month: number }) => p.month === month);
                                const isPaid = payment?.status === 'PAID';
                                const isWin = gd.myWins?.includes(month);

                                return (
                                  <div
                                    key={month}
                                    className={cn(
                                      'p-3.5 rounded-2xl border transition-all flex flex-col justify-between h-24',
                                      isWin
                                        ? 'bg-amber-50/90 border-amber-300/80 text-amber-900 shadow-sm'
                                        : isPaid
                                        ? 'bg-white border-blue-200/90 text-slate-900 shadow-xs'
                                        : 'bg-slate-100/70 border-slate-200/60 text-slate-400'
                                    )}
                                  >
                                    <div className="flex items-center justify-between">
                                      <span className="text-xs font-black">Month {month}</span>
                                      {isWin ? (
                                        <Trophy size={15} className="text-amber-600" />
                                      ) : isPaid ? (
                                        <CheckCircle2 size={15} className="text-blue-600" />
                                      ) : (
                                        <Clock size={15} className="text-slate-400" />
                                      )}
                                    </div>
                                    <div>
                                      {isWin ? (
                                        <span className="text-xs font-black text-amber-700 block">Auction Won</span>
                                      ) : isPaid ? (
                                        <span className="text-xs font-extrabold text-blue-700 block">
                                          {formatCurrency(payment?.amount || 0)}
                                        </span>
                                      ) : (
                                        <span className="text-[11px] font-semibold text-slate-400 block">Pending</span>
                                      )}
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </motion.article>
                  );
                })}
              </div>
            )}

            {/* Footer badge */}
            <div className="pt-6 text-center text-xs font-semibold text-slate-400 flex items-center justify-center gap-2">
              <ShieldCheck size={16} className="text-emerald-500" />
              <span>ChitFlow Encrypted & Synchronized Member Portal</span>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
