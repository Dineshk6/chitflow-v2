'use client';
import { useState, useEffect } from 'react';
import AdminLayout from '@/components/layout/AdminLayout';
import { formatCurrency, cn } from '@/lib/utils';
import {
  generateChitSchedule,
  suggestVariation2StartBid,
  suggestVariation2MonthlyContribution
} from '@/lib/chitCalculations';
import {
  Plus,
  Users,
  Trophy,
  Wallet,
  Info,
  Clock,
  CheckCircle2,
  Loader2,
  Calendar,
  IndianRupee,
  TrendingUp,
  Download,
  MessageCircle,
  Send,
  Pencil,
  Trash2,
  X,
  ArrowLeft,
  Phone
} from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import PageWrapper from '@/components/layout/PageWrapper';
import { jsPDF } from 'jspdf';
import { useSession } from 'next-auth/react';
import { CustomSelect } from '@/components/ui/CustomSelect';
import { AdminMetricCard } from '@/components/admin/AdminStatCard';
import { PaymentsTableSkeleton } from '@/components/ui/Skeleton';

import MemberSelectorModal from '@/components/admin/MemberSelectorModal';
import { useParams, useRouter } from 'next/navigation';
import { buildMemberWelcomeWhatsAppMessage, openWhatsApp } from '@/lib/whatsapp';
import SchemePdfModal from '@/components/admin/SchemePdfModal';

