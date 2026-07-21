'use client';

import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Layers, TrendingUp } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  generateChitSchedule,
  suggestVariation2StartBid,
  suggestVariation2MonthlyContribution,
} from '@/lib/chitCalculations';

interface CreateGroupModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
  isSubmitting: boolean;
}

export default function CreateGroupModal({
  isOpen,
  onClose,
  onSubmit,
  isSubmitting,
}: CreateGroupModalProps) {
  const [calculationType, setCalculationType] = useState<'VARIATION_1' | 'VARIATION_2'>('VARIATION_1');
  const [name, setName] = useState('');
  const [totalValue, setTotalValue] = useState<number | ''>(500000);
  const [membersLimit, setMembersLimit] = useState<number | ''>(25);
  const [durationMonths, setDurationMonths] = useState<number | ''>(25);
  const [monthlyContribution, setMonthlyContribution] = useState<number | ''>(20000);
  const [liftedContribution, setLiftedContribution] = useState<number | ''>(25000);
  const [startBid, setStartBid] = useState<number | ''>(310000);
  const [commissionPct, setCommissionPct] = useState<number | ''>(5.0);
  const [activeTab, setActiveTab] = useState<'details' | 'schedule'>('details');
  const [mounted, setMounted] = useState(false);

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
      setActiveTab('details');
    }
  }, [isOpen]);

  useEffect(() => {
    const t = Number(totalValue) || 0;
    const d = Number(durationMonths) || 1;
    const c = Number(commissionPct) || 0;

    if (calculationType === 'VARIATION_1') {
      const regular = Math.round(t / d);
      setMonthlyContribution(regular);
      setLiftedContribution(regular + Math.round(t / 100));
    } else {
      const C = Math.round((t * 0.81) / d);
      setMonthlyContribution(C);
      setStartBid(suggestVariation2StartBid(t, d, C, c));
    }
  }, [calculationType, totalValue, durationMonths, commissionPct]);

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

  const scheduleData = generateChitSchedule({
    calculationType,
    totalAmount: tVal,
    duration: dVal,
    monthlyContribution: mContrib,
    liftedContribution: calculationType === 'VARIATION_1' ? Number(liftedContribution) || 0 : null,
    startBid: calculationType === 'VARIATION_2' ? Number(startBid) || 0 : null,
    startDate: null,
    commissionPct: cPct,
  });

  const fieldLabel = 'text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-1';
  const fieldInput = 'w-full h-10 px-3.5 rounded-xl border border-slate-200 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-xs font-semibold';

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
            className="relative w-full max-w-md bg-white rounded-2xl p-4 shadow-2xl border border-slate-200 z-10 flex flex-col overflow-hidden"
            style={{ maxHeight: '500px' }}
          >
            {/* Header row with tab swapper and close button merged */}
            <div className="flex items-center justify-between gap-3 mb-3">
              <div className="flex p-1 bg-slate-100 rounded-xl flex-1">
                <button
                  type="button"
                  onClick={() => setActiveTab('details')}
                  className={cn(
                    "flex-1 py-1.5 text-xs font-bold rounded-lg transition-all",
                    activeTab === 'details' ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700"
                  )}
                >
                  Group Details
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('schedule')}
                  className={cn(
                    "flex-1 py-1.5 text-xs font-bold rounded-lg transition-all",
                    activeTab === 'schedule' ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700"
                  )}
                >
                  Schedule Preview
                </button>
              </div>
              <button 
                onClick={onClose}
                className="p-1.5 rounded-xl hover:bg-slate-100 text-slate-400 transition-colors flex-shrink-0"
              >
                <X size={16} />
              </button>
            </div>

            {/* Scrollable Content Container */}
            <div className="flex-1 flex flex-col min-h-0">
              {activeTab === 'details' ? (
                <form onSubmit={onSubmit} className="flex flex-col flex-1 min-h-0">
                  <div className="flex-1 overflow-y-auto pr-2 pb-2 space-y-3">
                    <input type="hidden" name="calculationType" value={calculationType} />
                    
                    {/* Model Selection */}
                    <div className="space-y-1">
                      <label className={fieldLabel}>Calculation Model</label>
                      <div className="grid grid-cols-2 gap-1.5 p-1 bg-slate-100 rounded-xl">
                        <button
                          type="button"
                          onClick={() => setCalculationType('VARIATION_1')}
                          className={cn(
                            "py-1.5 text-xs font-bold rounded-lg transition-all",
                            calculationType === 'VARIATION_1' ? "bg-white text-blue-600 shadow-sm" : "text-slate-500"
                          )}
                        >
                          Return Pay
                        </button>
                        <button
                          type="button"
                          onClick={() => setCalculationType('VARIATION_2')}
                          className={cn(
                            "py-1.5 text-xs font-bold rounded-lg transition-all",
                            calculationType === 'VARIATION_2' ? "bg-white text-blue-600 shadow-sm" : "text-slate-500"
                          )}
                        >
                          Fixed Pay
                        </button>
                      </div>
                    </div>

                    {/* Name */}
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

                    {/* Total Value & Members Limit */}
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

                    {/* Duration & Commission */}
                    <div className="grid grid-cols-2 gap-2">
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
                    </div>

                    {/* Dynamic Fields */}
                    {calculationType === 'VARIATION_1' ? (
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
                    ) : (
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
                  </div>

                  {/* Actions (Sticky at bottom) */}
                  <div className="pt-2 border-t border-slate-100 flex gap-2 bg-white mt-auto z-10">
                    <button
                      type="button"
                      onClick={onClose}
                      className="flex-1 h-9 rounded-xl border border-slate-200 font-bold text-slate-600 hover:bg-slate-50 transition-all text-xs uppercase tracking-wider"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="flex-[2] h-9 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-black transition-all flex items-center justify-center gap-2 text-xs uppercase tracking-wider shadow-lg shadow-blue-500/20 disabled:opacity-75"
                    >
                      {isSubmitting ? 'Creating...' : 'Create Group'}
                    </button>
                  </div>
                </form>
              ) : (
                <div className="flex-1 overflow-y-auto pr-2 space-y-4">
                  {/* Summary Yield Panel */}
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

                  {/* Schedule Table */}
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
                                  <span className="text-emerald-600 font-semibold">Lift ₹{row.monthlyPaymentValueLifted.toLocaleString('en-IN')}</span>
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
