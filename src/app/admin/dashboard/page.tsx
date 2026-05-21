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
  IndianRupee,
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
  Download,
  MessageCircle,
  BarChart2,
  Percent,
  Sparkles,
  Send,
  Trophy,
  Copy,
  X
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import PageWrapper from '@/components/layout/PageWrapper';
import { GroupsCatalogSkeleton, PaymentsTableSkeleton } from '@/components/ui/Skeleton';
import { AdminStatCard, AdminMetricCard } from '@/components/admin/AdminStatCard';
import { CustomSelect } from '@/components/ui/CustomSelect';
import { toast } from 'sonner';

export default function Dashboard() {
  // Navigation states
  const [groups, setGroups] = useState<any[]>([]);
  const [selectedGroup, setSelectedGroup] = useState<any | null>(null);
  const [activeTab, setActiveTab] = useState<'members' | 'payments'>('payments');
  const [isLoadingGroups, setIsLoadingGroups] = useState(true);
  const [groupSearchQuery, setGroupSearchQuery] = useState('');
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
  const [groupErrors, setGroupErrors] = useState<Record<string, string>>({});
  const [groupToDelete, setGroupToDelete] = useState<any | null>(null);

  // Member states
  const [members, setMembers] = useState<any[]>([]);
  const [isMemberModalOpen, setIsMemberModalOpen] = useState(false);
  const [memberFormData, setMemberFormData] = useState({ name: '', phone: '' });
  const [isSubmittingMember, setIsSubmittingMember] = useState(false);
  const [memberToDelete, setMemberToDelete] = useState<any | null>(null);
  const [isDeletingMember, setIsDeletingMember] = useState(false);
  const [memberSearchQuery, setMemberSearchQuery] = useState('');
  const [paymentFilter, setPaymentFilter] = useState('ALL');

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
        if (selectedGroup) {
          fetchGroupMembers(selectedGroup.id);
        }
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

  // Payment states
  const [selectedMonth, setSelectedMonth] = useState<number>(1);
  const [editingAmountUserId, setEditingAmountUserId] = useState<string | null>(null);
  const [customAmounts, setCustomAmounts] = useState<{ [userId: string]: string }>({});
  const [selectedWinnerId, setSelectedWinnerId] = useState<string>('none');
  const [winnerMessageModal, setWinnerMessageModal] = useState<{ isOpen: boolean, winner: any, text: string } | null>(null);

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
    
    // Client-side validation
    const errors: Record<string, string> = {};
    if (!groupFormData.name?.trim()) {
      errors.name = "Group Name is required";
    }
    
    if (!groupFormData.totalValue) {
      errors.totalValue = "Total Pool Value is required";
    } else if (isNaN(Number(groupFormData.totalValue)) || Number(groupFormData.totalValue) <= 0) {
      errors.totalValue = "Must be a valid positive number";
    }

    if (!groupFormData.monthlyContribution) {
      errors.monthlyContribution = "Monthly contribution is required";
    } else if (isNaN(Number(groupFormData.monthlyContribution)) || Number(groupFormData.monthlyContribution) <= 0) {
      errors.monthlyContribution = "Must be a valid positive number";
    }

    if (!groupFormData.durationMonths) {
      errors.durationMonths = "Duration is required";
    } else if (isNaN(Number(groupFormData.durationMonths)) || Number(groupFormData.durationMonths) <= 0) {
      errors.durationMonths = "Must be a valid positive integer";
    }

    if (!groupFormData.membersLimit) {
      errors.membersLimit = "Members limit is required";
    } else if (isNaN(Number(groupFormData.membersLimit)) || Number(groupFormData.membersLimit) <= 0) {
      errors.membersLimit = "Must be a valid positive integer";
    }

    if (Object.keys(errors).length > 0) {
      setGroupErrors(errors);
      toast.error("Please correct the form errors before submitting");
      return;
    }

    setGroupErrors({});
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
    if (!memberFormData.name || !memberFormData.phone || memberFormData.phone.length !== 10) {
      toast.error("Name and a valid 10-digit Phone number are required");
      return;
    }

    if (selectedGroup && members.length >= selectedGroup.membersLimit) {
      toast.error(`Cannot add more members. Group limit of ${selectedGroup.membersLimit} reached.`);
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
    const currentMember = members.find(m => m.id === userId);

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

  const exportToCSV = () => {
    if (!selectedGroup) return;

    const headers = ['Member Name', 'Phone', 'Chit Lifted', 'Monthly Due', 'Payment Status', 'Cycle'];

    const rows = filteredMembers.map(m => {
      const payment = m.payments?.find((p: any) => p.month === selectedMonth);
      const isPaid = payment?.status === 'PAID';
      const dueAmount = parseFloat(customAmounts[m.id]) || selectedGroup.monthlyContribution;
      const isWinner = selectedWinnerId === m.id;
      const hasWonBefore = m.liftedMonths && m.liftedMonths.some((month: number) => month < selectedMonth);
      const liftStatus = isWinner ? 'Winner this month' : hasWonBefore ? 'Lifted previously' : 'Not lifted';

      return [
        m.name,
        m.phone,
        liftStatus,
        dueAmount,
        isPaid ? 'PAID' : 'PENDING',
        `Month ${selectedMonth}`
      ];
    });

    const csvContent = [
      headers.join(','),
      ...rows.map(r => r.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `${selectedGroup.name}_Month_${selectedMonth}_Ledger.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("Ledger downloaded successfully!");
  };

  const sendWhatsAppStatusMessage = (member: any) => {
    const payment = member.payments?.find((p: any) => p.month === selectedMonth);
    const isPaid = payment?.status === 'PAID';
    const amountVal = payment?.amount || parseFloat(customAmounts[member.id]) || selectedGroup?.monthlyContribution;
    const totalMonths = selectedGroup?.duration;

    const monthNames = ['January','February','March','April','May','June',
                        'July','August','September','October','November','December'];
    const now = new Date();
    const calMonth = monthNames[now.getMonth()];
    const calYear = now.getFullYear();

    let text = '';
    if (isPaid) {
      text = `Hi ${member.name},\n\nWe have received your payment of ₹${amountVal} for Month ${selectedMonth} of ${totalMonths} (${calMonth} ${calYear}) in the group "${selectedGroup?.name}".\n\nThank you! ✅`;
    } else {
      text = `Hi ${member.name},\n\nYour chit contribution of ₹${amountVal} for Month ${selectedMonth} of ${totalMonths} (${calMonth} ${calYear}) in the group "${selectedGroup?.name}" is pending.\n\nPlease pay at your earliest convenience. 🙏`;
    }
    const url = `https://wa.me/91${member.phone}?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
  };

  const copyStatusMessage = (member: any) => {
    const payment = member.payments?.find((p: any) => p.month === selectedMonth);
    const isPaid = payment?.status === 'PAID';
    const amountVal = payment?.amount || parseFloat(customAmounts[member.id]) || selectedGroup?.monthlyContribution;
    const totalMonths = selectedGroup?.duration;

    const monthNames = ['January','February','March','April','May','June',
                        'July','August','September','October','November','December'];
    const now = new Date();
    const calMonth = monthNames[now.getMonth()];
    const calYear = now.getFullYear();

    let text = '';
    if (isPaid) {
      text = `Hi ${member.name},\n\nWe have received your payment of ₹${amountVal} for Month ${selectedMonth} of ${totalMonths} (${calMonth} ${calYear}) in the group "${selectedGroup?.name}".\n\nThank you! ✅`;
    } else {
      text = `Hi ${member.name},\n\nYour chit contribution of ₹${amountVal} for Month ${selectedMonth} of ${totalMonths} (${calMonth} ${calYear}) in the group "${selectedGroup?.name}" is pending.\n\nPlease pay at your earliest convenience. 🙏`;
    }

    navigator.clipboard.writeText(text);
    toast.success("Reminder/Receipt copied to clipboard!");
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

  // Global analytics computed from all groups
  const globalStats = (() => {
    const totalGroups = groups.length;
    const totalFunds = groups.reduce((sum: number, g: any) => sum + (g.totalAmount || 0), 0);
    const totalMembers = groups.reduce((sum: number, g: any) => sum + (g._count?.members || 0), 0);
    // Avg fill rate per group, capped at 100%
    const avgFillRate = totalGroups > 0
      ? Math.min(
        Math.round(
          groups.reduce((sum: number, g: any) => {
            const cap = g.membersLimit || 1;
            return sum + Math.min((g._count?.members || 0) / cap, 1);
          }, 0) / totalGroups * 100
        ),
        100
      )
      : 0;
    return { totalGroups, totalFunds, totalMembers, fillRate: avgFillRate };
  })();

  // Computations
  const filteredGroups = groups.filter(g => 
    g.name.toLowerCase().includes(groupSearchQuery.toLowerCase()) ||
    g.totalAmount.toString().includes(groupSearchQuery) ||
    g.monthlyContribution.toString().includes(groupSearchQuery)
  );

  const filteredMembers = members.filter(m => {
    const matchesSearch = m.name.toLowerCase().includes(memberSearchQuery.toLowerCase()) || m.phone.includes(memberSearchQuery);
    if (!matchesSearch) return false;

    if (paymentFilter === 'ALL') return true;

    const payment = m.payments?.find((p: any) => p.month === selectedMonth);
    const isPaid = payment?.status === 'PAID';

    if (paymentFilter === 'PAID' && isPaid) return true;
    if (paymentFilter === 'PENDING' && !isPaid) return true;

    return false;
  });

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
    setGroupErrors({});
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
    setGroupErrors({});
    setIsGroupModalOpen(true);
  };

  return (
    <AdminLayout>
      <PageWrapper>
        <div className="space-y-5 sm:space-y-6 pb-8 sm:pb-10 min-w-0">

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
                <motion.div
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="surface-card p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  <div className="min-w-0">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-blue-600 mb-1">Agent workspace</p>
                    <h1 className="text-2xl sm:text-3xl font-black text-slate-900 leading-tight">Groups &amp; Payments</h1>
                    <p className="text-slate-600 mt-1 text-sm">Create groups, track payments, and message members.</p>
                  </div>
                  <button type="button" onClick={openCreateGroupModal} className="btn-primary w-full sm:w-auto shrink-0">
                    <Plus size={18} />
                    New group
                  </button>
                </motion.div>

                {/* --- Global Analytics Cards --- */}
                {!isLoadingGroups && groups.length > 0 && (
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                    <AdminStatCard label="Total groups" value={globalStats.totalGroups} icon={Layers} tone="blue" delay={0.05} />
                    <AdminStatCard label="Total members" value={globalStats.totalMembers} icon={Users} tone="indigo" delay={0.1} />
                    <AdminStatCard label="Funds managed" value={formatCurrency(globalStats.totalFunds)} icon={IndianRupee} tone="blue" delay={0.15} />
                    <AdminStatCard label="Fill rate" value={`${globalStats.fillRate}%`} icon={Percent} tone="indigo" delay={0.2} />
                  </div>
                )}

                {/* Groups Grid */}
                {isLoadingGroups ? (
                  <GroupsCatalogSkeleton />
                ) : groups.length === 0 ? (
                  <div className="border-2 border-dashed border-slate-200 rounded-2xl p-12 sm:p-16 text-center space-y-4 bg-white">
                    <Layers size={44} className="text-slate-300 mx-auto" />
                    <h3 className="text-lg font-bold text-slate-800">No active chit groups</h3>
                    <p className="text-slate-500 text-sm max-w-sm mx-auto leading-relaxed">
                      You haven't created any groups yet. Click the button above to launch your first Chit Fund group.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {/* Groups Search Bar */}
                    <div className="relative">
                      <span className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                        <Search size={18} />
                      </span>
                      <input
                        type="text"
                        value={groupSearchQuery}
                        onChange={(e) => setGroupSearchQuery(e.target.value)}
                        placeholder="Search groups by name, pool size, or monthly contribution..."
                        className="w-full h-12 pl-11 pr-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-sm font-semibold transition-all shadow-sm"
                      />
                      {groupSearchQuery && (
                        <button
                          type="button"
                          onClick={() => setGroupSearchQuery('')}
                          className="absolute inset-y-0 right-0 pr-4 flex items-center text-xs font-black text-blue-600 hover:text-blue-700"
                        >
                          Clear
                        </button>
                      )}
                    </div>

                    {filteredGroups.length === 0 ? (
                      <div className="text-center py-12 bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800">
                        <p className="text-slate-500 font-medium text-sm">No chit groups matched &quot;{groupSearchQuery}&quot;</p>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                        {filteredGroups.map((group, idx) => (
                          <motion.div
                            key={group.id}
                            initial={{ opacity: 0, y: 12 }}
                            animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.08 + idx * 0.04 }}
                        whileHover={{ y: -3 }}
                        className="surface-card !rounded-2xl overflow-hidden flex flex-col"
                      >
                        <div className="p-4 sm:p-5 flex-1">
                          <div className="flex items-start justify-between gap-2 mb-4">
                            <div className="flex items-center gap-1.5 min-w-0">
                              <div className="w-11 h-11 rounded-xl gradient-blue flex items-center justify-center text-white shadow-md shadow-blue-500/20 shrink-0">
                                <Layers size={20} />
                              </div>
                              <ChevronRight size={18} className="text-slate-300 shrink-0" />
                            </div>
                            <div className="flex gap-1 shrink-0">
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  openEditGroupModal(group);
                                }}
                                className="p-2 rounded-lg hover:bg-blue-50 text-slate-400 hover:text-blue-600 transition-colors"
                                title="Edit"
                              >
                                <Edit3 size={15} />
                              </button>
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setGroupToDelete(group);
                                }}
                                className="p-2 rounded-lg hover:bg-red-50 text-slate-400 hover:text-red-600 transition-colors"
                                title="Delete"
                              >
                                <Trash2 size={15} />
                              </button>
                            </div>
                          </div>
                          <h3 className="text-lg font-black text-slate-900 line-clamp-2 leading-snug">{group.name}</h3>
                          <div className="grid grid-cols-2 gap-3 mt-4 pt-4 border-t border-slate-100 text-sm">
                            <div>
                              <p className="text-[10px] font-bold text-slate-500 uppercase">Pool</p>
                              <p className="font-bold text-slate-900">{formatCurrency(group.totalAmount)}</p>
                            </div>
                            <div>
                              <p className="text-[10px] font-bold text-slate-500 uppercase">Monthly</p>
                              <p className="font-bold text-slate-900">{formatCurrency(group.monthlyContribution)}</p>
                            </div>
                            <div>
                              <p className="text-[10px] font-bold text-slate-500 uppercase">Duration</p>
                              <p className="font-semibold text-slate-700">{group.duration} mo</p>
                            </div>
                            <div>
                              <p className="text-[10px] font-bold text-slate-500 uppercase">Members</p>
                              <p className="font-semibold text-slate-700">
                                {group._count?.members || 0}/{group.membersLimit}
                              </p>
                            </div>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => setSelectedGroup(group)}
                          className="w-full py-3.5 bg-slate-50 hover:bg-blue-600 text-slate-700 hover:text-white font-bold text-xs uppercase tracking-wide flex items-center justify-center gap-2 border-t border-slate-100 transition-all duration-200"
                        >
                          Manage group
                        </button>
                      </motion.div>
                    ))}
                      </div>
                    )}
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
                className="space-y-5 sm:space-y-6 min-w-0"
              >
                <div className="surface-card p-4 sm:p-5 space-y-4">
                  <button
                    type="button"
                    onClick={() => setSelectedGroup(null)}
                    className="inline-flex items-center gap-2 pl-1 pr-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-700 text-sm font-semibold hover:bg-blue-50 hover:border-blue-200 hover:text-blue-700 transition-all group"
                  >
                    <span className="flex items-center justify-center w-7 h-7 rounded-lg bg-blue-100 text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                      <ArrowLeft size={14} />
                    </span>
                    Back to groups
                  </button>
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
                    <div className="min-w-0 flex items-start gap-3">
                      <div className="w-12 h-12 rounded-xl gradient-blue flex items-center justify-center text-white shrink-0 shadow-md shadow-blue-500/20">
                        <Layers size={22} />
                      </div>
                      <div className="min-w-0">
                        <h1 className="text-xl sm:text-2xl font-black text-slate-900 leading-tight truncate">
                          {selectedGroup.name}
                        </h1>
                        <div className="flex flex-wrap gap-x-3 gap-y-1 text-xs text-slate-500 font-medium mt-1">
                          <span>{formatCurrency(selectedGroup.totalAmount)} pool</span>
                          <span>·</span>
                          <span>{formatCurrency(selectedGroup.monthlyContribution)}/mo</span>
                          <span>·</span>
                          <span>{selectedGroup.duration} months</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex w-full sm:w-auto p-1 bg-slate-100 rounded-xl border border-slate-200">
                      {(['payments', 'members'] as const).map((tab) => (
                        <button
                          key={tab}
                          type="button"
                          onClick={() => setActiveTab(tab)}
                          className={cn(
                            'flex-1 sm:flex-none px-4 py-2.5 rounded-lg text-xs font-bold uppercase tracking-wide transition-all duration-200',
                            activeTab === tab
                              ? 'bg-white text-blue-700 shadow-sm'
                              : 'text-slate-500 hover:text-slate-800'
                          )}
                        >
                          {tab === 'payments' ? 'Payments' : 'Members'}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* ---------------- PAYMENTS TRACKER TAB ---------------- */}
                {activeTab === 'payments' && (
                  <div className="space-y-4 sm:space-y-5">

                    <div className="surface-card p-4 sm:p-5 space-y-4">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="flex flex-col gap-1.5">
                          <span className="text-xs font-bold text-slate-600 flex items-center gap-2">
                            <Calendar size={16} className="text-blue-600" /> Active month
                          </span>
                          <CustomSelect
                            value={String(selectedMonth)}
                            onChange={(val) => setSelectedMonth(Number(val))}
                            options={Array.from({ length: selectedGroup.duration }, (_, i) => ({
                              value: String(i + 1),
                              label: `Month ${i + 1}`,
                            }))}
                          />
                        </div>
                        <div className="flex flex-col gap-1.5">
                          <span className="text-xs font-bold text-slate-600 flex items-center gap-2">
                            <TrendingUp size={16} className="text-amber-600" /> Chit lifted by
                          </span>
                          <CustomSelect
                            value={selectedWinnerId}
                            onChange={async (winnerId) => {
                              setSelectedWinnerId(winnerId);
                              try {
                                const res = await fetch('/api/admin/customers', {
                                  method: 'PATCH',
                                  headers: { 'Content-Type': 'application/json' },
                                  body: JSON.stringify({
                                    groupId: selectedGroup.id,
                                    month: selectedMonth,
                                    winnerId,
                                  }),
                                });
                                if (res.ok) {
                                  toast.success(
                                    winnerId === 'none'
                                      ? 'Chit lift cleared successfully!'
                                      : 'Chit lift winner updated successfully!'
                                  );
                                  if (winnerId !== 'none') {
                                    const winner = members.find((m) => m.id === winnerId);
                                    if (winner) {
                                      const monthNames = ['January','February','March','April','May','June',
                                                          'July','August','September','October','November','December'];
                                      const now = new Date();
                                      const calMonth = monthNames[now.getMonth()];
                                      const calYear = now.getFullYear();
                                      const hasChanged = selectedGroup.liftedContribution && selectedGroup.liftedContribution !== selectedGroup.monthlyContribution;
                                      const nextMonthDue = hasChanged ? selectedGroup.liftedContribution : selectedGroup.monthlyContribution;
                                      const dueLabel = hasChanged ? 'updated contribution' : 'contribution';
                                      const text = `Hi ${winner.name}, Congratulations! 🎉\n\nYou have lifted the chit for Month ${selectedMonth} of ${selectedGroup?.duration} (${calMonth} ${calYear}) in the group "${selectedGroup?.name}"  lifted amount _________\nPlease make sure you pay your ${dueLabel} of ₹${nextMonthDue} from next month onwards, without any delay to make the chit flow easy and secure. 🙏`;
                                      setWinnerMessageModal({ isOpen: true, winner, text });
                                    }
                                  }
                                  fetchGroupMembers(selectedGroup.id);
                                } else {
                                  const errData = await res.json();
                                  toast.error(errData.error || 'Failed to update winner');
                                }
                              } catch {
                                toast.error('Connection error');
                              }
                            }}
                            options={[
                              { value: 'none', label: 'Unclaimed / None' },
                              ...members.map((m) => ({ value: m.id, label: m.name })),
                            ]}
                          />
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={exportToCSV}
                        className="w-full sm:w-auto flex items-center justify-center gap-2 h-11 px-4 rounded-xl bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 text-xs font-bold uppercase tracking-wide transition-colors"
                      >
                        <Download size={16} />
                        Download ledger
                      </button>
                      <p className="text-xs text-slate-500 sm:col-span-2">
                        Lifted members use the updated contribution amount from the next cycle.
                      </p>
                    </div>

                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                      <AdminMetricCard label="Enrolled" value={stats.totalMembers} icon={Users} iconClassName="bg-blue-50 text-blue-600" delay={0.05} />
                      <AdminMetricCard label="Paid" value={stats.paidCount} icon={CheckCircle2} iconClassName="bg-emerald-50 text-emerald-600" delay={0.1} />
                      <AdminMetricCard label="Pending" value={stats.pendingCount} icon={Clock} iconClassName="bg-amber-50 text-amber-600" delay={0.15} />
                      <AdminMetricCard label={`Collected M${selectedMonth}`} value={formatCurrency(stats.totalCollected)} icon={IndianRupee} iconClassName="bg-indigo-50 text-indigo-600" delay={0.2} />
                    </div>

                    {/* --- Dividend Auto-Calculator --- */}
                    {selectedWinnerId && selectedWinnerId !== 'none' && (() => {
                      const winner = members.find(m => m.id === selectedWinnerId);
                      const poolAmount = selectedGroup.totalAmount;
                      const winnerLifts = winner?.liftedMonths?.length || 0;
                      // Dividend = Pool - what winner actually bid (assume full pool for now)
                      // Each remaining member's discount = dividend / total members
                      const liftedAmount = selectedGroup.liftedContribution || selectedGroup.monthlyContribution;
                      const dividend = poolAmount - (liftedAmount * selectedGroup.duration);
                      const perMemberDiscount = dividend > 0 ? (dividend / members.length) : 0;
                      const normalDue = selectedGroup.monthlyContribution;
                      const discountedDue = Math.max(normalDue - perMemberDiscount, 0);

                      return dividend > 0 ? (
                        <div className="bg-gradient-to-r from-amber-50 to-yellow-50 dark:from-amber-950/20 dark:to-yellow-950/20 border border-amber-200 dark:border-amber-800/40 rounded-2xl p-5 flex flex-col sm:flex-row items-start sm:items-center gap-4">
                          <div className="w-10 h-10 bg-amber-100 dark:bg-amber-900/40 rounded-xl flex items-center justify-center shrink-0">
                            <Sparkles size={20} className="text-amber-600 dark:text-amber-400" />
                          </div>
                          <div className="flex-1">
                            <p className="text-xs font-black text-amber-800 dark:text-amber-300 uppercase tracking-wider">💡 Dividend Calculator — {winner?.name} lifted this month</p>
                            <p className="text-slate-600 dark:text-slate-400 text-xs mt-1">
                              Pool: <strong>{formatCurrency(poolAmount)}</strong> · Lifted Amount: <strong>{formatCurrency(liftedAmount * selectedGroup.duration)}</strong> · Dividend: <strong className="text-amber-600 dark:text-amber-400">{formatCurrency(dividend)}</strong>
                            </p>
                            <p className="text-slate-600 dark:text-slate-400 text-xs mt-0.5">
                              Each member saves <strong className="text-emerald-600 dark:text-emerald-400">{formatCurrency(perMemberDiscount)}</strong> → discounted due: <strong className="text-blue-600 dark:text-blue-400">{formatCurrency(discountedDue)}</strong>
                            </p>
                          </div>
                          <button
                            onClick={() => {
                              const updated: { [id: string]: string } = {};
                              members.forEach(m => {
                                if (m.id !== selectedWinnerId) {
                                  updated[m.id] = discountedDue.toFixed(2);
                                }
                              });
                              setCustomAmounts(prev => ({ ...prev, ...updated }));
                              toast.success(`Dividend applied! Due set to ${formatCurrency(discountedDue)} for all non-winners.`);
                            }}
                            className="shrink-0 bg-amber-500 hover:bg-amber-600 text-white text-xs font-black uppercase tracking-wider px-4 py-2.5 rounded-xl transition-all active:scale-95"
                          >
                            Apply Dividend
                          </button>
                        </div>
                      ) : null;
                    })()}

                    <div className="hidden lg:block bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                      <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse min-w-[640px]">
                          <thead>
                            <tr className="border-b border-slate-100 bg-slate-50/80">
                              <th className="px-4 lg:px-6 py-3 text-[10px] font-bold uppercase tracking-wider text-slate-500">Member</th>
                              <th className="px-4 lg:px-6 py-3 text-[10px] font-bold uppercase tracking-wider text-slate-500">Chit lifted</th>
                              <th className="px-4 lg:px-6 py-3 text-[10px] font-bold uppercase tracking-wider text-slate-500">Due (₹)</th>
                              <th className="px-4 lg:px-6 py-3 text-[10px] font-bold uppercase tracking-wider text-slate-500">Status</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100">
                            {isLoadingMembers ? (
                              <tr>
                                <td colSpan={4} className="p-4">
                                  <PaymentsTableSkeleton rows={4} />
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
                                <tr key={member.id} className="hover:bg-slate-50 transition-colors">
                                  <td className="px-4 lg:px-6 py-3">
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
                                  <td className="px-4 lg:px-6 py-3">
                                    {member.liftedMonths && member.liftedMonths.length > 0 ? (
                                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl text-[10px] font-black uppercase tracking-wider bg-amber-500/10 text-amber-600 dark:bg-amber-500/20 dark:text-amber-400 border border-amber-500/20">
                                        🏆 Month {member.liftedMonths.join(', ')}
                                      </span>
                                    ) : (
                                      <span className="text-xs text-slate-400 font-bold">-</span>
                                    )}
                                  </td>
                                  <td className="px-4 lg:px-6 py-3">
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
                                                onBlur={() => handleSaveCustomAmount(member.id)}
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
                                  <td className="px-4 lg:px-6 py-3">
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

                                      <button
                                        onClick={() => sendWhatsAppStatusMessage(member)}
                                        title={isPaid ? "Send WhatsApp Receipt" : "Send WhatsApp Reminder"}
                                        className={cn(
                                          "p-1.5 rounded-lg border transition-all",
                                          isPaid
                                            ? "text-blue-500 hover:text-blue-600 bg-blue-50 hover:bg-blue-100 dark:bg-blue-900/20 dark:hover:bg-blue-900/40 border-blue-200 dark:border-blue-800/30"
                                            : "text-green-500 hover:text-green-600 bg-green-50 hover:bg-green-100 dark:bg-green-900/20 dark:hover:bg-green-900/40 border-green-200 dark:border-green-800/30"
                                        )}
                                      >
                                        <MessageCircle size={16} />
                                      </button>
                                      <button
                                        type="button"
                                        onClick={() => copyStatusMessage(member)}
                                        title="Copy Reminder/Receipt Template"
                                        className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-800 text-slate-500 hover:text-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all"
                                      >
                                        <Copy size={16} />
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

                    <div className="grid grid-cols-1 gap-3 lg:hidden">
                      {isLoadingMembers ? (
                        <PaymentsTableSkeleton rows={5} />
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
                                      onBlur={() => handleSaveCustomAmount(member.id)}
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
                                    onClick={() => handleTogglePaymentStatus(member.id, isPaid ? 'PAID' : 'PENDING')}
                                    className={cn(
                                      "h-10 px-3 rounded-xl border text-[10px] font-black uppercase tracking-wider transition-all active:scale-[0.96]",
                                      isPaid
                                        ? "border-amber-200 dark:border-amber-900/30 text-amber-600 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-950/20"
                                        : "border-emerald-200 dark:border-emerald-900/30 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/20"
                                    )}
                                  >
                                    {isPaid ? "Mark Pending" : "Mark Paid"}
                                  </button>

                                  <button
                                    onClick={() => sendWhatsAppStatusMessage(member)}
                                    title={isPaid ? "Send WhatsApp Receipt" : "Send WhatsApp Reminder"}
                                    className={cn(
                                      "h-10 px-3 rounded-xl border transition-all flex items-center justify-center active:scale-[0.96]",
                                      isPaid
                                        ? "text-blue-500 hover:text-blue-600 bg-blue-50 hover:bg-blue-100 dark:bg-blue-900/20 dark:hover:bg-blue-900/40 border-blue-200 dark:border-blue-800/30"
                                        : "text-green-500 hover:text-green-600 bg-green-50 hover:bg-green-100 dark:bg-green-900/20 dark:hover:bg-green-900/40 border-green-200 dark:border-green-800/30"
                                    )}
                                  >
                                    <MessageCircle size={18} />
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => copyStatusMessage(member)}
                                    title="Copy Reminder/Receipt Template"
                                    className="h-10 px-3 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-500 hover:text-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all flex items-center justify-center active:scale-[0.96]"
                                  >
                                    <Copy size={16} />
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
                      <div className="relative w-full max-w-md flex items-center gap-3">
                        <div className="relative flex-1 w-full">
                          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                          <input
                            type="text"
                            placeholder="Search enrolled members..."
                            value={memberSearchQuery}
                            onChange={(e) => setMemberSearchQuery(e.target.value)}
                            className="w-full h-11 pl-11 pr-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-medium text-xs shadow-sm"
                          />
                        </div>
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
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse">
                        {[1, 2, 3, 4, 5, 6].map((i) => (
                          <div key={i} className="h-36 rounded-3xl bg-white border border-slate-200" />
                        ))}
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

                            <div className="flex items-center gap-1">
                              <button
                                onClick={() => setEditMemberNameModal({
                                  isOpen: true,
                                  membershipId: member.membershipId,
                                  name: member.name,
                                })}
                                className="p-2 text-slate-400 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-950/20 rounded-xl transition-all"
                                title="Edit member name"
                              >
                                <Edit3 size={16} />
                              </button>
                              <button
                                onClick={() => setMemberToDelete(member)}
                                className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-xl transition-all"
                                title="Remove from group"
                              >
                                <Trash2 size={16} />
                              </button>
                            </div>
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
              className="relative w-full max-w-md max-h-[90dvh] overflow-y-auto bg-white rounded-2xl p-6 sm:p-8 shadow-2xl border border-slate-200 mx-2"
            >
              <h3 className="text-2xl font-black text-slate-900 dark:text-white leading-none mb-6">
                {editingGroup ? "Edit Chit Group" : "Create Chit Group"}
              </h3>

              <form onSubmit={handleCreateOrUpdateGroup} className="space-y-5" noValidate>
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Group Name *</label>
                  <input
                    type="text"
                    value={groupFormData.name}
                    onChange={(e) => {
                      setGroupFormData({ ...groupFormData, name: e.target.value });
                      if (groupErrors.name) setGroupErrors({ ...groupErrors, name: '' });
                    }}
                    placeholder="e.g. Diamond Monthly 5K"
                    className={cn(
                      "w-full h-12 px-4 rounded-xl border bg-slate-50 dark:bg-slate-950 focus:outline-none focus:ring-2 text-sm font-semibold transition-all",
                      groupErrors.name 
                        ? "border-red-500 focus:ring-red-500/20" 
                        : "border-slate-200 dark:border-slate-800 focus:ring-blue-500/20"
                    )}
                  />
                  {groupErrors.name && (
                    <p className="text-[11px] text-red-500 font-bold mt-1.5">{groupErrors.name}</p>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Total Pool Value (₹) *</label>
                    <input
                      type="number"
                      value={groupFormData.totalValue}
                      onChange={(e) => {
                        setGroupFormData({ ...groupFormData, totalValue: e.target.value });
                        if (groupErrors.totalValue) setGroupErrors({ ...groupErrors, totalValue: '' });
                      }}
                      placeholder="100000"
                      className={cn(
                        "w-full h-12 px-4 rounded-xl border bg-slate-50 dark:bg-slate-950 focus:outline-none focus:ring-2 text-sm font-semibold transition-all",
                        groupErrors.totalValue 
                          ? "border-red-500 focus:ring-red-500/20" 
                          : "border-slate-200 dark:border-slate-800 focus:ring-blue-500/20"
                      )}
                    />
                    {groupErrors.totalValue && (
                      <p className="text-[11px] text-red-500 font-bold mt-1.5">{groupErrors.totalValue}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Monthly Pay *</label>
                    <input
                      type="number"
                      value={groupFormData.monthlyContribution}
                      onChange={(e) => {
                        setGroupFormData({ ...groupFormData, monthlyContribution: e.target.value });
                        if (groupErrors.monthlyContribution) setGroupErrors({ ...groupErrors, monthlyContribution: '' });
                      }}
                      placeholder="5000"
                      className={cn(
                        "w-full h-12 px-4 rounded-xl border bg-slate-50 dark:bg-slate-950 focus:outline-none focus:ring-2 text-sm font-semibold transition-all",
                        groupErrors.monthlyContribution 
                          ? "border-red-500 focus:ring-red-500/20" 
                          : "border-slate-200 dark:border-slate-800 focus:ring-blue-500/20"
                      )}
                    />
                    {groupErrors.monthlyContribution && (
                      <p className="text-[11px] text-red-500 font-bold mt-1.5">{groupErrors.monthlyContribution}</p>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">New Due Amount After Chit Lift (₹)</label>
                  <input
                    type="number"
                    value={groupFormData.liftedContribution}
                    onChange={(e) => setGroupFormData({ ...groupFormData, liftedContribution: e.target.value })}
                    placeholder="e.g. 7500"
                    className="w-full h-12 px-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-sm font-semibold"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Duration (Months) *</label>
                    <input
                      type="number"
                      value={groupFormData.durationMonths}
                      onChange={(e) => {
                        setGroupFormData({ ...groupFormData, durationMonths: e.target.value });
                        if (groupErrors.durationMonths) setGroupErrors({ ...groupErrors, durationMonths: '' });
                      }}
                      placeholder="12"
                      className={cn(
                        "w-full h-12 px-4 rounded-xl border bg-slate-50 dark:bg-slate-950 focus:outline-none focus:ring-2 text-sm font-semibold transition-all",
                        groupErrors.durationMonths 
                          ? "border-red-500 focus:ring-red-500/20" 
                          : "border-slate-200 dark:border-slate-800 focus:ring-blue-500/20"
                      )}
                    />
                    {groupErrors.durationMonths && (
                      <p className="text-[11px] text-red-500 font-bold mt-1.5">{groupErrors.durationMonths}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Members Limit *</label>
                    <input
                      type="number"
                      value={groupFormData.membersLimit}
                      onChange={(e) => {
                        setGroupFormData({ ...groupFormData, membersLimit: e.target.value });
                        if (groupErrors.membersLimit) setGroupErrors({ ...groupErrors, membersLimit: '' });
                      }}
                      placeholder="20"
                      className={cn(
                        "w-full h-12 px-4 rounded-xl border bg-slate-50 dark:bg-slate-950 focus:outline-none focus:ring-2 text-sm font-semibold transition-all",
                        groupErrors.membersLimit 
                          ? "border-red-500 focus:ring-red-500/20" 
                          : "border-slate-200 dark:border-slate-800 focus:ring-blue-500/20"
                      )}
                    />
                    {groupErrors.membersLimit && (
                      <p className="text-[11px] text-red-500 font-bold mt-1.5">{groupErrors.membersLimit}</p>
                    )}
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
              className="relative w-full max-w-sm bg-white rounded-[32px] p-8 shadow-2xl border border-slate-200"
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-black text-slate-900 leading-none">
                  Add Group Member
                </h3>
                <button 
                  type="button"
                  onClick={() => setIsMemberModalOpen(false)}
                  className="p-2 rounded-xl hover:bg-slate-100 text-slate-400 transition-colors"
                >
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleAddMember} className="space-y-5">
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Member Name *</label>
                  <input
                    type="text"
                    value={memberFormData.name}
                    onChange={(e) => setMemberFormData({ ...memberFormData, name: e.target.value })}
                    placeholder="e.g. Rahul Sharma"
                    className="w-full h-12 px-4 rounded-xl border border-slate-200 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-sm font-semibold"
                    required
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Phone Number *</label>
                  <input
                    type="tel"
                    value={memberFormData.phone}
                    onChange={(e) => {
                      const val = e.target.value.replace(/\D/g, '').slice(0, 10);
                      setMemberFormData({ ...memberFormData, phone: val });
                    }}
                    placeholder="e.g. 9876543210"
                    maxLength={10}
                    pattern="[0-9]{10}"
                    className="w-full h-12 px-4 rounded-xl border border-slate-200 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-sm font-semibold"
                    required
                  />
                </div>

                <div className="mt-8 flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsMemberModalOpen(false)}
                    className="flex-1 h-12 rounded-2xl border border-slate-200 font-bold text-slate-600 hover:bg-slate-50 transition-all text-xs uppercase tracking-wider"
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
              className="relative w-full max-w-sm bg-white rounded-[32px] p-6 shadow-2xl border border-slate-200"
            >
              <div className="w-12 h-12 rounded-2xl bg-red-50 flex items-center justify-center text-red-600 mb-4">
                <AlertTriangle size={24} />
              </div>
              <h3 className="text-lg font-bold text-slate-900">Delete Chit Group</h3>
              <p className="text-xs text-slate-500 mt-2 leading-relaxed">
                Are you sure you want to delete <span className="font-bold text-slate-800">{groupToDelete.name}</span>? This action is permanent and will delete all member relationships and payments in this group.
              </p>

              <div className="mt-6 flex gap-3">
                <button
                  onClick={() => setGroupToDelete(null)}
                  className="flex-1 h-11 rounded-xl border border-slate-200 font-bold text-slate-600 hover:bg-slate-50 transition-all text-xs uppercase tracking-wider"
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
              className="relative w-full max-w-sm bg-white rounded-[32px] p-6 shadow-2xl border border-slate-200"
            >
              <div className="w-12 h-12 rounded-2xl bg-red-50 flex items-center justify-center text-red-600 mb-4">
                <AlertTriangle size={24} />
              </div>
              <h3 className="text-lg font-bold text-slate-900">Remove Member</h3>
              <p className="text-xs text-slate-500 mt-2 leading-relaxed">
                Are you sure you want to remove <span className="font-bold text-slate-800">{memberToDelete.name}</span> from the group <span className="font-bold text-slate-800">{selectedGroup.name}</span>? This will wipe their payment history for this group.
              </p>

              <div className="mt-6 flex gap-3">
                <button
                  onClick={() => setMemberToDelete(null)}
                  className="flex-1 h-11 rounded-xl border border-slate-200 font-bold text-slate-600 hover:bg-slate-50 transition-all text-xs uppercase tracking-wider"
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

      {/* --- WINNER WHATSAPP NOTIFICATION MODAL --- */}
      <AnimatePresence>
        {winnerMessageModal?.isOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setWinnerMessageModal(null)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative w-full max-w-md bg-white rounded-[32px] p-6 shadow-2xl border border-slate-200"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="w-12 h-12 rounded-2xl bg-amber-50 flex items-center justify-center text-amber-600 shadow-sm border border-amber-100">
                  <Trophy size={24} />
                </div>
                <button 
                  onClick={() => setWinnerMessageModal(null)}
                  className="p-2 rounded-xl hover:bg-slate-100 text-slate-400 transition-colors"
                >
                  <X size={20} />
                </button>
              </div>
              <h3 className="text-xl font-black text-slate-900 leading-tight">
                Winner Updated!
              </h3>
              <p className="text-sm text-slate-500 mt-2 font-medium">
                Do you want to send a congratulatory WhatsApp message to <span className="font-bold text-slate-900">{winnerMessageModal.winner.name}</span>?
              </p>

              <div className="mt-4 p-4 rounded-2xl bg-slate-50 border border-slate-200 shadow-inner focus-within:ring-2 focus-within:ring-blue-500/20 transition-all">
                <textarea
                  className="w-full text-sm text-slate-700 bg-transparent outline-none resize-none min-h-[100px]"
                  value={winnerMessageModal.text}
                  onChange={(e) => setWinnerMessageModal({ ...winnerMessageModal, text: e.target.value })}
                />
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-2 text-right">Editable Message</p>
              </div>

              <div className="mt-6 flex gap-3">
                <button
                  onClick={() => setWinnerMessageModal(null)}
                  className="flex-1 h-12 rounded-2xl border border-slate-200 font-bold text-slate-600 hover:bg-slate-50 transition-all text-xs uppercase tracking-wider"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    const url = `https://wa.me/91${winnerMessageModal.winner.phone}?text=${encodeURIComponent(winnerMessageModal.text)}`;
                    window.open(url, '_blank');
                    setWinnerMessageModal(null);
                  }}
                  className="flex-1 h-12 rounded-2xl bg-[#25D366] hover:bg-[#128C7E] text-white font-black transition-all flex items-center justify-center gap-2 text-xs uppercase tracking-wider shadow-lg shadow-green-500/20"
                >
                  <MessageCircle size={16} /> Send Message
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {editMemberNameModal.isOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setEditMemberNameModal({ isOpen: false, membershipId: '', name: '' })}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative w-full max-w-sm bg-white rounded-[32px] p-6 shadow-2xl border border-slate-200"
            >
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-lg font-bold text-slate-900">Edit Member Name</h3>
                  <p className="text-xs text-slate-500 mt-1">Update how this member's name appears in this group</p>
                </div>
                <button 
                  onClick={() => setEditMemberNameModal({ isOpen: false, membershipId: '', name: '' })}
                  className="p-1 rounded-xl hover:bg-slate-100 text-slate-400 transition-colors"
                >
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleUpdateMemberName} className="space-y-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Member Name</label>
                  <input
                    required
                    type="text"
                    value={editMemberNameModal.name}
                    onChange={(e) => setEditMemberNameModal(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Enter name"
                    className="w-full h-12 px-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-sm font-semibold"
                  />
                </div>

                <div className="pt-2 flex gap-3">
                  <button
                    type="button"
                    onClick={() => setEditMemberNameModal({ isOpen: false, membershipId: '', name: '' })}
                    className="flex-1 h-12 rounded-xl border border-slate-200 font-bold text-slate-600 hover:bg-slate-50 transition-all text-xs uppercase tracking-wider"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isUpdatingMemberName}
                    className="flex-[2] h-12 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-black transition-all flex items-center justify-center gap-2 text-xs uppercase tracking-wider shadow-lg shadow-blue-500/20 disabled:opacity-75"
                  >
                    {isUpdatingMemberName ? <Loader2 className="animate-spin" size={16} /> : "Save Changes"}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </AdminLayout>
  );
}
