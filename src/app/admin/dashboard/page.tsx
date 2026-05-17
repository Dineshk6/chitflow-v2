'use client';

import { useState, useEffect } from 'react';
import AdminLayout from '@/components/layout/AdminLayout';
import { formatCurrency, cn } from '@/lib/utils';
import { 
  Users, 
  Plus, 
  Search, 
  CheckCircle2, 
  Clock, 
  Trash2, 
  Edit3, 
  DollarSign, 
  Calendar,
  Loader2,
  Phone,
  UserX,
  AlertTriangle,
  ArrowLeft,
  ChevronRight,
  TrendingUp,
  Layers,
  Save,
  Check
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import PageWrapper from '@/components/layout/PageWrapper';
import { toast } from 'sonner';

export default function Dashboard() {
  // Navigation states
  const [groups, setGroups] = useState<any[]>([]);
  const [selectedGroup, setSelectedGroup] = useState<any | null>(null);
  const [activeTab, setActiveTab] = useState<'members' | 'payments'>('payments');
  const [isLoadingGroups, setIsLoadingGroups] = useState(true);
  const [isLoadingMembers, setIsLoadingMembers] = useState(false);

  // Group forms
  const [isGroupModalOpen, setIsGroupModalOpen] = useState(false);
  const [editingGroup, setEditingGroup] = useState<any | null>(null);
  const [groupFormData, setGroupFormData] = useState({
    name: '',
    totalValue: '',
    membersLimit: '',
    durationMonths: '',
    monthlyContribution: '',
    liftedContribution: ''
  });
  const [isSubmittingGroup, setIsSubmittingGroup] = useState(false);
  const [groupToDelete, setGroupToDelete] = useState<any | null>(null);

  // Member states
  const [members, setMembers] = useState<any[]>([]);
  const [isMemberModalOpen, setIsMemberModalOpen] = useState(false);
  const [memberFormData, setMemberFormData] = useState({ name: '', phone: '' });
  const [isSubmittingMember, setIsSubmittingMember] = useState(false);
  const [memberToDelete, setMemberToDelete] = useState<any | null>(null);
  const [isDeletingMember, setIsDeletingMember] = useState(false);
  const [memberSearchQuery, setMemberSearchQuery] = useState('');

  // Payment states
  const [selectedMonth, setSelectedMonth] = useState<number>(1);
  const [editingAmountUserId, setEditingAmountUserId] = useState<string | null>(null);
  const [customAmounts, setCustomAmounts] = useState<{ [userId: string]: string }>({});
  const [selectedWinnerId, setSelectedWinnerId] = useState<string>('none');

  useEffect(() => {
    fetchGroups();
  }, []);

  useEffect(() => {
    if (selectedGroup) {
      fetchGroupMembers(selectedGroup.id);
    }
  }, [selectedGroup]);

  // --- API calls for groups ---
  const fetchGroups = async () => {
    setIsLoadingGroups(true);
    try {
      const res = await fetch('/api/groups');
      const data = await res.json();
      setGroups(Array.isArray(data) ? data : []);
    } catch (err) {
      toast.error("Failed to load groups directory");
    } finally {
      setIsLoadingGroups(false);
    }
  };

  const handleCreateOrUpdateGroup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!groupFormData.name || !groupFormData.totalValue || !groupFormData.monthlyContribution) {
      toast.error("Please fill in all required fields");
      return;
    }

    setIsSubmittingGroup(true);
    try {
      const url = '/api/groups';
      const method = editingGroup ? 'PUT' : 'POST';
      const payload = editingGroup 
        ? { id: editingGroup.id, ...groupFormData }
        : groupFormData;

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        toast.success(editingGroup ? "Group updated successfully!" : "Group created successfully!");
        setIsGroupModalOpen(false);
        setEditingGroup(null);
        // Reset form
        setGroupFormData({
          name: '',
          totalValue: '',
          membersLimit: '',
          durationMonths: '',
          monthlyContribution: '',
          liftedContribution: ''
        });
        fetchGroups();
      } else {
        const errorData = await res.json();
        toast.error(errorData.error || "Failed to save group details");
      }
    } catch (err) {
      toast.error("Connection failed");
    } finally {
      setIsSubmittingGroup(false);
    }
  };

  const handleDeleteGroup = async () => {
    if (!groupToDelete) return;
    try {
      const res = await fetch(`/api/groups?id=${groupToDelete.id}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        toast.success("Group deleted successfully!");
        setGroupToDelete(null);
        if (selectedGroup?.id === groupToDelete.id) {
          setSelectedGroup(null);
        }
        fetchGroups();
      } else {
        toast.error("Failed to delete group");
      }
    } catch (err) {
      toast.error("Something went wrong");
    }
  };

  // --- API calls for members ---
  const fetchGroupMembers = async (groupId: string) => {
    setIsLoadingMembers(true);
    try {
      const res = await fetch(`/api/admin/customers?groupId=${groupId}`);
      const data = await res.json();
      setMembers(Array.isArray(data) ? data : []);
      
      // Initialize custom amount values
      const amounts: { [userId: string]: string } = {};
      if (Array.isArray(data)) {
        data.forEach(m => {
          const payment = m.payments?.find((p: any) => p.month === selectedMonth);
          amounts[m.id] = payment?.amount?.toString() || selectedGroup.monthlyContribution.toString();
        });
      }
      setCustomAmounts(amounts);
    } catch (err) {
      toast.error("Failed to load group members");
    } finally {
      setIsLoadingMembers(false);
    }
  };

  const handleAddMember = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!memberFormData.name || !memberFormData.phone) {
      toast.error("Name and Phone number are required");
      return;
    }

    setIsSubmittingMember(true);
    try {
      const res = await fetch('/api/admin/customers/add', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: memberFormData.name,
          phone: memberFormData.phone,
          groupId: selectedGroup.id
        })
      });

      if (res.ok) {
        toast.success("Member added to group successfully!");
        setIsMemberModalOpen(false);
        setMemberFormData({ name: '', phone: '' });
        fetchGroupMembers(selectedGroup.id);
      } else {
        const errorData = await res.json();
        toast.error(errorData.error || "Failed to add member to group");
      }
    } catch (err) {
      toast.error("Failed to save member");
    } finally {
      setIsSubmittingMember(false);
    }
  };

  const handleRemoveMember = async () => {
    if (!memberToDelete) return;
    setIsDeletingMember(true);
    try {
      const res = await fetch(`/api/admin/customers?userId=${memberToDelete.id}&groupId=${selectedGroup.id}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        toast.success("Member removed from group successfully!");
        setMemberToDelete(null);
        fetchGroupMembers(selectedGroup.id);
      } else {
        toast.error("Failed to remove member");
      }
    } catch (err) {
      toast.error("Something went wrong");
    } finally {
      setIsDeletingMember(false);
    }
  };

  // --- API calls for payments & custom contributions ---
  const handleTogglePaymentStatus = async (userId: string, currentStatus: string) => {
    const nextStatus = currentStatus === 'PAID' ? 'PENDING' : 'PAID';
    const amountVal = parseFloat(customAmounts[userId]) || selectedGroup.monthlyContribution;

    // Optimistic UI updates
    setMembers(prev => prev.map(m => {
      if (m.id === userId) {
        const otherPayments = m.payments.filter((p: any) => p.month !== selectedMonth);
        const updatedPayment = {
          month: selectedMonth,
          status: nextStatus,
          amount: amountVal
        };
        return {
          ...m,
          payments: [...otherPayments, updatedPayment]
        };
      }
      return m;
    }));

    try {
      const res = await fetch('/api/admin/customers', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          groupId: selectedGroup.id,
          month: selectedMonth,
          status: nextStatus,
          amount: amountVal
        })
      });

      if (!res.ok) {
        toast.error("Failed to update status on server");
        fetchGroupMembers(selectedGroup.id);
      }
    } catch (err) {
      toast.error("Connection error");
      fetchGroupMembers(selectedGroup.id);
    }
  };

  const handleSaveCustomAmount = async (userId: string) => {
    const amountVal = parseFloat(customAmounts[userId]);
    if (isNaN(amountVal) || amountVal <= 0) {
      toast.error("Please enter a valid amount");
      return;
    }

    const currentMember = members.find(m => m.id === userId);
    const payment = currentMember?.payments?.find((p: any) => p.month === selectedMonth);
    const statusVal = payment?.status || 'PENDING';

    try {
      const res = await fetch('/api/admin/customers', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          groupId: selectedGroup.id,
          month: selectedMonth,
          status: statusVal,
          amount: amountVal
        })
      });

      if (res.ok) {
        toast.success("Due amount updated for this month!");
        setEditingAmountUserId(null);
        fetchGroupMembers(selectedGroup.id);
      } else {
        toast.error("Failed to save amount");
      }
    } catch (err) {
      toast.error("Connection error");
    }
  };

  // Sync custom amounts on month change
  useEffect(() => {
    if (selectedGroup && members.length > 0) {
      const amounts: { [userId: string]: string } = {};
      members.forEach(m => {
        const payment = m.payments?.find((p: any) => p.month === selectedMonth);
        const hasWonBefore = m.liftedMonths?.some((wonMonth: number) => wonMonth < selectedMonth);
        const defaultAmt = hasWonBefore 
          ? (selectedGroup.liftedContribution?.toString() || selectedGroup.monthlyContribution.toString())
          : selectedGroup.monthlyContribution.toString();
        amounts[m.id] = payment?.amount?.toString() || defaultAmt;
      });
      setCustomAmounts(amounts);

      // Sync local chit lift winner
      const currentWinner = members.find(m => m.liftedMonths?.includes(selectedMonth));
      if (currentWinner) {
        setSelectedWinnerId(currentWinner.id);
      } else {
        setSelectedWinnerId('none');
      }
    }
  }, [selectedMonth, members, selectedGroup]);

  // Computations
  const filteredMembers = members.filter(m => 
    m.name.toLowerCase().includes(memberSearchQuery.toLowerCase()) ||
    m.phone.includes(memberSearchQuery)
  );

  const stats = (() => {
    let paidCount = 0;
    let totalCollected = 0;

    filteredMembers.forEach(m => {
      const payment = m.payments?.find((p: any) => p.month === selectedMonth);
      if (payment && payment.status === 'PAID') {
        paidCount++;
        totalCollected += payment.amount || selectedGroup?.monthlyContribution || 5000;
      }
    });

    const pendingCount = filteredMembers.length - paidCount;

    return {
      totalMembers: filteredMembers.length,
      paidCount,
      pendingCount,
      totalCollected
    };
  })();

  const openEditGroupModal = (group: any) => {
    setEditingGroup(group);
    setGroupFormData({
      name: group.name,
      totalValue: group.totalAmount.toString(),
      membersLimit: group.membersLimit.toString(),
      durationMonths: group.duration.toString(),
      monthlyContribution: group.monthlyContribution.toString(),
      liftedContribution: (group.liftedContribution ?? group.monthlyContribution).toString()
    });
    setIsGroupModalOpen(true);
  };

  const openCreateGroupModal = () => {
    setEditingGroup(null);
    setGroupFormData({
      name: '',
      totalValue: '',
      membersLimit: '',
      durationMonths: '',
      monthlyContribution: '',
      liftedContribution: ''
    });
    setIsGroupModalOpen(true);
  };

  return (
    <AdminLayout>
      <PageWrapper>
        <div className="space-y-8 pb-12">
          
          {/* ---------------- GROUP CATALOG WORKSPACE (No group selected) ---------------- */}
          <AnimatePresence mode="wait">
            {!selectedGroup ? (
              <motion.div
                key="catalog"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                className="space-y-8"
              >
                {/* Catalog Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                  <div>
                    <h1 className="text-4xl font-black text-slate-900 dark:text-white leading-tight">
                      Admin Control Hub
                    </h1>
                    <p className="text-slate-500 dark:text-slate-400 mt-1.5 font-medium">
                      Create, edit and manage multiple Chit groups. Track member contribution cycles.
                    </p>
                  </div>

                  <button
                    onClick={openCreateGroupModal}
                    className="bg-blue-600 hover:bg-blue-700 text-white h-12 px-6 rounded-2xl font-bold flex items-center justify-center gap-2.5 transition-all shadow-xl shadow-blue-500/25 active:scale-[0.98] self-start md:self-auto"
                  >
                    <Plus size={20} />
                    Create New Group
                  </button>
                </div>

                {/* Groups Grid */}
                {isLoadingGroups ? (
                  <div className="py-24 text-center">
                    <Loader2 className="w-12 h-12 text-blue-600 animate-spin mx-auto mb-4" />
                    <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">Loading Groups Directory...</p>
                  </div>
                ) : groups.length === 0 ? (
                  <div className="border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-[32px] p-20 text-center space-y-4">
                    <Layers size={48} className="text-slate-400 mx-auto" />
                    <h3 className="text-xl font-bold text-slate-800 dark:text-slate-200">No active Chit groups</h3>
                    <p className="text-slate-500 text-sm max-w-sm mx-auto leading-relaxed">
                      You haven't created any groups yet. Click the button above to launch your first Chit Fund group.
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {groups.map((group) => (
                      <motion.div
                        key={group.id}
                        whileHover={{ y: -5 }}
                        className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 rounded-[32px] p-6 shadow-sm flex flex-col justify-between group relative overflow-hidden"
                      >
                        {/* Interactive glow effect */}
                        <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 dark:bg-blue-500/10 rounded-full blur-3xl group-hover:scale-150 transition-all duration-500" />
                        
                        <div>
                          <div className="flex justify-between items-start gap-4">
                            <span className="inline-flex items-center justify-center p-3 bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 rounded-2xl">
                              <Layers size={22} />
                            </span>
                            
                            <div className="flex items-center gap-1.5 relative z-10">
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.preventDefault();
                                  e.stopPropagation();
                                  openEditGroupModal(group);
                                }}
                                className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-blue-600 dark:text-slate-500 dark:hover:text-blue-400 transition-all cursor-pointer"
                                title="Edit Group"
                              >
                                <Edit3 size={16} />
                              </button>
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.preventDefault();
                                  e.stopPropagation();
                                  setGroupToDelete(group);
                                }}
                                className="p-2 rounded-xl hover:bg-red-50 dark:hover:bg-red-950/20 text-slate-400 hover:text-red-500 dark:text-slate-500 dark:hover:text-red-400 transition-all cursor-pointer"
                                title="Delete Group"
                              >
                                <Trash2 size={16} />
                              </button>
                            </div>
                          </div>

                          <h3 className="text-xl font-bold text-slate-900 dark:text-white mt-4 line-clamp-1">{group.name}</h3>
                          
                          <div className="grid grid-cols-2 gap-4 mt-5 pt-5 border-t border-slate-100 dark:border-slate-800">
                            <div>
                              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Total Value</p>
                              <p className="text-base font-black text-slate-800 dark:text-slate-200 mt-0.5">
                                {formatCurrency(group.totalAmount)}
                              </p>
                            </div>
                            <div>
                              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Monthly Due</p>
                              <p className="text-base font-black text-slate-800 dark:text-slate-200 mt-0.5">
                                {formatCurrency(group.monthlyContribution)}
                              </p>
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-4 mt-4">
                            <div>
                              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Duration</p>
                              <p className="text-sm font-bold text-slate-600 dark:text-slate-400 mt-0.5">
                                {group.duration} Months
                              </p>
                            </div>
                            <div>
                              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Members</p>
                              <p className="text-sm font-bold text-slate-600 dark:text-slate-400 mt-0.5">
                                {group._count?.members || 0} / {group.membersLimit} Enrolled
                              </p>
                            </div>
                          </div>
                        </div>

                        <button
                          onClick={() => setSelectedGroup(group)}
                          className="w-full mt-6 h-11 bg-slate-50 hover:bg-blue-600 dark:bg-slate-900/60 dark:hover:bg-blue-600 text-slate-700 hover:text-white dark:text-slate-300 font-bold text-xs uppercase tracking-wider rounded-2xl flex items-center justify-center gap-2 border border-slate-200/50 dark:border-slate-800/80 hover:border-transparent transition-all active:scale-[0.98]"
                        >
                          Manage Group
                          <ChevronRight size={16} />
                        </button>
                      </motion.div>
                    ))}
                  </div>
                )}
              </motion.div>
            ) : (
              
              // ---------------- SELECTED GROUP ACTIONS CONSOLE ----------------
              <motion.div
                key="group-workspace"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                className="space-y-8"
              >
                {/* Navigation Back Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-2 border-b border-slate-200/60 dark:border-slate-800/80">
                  <div className="space-y-1.5">
                    <button 
                      onClick={() => setSelectedGroup(null)}
                      className="inline-flex items-center gap-2 text-xs font-bold text-blue-600 hover:text-blue-700 uppercase tracking-wider transition-colors"
                    >
                      <ArrowLeft size={14} /> Back to groups catalog
                    </button>
                    <h1 className="text-3xl font-black text-slate-900 dark:text-white leading-tight">
                      {selectedGroup.name}
                    </h1>
                    <div className="flex items-center gap-4 text-xs font-bold text-slate-500">
                      <span>Total: {formatCurrency(selectedGroup.totalAmount)}</span>
                      <span className="w-1.5 h-1.5 bg-slate-300 dark:bg-slate-700 rounded-full" />
                      <span>Monthly Due: {formatCurrency(selectedGroup.monthlyContribution)}</span>
                      <span className="w-1.5 h-1.5 bg-slate-300 dark:bg-slate-700 rounded-full" />
                      <span>Duration: {selectedGroup.duration} Months</span>
                    </div>
                  </div>

                  {/* Tab Switching Selector */}
                  <div className="flex p-1 bg-slate-100 dark:bg-slate-950 rounded-2xl border border-slate-200/50 dark:border-slate-800/80 self-start md:self-auto">
                    <button
                      onClick={() => setActiveTab('payments')}
                      className={cn(
                        "px-5 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider transition-all",
                        activeTab === 'payments' 
                          ? "bg-white dark:bg-slate-900 text-blue-600 dark:text-white shadow-sm" 
                          : "text-slate-500 hover:text-slate-800 dark:hover:text-slate-300"
                      )}
                    >
                      Payments Tracker
                    </button>
                    <button
                      onClick={() => setActiveTab('members')}
                      className={cn(
                        "px-5 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider transition-all",
                        activeTab === 'members' 
                          ? "bg-white dark:bg-slate-900 text-blue-600 dark:text-white shadow-sm" 
                          : "text-slate-500 hover:text-slate-800 dark:hover:text-slate-300"
                      )}
                    >
                      Members list
                    </button>
                  </div>
                </div>

                {/* ---------------- PAYMENTS TRACKER TAB ---------------- */}
                {activeTab === 'payments' && (
                  <div className="space-y-8 animate-fadeIn">
                    
                    {/* Month selector and metrics summary */}
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                      <div className="flex flex-wrap items-center gap-6">
                        {/* Active Cycle Selector */}
                        <div className="flex items-center gap-3">
                          <Calendar size={20} className="text-blue-500" />
                          <span className="text-sm font-bold text-slate-700 dark:text-slate-300">Active Cycle:</span>
                          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-1.5 shadow-sm">
                            <select 
                              value={selectedMonth}
                              onChange={(e) => setSelectedMonth(Number(e.target.value))}
                              className="bg-transparent border-none text-xs font-black text-slate-800 dark:text-slate-200 focus:ring-0 cursor-pointer pr-8 uppercase tracking-wider"
                            >
                              {Array.from({ length: selectedGroup.duration }, (_, i) => i + 1).map(m => (
                                <option key={m} value={m} className="bg-white dark:bg-slate-950 text-slate-900 dark:text-white">
                                  Month {m}
                                </option>
                              ))}
                            </select>
                          </div>
                        </div>

                        {/* Chit Lift Selector */}
                        <div className="flex items-center gap-3 flex-wrap">
                          <TrendingUp size={20} className="text-amber-500" />
                          <span className="text-sm font-bold text-slate-700 dark:text-slate-300">Chit Lifted By:</span>
                          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-1.5 shadow-sm">
                            <select 
                              value={selectedWinnerId}
                              onChange={async (e) => {
                                const winnerId = e.target.value;
                                setSelectedWinnerId(winnerId);
                                try {
                                  const res = await fetch('/api/admin/customers', {
                                    method: 'PATCH',
                                    headers: { 'Content-Type': 'application/json' },
                                    body: JSON.stringify({
                                      groupId: selectedGroup.id,
                                      month: selectedMonth,
                                      winnerId: winnerId
                                    })
                                  });
                                  if (res.ok) {
                                    toast.success(winnerId === 'none' ? "Chit lift cleared successfully!" : "Chit lift winner updated successfully!");
                                    fetchGroupMembers(selectedGroup.id);
                                  } else {
                                    const errData = await res.json();
                                    toast.error(errData.error || "Failed to update winner");
                                  }
                                } catch (err) {
                                  toast.error("Connection error");
                                }
                              }}
                              className="bg-transparent border-none text-xs font-black text-slate-800 dark:text-slate-200 focus:ring-0 cursor-pointer pr-8 uppercase tracking-wider"
                            >
                              <option value="none" className="bg-white dark:bg-slate-950 text-slate-900 dark:text-white">Unclaimed / None</option>
                              {members.map(m => (
                                <option key={m.id} value={m.id} className="bg-white dark:bg-slate-950 text-slate-900 dark:text-white">
                                  {m.name}
                                </option>
                              ))}
                            </select>
                          </div>
                        </div>
                      </div>

                      <div className="text-xs text-slate-400 font-bold italic">
                        Note: Lifted members will be charged their updated lift amount from the next monthly cycle.
                      </div>
                    </div>

                    {/* Stats cards for active month */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                      <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200/60 dark:border-slate-800/80 shadow-sm flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-blue-50 dark:bg-blue-900/10 flex items-center justify-center text-blue-600 dark:text-blue-400 shadow-inner">
                          <Users size={22} />
                        </div>
                        <div>
                          <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Enrolled Members</p>
                          <p className="text-2xl font-black text-slate-900 dark:text-white mt-0.5">{stats.totalMembers}</p>
                        </div>
                      </div>

                      <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200/60 dark:border-slate-800/80 shadow-sm flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-emerald-50 dark:bg-emerald-900/10 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shadow-inner">
                          <CheckCircle2 size={22} />
                        </div>
                        <div>
                          <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Paid Members</p>
                          <p className="text-2xl font-black text-slate-900 dark:text-white mt-0.5">{stats.paidCount}</p>
                        </div>
                      </div>

                      <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200/60 dark:border-slate-800/80 shadow-sm flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-amber-50 dark:bg-amber-900/10 flex items-center justify-center text-amber-600 dark:text-amber-400 shadow-inner">
                          <Clock size={22} />
                        </div>
                        <div>
                          <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Pending Members</p>
                          <p className="text-2xl font-black text-slate-900 dark:text-white mt-0.5">{stats.pendingCount}</p>
                        </div>
                      </div>

                      <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200/60 dark:border-slate-800/80 shadow-sm flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-indigo-50 dark:bg-indigo-900/10 flex items-center justify-center text-indigo-600 dark:text-indigo-400 shadow-inner">
                          <DollarSign size={22} />
                        </div>
                        <div>
                          <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Collected (Month {selectedMonth})</p>
                          <p className="text-2xl font-black text-slate-900 dark:text-white mt-0.5">{formatCurrency(stats.totalCollected)}</p>
                        </div>
                      </div>
                    </div>

                    {/* Member payments table - Desktop Only */}
                    <div className="hidden md:block bg-white dark:bg-slate-900 rounded-[28px] border border-slate-200 dark:border-slate-800/80 shadow-sm overflow-hidden">
                      <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                          <thead>
                            <tr className="border-b border-slate-100 dark:border-slate-800/80">
                              <th className="px-8 py-4.5 text-[9px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500">Member details</th>
                              <th className="px-8 py-4.5 text-[9px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500">Chit Lifted</th>
                              <th className="px-8 py-4.5 text-[9px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500">Monthly due amount (₹)</th>
                              <th className="px-8 py-4.5 text-[9px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500">Payment Status</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-50 dark:divide-slate-800/50">
                            {isLoadingMembers ? (
                              <tr>
                                <td colSpan={4} className="py-20 text-center">
                                  <Loader2 className="w-8 h-8 text-blue-600 animate-spin mx-auto mb-2" />
                                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Syncing members data...</p>
                                </td>
                              </tr>
                            ) : filteredMembers.length === 0 ? (
                              <tr>
                                <td colSpan={4} className="py-20 text-center">
                                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider italic">No members in this group yet</p>
                                </td>
                              </tr>
                            ) : filteredMembers.map((member) => {
                              const payment = member.payments?.find((p: any) => p.month === selectedMonth);
                              const isPaid = payment?.status === 'PAID';
                              const isEditingAmount = editingAmountUserId === member.id;

                              return (
                                <tr key={member.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/20 transition-colors">
                                  <td className="px-8 py-4.5">
                                    <div className="flex items-center gap-3">
                                      <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white text-xs font-black flex items-center justify-center">
                                        {member.name.charAt(0).toUpperCase()}
                                      </div>
                                      <div>
                                        <p className="text-sm font-bold text-slate-800 dark:text-white">{member.name}</p>
                                        <p className="text-[10px] text-slate-400 font-bold mt-0.5">{member.phone}</p>
                                      </div>
                                    </div>
                                  </td>
                                  <td className="px-8 py-4.5">
                                    {member.liftedMonths && member.liftedMonths.length > 0 ? (
                                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl text-[10px] font-black uppercase tracking-wider bg-amber-500/10 text-amber-600 dark:bg-amber-500/20 dark:text-amber-400 border border-amber-500/20">
                                        🏆 Month {member.liftedMonths.join(', ')}
                                      </span>
                                    ) : (
                                      <span className="text-xs text-slate-400 font-bold">-</span>
                                    )}
                                  </td>
                                  <td className="px-8 py-4.5">
                                    <div className="flex items-center gap-2.5">
                                      {(() => {
                                        const dbValue = payment?.amount || selectedGroup.monthlyContribution;
                                        const currentInputValue = customAmounts[member.id] !== undefined ? customAmounts[member.id] : dbValue.toString();
                                        const isWinner = member.liftedMonths?.includes(selectedMonth);
                                        const hasWonBefore = member.liftedMonths?.some((wonMonth: number) => wonMonth < selectedMonth);
                                        const isChanged = parseFloat(currentInputValue) !== dbValue && currentInputValue !== '';

                                        return (
                                          <>
                                            <div className="relative flex items-center">
                                              <span className="absolute left-3 text-xs font-black text-slate-400 pointer-events-none">₹</span>
                                              <input 
                                                type="number"
                                                value={currentInputValue}
                                                onChange={(e) => setCustomAmounts({
                                                  ...customAmounts,
                                                  [member.id]: e.target.value
                                                })}
                                                placeholder={selectedGroup.monthlyContribution.toString()}
                                                className={cn(
                                                  "w-32 h-10 pl-7 pr-3 rounded-xl border text-xs font-black transition-all focus:outline-none focus:ring-2",
                                                  hasWonBefore
                                                    ? "border-emerald-400 dark:border-emerald-700 bg-emerald-500/[0.04] text-emerald-600 dark:text-emerald-400 focus:ring-emerald-500/20"
                                                    : isWinner
                                                    ? "border-amber-400 dark:border-amber-700 bg-amber-500/[0.04] text-amber-600 dark:text-amber-400 focus:ring-amber-500/20"
                                                    : "border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-800 dark:text-slate-200 focus:ring-blue-500/20"
                                                )}
                                              />
                                            </div>

                                            <button
                                              onClick={() => handleSaveCustomAmount(member.id)}
                                              className={cn(
                                                "p-2.5 rounded-xl transition-all flex items-center justify-center shadow-sm active:scale-95 border",
                                                isChanged 
                                                  ? "bg-emerald-500 border-emerald-400 hover:bg-emerald-600 text-white animate-pulse" 
                                                  : "bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-400 dark:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800"
                                              )}
                                              title={isChanged ? "Click to Save Changes" : "Amount Saved"}
                                            >
                                              <Check size={14} className={isChanged ? "stroke-[3px]" : ""} />
                                            </button>

                                            {isWinner && (
                                              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-amber-500/10 text-amber-600 dark:bg-amber-500/20 dark:text-amber-400 border border-amber-500/20 animate-pulse">
                                                Winner
                                              </span>
                                            )}

                                            

                                            {payment?.amount && payment.amount !== selectedGroup.monthlyContribution && !isWinner && !hasWonBefore && (
                                              <span className="text-[8px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded-md bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 border border-blue-100 dark:border-blue-900/30">
                                                Modified
                                              </span>
                                            )}
                                          </>
                                        );
                                      })()}
                                    </div>
                                  </td>
                                  <td className="px-8 py-4.5">
                                    <div className="flex items-center gap-3">
                                      <span className={cn(
                                        "inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider",
                                        isPaid 
                                          ? "bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-900/30" 
                                          : "bg-amber-50 dark:bg-amber-950/30 text-amber-600 dark:text-amber-400 border border-amber-100 dark:border-amber-900/30"
                                      )}>
                                        {isPaid ? "Paid" : "Pending"}
                                      </span>

                                      <button
                                        onClick={() => handleTogglePaymentStatus(member.id, isPaid ? 'PAID' : 'PENDING')}
                                        className={cn(
                                          "text-[10px] font-black uppercase tracking-wider px-3 py-1 rounded-xl border transition-all active:scale-[0.96]",
                                          isPaid
                                            ? "border-amber-200 dark:border-amber-900/30 text-amber-600 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-950/20"
                                            : "border-emerald-200 dark:border-emerald-900/30 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/20"
                                        )}
                                      >
                                        {isPaid ? "Mark Pending" : "Mark Paid"}
                                      </button>
                                    </div>
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    </div>

                    {/* Mobile-friendly card list (visible on small screens) */}
                    <div className="grid grid-cols-1 gap-4 md:hidden">
                      {isLoadingMembers ? (
                        <div className="py-20 text-center bg-white dark:bg-slate-900 rounded-[28px] border border-slate-200 dark:border-slate-800">
                          <Loader2 className="w-8 h-8 text-blue-600 animate-spin mx-auto mb-2" />
                          <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Syncing members data...</p>
                        </div>
                      ) : filteredMembers.length === 0 ? (
                        <div className="py-20 text-center bg-white dark:bg-slate-900 rounded-[28px] border border-slate-200 dark:border-slate-800">
                          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider italic">No members in this group yet</p>
                        </div>
                      ) : (
                        filteredMembers.map(member => {
                          const payment = member.payments?.find((p: any) => p.month === selectedMonth);
                          const isPaid = payment?.status === 'PAID';
                          const dbValue = payment?.amount || selectedGroup.monthlyContribution;
                          const currentInputValue = customAmounts[member.id] !== undefined ? customAmounts[member.id] : dbValue.toString();
                          const isWinner = member.liftedMonths?.includes(selectedMonth);
                          const hasWonBefore = member.liftedMonths?.some((wonMonth: number) => wonMonth < selectedMonth);
                          const isChanged = parseFloat(currentInputValue) !== dbValue && currentInputValue !== '';

                          return (
                            <div 
                              key={member.id} 
                              className={cn(
                                "bg-white dark:bg-slate-900 p-5 rounded-[24px] border transition-all space-y-4 shadow-sm relative overflow-hidden",
                                hasWonBefore
                                  ? "border-emerald-200 dark:border-emerald-800/80 bg-emerald-500/[0.01]"
                                  : isWinner
                                  ? "border-amber-200 dark:border-amber-800/80 bg-amber-500/[0.01]"
                                  : "border-slate-200 dark:border-slate-800/80"
                              )}
                            >
                              {/* Member Identity & Status Badge */}
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                  <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white text-xs font-black flex items-center justify-center">
                                    {member.name.charAt(0).toUpperCase()}
                                  </div>
                                  <div>
                                    <p className="text-sm font-bold text-slate-800 dark:text-white">{member.name}</p>
                                    <p className="text-[10px] text-slate-400 font-bold">{member.phone}</p>
                                  </div>
                                </div>

                                <span className={cn(
                                  "inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider",
                                  isPaid 
                                    ? "bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-900/30" 
                                    : "bg-amber-50 dark:bg-amber-950/30 text-amber-600 dark:text-amber-400 border border-amber-100 dark:border-amber-900/30"
                                )}>
                                  {isPaid ? "Paid" : "Pending"}
                                </span>
                              </div>

                              {/* Badges/Trophy row */}
                              {((member.liftedMonths && member.liftedMonths.length > 0) || isWinner || hasWonBefore) && (
                                <div className="flex flex-wrap gap-2 pt-2 border-t border-slate-50 dark:border-slate-800/50">
                                  {member.liftedMonths && member.liftedMonths.length > 0 && (
                                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase bg-amber-500/10 text-amber-600 dark:bg-amber-500/20 dark:text-amber-400 border border-amber-500/20">
                                      🏆 Month {member.liftedMonths.join(', ')}
                                    </span>
                                  )}
                                  {isWinner && (
                                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-black uppercase bg-amber-500/10 text-amber-600 dark:bg-amber-500/20 dark:text-amber-400 border border-amber-500/20 animate-pulse">
                                      Winner
                                    </span>
                                  )}
                                  
                                </div>
                              )}

                              {/* Payment Inputs & Controls */}
                              <div className="flex items-center justify-between gap-4 pt-3 border-t border-slate-50 dark:border-slate-800/50">
                                <div className="space-y-1 flex-1">
                                  <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block">Monthly Due (₹)</span>
                                  <div className="relative flex items-center">
                                    <span className="absolute left-3 text-xs font-black text-slate-400 pointer-events-none">₹</span>
                                    <input 
                                      type="number"
                                      value={currentInputValue}
                                      onChange={(e) => setCustomAmounts({
                                        ...customAmounts,
                                        [member.id]: e.target.value
                                      })}
                                      placeholder={selectedGroup.monthlyContribution.toString()}
                                      className={cn(
                                        "w-full h-10 pl-7 pr-3 rounded-xl border text-xs font-black transition-all focus:outline-none focus:ring-2",
                                        hasWonBefore
                                          ? "border-emerald-400 dark:border-emerald-700 bg-emerald-500/[0.04] text-emerald-600 dark:text-emerald-400 focus:ring-emerald-500/20"
                                          : isWinner
                                          ? "border-amber-400 dark:border-amber-700 bg-amber-500/[0.04] text-amber-600 dark:text-amber-400 focus:ring-amber-500/20"
                                          : "border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-800 dark:text-slate-200 focus:ring-blue-500/20"
                                      )}
                                    />
                                  </div>
                                </div>

                                <div className="flex items-end gap-2 h-16 pt-5">
                                  <button
                                    onClick={() => handleSaveCustomAmount(member.id)}
                                    className={cn(
                                      "h-10 px-3.5 rounded-xl transition-all flex items-center justify-center shadow-sm active:scale-95 border",
                                      isChanged 
                                        ? "bg-emerald-500 border-emerald-400 hover:bg-emerald-600 text-white animate-pulse" 
                                        : "bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-400 dark:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800"
                                    )}
                                    title={isChanged ? "Save Custom Amount" : "Amount Saved"}
                                  >
                                    <Check size={16} className={isChanged ? "stroke-[3px]" : ""} />
                                  </button>

                                  <button
                                    onClick={() => handleTogglePaymentStatus(member.id, isPaid ? 'PAID' : 'PENDING')}
                                    className={cn(
                                      "h-10 px-3 rounded-xl border text-[10px] font-black uppercase tracking-wider transition-all active:scale-[0.96]",
                                      isPaid
                                        ? "border-amber-200 dark:border-amber-900/30 text-amber-600 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-950/20"
                                        : "border-emerald-200 dark:border-emerald-900/30 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/20"
                                    )}
                                  >
                                    {isPaid ? "Pending" : "Paid"}
                                  </button>
                                </div>
                              </div>
                            </div>
                          );
                        })
                      )}
                    </div>
                  </div>
                )}

                {/* ---------------- MEMBERS DIRECTORY TAB ---------------- */}
                {activeTab === 'members' && (
                  <div className="space-y-6 animate-fadeIn">
                    
                    {/* Add member button and search filter */}
                    <div className="flex flex-col sm:flex-row gap-4 justify-between items-center">
                      <div className="relative w-full max-w-md">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                        <input 
                          type="text" 
                          placeholder="Search enrolled members..." 
                          value={memberSearchQuery}
                          onChange={(e) => setMemberSearchQuery(e.target.value)}
                          className="w-full h-11 pl-11 pr-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-medium text-xs shadow-sm"
                        />
                      </div>

                      <button
                        onClick={() => setIsMemberModalOpen(true)}
                        className="w-full sm:w-auto h-11 px-5 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all shadow-md active:scale-[0.98]"
                      >
                        <Plus size={16} />
                        Add Member Name & Phone
                      </button>
                    </div>

                    {/* Members List Cards */}
                    {isLoadingMembers ? (
                      <div className="py-20 text-center">
                        <Loader2 className="w-8 h-8 text-blue-600 animate-spin mx-auto mb-2" />
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Syncing Enrolments...</p>
                      </div>
                    ) : filteredMembers.length === 0 ? (
                      <div className="border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-3xl p-16 text-center space-y-3">
                        <Users size={36} className="text-slate-400 mx-auto" />
                        <h4 className="text-lg font-bold text-slate-800 dark:text-slate-200">No members enrolled</h4>
                        <p className="text-slate-500 text-xs max-w-xs mx-auto">
                          Click the button above to add members to this group with their Name and Phone number.
                        </p>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredMembers.map((member) => (
                          <div 
                            key={member.id}
                            className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 rounded-3xl p-5 shadow-sm flex items-center justify-between group"
                          >
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-2xl bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-black flex items-center justify-center border border-slate-100 dark:border-slate-700">
                                {member.name.charAt(0).toUpperCase()}
                              </div>
                              <div>
                                <h4 className="text-sm font-bold text-slate-800 dark:text-white">{member.name}</h4>
                                <p className="text-[10px] text-slate-400 font-bold mt-0.5 flex items-center gap-1">
                                  <Phone size={10} />
                                  {member.phone}
                                </p>
                              </div>
                            </div>

                            <button
                              onClick={() => setMemberToDelete(member)}
                              className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-xl transition-all"
                              title="Remove from group"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </PageWrapper>

      {/* ========================================================================= */}
      {/* -------------------------- MODALS & POP-UPS -------------------------- */}
      {/* ========================================================================= */}

      {/* --- CREATE / EDIT GROUP MODAL --- */}
      <AnimatePresence>
        {isGroupModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsGroupModalOpen(false)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            />
            
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-[32px] p-8 shadow-2xl border border-slate-200 dark:border-slate-800"
            >
              <h3 className="text-2xl font-black text-slate-900 dark:text-white leading-none mb-6">
                {editingGroup ? "Edit Chit Group" : "Create Chit Group"}
              </h3>
              
              <form onSubmit={handleCreateOrUpdateGroup} className="space-y-5">
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Group Name *</label>
                  <input 
                    type="text" 
                    value={groupFormData.name}
                    onChange={(e) => setGroupFormData({...groupFormData, name: e.target.value})}
                    placeholder="e.g. Diamond Monthly 5K"
                    className="w-full h-12 px-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-sm font-semibold"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Total Pool Value (₹) *</label>
                    <input 
                      type="number" 
                      value={groupFormData.totalValue}
                      onChange={(e) => setGroupFormData({...groupFormData, totalValue: e.target.value})}
                      placeholder="100000"
                      className="w-full h-12 px-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-sm font-semibold"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Monthly Contribution *</label>
                    <input 
                      type="number" 
                      value={groupFormData.monthlyContribution}
                      onChange={(e) => setGroupFormData({...groupFormData, monthlyContribution: e.target.value})}
                      placeholder="5000"
                      className="w-full h-12 px-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-sm font-semibold"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">New Due Amount After Chit Lift (₹)</label>
                  <input 
                    type="number" 
                    value={groupFormData.liftedContribution}
                    onChange={(e) => setGroupFormData({...groupFormData, liftedContribution: e.target.value})}
                    placeholder="e.g. 7500"
                    className="w-full h-12 px-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-sm font-semibold"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Duration (Months)</label>
                    <input 
                      type="number" 
                      value={groupFormData.durationMonths}
                      onChange={(e) => setGroupFormData({...groupFormData, durationMonths: e.target.value})}
                      placeholder="12"
                      className="w-full h-12 px-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-sm font-semibold"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Members Limit</label>
                    <input 
                      type="number" 
                      value={groupFormData.membersLimit}
                      onChange={(e) => setGroupFormData({...groupFormData, membersLimit: e.target.value})}
                      placeholder="20"
                      className="w-full h-12 px-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-sm font-semibold"
                      required
                    />
                  </div>
                </div>

                <div className="mt-8 flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsGroupModalOpen(false)}
                    className="flex-1 h-12 rounded-2xl border border-slate-200 dark:border-slate-800 font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all text-xs uppercase tracking-wider"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmittingGroup}
                    className="flex-1 h-12 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-black transition-all flex items-center justify-center gap-2 text-xs uppercase tracking-wider shadow-lg shadow-blue-500/20"
                  >
                    {isSubmittingGroup ? <Loader2 size={16} className="animate-spin" /> : editingGroup ? "Update Group" : "Create Group"}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* --- ADD GROUP MEMBER MODAL --- */}
      <AnimatePresence>
        {isMemberModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMemberModalOpen(false)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            />
            
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative w-full max-w-sm bg-white dark:bg-slate-900 rounded-[32px] p-8 shadow-2xl border border-slate-200 dark:border-slate-800"
            >
              <h3 className="text-xl font-black text-slate-900 dark:text-white leading-none mb-6">
                Add Group Member
              </h3>
              
              <form onSubmit={handleAddMember} className="space-y-5">
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Member Name *</label>
                  <input 
                    type="text" 
                    value={memberFormData.name}
                    onChange={(e) => setMemberFormData({...memberFormData, name: e.target.value})}
                    placeholder="e.g. Rahul Sharma"
                    className="w-full h-12 px-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-sm font-semibold"
                    required
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Phone Number *</label>
                  <input 
                    type="text" 
                    value={memberFormData.phone}
                    onChange={(e) => setMemberFormData({...memberFormData, phone: e.target.value})}
                    placeholder="e.g. 9876543210"
                    className="w-full h-12 px-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-sm font-semibold"
                    required
                  />
                </div>

                <div className="mt-8 flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsMemberModalOpen(false)}
                    className="flex-1 h-12 rounded-2xl border border-slate-200 dark:border-slate-800 font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all text-xs uppercase tracking-wider"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmittingMember}
                    className="flex-1 h-12 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-black transition-all flex items-center justify-center gap-2 text-xs uppercase tracking-wider shadow-lg shadow-blue-500/20"
                  >
                    {isSubmittingMember ? <Loader2 size={16} className="animate-spin" /> : "Onboard Member"}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* --- CONFIRM GROUP DELETE MODAL --- */}
      <AnimatePresence>
        {groupToDelete && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setGroupToDelete(null)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            />
            
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative w-full max-w-sm bg-white dark:bg-slate-900 rounded-[32px] p-6 shadow-2xl border border-slate-200 dark:border-slate-800"
            >
              <div className="w-12 h-12 rounded-2xl bg-red-50 dark:bg-red-950/30 flex items-center justify-center text-red-600 dark:text-red-400 mb-4">
                <AlertTriangle size={24} />
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">Delete Chit Group</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 leading-relaxed">
                Are you sure you want to delete <span className="font-bold text-slate-800 dark:text-slate-200">{groupToDelete.name}</span>? This action is permanent and will delete all member relationships and payments in this group.
              </p>
              
              <div className="mt-6 flex gap-3">
                <button
                  onClick={() => setGroupToDelete(null)}
                  className="flex-1 h-11 rounded-xl border border-slate-200 dark:border-slate-800 font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all text-xs uppercase tracking-wider"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteGroup}
                  className="flex-1 h-11 rounded-xl bg-red-600 hover:bg-red-700 text-white font-black transition-all flex items-center justify-center gap-1.5 text-xs uppercase tracking-wider shadow-lg shadow-red-500/20"
                >
                  Delete Group
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* --- CONFIRM MEMBER REMOVE MODAL --- */}
      <AnimatePresence>
        {memberToDelete && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMemberToDelete(null)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            />
            
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative w-full max-w-sm bg-white dark:bg-slate-900 rounded-[32px] p-6 shadow-2xl border border-slate-200 dark:border-slate-800"
            >
              <div className="w-12 h-12 rounded-2xl bg-red-50 dark:bg-red-950/30 flex items-center justify-center text-red-600 dark:text-red-400 mb-4">
                <AlertTriangle size={24} />
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">Remove Member</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 leading-relaxed">
                Are you sure you want to remove <span className="font-bold text-slate-800 dark:text-slate-200">{memberToDelete.name}</span> from the group <span className="font-bold text-slate-800 dark:text-slate-200">{selectedGroup.name}</span>? This will wipe their payment history for this group.
              </p>
              
              <div className="mt-6 flex gap-3">
                <button
                  onClick={() => setMemberToDelete(null)}
                  className="flex-1 h-11 rounded-xl border border-slate-200 dark:border-slate-800 font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all text-xs uppercase tracking-wider"
                >
                  Cancel
                </button>
                <button
                  onClick={handleRemoveMember}
                  disabled={isDeletingMember}
                  className="flex-1 h-11 rounded-xl bg-red-600 hover:bg-red-700 text-white font-black transition-all flex items-center justify-center gap-1.5 text-xs uppercase tracking-wider shadow-lg shadow-red-500/20"
                >
                  {isDeletingMember ? <Loader2 size={16} className="animate-spin" /> : <><UserX size={16} /> Remove</>}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </AdminLayout>
  );
}
