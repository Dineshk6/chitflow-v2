'use client';

import React from 'react';
import AdminLayout from '@/components/layout/AdminLayout';
import PageWrapper from '@/components/layout/PageWrapper';
import { TableSkeleton } from '@/components/ui/Skeleton';
import { mockWinners } from '@/data/winners';
import { formatCurrency, cn, formatDate } from '@/lib/utils';
import { 
  Trophy, 
  Search, 
  Calendar,
  ChevronRight,
  User,
  ArrowUpRight,
  TrendingDown
} from 'lucide-react';
import { motion } from 'framer-motion';

export default function WinnersPage() {
  return (
    <AdminLayout>
      <PageWrapper loadingContent={<TableSkeleton />}>
        <div className="space-y-8">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Winners Hall</h1>
            <p className="text-slate-500 dark:text-slate-400 mt-1">Track auction winners and dividend distributions.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-gradient-to-br from-amber-400 to-orange-500 p-6 rounded-2xl text-white shadow-lg shadow-orange-500/20">
              <div className="flex items-center justify-between mb-4">
                <Trophy size={32} />
                <span className="text-xs font-bold bg-white/20 px-2 py-1 rounded-lg">Last 30 Days</span>
              </div>
              <h3 className="text-2xl font-bold">12 Winners</h3>
              <p className="text-white/80 text-sm mt-1">Total Payout: {formatCurrency(1540000)}</p>
            </div>
            
            <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
              <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">Avg. Auction Dividend</p>
              <div className="flex items-center gap-3 mt-2">
                <h3 className="text-2xl font-bold text-slate-900 dark:text-white">{formatCurrency(1250)}</h3>
                <span className="flex items-center text-emerald-600 text-xs font-bold">
                  <ArrowUpRight size={14} />
                  +4%
                </span>
              </div>
              <p className="text-slate-400 text-xs mt-2">Vs. previous month average</p>
            </div>

            <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
              <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">Total Foregone Amount</p>
              <div className="flex items-center gap-3 mt-2">
                <h3 className="text-2xl font-bold text-slate-900 dark:text-white">{formatCurrency(85000)}</h3>
                <span className="flex items-center text-red-600 text-xs font-bold">
                  <TrendingDown size={14} />
                  -2%
                </span>
              </div>
              <p className="text-slate-400 text-xs mt-2">Distributed to members</p>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <h2 className="font-bold text-lg text-slate-900 dark:text-white">Auction History</h2>
              <div className="relative w-full md:w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                <input 
                  type="text" 
                  placeholder="Search winners..." 
                  className="w-full h-10 pl-10 pr-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 text-sm focus:outline-none"
                />
              </div>
            </div>
            
            <div className="p-6">
              <div className="space-y-6">
                {mockWinners.map((winner, idx) => (
                  <motion.div 
                    key={winner.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.1 }}
                    className="flex items-center gap-4 group"
                  >
                    <div className="w-12 h-12 rounded-2xl bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-blue-600 shrink-0 border border-slate-100 dark:border-slate-700">
                      <User size={24} />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <h4 className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-blue-600 transition-colors">
                          {winner.customerName}
                        </h4>
                        <p className="text-sm font-bold text-slate-900 dark:text-white">
                          {formatCurrency(winner.amount)}
                        </p>
                      </div>
                      <div className="flex items-center justify-between mt-1">
                        <div className="flex items-center gap-2 text-xs text-slate-500">
                          <span className="font-medium">{winner.groupName}</span>
                          <span className="w-1 h-1 rounded-full bg-slate-300"></span>
                          <span>Month {winner.month}</span>
                        </div>
                        <p className="text-xs text-emerald-600 font-semibold">
                          Dividend: {formatCurrency(winner.dividend)}
                        </p>
                      </div>
                      <div className="mt-3 flex items-center gap-2 text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                        <Calendar size={10} />
                        {formatDate(winner.date)}
                      </div>
                    </div>
                    <button className="p-2 rounded-xl text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-600 transition-all">
                      <ChevronRight size={20} />
                    </button>
                  </motion.div>
                ))}
              </div>
              <button className="w-full mt-8 py-3 rounded-xl border border-dashed border-slate-200 dark:border-slate-800 text-sm font-bold text-slate-400 hover:border-slate-400 hover:text-slate-600 transition-all">
                Load More History
              </button>
            </div>
          </div>
        </div>
      </PageWrapper>
    </AdminLayout>
  );
}
