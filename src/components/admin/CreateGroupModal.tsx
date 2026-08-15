'use client';

import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X, TrendingUp, PenLine } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  generateChitSchedule,
  suggestVariation2StartBid,
  suggestVariation2MonthlyContribution,
  emptyManualSchedule,
  resizeManualSchedule,
  type ManualScheduleEntry,
} from '@/lib/chitCalculations';

type CalcType = 'VARIATION_1' | 'VARIATION_2' | 'MANUAL';

interface CreateGroupModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
  isSubmitting: boolean;
  group?: any;
}

function normalizeManualSchedule(raw: unknown, duration: number): ManualScheduleEntry[] {
  if (!Array.isArray(raw) || raw.length === 0) return emptyManualSchedule(duration);
  const mapped: ManualScheduleEntry[] = raw.map((row: any, i: number) => ({
    month: Number(row?.month) || i + 1,
    regularPay: row?.regularPay === '' || row?.regularPay === null || row?.regularPay === undefined
      ? ''
      : Number(row.regularPay) || 0,
    liftedPay: row?.liftedPay === '' || row?.liftedPay === null || row?.liftedPay === undefined
      ? ''
      : Number(row.liftedPay) || 0,
    bidAmount: row?.bidAmount === '' || row?.bidAmount === null || row?.bidAmount === undefined
      ? ''
      : Number(row.bidAmount) || 0,
  }));
  return resizeManualSchedule(mapped, duration);
}

