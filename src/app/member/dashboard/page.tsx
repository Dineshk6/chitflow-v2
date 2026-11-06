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
  Send,
  MessageCircle,
  Inbox,
  X,
  Search,
  Wallet,
  Bell,
  Download,
} from 'lucide-react';
import { formatCurrency, cn, formatTimeAgo } from '@/lib/utils';
import { toast } from 'sonner';
import { clearAllAuthSessions } from '@/lib/auth-client';
import { openWhatsApp } from '@/lib/whatsapp';
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
      <rect width="44" height="44" rx="12" fill="url(#dbMarkGrad)" />
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
  const [pendingOnly, setPendingOnly] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [confirmLogout, setConfirmLogout] = useState(false);

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
      setMessageTab('inbox');
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

  const filteredGroups = groupData.filter((g) => {
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

  const nextDue = (gd: any) => {
    const duration = gd.group?.duration ?? 0;
    const paidMonths = new Set(
      (gd.payments ?? []).filter((p: { status: string }) => p.status === 'PAID').map((p: { month: number }) => p.month)
    );
    for (let month = 1; month <= duration; month += 1) {
      if (!paidMonths.has(month)) {
        return { month, amount: gd.group?.monthlyContribution || 0 };
      }
    }
    return null;
  };

  const whatsappAgent = (gd: any, note?: string) => {
    const phone = gd.agent?.phone;
    if (!phone) {
      toast.error('Your agent has not saved a mobile number');
      return;
    }
    const due = nextDue(gd);
    const lines = [
      `Hi ${gd.agent?.name || ''},`.trim(),
      `This is ${session?.name || 'a member'}${session?.phone ? ` (${session.phone})` : ''} from *${gd.group?.name}*.`,
    ];
    if (note) lines.push('', note);
    else if (due) lines.push('', `My next due is month ${due.month} (${formatCurrency(due.amount)}).`);
    openWhatsApp(phone, lines.filter(Boolean).join('\n'));
  };

  const statementLines = (gd: any) => {
    const duration = gd.group?.duration ?? 0;
    const due = nextDue(gd);
    return [
      gd.group?.name || 'Chit group',
      `Member: ${session?.name || ''}`,
      `Mobile: ${session?.phone || ''}`,
      `Agent: ${gd.agent?.name || ''}${gd.agent?.phone ? ` (${gd.agent.phone})` : ''}`,
      `Paid months: ${getPaidCount(gd)} of ${duration}`,
      due ? `Next due: month ${due.month} · ${formatCurrency(due.amount)}` : 'All months paid',
      '',
      ...Array.from({ length: duration }, (_, i) => {
        const month = i + 1;
        const payment = gd.payments?.find((p: { month: number }) => p.month === month);
        const paid = payment?.status === 'PAID';
        const won = gd.myWins?.includes(month);
        return `M${month}: ${won ? 'Winner' : paid ? 'Paid' : 'Pending'} · ${formatCurrency(paid ? payment?.amount || gd.group?.monthlyContribution || 0 : gd.group?.monthlyContribution || 0)}`;
      }),
    ];
  };

  const downloadStatement = (gd: any) => {
    const lines = statementLines(gd);
    const blob = new Blob([lines.join('\n')], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${(gd.group?.name || 'chit').replace(/\s+/g, '-')}-statement.txt`;
    document.body.appendChild(link);
    link.click();
    setTimeout(() => {
      link.remove();
      URL.revokeObjectURL(url);
    }, 1500);
  };

  const messageTarget = () => {
    if (messageGroupId) return groupData.find((g) => g.group.id === messageGroupId);
    if (groupData.length === 1) return groupData[0];
    return null;
  };

  if (isLoading) {
    return <MemberDashboardSkeleton />;
  }

  return (
    <div className="min-h-screen bg-[#f1f5f9] text-slate-800 font-sans antialiased pb-[calc(5.5rem+env(safe-area-inset-bottom))]">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/80 safe-top">
        <div className="max-w-3xl mx-auto px-4 h-14 sm:h-16 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 min-w-0">
            <ChitFlowMark size={34} />
            <div className="min-w-0">
              <p className="font-bold text-[15px] tracking-tight text-slate-900 leading-none">ChitFlow</p>
              <p className="text-[11px] font-semibold text-slate-500 mt-0.5 truncate">Hi, {session?.name?.split(' ')[0]}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setIsNotifOpen(true)}
              className="relative h-10 w-10 rounded-xl bg-slate-50 border border-slate-200 text-slate-600 hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200 transition-all flex items-center justify-center"
              aria-label="Messages"
            >
              <Bell size={18} />
              {unreadNotifCount > 0 && (
                <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-rose-500 text-white text-[10px] font-bold flex items-center justify-center">
                  {unreadNotifCount > 9 ? '9+' : unreadNotifCount}
                </span>
              )}
            </button>
            <button
              type="button"
              onClick={() => setConfirmLogout(true)}
              className="h-10 px-3 rounded-xl bg-slate-50 hover:bg-rose-50 hover:text-rose-600 border border-slate-200 text-slate-600 font-semibold text-xs flex items-center gap-1.5 transition-all"
            >
              <LogOut size={14} />
              <span className="hidden xs:inline sm:inline">Logout</span>
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 pt-5 sm:pt-7 space-y-5">
        {/* Profile strip */}
        <section className="bg-white rounded-2xl border border-slate-200/80 p-4 sm:p-5 shadow-sm">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 text-white text-lg font-bold flex items-center justify-center shrink-0 shadow-md shadow-blue-600/20">
              {(session?.name || 'M').charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-semibold text-emerald-600 flex items-center gap-1">
                <CheckCircle2 size={12} /> Verified member
              </p>
              <h1 className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight truncate mt-0.5">
                {session?.name}
              </h1>
              <p className="text-sm text-slate-500 font-medium mt-0.5 flex items-center gap-1.5">
                <Phone size={13} className="text-slate-400" />
                {session?.phone}
              </p>
            </div>
          </div>
        </section>

        {/* Stats — always readable grid */}
        <section className="grid grid-cols-3 gap-2.5 sm:gap-3">
          {[
            {
              label: 'Paid',
              value: formatCurrency(totalPaid),
              icon: Wallet,
              tone: 'bg-blue-50 text-blue-600 border-blue-100',
            },
            {
              label: 'Groups',
              value: String(groupData.length),
              icon: Layers,
              tone: 'bg-slate-50 text-slate-600 border-slate-200',
            },
            {
              label: 'Wins',
              value: String(totalWins),
              icon: Trophy,
              tone: 'bg-amber-50 text-amber-600 border-amber-100',
            },
          ].map((stat) => (
            <div
              key={stat.label}
              className="bg-white rounded-2xl border border-slate-200/80 p-3 sm:p-4 shadow-sm"
            >
              <div className={cn('w-8 h-8 rounded-xl border flex items-center justify-center', stat.tone)}>
                <stat.icon size={15} />
              </div>
              <p className="text-[11px] sm:text-xs font-semibold text-slate-500 mt-2.5">{stat.label}</p>
              <p className="text-sm sm:text-base font-bold text-slate-900 mt-0.5 truncate leading-tight">
                {stat.value}
              </p>
            </div>
          ))}
        </section>

        {/* Search + filters */}
        <section className="space-y-3">
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input
              type="text"
              placeholder="Search your groups..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-11 pl-10 pr-10 rounded-xl bg-white border border-slate-200 text-sm font-medium text-slate-800 placeholder:text-slate-400 outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 shadow-sm"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X size={14} />
              </button>
            )}
          </div>

          <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-0.5">
            {([
              { id: 'ALL', label: 'All' },
              { id: 'ACTIVE', label: 'Active' },
              { id: 'WON', label: 'Won' },
            ] as const).map((st) => (
              <button
                key={st.id}
                type="button"
                onClick={() => setFilterStatus(st.id)}
                className={cn(
                  'h-9 px-4 rounded-full text-sm font-semibold whitespace-nowrap transition-all border',
                  filterStatus === st.id
                    ? 'bg-blue-600 text-white border-blue-600 shadow-sm shadow-blue-600/20'
                    : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300'
                )}
              >
                {st.label}
              </button>
            ))}
          </div>
        </section>

        {/* Groups */}
        <section className="space-y-3">
          <div className="flex items-center justify-between px-0.5">
            <h2 className="text-sm font-bold text-slate-900">Your chit groups</h2>
            <span className="text-xs font-semibold text-slate-500">{filteredGroups.length}</span>
          </div>

          {filteredGroups.length === 0 ? (
            <div className="bg-white border border-dashed border-slate-200 rounded-2xl py-14 px-6 text-center">
              <div className="w-12 h-12 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-center mx-auto mb-3">
                <Inbox size={22} className="text-slate-400" />
              </div>
              <h3 className="text-sm font-bold text-slate-800">No groups found</h3>
              <p className="text-sm text-slate-500 mt-1">
                {searchQuery ? 'Try a different search.' : 'Your enrolled groups will show up here.'}
              </p>
            </div>
          ) : (
            filteredGroups.map((gd) => {
              const isExpanded = expandedGroup === gd.group.id;
              const duration = gd.group?.duration ?? 0;
              const paidCount = getPaidCount(gd);
              const pending =
                typeof gd.pendingMonths === 'number' ? gd.pendingMonths : Math.max(0, duration - paidCount);
              const pct = duration > 0 ? Math.min(Math.round((paidCount / duration) * 100), 100) : 0;
              const hasWon = gd.myWins?.length > 0;
              const monthly = gd.group?.monthlyContribution || 0;

              return (
                <article
                  key={gd.group.id}
                  className={cn(
                    'bg-white rounded-2xl border overflow-hidden shadow-sm transition-all',
                    isExpanded ? 'border-blue-300 ring-2 ring-blue-500/10' : 'border-slate-200/80'
                  )}
                >
                  <button
                    type="button"
                    onClick={() => setExpandedGroup(isExpanded ? null : gd.group.id)}
                    className="w-full text-left p-4 sm:p-5"
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-11 h-11 rounded-xl bg-blue-50 border border-blue-100 text-blue-600 flex items-center justify-center shrink-0 font-bold text-sm">
                        {String(gd.group.name || 'G').charAt(0).toUpperCase()}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0">
                            <h3 className="font-bold text-[15px] sm:text-base text-slate-900 truncate">
                              {gd.group.name}
                            </h3>
                            <p className="text-xs sm:text-sm text-slate-500 font-medium mt-0.5">
                              {formatCurrency(gd.group.totalAmount)} · {duration} mo
                            </p>
                          </div>
                          <ChevronDown
                            size={18}
                            className={cn(
                              'text-slate-400 shrink-0 mt-0.5 transition-transform',
                              isExpanded && 'rotate-180 text-blue-600'
                            )}
                          />
                        </div>

                        <div className="flex flex-wrap gap-1.5 mt-2.5">
                          {hasWon && (
                            <span className="inline-flex items-center gap-1 text-[11px] font-bold bg-amber-50 text-amber-700 border border-amber-100 px-2 py-0.5 rounded-lg">
                              <Trophy size={11} /> Won M{gd.myWins.join(', M')}
                            </span>
                          )}
                          <span className="inline-flex items-center text-[11px] font-semibold bg-slate-50 text-slate-600 border border-slate-200 px-2 py-0.5 rounded-lg">
                            {formatCurrency(monthly)}/mo
                          </span>
                          <span
                            className={cn(
                              'inline-flex items-center text-[11px] font-semibold px-2 py-0.5 rounded-lg border',
                              pending === 0
                                ? 'bg-emerald-50 text-emerald-700 border-emerald-100'
                                : 'bg-blue-50 text-blue-700 border-blue-100'
                            )}
                          >
                            {paidCount}/{duration} paid
                          </span>
                          {(() => {
                            const due = nextDue(gd);
                            if (!due) return null;
                            return (
                              <span className="inline-flex items-center text-[11px] font-semibold bg-slate-900 text-white px-2 py-0.5 rounded-lg">
                                Due M{due.month} · {formatCurrency(due.amount)}
                              </span>
                            );
                          })()}
                        </div>
                      </div>
                    </div>

                    <div className="mt-3.5">
                      <div className="flex items-center justify-between text-[11px] font-semibold text-slate-500 mb-1.5">
                        <span>Progress</span>
                        <span>{pct}%</span>
                      </div>
                      <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-blue-500 to-indigo-500 transition-all"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                      {pending > 0 && (
                        <p className="mt-2 text-xs font-semibold text-slate-700">
                          Still to pay {formatCurrency(pending * monthly)}
                        </p>
                      )}
                    </div>
                  </button>

                  <AnimatePresence initial={false}>
                    {isExpanded && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.22 }}
                        className="border-t border-slate-100 bg-slate-50/60"
                      >
                        <div className="p-4 sm:p-5 space-y-3">
                          <div className="rounded-2xl border border-slate-200 bg-white p-3.5">
                            <div className="min-w-0">
                              <p className="text-xs font-medium text-slate-500">Agent</p>
                              <p className="truncate text-base font-semibold text-slate-900">{gd.agent?.name || 'Agent'}</p>
                              {gd.agent?.phone && (
                                <p className="text-sm text-slate-500">{gd.agent.phone}</p>
                              )}
                            </div>
                            <div className="mt-3 grid grid-cols-2 gap-2">
                              <button
                                type="button"
                                onClick={() => whatsappAgent(gd)}
                                className="flex h-11 items-center justify-center gap-1.5 rounded-xl bg-[#25D366] text-sm font-semibold text-white"
                              >
                                <MessageCircle size={16} />
                                WhatsApp
                              </button>
                              {gd.agent?.phone ? (
                                <a
                                  href={`tel:${gd.agent.phone}`}
                                  className="flex h-11 items-center justify-center gap-1.5 rounded-xl bg-slate-900 text-sm font-semibold text-white"
                                >
                                  <Phone size={16} />
                                  Call
                                </a>
                              ) : (
                                <button
                                  type="button"
                                  onClick={() => {
                                    setMessageGroupId(gd.group.id);
                                    setMessageTab('send');
                                    setIsNotifOpen(true);
                                  }}
                                  className="flex h-11 items-center justify-center gap-1.5 rounded-xl bg-blue-600 text-sm font-semibold text-white"
                                >
                                  <Send size={16} />
                                  Message
                                </button>
                              )}
                              <button
                                type="button"
                                onClick={() => downloadStatement(gd)}
                                className="flex h-11 items-center justify-center gap-1.5 rounded-xl border border-slate-200 bg-slate-50 text-sm font-semibold text-slate-800"
                              >
                                <Download size={16} />
                                Save
                              </button>
                              <button
                                type="button"
                                onClick={() => whatsappAgent(gd, statementLines(gd).join('\n'))}
                                className="flex h-11 items-center justify-center gap-1.5 rounded-xl border border-slate-200 bg-slate-50 text-sm font-semibold text-slate-800"
                              >
                                <Send size={16} />
                                Share
                              </button>
                            </div>
                            <div className="mt-2 grid grid-cols-3 gap-2">
                              {[
                                ['I paid', 'I have paid this month. Please confirm.'],
                                ['My due', 'What is my pending amount?'],
                                ['Call me', 'Please call me when you are free.'],
                              ].map(([label, prompt]) => (
                                <button
                                  key={label}
                                  type="button"
                                  onClick={() => whatsappAgent(gd, prompt)}
                                  className="h-10 rounded-xl border border-slate-200 bg-white px-1 text-xs font-semibold text-slate-700"
                                >
                                  {label}
                                </button>
                              ))}
                            </div>
                          </div>

                          {Array.isArray(gd.lifts) && gd.lifts.length > 0 && (
                            <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
                              {gd.lifts.map((lift: { month: number; name: string; mine?: boolean }) => (
                                <span
                                  key={lift.month}
                                  className="shrink-0 rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-800"
                                >
                                  M{lift.month} · {lift.mine ? 'You' : lift.name}
                                </span>
                              ))}
                            </div>
                          )}

                          <div className="flex items-center justify-between gap-2">
                            <h4 className="text-sm font-bold text-slate-800">Payment schedule</h4>
                            <button
                              type="button"
                              onClick={() => setPendingOnly((v) => !v)}
                              className={cn(
                                'h-8 rounded-full px-3 text-xs font-semibold',
                                pendingOnly ? 'bg-slate-900 text-white' : 'bg-white text-slate-600 border border-slate-200'
                              )}
                            >
                              {pendingOnly ? 'Pending only' : 'All months'}
                            </button>
                          </div>

                          {/* Mobile-friendly list */}
                          <div className="space-y-2">
                            {Array.from({ length: duration }, (_, i) => i + 1)
                              .filter((month) => {
                                if (!pendingOnly) return true;
                                const payment = gd.payments?.find((p: { month: number }) => p.month === month);
                                return payment?.status !== 'PAID';
                              })
                              .map((month) => {
                              const payment = gd.payments?.find((p: { month: number }) => p.month === month);
                              const isPaid = payment?.status === 'PAID';
                              const isWin = gd.myWins?.includes(month);

                              return (
                                <div
                                  key={month}
                                  className={cn(
                                    'flex items-center gap-3 rounded-xl border px-3.5 py-3',
                                    isWin
                                      ? 'bg-amber-50 border-amber-200'
                                      : isPaid
                                        ? 'bg-white border-slate-200'
                                        : 'bg-white/70 border-slate-200/80'
                                  )}
                                >
                                  <div
                                    className={cn(
                                      'w-9 h-9 rounded-lg flex items-center justify-center text-xs font-bold shrink-0',
                                      isWin
                                        ? 'bg-amber-100 text-amber-700'
                                        : isPaid
                                          ? 'bg-emerald-50 text-emerald-700'
                                          : 'bg-slate-100 text-slate-500'
                                    )}
                                  >
                                    M{month}
                                  </div>
                                  <div className="min-w-0 flex-1">
                                    <p className="text-sm font-semibold text-slate-900">
                                      {isWin ? 'Winner this month' : isPaid ? 'Paid' : 'Pending'}
                                    </p>
                                    <p className="text-xs text-slate-500 font-medium mt-0.5">
                                      {isPaid
                                        ? formatCurrency(payment?.amount || monthly)
                                        : `Due ${formatCurrency(monthly)}`}
                                    </p>
                                  </div>
                                  {isWin ? (
                                    <Trophy size={16} className="text-amber-600 shrink-0" />
                                  ) : isPaid ? (
                                    <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
                                  ) : (
                                    <Clock size={16} className="text-slate-400 shrink-0" />
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </article>
              );
            })
          )}
        </section>
      </main>

      {/* Mobile bottom action bar */}
      <div className="fixed bottom-0 inset-x-0 z-50 border-t border-slate-200 bg-white/95 backdrop-blur-md pb-[env(safe-area-inset-bottom)]">
        <div className="max-w-3xl mx-auto px-4 h-16 flex items-center gap-3">
          <button
            type="button"
            onClick={() => {
              setMessageTab('inbox');
              setIsNotifOpen(true);
            }}
            className="relative flex-1 h-11 rounded-xl bg-slate-900 text-white font-semibold text-sm flex items-center justify-center gap-2 active:scale-[0.98] transition-transform"
          >
            <MessageCircle size={17} />
            Messages
            {unreadNotifCount > 0 && (
              <span className="absolute top-1.5 right-3 min-w-[18px] h-[18px] px-1 rounded-full bg-rose-500 text-[10px] font-bold flex items-center justify-center">
                {unreadNotifCount > 9 ? '9+' : unreadNotifCount}
              </span>
            )}
          </button>
          <button
            type="button"
            onClick={() => {
              setMessageTab('send');
              setIsNotifOpen(true);
            }}
            className="h-11 px-4 rounded-xl bg-blue-600 text-white font-semibold text-sm flex items-center justify-center gap-2 shadow-md shadow-blue-600/20 active:scale-[0.98] transition-transform"
          >
            <Send size={16} />
            Ask agent
          </button>
        </div>
      </div>

      {/* Messages sheet */}
      <AnimatePresence>
        {isNotifOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-slate-900/40 backdrop-blur-[2px] z-[60]"
              onClick={() => setIsNotifOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, y: '100%' }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: '100%' }}
              transition={{ type: 'spring', damping: 28, stiffness: 280 }}
              className="fixed inset-x-0 bottom-0 z-[70] max-w-lg mx-auto bg-white rounded-t-3xl shadow-2xl border border-slate-200 flex flex-col"
              style={{ height: 'min(88dvh, 640px)' }}
            >
              <div className="flex justify-center pt-3 pb-1">
                <div className="w-10 h-1 rounded-full bg-slate-200" />
              </div>

              <div className="px-4 pb-3 flex items-center justify-between">
                <div>
                  <h3 className="text-base font-bold text-slate-900">Messages</h3>
                  <p className="text-xs text-slate-500 font-medium">Talk with your agent</p>
                </div>
                <button
                  type="button"
                  onClick={() => setIsNotifOpen(false)}
                  className="h-9 w-9 rounded-xl bg-slate-100 text-slate-500 flex items-center justify-center"
                >
                  <X size={16} />
                </button>
              </div>

              <div className="mx-4 mb-3 flex p-1 rounded-xl bg-slate-100 gap-1">
                {(['inbox', 'send'] as const).map((tab) => (
                  <button
                    key={tab}
                    type="button"
                    onClick={() => setMessageTab(tab)}
                    className={cn(
                      'flex-1 h-9 rounded-lg text-sm font-semibold transition-all',
                      messageTab === tab
                        ? 'bg-white text-slate-900 shadow-sm'
                        : 'text-slate-500'
                    )}
                  >
                    {tab === 'inbox' ? `Inbox${unreadNotifCount ? ` (${unreadNotifCount})` : ''}` : 'New'}
                  </button>
                ))}
              </div>

              <div className="flex-1 overflow-y-auto px-4 pb-6">
                {messageTab === 'inbox' ? (
                  <div className="space-y-2.5">
                    {notifications.length === 0 ? (
                      <div className="py-16 text-center">
                        <Inbox size={28} className="text-slate-300 mx-auto mb-2" />
                        <p className="text-sm font-semibold text-slate-600">No messages yet</p>
                        <p className="text-xs text-slate-400 mt-1">Updates from your agent appear here.</p>
                      </div>
                    ) : (
                      notifications.map((n) => (
                        <button
                          key={n.id}
                          type="button"
                          onClick={() => markNotifRead(n.id)}
                          className={cn(
                            'w-full text-left p-3.5 rounded-xl border transition-all',
                            !n.read
                              ? 'bg-blue-50/70 border-blue-200'
                              : 'bg-white border-slate-200'
                          )}
                        >
                          <div className="flex items-center justify-between gap-2">
                            <span className="text-sm font-bold text-slate-900 truncate">{n.title}</span>
                            {!n.read && <span className="w-2 h-2 rounded-full bg-blue-600 shrink-0" />}
                          </div>
                          <p className="text-sm text-slate-600 mt-1 leading-relaxed">{n.message}</p>
                          <span className="text-xs text-slate-400 mt-2 block">{formatTimeAgo(n.createdAt)}</span>
                        </button>
                      ))
                    )}
                  </div>
                ) : (
                  <div className="space-y-4 pt-1">
                    <p className="text-sm text-slate-500 leading-relaxed">
                      Send a message to your circle administrator.
                    </p>

                    {groupData.length > 1 && (
                      <div>
                        <label className="text-xs font-semibold text-slate-600 block mb-1.5">Group</label>
                        <select
                          value={messageGroupId}
                          onChange={(e) => setMessageGroupId(e.target.value)}
                          className="w-full h-11 rounded-xl bg-white border border-slate-200 text-sm font-medium text-slate-800 px-3 outline-none focus:ring-2 focus:ring-blue-500/20"
                        >
                          <option value="">General inquiry</option>
                          {groupData.map((gd) => (
                            <option key={gd.group.id} value={gd.group.id}>
                              {gd.group.name}
                            </option>
                          ))}
                        </select>
                      </div>
                    )}

                    <div>
                      <label className="text-xs font-semibold text-slate-600 block mb-1.5">Message</label>
                      <textarea
                        value={memberMessage}
                        onChange={(e) => setMemberMessage(e.target.value)}
                        placeholder="Write your question..."
                        rows={5}
                        className="w-full rounded-xl bg-white border border-slate-200 p-3.5 text-sm text-slate-800 placeholder:text-slate-400 outline-none focus:ring-2 focus:ring-blue-500/20 resize-none"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={sendMessageToAgent}
                        disabled={isSendingMessage || !memberMessage.trim()}
                        className="h-11 rounded-xl bg-blue-600 disabled:opacity-50 text-white text-sm font-bold flex items-center justify-center gap-2"
                      >
                        {isSendingMessage ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
                        In app
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          const gd = messageTarget();
                          if (!gd) {
                            toast.error('Choose a group first');
                            return;
                          }
                          if (!memberMessage.trim()) {
                            toast.error('Type a message first');
                            return;
                          }
                          whatsappAgent(gd, memberMessage.trim());
                        }}
                        className="h-11 rounded-xl bg-[#25D366] text-white text-sm font-bold flex items-center justify-center gap-2"
                      >
                        <MessageCircle size={16} />
                        WhatsApp
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {confirmLogout && (
        <div className="fixed inset-0 z-[80] flex items-end justify-center bg-slate-900/40 p-4 sm:items-center">
          <div className="w-full max-w-sm rounded-3xl bg-white p-5 shadow-xl" role="dialog" aria-modal="true" aria-labelledby="logout-title">
            <h2 id="logout-title" className="text-lg font-semibold text-slate-900">Log out?</h2>
            <p className="mt-1 text-sm text-slate-600">You will need your mobile number to sign in again.</p>
            <div className="mt-5 grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setConfirmLogout(false)}
                className="h-11 rounded-xl border border-slate-200 text-sm font-semibold text-slate-700"
              >
                Stay
              </button>
              <button
                type="button"
                onClick={handleLogout}
                className="h-11 rounded-xl bg-slate-900 text-sm font-semibold text-white"
              >
                Log out
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
