'use client';

import { cn } from '@/lib/utils';
import { LucideIcon } from 'lucide-react';
import { motion } from 'framer-motion';

type Tone = 'blue' | 'indigo' | 'emerald' | 'amber' | 'white';

interface AdminStatCardProps {
  label: string;
  value: string | number;
  icon: LucideIcon;
  tone?: Tone;
  className?: string;
  delay?: number;
}

const toneStyles: Record<Tone, string> = {
  blue: 'from-blue-600 to-blue-700 shadow-blue-500/20',
  indigo: 'from-indigo-600 to-indigo-700 shadow-indigo-500/20',
  emerald: 'from-emerald-600 to-emerald-700 shadow-emerald-500/20',
  amber: 'from-amber-500 to-amber-600 shadow-amber-500/20',
  white: 'bg-white border border-slate-200 text-slate-900 shadow-sm shadow-slate-200/50',
};

export function AdminStatCard({
  label,
  value,
  icon: Icon,
  tone = 'white',
  className,
  delay = 0,
}: AdminStatCardProps) {
  const isGradient = tone !== 'white';

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.35 }}
      whileHover={{ y: -2 }}
      className={cn(
        'rounded-2xl p-4 sm:p-5 flex items-center gap-3 sm:gap-4 min-w-0',
        isGradient ? `bg-gradient-to-br ${toneStyles[tone]} text-white shadow-lg` : toneStyles.white,
        className
      )}
    >
      <div
        className={cn(
          'hidden sm:flex w-10 h-10 sm:w-11 sm:h-11 rounded-xl items-center justify-center shrink-0',
          isGradient ? 'bg-white/20' : 'bg-blue-50 text-blue-600'
        )}
      >
        <Icon size={20} />
      </div>
      <div className="min-w-0">
        <p
          className={cn(
            'text-[9px] sm:text-[10px] font-bold uppercase tracking-widest truncate',
            isGradient ? 'text-white/80' : 'text-slate-500'
          )}
        >
          {label}
        </p>
        <p
          className={cn(
            'text-xl sm:text-2xl font-black mt-0.5 tabular-nums truncate',
            isGradient ? 'text-white' : 'text-slate-900'
          )}
        >
          {value}
        </p>
      </div>
    </motion.div>
  );
}

export function AdminMetricCard({
  label,
  value,
  icon: Icon,
  iconClassName,
  delay = 0,
}: {
  label: string;
  value: string | number;
  icon: LucideIcon;
  iconClassName?: string;
  delay?: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.3 }}
      className="bg-white rounded-2xl border border-slate-200 p-3 sm:p-4 shadow-sm flex items-center gap-2 sm:gap-3 min-w-0"
    >
      {/* Icon — hidden on xs, visible sm+ */}
      <div
        className={cn(
          'hidden sm:flex w-9 h-9 rounded-xl items-center justify-center shrink-0',
          iconClassName ?? 'bg-blue-50 text-blue-600'
        )}
      >
        <Icon size={16} />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-[9px] font-bold text-slate-500 uppercase tracking-wider leading-none mb-0.5">{label}</p>
        <p className="text-base sm:text-xl font-black text-slate-900 tabular-nums truncate leading-tight">{value}</p>
      </div>
    </motion.div>
  );
}
