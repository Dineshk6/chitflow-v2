import { Loader2 } from 'lucide-react';

export default function AdminLoading() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[50vh] gap-4">
      <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/25">
        <Loader2 className="w-7 h-7 text-white animate-spin" />
      </div>
      <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Loading page...</p>
    </div>
  );
}
