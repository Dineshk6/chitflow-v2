'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface DashboardCardProps {
  title: string;
  value: string | number;
  description?: string;
  icon: LucideIcon;
  trend?: {
    value: string | number;
    isUp: boolean;
  };
  className?: string;
}

export default function DashboardCard({ 
  title, 
  value, 
  description, 
  icon: Icon, 
  trend,
  className 
}: DashboardCardProps) {
  return (
    <motion.div
      whileHover={{ y: -5 }}
      className={cn(
        "surface-card p-6 !rounded-2xl",
        className
      )}
    >
      <div className="flex items-center justify-between mb-4">
        <div className="p-2.5 rounded-xl bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400">
          <Icon size={24} />
        </div>
        {trend && (
          <div className={cn(
            "flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full",
            trend.isUp 
              ? "bg-blue-50 text-blue-600" 
              : "bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400"
          )}>
            <span>{trend.isUp ? '↑' : '↓'}</span>
            <span>{trend.value}</span>
          </div>
        )}
      </div>
      <div>
        <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">{title}</p>
        <h3 className="text-2xl font-bold text-slate-900 dark:text-white">{value}</h3>
        {description && (
          <p className="text-xs text-slate-400 dark:text-slate-500 mt-2">{description}</p>
        )}
      </div>
    </motion.div>
  );
}
