'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Search, UserPlus, Loader2, Minus, Plus } from 'lucide-react';
import { toast } from 'sonner';

interface MemberSelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (userId: string, chitCount: number) => void;
  isSubmitting: boolean;
}

export default function MemberSelectorModal({ isOpen, onClose, onSelect, isSubmitting }: MemberSelectorModalProps) {
  const [search, setSearch] = React.useState('');
  const [members, setMembers] = React.useState<any[]>([]);
  const [isLoading, setIsLoading] = React.useState(false);
  const [chitCounts, setChitCounts] = React.useState<{ [userId: string]: number }>({});

  React.useEffect(() => {
    if (isOpen) {
      fetchMembers();
    }
  }, [isOpen]);

  const fetchMembers = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/admin/customers');
      const data = await res.json();
      setMembers(Array.isArray(data) ? data : []);
    } catch (error) {
      toast.error("Failed to load members");
    } finally {
      setIsLoading(false);
    }
  };

  const getChitCount = (userId: string) => chitCounts[userId] || 1;

  const updateChitCount = (userId: string, delta: number, e: React.MouseEvent) => {
    e.stopPropagation();
    setChitCounts(prev => {
      const curr = prev[userId] || 1;
      const next = Math.max(1, Math.min(20, curr + delta));
      return { ...prev, [userId]: next };
    });
  };

  const filtered = members.filter(m => 
    m.name.toLowerCase().includes(search.toLowerCase()) || 
    (m.email && m.email.toLowerCase().includes(search.toLowerCase())) ||
    (m.phone && m.phone.includes(search)) ||
    (m.mobile && m.mobile.includes(search))
  );

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
          />
          
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-[32px] shadow-2xl overflow-hidden border border-slate-200 dark:border-slate-800 flex flex-col max-h-[85vh]"
          >
            <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-slate-900 dark:text-white">Add Member to Group</h2>
                <p className="text-xs text-slate-500 mt-0.5">Select a member and set how many chits/tickets they hold.</p>
              </div>
              <button onClick={onClose} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors">
                <X size={20} />
              </button>
            </div>

            <div className="p-4 border-b border-slate-50 dark:border-slate-800">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                <input 
                  type="text" 
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  placeholder="Search by name, email, or mobile..." 
                  className="w-full h-11 pl-10 pr-4 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all text-sm"
                />
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-3 space-y-2 min-h-[300px]">
              {isLoading ? (
                <div className="flex items-center justify-center h-40">
                  <Loader2 className="animate-spin text-blue-600" />
                </div>
              ) : filtered.length === 0 ? (
                <div className="text-center py-10 text-slate-500 text-sm">No members found</div>
              ) : (
                filtered.map(member => {
                  const count = getChitCount(member.id);
                  return (
                    <div
                      key={member.id}
                      className="p-3.5 flex items-center justify-between rounded-2xl border border-slate-100 dark:border-slate-800/80 bg-white dark:bg-slate-900 hover:border-blue-200 transition-all gap-3"
                    >
                      <div className="flex items-center gap-3 min-w-0 flex-1">
                        <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 flex items-center justify-center font-black text-sm shrink-0">
                          {member.name.charAt(0)}
                        </div>
                        <div className="text-left min-w-0">
                          <p className="text-sm font-bold text-slate-900 dark:text-white truncate">{member.name}</p>
                          <p className="text-[11px] text-slate-500 truncate">{member.phone || member.mobile || member.email}</p>
                        </div>
                      </div>

                      {/* Number of Chits Control */}
                      <div className="flex items-center gap-3 shrink-0">
                        <div className="flex items-center bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/50 rounded-xl p-1 shadow-sm">
                          <button
                            type="button"
                            onClick={(e) => updateChitCount(member.id, -1, e)}
                            disabled={count <= 1}
                            className="w-7 h-7 flex items-center justify-center rounded-lg bg-white dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:text-slate-900 disabled:opacity-40 transition-colors active:scale-95"
                          >
                            <Minus size={14} strokeWidth={2.5} />
                          </button>
                          <span className="w-10 text-center text-xs font-black text-slate-800 dark:text-slate-200 select-none">
                            {count}
                          </span>
                          <button
                            type="button"
                            onClick={(e) => updateChitCount(member.id, 1, e)}
                            className="w-7 h-7 flex items-center justify-center rounded-lg bg-white dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:text-slate-900 transition-colors active:scale-95"
                          >
                            <Plus size={14} strokeWidth={2.5} />
                          </button>
                        </div>

                        <button
                          disabled={isSubmitting}
                          onClick={() => onSelect(member.id, count)}
                          className="h-9 px-3.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm transition-all disabled:opacity-50"
                        >
                          <UserPlus size={14} />
                          <span>Add</span>
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
