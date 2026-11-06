'use client';

import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Calendar, Download, X } from 'lucide-react';
import { toast } from 'sonner';
import {
  downloadSchemeSchedulePdf,
  toSchemeDateInputValue,
  type SchemePdfAgent,
  type SchemePdfGroup,
} from '@/lib/schemePdf';

type SchemePdfModalProps = {
  group: SchemePdfGroup | null;
  agent?: SchemePdfAgent;
  onClose: () => void;
};

export default function SchemePdfModal({ group, agent, onClose }: SchemePdfModalProps) {
  const [startDate, setStartDate] = useState('');

  useEffect(() => {
    if (group) setStartDate(toSchemeDateInputValue(group.startDate));
  }, [group]);

  const download = () => {
    if (!group) return;
    if (!startDate) {
      toast.error('Choose a start date');
      return;
    }
    try {
      downloadSchemeSchedulePdf(group, agent, { startDate });
      toast.success('Scheme PDF downloaded');
      onClose();
    } catch (err) {
      console.error(err);
      toast.error('Failed to generate scheme PDF');
    }
  };

  return (
    <AnimatePresence>
      {group && (
        <div className="fixed inset-0 z-[9999] flex items-end sm:items-center justify-center sm:p-4">
          <motion.button
            type="button"
            aria-label="Close"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
          />
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-labelledby="scheme-pdf-title"
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 24 }}
            className="relative w-full sm:max-w-sm bg-white rounded-t-3xl sm:rounded-3xl p-5 sm:p-6 shadow-2xl border border-slate-200"
          >
            <div className="flex items-start justify-between gap-3 mb-4">
              <div className="min-w-0">
                <h3 id="scheme-pdf-title" className="text-lg font-black text-slate-900">
                  Download scheme PDF
                </h3>
                <p className="text-sm text-slate-500 mt-1 truncate">{group.name}</p>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="p-2 rounded-xl hover:bg-slate-100 text-slate-400 shrink-0"
              >
                <X size={18} />
              </button>
            </div>

            <label className="block text-[11px] font-black text-slate-400 uppercase tracking-widest mb-2">
              Start date
            </label>
            <div className="relative">
              <Calendar size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full h-14 pl-11 pr-3 rounded-2xl border border-slate-200 bg-slate-50 text-base font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              />
            </div>
            <p className="text-xs text-slate-500 mt-2">
              Month dates in the PDF start from this day.
            </p>

            <div className="mt-5 flex flex-col-reverse sm:flex-row gap-2">
              <button
                type="button"
                onClick={onClose}
                className="h-12 px-4 rounded-xl border border-slate-200 font-bold text-slate-600 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={download}
                className="h-12 flex-1 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold flex items-center justify-center gap-2"
              >
                <Download size={16} />
                Download PDF
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
