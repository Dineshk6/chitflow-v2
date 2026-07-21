'use client';
import { useState, useEffect, Suspense } from 'react';
import AdminLayout from '@/components/layout/AdminLayout';
import { formatCurrency, cn } from '@/lib/utils';
import {
  Search,
  Filter,
  Plus,
  MoreVertical,
  Users,
  ChevronRight,
  Loader2
} from 'lucide-react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import PageWrapper from '@/components/layout/PageWrapper';
import { TableSkeleton } from '@/components/ui/Skeleton';
import CreateGroupModal from '@/components/admin/CreateGroupModal';
import { toast } from 'sonner';

import { useSearchParams } from 'next/navigation';

function GroupsPageContent() {
  const searchParams = useSearchParams();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [groups, setGroups] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchGroups();
    if (searchParams.get('create') === 'true') {
      setIsModalOpen(true);
    }
  }, [searchParams]);

  const fetchGroups = async () => {
    try {
      const res = await fetch('/api/groups');
      const data = await res.json();
      setGroups(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Fetch error:", error);
      toast.error("Something went wrong");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateGroup = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);

    const formData = new FormData(e.currentTarget);
    const groupData = {
      name: formData.get('name'),
      totalValue: formData.get('totalValue'),
      membersLimit: formData.get('membersLimit'),
      durationMonths: formData.get('durationMonths'),
      monthlyContribution: formData.get('monthlyContribution'),
      liftedContribution: formData.get('liftedContribution'),
      calculationType: formData.get('calculationType'),
      startBid: formData.get('startBid'),
      commissionPct: formData.get('commissionPct'),
    };

    try {
      const res = await fetch('/api/groups', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(groupData),
      });

      if (res.ok) {
        setIsModalOpen(false);
        toast.success("Chit group created successfully!");
        fetchGroups();
      } else {
        const errorData = await res.json();
        toast.error("Something went wrong");
      }
    } catch (error) {
      toast.error("Something went wrong");
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredGroups = groups.filter(g =>
    g.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <AdminLayout>
      <PageWrapper>
        <div className="space-y-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Chit Groups</h1>
              <p className="text-slate-500 dark:text-slate-400 mt-1">Manage and track your active chit series.</p>
            </div>
            <button
              onClick={() => setIsModalOpen(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl font-semibold flex items-center justify-center gap-2 transition-all shadow-lg shadow-blue-500/20"
            >
              <Plus size={20} />
              Create New Group
            </button>
          </div>

          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input
                type="text"
                placeholder="Search groups by name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full h-12 pl-10 pr-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all shadow-sm"
              />
            </div>
            <button className="h-12 px-5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex items-center gap-2 text-slate-600 dark:text-slate-400 font-medium hover:bg-slate-50 dark:hover:bg-slate-800 transition-all shadow-sm">
              <Filter size={18} />
              Filters
            </button>
          </div>

          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-20">
              <Loader2 className="w-10 h-10 text-blue-600 animate-spin mb-4" />
              <p className="text-slate-500 font-medium">Loading groups...</p>
            </div>
          ) : filteredGroups.length === 0 ? (
            <div className="text-center py-20 bg-slate-50 dark:bg-slate-900/50 rounded-3xl border border-dashed border-slate-200 dark:border-slate-800">
              <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="text-slate-400" size={32} />
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">No Groups Found</h3>
              <p className="text-slate-500 dark:text-slate-400 mb-6">Start by creating your first chit fund group.</p>
              <button
                onClick={() => setIsModalOpen(true)}
                className="text-blue-600 font-bold hover:underline"
              >
                Create New Group
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredGroups.map((group) => (
                <motion.div
                  key={group.id}
                  whileHover={{ y: -5 }}
                  className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300"
                >
                  <div className="p-6">
                    <div className="flex justify-between items-start mb-6">
                      <div>
                        <h3 className="text-lg font-bold text-slate-900 dark:text-white">{group.name}</h3>
                        <div className={cn(
                          "mt-2 inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider",
                          group.status === 'ACTIVE' ? "bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-400" :
                            group.status === 'UPCOMING' ? "bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400" :
                              "bg-slate-50 text-slate-600 dark:bg-slate-800 dark:text-slate-400"
                        )}>
                          {group.status}
                        </div>
                      </div>
                      <button className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                        <MoreVertical size={18} />
                      </button>
                    </div>

                    <div className="grid grid-cols-2 gap-4 mb-6">
                      <div className="space-y-1">
                        <p className="text-[10px] uppercase text-slate-400 font-bold tracking-tight">Total Value</p>
                        <p className="text-sm font-bold text-slate-800 dark:text-white">{formatCurrency(group.totalAmount)}</p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-[10px] uppercase text-slate-400 font-bold tracking-tight">Monthly</p>
                        <p className="text-sm font-bold text-slate-800 dark:text-white">{formatCurrency(group.monthlyContribution)}</p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-[10px] uppercase text-slate-400 font-bold tracking-tight">Duration</p>
                        <p className="text-sm font-bold text-slate-800 dark:text-white">{group.duration} Months</p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-[10px] uppercase text-slate-400 font-bold tracking-tight">Members</p>
                        <p className="text-sm font-bold text-slate-800 dark:text-white">0 / {group.membersLimit}</p>
                      </div>
                    </div>
                  </div>

                  <div className="px-6 py-4 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                    <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400">
                      <Users size={14} />
                      <span className="text-xs font-medium">0 / {group.membersLimit} Members</span>
                    </div>
                    <Link
                      href={`/admin/groups/${group.id}`}
                      className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
                    >
                      View Details
                      <ChevronRight size={14} />
                    </Link>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </PageWrapper>

      <CreateGroupModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleCreateGroup}
        isSubmitting={isSubmitting}
      />
    </AdminLayout>
  );
}

export default function GroupsPage() {
  return (
    <Suspense fallback={
      <AdminLayout>
        <PageWrapper>
          <div className="py-20 text-center">
            <Loader2 className="w-10 h-10 text-blue-600 animate-spin mx-auto mb-4" />
            <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">Loading Groups...</p>
          </div>
        </PageWrapper>
      </AdminLayout>
    }>
      <GroupsPageContent />
    </Suspense>
  );
}
