'use client';

import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PageLoaderProps {
  label?: string;
  className?: string;
  fullScreen?: boolean;
}

export function PageLoader({ label = 'Loading…', className, fullScreen = true }: PageLoaderProps) {
  return (
    <div
      className={cn(
        'flex items-center justify-center',
        fullScreen && 'min-h-[50vh] sm:min-h-[60vh]',
        className
      )}
    >
      <div className="text-center space-y-4 px-6">
        <div className="relative w-14 h-14 mx-auto">
          <div className="absolute inset-0 rounded-2xl gradient-blue opacity-20 animate-pulse" />
          <div className="relative w-14 h-14 rounded-2xl gradient-blue flex items-center justify-center text-white font-black text-xl shadow-lg shadow-blue-500/25">
            C
          </div>
        </div>
        <Loader2 className="w-6 h-6 text-blue-600 animate-spin mx-auto" />
        <p className="text-xs font-semibold text-slate-500">{label}</p>
      </div>
    </div>
  );
}
