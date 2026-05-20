'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import {
  CheckCircle2, Clock, Trophy, Layers, IndianRupee,
  LogOut, Phone, ChevronDown, ChevronUp, Loader2,
  TrendingUp, Shield, User, Bell, Send, MessageCircle, Inbox, X
} from 'lucide-react';
import { formatCurrency, cn, formatTimeAgo } from '@/lib/utils';
import { toast } from 'sonner';

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
  const notifContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const stored = localStorage.getItem('memberSession');
    if (!stored) { router.replace('/auth/member/login'); return; }
    const parsed = JSON.parse(stored);
    setSession(parsed);
    fetchDashboard(parsed.memberId);
    fetchNotifications(parsed.memberId);
  }, []);

  useEffect(() => {
    if (!isNotifOpen) return;

    const onPointerDown = (e: MouseEvent | TouchEvent) => {
      const target = e.target as Node;
      if (notifContainerRef.current && !notifContainerRef.current.contains(target)) {
        setIsNotifOpen(false);
      }
    };

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsNotifOpen(false);
    };

    document.body.style.overflow = 'hidden';
    document.addEventListener('mousedown', onPointerDown);
    document.addEventListener('touchstart', onPointerDown);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.body.style.overflow = '';
      document.removeEventListener('mousedown', onPointerDown);
      document.removeEventListener('touchstart', onPointerDown);
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

  const handleLogout = () => {
    localStorage.removeItem('memberSession');
    router.push('/auth/member/login');
  };

  // Global totals
  const totalPaid = groupData.reduce((s, g) => s + g.totalPaid, 0);
  const totalWins = groupData.reduce((s, g) => s + g.myWins.length, 0);
  const totalPending = groupData.reduce((s, g) => s + g.pendingMonths, 0);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-600 flex items-center justify-center font-black text-3xl text-white mx-auto animate-pulse">C</div>
          <Loader2 className="w-8 h-8 text-emerald-500 animate-spin mx-auto" />
          <p className="text-slate-500 text-xs font-bold uppercase tracking-widest">Loading your portal...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white">

      {/* ---- Sticky Header ---- */}
      <header className="sticky top-0 z-50 border-b border-white/10 bg-slate-950/80 backdrop-blur-xl">
        <div className="max-w-4xl mx-auto px-3 sm:px-6 h-14 sm:h-16 flex items-center justify-between gap-2">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-600 flex items-center justify-center font-black text-lg text-white">C</div>
            <div className="hidden sm:block">
              <p className="font-black text-white text-sm leading-tight">ChitFlow</p>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Member Portal</p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 sm:gap-4 min-w-0 shrink">
            <div className="relative" ref={notifContainerRef}>
              <button
                type="button"
                onClick={() => setIsNotifOpen((open) => !open)}
                className="relative p-2 rounded-full bg-white/5 border border-white/10 hover:bg-white/10 transition-all shrink-0"
                aria-label="Messages"
                aria-expanded={isNotifOpen}
              >
                <Bell size={16} className="text-slate-300" />
                {unreadNotifCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 min-w-[14px] h-3.5 px-0.5 bg-emerald-500 text-[8px] font-black text-white rounded-full flex items-center justify-center border border-slate-950">
                    {unreadNotifCount > 9 ? '9+' : unreadNotifCount}
                  </span>
                )}
              </button>
              {isNotifOpen && (
                <>
                  <div className="fixed inset-0 bg-black/50 z-40 sm:hidden" aria-hidden />
                  <div
                    className={cn(
                      'z-50 flex flex-col bg-slate-900 border border-emerald-500/20 rounded-2xl shadow-2xl shadow-emerald-900/30 overflow-hidden',
                      'fixed left-3 right-3 top-[3.5rem] max-h-[min(32rem,calc(100dvh-4.5rem))]',
                      'sm:absolute sm:left-auto sm:right-0 sm:top-full sm:mt-2 sm:w-[min(22rem,calc(100vw-2rem))] sm:max-h-[min(28rem,70dvh)]'
                    )}
                    onMouseDown={(e) => e.stopPropagation()}
                  >
                    <div className="px-4 py-3 bg-gradient-to-r from-emerald-600/20 to-teal-600/10 border-b border-white/10 shrink-0">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <MessageCircle size={16} className="text-emerald-400" />
                          <span className="text-xs font-black text-white">Messages</span>
                          {unreadNotifCount > 0 && (
                            <span className="text-[10px] font-bold bg-emerald-500 text-white px-1.5 py-0.5 rounded-full">
                              {unreadNotifCount}
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          {notifications.length > 0 && messageTab === 'inbox' && (
                            <button
                              type="button"
                              onClick={clearAllMessages}
                              className="text-[10px] font-bold text-red-400 hover:underline"
                            >
                              Clear all
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={() => setIsNotifOpen(false)}
                            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-all"
                            aria-label="Close messages"
                          >
                            <X size={15} />
                          </button>
                        </div>
                      </div>
                      <div className="flex gap-1 mt-3 p-0.5 bg-black/20 rounded-lg">
                        <button
                          onClick={() => setMessageTab('inbox')}
                          className={cn(
                            'flex-1 flex items-center justify-center gap-1 py-1.5 rounded-md text-[10px] font-bold transition-all',
                            messageTab === 'inbox' ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:text-white'
                          )}
                        >
                          <Inbox size={12} /> Inbox
                        </button>
                        <button
                          onClick={() => setMessageTab('send')}
                          className={cn(
                            'flex-1 flex items-center justify-center gap-1 py-1.5 rounded-md text-[10px] font-bold transition-all',
                            messageTab === 'send' ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:text-white'
                          )}
                        >
                          <Send size={12} /> Send
                        </button>
                      </div>
                    </div>

                    {messageTab === 'inbox' ? (
                      <div className="flex-1 overflow-y-auto min-h-[12rem] max-h-64">
                        {notifications.length === 0 ? (
                          <div className="p-10 text-center">
                            <Inbox size={28} className="text-slate-600 mx-auto mb-2" />
                            <p className="text-xs font-bold text-slate-500">No messages from agent yet</p>
                          </div>
                        ) : (
                          notifications.map((n) => (
                            <button
                              key={n.id}
                              onClick={() => markNotifRead(n.id, session?.memberId)}
                              className={cn(
                                'w-full px-4 py-3.5 text-left border-b border-white/5 hover:bg-white/5 transition-colors',
                                !n.read && 'bg-emerald-500/10 border-l-2 border-l-emerald-500'
                              )}
                            >
                              <p className="text-xs font-bold text-white">{n.title}</p>
                              <p className="text-[11px] text-slate-400 mt-1 leading-snug">{n.message}</p>
                              <p className="text-[9px] text-slate-600 mt-1.5 font-bold">{formatTimeAgo(n.createdAt)}</p>
                            </button>
                          ))
                        )}
                      </div>
                    ) : (
                      <div className="p-4 space-y-3 shrink-0">
                        <p className="text-[11px] text-slate-400 leading-relaxed">
                          Send a message to your agent. They will see it in their Messages center.
                        </p>
                        {groupData.length > 1 && (
                          <select
                            value={messageGroupId}
                            onChange={(e) => setMessageGroupId(e.target.value)}
                            className="w-full h-9 rounded-lg bg-white/5 border border-white/10 text-xs text-slate-200 px-2 focus:outline-none focus:ring-1 focus:ring-emerald-500/50"
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
                          className="w-full rounded-xl bg-white/5 border border-white/10 p-3 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 resize-none"
                        />
                        <button
                          onClick={sendMessageToAgent}
                          disabled={isSendingMessage || !memberMessage.trim()}
                          className="w-full h-10 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 disabled:opacity-50 text-white text-sm font-bold flex items-center justify-center gap-2 transition-all shadow-lg shadow-emerald-900/40"
                        >
                          {isSendingMessage ? (
                            <Loader2 size={16} className="animate-spin" />
                          ) : (
                            <Send size={16} />
                          )}
                          Send message
                        </button>
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>
            <div className="hidden sm:flex items-center gap-2 bg-white/5 border border-white/10 rounded-full px-2 sm:px-3 py-1.5 max-w-[140px] md:max-w-none">
              <Phone size={12} className="text-emerald-400 shrink-0" />
              <span className="text-[10px] sm:text-xs font-bold text-slate-300 truncate">{session?.phone}</span>
            </div>
            <button
              type="button"
              onClick={handleLogout}
              className="flex items-center gap-1.5 text-xs font-bold text-slate-400 hover:text-red-400 bg-white/5 hover:bg-red-500/10 border border-white/10 hover:border-red-500/20 px-2 sm:px-3 py-1.5 rounded-full transition-all shrink-0"
            >
              <LogOut size={13} />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </div>
      </header>

      {/* ---- Background orbs ---- */}
      <div className="fixed top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-emerald-600/10 rounded-full blur-[150px]" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-teal-600/10 rounded-full blur-[150px]" />
      </div>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-8 space-y-8 relative z-10">

        {/* ---- Welcome Banner ---- */}
        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-emerald-600/30 to-teal-600/30 border border-emerald-500/20 flex items-center justify-center shrink-0">
              <User size={26} className="text-emerald-400" />
            </div>
            <div>
              <p className="text-slate-400 text-sm font-medium">Welcome back</p>
              <h1 className="text-2xl sm:text-3xl font-black text-white leading-tight">{session?.name}</h1>
            </div>
          </div>
        </motion.div>

        {/* ---- Global Stats ---- */}
        {groupData.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
            className="grid grid-cols-2 sm:grid-cols-4 gap-3"
          >
            {[
              { label: 'Groups', value: groupData.length, icon: <Layers size={18} />, color: 'blue' },
              { label: 'Total Paid', value: formatCurrency(totalPaid), icon: <IndianRupee size={18} />, color: 'emerald', small: true },
              { label: 'Chit Lifts', value: totalWins, icon: <Trophy size={18} />, color: 'amber' },
              { label: 'Pending Months', value: totalPending, icon: <Clock size={18} />, color: 'rose' },
            ].map((stat) => (
              <div
                key={stat.label}
                className={cn(
                  'bg-slate-900/60 backdrop-blur-sm border rounded-2xl p-4 text-center space-y-2',
                  stat.color === 'blue' && 'border-blue-500/20',
                  stat.color === 'emerald' && 'border-emerald-500/20',
                  stat.color === 'amber' && 'border-amber-500/20',
                  stat.color === 'rose' && 'border-rose-500/20',
                )}
              >
                <div className={cn(
                  'w-9 h-9 rounded-xl flex items-center justify-center mx-auto',
                  stat.color === 'blue' && 'bg-blue-500/20 text-blue-400',
                  stat.color === 'emerald' && 'bg-emerald-500/20 text-emerald-400',
                  stat.color === 'amber' && 'bg-amber-500/20 text-amber-400',
                  stat.color === 'rose' && 'bg-rose-500/20 text-rose-400',
                )}>
                  {stat.icon}
                </div>
                <p className={cn('font-black text-white', stat.small ? 'text-base' : 'text-2xl')}>{stat.value}</p>
                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">{stat.label}</p>
              </div>
            ))}
          </motion.div>
        )}

        {/* ---- Group Cards ---- */}
        {groupData.length === 0 ? (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-20 border-2 border-dashed border-white/10 rounded-3xl">
            <Layers size={48} className="text-slate-700 mx-auto mb-4" />
            <p className="text-slate-400 font-bold text-lg">Not enrolled in any group yet.</p>
            <p className="text-slate-600 text-sm mt-1">Contact your agent to get started.</p>
          </motion.div>
        ) : (
          <div className="space-y-4">
            {groupData.map((gd, idx) => {
              const isExpanded = expandedGroup === gd.group.id;
              const completionPct = Math.min(Math.round((gd.paidCount / gd.group.duration) * 100), 100);

              return (
                <motion.div
                  key={gd.group.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.15 + idx * 0.08 }}
                  className="bg-slate-900/60 backdrop-blur-sm border border-white/10 rounded-3xl overflow-hidden"
                >
                  {/* Card header — click to expand */}
                  <button
                    onClick={() => setExpandedGroup(isExpanded ? null : gd.group.id)}
                    className="w-full p-5 sm:p-6 flex items-center justify-between gap-4 hover:bg-white/5 transition-colors text-left"
                  >
                    <div className="flex items-center gap-4 min-w-0">
                      <div className="w-11 h-11 rounded-2xl bg-emerald-500/20 border border-emerald-500/20 flex items-center justify-center shrink-0">
                        <Layers size={20} className="text-emerald-400" />
                      </div>
                      <div className="min-w-0">
                        <p className="font-black text-white text-base leading-tight truncate">{gd.group.name}</p>
                        <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 mt-1">
                          <span className="text-[10px] text-slate-400 font-bold">{formatCurrency(gd.group.totalAmount)} pool</span>
                          <span className="text-[10px] text-slate-600">·</span>
                          <span className="text-[10px] text-slate-400 font-bold">{gd.group.duration} months</span>
                          {gd.myWins.length > 0 && (
                            <span className="text-[10px] text-amber-400 font-bold flex items-center gap-1">
                              <Trophy size={10} /> Won M{gd.myWins.join(', M')}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      <div className="text-right hidden sm:block">
                        <p className="text-sm font-black text-white">{gd.paidCount}<span className="text-slate-500 font-medium">/{gd.group.duration}</span></p>
                        <p className="text-[10px] text-slate-500 font-bold uppercase">months paid</p>
                      </div>
                      <div className={cn('w-8 h-8 rounded-xl flex items-center justify-center border transition-all', isExpanded ? 'bg-emerald-500/20 border-emerald-500/30 text-emerald-400' : 'bg-white/5 border-white/10 text-slate-500')}>
                        {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                      </div>
                    </div>
                  </button>

                  {/* Progress Bar */}
                  <div className="px-5 sm:px-6 pb-4">
                    <div className="flex justify-between items-center mb-1.5">
                      <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">{completionPct}% complete</p>
                      <p className="text-[10px] text-slate-500 font-bold">{gd.pendingMonths} pending</p>
                    </div>
                    <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${completionPct}%` }}
                        transition={{ duration: 0.8, delay: 0.3 + idx * 0.08 }}
                        className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full"
                      />
                    </div>
                  </div>

                  {/* Expanded: monthly payment history */}
                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        className="overflow-hidden border-t border-white/10"
                      >
                        <div className="p-5 sm:p-6">
                          <div className="flex items-center gap-2 mb-4">
                            <TrendingUp size={14} className="text-emerald-400" />
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Monthly Payment History</p>
                          </div>

                          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 sm:gap-3">
                            {Array.from({ length: gd.group.duration }, (_, i) => i + 1).map(month => {
                              const payment = gd.payments.find((p: any) => p.month === month);
                              const isPaid = payment?.status === 'PAID';
                              const isWin = gd.myWins.includes(month);

                              return (
                                <div
                                  key={month}
                                  className={cn(
                                    'p-3 rounded-2xl border flex items-center gap-2.5 transition-all',
                                    isWin
                                      ? 'bg-amber-500/10 border-amber-500/30'
                                      : isPaid
                                      ? 'bg-emerald-500/10 border-emerald-500/30'
                                      : 'bg-white/5 border-white/5'
                                  )}
                                >
                                  <div className={cn(
                                    'w-8 h-8 rounded-xl flex items-center justify-center shrink-0',
                                    isWin ? 'bg-amber-500/20' : isPaid ? 'bg-emerald-500/20' : 'bg-white/10'
                                  )}>
                                    {isWin
                                      ? <Trophy size={14} className="text-amber-400" />
                                      : isPaid
                                      ? <CheckCircle2 size={14} className="text-emerald-400" />
                                      : <Clock size={14} className="text-slate-600" />
                                    }
                                  </div>
                                  <div className="min-w-0">
                                    <p className="text-xs font-black text-white leading-tight">M{month}</p>
                                    <p className={cn('text-[10px] font-bold leading-tight',
                                      isWin ? 'text-amber-400' : isPaid ? 'text-emerald-400' : 'text-slate-600'
                                    )}>
                                      {isWin ? 'Won 🏆' : isPaid ? formatCurrency(payment?.amount || 0) : 'Pending'}
                                    </p>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              );
            })}
          </div>
        )}

        {/* Footer */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}
          className="flex items-center justify-center gap-2 pt-4 pb-8 text-slate-700 text-[10px] font-bold uppercase tracking-widest"
        >
          <Shield size={12} />
          Read-only view · Powered by ChitFlow
        </motion.div>

      </main>
    </div>
  );
}
