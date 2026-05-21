'use client';
import { useState, useEffect } from 'react';
import AdminLayout from '@/components/layout/AdminLayout';
import { formatCurrency, cn } from '@/lib/utils';
import {
  Plus,
  Users,
  Trophy,
  Wallet,
  Bell,
  Info,
  Clock,
  CheckCircle2,
  Loader2
} from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import PageWrapper from '@/components/layout/PageWrapper';

import MemberSelectorModal from '@/components/admin/MemberSelectorModal';
import { useParams } from 'next/navigation';

export default function GroupDetailsPage() {
  const params = useParams();
  const groupId = params.id as string;
  const [activeTab, setActiveTab] = useState('overview');
  const [group, setGroup] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdatingAuction, setIsUpdatingAuction] = useState(false);
  const [isAddingMember, setIsAddingMember] = useState(false);
  const [isMemberModalOpen, setIsMemberModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isUpdatingGroup, setIsUpdatingGroup] = useState(false);
  const [approvingMemberId, setApprovingMemberId] = useState<string | null>(null);

  const [currentAuction, setCurrentAuction] = useState<any>(null);

  const [editMemberNameModal, setEditMemberNameModal] = useState<{
    isOpen: boolean;
    membershipId: string;
    name: string;
  }>({
    isOpen: false,
    membershipId: '',
    name: '',
  });
  const [isUpdatingMemberName, setIsUpdatingMemberName] = useState(false);

  const handleUpdateMemberName = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUpdatingMemberName(true);
    try {
      const res = await fetch('/api/admin/customers', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          membershipId: editMemberNameModal.membershipId,
          name: editMemberNameModal.name,
        }),
      });
      if (res.ok) {
        toast.success("Member name updated successfully!");
        setEditMemberNameModal({ isOpen: false, membershipId: '', name: '' });
        fetchGroupDetails();
      } else {
        const data = await res.json();
        toast.error(data.error || "Failed to update member name");
      }
    } catch (error) {
      toast.error("Something went wrong");
    } finally {
      setIsUpdatingMemberName(false);
    }
  };

  useEffect(() => {
    if (groupId) {
      fetchGroupDetails();
    }
  }, [groupId]);

  const fetchGroupDetails = async () => {
    try {
      const res = await fetch(`/api/groups/${groupId}`);
      const data = await res.json();
      if (res.ok) {
        setGroup(data);
        // Find the active or upcoming auction
        const auction = data.auctions?.find((a: any) => a.status === 'OPEN' || a.status === 'UPCOMING');
        setCurrentAuction(auction);
      } else {
        toast.error("Something went wrong");
      }
    } catch (error) {
      toast.error("Something went wrong");
    } finally {
      setIsLoading(false);
    }
  };

  const handleAuctionStatus = async (status: string) => {
    if (!currentAuction) return;
    setIsUpdatingAuction(true);
    try {
      const res = await fetch('/api/admin/auctions', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ auctionId: currentAuction.id, status }),
      });
      const data = await res.json();
      if (res.ok) {
        toast.success(data.message || `Auction is now ${status}`);
        fetchGroupDetails();
      } else {
        toast.error(data.error || "Something went wrong");
      }
    } catch (error) {
      toast.error("Something went wrong");
    } finally {
      setIsUpdatingAuction(false);
    }
  };

  const tabs = [
    { id: 'overview', name: 'Overview', icon: Info },
    { id: 'auction', name: 'Live Auction', icon: Trophy },
    { id: 'members', name: 'Members', icon: Users },
    { id: 'payments', name: 'Payments', icon: Wallet },
    { id: 'notifications', name: 'Notifications', icon: Bell },
  ];

  const handleApproveMember = async (membershipId: string) => {
    setApprovingMemberId(membershipId);
    try {
      const res = await fetch('/api/admin/members/approve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ membershipId }),
      });
      if (res.ok) {
        toast.success("Member approved!");
        fetchGroupDetails();
      } else {
        const data = await res.json();
        toast.error("Something went wrong");
      }
    } catch (error) {
      toast.error("Something went wrong");
    } finally {
      setApprovingMemberId(null);
    }
  };

  const handleScheduleAuction = async () => {
    try {
      const res = await fetch('/api/admin/auctions/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          groupId, 
          month: group.currentMonth || 1, 
          prizeValue: group.totalAmount 
        }),
      });
      if (res.ok) {
        toast.success("First auction scheduled!");
        fetchGroupDetails();
      } else {
        toast.error("Failed to schedule auction");
      }
    } catch (error) {
      toast.error("Something went wrong");
    }
  };

  const handleUpdateGroup = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUpdatingGroup(true);
    const target = e.target as any;
    try {
      const res = await fetch(`/api/groups/${groupId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: target.name.value,
          totalAmount: parseFloat(target.totalAmount.value),
          membersLimit: parseInt(target.membersLimit.value),
          monthlyContribution: parseFloat(target.monthlyContribution.value),
          liftedContribution: target.liftedContribution.value ? parseFloat(target.liftedContribution.value) : null,
        }),
      });
      if (res.ok) {
        toast.success("Group updated successfully!");
        setIsEditModalOpen(false);
        fetchGroupDetails();
      } else {
        toast.error("Failed to update group");
      }
    } catch (error) {
      toast.error("Something went wrong");
    } finally {
      setIsUpdatingGroup(false);
    }
  };

  const handleAddMember = async (userId: string) => {
    setIsAddingMember(true);
    try {
      const res = await fetch('/api/admin/groups/add-member', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ groupId, userId }),
      });
      const data = await res.json();
      if (res.ok) {
        toast.success("Member added to group!");
        setIsMemberModalOpen(false);
        fetchGroupDetails();
      } else {
        toast.error(data.error || "Failed to add member");
      }
    } catch (error) {
      toast.error("Something went wrong");
    } finally {
      setIsAddingMember(false);
    }
  };

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="flex flex-col items-center justify-center h-96">
          <Loader2 className="w-10 h-10 text-blue-600 animate-spin mb-4" />
          <p className="text-slate-500 font-medium">Loading group data...</p>
        </div>
      </AdminLayout>
    );
  }

  if (!group) return <AdminLayout><div className="text-center py-20 text-slate-500">Group not found</div></AdminLayout>;

  return (
    <AdminLayout>
      <PageWrapper>
        <div className="space-y-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-blue-600 flex items-center justify-center text-white font-bold text-2xl shadow-lg shadow-blue-500/20">
                {group.name.charAt(0)}
              </div>
              <div>
                <h1 className="text-3xl font-black text-slate-900 dark:text-white">{group.name}</h1>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-xs font-bold bg-slate-100 dark:bg-slate-800 text-slate-500 px-2 py-0.5 rounded uppercase tracking-wider">ID: {group.id.slice(-6)}</span>
                  <span className={cn(
                    "text-[10px] font-bold px-2 py-0.5 rounded uppercase",
                    group.status === 'UPCOMING' ? "bg-blue-50 text-blue-600" : "bg-emerald-50 text-emerald-600"
                  )}>
                    {group.status}
                  </span>
                </div>
              </div>
            </div>
            <div className="flex gap-2">
              <button 
                onClick={() => setIsEditModalOpen(true)}
                className="h-11 px-6 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 font-bold hover:bg-slate-50 transition-all"
              >
                Edit Group
              </button>
              <button 
                onClick={() => setActiveTab('auction')}
                className="h-11 px-6 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold shadow-lg hover:opacity-90 transition-all"
              >
                Manage Auction
              </button>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex border-b border-slate-200 dark:border-slate-800 overflow-x-auto scrollbar-hide">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  "flex items-center gap-2 px-6 py-4 border-b-2 transition-all whitespace-nowrap",
                  activeTab === tab.id
                    ? "border-blue-600 text-blue-600 font-bold"
                    : "border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 font-medium"
                )}
              >
                <tab.icon size={18} />
                {tab.name}
              </button>
            ))}
          </div>

          <div className="min-h-[400px]">
            {activeTab === 'overview' && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="md:col-span-2 space-y-8">
                  <div className="bg-white dark:bg-slate-900 p-8 rounded-[32px] border border-slate-200 dark:border-slate-800 shadow-sm">
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-8">Group Overview</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                      <div className="space-y-1">
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Total Chit Value</p>
                        <p className="text-2xl font-black text-slate-900 dark:text-white">{formatCurrency(group.totalAmount)}</p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Monthly Pay Amount</p>
                        <p className="text-2xl font-black text-slate-900 dark:text-white">{formatCurrency(group.monthlyContribution)}</p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Updated Pay (After Lift)</p>
                        <p className="text-2xl font-black text-emerald-600 dark:text-emerald-400">{group.liftedContribution ? formatCurrency(group.liftedContribution) : 'Not Set'}</p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Duration</p>
                        <p className="text-lg font-bold text-slate-700 dark:text-slate-300">{group.duration} Months</p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Members Limit</p>
                        <p className="text-lg font-bold text-slate-700 dark:text-slate-300">{group.membersLimit || 20} Participants</p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-slate-50 dark:bg-slate-800/50 p-8 rounded-[32px] border border-slate-200 dark:border-slate-800">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-lg shadow-blue-500/20">
                        <Clock size={20} />
                      </div>
                      <h3 className="text-lg font-bold text-slate-900 dark:text-white">Upcoming Auction</h3>
                    </div>
                    <p className="text-slate-600 dark:text-slate-400 font-medium mb-8">
                      The next auction is scheduled for {new Date(group.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' })}.
                      Make sure all members have completed their initial contributions.
                    </p>
                    <div className="flex gap-4">
                      <button 
                        onClick={handleScheduleAuction}
                        className="px-6 py-3 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold text-sm hover:opacity-90 transition-all"
                      >
                        Schedule First Auction
                      </button>
                    </div>
                  </div>
                </div>

                <div className="space-y-6">
                  <div className="bg-white dark:bg-slate-900 p-8 rounded-[32px] border border-slate-200 dark:border-slate-800 shadow-sm text-center">
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-2">Member Progress</p>
                    <div className="relative inline-flex items-center justify-center mb-6">
                      <svg className="w-32 h-32 transform -rotate-90">
                        <circle cx="64" cy="64" r="56" stroke="currentColor" strokeWidth="8" fill="transparent" className="text-slate-100 dark:text-slate-800" />
                        <circle cx="64" cy="64" r="56" stroke="currentColor" strokeWidth="8" fill="transparent" strokeDasharray={351.8} strokeDashoffset={351.8 * (1 - (group.members?.length || 0) / (group.membersLimit || 20))} className="text-blue-600" />
                      </svg>
                      <span className="absolute text-2xl font-black text-slate-900 dark:text-white">
                        {Math.floor(((group.members?.length || 0) / (group.membersLimit || 20)) * 100)}%
                      </span>
                    </div>
                    <p className="text-sm font-bold text-slate-700 dark:text-slate-300">
                      {group.members?.length || 0} of {group.membersLimit || 20} filled
                    </p>
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === 'auction' && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">
                {!currentAuction ? (
                  <div className="text-center py-20 bg-slate-50 dark:bg-slate-900/50 rounded-[32px] border border-dashed border-slate-200 dark:border-slate-800">
                    <p className="text-slate-500 font-medium">No auctions are currently scheduled for this group.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2 space-y-6">
                      <div className="bg-white dark:bg-slate-900 p-8 rounded-[32px] border border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden">
                        <div className="flex items-center justify-between mb-8 relative z-10">
                          <div>
                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-1">Month {currentAuction.month} Auction</p>
                            <h3 className="text-2xl font-black text-slate-900 dark:text-white">Live Bidding</h3>
                          </div>
                          <span className={cn(
                            "px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest",
                            currentAuction.status === 'OPEN' ? "bg-emerald-500 text-white animate-pulse" : "bg-slate-100 text-slate-500"
                          )}>
                            {currentAuction.status}
                          </span>
                        </div>

                        <div className="grid grid-cols-2 gap-4 mb-10 relative z-10">
                          <div className="p-6 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700">
                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-1">Prize Value</p>
                            <p className="text-2xl font-black text-slate-900 dark:text-white">{formatCurrency(currentAuction.prizeValue)}</p>
                          </div>
                          <div className="p-6 rounded-2xl bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800">
                            <p className="text-[10px] text-blue-400 font-bold uppercase tracking-widest mb-1">Current Winning Bid</p>
                            <p className="text-2xl font-black text-blue-600">{formatCurrency(currentAuction.winningBid || 0)}</p>
                          </div>
                        </div>

                        <div className="flex gap-4 relative z-10">
                          {currentAuction.status === 'UPCOMING' && (
                            <button
                              onClick={() => handleAuctionStatus('OPEN')}
                              disabled={isUpdatingAuction}
                              className="flex-1 h-14 rounded-2xl bg-blue-600 text-white font-bold shadow-lg shadow-blue-500/20 hover:bg-blue-700 transition-all flex items-center justify-center gap-2"
                            >
                              {isUpdatingAuction ? <Loader2 className="animate-spin" size={20} /> : "Start Auction"}
                            </button>
                          )}
                          {currentAuction.status === 'OPEN' && (
                            <button
                              onClick={() => handleAuctionStatus('CLOSED')}
                              disabled={isUpdatingAuction}
                              className="flex-1 h-14 rounded-2xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold shadow-lg hover:opacity-90 transition-all flex items-center justify-center gap-2"
                            >
                              {isUpdatingAuction ? <Loader2 className="animate-spin" size={20} /> : "Close Auction & Declare Winner"}
                            </button>
                          )}
                        </div>
                      </div>

                      <div className="bg-white dark:bg-slate-900 rounded-[32px] border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
                        <div className="p-6 border-b border-slate-50 dark:border-slate-800">
                          <h4 className="font-bold text-slate-900 dark:text-white">Recent Bids</h4>
                        </div>
                        <div className="divide-y divide-slate-50 dark:divide-slate-800">
                          {!currentAuction.bids || currentAuction.bids.length === 0 ? (
                            <div className="p-10 text-center text-slate-400 text-sm">No bids placed yet.</div>
                          ) : (
                            currentAuction.bids.map((bid: any) => (
                              <div key={bid.id} className="p-6 flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                  <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-xs font-bold">
                                    {bid.user.name.charAt(0)}
                                  </div>
                                  <div>
                                    <p className="text-sm font-bold text-slate-900 dark:text-white">{bid.user.name}</p>
                                    <p className="text-[10px] text-slate-400">{new Date(bid.createdAt).toLocaleTimeString()}</p>
                                  </div>
                                </div>
                                <p className="text-sm font-black text-blue-600">{formatCurrency(bid.amount)}</p>
                              </div>
                            ))
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </motion.div>
            )}

            {activeTab === 'members' && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white">Group Members</h3>
                  <button 
                    onClick={() => setIsMemberModalOpen(true)}
                    className="h-10 px-4 rounded-xl bg-blue-600 text-white font-bold text-xs hover:bg-blue-700 transition-all flex items-center gap-2"
                  >
                    <Plus size={14} /> Add Member
                  </button>
                </div>

                <div className="bg-white dark:bg-slate-900 rounded-[32px] border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
                <table className="w-full text-left">
                  <thead>
                    <tr className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800">
                      <th className="px-6 py-4 text-xs font-bold uppercase text-slate-500">Member</th>
                      <th className="px-6 py-4 text-xs font-bold uppercase text-slate-500">Contact</th>
                      <th className="px-6 py-4 text-xs font-bold uppercase text-slate-500">Status</th>
                      <th className="px-6 py-4 text-xs font-bold uppercase text-slate-500 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {!group.members || group.members.length === 0 ? (
                      <tr>
                        <td colSpan={4} className="py-20 text-center text-slate-500">No members have joined this group yet.</td>
                      </tr>
                    ) : (
                      group.members.map((membership: any) => {
                        const winningAuction = group.auctions?.find((a: any) => a.winnerId === membership.userId && a.status === 'CLOSED');
                        return (
                          <tr key={membership.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                                  {membership.user.name.charAt(0)}
                                </div>
                                <div className="flex flex-col">
                                  <span className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                                    {membership.user.name}
                                    {winningAuction && (
                                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-400 text-[9px] font-black uppercase tracking-wider">
                                        🏆 LIFTED (Month {winningAuction.month})
                                      </span>
                                    )}
                                  </span>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <div className="space-y-0.5">
                                <p className="text-xs text-slate-500">{membership.user.email}</p>
                                <p className="text-xs text-slate-400">{membership.user.mobile}</p>
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              {membership.status === 'PENDING' ? (
                                <button
                                  onClick={() => handleApproveMember(membership.id)}
                                  disabled={approvingMemberId === membership.id}
                                  className="px-3 py-1 rounded-lg bg-blue-600 text-white text-[10px] font-bold uppercase hover:bg-blue-700 transition-all shadow-sm flex items-center justify-center min-w-[70px]"
                                >
                                  {approvingMemberId === membership.id ? <Loader2 className="animate-spin" size={12} /> : "Approve"}
                                </button>
                              ) : (
                                <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-600 text-[10px] font-bold uppercase tracking-tight">
                                  {membership.status}
                                </span>
                              )}
                            </td>
                            <td className="px-6 py-4 text-right flex items-center justify-end gap-3">
                              <button 
                                onClick={() => {
                                  setEditMemberNameModal({
                                    isOpen: true,
                                    membershipId: membership.id,
                                    name: membership.user.name,
                                  });
                                }}
                                className="text-xs font-bold text-blue-600 hover:underline"
                              >
                                Edit Name
                              </button>
                              <button className="text-xs font-bold text-red-600 hover:underline">Remove</button>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </motion.div>
            )}
            {activeTab === 'payments' && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
                <div className="bg-white dark:bg-slate-900 rounded-[32px] border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800">
                        <th className="px-6 py-4 text-xs font-bold uppercase text-slate-500">Member</th>
                        <th className="px-6 py-4 text-xs font-bold uppercase text-slate-500">Month</th>
                        <th className="px-6 py-4 text-xs font-bold uppercase text-slate-500">Amount</th>
                        <th className="px-6 py-4 text-xs font-bold uppercase text-slate-500">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                      {!group.payments || group.payments.length === 0 ? (
                        <tr>
                          <td colSpan={4} className="py-20 text-center text-slate-500">No payments recorded yet.</td>
                        </tr>
                      ) : (
                        group.payments.map((payment: any) => (
                          <tr key={payment.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                            <td className="px-6 py-4">
                              <span className="text-sm font-bold text-slate-900 dark:text-white">{payment.user.name}</span>
                            </td>
                            <td className="px-6 py-4">
                              <span className="text-xs font-medium text-slate-500">Month {payment.month}</span>
                            </td>
                            <td className="px-6 py-4">
                              <span className="text-sm font-black text-slate-900 dark:text-white">{formatCurrency(payment.amount)}</span>
                            </td>
                            <td className="px-6 py-4">
                              <span className={cn(
                                "px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-tight",
                                payment.status === 'PAID' ? "bg-emerald-50 text-emerald-600" : "bg-amber-50 text-amber-600"
                              )}>
                                {payment.status}
                              </span>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </motion.div>
            )}
          </div>
        </div>
      </PageWrapper>
      <MemberSelectorModal 
        isOpen={isMemberModalOpen}
        onClose={() => setIsMemberModalOpen(false)}
        onSelect={handleAddMember}
        isSubmitting={isAddingMember}
      />

      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/20 backdrop-blur-sm">
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-white dark:bg-slate-900 w-full max-w-md rounded-[40px] shadow-2xl overflow-hidden border border-slate-200 dark:border-slate-800">
            <div className="p-8 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
              <h3 className="text-xl font-black uppercase tracking-tight">Edit Group</h3>
              <button onClick={() => setIsEditModalOpen(false)} className="w-10 h-10 rounded-full bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-slate-500">×</button>
            </div>
            <form onSubmit={handleUpdateGroup} className="p-8 space-y-6 max-h-[70vh] overflow-y-auto">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Group Name</label>
                <input name="name" defaultValue={group.name} className="w-full h-12 px-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Total Amount</label>
                  <input name="totalAmount" type="number" defaultValue={group.totalAmount} className="w-full h-12 px-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all" />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Members Limit</label>
                  <input name="membersLimit" type="number" defaultValue={group.membersLimit} className="w-full h-12 px-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Monthly Pay</label>
                  <input name="monthlyContribution" type="number" defaultValue={group.monthlyContribution} className="w-full h-12 px-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all" />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Updated Pay (After Lift)</label>
                  <input name="liftedContribution" type="number" defaultValue={group.liftedContribution || ''} placeholder="e.g. 6000" className="w-full h-12 px-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all" />
                </div>
              </div>
              <button 
                type="submit" 
                disabled={isUpdatingGroup}
                className="w-full h-14 rounded-2xl bg-blue-600 text-white font-bold shadow-lg shadow-blue-500/20 flex items-center justify-center gap-2"
              >
                {isUpdatingGroup ? <Loader2 className="animate-spin" size={20} /> : "Save Changes"}
              </button>
            </form>
          </motion.div>
        </div>
      )}
      {editMemberNameModal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/20 backdrop-blur-sm">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }} 
            animate={{ opacity: 1, scale: 1 }} 
            className="bg-white dark:bg-slate-900 w-full max-w-md rounded-[32px] shadow-2xl overflow-hidden border border-slate-200 dark:border-slate-800"
          >
            <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
              <div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">Edit Member Name</h3>
                <p className="text-xs text-slate-500">Update how this member's name appears in this group</p>
              </div>
              <button 
                onClick={() => setEditMemberNameModal({ isOpen: false, membershipId: '', name: '' })} 
                className="w-10 h-10 rounded-full bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-slate-500 text-lg hover:bg-slate-100 transition-colors"
              >
                ×
              </button>
            </div>
            <form onSubmit={handleUpdateMemberName} className="p-6 space-y-4">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Member Name</label>
                <input 
                  required
                  name="name" 
                  value={editMemberNameModal.name} 
                  onChange={(e) => setEditMemberNameModal(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Enter name"
                  className="w-full h-12 px-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all" 
                />
              </div>
              <div className="pt-2 flex gap-3">
                <button 
                  type="button"
                  onClick={() => setEditMemberNameModal({ isOpen: false, membershipId: '', name: '' })}
                  className="flex-1 h-12 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 font-bold hover:bg-slate-50 transition-all text-sm"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  disabled={isUpdatingMemberName}
                  className="flex-[2] h-12 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold shadow-lg shadow-blue-500/20 flex items-center justify-center gap-2 text-sm disabled:opacity-75"
                >
                  {isUpdatingMemberName ? <Loader2 className="animate-spin" size={18} /> : "Save Changes"}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AdminLayout>
  );
}