export default function GroupDetailsPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const params = useParams();
  const groupId = params.id as string;

  const [activeTab, setActiveTab] = useState('overview');
  const [group, setGroup] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Group Edit States
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editCalculationType, setEditCalculationType] = useState<'VARIATION_1' | 'VARIATION_2'>('VARIATION_1');
  const [editTotalAmount, setEditTotalAmount] = useState(0);
  const [editMembersLimit, setEditMembersLimit] = useState(0);
  const [editMonthlyContribution, setEditMonthlyContribution] = useState(0);
  const [editLiftedContribution, setEditLiftedContribution] = useState(0);
  const [editStartBid, setEditStartBid] = useState(0);
  const [editCommissionPct, setEditCommissionPct] = useState(5.0);
  const [isUpdatingGroup, setIsUpdatingGroup] = useState(false);

  // Auction States
  const [currentAuction, setCurrentAuction] = useState<any>(null);
  const [isUpdatingAuction, setIsUpdatingAuction] = useState(false);

  // Member States
  const [isMemberModalOpen, setIsMemberModalOpen] = useState(false);
  const [schemePdfGroup, setSchemePdfGroup] = useState<any | null>(null);
  const [isAddingMember, setIsAddingMember] = useState(false);
  const [approvingMemberId, setApprovingMemberId] = useState<string | null>(null);
  const [members, setMembers] = useState<any[]>([]);
  const [isLoadingMembers, setIsLoadingMembers] = useState(false);
  const [memberSearchQuery, setMemberSearchQuery] = useState('');

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

  // Payment Tracking States
  const [selectedMonth, setSelectedMonth] = useState<number>(1);
  const [customAmounts, setCustomAmounts] = useState<{ [userId: string]: string }>({});
  const [liftAmountInput, setLiftAmountInput] = useState<string>('');
  const [selectedWinnerId, setSelectedWinnerId] = useState<string>('none');
  const [isApplyingDividend, setIsApplyingDividend] = useState(false);
  const [paymentFilter, setPaymentFilter] = useState('ALL');
  const [winnerMessageModal, setWinnerMessageModal] = useState<{ isOpen: boolean, winner: any, text: string } | null>(null);
  const [memberWelcomeModal, setMemberWelcomeModal] = useState<{ isOpen: boolean; member: { name: string; phone: string }; text: string } | null>(null);

  const [isEditInitialized, setIsEditInitialized] = useState(false);

  useEffect(() => {
    if (groupId) {
      fetchGroupDetails();
      fetchGroupMembers(groupId);
    }
  }, [groupId]);

  useEffect(() => {
    if (isEditModalOpen) {
      if (!isEditInitialized) {
        setIsEditInitialized(true);
        return;
      }
      if (editCalculationType === 'VARIATION_1') {
        const regular = Math.round(editTotalAmount / editMembersLimit);
        setEditMonthlyContribution(regular);
        setEditLiftedContribution(regular + Math.round(editTotalAmount / 100));
      } else {
        const C = Math.round((editTotalAmount * 0.81) / editMembersLimit);
        setEditMonthlyContribution(C);
        const suggestedBid = suggestVariation2StartBid(editTotalAmount, editMembersLimit, C, editCommissionPct);
        setEditStartBid(suggestedBid);
      }
    } else {
      setIsEditInitialized(false);
    }
  }, [editCalculationType, isEditModalOpen]);

  // Sync custom amounts on month change
  useEffect(() => {
    if (group && members.length > 0) {
      const amounts: { [userId: string]: string } = {};
      members.forEach(m => {
        const payment = m.payments?.find((p: any) => p.month === selectedMonth);
        const hasWonBefore = m.liftedMonths?.some((wonMonth: number) => wonMonth < selectedMonth);
        const defaultAmt = hasWonBefore
          ? (group.liftedContribution?.toString() || group.monthlyContribution.toString())
          : group.monthlyContribution.toString();
        amounts[m.membershipId || m.id] = payment?.amount?.toString() || defaultAmt;
      });
      setCustomAmounts(amounts);

      const currentWinner = members.find(m => m.liftedMonths?.includes(selectedMonth));
      if (currentWinner) {
        setSelectedWinnerId(currentWinner.membershipId || currentWinner.id);
        const liftDetails = currentWinner.lifts?.find((l: any) => l.month === selectedMonth);
        setLiftAmountInput(liftDetails?.prizeValue ? liftDetails.prizeValue.toString() : '');
      } else {
        setSelectedWinnerId('none');
        setLiftAmountInput('');
      }
    }
  }, [selectedMonth, members, group]);


  // ========================== API CALLS ==========================

  const fetchGroupDetails = async () => {
    try {
      const res = await fetch(`/api/groups/${groupId}`);
      const data = await res.json();
      if (res.ok) {
        setGroup(data);
        const auction = data.auctions?.find((a: any) => a.status === 'OPEN' || a.status === 'UPCOMING');
        setCurrentAuction(auction);
      }
    } catch (error) {
      toast.error("Failed to fetch group details");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchGroupMembers = async (id: string) => {
    setIsLoadingMembers(true);
    try {
      const res = await fetch(`/api/admin/customers?groupId=${id}`);
      const data = await res.json();
      setMembers(Array.isArray(data) ? data : []);
    } catch (err) {
      toast.error("Failed to load group members");
    } finally {
      setIsLoadingMembers(false);
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
          liftedContribution: target.liftedContribution ? (target.liftedContribution.value ? parseFloat(target.liftedContribution.value) : null) : null,
          calculationType: editCalculationType,
          startBid: target.startBid ? (target.startBid.value ? parseFloat(target.startBid.value) : null) : null,
          commissionPct: parseFloat(target.commissionPct.value),
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
        fetchGroupMembers(groupId);
      }
    } catch (error) {
      toast.error("Something went wrong");
    } finally {
      setIsUpdatingMemberName(false);
    }
  };

  const handleAddMember = async (userId: string, chitCount: number = 1) => {
    setIsAddingMember(true);
    try {
      const res = await fetch('/api/admin/groups/add-member', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ groupId, userId, chitCount }),
      });
      const data = await res.json();
      if (res.ok) {
        toast.success(data.message || "Member added to group!");
        setIsMemberModalOpen(false);
        fetchGroupDetails();
        fetchGroupMembers(groupId);

        const memberPhone = data.user?.phone;
        if (memberPhone) {
          const text = buildMemberWelcomeWhatsAppMessage({
            memberName: data.user?.name || 'Member',
            memberPhone,
            groupName: data.group?.name || group?.name || 'Chit Group',
            chitCount: data.chitCount || chitCount,
            monthlyContribution: data.group?.monthlyContribution ?? group?.monthlyContribution,
            liftedContribution: data.group?.liftedContribution ?? group?.liftedContribution,
            duration: data.group?.duration ?? group?.duration,
            totalAmount: data.group?.totalAmount ?? group?.totalAmount,
            membersLimit: data.group?.membersLimit ?? group?.membersLimit,
            startDate: data.group?.startDate ?? group?.startDate,
            groupStatus: data.group?.status ?? group?.status,
            currentMonth: data.group?.currentMonth ?? group?.currentMonth,
            agentName: session?.user?.name,
            loginUrl: `${window.location.origin}/auth/member/login`,
          });
          setMemberWelcomeModal({
            isOpen: true,
            member: { name: data.user?.name || 'Member', phone: memberPhone },
            text,
          });
        }
      } else {
        toast.error(data.error || "Failed to add member");
      }
    } catch (error) {
      toast.error("Something went wrong");
    } finally {
      setIsAddingMember(false);
    }
  };

  const handleRemoveMember = async (userId: string, memberName: string, membershipId?: string) => {
    if (!confirm(`Remove ${memberName} from this group?`)) return;
    try {
      const url = membershipId
        ? `/api/admin/customers?membershipId=${membershipId}&groupId=${groupId}`
        : `/api/admin/customers?userId=${userId}&groupId=${groupId}`;
      const res = await fetch(url, {
        method: 'DELETE',
      });
      if (res.ok) {
        toast.success(`${memberName} removed from group.`);
        fetchGroupDetails();
        fetchGroupMembers(groupId);
      } else {
        const data = await res.json();
        toast.error(data.error || 'Failed to remove member');
      }
    } catch (error) {
      toast.error('Connection error');
    }
  };

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
        fetchGroupMembers(groupId);
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
      }
    } catch (error) {
      toast.error("Something went wrong");
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
      if (res.ok) {
        toast.success(`Auction is now ${status}`);
        fetchGroupDetails();
      }
    } catch (error) {
      toast.error("Something went wrong");
    } finally {
      setIsUpdatingAuction(false);
    }
  };

  // ========================== PAYMENTS TRACKER API ==========================

  const handleWinnerAndDividendChange = async (winnerId: string, liftAmount: number) => {
    if (!group) return;
    if (isNaN(liftAmount) || liftAmount <= 0) {
      toast.error("Please enter a valid lift amount first.");
      return;
    }

    // 1. Trigger WhatsApp notification modal optimistically
    if (winnerId !== 'none') {
      const winner = members.find((m) => (m.membershipId || m.id) === winnerId);
      if (winner) {
        const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
        const now = new Date();
        const hasChanged = group.liftedContribution && group.liftedContribution !== group.monthlyContribution;
        const nextMonthDue = hasChanged ? group.liftedContribution : group.monthlyContribution;
        const agentName = session?.user?.name ? `\n\nRegards,\n*${session.user.name}*` : '';
        const text = `*ChitFlow Winner Announcement* 🏆\n\nDear *${winner.name}*,\n\nCongratulations! 🎉 You have successfully lifted the chit for *Month ${selectedMonth} of ${group.duration}* (${monthNames[now.getMonth()]} ${now.getFullYear()}) in the group *"${group.name}"* with a bid value of *₹${liftAmount.toLocaleString('en-IN')}*.\n\nKindly note that your monthly contribution from next month onwards will be *₹${nextMonthDue.toLocaleString('en-IN')}*. We appreciate your continued association and timely payments. 🙏${agentName}`;
        setWinnerMessageModal({ isOpen: true, winner, text });
      }
    }

    setSelectedWinnerId(winnerId);
    setIsApplyingDividend(true);

    try {
      // Update Winner
      const res = await fetch('/api/admin/customers', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          groupId: group.id,
          month: selectedMonth,
          winnerId,
          prizeValue: winnerId === 'none' ? 0 : liftAmount,
          winningBid: 0,
          dividend: 0,
        }),
      });
      if (!res.ok) throw new Error('Failed to update winner');

      // Update Member Payments Dynamically
      const batchPayments = members.map(m => {
        const payment = m.payments?.find((p: any) => p.month === selectedMonth);
        const isCurrentWinner = winnerId !== 'none' && (m.membershipId || m.id) === winnerId;
        const hasWonBefore = m.liftedMonths?.some((wonMonth: number) => wonMonth < selectedMonth);
        const dueAmount = (isCurrentWinner || hasWonBefore)
          ? (group.liftedContribution || group.monthlyContribution)
          : group.monthlyContribution;

        return {
          userId: m.id,
          membershipId: m.membershipId || null,
          amount: dueAmount,
          status: payment?.status || 'PENDING'
        };
      });

      if (batchPayments.length > 0) {
        const batchRes = await fetch('/api/admin/customers', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            groupId: group.id,
            month: selectedMonth,
            payments: batchPayments
          })
        });

        if (!batchRes.ok) toast.error("Failed to update member dues.");
        else toast.success(winnerId !== 'none' ? "Winner set & Dues applied!" : "Winner cleared & Dues reset!");
      }

      fetchGroupMembers(group.id);
    } catch (error: any) {
      toast.error(error.message || 'Connection error');
    } finally {
      setIsApplyingDividend(false);
    }
  };

  const handleTogglePaymentStatus = async (userId: string, currentStatus: string, membershipId?: string) => {
    const nextStatus = currentStatus === 'PAID' ? 'PENDING' : 'PAID';
    const amountVal = parseFloat(customAmounts[membershipId || userId]) || group.monthlyContribution;

    // Optimistic Update
    setMembers(prev => prev.map(m => {
      if (membershipId ? m.membershipId === membershipId : m.id === userId) {
        const otherPayments = m.payments.filter((p: any) => p.month !== selectedMonth);
        return {
          ...m,
          payments: [...otherPayments, { month: selectedMonth, status: nextStatus, amount: amountVal }]
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
          membershipId,
          groupId: group.id,
          month: selectedMonth,
          status: nextStatus,
          amount: amountVal
        })
      });
      if (!res.ok) {
        toast.error("Failed to update status on server");
        fetchGroupMembers(group.id);
      }
    } catch (err) {
      toast.error("Connection error");
      fetchGroupMembers(group.id);
    }
  };

  const handleSaveCustomAmount = async (userId: string, membershipId?: string) => {
    const amountVal = parseFloat(customAmounts[membershipId || userId]);
    if (isNaN(amountVal) || amountVal <= 0) return;

    const currentMember = members.find(m => membershipId ? m.membershipId === membershipId : m.id === userId);
    const payment = currentMember?.payments?.find((p: any) => p.month === selectedMonth);
    const statusVal = payment?.status || 'PENDING';

    try {
      const res = await fetch('/api/admin/customers', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, membershipId, groupId: group.id, month: selectedMonth, status: statusVal, amount: amountVal })
      });
      if (res.ok) {
        toast.success("Due amount updated!");
        fetchGroupMembers(group.id);
      }
    } catch (err) {
      toast.error("Connection error");
    }
  };

  // ========================== UTILITIES ==========================

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

  const paymentStats = (() => {
    let paidCount = 0;
    let totalCollected = 0;
    members.forEach(m => {
      const payment = m.payments?.find((p: any) => p.month === selectedMonth);
      if (payment && payment.status === 'PAID') {
        paidCount++;
        totalCollected += payment.amount || group?.monthlyContribution || 0;
      }
    });
    return {
      totalMembers: members.length,
      paidCount,
      pendingCount: members.length - paidCount,
      totalCollected
    };
  })();

  const downloadGroupSchedulePDF = (group: any) => {
    setSchemePdfGroup(group);
  };

  const exportToCSV = () => {
    if (!group) return;
    const headers = ['Member Name', 'Phone', 'Chit Lifted', 'Monthly Due', 'Payment Status', 'Cycle'];
    const rows = filteredMembers.map(m => {
      const payment = m.payments?.find((p: any) => p.month === selectedMonth);
      const isPaid = payment?.status === 'PAID';
      const dueAmount = parseFloat(customAmounts[m.id]) || group.monthlyContribution;
      const isWinner = selectedWinnerId === m.id;
      const hasWonBefore = m.liftedMonths && m.liftedMonths.some((month: number) => month < selectedMonth);
      const liftStatus = isWinner ? 'Winner this month' : hasWonBefore ? 'Lifted previously' : 'Not lifted';
      return [m.name, m.phone, liftStatus, dueAmount, isPaid ? 'PAID' : 'PENDING', `Month ${selectedMonth}`];
    });
    const csvContent = [headers.join(','), ...rows.map(r => r.map(cell => `"${cell}"`).join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `${group.name}_Month_${selectedMonth}_Ledger.csv`;
    link.click();
  };

  const sendWhatsAppStatusMessage = (member: any) => {
    const phone = member.phone || member.mobile;
    if (!phone) {
      toast.error('No phone number for this member');
      return;
    }
    const payment = member.payments?.find((p: any) => p.month === selectedMonth);
    const isPaid = payment?.status === 'PAID';
    const amountVal = payment?.amount || parseFloat(customAmounts[member.id]) || group?.monthlyContribution || 0;
    const text = `*ChitFlow Member Summary* 📊\n\n*Group:* ${group?.name}\n*Month:* ${selectedMonth} of ${group?.duration}\n*Amount:* ₹${amountVal.toLocaleString('en-IN')}\n*Status:* ${isPaid ? 'PAID ✅' : 'PENDING ⏳'}`;
    openWhatsApp(phone, text);
  };

  const openMemberWhatsApp = (member: any) => {
    const phone = member.phone || member.mobile;
    if (!phone) {
      toast.error('No phone number for this member');
      return;
    }
    const userChits = members.filter((m: any) => m.id === member.id).length || 1;
    const text = buildMemberWelcomeWhatsAppMessage({
      memberName: member.name,
      memberPhone: phone,
      groupName: group?.name || 'Chit Group',
      chitCount: userChits,
      monthlyContribution: group?.monthlyContribution,
      liftedContribution: group?.liftedContribution,
      duration: group?.duration,
      totalAmount: group?.totalAmount,
      membersLimit: group?.membersLimit,
      startDate: group?.startDate,
      groupStatus: group?.status,
      currentMonth: group?.currentMonth,
      agentName: session?.user?.name,
      loginUrl: `${window.location.origin}/auth/member/login`,
    });
    setMemberWelcomeModal({
      isOpen: true,
      member: { name: member.name, phone },
      text,
    });
  };

  // ========================== RENDERING ==========================

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

  const scheduleData = generateChitSchedule({
    calculationType: group.calculationType || 'VARIATION_1',
    totalAmount: group.totalAmount,
    duration: group.duration,
    monthlyContribution: group.monthlyContribution,
    liftedContribution: group.liftedContribution,
    startBid: group.startBid,
    startDate: group.startDate,
    commissionPct: group.commissionPct || 5.0,
    manualSchedule: group.manualSchedule || null,
  });

  return (
    <AdminLayout>
      <PageWrapper>
        <div className="space-y-8 min-w-0">

          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-6 rounded-[32px] border border-slate-200 dark:border-slate-800 shadow-sm">
            <div className="flex items-center gap-4 min-w-0">
              <button
                type="button"
                onClick={() => router.push('/admin/dashboard')}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-600 text-xs font-semibold hover:bg-blue-50 hover:border-blue-200 hover:text-blue-700 transition-all shrink-0"
              >
                <ArrowLeft size={14} />
                Back to groups
              </button>
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center text-white font-black text-2xl shadow-lg shadow-blue-500/20 shrink-0">
                {group.name.charAt(0)}
              </div>
              <div className="min-w-0">
                <h1 className="text-3xl font-black text-slate-900 dark:text-white truncate">{group.name}</h1>
                <div className="flex items-center gap-2 mt-2">
                  <span className="text-xs font-bold bg-slate-100 dark:bg-slate-800 text-slate-500 px-3 py-1 rounded-full uppercase tracking-widest">ID: {group.id.slice(-6)}</span>
                  <span className={cn(
                    "text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-wider",
                    group.status === 'UPCOMING' ? "bg-blue-50 text-blue-600 border border-blue-100" : "bg-emerald-50 text-emerald-600 border border-emerald-100"
                  )}>
                    {group.status}
                  </span>
                </div>
              </div>
            </div>
            <div className="flex flex-wrap gap-3">
              <button
                onClick={() => setIsMemberModalOpen(true)}
                className="h-12 px-6 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold transition-all text-sm flex items-center gap-2 shadow-md shadow-blue-500/20"
              >
                <Plus size={18} />
                Add Member / Chit
              </button>
              <button
                onClick={() => downloadGroupSchedulePDF(group)}
                className="h-12 px-5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 font-bold hover:bg-emerald-100 transition-all flex items-center gap-2 text-sm"
              >
                <Download size={18} />
                Download PDF
              </button>
              <button
                onClick={() => {
                  setEditCalculationType(group.calculationType || 'VARIATION_1');
                  setEditTotalAmount(group.totalAmount);
                  setEditMembersLimit(group.membersLimit || group.duration || 20);
                  setEditMonthlyContribution(group.monthlyContribution);
                  setEditLiftedContribution(group.liftedContribution || 0);
                  setEditStartBid(group.startBid || 0);
                  setEditCommissionPct(group.commissionPct || 5.0);
                  setIsEditModalOpen(true);
                }}
                className="h-12 px-6 rounded-xl border-2 border-slate-200 text-slate-600 font-bold hover:bg-slate-50 transition-all text-sm"
              >
                Edit Group
              </button>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="flex bg-white dark:bg-slate-900 rounded-2xl p-1 border border-slate-200 dark:border-slate-800 shadow-sm overflow-x-auto">
            {[
              { id: 'overview', name: 'Overview', icon: Info },
              { id: 'payments', name: 'Payments Tracker', icon: Wallet },
              { id: 'auction', name: 'Live Auction', icon: Trophy },
              { id: 'members', name: 'Members List', icon: Users },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  "flex-1 flex items-center justify-center gap-2 px-6 py-3 rounded-xl text-sm font-bold transition-all whitespace-nowrap",
                  activeTab === tab.id
                    ? "bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 shadow-sm"
                    : "text-slate-500 hover:text-slate-700 hover:bg-slate-50"
                )}
              >
                <tab.icon size={18} />
                {tab.name}
              </button>
            ))}
          </div>

          <div className="min-h-[500px]">
            {/* OVERVIEW TAB */}
            {activeTab === 'overview' && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="md:col-span-2 space-y-8">
                  <div className="bg-white p-8 rounded-[32px] border border-slate-200 shadow-sm">
                    <h3 className="text-xl font-black text-slate-900 mb-8">Group Overview</h3>
                    <div className="grid grid-cols-2 gap-8">
                      <div className="space-y-1">
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Total Chit Value</p>
                        <p className="text-3xl font-black text-slate-900">{formatCurrency(group.totalAmount)}</p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Monthly Pay Amount</p>
                        <p className="text-3xl font-black text-slate-900">{formatCurrency(group.monthlyContribution)}</p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Duration</p>
                        <p className="text-lg font-bold text-slate-700">{group.duration} Months</p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Members Limit</p>
                        <p className="text-lg font-bold text-slate-700">{group.membersLimit || 20} Participants</p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-slate-900 p-8 rounded-[32px] shadow-lg text-white">
                    <h3 className="text-xl font-black mb-6 flex items-center gap-2"><CheckCircle2 className="text-emerald-400" /> Agent Commission Details</h3>
                    <div className="grid grid-cols-2 gap-6">
                      <div>
                        <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">Agent Commission Rate</p>
                        <p className="text-2xl font-black text-emerald-400">{group.commissionPct}%</p>
                      </div>
                      <div>
                        <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">Total Earned Over Cycle</p>
                        <p className="text-2xl font-black text-white">₹{scheduleData.agentEarnings.toLocaleString('en-IN')}</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-6">
                  <div className="bg-white p-8 rounded-[32px] border border-slate-200 shadow-sm text-center flex flex-col items-center justify-center">
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-4">Member Progress</p>
                    <div className="relative inline-flex items-center justify-center mb-6">
                      <svg className="w-32 h-32 transform -rotate-90">
                        <circle cx="64" cy="64" r="56" stroke="currentColor" strokeWidth="8" fill="transparent" className="text-slate-100" />
                        <circle cx="64" cy="64" r="56" stroke="currentColor" strokeWidth="8" fill="transparent" strokeDasharray={351.8} strokeDashoffset={351.8 * (1 - (group.members?.length || 0) / (group.membersLimit || 20))} className="text-blue-600" />
                      </svg>
                      <span className="absolute text-2xl font-black text-slate-900">
                        {Math.floor(((group.members?.length || 0) / (group.membersLimit || 20)) * 100)}%
                      </span>
                    </div>
                    <p className="text-sm font-bold text-slate-700">
                      {group.members?.length || 0} of {group.membersLimit || 20} filled
                    </p>
                  </div>
                </div>
              </motion.div>
            )}

            {/* DYNAMIC PAYMENTS TRACKER TAB */}
            {activeTab === 'payments' && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">

                {/* Dashboard Controls */}
                <div className="bg-white p-6 rounded-[32px] border border-slate-200 shadow-sm space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="flex flex-col gap-2">
                      <span className="text-xs font-bold text-slate-600 uppercase tracking-widest flex items-center gap-2">
                        <Calendar size={16} className="text-blue-600" /> Active month
                      </span>
                      <CustomSelect
                        value={String(selectedMonth)}
                        onChange={(val) => setSelectedMonth(Number(val))}
                        options={Array.from({ length: group.duration }, (_, i) => ({
                          value: String(i + 1),
                          label: `Month ${i + 1}`,
                        }))}
                      />
                    </div>
                    <div className="flex flex-col gap-2">
                      <span className="text-xs font-bold text-slate-600 uppercase tracking-widest flex items-center gap-2">
                        <IndianRupee size={16} className="text-indigo-600" /> Lifted Amount (₹)
                      </span>
                      <div className="relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm font-black text-slate-400">₹</span>
                        <input
                          type="number"
                          value={liftAmountInput}
                          onChange={(e) => setLiftAmountInput(e.target.value)}
                          placeholder="Enter lift amount"
                          className="w-full h-11 pl-8 pr-4 rounded-xl border border-slate-200 text-sm font-bold focus:ring-2 focus:ring-blue-500/20"
                        />
                      </div>
                    </div>
                    <div className="flex flex-col gap-2">
                      <span className="text-xs font-bold text-slate-600 uppercase tracking-widest flex items-center gap-2">
                        <TrendingUp size={16} className="text-amber-600" /> Winner member
                      </span>
                      {liftAmountInput && Number(liftAmountInput) > 0 ? (
                        <CustomSelect
                          value={selectedWinnerId}
                          onChange={(winnerId) => handleWinnerAndDividendChange(winnerId, Number(liftAmountInput))}
                          options={[
                            { value: 'none', label: 'Unclaimed / None' },
                            ...members.map((m) => ({ value: m.membershipId || m.id, label: m.name })),
                          ]}
                        />
                      ) : (
                        <div className="h-11 px-4 flex items-center rounded-xl bg-slate-50 border border-slate-200 text-sm font-medium text-slate-400">
                          Enter lift amount first
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-4 pt-4 border-t border-slate-100">
                    <button onClick={exportToCSV} className="flex items-center gap-2 h-10 px-6 rounded-xl bg-emerald-50 text-emerald-700 font-bold text-xs uppercase hover:bg-emerald-100 transition-colors">
                      <Download size={16} /> Download CSV Ledger
                    </button>
                    <p className="text-xs text-slate-500 self-center font-medium">
                      Note: Once a winner is set, dynamic dues are applied automatically to all members.
                    </p>
                  </div>
                </div>

                {/* Dashboard Stats */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                  <AdminMetricCard label="Enrolled" value={paymentStats.totalMembers} icon={Users} iconClassName="bg-blue-50 text-blue-600" delay={0.05} />
                  <AdminMetricCard label="Paid" value={paymentStats.paidCount} icon={CheckCircle2} iconClassName="bg-emerald-50 text-emerald-600" delay={0.1} />
                  <AdminMetricCard label="Pending" value={paymentStats.pendingCount} icon={Clock} iconClassName="bg-amber-50 text-amber-600" delay={0.15} />
                  <AdminMetricCard label={`Collected M${selectedMonth}`} value={formatCurrency(paymentStats.totalCollected)} icon={IndianRupee} iconClassName="bg-indigo-50 text-indigo-600" delay={0.2} />
                </div>

                {/* Members Ledger */}
                <div className="bg-white rounded-[32px] border border-slate-200 shadow-sm overflow-hidden">
                  <table className="w-full text-left">
                    <thead className="bg-slate-50 border-b border-slate-200">
                      <tr>
                        <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">Member</th>
                        <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">Chit Lift Status</th>
                        <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">Due Amount (₹)</th>
                        <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {isLoadingMembers ? (
                        <tr><td colSpan={4}><PaymentsTableSkeleton rows={3} /></td></tr>
                      ) : filteredMembers.map(member => {
                        const payment = member.payments?.find((p: any) => p.month === selectedMonth);
                        const isPaid = payment?.status === 'PAID';
                        const dbValue = payment?.amount || group.monthlyContribution;
                        const currentInputValue = customAmounts[member.membershipId || member.id] !== undefined ? customAmounts[member.membershipId || member.id] : dbValue.toString();
                        const isWinner = member.liftedMonths?.includes(selectedMonth);
                        const hasWonBefore = member.liftedMonths?.some((wonMonth: number) => wonMonth < selectedMonth);

                        return (
                          <tr key={member.membershipId || member.id} className="hover:bg-slate-50 transition-colors">
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-blue-600 text-white font-black flex items-center justify-center">
                                  {member.name.charAt(0).toUpperCase()}
                                </div>
                                <div>
                                  <p className="text-sm font-bold text-slate-900">{member.name}</p>
                                  <p className="text-[10px] text-slate-500 font-bold">{member.phone}</p>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              {member.liftedMonths && member.liftedMonths.length > 0 ? (
                                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-100 text-amber-700">
                                  🏆 Lifted Month {member.liftedMonths.join(', ')}
                                </span>
                              ) : <span className="text-slate-400 font-bold">-</span>}
                            </td>
                            <td className="px-6 py-4">
                              <div className="relative flex items-center">
                                <span className="absolute left-3 text-xs font-black text-slate-400">₹</span>
                                <input
                                  type="number"
                                  value={currentInputValue}
                                  onChange={(e) => setCustomAmounts({ ...customAmounts, [member.membershipId || member.id]: e.target.value })}
                                  onBlur={() => handleSaveCustomAmount(member.id, member.membershipId)}
                                  className={cn(
                                    "w-32 h-10 pl-7 pr-3 rounded-xl border text-sm font-black focus:outline-none focus:ring-2",
                                    hasWonBefore ? "border-emerald-400 bg-emerald-50 text-emerald-700"
                                      : isWinner ? "border-amber-400 bg-amber-50 text-amber-700 animate-pulse"
                                        : "border-slate-200 bg-white text-slate-900 focus:ring-blue-500/20"
                                  )}
                                />
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-2">
                                <button
                                  onClick={() => handleTogglePaymentStatus(member.id, isPaid ? 'PAID' : 'PENDING', member.membershipId)}
                                  className={cn(
                                    "text-[10px] font-black uppercase tracking-wider px-3 py-1.5 rounded-lg border transition-all active:scale-95",
                                    isPaid ? "border-amber-200 text-amber-600 hover:bg-amber-50" : "border-emerald-200 text-emerald-600 hover:bg-emerald-50"
                                  )}
                                >
                                  {isPaid ? "Mark Pending" : "Mark Paid"}
                                </button>
                                <button
                                  onClick={() => sendWhatsAppStatusMessage(member)}
                                  className="p-2 rounded-lg border border-slate-200 hover:bg-green-50 text-green-600 transition-colors"
                                  title="Send WhatsApp Reminder"
                                >
                                  <MessageCircle size={16} />
                                </button>
                                <button
                                  onClick={() => handleRemoveMember(member.id, member.name, member.membershipId)}
                                  className="p-2 rounded-lg border border-slate-200 hover:bg-red-50 text-red-500 transition-colors"
                                  title="Remove Chit"
                                >
                                  <Trash2 size={15} />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </motion.div>
            )}

            {/* LIVE AUCTION TAB */}
            {activeTab === 'auction' && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
                {!currentAuction ? (
                  <div className="text-center py-20 bg-slate-50 border border-dashed border-slate-200 rounded-[32px]">
                    <p className="text-slate-500 font-medium mb-4">No auctions are currently scheduled for this group.</p>
                    <button onClick={handleScheduleAuction} className="px-6 py-3 rounded-xl bg-blue-600 text-white font-bold">Schedule First Auction</button>
                  </div>
                ) : (
                  <div className="bg-white p-8 rounded-[32px] border border-slate-200 shadow-sm max-w-2xl mx-auto text-center">
                    <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mb-2">Month {currentAuction.month} Auction</p>
                    <h3 className="text-3xl font-black text-slate-900 mb-8">Live Bidding Panel</h3>
                    <div className="grid grid-cols-2 gap-6 mb-8">
                      <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100">
                        <p className="text-[10px] text-slate-400 font-bold uppercase mb-1">Prize Value</p>
                        <p className="text-2xl font-black text-slate-900">{formatCurrency(currentAuction.prizeValue)}</p>
                      </div>
                      <div className="bg-blue-50 p-6 rounded-2xl border border-blue-100">
                        <p className="text-[10px] text-blue-500 font-bold uppercase mb-1">Winning Bid</p>
                        <p className="text-2xl font-black text-blue-600">{formatCurrency(currentAuction.winningBid || 0)}</p>
                      </div>
                    </div>
                    {currentAuction.status === 'UPCOMING' && (
                      <button onClick={() => handleAuctionStatus('OPEN')} className="w-full h-14 rounded-xl bg-blue-600 text-white font-bold text-lg hover:bg-blue-700">Start Auction</button>
                    )}
                    {currentAuction.status === 'OPEN' && (
                      <button onClick={() => handleAuctionStatus('CLOSED')} className="w-full h-14 rounded-xl bg-slate-900 text-white font-bold text-lg hover:bg-slate-800">Close Auction</button>
                    )}
                  </div>
                )}
              </motion.div>
            )}

            {/* MEMBERS LIST TAB */}
            {activeTab === 'members' && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
                <div className="bg-white rounded-[24px] border border-slate-200 shadow-sm overflow-hidden">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-4 sm:px-5 py-4 border-b border-slate-100">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-blue-50 border border-blue-100 text-blue-600 flex items-center justify-center">
                        <Users size={16} />
                      </div>
                      <div>
                        <h3 className="text-sm font-bold text-slate-900">Members</h3>
                        <p className="text-[11px] text-slate-500 font-medium">
                          {group.members?.length || 0} enrolled
                          {group.membersLimit ? ` · ${group.membersLimit} limit` : ''}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => setIsMemberModalOpen(true)}
                      className="h-10 px-4 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-sm font-bold flex items-center gap-1.5 transition-all"
                    >
                      <Plus size={15} /> Add member
                    </button>
                  </div>

                  {!group.members || group.members.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
                      <div className="w-14 h-14 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-center mb-4">
                        <Users size={22} className="text-slate-400" />
                      </div>
                      <h4 className="text-base font-bold text-slate-800">No members yet</h4>
                      <p className="text-sm text-slate-500 mt-1 mb-5">Add members to start this chit group.</p>
                      <button
                        onClick={() => setIsMemberModalOpen(true)}
                        className="h-10 px-5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-sm font-bold flex items-center gap-2"
                      >
                        <Plus size={15} /> Add first member
                      </button>
                    </div>
                  ) : (
                    <div className="divide-y divide-slate-100">
                      {group.members.map((m: any, idx: number) => {
                        const name = m.customName || m.user?.name || 'Member';
                        const phone = m.user?.phone || m.user?.mobile;
                        const avatarTone = [
                          'bg-blue-600',
                          'bg-indigo-600',
                          'bg-emerald-600',
                          'bg-slate-700',
                          'bg-cyan-700',
                          'bg-violet-600',
                        ][idx % 6];

                        return (
                          <div key={m.id} className="flex items-center gap-3 sm:gap-4 px-4 sm:px-5 py-3.5 hover:bg-slate-50/80 transition-colors">
                            <div className={cn('w-10 h-10 rounded-full text-white text-sm font-bold flex items-center justify-center shrink-0', avatarTone)}>
                              {name.charAt(0).toUpperCase()}
                            </div>
                            <div className="min-w-0 flex-1">
                              <div className="flex items-center gap-2 flex-wrap">
                                <p className="text-sm font-bold text-slate-900 truncate">{name}</p>
                                {m.status === 'PENDING' ? (
                                  <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-100">
                                    Pending
                                  </span>
                                ) : (
                                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-100">
                                    <CheckCircle2 size={10} /> Active
                                  </span>
                                )}
                              </div>
                              <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-500 font-medium">
                                {phone && (
                                  <span className="inline-flex items-center gap-1">
                                    <Phone size={11} className="text-slate-400" />
                                    {phone}
                                  </span>
                                )}
                                {m.customName && m.user?.name && (
                                  <span className="text-slate-400">Account: {m.user.name}</span>
                                )}
                              </div>
                            </div>
                            <div className="flex items-center gap-1 shrink-0">
                              {m.status === 'PENDING' && (
                                <button
                                  onClick={() => handleApproveMember(m.id)}
                                  disabled={approvingMemberId === m.id}
                                  className="h-9 px-3 rounded-xl bg-blue-600 text-white text-xs font-bold flex items-center gap-1 hover:bg-blue-500 disabled:opacity-60"
                                >
                                  {approvingMemberId === m.id ? <Loader2 size={12} className="animate-spin" /> : null}
                                  Approve
                                </button>
                              )}
                              <button
                                onClick={() => openMemberWhatsApp({
                                  id: m.userId,
                                  name,
                                  phone,
                                  mobile: m.user?.mobile,
                                })}
                                className="h-9 w-9 rounded-xl border border-slate-200 text-emerald-600 hover:bg-emerald-50 hover:border-emerald-200 transition-all flex items-center justify-center"
                                title="WhatsApp"
                              >
                                <MessageCircle size={14} />
                              </button>
                              <button
                                onClick={() => setEditMemberNameModal({ isOpen: true, membershipId: m.id, name: m.customName || m.user?.name || '' })}
                                className="h-9 w-9 rounded-xl border border-slate-200 text-slate-500 hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200 transition-all flex items-center justify-center"
                                title="Edit name"
                              >
                                <Pencil size={14} />
                              </button>
                              <button
                                onClick={() => handleRemoveMember(m.userId, name)}
                                className="h-9 w-9 rounded-xl border border-slate-200 text-slate-500 hover:bg-red-50 hover:text-red-600 hover:border-red-200 transition-all flex items-center justify-center"
                                title="Remove"
                              >
                                <Trash2 size={14} />
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </motion.div>
            )}

          </div>
        </div>
      </PageWrapper>

      {/* MemberSelectorModal */}
      <MemberSelectorModal
        isOpen={isMemberModalOpen}
        onClose={() => setIsMemberModalOpen(false)}
        onSelect={handleAddMember}
        isSubmitting={isAddingMember}
      />

      {/* Edit Member Name Modal */}
      {editMemberNameModal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl p-8 max-w-sm w-full shadow-2xl space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="text-xl font-black text-slate-900">Edit Display Name</h3>
              <button onClick={() => setEditMemberNameModal({ isOpen: false, membershipId: '', name: '' })} className="p-2 rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200">
                <X size={16} />
              </button>
            </div>
            <p className="text-sm text-slate-500">This sets a custom display name for this member within this group only. The original account name is not changed.</p>
            <form onSubmit={handleUpdateMemberName} className="space-y-4">
              <input
                type="text"
                value={editMemberNameModal.name}
                onChange={(e) => setEditMemberNameModal(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Enter display name"
                className="w-full h-12 px-4 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none text-sm font-medium"
                autoFocus
              />
              <div className="flex gap-3">
                <button type="button" onClick={() => setEditMemberNameModal({ isOpen: false, membershipId: '', name: '' })} className="flex-1 py-3 rounded-xl bg-slate-100 font-bold text-slate-600 hover:bg-slate-200">Cancel</button>
                <button type="submit" disabled={isUpdatingMemberName} className="flex-1 py-3 rounded-xl bg-blue-600 text-white font-bold hover:bg-blue-700 flex items-center justify-center gap-2">
                  {isUpdatingMemberName ? <Loader2 size={16} className="animate-spin" /> : <Pencil size={16} />}
                  Save Name
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Group Modal */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl overflow-hidden border border-slate-200">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center">
              <h3 className="text-xl font-black text-slate-900">Edit Group</h3>
              <button onClick={() => setIsEditModalOpen(false)} className="p-2 rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200">
                <X size={16} />
              </button>
            </div>
            <form onSubmit={handleUpdateGroup} className="p-6 space-y-5 max-h-[70vh] overflow-y-auto">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Calculation Type</label>
                <div className="grid grid-cols-2 gap-2 bg-slate-100 p-1 rounded-2xl">
                  {(['VARIATION_1', 'VARIATION_2'] as const).map(v => (
                    <button key={v} type="button" onClick={() => setEditCalculationType(v)}
                      className={cn('h-10 rounded-xl text-xs font-bold transition-all', editCalculationType === v ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500')}>
                      {v === 'VARIATION_1' ? 'Return Pay' : 'Fixed Pay'}
                    </button>
                  ))}
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Group Name</label>
                <input name="name" defaultValue={group.name} required className="w-full h-12 px-4 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500/20 outline-none text-sm" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Total Amount</label>
                  <input name="totalAmount" type="number" value={editTotalAmount} onChange={e => setEditTotalAmount(Number(e.target.value) || 0)} required className="w-full h-12 px-4 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500/20 outline-none text-sm" />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Members Limit</label>
                  <input name="membersLimit" type="number" value={editMembersLimit} onChange={e => setEditMembersLimit(Number(e.target.value) || 0)} required className="w-full h-12 px-4 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500/20 outline-none text-sm" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Monthly Pay</label>
                  <input name="monthlyContribution" type="number" value={editMonthlyContribution} onChange={e => setEditMonthlyContribution(Number(e.target.value) || 0)} required className="w-full h-12 px-4 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500/20 outline-none text-sm" />
                </div>
                {editCalculationType === 'VARIATION_1' ? (
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Lifted Pay</label>
                    <input name="liftedContribution" type="number" value={editLiftedContribution} onChange={e => setEditLiftedContribution(Number(e.target.value) || 0)} className="w-full h-12 px-4 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500/20 outline-none text-sm" />
                  </div>
                ) : (
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Start Bid</label>
                    <input name="startBid" type="number" value={editStartBid} onChange={e => setEditStartBid(Number(e.target.value) || 0)} className="w-full h-12 px-4 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500/20 outline-none text-sm" />
                  </div>
                )}
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Commission %</label>
                <input name="commissionPct" type="number" step="0.1" value={editCommissionPct} onChange={e => setEditCommissionPct(Number(e.target.value) || 5)} required className="w-full h-12 px-4 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500/20 outline-none text-sm" />
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setIsEditModalOpen(false)} className="flex-1 py-3 rounded-xl bg-slate-100 font-bold text-slate-600 hover:bg-slate-200">Cancel</button>
                <button type="submit" disabled={isUpdatingGroup} className="flex-1 py-3 rounded-xl bg-blue-600 text-white font-bold hover:bg-blue-700 flex items-center justify-center gap-2">
                  {isUpdatingGroup ? <Loader2 size={16} className="animate-spin" /> : null}
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Member Welcome WhatsApp Modal */}
      {memberWelcomeModal?.isOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-[32px] p-6 max-w-md w-full shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-start justify-between">
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600">
                <CheckCircle2 size={24} />
              </div>
              <button
                onClick={() => setMemberWelcomeModal(null)}
                className="p-2 rounded-xl hover:bg-slate-100 text-slate-400"
              >
                <X size={20} />
              </button>
            </div>
            <div>
              <h3 className="text-xl font-black text-slate-900">Member Registered!</h3>
              <p className="text-sm text-slate-500 mt-2 font-medium">
                Send a welcome WhatsApp to{' '}
                <span className="font-bold text-slate-900">{memberWelcomeModal.member.name}</span>?
              </p>
            </div>
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
              <textarea
                className="w-full text-sm text-slate-700 bg-transparent outline-none resize-y min-h-[220px] max-h-[360px] leading-relaxed"
                value={memberWelcomeModal.text}
                onChange={(e) => setMemberWelcomeModal({ ...memberWelcomeModal, text: e.target.value })}
              />
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-2 text-right">Editable Message</p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setMemberWelcomeModal(null)}
                className="flex-1 h-12 rounded-2xl border border-slate-200 font-bold text-slate-600 hover:bg-slate-50 text-xs uppercase tracking-wider"
              >
                Skip
              </button>
              <button
                onClick={() => {
                  openWhatsApp(memberWelcomeModal.member.phone, memberWelcomeModal.text);
                  setMemberWelcomeModal(null);
                }}
                className="flex-1 h-12 rounded-2xl bg-[#25D366] hover:bg-[#128C7E] text-white font-black flex items-center justify-center gap-2 text-xs uppercase tracking-wider shadow-lg shadow-green-500/20"
              >
                <MessageCircle size={16} /> Send WhatsApp
              </button>
            </div>
          </div>
        </div>
      )}

      {/* WhatsApp Winner Alert Modal */}
      {winnerMessageModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4">
          <div className="bg-white rounded-3xl p-8 max-w-sm w-full shadow-2xl text-center space-y-6">
            <h3 className="text-xl font-black text-slate-900">WhatsApp Notification</h3>
            <p className="text-sm text-slate-500 whitespace-pre-line text-left bg-slate-50 p-4 rounded-xl">{winnerMessageModal.text}</p>
            <div className="flex gap-3">
              <button onClick={() => setWinnerMessageModal(null)} className="flex-1 py-3 rounded-xl bg-slate-100 font-bold text-slate-600">Cancel</button>
              <button
                onClick={() => {
                  openWhatsApp(
                    winnerMessageModal.winner.phone || winnerMessageModal.winner.mobile,
                    winnerMessageModal.text
                  );
                  setWinnerMessageModal(null);
                }}
                className="flex-1 py-3 rounded-xl bg-green-500 text-white font-bold flex items-center justify-center gap-2"
              >
                <Send size={16} /> Send Alert
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Member Selector Modal */}
      <MemberSelectorModal
        isOpen={isMemberModalOpen}
        onClose={() => setIsMemberModalOpen(false)}
        onSelect={(userId, chitCount) => handleAddMember(userId, chitCount)}
        isSubmitting={isAddingMember}
      />

      <SchemePdfModal
        group={schemePdfGroup}
        agent={{
          name: session?.user?.name,
          email: session?.user?.email,
          phone: (session?.user as any)?.phone,
        }}
        onClose={() => setSchemePdfGroup(null)}
      />
    </AdminLayout>
  );
}