export default function CreateGroupModal({
  isOpen,
  onClose,
  onSubmit,
  isSubmitting,
  group,
}: CreateGroupModalProps) {
  const [calculationType, setCalculationType] = useState<CalcType>('MANUAL');
  const [name, setName] = useState('');
  const [totalValue, setTotalValue] = useState<number | ''>('');
  const [membersLimit, setMembersLimit] = useState<number | ''>('');
  const [durationMonths, setDurationMonths] = useState<number | ''>('');
  const [monthlyContribution, setMonthlyContribution] = useState<number | ''>('');
  const [liftedContribution, setLiftedContribution] = useState<number | ''>('');
  const [startBid, setStartBid] = useState<number | ''>('');
  const [commissionPct, setCommissionPct] = useState<number | ''>('');
  const [manualSchedule, setManualSchedule] = useState<ManualScheduleEntry[]>(emptyManualSchedule(1));
  const [activeTab, setActiveTab] = useState<'details' | 'schedule'>('details');
  const [mounted, setMounted] = useState(false);
  const justOpenedRef = useRef(true);

  useEffect(() => {
    setMounted(true);
  }, []);

  const parseNum = (val: string, min = 0): number | '' =>
    val === '' ? '' : Math.max(min, Number(val));

  const tVal = Number(totalValue) || 0;
  const dVal = Number(durationMonths) || 1;
  const cPct = Number(commissionPct) || 0;
  const mContrib = Number(monthlyContribution) || 0;

  const suggestedVar1Monthly = Math.round(tVal / dVal);
  const suggestedVar1Lifted = mContrib + Math.round(tVal / 100);
  const suggestedVar2Monthly = suggestVariation2MonthlyContribution(tVal, dVal, Number(startBid) || 0, cPct);
  const suggestedVar2StartBid = suggestVariation2StartBid(tVal, dVal, mContrib, cPct);

  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.body.style.overflow = 'hidden';
    document.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = '';
      document.removeEventListener('keydown', onKey);
    };
  }, [isOpen, onClose]);

  useEffect(() => {
    if (isOpen) {
      justOpenedRef.current = true;
      if (group) {
        const duration = group.duration || group.membersLimit || 1;
        setCalculationType(group.calculationType || 'VARIATION_1');
        setName(group.name || '');
        setTotalValue(group.totalAmount || group.totalValue || '');
        setMembersLimit(group.membersLimit || '');
        setDurationMonths(duration);
        setMonthlyContribution(group.monthlyContribution || '');
        setLiftedContribution(group.liftedContribution || '');
        setStartBid(group.startBid || '');
        setCommissionPct(group.commissionPct !== undefined ? group.commissionPct : 5.0);
        setManualSchedule(normalizeManualSchedule(group.manualSchedule, duration));
        setActiveTab(group.calculationType === 'MANUAL' ? 'schedule' : 'details');
      } else {
        setCalculationType('MANUAL');
        setName('');
        setTotalValue('');
        setMembersLimit('');
        setDurationMonths('');
        setMonthlyContribution('');
        setLiftedContribution('');
        setStartBid('');
        setCommissionPct('');
        setManualSchedule(emptyManualSchedule(1));
        setActiveTab('details');
      }
    }
  }, [isOpen, group]);

  useEffect(() => {
    if (!isOpen) return;
    if (justOpenedRef.current) {
      justOpenedRef.current = false;
      return;
    }
    if (!totalValue || !durationMonths) return;
    if (calculationType === 'MANUAL') return;

    const t = Number(totalValue);
    const d = Number(durationMonths);
    const c = Number(commissionPct) || 0;

    if (calculationType === 'VARIATION_1') {
      const regular = Math.round(t / d);
      setMonthlyContribution(regular);
      setLiftedContribution(regular + Math.round(t / 100));
    } else if (calculationType === 'VARIATION_2') {
      const C = Math.round((t * 0.81) / d);
      setMonthlyContribution(C);
      setStartBid(suggestVariation2StartBid(t, d, C, c));
    }
  }, [calculationType, totalValue, durationMonths, commissionPct, isOpen]);

  // Keep manual prize rows in sync with duration / members count
  useEffect(() => {
    if (!isOpen || calculationType !== 'MANUAL') return;
    const months = Number(durationMonths) || Number(membersLimit) || 1;
    setManualSchedule((prev) => resizeManualSchedule(prev, months));
  }, [durationMonths, membersLimit, calculationType, isOpen]);

  const handleMonthlyContributionChange = (val: number | '') => {
    setMonthlyContribution(val);
    if (calculationType === 'VARIATION_2' && val !== '') {
      setStartBid(suggestVariation2StartBid(tVal, dVal, Number(val), cPct));
    }
  };

  const handleStartBidChange = (val: number | '') => {
    setStartBid(val);
    if (calculationType === 'VARIATION_2' && val !== '') {
      setMonthlyContribution(
        suggestVariation2MonthlyContribution(tVal, dVal, Number(val), cPct)
      );
    }
  };

  const updateManualRow = (
    index: number,
    field: keyof Omit<ManualScheduleEntry, 'month'>,
    value: number | ''
  ) => {
    setManualSchedule((prev) =>
      prev.map((row, i) => (i === index ? { ...row, [field]: value } : row))
    );
  };

  const scheduleData = generateChitSchedule({
    calculationType,
    totalAmount: tVal,
    duration: dVal,
    monthlyContribution: mContrib,
    liftedContribution:
      calculationType === 'VARIATION_1' || calculationType === 'MANUAL'
        ? Number(liftedContribution) || 0
        : null,
    startBid: calculationType === 'VARIATION_2' ? Number(startBid) || 0 : null,
    startDate: null,
    commissionPct: calculationType === 'MANUAL' ? 0 : cPct,
    manualSchedule: calculationType === 'MANUAL' ? manualSchedule : null,
  });

  const fieldLabel = 'text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-1';
  const fieldInput = 'w-full h-10 px-3.5 rounded-xl border border-slate-200 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-xs font-semibold';
  const cellInput =
    'w-full h-8 px-2 rounded-lg border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-[11px] font-semibold tabular-nums';

  const handleCalcTypeChange = (type: CalcType) => {
    setCalculationType(type);
    if (type === 'MANUAL') {
      const months = Number(durationMonths) || Number(membersLimit) || 1;
      setManualSchedule((prev) =>
        prev.length === months ? prev : resizeManualSchedule(prev, months)
      );
      setActiveTab('details');
    }
  };

  const canOpenPrizeSchedule =
    calculationType !== 'MANUAL' ||
    (
      !!name.trim() &&
      Number(totalValue) > 0 &&
      Number(membersLimit) > 0 &&
      Number(durationMonths) > 0 &&
      Number(monthlyContribution) > 0 &&
      Number(liftedContribution) > 0
    );
  const isManualScheduleComplete =
    calculationType !== 'MANUAL' ||
    (
      canOpenPrizeSchedule &&
      manualSchedule.every(
        (r) => r.bidAmount !== '' && r.bidAmount !== null && r.bidAmount !== undefined
      )
    );

  const goToPrizeSchedule = () => {
    if (!canOpenPrizeSchedule) return;
    setActiveTab('schedule');
  };

  // If Custom details become incomplete, leave the prize schedule
  useEffect(() => {
    if (!isOpen || calculationType !== 'MANUAL') return;
    if (activeTab === 'schedule' && !canOpenPrizeSchedule) {
      setActiveTab('details');
    }
  }, [isOpen, calculationType, activeTab, canOpenPrizeSchedule]);

  if (!mounted) return null;

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 flex items-center justify-center p-4" style={{ zIndex: 9999 }}>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className={cn(
              'relative w-full bg-white rounded-2xl p-4 shadow-2xl border border-slate-200 z-10 flex flex-col overflow-hidden',
              calculationType === 'MANUAL' ? 'max-w-lg' : 'max-w-md'
            )}
            style={{ maxHeight: '80vh' }}
          >
            <div className="flex items-center justify-between gap-3 mb-3">
              <div className="flex p-1 bg-slate-100 rounded-xl flex-1">
                <button
                  type="button"
                  onClick={() => setActiveTab('details')}
                  className={cn(
                    'flex-1 py-1.5 text-xs font-bold rounded-lg transition-all',
                    activeTab === 'details' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'
                  )}
                >
                  Group Details
                </button>
                <button
                  type="button"
                  onClick={goToPrizeSchedule}
                  disabled={calculationType === 'MANUAL' && !canOpenPrizeSchedule}
                  title={
                    calculationType === 'MANUAL' && !canOpenPrizeSchedule
                      ? 'Fill all group details first'
                      : undefined
                  }
                  className={cn(
                    'flex-1 py-1.5 text-xs font-bold rounded-lg transition-all',
                    activeTab === 'schedule' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700',
                    calculationType === 'MANUAL' && !canOpenPrizeSchedule && 'opacity-40 cursor-not-allowed hover:text-slate-500'
                  )}
                >
                  {calculationType === 'MANUAL' ? 'Prize Schedule' : 'Schedule Preview'}
                </button>
              </div>
              <button
                onClick={onClose}
                className="p-1.5 rounded-xl hover:bg-slate-100 text-slate-400 transition-colors flex-shrink-0"
              >
                <X size={16} />
              </button>
            </div>

            <div className="flex-1 flex flex-col min-h-0">
              {activeTab === 'details' ? (
                <form onSubmit={onSubmit} className="flex flex-col flex-1 min-h-0">
                  <div className="flex-1 overflow-y-auto pr-2 pb-2 space-y-3">
                    <input type="hidden" name="calculationType" value={calculationType} />
                    <input
                      type="hidden"
                      name="manualSchedule"
                      value={JSON.stringify(
                        manualSchedule.map((r) => ({
                          month: r.month,
                          regularPay: Number(monthlyContribution) || 0,
                          liftedPay: Number(liftedContribution) || 0,
                          bidAmount: r.bidAmount === '' ? 0 : Number(r.bidAmount),
                        }))
                      )}
                    />

                    <div className="space-y-1">
                      <label className={fieldLabel}>Calculation Model</label>
                      <div className="grid grid-cols-3 gap-1 p-1 bg-slate-100 rounded-xl">
                        <button
                          type="button"
                          onClick={() => handleCalcTypeChange('VARIATION_1')}
                          className={cn(
                            'py-1.5 text-[11px] font-bold rounded-lg transition-all',
                            calculationType === 'VARIATION_1' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500'
                          )}
                        >
                          Return Pay
                        </button>
                        <button
                          type="button"
                          onClick={() => handleCalcTypeChange('VARIATION_2')}
                          className={cn(
                            'py-1.5 text-[11px] font-bold rounded-lg transition-all',
                            calculationType === 'VARIATION_2' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500'
                          )}
                        >
                          Fixed Pay
                        </button>
                        <button
                          type="button"
                          onClick={() => handleCalcTypeChange('MANUAL')}
                          className={cn(
                            'py-1.5 text-[11px] font-bold rounded-lg transition-all flex items-center justify-center gap-1',
                            calculationType === 'MANUAL' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500'
                          )}
                        >
                          <PenLine size={11} />
                          Custom
                        </button>
                      </div>
                    </div>

                    {calculationType === 'MANUAL' && (
                      <div className="rounded-xl bg-slate-50 border border-slate-200 px-3 py-2.5 text-[11px] text-slate-600 font-medium leading-relaxed space-y-1">
                        <p className="font-bold text-slate-800">How Custom works</p>
                        <p>1. Fill <span className="font-semibold">all fields</span> below (name, value, members, pays).</p>
                        <p>2. Then open <span className="font-semibold">Prize Schedule</span> to enter prize for each month.</p>
                      </div>
                    )}

                    {calculationType === 'VARIATION_1' && (
                      <div className="rounded-xl bg-amber-50/50 border border-amber-200/80 px-3 py-1.5 text-[10px] text-amber-800 font-semibold">
                        <p>⚠️ Dues are generated dynamically. Verify schedule preview before creating.</p>
                      </div>
                    )}

                    {calculationType === 'VARIATION_2' && (
                      <div className="rounded-xl bg-amber-50/50 border border-amber-200/80 px-3 py-1.5 text-[10px] text-amber-800 font-semibold">
                        <p>⚠️ Dues are generated dynamically. Verify schedule preview before creating.</p>
                      </div>
                    )}

                    <div className="space-y-1">
                      <label className={fieldLabel}>Group Name</label>
                      <input
                        required
                        name="name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="e.g. Gold Tier Series B"
                        className={fieldInput}
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div className="space-y-1">
                        <label className={fieldLabel}>Total Value (₹)</label>
                        <input
                          required
                          type="number"
                          name="totalValue"
                          value={totalValue}
                          onChange={(e) => setTotalValue(parseNum(e.target.value))}
                          className={fieldInput}
                        />
                      </div>
                      <div className="space-y-1">
                        <label className={fieldLabel}>Members Limit</label>
                        <input
                          required
                          type="number"
                          name="membersLimit"
                          value={membersLimit}
                          onChange={(e) => {
                            const val = parseNum(e.target.value, 1);
                            setMembersLimit(val);
                            setDurationMonths(val);
                          }}
                          className={fieldInput}
                        />
                      </div>
                    </div>

                    <div className={cn('grid gap-2', calculationType === 'MANUAL' ? 'grid-cols-1' : 'grid-cols-2')}>
                      <div className="space-y-1">
                        <label className={fieldLabel}>Duration (Months)</label>
                        <input
                          required
                          type="number"
                          name="durationMonths"
                          value={durationMonths}
                          onChange={(e) => setDurationMonths(parseNum(e.target.value, 1))}
                          className={fieldInput}
                        />
                      </div>
                      {calculationType !== 'MANUAL' && (
                        <div className="space-y-1">
                          <label className={fieldLabel}>Commission %</label>
                          <input
                            required
                            type="number"
                            step="0.1"
                            name="commissionPct"
                            value={commissionPct}
                            onChange={(e) => setCommissionPct(parseNum(e.target.value))}
                            className={fieldInput}
                          />
                        </div>
                      )}
                    </div>

                    {calculationType === 'MANUAL' && (
                      <>
                        <input type="hidden" name="commissionPct" value={0} />
                        <div className="grid grid-cols-2 gap-2">
                          <div className="space-y-1">
                            <label className={fieldLabel}>Monthly Pay</label>
                            <input
                              required
                              type="number"
                              name="monthlyContribution"
                              value={monthlyContribution}
                              onChange={(e) => setMonthlyContribution(parseNum(e.target.value))}
                              placeholder="Before lift"
                              className={fieldInput}
                            />
                            <p className="text-[9px] text-slate-400 pl-1">What members pay each month</p>
                          </div>
                          <div className="space-y-1">
                            <label className={fieldLabel}>After Lift Pay</label>
                            <input
                              required
                              type="number"
                              name="liftedContribution"
                              value={liftedContribution}
                              onChange={(e) => setLiftedContribution(parseNum(e.target.value))}
                              placeholder="After winning"
                              className={fieldInput}
                            />
                            <p className="text-[9px] text-slate-400 pl-1">What winners pay after lift</p>
                          </div>
                        </div>
                      </>
                    )}

                    {calculationType === 'VARIATION_1' && (
                      <div className="grid grid-cols-2 gap-2">
                        <div className="space-y-1">
                          <label className={fieldLabel}>Regular Pay</label>
                          <input
                            required
                            type="number"
                            name="monthlyContribution"
                            value={monthlyContribution}
                            onChange={(e) => setMonthlyContribution(parseNum(e.target.value))}
                            className={fieldInput}
                          />
                          <button
                            type="button"
                            onClick={() => setMonthlyContribution(suggestedVar1Monthly)}
                            className="text-[9px] text-blue-500 font-bold hover:underline block pl-1"
                          >
                            Sug: ₹{suggestedVar1Monthly.toLocaleString('en-IN')}
                          </button>
                        </div>
                        <div className="space-y-1">
                          <label className={fieldLabel}>Lifted Pay</label>
                          <input
                            required
                            type="number"
                            name="liftedContribution"
                            value={liftedContribution}
                            onChange={(e) => setLiftedContribution(parseNum(e.target.value))}
                            className={fieldInput}
                          />
                          <button
                            type="button"
                            onClick={() => setLiftedContribution(suggestedVar1Lifted)}
                            className="text-[9px] text-blue-500 font-bold hover:underline block pl-1"
                          >
                            Sug: ₹{suggestedVar1Lifted.toLocaleString('en-IN')}
                          </button>
                        </div>
                      </div>
                    )}

                    {calculationType === 'VARIATION_2' && (
                      <div className="grid grid-cols-2 gap-2">
                        <div className="space-y-1">
                          <label className={fieldLabel}>Fixed Pay</label>
                          <input
                            required
                            type="number"
                            name="monthlyContribution"
                            value={monthlyContribution}
                            onChange={(e) => handleMonthlyContributionChange(parseNum(e.target.value))}
                            className={fieldInput}
                          />
                          <button
                            type="button"
                            onClick={() => handleMonthlyContributionChange(suggestedVar2Monthly)}
                            className="text-[9px] text-blue-500 font-bold hover:underline block pl-1"
                          >
                            Sug: ₹{suggestedVar2Monthly.toLocaleString('en-IN')}
                          </button>
                        </div>
                        <div className="space-y-1">
                          <label className={fieldLabel}>Starting Bid</label>
                          <input
                            required
                            type="number"
                            name="startBid"
                            value={startBid}
                            onChange={(e) => handleStartBidChange(parseNum(e.target.value))}
                            className={fieldInput}
                          />
                          <button
                            type="button"
                            onClick={() => handleStartBidChange(suggestedVar2StartBid)}
                            className="text-[9px] text-blue-500 font-bold hover:underline block pl-1"
                          >
                            Sug: ₹{suggestedVar2StartBid.toLocaleString('en-IN')}
                          </button>
                        </div>
                      </div>
                    )}

                    {calculationType === 'MANUAL' && (
                      <div className="space-y-1.5">
                        <button
                          type="button"
                          onClick={goToPrizeSchedule}
                          disabled={!canOpenPrizeSchedule}
                          className={cn(
                            'w-full h-10 rounded-xl border text-xs font-bold transition-colors',
                            canOpenPrizeSchedule
                              ? 'border-dashed border-blue-300 bg-blue-50/60 text-blue-700 hover:bg-blue-50'
                              : 'border-slate-200 bg-slate-100 text-slate-400 cursor-not-allowed'
                          )}
                        >
                          {canOpenPrizeSchedule
                            ? `Enter prize for ${dVal} months →`
                            : 'Fill all fields above to continue'}
                        </button>
                        {!canOpenPrizeSchedule && (
                          <p className="text-[10px] text-amber-600 font-medium pl-1">
                            Required: name, total value, members, duration, monthly pay, after lift pay.
                          </p>
                        )}
                      </div>
                    )}
                  </div>

                  <div className="pt-2 border-t border-slate-100 flex gap-2 bg-white mt-auto z-10">
                    <button
                      type="button"
                      onClick={onClose}
                      className="flex-1 h-9 rounded-xl border border-slate-200 font-bold text-slate-600 hover:bg-slate-50 transition-all text-xs uppercase tracking-wider"
                    >
                      Cancel
                    </button>
                    {calculationType === 'MANUAL' && !isManualScheduleComplete ? (
                      <button
                        type="button"
                        onClick={goToPrizeSchedule}
                        disabled={!canOpenPrizeSchedule}
                        className="flex-[2] h-9 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-black transition-all flex items-center justify-center gap-2 text-xs uppercase tracking-wider shadow-lg shadow-blue-500/20 disabled:opacity-75"
                      >
                        Enter Prizes
                      </button>
                    ) : (
                      <button
                        type="submit"
                        disabled={isSubmitting}
                        className="flex-[2] h-9 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-black transition-all flex items-center justify-center gap-2 text-xs uppercase tracking-wider shadow-lg shadow-blue-500/20 disabled:opacity-75"
                      >
                        {isSubmitting ? (group ? 'Updating...' : 'Creating...') : (group ? 'Update Group' : 'Create Group')}
                      </button>
                    )}
                  </div>
                </form>
              ) : (
                <div className="flex flex-col flex-1 min-h-0">
                  <div className="flex-1 overflow-y-auto pr-2 space-y-3 pb-2">
                    {/* Show agent earnings card for all calculation types */}
                    <div className="bg-slate-900 text-white rounded-2xl p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <span className="text-[9px] font-bold uppercase tracking-widest text-slate-400 flex items-center gap-1">
                            <TrendingUp size={10} /> Agent Earnings
                          </span>
                          <p className="text-lg font-black text-emerald-400 mt-0.5">
                            ₹{scheduleData.agentEarnings.toLocaleString('en-IN')}
                          </p>
                        </div>
                        <div className="text-right">
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                            {scheduleData.agentEarningsPct}% yield
                          </span>
                        </div>
                      </div>
                    </div>

                    {calculationType === 'MANUAL' ? (
                      <div className="rounded-2xl border border-slate-200 overflow-hidden bg-white shadow-sm">
                        <div className="px-3 py-2.5 bg-slate-50 border-b border-slate-100 space-y-2">
                          <div className="flex items-center justify-between">
                            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                              Prize per month
                            </p>
                            <button
                              type="button"
                              onClick={() => setActiveTab('details')}
                              className="text-[10px] font-bold text-blue-600 hover:underline"
                            >
                              Edit details
                            </button>
                          </div>
                          <div className="flex items-center justify-between gap-4">
                            <p className="text-[11px] text-slate-500">
                              Monthly ₹{(Number(monthlyContribution) || 0).toLocaleString('en-IN')}
                              {' · '}
                              After lift ₹{(Number(liftedContribution) || 0).toLocaleString('en-IN')}
                            </p>
                          </div>
                        </div>
                        <table className="w-full text-left">
                          <thead>
                            <tr className="border-b border-slate-100 bg-slate-50/80">
                              <th className="px-3 py-2 text-[10px] font-bold uppercase tracking-wider text-slate-400 w-12">Month</th>
                              <th className="px-3 py-2 text-[10px] font-bold uppercase tracking-wider text-slate-400 w-28">Prize (₹)</th>
                              <th className="px-3 py-2 text-[10px] font-bold uppercase tracking-wider text-slate-400">Increase (₹)</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-50">
                            {manualSchedule.map((row, index) => {
                              const prevVal = index > 0 ? manualSchedule[index - 1].bidAmount : '';
                              const currVal = row.bidAmount;
                              const diffValue = (prevVal === '' || currVal === '') ? '' : (Number(currVal) - Number(prevVal));

                              return (
                                <tr key={row.month} className="hover:bg-slate-50/80">
                                  <td className="px-3 py-2 text-xs font-bold text-slate-700">M{row.month}</td>
                                  <td className="px-3 py-1.5">
                                    <input
                                      type="number"
                                      min={0}
                                      placeholder="Enter prize"
                                      value={row.bidAmount}
                                      onChange={(e) =>
                                        updateManualRow(index, 'bidAmount', parseNum(e.target.value))
                                      }
                                      className={cellInput}
                                    />
                                  </td>
                                  <td className="px-3 py-1.5">
                                    {index === 0 ? (
                                      <span className="text-[11px] text-slate-400 font-semibold pl-2">—</span>
                                    ) : (
                                      <input
                                        type="number"
                                        placeholder="Increase"
                                        value={diffValue}
                                        onChange={(e) => {
                                          const val = parseNum(e.target.value);
                                          const prevBid = manualSchedule[index - 1].bidAmount;
                                          if (prevBid !== '') {
                                            const newBid = val === '' ? '' : Number(prevBid) + Number(val);
                                            updateManualRow(index, 'bidAmount', newBid);
                                          }
                                        }}
                                        className={cellInput}
                                      />
                                    )}
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    ) : (
                      <div className="rounded-2xl border border-slate-200 overflow-hidden bg-white shadow-sm">
                        <table className="w-full text-left">
                          <thead>
                            <tr className="border-b border-slate-100 bg-slate-50">
                              <th className="px-3 py-2 text-[10px] font-bold uppercase tracking-wider text-slate-400">Mo</th>
                              <th className="px-3 py-2 text-[10px] font-bold uppercase tracking-wider text-slate-400">Pay</th>
                              <th className="px-3 py-2 text-[10px] font-bold uppercase tracking-wider text-slate-400 text-right">Prize (Bid)</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-50 text-xs">
                            {scheduleData.rows.map((row) => (
                              <tr key={row.month} className="hover:bg-slate-50 transition-colors">
                                <td className="px-3 py-2 font-semibold text-slate-700">{row.month}</td>
                                <td className="px-3 py-2 text-slate-600">
                                  {calculationType === 'VARIATION_1' ? (
                                    <span className="flex flex-col">
                                      <span>Reg ₹{row.monthlyPaymentValueRegular.toLocaleString('en-IN')}</span>
                                      <span className="text-emerald-600 font-semibold">
                                        Lift ₹{row.monthlyPaymentValueLifted.toLocaleString('en-IN')}
                                      </span>
                                    </span>
                                  ) : (
                                    <span>₹{row.monthlyPaymentValueRegular.toLocaleString('en-IN')}</span>
                                  )}
                                </td>
                                <td className="px-3 py-2 text-right font-bold text-slate-900">
                                  ₹{row.bidAmount.toLocaleString('en-IN')}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>

                  {calculationType === 'MANUAL' && (
                    <form onSubmit={onSubmit} className="pt-2 border-t border-slate-100 flex gap-2 bg-white mt-auto z-10">
                      <input type="hidden" name="calculationType" value={calculationType} />
                      <input type="hidden" name="name" value={name} />
                      <input type="hidden" name="totalValue" value={totalValue} />
                      <input type="hidden" name="membersLimit" value={membersLimit} />
                      <input type="hidden" name="durationMonths" value={durationMonths} />
                      <input type="hidden" name="commissionPct" value={0} />
                      <input type="hidden" name="monthlyContribution" value={monthlyContribution || 0} />
                      <input type="hidden" name="liftedContribution" value={liftedContribution || 0} />
                      <input
                        type="hidden"
                        name="manualSchedule"
                        value={JSON.stringify(
                          manualSchedule.map((r) => ({
                            month: r.month,
                            regularPay: Number(monthlyContribution) || 0,
                            liftedPay: Number(liftedContribution) || 0,
                            bidAmount: r.bidAmount === '' ? 0 : Number(r.bidAmount),
                          }))
                        )}
                      />
                      <button
                        type="button"
                        onClick={() => setActiveTab('details')}
                        className="flex-1 h-9 rounded-xl border border-slate-200 font-bold text-slate-600 hover:bg-slate-50 transition-all text-xs uppercase tracking-wider"
                      >
                        Details
                      </button>
                      <button
                        type="submit"
                        disabled={isSubmitting || !isManualScheduleComplete}
                        className="flex-[2] h-9 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-black transition-all text-xs uppercase tracking-wider shadow-lg shadow-blue-500/20 disabled:opacity-75"
                      >
                        {isSubmitting ? (group ? 'Updating...' : 'Creating...') : (group ? 'Update Group' : 'Create Group')}
                      </button>
                    </form>
                  )}
                </div>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body
  );
}
