'use client';












import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useSession } from 'next-auth/react';
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
  Send,
  Trophy,
  Copy,
  X,
  Minus
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { jsPDF } from 'jspdf';
import PageWrapper from '@/components/layout/PageWrapper';
import { GroupsCatalogSkeleton, PaymentsTableSkeleton } from '@/components/ui/Skeleton';
import { AdminStatCard, AdminMetricCard } from '@/components/admin/AdminStatCard';
import { CustomSelect } from '@/components/ui/CustomSelect';
import { toast } from 'sonner';
import CreateGroupModal from '@/components/admin/CreateGroupModal';
import { generateChitSchedule } from '@/lib/chitCalculations';

const getGroupSlug = (group: any) => {
  if (!group) return '';
  const cleanName = group.name.toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
  return `${cleanName}-${group.id}`;
};

export default function Dashboard() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-screen bg-slate-50 dark:bg-slate-950">
        <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
      </div>
    }>
      <DashboardContent />
    </Suspense>
  );
}

function DashboardContent() {
  const { data: session } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const groupSlug = searchParams.get('group');
  const [groups, setGroups] = useState<any[]>([]);
  const [selectedGroup, setSelectedGroup] = useState<any | null>(null);
  const [activeTab, setActiveTab] = useState<'members' | 'payments'>('payments');
  const [isLoadingGroups, setIsLoadingGroups] = useState(true);
  const [groupSearchQuery, setGroupSearchQuery] = useState('');
  const [isLoadingMembers, setIsLoadingMembers] = useState(false);

  // Group forms
  const [isGroupModalOpen, setIsGroupModalOpen] = useState(false);
  const [editingGroup, setEditingGroup] = useState<any | null>(null);
  const [groupCalcType, setGroupCalcType] = useState<'VARIATION_1' | 'VARIATION_2'>('VARIATION_1');
  const [groupFormData, setGroupFormData] = useState({
    name: '',
    totalValue: '',
    membersLimit: '',
    durationMonths: '',
    monthlyContribution: '',
    liftedContribution: '',
    startBid: '',
    commissionPct: '5'
  });
  const [isSubmittingGroup, setIsSubmittingGroup] = useState(false);
  const [groupErrors, setGroupErrors] = useState<Record<string, string>>({});
  const [groupToDelete, setGroupToDelete] = useState<any | null>(null);
  const [isDeletingGroup, setIsDeletingGroup] = useState(false);

  // Member states
  const [members, setMembers] = useState<any[]>([]);
  const [isMemberModalOpen, setIsMemberModalOpen] = useState(false);
  const [memberFormData, setMemberFormData] = useState({ name: '', phone: '', chitCount: 1 });
  const [isSubmittingMember, setIsSubmittingMember] = useState(false);
  const [memberToDelete, setMemberToDelete] = useState<any | null>(null);
  const [isDeletingMember, setIsDeletingMember] = useState(false);
  const [memberSearchQuery, setMemberSearchQuery] = useState('');
  const [paymentFilter, setPaymentFilter] = useState('ALL');

  const [editMemberModal, setEditMemberModal] = useState<{
    isOpen: boolean;
    membershipId: string;
    userId: string;
    name: string;
    phone: string;
    chitCount: number;
    initialChitCount: number;
  }>({
    isOpen: false,
    membershipId: '',
    userId: '',
    name: '',
    phone: '',
    chitCount: 1,
    initialChitCount: 1,
  });
  const [isUpdatingMemberDetails, setIsUpdatingMemberDetails] = useState(false);

  const handleUpdateMemberDetails = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUpdatingMemberDetails(true);
    try {
      const res = await fetch('/api/admin/customers', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          membershipId: editMemberModal.membershipId,
          userId: editMemberModal.userId,
          name: editMemberModal.name,
          phone: editMemberModal.phone,
          chitCount: editMemberModal.chitCount > editMemberModal.initialChitCount ? editMemberModal.chitCount : undefined
        }),
      });
      if (res.ok) {
        toast.success("Member details updated successfully!");
        setEditMemberModal({ isOpen: false, membershipId: '', userId: '', name: '', phone: '', chitCount: 1, initialChitCount: 1 });
        if (selectedGroup) {
          fetchGroupMembers(selectedGroup.id);
        }
      } else {
        const data = await res.json();
        toast.error(data.error || "Failed to update member details");
      }
    } catch (error) {
      toast.error("Something went wrong");
    } finally {
      setIsUpdatingMemberDetails(false);
    }
  };

  // Payment states
  const [selectedMonth, setSelectedMonth] = useState<number>(1);
  const [editingAmountUserId, setEditingAmountUserId] = useState<string | null>(null);
  const [customAmounts, setCustomAmounts] = useState<{ [userId: string]: string }>({});
  const [selectedWinnerId, setSelectedWinnerId] = useState<string>('none');
  const [winnerMessageModal, setWinnerMessageModal] = useState<{ isOpen: boolean, winner: any, text: string } | null>(null);
  const [liftAmountInput, setLiftAmountInput] = useState<string>('');
  const [isApplyingDividend, setIsApplyingDividend] = useState<boolean>(false);

  useEffect(() => {
    fetchGroups();
  }, []);

  useEffect(() => {
    if (groups.length > 0) {
      if (groupSlug) {
        const targetId = groupSlug.includes('-')
          ? groupSlug.split('-').pop()
          : groupSlug;
        const found = groups.find(g => g.id === targetId);
        if (found) {
          setSelectedGroup(found);
        } else {
          setSelectedGroup(null);
        }
      } else {
        setSelectedGroup(null);
      }
    }
  }, [groupSlug, groups]);

  useEffect(() => {
    if (selectedGroup) {
      fetchGroupMembers(selectedGroup.id);
      // Pre-fill lift amount: use liftedContribution if stored, else default to totalAmount (prize value)
      const liftAmt = selectedGroup.liftedContribution
        ? selectedGroup.liftedContribution
        : selectedGroup.totalAmount;
      setLiftAmountInput(String(liftAmt ?? ''));
      setSelectedWinnerId('none');
      setSelectedMonth(1);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedGroup?.id]);

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
        ? { id: editingGroup.id, ...groupFormData, calculationType: groupCalcType }
        : { ...groupFormData, calculationType: groupCalcType };

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
          liftedContribution: '',
          startBid: '',
          commissionPct: '5'
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
    setIsDeletingGroup(true);
    try {
      const res = await fetch(`/api/groups?id=${groupToDelete.id}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        toast.success("Group deleted successfully!");
        setGroupToDelete(null);
        if (selectedGroup?.id === groupToDelete.id) {
          router.push('/admin/dashboard');
        }
        fetchGroups();
      } else {
        toast.error("Failed to delete group");
      }
    } catch (err) {
      toast.error("Something went wrong");
    } finally {
      setIsDeletingGroup(false);
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

    const countToAdd = Math.max(1, Number(memberFormData.chitCount) || 1);

    if (selectedGroup && members.length + countToAdd - 1 >= selectedGroup.membersLimit) {
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
          groupId: selectedGroup.id,
          chitCount: countToAdd
        })
      });

      if (res.ok) {
        toast.success(`${countToAdd} chit(s) added successfully!`);
        setIsMemberModalOpen(false);
        setMemberFormData({ name: '', phone: '', chitCount: 1 });
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
      const url = memberToDelete.membershipId
        ? `/api/admin/customers?membershipId=${memberToDelete.membershipId}`
        : `/api/admin/customers?userId=${memberToDelete.id}&groupId=${selectedGroup.id}`;
      const res = await fetch(url, {
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
  const handleTogglePaymentStatus = async (userId: string, currentStatus: string, membershipId?: string) => {
    const nextStatus = currentStatus === 'PAID' ? 'PENDING' : 'PAID';
    const amountVal = parseFloat(customAmounts[membershipId || userId]) || selectedGroup.monthlyContribution;
    const currentMember = members.find(m => membershipId ? m.membershipId === membershipId : m.id === userId);

    // Optimistic UI updates
    setMembers(prev => prev.map(m => {
      if (membershipId ? m.membershipId === membershipId : m.id === userId) {
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
          membershipId,
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

  const handleSaveCustomAmount = async (userId: string, membershipId?: string) => {
    const amountVal = parseFloat(customAmounts[membershipId || userId]);
    if (isNaN(amountVal) || amountVal <= 0) {
      toast.error("Please enter a valid amount");
      return;
    }

    const currentMember = members.find(m => membershipId ? m.membershipId === membershipId : m.id === userId);
    const payment = currentMember?.payments?.find((p: any) => p.month === selectedMonth);
    const statusVal = payment?.status || 'PENDING';

    try {
      const res = await fetch('/api/admin/customers', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          membershipId,
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

  const handleWinnerAndDividendChange = async (winnerId: string, liftAmount: number) => {
    if (!selectedGroup) return;
    if (isNaN(liftAmount) || liftAmount <= 0) {
      toast.error("Please enter a valid lift amount first.");
      return;
    }

    // Calculate dividend and dues (No dividend flow applied)
    const dividend = 0;
    const perMemberDiscount = 0;
    const normalDue = selectedGroup.monthlyContribution;
    const discountedDue = normalDue;

    // 1. Optimistically trigger winner WhatsApp notification modal immediately
    if (winnerId !== 'none') {
      const winner = members.find((m) => m.id === winnerId);
      if (winner) {
        const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
          'July', 'August', 'September', 'October', 'November', 'December'];
        const now = new Date();
        const calMonth = monthNames[now.getMonth()];
        const calYear = now.getFullYear();
        const hasChanged = selectedGroup.liftedContribution && selectedGroup.liftedContribution !== selectedGroup.monthlyContribution;
        const nextMonthDue = hasChanged ? selectedGroup.liftedContribution : selectedGroup.monthlyContribution;
        const agentName = session?.user?.name ? `\n\nRegards,\n*${session.user.name}*` : '';
        const text = `*ChitFlow Winner Announcement* 🏆\n\nDear *${winner.name}*,\n\nCongratulations! 🎉 You have successfully lifted the chit for *Month ${selectedMonth} of ${selectedGroup?.duration}* (${calMonth} ${calYear}) in the group *"${selectedGroup?.name}"* with a bid value of *₹${liftAmount.toLocaleString('en-IN')}*.\n\nKindly note that your monthly contribution from next month onwards will be *₹${nextMonthDue.toLocaleString('en-IN')}*. We appreciate your continued association and timely payments. 🙏${agentName}`;
        setWinnerMessageModal({ isOpen: true, winner, text });
      }
    }

    setSelectedWinnerId(winnerId);
    setIsApplyingDividend(true);

    try {
      // 1. Update winner in the database (Auction record)
      const res = await fetch('/api/admin/customers', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          groupId: selectedGroup.id,
          month: selectedMonth,
          winnerId,
          prizeValue: winnerId === 'none' ? 0 : liftAmount,
          winningBid: 0,
          dividend: 0,
        }),
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || 'Failed to update winner');
      }

      // 2. Batch update payments for all members
      const batchPayments = members.map(m => {
        const payment = m.payments?.find((p: any) => p.month === selectedMonth);
        const isCurrentWinner = winnerId !== 'none' && m.id === winnerId;
        const hasWonBefore = m.liftedMonths?.some((wonMonth: number) => wonMonth < selectedMonth);

        const dueAmount = (isCurrentWinner || hasWonBefore)
          ? (selectedGroup.liftedContribution || selectedGroup.monthlyContribution)
          : selectedGroup.monthlyContribution;

        return {
          userId: m.id,
          amount: dueAmount,
          status: payment?.status || 'PENDING'
        };
      });

      if (batchPayments.length > 0) {
        const batchRes = await fetch('/api/admin/customers', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            groupId: selectedGroup.id,
            month: selectedMonth,
            payments: batchPayments
          })
        });

        if (!batchRes.ok) {
          toast.error("Failed to update member dues.");
        } else {
          if (winnerId !== 'none') {
            toast.success(`Winner set! Dues applied for members.`);
          } else {
            toast.success("Winner cleared and dues reset successfully!");
          }
        }
      } else {
        toast.success("Winner updated successfully!");
      }

      fetchGroupMembers(selectedGroup.id);
    } catch (error: any) {
      toast.error(error.message || 'Connection error');
    } finally {
      setIsApplyingDividend(false);
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
    const amountVal = payment?.amount || parseFloat(customAmounts[member.id]) || selectedGroup?.monthlyContribution || 0;
    const totalMonths = selectedGroup?.duration;
    const dashboardUrl = `${window.location.origin}/auth/member/login`;

    const text = `*ChitFlow Member Dashboard Summary* 📊\n\n` +
      `*Group:* ${selectedGroup?.name}\n` +
      `*Member:* ${member.name}\n` +
      `*Month:* ${selectedMonth} of ${totalMonths}\n` +
      `*Amount:* ₹${amountVal.toLocaleString('en-IN')}\n` +
      `*Payment Status:* ${isPaid ? 'PAID ✅' : 'PENDING ⏳'}\n\n` +
      `View your full dashboard here: ${dashboardUrl}`;

    const url = `https://wa.me/91${member.phone || member.mobile}?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
  };

  const downloadGroupSchedulePDF = (group: any) => {
    const totalAmount = group.totalAmount || group.totalValue || 0;
    const duration = group.duration || 10;
    const monthlyContribution = group.monthlyContribution || 0;
    const liftedContribution = group.liftedContribution || null;
    const calculationType = group.calculationType || 'VARIATION_1';
    const startBid = group.startBid || null;
    const startDate = group.startDate || null;
    const membersLimit = group.membersLimit || duration || 20;

    // Use actual commissionPct for calculation, but do not display it in the PDF
    const commissionPct = group.commissionPct !== undefined ? group.commissionPct : 5.0;

    const schedule = generateChitSchedule({
      calculationType,
      totalAmount,
      duration,
      monthlyContribution,
      liftedContribution,
      startBid,
      startDate,
      commissionPct,
      manualSchedule: group.manualSchedule || null,
    });

    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
    });

    const primaryColor = [37, 99, 235]; // Blue-600
    const textDark = [15, 23, 42]; // Slate-900
    const textMuted = [100, 116, 139]; // Slate-500
    const bgLight = [248, 250, 252]; // Slate-50
    const borderGray = [226, 232, 240]; // Slate-200

    // Top Bar
    doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.rect(0, 0, 210, 4, 'F');

    // Header Title
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(16);
    doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.text('CHITFLOW', 20, 20);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(textMuted[0], textMuted[1], textMuted[2]);
    doc.text('OFFICIAL SCHEME DETAIL SHEET', 20, 24);

    // Agent info on top-right
    const agentName = session?.user?.name || 'Admin';
    const agentEmail = session?.user?.email;
    const agentPhone = (session?.user as any)?.phone;

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(textDark[0], textDark[1], textDark[2]);
    doc.text(`AGENT: ${agentName.toUpperCase()}`, 190, 20, { align: 'right' });

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(textMuted[0], textMuted[1], textMuted[2]);

    if (agentPhone) {
      doc.text(`CONTACT: ${agentPhone}`, 190, 24, { align: 'right' });
    } else if (agentEmail) {
      doc.text(`EMAIL: ${agentEmail}`, 190, 24, { align: 'right' });
    }

    // Group Title Card
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(14);
    doc.setTextColor(textDark[0], textDark[1], textDark[2]);
    doc.text(group.name.toUpperCase(), 20, 36);

    // Scheme Details Panel (Background)
    doc.setFillColor(bgLight[0], bgLight[1], bgLight[2]);
    doc.roundedRect(20, 42, 170, 26, 3, 3, 'F');
    doc.setDrawColor(borderGray[0], borderGray[1], borderGray[2]);
    doc.roundedRect(20, 42, 170, 26, 3, 3, 'S');

    // Row 1 Inside Panel
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(textMuted[0], textMuted[1], textMuted[2]);
    doc.text('TOTAL CHIT VALUE', 25, 48);
    doc.text('MONTHLY CONTRIBUTION', 80, 48);
    doc.text('DURATION', 140, 48);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.setTextColor(textDark[0], textDark[1], textDark[2]);
    doc.text(`Rs. ${totalAmount.toLocaleString('en-IN')}`, 25, 54);
    doc.text(`Rs. ${monthlyContribution.toLocaleString('en-IN')}`, 80, 54);
    doc.text(`${duration} Months`, 140, 54);

    // Row 2 Inside Panel
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(textMuted[0], textMuted[1], textMuted[2]);
    doc.text('MEMBERS LIMIT', 25, 61);
    doc.text('CALCULATION TYPE', 80, 61);
    doc.text('LIFTED PAY', 140, 61);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(textDark[0], textDark[1], textDark[2]);
    doc.text(`${membersLimit} Members`, 25, 66);
    doc.text(
      calculationType === 'VARIATION_1'
        ? 'Return Pay Model'
        : calculationType === 'MANUAL'
          ? 'Manual Entry Model'
          : 'Fixed Pay Model',
      80,
      66
    );

    if (calculationType === 'VARIATION_1' || calculationType === 'MANUAL') {
      const L = liftedContribution || (monthlyContribution * 1.25);
      doc.text(`Rs. ${L.toLocaleString('en-IN')}`, 140, 66);
    } else {
      doc.text('-', 140, 66);
    }

    // Table Header
    let y = 78;
    doc.setFillColor(241, 245, 249); // Slate-100
    doc.rect(20, y, 170, 8, 'F');
    doc.setDrawColor(borderGray[0], borderGray[1], borderGray[2]);
    doc.line(20, y, 190, y);
    doc.line(20, y + 8, 190, y + 8);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(textMuted[0], textMuted[1], textMuted[2]);
    doc.text('MONTH', 24, y + 5.5);
    doc.text('MONTHLY CONTRIBUTION DETAILS', 55, y + 5.5);
    doc.text('PRIZE MONEY (BID AMOUNT)', 140, y + 5.5);

    y += 8;

    // Render Table Rows
    schedule.rows.forEach((row: any) => {
      if (y > 270) {
        doc.addPage();
        doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
        doc.rect(0, 0, 210, 4, 'F');

        y = 20;
        doc.setFillColor(241, 245, 249);
        doc.rect(20, y, 170, 8, 'F');
        doc.line(20, y, 190, y);
        doc.line(20, y + 8, 190, y + 8);
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(8);
        doc.setTextColor(textMuted[0], textMuted[1], textMuted[2]);
        doc.text('MONTH', 24, y + 5.5);
        doc.text('MONTHLY CONTRIBUTION DETAILS', 55, y + 5.5);
        doc.text('PRIZE MONEY (BID AMOUNT)', 140, y + 5.5);
        y += 8;
      }

      if (row.month % 2 === 0) {
        doc.setFillColor(bgLight[0], bgLight[1], bgLight[2]);
        doc.rect(20, y, 170, 7.5, 'F');
      }

      doc.setDrawColor(241, 245, 249);
      doc.line(20, y + 7.5, 190, y + 7.5);

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8.5);
      doc.setTextColor(textDark[0], textDark[1], textDark[2]);
      doc.text(String(row.month), 24, y + 5);

      if (calculationType === 'VARIATION_1' || calculationType === 'MANUAL') {
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(textDark[0], textDark[1], textDark[2]);
        doc.text('Reg: ', 55, y + 5);
        const regWidth = doc.getTextWidth('Reg: ');
        doc.setFont('helvetica', 'bold');
        doc.text(`Rs. ${row.monthlyPaymentValueRegular.toLocaleString('en-IN')}`, 55 + regWidth, y + 5);
        const regValWidth = doc.getTextWidth(`Rs. ${row.monthlyPaymentValueRegular.toLocaleString('en-IN')}`);

        doc.setFont('helvetica', 'normal');
        doc.setTextColor(textMuted[0], textMuted[1], textMuted[2]);
        doc.text(' / Lifted: ', 55 + regWidth + regValWidth, y + 5);
        const liftWidth = doc.getTextWidth(' / Lifted: ');
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(21, 128, 61); // Green-700
        doc.text(`Rs. ${row.monthlyPaymentValueLifted.toLocaleString('en-IN')}`, 55 + regWidth + regValWidth + liftWidth, y + 5);
      } else {
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(textDark[0], textDark[1], textDark[2]);
        doc.text(`Rs. ${row.monthlyPaymentValueRegular.toLocaleString('en-IN')}`, 55, y + 5);
      }

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8.5);
      doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
      doc.text(`Rs. ${row.bidAmount.toLocaleString('en-IN')}`, 140, y + 5);

      y += 7.5;
    });

    const blob = doc.output('blob');
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${group.name.replace(/\s+/g, '_')}_Scheme_Schedule.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    toast.success('Scheme PDF downloaded successfully!');
  };

  const exportToPDF = (member: any) => {
    const totalMonths = selectedGroup?.duration || 10;
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });

    // Brand name logic
    const agentName = session?.user?.name;
    const firstName = agentName ? agentName.trim().split(/\s+/)[0] : '';
    const brandName = firstName ? `${firstName.toUpperCase()} CHITFLOW` : 'CHITFLOW SYSTEM';

    // Account summary stats
    const paidPayments = member.payments?.filter((p: any) => p.status === 'PAID') || [];
    const paidCount = paidPayments.length;
    const pendingCount = Math.max(0, totalMonths - paidCount);
    const totalPaid = paidPayments.reduce((sum: number, p: any) => sum + (p.amount || 0), 0);

    // Color Palette
    const primaryColor = [79, 70, 229]; // Indigo-600
    const textDark = [15, 23, 42]; // Slate-900
    const textMuted = [100, 116, 139]; // Slate-500
    const textLight = [148, 163, 184]; // Slate-400
    const bgLight = [248, 250, 252]; // Slate-50
    const borderGray = [226, 232, 240]; // Slate-200

    // 1. Top Decorative Bar
    doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.rect(0, 0, 210, 5, 'F');

    // 2. Modern Header Layout
    // Brand icon - Modern gradient growth chart pillars (Fintech themed)
    doc.setFillColor(165, 180, 252); // Light indigo
    doc.roundedRect(20, 19, 1.8, 4, 0.4, 0.4, 'F');
    doc.setFillColor(129, 140, 248); // Medium indigo
    doc.roundedRect(23, 17, 1.8, 6, 0.4, 0.4, 'F');
    doc.setFillColor(79, 70, 229);  // Primary indigo
    doc.roundedRect(26, 15, 1.8, 8, 0.4, 0.4, 'F');

    // Brand title
    doc.setTextColor(textDark[0], textDark[1], textDark[2]);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(14);
    doc.text(brandName, 31, 21.5);

    // Document header info (Right aligned)
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.text('STATEMENT OF ACCOUNT', 190, 21.5, { align: 'right' });

    // Sub-header details
    const agentEmail = session?.user?.email || '';
    let agentPhone = (session?.user as any)?.phone || '';
    if (agentPhone.startsWith('no-phone')) {
      agentPhone = '';
    }
    const agentContact = [agentEmail, agentPhone].filter(Boolean).join('   |   ');

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(textMuted[0], textMuted[1], textMuted[2]);
    doc.text(`Agent: ${agentContact}`, 20, 28);

    doc.setFontSize(8);
    doc.setTextColor(textLight[0], textLight[1], textLight[2]);
    doc.text(`Issued: ${new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}`, 190, 28, { align: 'right' });

    // Thin header divider
    doc.setDrawColor(borderGray[0], borderGray[1], borderGray[2]);
    doc.setLineWidth(0.25);
    doc.line(20, 32, 190, 32);

    // 3. Consolidated Modern Summary Block
    const summaryY = 37;
    const summaryHeight = 30;
    const summaryWidth = 170;

    doc.setFillColor(bgLight[0], bgLight[1], bgLight[2]);
    doc.setDrawColor(borderGray[0], borderGray[1], borderGray[2]);
    doc.roundedRect(20, summaryY, summaryWidth, summaryHeight, 3, 3, 'FD');

    // Column 1: Member Info
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(6.5);
    doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.text('MEMBER DETAILS', 26, summaryY + 6);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.setTextColor(textDark[0], textDark[1], textDark[2]);
    doc.text(member.name || 'N/A', 26, summaryY + 12.5);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.5);
    doc.setTextColor(textMuted[0], textMuted[1], textMuted[2]);
    doc.text(member.phone || member.mobile || 'N/A', 26, summaryY + 18.5);

    // Column 2: Chit Scheme
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(6.5);
    doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.text('CHIT SCHEME DETAILS', 85, summaryY + 6);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.setTextColor(textDark[0], textDark[1], textDark[2]);
    doc.text(selectedGroup?.name || 'N/A', 85, summaryY + 12.5);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.5);
    doc.setTextColor(textMuted[0], textMuted[1], textMuted[2]);
    doc.text(`Pool Value: Rs. ${(selectedGroup?.totalAmount || 0).toLocaleString('en-IN')}`, 85, summaryY + 18.5);
    doc.text(`Duration: ${totalMonths} Months`, 85, summaryY + 24.5);

    // Column 3: Account Status
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(6.5);
    doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.text('ACCOUNT STATUS', 142, summaryY + 6);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.setTextColor(21, 128, 61); // Green-700
    doc.text(`${paidCount} / ${totalMonths} Paid`, 142, summaryY + 12.5);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.5);
    doc.setTextColor(textMuted[0], textMuted[1], textMuted[2]);
    doc.text(`Total Paid: Rs. ${totalPaid.toLocaleString('en-IN')}`, 142, summaryY + 18.5);

    if (pendingCount > 0) {
      doc.setTextColor(185, 28, 28); // Red-700
      doc.setFont('helvetica', 'bold');
      doc.text(`Pending: ${pendingCount} Months`, 142, summaryY + 24.5);
    } else {
      doc.setTextColor(21, 128, 61); // Green-700
      doc.setFont('helvetica', 'bold');
      doc.text(`Fully Up-to-Date`, 142, summaryY + 24.5);
    }

    // 4. Modern Table Layout (A4 optimized)
    let y = 78;
    const tableHeaderHeight = 9;
    const tableStartX = 20;
    const tableWidth = 170;

    // Header background (Slate-100)
    doc.setFillColor(241, 245, 249);
    doc.roundedRect(tableStartX, y - 5, tableWidth, tableHeaderHeight, 1.5, 1.5, 'F');

    doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.5);
    doc.text('CYCLE MONTH', 26, y + 1);
    doc.text('DUE AMOUNT (INR)', 85, y + 1);
    doc.text('PAYMENT STATUS', 184, y + 1, { align: 'right' });

    y += 8.5;
    let pageNum = 1;

    // Render Rows Loop
    for (let m = 1; m <= totalMonths; m++) {
      const payment = member.payments?.find((p: any) => p.month === m);
      const isPaid = payment?.status === 'PAID';

      let amountVal = payment?.amount;
      if (amountVal === undefined) {
        const hasWonBefore = member.liftedMonths?.some((wonMonth: number) => wonMonth < m);
        amountVal = hasWonBefore
          ? (selectedGroup?.liftedContribution || selectedGroup?.monthlyContribution)
          : selectedGroup?.monthlyContribution;
      }

      // Pagination Break (A4 limit at y = 270)
      if (y > 270) {
        // Draw page footer before transition
        doc.setDrawColor(borderGray[0], borderGray[1], borderGray[2]);
        doc.setLineWidth(0.2);
        doc.line(20, 282, 190, 282);
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(7);
        doc.setTextColor(textLight[0], textLight[1], textLight[2]);
        doc.text('System generated statement. Securely processed by ChitFlow.', 105, 287, { align: 'center' });
        doc.text(`Page ${pageNum}`, 190, 287, { align: 'right' });

        doc.addPage();
        pageNum++;

        // Top decorative bar
        doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
        doc.rect(0, 0, 210, 5, 'F');

        doc.setTextColor(textDark[0], textDark[1], textDark[2]);
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(10);
        doc.text(`${brandName} - STATEMENT OF ACCOUNT (Contd.)`, 20, 15);

        y = 25;

        // Draw Table Header on New Page
        doc.setFillColor(241, 245, 249);
        doc.roundedRect(tableStartX, y - 5, tableWidth, tableHeaderHeight, 1.5, 1.5, 'F');
        doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(8.5);
        doc.text('CYCLE MONTH', 26, y + 1);
        doc.text('DUE AMOUNT (INR)', 85, y + 1);
        doc.text('PAYMENT STATUS', 184, y + 1, { align: 'right' });

        y += 8.5;
      }

      // Zebra striping for rows
      if (m % 2 !== 0) {
        doc.setFillColor(bgLight[0], bgLight[1], bgLight[2]);
        doc.rect(20.1, y - 4, 169.8, 8.5, 'F');
      }

      // Soft horizontal separator between rows (No vertical lines for clean aesthetic)
      doc.setDrawColor(241, 245, 249);
      doc.setLineWidth(0.2);
      doc.line(20, y + 4.5, 190, y + 4.5);

      // Print Row Text
      doc.setTextColor(textDark[0], textDark[1], textDark[2]);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8.5);
      doc.text(`Month ${m}`, 26, y + 1.2);
      doc.text(`Rs. ${amountVal.toLocaleString('en-IN')}`, 85, y + 1.2);

      // Draw Capsule Status Badge (Right aligned)
      const badgeW = 20;
      const badgeH = 5.2;
      const badgeX = 184 - badgeW;
      const badgeY = y - 2;

      if (isPaid) {
        doc.setFillColor(220, 252, 231); // green-100
        doc.roundedRect(badgeX, badgeY, badgeW, badgeH, 1.5, 1.5, 'F');
        doc.setTextColor(21, 128, 61); // green-700
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(7.5);
        doc.text('PAID', badgeX + (badgeW / 2), badgeY + 3.7, { align: 'center' });
      } else {
        doc.setFillColor(254, 226, 226); // red-100
        doc.roundedRect(badgeX, badgeY, badgeW, badgeH, 1.5, 1.5, 'F');
        doc.setTextColor(185, 28, 28); // red-700
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(7.5);
        doc.text('PENDING', badgeX + (badgeW / 2), badgeY + 3.7, { align: 'center' });
      }

      y += 8.5;
    }

    // Final Page Footer
    doc.setDrawColor(borderGray[0], borderGray[1], borderGray[2]);
    doc.setLineWidth(0.2);
    doc.line(20, 282, 190, 282);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7);
    doc.setTextColor(textLight[0], textLight[1], textLight[2]);
    doc.text('System generated statement. Securely processed by ChitFlow.', 105, 287, { align: 'center' });
    doc.text(`Page ${pageNum}`, 190, 287, { align: 'right' });

    const blob = doc.output('blob');
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${member.name.replace(/\s+/g, '_')}_Chit_Statement.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    toast.success("Statement PDF exported successfully!");
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
        const liftDetails = currentWinner.lifts?.find((l: any) => l.month === selectedMonth);
        setLiftAmountInput(liftDetails?.prizeValue ? liftDetails.prizeValue.toString() : '');
      } else {
        setSelectedWinnerId('none');
        // Pre-fill lift amount using the exact schedule calculation for this month
        if (selectedGroup) {
          try {
            const schedule = generateChitSchedule({
              calculationType: selectedGroup.calculationType || 'VARIATION_1',
              totalAmount: selectedGroup.totalAmount,
              duration: selectedGroup.duration,
              monthlyContribution: selectedGroup.monthlyContribution,
              liftedContribution: selectedGroup.liftedContribution,
              startBid: selectedGroup.startBid,
              startDate: selectedGroup.startDate,
              commissionPct: selectedGroup.commissionPct || 5,
              manualSchedule: selectedGroup.manualSchedule || null,
            });
            const monthRow = schedule.rows.find(r => r.month === selectedMonth);
            const liftAmt = monthRow ? monthRow.bidAmount : selectedGroup.totalAmount;
            setLiftAmountInput(String(liftAmt ?? ''));
          } catch (e) {
            setLiftAmountInput(String(selectedGroup.totalAmount ?? ''));
          }
        } else {
          setLiftAmountInput('');
        }
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

    members.forEach(m => {
      const payment = m.payments?.find((p: any) => p.month === selectedMonth);
      if (payment && payment.status === 'PAID') {
        paidCount++;
        totalCollected += payment.amount || selectedGroup?.monthlyContribution || 5000;
      }
    });

    const pendingCount = members.length - paidCount;

    return {
      totalMembers: members.length,
      paidCount,
      pendingCount,
      totalCollected
    };
  })();

  const openEditGroupModal = (group: any) => {
    setEditingGroup(group);
    setGroupCalcType(group.calculationType || 'VARIATION_1');
    setGroupFormData({
      name: group.name,
      totalValue: group.totalAmount.toString(),
      membersLimit: group.membersLimit.toString(),
      durationMonths: group.duration.toString(),
      monthlyContribution: group.monthlyContribution.toString(),
      liftedContribution: (group.liftedContribution ?? group.monthlyContribution).toString(),
      startBid: (group.startBid ?? '').toString(),
      commissionPct: (group.commissionPct ?? 5).toString()
    });
    setGroupErrors({});
    setIsGroupModalOpen(true);
  };

  const openCreateGroupModal = () => {
    setEditingGroup(null);
    setGroupCalcType('VARIATION_1');
    setGroupFormData({
      name: '',
      totalValue: '',
      membersLimit: '',
      durationMonths: '',
      monthlyContribution: '',
      liftedContribution: '',
      startBid: '',
      commissionPct: '5'
    });
    setGroupErrors({});
    setIsGroupModalOpen(true);
  };

  const handleCreateGroupViaModal = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmittingGroup(true);
    const formData = new FormData(e.currentTarget);
    let manualSchedule: unknown = null;
    const rawSchedule = formData.get('manualSchedule');
    if (typeof rawSchedule === 'string' && rawSchedule) {
      try {
        manualSchedule = JSON.parse(rawSchedule);
      } catch {
        manualSchedule = null;
      }
    }
    const payload = {
      name: formData.get('name'),
      totalValue: formData.get('totalValue'),
      membersLimit: formData.get('membersLimit'),
      durationMonths: formData.get('durationMonths'),
      monthlyContribution: formData.get('monthlyContribution'),
      liftedContribution: formData.get('liftedContribution'),
      calculationType: formData.get('calculationType'),
      startBid: formData.get('startBid'),
      commissionPct: formData.get('commissionPct'),
      manualSchedule,
    };
    try {
      const method = editingGroup ? 'PUT' : 'POST';
      const body = editingGroup ? { id: editingGroup.id, ...payload } : payload;
      const res = await fetch('/api/groups', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      if (res.ok) {
        toast.success(editingGroup ? 'Group updated!' : 'Group created successfully!');
        setIsGroupModalOpen(false);
        setEditingGroup(null);
        fetchGroups();
      } else {
        const err = await res.json();
        toast.error(err.error || 'Failed to save group');
      }
    } catch {
      toast.error('Connection failed');
    } finally {
      setIsSubmittingGroup(false);
    }
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
                  className="bg-white rounded-[24px] p-6 sm:p-8 flex flex-col sm:flex-row sm:items-center justify-between gap-6 border border-slate-200 shadow-sm"
                >
                  <div className="min-w-0 flex-1">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1 flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
                      Agent Workspace
                    </p>
                    <h1 className="text-3xl font-black text-slate-900 tracking-tight">
                      Groups &amp; Payments
                    </h1>
                    <p className="text-slate-500 mt-2 text-sm font-medium">
                      Create groups, track payments, and manage your members from one unified dashboard.
                    </p>
                  </div>
                  <button type="button" onClick={openCreateGroupModal} className="btn-primary w-full sm:w-auto shrink-0 shadow-blue-500/10">
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
                            className="bg-white rounded-[24px] border border-slate-200 shadow-sm hover:shadow-md hover:border-blue-200 transition-all duration-200 flex flex-col overflow-hidden group"
                          >
                            <div className="p-5 sm:p-6 flex-1 flex flex-col">
                              <div className="flex items-start justify-between gap-2 mb-4">
                                <div className="w-12 h-12 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 shrink-0">
                                  <Layers size={22} strokeWidth={2} />
                                </div>
                                <div className="flex gap-1 shrink-0">
                                  <button
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      downloadGroupSchedulePDF(group);
                                    }}
                                    className="p-2 rounded-lg hover:bg-blue-50 text-slate-400 hover:text-blue-600 transition-colors"
                                    title="Download Scheme PDF"
                                  >
                                    <Download size={16} />
                                  </button>
                                  <button
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      openEditGroupModal(group);
                                    }}
                                    className="p-2 rounded-lg hover:bg-slate-50 text-slate-400 hover:text-blue-600 transition-colors"
                                    title="Edit"
                                  >
                                    <Edit3 size={16} />
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
                                    <Trash2 size={16} />
                                  </button>
                                </div>
                              </div>
                              <h3 className="text-xl font-bold text-slate-900 line-clamp-2 leading-tight mb-5">{group.name}</h3>

                              <div className="grid grid-cols-2 gap-x-4 gap-y-5 mt-auto text-sm">
                                <div>
                                  <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">Pool Value</p>
                                  <p className="font-black text-slate-900">{formatCurrency(group.totalAmount)}</p>
                                </div>
                                <div>
                                  <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">Monthly</p>
                                  <p className="font-black text-slate-900">{formatCurrency(group.monthlyContribution)}</p>
                                </div>
                                <div>
                                  <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">Duration</p>
                                  <p className="font-semibold text-slate-700">{group.duration} mo</p>
                                </div>
                                <div>
                                  <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">Members</p>
                                  <p className="font-semibold text-slate-700">
                                    <span className={group._count?.members === group.membersLimit ? 'text-emerald-600 font-bold' : 'text-blue-600 font-bold'}>
                                      {group._count?.members || 0}
                                    </span> / {group.membersLimit}
                                  </p>
                                </div>
                              </div>
                            </div>
                            <div className="border-t border-slate-100 p-2 bg-slate-50/50">
                              <button
                                type="button"
                                onClick={() => router.push('/admin/dashboard?group=' + getGroupSlug(group))}
                                className="w-full py-2.5 flex items-center justify-center gap-2 text-sm font-bold text-slate-600 group-hover:text-blue-600 group-hover:bg-white rounded-xl transition-all"
                              >
                                Manage Group <ChevronRight size={16} />
                              </button>
                            </div>
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
                <div className="bg-white rounded-[24px] p-5 sm:p-6 border border-slate-200 shadow-sm">
                  <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
                    <div className="space-y-4">
                      <div className="flex flex-wrap items-center gap-2">
                        <button
                          type="button"
                          onClick={() => router.push('/admin/dashboard')}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-50 border border-slate-200 text-slate-600 text-xs sm:text-sm font-semibold hover:bg-blue-50 hover:border-blue-200 hover:text-blue-700 transition-all whitespace-nowrap"
                        >
                          <ArrowLeft size={14} />
                          <span>Back to groups</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => downloadGroupSchedulePDF(selectedGroup)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs sm:text-sm font-bold hover:bg-emerald-100 transition-all whitespace-nowrap"
                        >
                          <Download size={14} />
                          <span className="hidden sm:inline">Download Scheme PDF</span>
                          <span className="sm:hidden">Scheme PDF</span>
                        </button>
                      </div>

                      <div className="min-w-0 flex items-start gap-3 sm:gap-4">
                        <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 shrink-0 mt-0.5 sm:mt-0">
                          <Layers size={20} strokeWidth={2} className="sm:w-[22px] sm:h-[22px]" />
                        </div>
                        <div className="min-w-0">
                          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 leading-tight tracking-tight truncate">
                            {selectedGroup.name}
                          </h1>
                          <div className="flex flex-wrap items-center gap-x-2 sm:gap-x-4 gap-y-1 mt-1 sm:mt-1.5">
                            <span className="text-[10px] sm:text-[11px] font-semibold text-slate-500 whitespace-nowrap">{formatCurrency(selectedGroup.totalAmount)} pool</span>
                            <span className="text-slate-300 hidden sm:inline">·</span>
                            <span className="text-[10px] sm:text-[11px] font-semibold text-slate-500 whitespace-nowrap">{formatCurrency(selectedGroup.monthlyContribution)}/mo</span>
                            <span className="text-slate-300 hidden sm:inline">·</span>
                            <span className="text-[10px] sm:text-[11px] font-semibold text-slate-500 whitespace-nowrap">{selectedGroup.duration} months</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex w-full lg:w-auto p-1 bg-slate-100 rounded-xl border border-slate-200">
                      {(['payments', 'members'] as const).map((tab) => (
                        <button
                          key={tab}
                          type="button"
                          onClick={() => setActiveTab(tab)}
                          className={cn(
                            'flex-1 lg:flex-none px-5 py-2.5 rounded-[10px] text-xs font-bold uppercase tracking-wider transition-all duration-200',
                            activeTab === tab
                              ? 'bg-white text-blue-700 shadow-sm'
                              : 'text-slate-500 hover:text-slate-700'
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
                    <div className="bg-white rounded-[24px] border border-slate-200 shadow-sm p-4 sm:p-5 space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {/* Active Month Selector */}
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

                        {/* Lifted Amount Input */}
                        <div className="flex flex-col gap-1.5">
                          <span className="text-xs font-bold text-slate-600 flex items-center gap-2">
                            <IndianRupee size={16} className="text-indigo-600" /> Lifted Amount (₹)
                          </span>
                          <div className="relative flex items-center">
                            <span className="absolute left-3 text-xs font-bold text-slate-400 pointer-events-none">₹</span>
                            <input
                              type="number"
                              value={liftAmountInput}
                              onChange={(e) => setLiftAmountInput(e.target.value)}
                              placeholder="Enter exact prize payout"
                              className="w-full h-[42px] pl-7 pr-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                            />
                          </div>
                        </div>

                        {/* Winner Selection dropdown */}
                        <div className="flex flex-col gap-1.5">
                          <span className="text-xs font-bold text-slate-600 flex items-center gap-2">
                            <TrendingUp size={16} className="text-amber-600" /> Winner member
                          </span>
                          {liftAmountInput && Number(liftAmountInput) > 0 ? (
                            <CustomSelect
                              value={selectedWinnerId}
                              onChange={(winnerId) => handleWinnerAndDividendChange(winnerId, Number(liftAmountInput))}
                              options={[
                                { value: 'none', label: 'Unclaimed / None' },
                                ...members.map((m) => ({ value: m.id, label: m.name })),
                              ]}
                            />
                          ) : (
                            <div className="h-[42px] px-3.5 flex items-center rounded-xl bg-slate-50 border border-slate-200 text-xs font-medium text-slate-400">
                              Enter lift amount first
                            </div>
                          )}
                        </div>
                      </div>



                      <div className="flex flex-col sm:flex-row gap-3 pt-2 border-t border-slate-100">
                        <button
                          type="button"
                          onClick={exportToCSV}
                          className="w-full sm:w-auto flex items-center justify-center gap-2 h-11 px-4 rounded-xl bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 text-xs font-bold uppercase tracking-wide transition-colors"
                        >
                          <Download size={16} />
                          Download ledger
                        </button>
                        <p className="text-xs text-slate-500 self-center">
                          Lifted members use the updated contribution amount from the next cycle.
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                      <AdminMetricCard label="Enrolled" value={stats.totalMembers} icon={Users} iconClassName="bg-blue-50 text-blue-600" delay={0.05} />
                      <AdminMetricCard label="Paid" value={stats.paidCount} icon={CheckCircle2} iconClassName="bg-emerald-50 text-emerald-600" delay={0.1} />
                      <AdminMetricCard label="Pending" value={stats.pendingCount} icon={Clock} iconClassName="bg-amber-50 text-amber-600" delay={0.15} />
                      <AdminMetricCard label={`Collected M${selectedMonth}`} value={formatCurrency(stats.totalCollected)} icon={IndianRupee} iconClassName="bg-indigo-50 text-indigo-600" delay={0.2} />
                    </div>

                    {/* Search & Filter Toolbar */}
                    <div className="flex flex-col sm:flex-row gap-3 items-center justify-between bg-white dark:bg-slate-900 p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
                      {/* Search Bar */}
                      <div className="relative w-full sm:max-w-xs">
                        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={15} />
                        <input
                          type="text"
                          placeholder="Search members..."
                          value={memberSearchQuery}
                          onChange={(e) => setMemberSearchQuery(e.target.value)}
                          className="w-full h-10 pl-10 pr-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all shadow-inner"
                        />
                        {memberSearchQuery && (
                          <button
                            type="button"
                            onClick={() => setMemberSearchQuery('')}
                            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[10px] font-black text-slate-400 hover:text-slate-600 uppercase tracking-wider"
                          >
                            Clear
                          </button>
                        )}
                      </div>

                      {/* Payment Filter Segmented Tabs */}
                      <div className="flex bg-slate-50 dark:bg-slate-950 p-1 rounded-xl border border-slate-100 dark:border-slate-900 w-full sm:w-auto">
                        <button
                          type="button"
                          onClick={() => setPaymentFilter('ALL')}
                          className={cn(
                            "flex-1 sm:flex-initial h-8 px-4 rounded-lg text-xs font-bold transition-all uppercase tracking-wider",
                            paymentFilter === 'ALL'
                              ? "bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 shadow-sm border border-slate-200/50 dark:border-slate-700/50"
                              : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
                          )}
                        >
                          All ({members.length})
                        </button>
                        <button
                          type="button"
                          onClick={() => setPaymentFilter('PAID')}
                          className={cn(
                            "flex-1 sm:flex-initial h-8 px-4 rounded-lg text-xs font-bold transition-all uppercase tracking-wider",
                            paymentFilter === 'PAID'
                              ? "bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-900/30 shadow-sm"
                              : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
                          )}
                        >
                          Paid ({members.filter(m => m.payments?.some((p: any) => p.month === selectedMonth && p.status === 'PAID')).length})
                        </button>
                        <button
                          type="button"
                          onClick={() => setPaymentFilter('PENDING')}
                          className={cn(
                            "flex-1 sm:flex-initial h-8 px-4 rounded-lg text-xs font-bold transition-all uppercase tracking-wider",
                            paymentFilter === 'PENDING'
                              ? "bg-amber-50 dark:bg-amber-950/20 text-amber-600 dark:text-amber-400 border border-amber-100 dark:border-amber-900/30 shadow-sm"
                              : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
                          )}
                        >
                          Pending ({members.filter(m => !m.payments?.some((p: any) => p.month === selectedMonth && p.status === 'PAID')).length})
                        </button>
                      </div>
                    </div>

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
                            ) : members.length === 0 ? (
                              <tr>
                                <td colSpan={4} className="py-20 text-center">
                                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider italic">No members in this group yet</p>
                                </td>
                              </tr>
                            ) : filteredMembers.length === 0 ? (
                              <tr>
                                <td colSpan={4} className="py-20 text-center">
                                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider italic">No members match the selected filter</p>
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
                                        const currentInputValue = customAmounts[member.membershipId || member.id] !== undefined ? customAmounts[member.membershipId || member.id] : dbValue.toString();
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
                                                  [member.membershipId || member.id]: e.target.value
                                                })}
                                                onBlur={() => handleSaveCustomAmount(member.id, member.membershipId)}
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
                                        onClick={() => handleTogglePaymentStatus(member.id, isPaid ? 'PAID' : 'PENDING', member.membershipId)}
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
                                        onClick={() => exportToPDF(member)}
                                        title="Export PDF Statement"
                                        className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-800 text-slate-500 hover:text-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all cursor-pointer"
                                      >
                                        <Download size={16} />
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
                      ) : members.length === 0 ? (
                        <div className="py-20 text-center bg-white dark:bg-slate-900 rounded-[28px] border border-slate-200 dark:border-slate-800">
                          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider italic">No members in this group yet</p>
                        </div>
                      ) : filteredMembers.length === 0 ? (
                        <div className="py-20 text-center bg-white dark:bg-slate-900 rounded-[28px] border border-slate-200 dark:border-slate-800">
                          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider italic">No members match the selected filter</p>
                        </div>
                      ) : (
                        filteredMembers.map(member => {
                          const payment = member.payments?.find((p: any) => p.month === selectedMonth);
                          const isPaid = payment?.status === 'PAID';
                          const dbValue = payment?.amount || selectedGroup.monthlyContribution;
                          const currentInputValue = customAmounts[member.membershipId || member.id] !== undefined ? customAmounts[member.membershipId || member.id] : dbValue.toString();
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
                                        [member.membershipId || member.id]: e.target.value
                                      })}
                                      onBlur={() => handleSaveCustomAmount(member.id, member.membershipId)}
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
                                    onClick={() => handleTogglePaymentStatus(member.id, isPaid ? 'PAID' : 'PENDING', member.membershipId)}
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
                                    onClick={() => exportToPDF(member)}
                                    title="Export PDF Statement"
                                    className="h-10 px-3 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-500 hover:text-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all flex items-center justify-center active:scale-[0.96] cursor-pointer"
                                  >
                                    <Download size={16} />
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
                                onClick={() => {
                                  const userChits = members.filter(m => m.id === member.id).length;
                                  setEditMemberModal({
                                    isOpen: true,
                                    membershipId: member.membershipId,
                                    userId: member.id,
                                    name: member.name,
                                    phone: member.phone || '',
                                    chitCount: userChits,
                                    initialChitCount: userChits
                                  });
                                }}
                                className="p-2 text-slate-400 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-950/20 rounded-xl transition-all"
                                title="Edit Member Details"
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

      <CreateGroupModal
        isOpen={isGroupModalOpen}
        onClose={() => { setIsGroupModalOpen(false); setEditingGroup(null); }}
        onSubmit={handleCreateGroupViaModal}
        isSubmitting={isSubmittingGroup}
        group={editingGroup}
      />

      {/* --- ADD GROUP MEMBER MODAL --- */}
      <AnimatePresence>
        {isMemberModalOpen && (
          <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
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
                <div className="flex items-end gap-3">
                  <div className="flex-1">
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

                  <div className="flex flex-col items-center">
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Chits</label>
                    <div className="flex items-center gap-1 h-12 bg-slate-50 border border-slate-200 shadow-sm rounded-xl p-1 shrink-0">
                      <button
                        type="button"
                        onClick={() => setMemberFormData(prev => ({ ...prev, chitCount: Math.max(1, prev.chitCount - 1) }))}
                        className="w-8 h-full flex items-center justify-center bg-white hover:bg-slate-100 rounded-lg text-slate-600 transition-all active:scale-95 disabled:opacity-50 disabled:pointer-events-none"
                        disabled={memberFormData.chitCount <= 1}
                      >
                        <Minus size={14} strokeWidth={2.5} />
                      </button>
                      <div className="w-8 text-center select-none">
                        <span className="text-sm font-black text-slate-800">{memberFormData.chitCount}</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => setMemberFormData(prev => ({ ...prev, chitCount: prev.chitCount + 1 }))}
                        className="w-8 h-full flex items-center justify-center bg-white hover:bg-slate-100 rounded-lg text-slate-600 transition-all active:scale-95"
                      >
                        <Plus size={14} strokeWidth={2.5} />
                      </button>
                    </div>
                  </div>
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
          <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
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
                  disabled={isDeletingGroup}
                  className="flex-1 h-11 rounded-xl border border-slate-200 font-bold text-slate-600 hover:bg-slate-50 transition-all text-xs uppercase tracking-wider disabled:opacity-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteGroup}
                  disabled={isDeletingGroup}
                  className="flex-1 h-11 rounded-xl bg-red-600 hover:bg-red-700 text-white font-black transition-all flex items-center justify-center gap-1.5 text-xs uppercase tracking-wider shadow-lg shadow-red-500/20 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                >
                  {isDeletingGroup ? (
                    <Loader2 size={16} className="animate-spin" />
                  ) : (
                    'Delete Group'
                  )}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* --- CONFIRM MEMBER REMOVE MODAL --- */}
      <AnimatePresence>
        {memberToDelete && (
          <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
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
          <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
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
        {editMemberModal.isOpen && (
          <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setEditMemberModal({ isOpen: false, membershipId: '', userId: '', name: '', phone: '', chitCount: 1, initialChitCount: 1 })}
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
                  <h3 className="text-lg font-bold text-slate-900">Edit Member Details</h3>
                  <p className="text-xs text-slate-500 mt-1">Update how this member's name appears in this group</p>
                </div>
                <button
                  onClick={() => setEditMemberModal({ isOpen: false, membershipId: '', userId: '', name: '', phone: '', chitCount: 1, initialChitCount: 1 })}
                  className="p-1 rounded-xl hover:bg-slate-100 text-slate-400 transition-colors"
                >
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleUpdateMemberDetails} className="space-y-4">
                <div className="flex items-end gap-3">
                  <div className="flex-1">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1 mb-2 block">Member Name *</label>
                    <input
                      required
                      type="text"
                      value={editMemberModal.name}
                      onChange={(e) => setEditMemberModal(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="Enter name"
                      className="w-full h-12 px-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-sm font-semibold"
                    />
                  </div>

                  <div className="flex flex-col items-center">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Chits</label>
                    <div className="flex items-center gap-1 h-12 bg-slate-50 border border-slate-200 shadow-sm rounded-xl p-1 shrink-0">
                      <button
                        type="button"
                        onClick={() => setEditMemberModal(prev => ({ ...prev, chitCount: Math.max(prev.initialChitCount, prev.chitCount - 1) }))}
                        className="w-8 h-full flex items-center justify-center bg-white hover:bg-slate-100 rounded-lg text-slate-600 transition-all active:scale-95 disabled:opacity-50 disabled:pointer-events-none"
                        disabled={editMemberModal.chitCount <= editMemberModal.initialChitCount}
                      >
                        <Minus size={14} strokeWidth={2.5} />
                      </button>
                      <div className="w-8 text-center select-none">
                        <span className="text-sm font-black text-slate-800">{editMemberModal.chitCount}</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => setEditMemberModal(prev => ({ ...prev, chitCount: prev.chitCount + 1 }))}
                        className="w-8 h-full flex items-center justify-center bg-white hover:bg-slate-100 rounded-lg text-slate-600 transition-all active:scale-95"
                      >
                        <Plus size={14} strokeWidth={2.5} />
                      </button>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1 block">Mobile Number</label>
                  <input
                    type="text"
                    value={editMemberModal.phone}
                    onChange={(e) => setEditMemberModal(prev => ({ ...prev, phone: e.target.value }))}
                    placeholder="Enter mobile number"
                    className="w-full h-12 px-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-sm font-semibold"
                  />
                </div>

                <div className="pt-2 flex gap-3">
                  <button
                    type="button"
                    onClick={() => setEditMemberModal({ isOpen: false, membershipId: '', userId: '', name: '', phone: '', chitCount: 1, initialChitCount: 1 })}
                    className="flex-1 h-12 rounded-xl border border-slate-200 font-bold text-slate-600 hover:bg-slate-50 transition-all text-xs uppercase tracking-wider"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isUpdatingMemberDetails}
                    className="flex-[2] h-12 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-black transition-all flex items-center justify-center gap-2 text-xs uppercase tracking-wider shadow-lg shadow-blue-500/20 disabled:opacity-75"
                  >
                    {isUpdatingMemberDetails ? <Loader2 className="animate-spin" size={16} /> : "Save Changes"}
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
