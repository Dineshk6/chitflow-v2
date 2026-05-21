'use client';

import { useRef, useState, useEffect } from 'react';
import { ChevronDown, Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

export interface SelectOption {
  value: string;
  label: string;
}

interface CustomSelectProps {
  value: string;
  onChange: (value: string) => void;
  options: SelectOption[];
  placeholder?: string;
  className?: string;
  disabled?: boolean;
}

export function CustomSelect({
  value,
  onChange,
  options,
  placeholder = 'Select…',
  className,
  disabled = false,
}: CustomSelectProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const selected = options.find((o) => o.value === value);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <div ref={ref} className={cn('relative', className)}>
      <button
        type="button"
        disabled={disabled}
        onClick={() => !disabled && setOpen((o) => !o)}
        className={cn(
          'h-11 w-full flex items-center justify-between gap-2 px-3 rounded-xl border text-sm font-semibold transition-all duration-200',
          'bg-white border-slate-200 text-slate-900',
          'hover:border-blue-400 hover:shadow-sm hover:shadow-blue-500/10',
          open && 'border-blue-500 ring-2 ring-blue-500/15 shadow-sm',
          disabled && 'opacity-50 cursor-not-allowed'
        )}
      >
        <span className={cn('truncate', !selected && 'text-slate-400 font-normal')}>
          {selected ? selected.label : placeholder}
        </span>
        <ChevronDown
          size={15}
          className={cn(
            'shrink-0 text-slate-400 transition-transform duration-200',
            open && 'rotate-180 text-blue-500'
          )}
        />
      </button>

      <AnimatePresence>
        {open && (
          <motion.ul
            initial={{ opacity: 0, y: -6, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -4, scale: 0.97 }}
            transition={{ duration: 0.15 }}
            className="absolute z-50 mt-1.5 w-full max-h-56 overflow-y-auto rounded-2xl border border-slate-200 bg-white shadow-xl shadow-slate-900/10 py-1"
          >
            {options.map((opt) => {
              const isActive = opt.value === value;
              return (
                <li
                  key={opt.value}
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={(e) => {
                    e.stopPropagation();
                    setOpen(false);
                    onChange(opt.value);
                  }}
                  className={cn(
                    'flex items-center justify-between gap-2 px-3 py-2.5 text-sm cursor-pointer transition-colors duration-100 mx-1 rounded-xl',
                    isActive
                      ? 'bg-blue-50 text-blue-700 font-bold'
                      : 'text-slate-700 font-medium hover:bg-slate-50'
                  )}
                >
                  <span className="truncate">{opt.label}</span>
                  {isActive && <Check size={14} className="shrink-0 text-blue-600" />}
                </li>
              );
            })}
          </motion.ul>
        )}
      </AnimatePresence>
    </div>
  );
}
