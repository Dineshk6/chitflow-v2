'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import {
  CheckCircle2,
  Clock,
  Trophy,
  Layers,
  IndianRupee,
  LogOut,
  Phone,
  ChevronRight,
  Loader2,
  TrendingUp,
  Shield,
  User,
  Bell,
  Send,
  MessageCircle,
  Inbox,
  X,
} from 'lucide-react';
import { formatCurrency, cn, formatTimeAgo } from '@/lib/utils';
import { toast } from 'sonner';
import { clearAllAuthSessions } from '@/lib/auth-client';
import { MemberDashboardSkeleton } from '@/components/ui/Skeleton';

const springSmooth = { type: 'spring' as const, stiffness: 400, damping: 34 };

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
  const groupsRef = useRef<HTMLDivElement>(null);

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
  const totalPending = groupData.reduce((s, g) => s + (g.pendingMonths || 0), 0);


  const messagesPanel = isNotifOpen ? (
    <>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-slate-900/25 backdrop-blur-[2px] z-[60]"
        onClick={() => setIsNotifOpen(false)}
      />
      <motion.div
        initial={{ opacity: 0, y: 12, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 12, scale: 0.96 }}
        transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
        className={cn(
          'fixed z-[70] flex flex-col bg-white border border-slate-200 rounded-2xl shadow-2xl overflow-hidden',
          'left-3 right-3 top-[4.5rem] max-h-[min(32rem,calc(100dvh-5.5rem))]',
          'sm:left-auto sm:right-6 sm:w-[22rem] lg:right-8 lg:top-24'
        )}
        onMouseDown={(e) => e.stopPropagation()}
      >
            <div className="px-4 py-3 bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-slate-100 shrink-0">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <MessageCircle size={16} className="text-blue-600" />
                  <span className="text-xs font-black text-slate-900">Messages</span>
                  {unreadNotifCount > 0 && (
                    <span className="text-[10px] font-bold bg-blue-600 text-white px-1.5 py-0.5 rounded-full">
                      {unreadNotifCount}
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  {notifications.length > 0 && messageTab === 'inbox' && (
                    <button
                      type="button"
                      onClick={clearAllMessages}
                      className="text-[10px] font-bold text-red-500 hover:underline"
                    >
                      Clear all
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => setIsNotifOpen(false)}
                    className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100"
                    aria-label="Close"
                  >
                    <X size={15} />
                  </button>
                </div>
              </div>
              <div className="flex gap-1 mt-3 p-0.5 bg-slate-100 rounded-lg">
                {(['inbox', 'send'] as const).map((tab) => (
                  <button
                    key={tab}
                    type="button"
                    onClick={() => setMessageTab(tab)}
                    className={cn(
                      'flex-1 flex items-center justify-center gap-1 py-1.5 rounded-md text-[10px] font-bold transition-all duration-200',
                      messageTab === tab ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-500 hover:text-slate-800'
                    )}
                  >
                    {tab === 'inbox' ? <Inbox size={12} /> : <Send size={12} />}
                    {tab === 'inbox' ? 'Inbox' : 'Send'}
                  </button>
                ))}
              </div>
            </div>

            {messageTab === 'inbox' ? (
              <div className="flex-1 overflow-y-auto min-h-[12rem] max-h-64">
                {notifications.length === 0 ? (
                  <div className="p-10 text-center">
                    <Inbox size={28} className="text-slate-300 mx-auto mb-2" />
                    <p className="text-xs font-bold text-slate-500">No messages from agent yet</p>
                  </div>
                ) : (
                  notifications.map((n) => (
                    <button
                      key={n.id}
                      type="button"
                      onClick={() => markNotifRead(n.id, session?.memberId)}
                      className={cn(
                        'w-full px-4 py-3.5 text-left border-b border-slate-50 hover:bg-slate-50 transition-colors duration-200',
                        !n.read && 'bg-blue-50 border-l-2 border-l-blue-500'
                      )}
                    >
                      <p className="text-xs font-bold text-slate-900">{n.title}</p>
                      <p className="text-[11px] text-slate-600 mt-1 leading-snug">{n.message}</p>
                      <p className="text-[9px] text-slate-400 mt-1.5 font-bold">{formatTimeAgo(n.createdAt)}</p>
                    </button>
                  ))
                )}
              </div>
            ) : (
              <div className="p-4 space-y-3 shrink-0">
                <p className="text-[11px] text-slate-600 leading-relaxed">
                  Send a message to your agent. They will see it in their Messages center.
                </p>
                {groupData.length > 1 && (
                  <select
                    value={messageGroupId}
                    onChange={(e) => setMessageGroupId(e.target.value)}
                    className="w-full h-9 rounded-lg bg-slate-50 border border-slate-200 text-xs text-slate-800 px-2 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  >
                    <option value="">All my groups</option>
                    {groupData.map((gd) => (
                      <option key={gd.group.id} value={gd.group.id}>
                        {gd.group.name}
                      </option>
                    ))}
                  </select>
                )}
                <textarea
                  value={memberMessage}
                  onChange={(e) => setMemberMessage(e.target.value)}
                  placeholder="e.g. I paid May contribution via PhonePe..."
                  rows={4}
                  className="w-full rounded-xl bg-slate-50 border border-slate-200 p-3 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/25 resize-none"
                />
                <button
                  type="button"
                  onClick={sendMessageToAgent}
                  disabled={isSendingMessage || !memberMessage.trim()}
                  className="w-full h-10 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 disabled:opacity-50 text-white text-sm font-bold flex items-center justify-center gap-2 shadow-md shadow-blue-500/20 transition-all"
                >
                  {isSendingMessage ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
                  Send message
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
    <div className="member-portal-bg min-h-screen">
      <AnimatePresence>{messagesPanel}</AnimatePresence>

      {/* ── Header ── */}
      <header className="sticky top-0 z-20 border-b border-slate-200/80 bg-white/90 backdrop-blur-xl shadow-sm">
        <div className="max-w-3xl xl:max-w-4xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between gap-3">
          {/* Brand */}
          <div className="flex items-center gap-2 shrink-0">
            <div className="w-8 h-8 rounded-lg gradient-blue flex items-center justify-center text-white font-black text-sm">C</div>
            <span className="font-black text-slate-900 text-sm">ChitFlow</span>
          </div>

          {/* Greeting */}
          <p className="hidden sm:block text-sm font-bold text-slate-600 truncate flex-1">
            Hi, <span className="text-slate-900">{session?.name}</span>
          </p>

          {/* Right actions */}
          <div className="flex items-center gap-2 ml-auto">
            {/* Phone pill — sm+ */}
            <div className="relative hidden sm:block">
              <Phone size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-blue-600" />
              <span className="pl-8 pr-3 py-1.5 rounded-full bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-600">
                {session?.phone}
              </span>
            </div>

            {/* Bell — always visible */}
            <button
              type="button"
              onClick={() => setIsNotifOpen((o) => !o)}
              className="relative p-2.5 rounded-xl bg-slate-50 border border-slate-200 hover:bg-blue-50 hover:border-blue-200 transition-all duration-200"
              aria-label="Messages"
            >
              <Bell size={18} className="text-slate-600" />
              {unreadNotifCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 min-w-[16px] h-4 px-1 bg-blue-600 text-[9px] font-black text-white rounded-full flex items-center justify-center border-2 border-white">
                  {unreadNotifCount > 9 ? '9+' : unreadNotifCount}
                </span>
              )}
            </button>

            {/* Sign out */}
            <button
              type="button"
              onClick={handleLogout}
              className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 hover:bg-red-50 hover:border-red-200 hover:text-red-600 transition-all duration-200 text-slate-600"
              aria-label="Sign out"
            >
              <LogOut size={18} />
            </button>
          </div>
        </div>
      </header>

        <main className="flex-1 max-w-3xl xl:max-w-4xl w-full mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6 sm:space-y-8">
          {/* Welcome */}
          <motion.section
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
            className="surface-card p-4 sm:p-6 !rounded-2xl flex items-center gap-3 sm:gap-4"
          >
            <div className="w-10 h-10 sm:w-14 sm:h-14 rounded-xl sm:rounded-2xl bg-gradient-to-br from-blue-100 to-indigo-100 border border-blue-100 flex items-center justify-center shrink-0">
              <User size={20} className="sm:hidden text-blue-600" />
              <User size={28} className="hidden sm:block text-blue-600" />
            </div>
            <div className="min-w-0">
              <p className="text-slate-500 text-xs sm:text-sm">Welcome back</p>
              <h1 className="text-xl sm:text-3xl font-black text-slate-900 leading-tight truncate">{session?.name}</h1>
              <p className="text-xs text-blue-600 font-semibold mt-0.5 hidden sm:block">Your chit groups at a glance</p>
            </div>
          </motion.section>

          {/* Stats */}
          {groupData.length > 0 && (
            <motion.section
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.08, duration: 0.4 }}
              className="grid grid-cols-2 lg:grid-cols-4 gap-3"
            >
              {[
                { label: 'Groups', value: groupData.length, icon: Layers, tone: 'blue' },
                { label: 'Total paid', value: formatCurrency(totalPaid), icon: IndianRupee, tone: 'indigo', small: true },
                { label: 'Chit lifts', value: totalWins, icon: Trophy, tone: 'amber' },
                { label: 'Pending', value: totalPending, icon: Clock, tone: 'rose' },
              ].map((stat, i) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 + i * 0.05 }}
                  whileHover={{ y: -2 }}
                  className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm hover:shadow-md hover:border-blue-100 transition-all duration-300"
                >
                  <div
                    className={cn(
                      'w-9 h-9 rounded-xl flex items-center justify-center mb-2',
                      stat.tone === 'blue' && 'bg-blue-50 text-blue-600',
                      stat.tone === 'indigo' && 'bg-indigo-50 text-indigo-600',
                      stat.tone === 'amber' && 'bg-amber-50 text-amber-600',
                      stat.tone === 'rose' && 'bg-rose-50 text-rose-600'
                    )}
                  >
                    <stat.icon size={18} />
                  </div>
                  <p className={cn('font-black text-slate-900 tabular-nums', stat.small ? 'text-sm' : 'text-xl')}>
                    {stat.value}
                  </p>
                  <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mt-0.5">{stat.label}</p>
                </motion.div>
              ))}
            </motion.section>
          )}

          {/* Groups */}
          <section ref={groupsRef} className="scroll-mt-20">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex items-center justify-between mb-3"
            >
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-blue-100 flex items-center justify-center">
                  <Layers size={15} className="text-blue-600" />
                </div>
                <h2 className="text-base font-black text-slate-900">My groups</h2>
                <span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">
                  {groupData.length}
                </span>
              </div>
            </motion.div>

            {groupData.length === 0 ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center py-16 border-2 border-dashed border-slate-200 rounded-3xl bg-white"
              >
                <Layers size={44} className="text-slate-300 mx-auto mb-3" />
                <p className="text-slate-800 font-bold">Not enrolled in any group yet</p>
                <p className="text-slate-500 text-sm mt-1">Contact your agent to get started.</p>
              </motion.div>
            ) : (
              <div className="space-y-4">
                {groupData.map((gd, idx) => {
                  const isExpanded = expandedGroup === gd.group.id;
                  const duration = gd.group?.duration ?? 0;
                  const paidCount = getPaidCount(gd);
                  const pending =
                    typeof gd.pendingMonths === 'number' ? gd.pendingMonths : Math.max(0, duration - paidCount);
                  const completionPct = duration > 0 ? Math.min(Math.round((paidCount / duration) * 100), 100) : 0;

                  return (
                    <motion.article
                      key={gd.group.id}
                      layout
                      initial={{ opacity: 0, y: 16 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.12 + idx * 0.06, duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                      className={cn(
                        'bg-white border rounded-2xl overflow-hidden shadow-sm transition-shadow duration-300',
                        isExpanded ? 'border-blue-200 shadow-md shadow-blue-500/10' : 'border-slate-200 hover:shadow-md'
                      )}
                    >
                      <button
                        type="button"
                        onClick={() => setExpandedGroup(isExpanded ? null : gd.group.id)}
                        className="w-full p-4 sm:p-5 text-left hover:bg-slate-50/80 transition-colors duration-200"
                      >
                        <div className="flex items-center gap-3">
                          {/* Logo */}
                          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-md shadow-blue-500/20 shrink-0">
                            <Layers size={18} className="sm:hidden text-white" />
                            <Layers size={22} className="hidden sm:block text-white" />
                          </div>

                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between gap-2">
                              {/* Name + meta */}
                              <div className="min-w-0 flex-1">
                                <h3 className="font-black text-slate-900 text-sm sm:text-lg leading-tight truncate">
                                  {gd.group.name}
                                </h3>
                                <p className="text-[10px] sm:text-[11px] text-slate-500 font-medium mt-0.5 flex flex-wrap gap-x-1.5 gap-y-0.5">
                                  <span>{formatCurrency(gd.group.totalAmount)}</span>
                                  <span className="text-slate-300">·</span>
                                  <span>{duration}M</span>
                                  {gd.myWins?.length > 0 && (
                                    <>
                                      <span className="text-slate-300">·</span>
                                      <span className="text-amber-600 font-bold flex items-center gap-0.5">
                                        <Trophy size={10} /> M{gd.myWins.join(', M')}
                                      </span>
                                    </>
                                  )}
                                </p>
                              </div>

                              {/* Badge + Chevron */}
                              <div className="flex items-center gap-1.5 shrink-0">
                                <div className="text-center bg-blue-50 border border-blue-100 rounded-lg px-2 py-1 sm:px-3 sm:py-1.5">
                                  <p className="text-sm sm:text-lg font-black text-slate-900 tabular-nums leading-none">
                                    {paidCount}<span className="text-slate-400 font-semibold text-xs sm:text-sm">/{duration}</span>
                                  </p>
                                  <p className="text-[8px] text-blue-600 font-bold uppercase tracking-wider mt-0.5 hidden sm:block">
                                    months paid
                                  </p>
                                </div>
                                <motion.div
                                  animate={{ rotate: isExpanded ? 90 : 0 }}
                                  transition={springSmooth}
                                  className={cn(
                                    'w-6 h-6 sm:w-7 sm:h-7 rounded-lg flex items-center justify-center border shrink-0',
                                    isExpanded
                                      ? 'bg-blue-50 border-blue-200 text-blue-600'
                                      : 'bg-slate-50 border-slate-200 text-slate-400'
                                  )}
                                >
                                  <ChevronRight size={14} />
                                </motion.div>
                              </div>
                            </div>

                            <div className="mt-4">
                              <div className="flex justify-between text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                                <span>{completionPct}% complete</span>
                                <span className="tabular-nums">{pending} pending</span>
                              </div>
                              <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                                <motion.div
                                  initial={{ width: 0 }}
                                  animate={{ width: `${completionPct}%` }}
                                  transition={{ duration: 0.7, delay: 0.15 + idx * 0.05, ease: [0.22, 1, 0.36, 1] }}
                                  className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full"
                                />
                              </div>
                            </div>
                          </div>
                        </div>
                      </button>

                      <AnimatePresence initial={false}>
                        {isExpanded && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                            className="overflow-hidden border-t border-slate-100 bg-gradient-to-b from-slate-50/80 to-white"
                          >
                            <div className="p-4 sm:p-5">
                              <div className="flex items-center gap-2 mb-4">
                                <TrendingUp size={14} className="text-blue-600" />
                                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
                                  Monthly payment history
                                </p>
                              </div>
                              <motion.div
                                initial="hidden"
                                animate="show"
                                variants={{
                                  hidden: {},
                                  show: { transition: { staggerChildren: 0.03 } },
                                }}
                                className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 sm:gap-3"
                              >
                                {Array.from({ length: duration }, (_, i) => i + 1).map((month) => {
                                  const payment = gd.payments?.find((p: { month: number }) => p.month === month);
                                  const isPaid = payment?.status === 'PAID';
                                  const isWin = gd.myWins?.includes(month);

                                  return (
                                    <motion.div
                                      key={month}
                                      variants={{
                                        hidden: { opacity: 0, y: 8 },
                                        show: { opacity: 1, y: 0 },
                                      }}
                                      className={cn(
                                        'p-3 rounded-xl border flex items-center gap-2 transition-colors duration-200',
                                        isWin && 'bg-amber-50 border-amber-200',
                                        !isWin && isPaid && 'bg-blue-50 border-blue-200',
                                        !isWin && !isPaid && 'bg-white border-slate-100'
                                      )}
                                    >
                                      <div
                                        className={cn(
                                          'w-8 h-8 rounded-lg flex items-center justify-center shrink-0',
                                          isWin && 'bg-amber-100 text-amber-600',
                                          !isWin && isPaid && 'bg-blue-100 text-blue-600',
                                          !isWin && !isPaid && 'bg-slate-100 text-slate-400'
                                        )}
                                      >
                                        {isWin ? (
                                          <Trophy size={14} />
                                        ) : isPaid ? (
                                          <CheckCircle2 size={14} />
                                        ) : (
                                          <Clock size={14} />
                                        )}
                                      </div>
                                      <div className="min-w-0">
                                        <p className="text-xs font-black text-slate-900">M{month}</p>
                                        <p
                                          className={cn(
                                            'text-[10px] font-bold truncate',
                                            isWin && 'text-amber-600',
                                            !isWin && isPaid && 'text-blue-600',
                                            !isWin && !isPaid && 'text-slate-400'
                                          )}
                                        >
                                          {isWin ? 'Won' : isPaid ? formatCurrency(payment?.amount || 0) : 'Pending'}
                                        </p>
                                      </div>
                                    </motion.div>
                                  );
                                })}
                              </motion.div>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </motion.article>
                  );
                })}
              </div>
            )}
          </section>

          <motion.footer
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="flex items-center justify-center gap-2 pb-6 text-slate-400 text-[10px] font-bold uppercase tracking-widest"
          >
            <Shield size={12} />
            Read-only · ChitFlow
          </motion.footer>
        </main>
    </div>
  );
}
