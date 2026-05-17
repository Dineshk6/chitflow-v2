'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Search, UserPlus, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface MemberSelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (userId: string) => void;
  isSubmitting: boolean;
}

export default function MemberSelectorModal({ isOpen, onClose, onSelect, isSubmitting }: MemberSelectorModalProps) {
  const [search, setSearch] = React.useState('');
  const [members, setMembers] = React.useState<any[]>([]);
  const [isLoading, setIsLoading] = React.useState(false);

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

  const filtered = members.filter(m => 
    m.name.toLowerCase().includes(search.toLowerCase()) || 
    (m.email && m.email.toLowerCase().includes(search.toLowerCase()))
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
            className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-[32px] shadow-2xl overflow-hidden border border-slate-200 dark:border-slate-800 flex flex-col max-h-[80vh]"
          >
            <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">Add Member to Group</h2>
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
                  placeholder="Search members..." 
                  className="w-full h-11 pl-10 pr-4 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all text-sm"
                />
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-2 space-y-1 min-h-[300px]">
              {isLoading ? (
                <div className="flex items-center justify-center h-40">
                  <Loader2 className="animate-spin text-blue-600" />
                </div>
              ) : filtered.length === 0 ? (
                <div className="text-center py-10 text-slate-500 text-sm">No members found</div>
              ) : (
                filtered.map(member => (
                  <button
                    key={member.id}
                    disabled={isSubmitting}
                    onClick={() => onSelect(member.id)}
                    className="w-full p-4 flex items-center justify-between rounded-2xl hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-all group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                        {member.name.charAt(0)}
                      </div>
                      <div className="text-left">
                        <p className="text-sm font-bold text-slate-900 dark:text-white">{member.name}</p>
                        <p className="text-[10px] text-slate-500">{member.email || member.mobile}</p>
                      </div>
                    </div>
                    <UserPlus size={18} className="text-blue-600 opacity-0 group-hover:opacity-100 transition-all" />
                  </button>
                ))
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
