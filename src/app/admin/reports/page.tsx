'use client';

import React, { useState, useEffect } from 'react';
import AdminLayout from '@/components/layout/AdminLayout';
import PageWrapper from '@/components/layout/PageWrapper';
import { DashboardSkeleton } from '@/components/ui/Skeleton';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line
} from 'recharts';
import { 
  Download, 
  Filter, 
  Calendar,
  TrendingUp,
  TrendingDown,
  ArrowUpRight
} from 'lucide-react';
import { formatCurrency, cn } from '@/lib/utils';

const collectionData = [
  { month: 'Jan', amount: 450000 },
  { month: 'Feb', amount: 520000 },
  { month: 'Mar', amount: 480000 },
  { month: 'Apr', amount: 610000 },
  { month: 'May', amount: 550000 },
  { month: 'Jun', amount: 670000 },
];

const statusData = [
  { name: 'Paid', value: 85, color: '#10b981' },
  { name: 'Pending', value: 10, color: '#f59e0b' },
  { name: 'Late', value: 5, color: '#ef4444' },
];

export default function ReportsPage() {
  return (
    <AdminLayout>
      <PageWrapper loadingContent={<DashboardSkeleton />}>
        <div className="space-y-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Business Intelligence</h1>
              <p className="text-slate-500 dark:text-slate-400 mt-1">Deep dive into your chit fund performance and growth.</p>
            </div>
            <div className="flex gap-2">
              <button className="h-11 px-5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex items-center gap-2 text-slate-600 dark:text-slate-400 font-bold hover:bg-slate-50 transition-all shadow-sm">
                <Calendar size={18} />
                Last 6 Months
              </button>
              <button className="h-11 px-6 rounded-xl bg-slate-900 dark:bg-white dark:text-slate-900 text-white font-bold shadow-lg transition-all hover:opacity-90 flex items-center gap-2">
                <Download size={18} />
                Export data
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="md:col-span-2 bg-white dark:bg-slate-900 p-8 rounded-[32px] border border-slate-200 dark:border-slate-800 shadow-sm">
              <div className="flex items-center justify-between mb-8">
                <h3 className="font-bold text-slate-900 dark:text-white">Monthly Collection Volume</h3>
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-blue-600"></span>
                  <span className="text-xs font-bold text-slate-500">Target: ₹7.5L</span>
                </div>
              </div>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={collectionData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#94a3b8' }} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#94a3b8' }} tickFormatter={(v) => `₹${v/1000}k`} />
                    <Tooltip 
                      cursor={{ fill: 'rgba(59, 130, 246, 0.05)' }}
                      contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                    />
                    <Bar dataKey="amount" fill="#3b82f6" radius={[6, 6, 0, 0]} barSize={40} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="bg-white dark:bg-slate-900 p-8 rounded-[32px] border border-slate-200 dark:border-slate-800 shadow-sm">
              <h3 className="font-bold text-slate-900 dark:text-white mb-8">Collection Status (%)</h3>
              <div className="h-[250px] relative">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={statusData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={8}
                      dataKey="value"
                    >
                      {statusData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                  <p className="text-3xl font-black text-slate-900 dark:text-white">85%</p>
                  <p className="text-[10px] font-bold text-emerald-600 uppercase">On Time</p>
                </div>
              </div>
              <div className="mt-8 space-y-3">
                {statusData.map((item) => (
                  <div key={item.name} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }}></div>
                      <span className="text-xs font-bold text-slate-500">{item.name}</span>
                    </div>
                    <span className="text-xs font-black text-slate-900 dark:text-white">{item.value}%</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[
              { label: 'Group Profitability', value: '18.4%', trend: '+2.1%', isUp: true },
              { label: 'Customer Retention', value: '94.2%', trend: '+0.5%', isUp: true },
              { label: 'Default Rate', value: '1.2%', trend: '-0.3%', isUp: true },
              { label: 'Avg. Auction Dividend', value: '₹1,240', trend: '+12%', isUp: true },
            ].map((stat, idx) => (
              <div key={idx} className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">{stat.label}</p>
                <div className="flex items-center justify-between">
                  <h4 className="text-xl font-black text-slate-900 dark:text-white">{stat.value}</h4>
                  <span className={cn(
                    "text-[10px] font-bold px-1.5 py-0.5 rounded-md",
                    stat.isUp ? "text-emerald-600 bg-emerald-50" : "text-red-600 bg-red-50"
                  )}>
                    {stat.trend}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </PageWrapper>
    </AdminLayout>
  );
}
