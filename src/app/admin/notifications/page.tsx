'use client';

import React, { useState, useEffect, useMemo } from 'react';
import AdminLayout from '@/components/layout/AdminLayout';
import { cn, formatTimeAgo } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Bell,
  Send,
  Search,
  CheckCircle2,
  AlertCircle,
  Info,
  Loader2,
  Inbox,
  User,
  MessageCircle,
  Megaphone,
  Trash2,
  Check,
} from 'lucide-react';
import { toast } from 'sonner';

type NotificationItem = {
  id: string;
  title: string;
  message: string;
  type: string;
  read: boolean;
  createdAt: string;
};

type GroupOption = { id: string; name: string };

type FilterTab = 'all' | 'unread' | 'members' | 'sent';

function getNotificationBadge(type: string) {
  switch (type) {
    case 'member_message':
      return {
        icon: <User size={16} />,
        label: 'Member',
        styles: 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20',
        avatarBg: 'from-purple-500 to-indigo-500',
      };
    case 'success':
      return {
        icon: <CheckCircle2 size={16} />,
        label: 'Success',
        styles: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20',
        avatarBg: 'from-emerald-500 to-teal-500',
      };
    case 'warning':
      return {
        icon: <AlertCircle size={16} />,
        label: 'Warning',
        styles: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20',
        avatarBg: 'from-amber-500 to-orange-500',
      };
    case 'error':
      return {
        icon: <AlertCircle size={16} />,
        label: 'Error',
        styles: 'bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20',
        avatarBg: 'from-red-500 to-rose-500',
      };
    case 'auction':
      return {
        icon: <Megaphone size={16} />,
        label: 'Auction',
        styles: 'bg-pink-500/10 text-pink-600 dark:text-pink-400 border-pink-500/20',
        avatarBg: 'from-pink-500 to-rose-500',
      };
    default:
      return {
        icon: <Info size={16} />,
        label: 'Info',
        styles: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20',
        avatarBg: 'from-blue-500 to-cyan-500',
      };
  }
}

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [groups, setGroups] = useState<GroupOption[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<FilterTab>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isClearingAll, setIsClearingAll] = useState(false);

  const [broadcastGroupId, setBroadcastGroupId] = useState('all');
  const [broadcastTitle, setBroadcastTitle] = useState('');
  const [broadcastMessage, setBroadcastMessage] = useState('');
  const [broadcastType, setBroadcastType] = useState('info');
  const [isSending, setIsSending] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [notifRes, groupsRes] = await Promise.all([
        fetch('/api/notifications'),
        fetch('/api/groups'),
      ]);
      const notifData = await notifRes.json();
      const groupsData = await groupsRes.json();

      if (notifRes.ok) {
        setNotifications(Array.isArray(notifData) ? notifData : []);
      }
      if (groupsRes.ok) {
        setGroups(Array.isArray(groupsData) ? groupsData : []);
      }
    } catch {
      toast.error('Failed to load messages');
    } finally {
      setIsLoading(false);
    }
  };

  const filteredNotifications = useMemo(() => {
    return notifications.filter((n) => {
      const matchesSearch =
        n.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        n.message.toLowerCase().includes(searchQuery.toLowerCase());
      if (!matchesSearch) return false;
      if (filter === 'unread') return !n.read;
      if (filter === 'members') return n.type === 'member_message';
      if (filter === 'sent') return n.type !== 'member_message';
      return true;
    });
  }, [notifications, filter, searchQuery]);

  const unreadCount = notifications.filter((n) => !n.read).length;
  const memberMsgCount = notifications.filter((n) => n.type === 'member_message' && !n.read).length;

  const markAsRead = async (id: string) => {
    try {
      await fetch('/api/notifications', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      });
      setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
      toast.success('Marked as read');
    } catch {
      toast.error('Could not mark as read');
    }
  };

  const clearAllMessages = async () => {
    if (notifications.length === 0) return;
    if (!window.confirm('Delete all messages from your inbox? This cannot be undone.')) return;

    setIsClearingAll(true);
    setNotifications([]);
    try {
      const res = await fetch('/api/notifications', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ clearAll: true }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || 'Failed');
      }
      toast.success('All messages cleared');
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Failed to clear messages');
      fetchData();
    } finally {
      setIsClearingAll(false);
    }
  };

  const sendBroadcast = async () => {
    if (!broadcastTitle.trim() || !broadcastMessage.trim()) {
      toast.error('Enter a title and message');
      return;
    }
    setIsSending(true);
    try {
      const res = await fetch('/api/admin/notifications/broadcast', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          groupId: broadcastGroupId,
          title: broadcastTitle,
          message: broadcastMessage,
          type: broadcastType,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed');
      toast.success(data.message || 'Message sent to members');
      setBroadcastTitle('');
      setBroadcastMessage('');
      fetchData();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Failed to send message');
    } finally {
      setIsSending(false);
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6 w-full min-w-0 pb-10">
        
        {/* Modern Vibrant Hero Banner */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-600 via-indigo-700 to-blue-800 p-6 md:p-8 text-white shadow-xl shadow-indigo-500/10">
          {/* Glowing background blob */}
          <div className="absolute top-0 right-0 w-[300px] h-[300px] bg-white/10 rounded-full blur-[80px] -z-0" />
          <div className="absolute bottom-0 left-10 w-[200px] h-[200px] bg-white/10 rounded-full blur-[60px] -z-0" />

          <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div className="space-y-2 max-w-xl">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/15 border border-white/25 text-white text-xs font-bold uppercase tracking-wider">
                <Bell size={12} className="animate-pulse" />
                Admin Communications Console
              </div>
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-black tracking-tight leading-none text-white font-sans">
                Messages Workspace
              </h1>
              <p className="text-indigo-100 text-xs sm:text-sm font-medium leading-relaxed">
                Connect with your members instantly. Dispatch targeted notifications, group alerts, and review inbox correspondence.
              </p>
            </div>

            {/* Quick Stats Grid */}
            <div className="flex flex-wrap gap-3 w-full md:w-auto">
              <div className="flex-1 md:flex-none min-w-[100px] bg-white/10 border border-white/20 backdrop-blur-md rounded-2xl p-3 text-center transition-all hover:bg-white/15">
                <p className="text-2xl sm:text-3xl font-black text-white">{unreadCount}</p>
                <p className="text-[10px] font-bold uppercase text-indigo-100 tracking-wider mt-0.5">Unread</p>
              </div>
              <div className="flex-1 md:flex-none min-w-[100px] bg-white/10 border border-white/20 backdrop-blur-md rounded-2xl p-3 text-center transition-all hover:bg-white/15">
                <p className="text-2xl sm:text-3xl font-black text-white">{memberMsgCount}</p>
                <p className="text-[10px] font-bold uppercase text-indigo-100 tracking-wider mt-0.5">From Members</p>
              </div>
            </div>
          </div>
        </div>

        {/* Dashboard Panels Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          
          {/* Main Inbox Dashboard */}
          <div className="lg:col-span-2 space-y-4 order-2 lg:order-1">
            <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800/80 shadow-sm overflow-hidden">
              
              {/* Dynamic Filter Header */}
              <div className="p-4 sm:p-5 border-b border-slate-100 dark:border-slate-800/60 bg-slate-50/50 dark:bg-slate-900/50 space-y-4">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                  <div className="flex gap-1.5 overflow-x-auto pb-1 -mx-1 px-1 scrollbar-hide w-full sm:w-auto">
                    {(
                      [
                        { id: 'all' as FilterTab, label: 'All Messages' },
                        { id: 'unread' as FilterTab, label: 'Unread' },
                        { id: 'members' as FilterTab, label: 'Members' },
                        { id: 'sent' as FilterTab, label: 'Sent Alerts' },
                      ] as const
                    ).map((tab) => {
                      const isActive = filter === tab.id;
                      return (
                        <button
                          key={tab.id}
                          type="button"
                          onClick={() => setFilter(tab.id)}
                          className={cn(
                            'relative px-3.5 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap shrink-0',
                            isActive
                              ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/10'
                              : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800 hover:border-indigo-400 dark:hover:border-indigo-500'
                          )}
                        >
                          {tab.label}
                        </button>
                      );
                    })}
                  </div>

                  {notifications.length > 0 && (
                    <button
                      type="button"
                      onClick={clearAllMessages}
                      disabled={isClearingAll}
                      className="text-xs font-bold text-red-500 hover:text-red-600 flex items-center gap-1.5 px-3 py-2 rounded-xl hover:bg-red-50 dark:hover:bg-red-950/20 border border-transparent hover:border-red-100 dark:hover:border-red-900/30 transition-all shrink-0"
                    >
                      <Trash2 size={14} />
                      Clear Inbox
                    </button>
                  )}
                </div>

                {/* Inbox Search Console */}
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Search size={16} />
                  </span>
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Filter inbox by message text or title..."
                    className="w-full h-11 pl-10 pr-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                  />
                  {searchQuery && (
                    <button
                      type="button"
                      onClick={() => setSearchQuery('')}
                      className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-xs font-black text-indigo-600 hover:text-indigo-700"
                    >
                      Reset
                    </button>
                  )}
                </div>
              </div>

              {/* Message List */}
              {isLoading ? (
                <div className="p-5 space-y-4">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="flex gap-4 animate-pulse">
                      <div className="w-11 h-11 rounded-xl bg-slate-100 dark:bg-slate-800 shrink-0" />
                      <div className="flex-1 space-y-2 py-1">
                        <div className="h-4 bg-slate-100 dark:bg-slate-800 rounded w-1/3" />
                        <div className="h-3 bg-slate-100 dark:bg-slate-800 rounded w-3/4" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : filteredNotifications.length === 0 ? (
                <div className="p-12 sm:p-24 text-center flex flex-col items-center justify-center space-y-4">
                  <div className="w-16 h-16 rounded-3xl bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 flex items-center justify-center text-slate-400">
                    <Inbox size={28} />
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200">No messages found</h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 max-w-xs leading-relaxed font-sans">
                      Your inbox for this category is currently empty. Direct member inquiries and auto alerts show here.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="divide-y divide-slate-100 dark:divide-slate-800/60">
                  <AnimatePresence initial={false}>
                    {filteredNotifications.map((notif) => {
                      const badge = getNotificationBadge(notif.type);
                      return (
                        <motion.div
                          key={notif.id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, scale: 0.95 }}
                          transition={{ duration: 0.2 }}
                          className={cn(
                            'p-4 sm:p-5 flex gap-3 sm:gap-4 transition-colors hover:bg-slate-50/50 dark:hover:bg-slate-800/30 relative group',
                            !notif.read && 'bg-indigo-500/[0.02] border-l-2 border-indigo-600'
                          )}
                        >
                          {/* Avatar Circle */}
                          <div className={cn(
                            'w-10 h-10 rounded-xl bg-gradient-to-tr text-white text-xs font-black flex items-center justify-center shrink-0 shadow-md',
                            badge.avatarBg
                          )}>
                            {notif.type === 'member_message' ? notif.title.charAt(0).toUpperCase() : badge.icon}
                          </div>

                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between gap-2">
                              <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                                <span className={cn(
                                  'inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-wider border',
                                  badge.styles
                                )}>
                                  {badge.label}
                                </span>
                                {!notif.read && (
                                  <span className="w-1.5 h-1.5 rounded-full bg-indigo-600 animate-pulse" />
                                )}
                              </div>
                              <span className="text-[10px] font-bold text-slate-400 shrink-0">
                                {formatTimeAgo(notif.createdAt)}
                              </span>
                            </div>

                            <h4 className={cn(
                              'text-sm font-bold mt-2 break-words',
                              notif.read ? 'text-slate-700 dark:text-slate-300' : 'text-slate-900 dark:text-white'
                            )}>
                              {notif.title}
                            </h4>

                            <p className="text-xs text-slate-600 dark:text-slate-400 mt-1.5 leading-relaxed whitespace-pre-wrap break-words font-sans">
                              {notif.message}
                            </p>

                            {!notif.read && (
                              <button
                                type="button"
                                onClick={() => markAsRead(notif.id)}
                                className="mt-3.5 text-xs font-bold text-indigo-600 hover:text-indigo-700 inline-flex items-center gap-1 transition-all"
                              >
                                <Check size={14} />
                                Mark as read
                              </button>
                            )}
                          </div>
                        </motion.div>
                      );
                    })}
                  </AnimatePresence>
                </div>
              )}
            </div>
          </div>

          {/* Broadcast / Send panel */}
          <div className="space-y-4 order-1 lg:order-2">
            <div className="bg-white dark:bg-slate-900 p-5 sm:p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800/80 shadow-sm">
              <div className="flex items-center gap-3 pb-4 border-b border-slate-100 dark:border-slate-800/50">
                <div className="w-10 h-10 rounded-2xl bg-indigo-50 dark:bg-indigo-950/40 flex items-center justify-center text-indigo-600 dark:text-indigo-400 shrink-0">
                  <Megaphone size={20} />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-slate-900 dark:text-white">Compose Broadcast</h3>
                  <p className="text-[10px] text-slate-500 font-medium">Send real-time alerts to members</p>
                </div>
              </div>

              <div className="space-y-4 mt-5">
                <div>
                  <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1.5 tracking-wider">Group Target</label>
                  <select
                    value={broadcastGroupId}
                    onChange={(e) => setBroadcastGroupId(e.target.value)}
                    className="w-full h-11 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs px-3 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 text-slate-700 dark:text-slate-300 font-bold transition-all cursor-pointer"
                  >
                    <option value="all">📢 All Active Groups</option>
                    {groups.map((g) => (
                      <option key={g.id} value={g.id}>
                        👥 {g.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1.5 tracking-wider">Message Category</label>
                  <select
                    value={broadcastType}
                    onChange={(e) => setBroadcastType(e.target.value)}
                    className="w-full h-11 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs px-3 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 text-slate-700 dark:text-slate-300 font-bold transition-all cursor-pointer"
                  >
                    <option value="info">🔵 General Announcement</option>
                    <option value="success">🟢 Payment Success Confirmation</option>
                    <option value="warning">🟡 Payment Due Reminder</option>
                    <option value="auction">🔴 Chit Auction Alert</option>
                  </select>
                </div>

                <div>
                  <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1.5 tracking-wider">Subject Title</label>
                  <input
                    type="text"
                    value={broadcastTitle}
                    onChange={(e) => setBroadcastTitle(e.target.value)}
                    placeholder="e.g., Monthly Chit Lift Winner Announced"
                    className="w-full h-11 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 px-3 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-slate-800 dark:text-slate-200 transition-all"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1.5 tracking-wider">Message Body</label>
                  <textarea
                    value={broadcastMessage}
                    onChange={(e) => setBroadcastMessage(e.target.value)}
                    rows={5}
                    className="w-full rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-3 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 resize-none text-slate-800 dark:text-slate-200 transition-all leading-relaxed"
                    placeholder="Write detailed announcements or notifications to dispatch to members' portal..."
                  />
                </div>

                <button
                  type="button"
                  onClick={sendBroadcast}
                  disabled={isSending}
                  className="w-full h-11 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-2 disabled:opacity-60 shadow-lg shadow-indigo-600/20 active:scale-[0.98]"
                >
                  {isSending ? <Loader2 size={16} className="animate-spin" /> : <Send size={14} />}
                  Dispatch Broadcast
                </button>
              </div>
            </div>

            {/* Messaging How-To Banner */}
            <div className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 space-y-3.5">
              <h4 className="text-xs font-black uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-1.5 font-sans">
                <Bell size={14} className="text-indigo-500" />
                Messaging Channels
              </h4>
              <ul className="text-xs text-slate-600 dark:text-slate-400 space-y-2.5 leading-relaxed font-sans">
                <li className="flex gap-2">
                  <span className="text-purple-500 font-bold shrink-0">✔</span>
                  <span><strong>Member Inbox:</strong> Members can write messages to you from their portals, which land here under the &quot;Members&quot; filter.</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-indigo-500 font-bold shrink-0">✔</span>
                  <span><strong>Group Alerts:</strong> Broadcasting sends real-time dashboard updates to all enrolled members of that specific chit fund group.</span>
                </li>
              </ul>
            </div>
          </div>

        </div>

      </div>
    </AdminLayout>
  );
}
