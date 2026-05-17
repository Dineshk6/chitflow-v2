'use client';

import { useState, useEffect } from 'react';
import AdminLayout from '@/components/layout/AdminLayout';
import { formatCurrency, cn } from '@/lib/utils';
import { 
  Search, 
  Filter, 
  Download,
  Calendar,
  CheckCircle2,
  Clock,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  Loader2
} from 'lucide-react';
import PageWrapper from '@/components/layout/PageWrapper';
import { toast } from 'sonner';

export default function CollectionsPage() {
  const [payments, setPayments] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchCollections();
  }, []);

  const fetchCollections = async () => {
    try {
      const res = await fetch('/api/admin/collections');
      const data = await res.json();
      if (res.ok) {
        setPayments(data);
      }
    } catch (error) {
      toast.error("Something went wrong");
    } finally {
      setIsLoading(false);
    }
  };

  const filteredPayments = payments.filter(p => 
    p.user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.group.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <AdminLayout>
      <PageWrapper>
        <div className="space-y-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-black text-slate-900 dark:text-white uppercase tracking-tight">Ledger & Collections</h1>
              <p className="text-slate-500 font-medium mt-1">Track every rupee moving through your platform.</p>
            </div>
            <button className="bg-slate-900 dark:bg-white dark:text-slate-900 text-white px-6 py-3 rounded-2xl font-bold flex items-center justify-center gap-2 transition-all hover:scale-[1.02]">
              <Download size={20} />
              Export CSV
            </button>
          </div>

          <div className="flex flex-col md:flex-row gap-4 items-center">
            <div className="relative flex-1 w-full">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input 
                type="text" 
                placeholder="Search by customer or group name..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full h-14 pl-12 pr-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all shadow-sm font-medium"
              />
            </div>
            
            <button className="h-14 px-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex items-center gap-2 text-slate-600 dark:text-slate-400 font-bold hover:bg-slate-50 dark:hover:bg-slate-800 transition-all shadow-sm">
              <Filter size={18} />
              Filter
            </button>
          </div>

          <div className="bg-white dark:bg-slate-900 rounded-[32px] border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800">
                    <th className="px-8 py-5 text-xs font-black uppercase tracking-widest text-slate-400">Transaction ID</th>
                    <th className="px-8 py-5 text-xs font-black uppercase tracking-widest text-slate-400">Customer</th>
                    <th className="px-8 py-5 text-xs font-black uppercase tracking-widest text-slate-400">Group</th>
                    <th className="px-8 py-5 text-xs font-black uppercase tracking-widest text-slate-400">Amount</th>
                    <th className="px-8 py-5 text-xs font-black uppercase tracking-widest text-slate-400">Status</th>
                    <th className="px-8 py-5 text-xs font-black uppercase tracking-widest text-slate-400 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {isLoading ? (
                    <tr>
                      <td colSpan={6} className="py-20 text-center">
                        <Loader2 className="w-10 h-10 text-blue-600 animate-spin mx-auto mb-4" />
                        <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">Fetching Ledger...</p>
                      </td>
                    </tr>
                  ) : filteredPayments.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-20 text-center text-slate-500 font-medium">No transactions found.</td>
                    </tr>
                  ) : filteredPayments.map((payment) => (
                    <tr key={payment.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-colors">
                      <td className="px-8 py-6">
                        <p className="text-xs font-bold text-slate-400">#{payment.id.slice(-6).toUpperCase()}</p>
                      </td>
                      <td className="px-8 py-6">
                        <p className="text-sm font-black text-slate-900 dark:text-white">{payment.user.name}</p>
                        <p className="text-[10px] text-slate-400 font-bold">{payment.user.email}</p>
                      </td>
                      <td className="px-8 py-6">
                        <span className="px-3 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-[10px] font-black text-slate-500 uppercase tracking-tight">
                          {payment.group.name}
                        </span>
                      </td>
                      <td className="px-8 py-6 font-black text-sm text-slate-900 dark:text-white">
                        {formatCurrency(payment.amount)}
                      </td>
                      <td className="px-8 py-6">
                        <div className={cn(
                          "inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest",
                          payment.status === 'PAID' ? "bg-emerald-50 text-emerald-600" :
                          payment.status === 'PENDING' ? "bg-amber-50 text-amber-600" :
                          "bg-red-50 text-red-600"
                        )}>
                          {payment.status === 'PAID' ? <CheckCircle2 size={12} /> : 
                           payment.status === 'PENDING' ? <Clock size={12} /> : <AlertCircle size={12} />}
                          {payment.status}
                        </div>
                      </td>
                      <td className="px-8 py-6 text-right">
                        <button className="text-[10px] font-black text-blue-600 dark:text-blue-400 hover:underline uppercase tracking-widest">
                          Receipt
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </PageWrapper>
    </AdminLayout>
  );
}
