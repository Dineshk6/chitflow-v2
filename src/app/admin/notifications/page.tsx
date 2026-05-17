'use client';

import React from 'react';
import AdminLayout from '@/components/layout/AdminLayout';
import { mockNotifications } from '@/data/notifications';
import { cn } from '@/lib/utils';
import { 
  Bell, 
  Send, 
  Users, 
  Calendar,
  Search,
  MoreVertical,
  CheckCircle2,
  AlertCircle,
  Info,
  Clock
} from 'lucide-react';
import { motion } from 'framer-motion';

export default function NotificationsPage() {
  return (
    <AdminLayout>
      <div className="space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Notifications</h1>
            <p className="text-slate-500 dark:text-slate-400 mt-1">Broadcast messages and manage alerts.</p>
          </div>
          <div className="flex gap-2">
            <button className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 px-5 py-2.5 rounded-xl font-semibold transition-all hover:bg-slate-200 dark:hover:bg-slate-700">
              Mark all as read
            </button>
            <button className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl font-semibold flex items-center justify-center gap-2 transition-all shadow-lg shadow-blue-500/20">
              <Send size={18} />
              New Broadcast
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-4">
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
              <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/30">
                <div className="flex gap-2">
                  <button className="px-3 py-1.5 rounded-lg bg-white dark:bg-slate-800 shadow-sm text-xs font-bold text-blue-600 dark:text-blue-400 border border-slate-200 dark:border-slate-700">
                    All
                  </button>
                  <button className="px-3 py-1.5 rounded-lg text-xs font-bold text-slate-500 hover:bg-white dark:hover:bg-slate-800 transition-all">
                    Unread
                  </button>
                  <button className="px-3 py-1.5 rounded-lg text-xs font-bold text-slate-500 hover:bg-white dark:hover:bg-slate-800 transition-all">
                    System
                  </button>
                </div>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
                  <input 
                    type="text" 
                    placeholder="Search logs..." 
                    className="w-48 h-8 pl-8 pr-4 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs focus:outline-none"
                  />
                </div>
              </div>

              <div className="divide-y divide-slate-100 dark:divide-slate-800">
                {mockNotifications.map((notif) => (
                  <motion.div 
                    key={notif.id}
                    whileHover={{ backgroundColor: 'rgba(0,0,0,0.02)' }}
                    className={cn(
                      "p-5 flex gap-4 transition-colors",
                      !notif.isRead && "bg-blue-50/30 dark:bg-blue-900/10 border-l-4 border-l-blue-600"
                    )}
                  >
                    <div className={cn(
                      "w-10 h-10 rounded-full flex items-center justify-center shrink-0",
                      notif.type === 'success' ? "bg-emerald-100 text-emerald-600" :
                      notif.type === 'warning' ? "bg-amber-100 text-amber-600" :
                      notif.type === 'error' ? "bg-red-100 text-red-600" :
                      "bg-blue-100 text-blue-600"
                    )}>
                      {notif.type === 'success' ? <CheckCircle2 size={20} /> :
                       notif.type === 'warning' ? <AlertCircle size={20} /> :
                       notif.type === 'error' ? <AlertCircle size={20} /> :
                       <Info size={20} />}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <h4 className="text-sm font-bold text-slate-900 dark:text-white">{notif.title}</h4>
                        <span className="text-[10px] font-bold text-slate-400 uppercase">{notif.time}</span>
                      </div>
                      <p className="text-sm text-slate-600 dark:text-slate-400 mt-1 leading-relaxed">
                        {notif.message}
                      </p>
                      <div className="mt-3 flex gap-2">
                        <button className="text-[10px] font-bold text-blue-600 hover:underline">View Transaction</button>
                        <span className="text-[10px] text-slate-300">|</span>
                        <button className="text-[10px] font-bold text-slate-400 hover:text-slate-600">Dismiss</button>
                      </div>
                    </div>
                    <button className="p-1 rounded text-slate-300 hover:text-slate-500 self-start">
                      <MoreVertical size={16} />
                    </button>
                  </motion.div>
                ))}
              </div>
              <div className="p-4 text-center border-t border-slate-100 dark:border-slate-800">
                <button className="text-xs font-bold text-slate-400 hover:text-blue-600 transition-colors">
                  Load Older Notifications
                </button>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
              <h3 className="font-bold text-slate-900 dark:text-white mb-4">Quick Broadcast</h3>
              <div className="space-y-4">
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1.5">Recipient Group</label>
                  <select className="w-full h-10 rounded-xl bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-sm focus:ring-0">
                    <option>All Active Groups</option>
                    <option>Royal Fortune 1L</option>
                    <option>Smart Savings 50k</option>
                  </select>
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1.5">Message Type</label>
                  <div className="flex gap-2">
                    <button className="flex-1 h-10 rounded-xl bg-blue-50 text-blue-600 text-xs font-bold border border-blue-100">SMS</button>
                    <button className="flex-1 h-10 rounded-xl bg-slate-50 text-slate-500 text-xs font-bold border border-slate-200">Email</button>
                    <button className="flex-1 h-10 rounded-xl bg-slate-50 text-slate-500 text-xs font-bold border border-slate-200">App</button>
                  </div>
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1.5">Message Content</label>
                  <textarea 
                    className="w-full h-24 rounded-xl bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 p-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                    placeholder="Type your message here..."
                  ></textarea>
                </div>
                <button className="w-full py-2.5 rounded-xl bg-blue-600 text-white text-sm font-bold shadow-lg shadow-blue-500/20 hover:bg-blue-700 transition-all flex items-center justify-center gap-2">
                  <Send size={16} />
                  Send Broadcast
                </button>
              </div>
            </div>

            <div className="bg-blue-600 p-6 rounded-2xl text-white shadow-lg shadow-blue-600/20">
              <div className="flex items-center gap-2 mb-2">
                <Clock size={20} />
                <h3 className="font-bold">Scheduled</h3>
              </div>
              <p className="text-xs text-white/70 mb-4">Next automated payment reminders:</p>
              <div className="space-y-3">
                <div className="bg-white/10 p-2.5 rounded-xl border border-white/10">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-[10px] font-bold uppercase">15 May, 10:00 AM</span>
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                  </div>
                  <p className="text-xs font-medium">Due reminder: Royal Fortune 1L</p>
                </div>
                <div className="bg-white/10 p-2.5 rounded-xl border border-white/10">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-[10px] font-bold uppercase">18 May, 05:00 PM</span>
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                  </div>
                  <p className="text-xs font-medium">Auction alert: Smart Savings 50k</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
