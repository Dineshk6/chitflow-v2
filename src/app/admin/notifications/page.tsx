'use client';

import React, { useState, useEffect, useMemo } from 'react';
import AdminLayout from '@/components/layout/AdminLayout';
import { cn, formatTimeAgo } from '@/lib/utils';
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

function notificationIcon(type: string) {
  if (type === 'member_message') return <User size={18} />;
  if (type === 'success') return <CheckCircle2 size={18} />;
  if (type === 'warning') return <AlertCircle size={18} />;
  if (type === 'error') return <AlertCircle size={18} />;
  return <Info size={18} />;
}

function notificationStyles(type: string) {
  if (type === 'member_message') return 'bg-violet-100 text-violet-700 ring-violet-200';
  if (type === 'success') return 'bg-emerald-100 text-emerald-700 ring-emerald-200';
  if (type === 'warning') return 'bg-amber-100 text-amber-700 ring-amber-200';
  if (type === 'error') return 'bg-red-100 text-red-700 ring-red-200';
  return 'bg-blue-100 text-blue-700 ring-blue-200';
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
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Failed to send message');
    } finally {
      setIsSending(false);
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-4 sm:space-y-6 w-full min-w-0">
        {/* Header */}
        <div className="rounded-xl sm:rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-700 p-4 sm:p-6 md:p-8 text-white shadow-lg shadow-blue-500/20">
          <div className="flex flex-col gap-4 md:gap-6">
            <div className="min-w-0">
              <div className="flex items-center gap-2 mb-2">
                <MessageCircle size={20} className="sm:w-[22px] sm:h-[22px] shrink-0" />
                <span className="text-[10px] sm:text-xs font-bold uppercase tracking-widest text-blue-100">
                  Messages Center
                </span>
              </div>
              <h1 className="text-xl sm:text-2xl md:text-3xl font-black leading-tight">
                Inbox &amp; Member Messages
              </h1>
              <p className="text-blue-100 text-xs sm:text-sm mt-2 max-w-lg">
                Read messages from members and send alerts to your groups.
              </p>
            </div>
            <div className="grid grid-cols-2 sm:flex sm:flex-wrap gap-2 sm:gap-3">
              <div className="bg-white/15 backdrop-blur rounded-xl px-3 sm:px-4 py-2.5 sm:py-3 text-center">
                <p className="text-xl sm:text-2xl font-black">{unreadCount}</p>
                <p className="text-[9px] sm:text-[10px] font-bold uppercase text-blue-100">Unread</p>
              </div>
              <div className="bg-white/15 backdrop-blur rounded-xl px-3 sm:px-4 py-2.5 sm:py-3 text-center">
                <p className="text-xl sm:text-2xl font-black">{memberMsgCount}</p>
                <p className="text-[9px] sm:text-[10px] font-bold uppercase text-blue-100 leading-tight">
                  From members
                </p>
              </div>
              <button
                type="button"
                onClick={clearAllMessages}
                disabled={isClearingAll || notifications.length === 0}
                className="col-span-2 sm:col-span-1 sm:flex-1 sm:min-w-[140px] h-11 px-4 rounded-xl bg-white text-red-600 text-xs sm:text-sm font-bold shadow-md hover:bg-red-50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-all"
              >
                {isClearingAll ? (
                  <Loader2 size={16} className="animate-spin shrink-0" />
                ) : (
                  <Trash2 size={16} className="shrink-0" />
                )}
                <span className="truncate">Clear all messages</span>
              </button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
          {/* Inbox */}
          <div className="lg:col-span-2 min-w-0 order-2 lg:order-1">
            <div className="bg-white rounded-xl sm:rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="p-3 sm:p-4 border-b border-slate-100 flex flex-col gap-3 bg-slate-50">
                <div className="flex gap-1.5 sm:gap-2 overflow-x-auto pb-0.5 -mx-1 px-1 scrollbar-hide">
                  {(
                    [
                      { id: 'all' as FilterTab, label: 'All' },
                      { id: 'unread' as FilterTab, label: 'Unread' },
                      { id: 'members' as FilterTab, label: 'Members' },
                      { id: 'sent' as FilterTab, label: 'Alerts' },
                    ] as const
                  ).map((tab) => (
                    <button
                      key={tab.id}
                      type="button"
                      onClick={() => setFilter(tab.id)}
                      className={cn(
                        'px-2.5 sm:px-3 py-1.5 rounded-lg text-[11px] sm:text-xs font-bold transition-all whitespace-nowrap shrink-0',
                        filter === tab.id
                          ? 'bg-blue-600 text-white shadow-md'
                          : 'bg-white text-slate-600 border border-slate-200 hover:border-blue-300'
                      )}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>
                <div className="flex flex-col sm:flex-row gap-2 w-full">
                  <div className="relative flex-1 min-w-0">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
                    <input
                      type="text"
                      placeholder="Search messages..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full h-10 sm:h-9 pl-8 pr-3 rounded-lg bg-white border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={clearAllMessages}
                    disabled={isClearingAll || notifications.length === 0}
                    className="h-10 sm:h-9 px-4 rounded-lg text-xs font-bold text-red-600 border border-red-200 bg-red-50 hover:bg-red-100 disabled:opacity-40 flex items-center justify-center gap-1.5 shrink-0 w-full sm:w-auto"
                  >
                    {isClearingAll ? (
                      <Loader2 size={14} className="animate-spin" />
                    ) : (
                      <Trash2 size={14} />
                    )}
                    Clear all
                  </button>
                </div>
              </div>

              {isLoading ? (
                <div className="p-4 space-y-3 animate-pulse">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <div key={i} className="h-20 rounded-xl bg-slate-100" />
                  ))}
                </div>
              ) : filteredNotifications.length === 0 ? (
                <div className="p-12 sm:p-20 flex flex-col items-center gap-3 text-center px-4">
                  <Inbox size={48} className="text-slate-200" />
                  <p className="font-bold text-slate-600">No messages here</p>
                  <p className="text-sm text-slate-400 max-w-xs">
                    When a member sends you a message, it appears under From members.
                  </p>
                </div>
              ) : (
                <div className="divide-y divide-slate-100">
                  {filteredNotifications.map((notif) => (
                    <div
                      key={notif.id}
                      className={cn(
                        'p-4 sm:p-5 flex flex-col sm:flex-row gap-3 sm:gap-4 transition-colors hover:bg-slate-50/80',
                        !notif.read && 'bg-blue-50/50',
                        notif.type === 'member_message' && !notif.read && 'bg-violet-50/40'
                      )}
                    >
                      <div
                        className={cn(
                          'w-10 h-10 sm:w-11 sm:h-11 rounded-xl flex items-center justify-center shrink-0 ring-1 self-start',
                          notificationStyles(notif.type)
                        )}
                      >
                        {notificationIcon(notif.type)}
                      </div>
                      <div className="flex-1 min-w-0 w-full">
                        <div className="flex flex-col-reverse sm:flex-row sm:items-start sm:justify-between gap-1 sm:gap-2">
                          <div className="min-w-0">
                            {notif.type === 'member_message' && (
                              <span className="inline-block text-[9px] font-black uppercase tracking-wider text-violet-700 bg-violet-100 px-2 py-0.5 rounded mb-1">
                                Member message
                              </span>
                            )}
                            <h4 className="text-sm font-bold text-slate-900 break-words">{notif.title}</h4>
                          </div>
                          <span className="text-[10px] font-bold text-slate-400 shrink-0 self-start">
                            {formatTimeAgo(notif.createdAt)}
                          </span>
                        </div>
                        <p className="text-sm text-slate-600 mt-2 leading-relaxed whitespace-pre-wrap break-words">
                          {notif.message}
                        </p>
                        {!notif.read && (
                          <button
                            type="button"
                            onClick={() => markAsRead(notif.id)}
                            className="mt-3 text-xs font-bold text-blue-600 hover:text-blue-800 py-1"
                          >
                            Mark as read
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Send message to members — show first on mobile for quick access */}
          <div className="space-y-4 min-w-0 order-1 lg:order-2">
            <div className="bg-white p-4 sm:p-6 rounded-xl sm:rounded-2xl border border-slate-200 shadow-sm">
              <div className="flex items-center gap-2 mb-1">
                <div className="w-9 h-9 rounded-lg bg-blue-100 flex items-center justify-center">
                  <Megaphone size={18} className="text-blue-600" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900">Message members</h3>
                  <p className="text-xs text-slate-500">Send to one group or all</p>
                </div>
              </div>

              <div className="space-y-3 mt-5">
                <div>
                  <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Group</label>
                  <select
                    value={broadcastGroupId}
                    onChange={(e) => setBroadcastGroupId(e.target.value)}
                    className="w-full h-10 rounded-xl bg-slate-50 border border-slate-200 text-sm px-3 focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-slate-800"
                  >
                    <option value="all">All my groups</option>
                    {groups.map((g) => (
                      <option key={g.id} value={g.id}>
                        {g.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Type</label>
                  <select
                    value={broadcastType}
                    onChange={(e) => setBroadcastType(e.target.value)}
                    className="w-full h-10 rounded-xl bg-slate-50 border border-slate-200 text-sm px-3 focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-slate-800"
                  >
                    <option value="info">General info</option>
                    <option value="success">Payment received</option>
                    <option value="warning">Payment reminder</option>
                    <option value="auction">Auction alert</option>
                  </select>
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Subject</label>
                  <input
                    type="text"
                    value={broadcastTitle}
                    onChange={(e) => setBroadcastTitle(e.target.value)}
                    placeholder="e.g. May payment due"
                    className="w-full h-10 rounded-xl bg-slate-50 border border-slate-200 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-slate-800"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Message</label>
                  <textarea
                    value={broadcastMessage}
                    onChange={(e) => setBroadcastMessage(e.target.value)}
                    rows={4}
                    className="w-full rounded-xl bg-slate-50 border border-slate-200 p-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 resize-none text-slate-800"
                    placeholder="Write your message to members..."
                  />
                </div>
                <button
                  onClick={sendBroadcast}
                  disabled={isSending}
                  className="w-full h-11 rounded-xl bg-blue-600 text-white text-sm font-bold hover:bg-blue-700 transition-all flex items-center justify-center gap-2 disabled:opacity-60 shadow-md shadow-blue-500/20"
                >
                  {isSending ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
                  Send message
                </button>
              </div>
            </div>

            <div className="bg-slate-50 border border-slate-200 rounded-xl sm:rounded-2xl p-4 sm:p-5 hidden sm:block">
              <h4 className="text-xs font-black uppercase tracking-widest text-slate-500 mb-3 flex items-center gap-1.5">
                <Bell size={14} /> How messaging works
              </h4>
              <ul className="text-sm text-slate-600 space-y-2">
                <li className="flex gap-2">
                  <span className="text-violet-600 font-bold">→</span>
                  Members message you from their dashboard bell icon.
                </li>
                <li className="flex gap-2">
                  <span className="text-blue-600 font-bold">→</span>
                  You message members using the form on the right.
                </li>
                <li className="flex gap-2">
                  <span className="text-emerald-600 font-bold">→</span>
                  Auction alerts are sent automatically when scheduled.
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
