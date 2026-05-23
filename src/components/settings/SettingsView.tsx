'use client';

import React, { useState } from 'react';
import { useSession } from 'next-auth/react';
import { toast } from 'sonner';
import { 
  User, 
  Lock, 
  Shield,
  Loader2,
  Save,
  Phone,
  Mail,
  CheckCircle,
  KeyRound
} from 'lucide-react';

export default function SettingsView() {
  const { data: session, update } = useSession();
  const [isUpdating, setIsUpdating] = useState(false);

  const [formData, setFormData] = useState({
    name: session?.user?.name || '',
    email: session?.user?.email || '',
    phone: '',
  });

  // Sync session details when loaded
  React.useEffect(() => {
    if (session?.user) {
      let ph = (session.user as any).phone || '';
      if (ph.startsWith('no-phone')) {
        ph = '';
      }
      setFormData({
        name: session.user.name || '',
        email: session.user.email || '',
        phone: ph,
      });
    }
  }, [session]);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate phone formatting
    if (formData.phone) {
      const phoneRegex = /^[6-9]\d{9}$/;
      if (!phoneRegex.test(formData.phone)) {
        toast.error("Please enter a valid 10-digit mobile number");
        return;
      }
    } else {
      toast.error("Mobile number is required");
      return;
    }

    setIsUpdating(true);
    try {
      const res = await fetch('/api/user/update', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        toast.success("Profile updated successfully!");
        // Update local session cache dynamically
        await update({
          name: formData.name,
          phone: formData.phone
        });
      } else {
        toast.error("Something went wrong");
      }
    } catch (error) {
      toast.error("Something went wrong");
    } finally {
      setIsUpdating(false);
    }
  };

  const initials = formData.name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2) || '?';

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      {/* Premium Header Banner Card */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-600 via-indigo-700 to-blue-800 p-8 text-white shadow-xl shadow-indigo-500/15">
        {/* Abstract background decorative shapes */}
        <div className="absolute right-0 top-0 -mt-12 -mr-12 w-64 h-64 rounded-full bg-white/5 blur-2xl pointer-events-none" />
        <div className="absolute left-1/3 bottom-0 -mb-16 w-80 h-80 rounded-full bg-indigo-500/10 blur-3xl pointer-events-none" />
        
        <div className="relative flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div className="flex items-center gap-5">
            <div className="w-16 h-16 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center text-white font-black text-2xl shadow-inner">
              {initials}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-black tracking-tight">{formData.name || 'Agent'}</h1>
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-500/25 border border-emerald-500/30 text-emerald-300 text-[10px] font-bold tracking-wider uppercase">
                  <CheckCircle size={10} /> Active Agent
                </span>
              </div>
              <p className="text-indigo-200 text-xs mt-1 font-semibold">{formData.email}</p>
            </div>
          </div>
          <div className="text-left sm:text-right shrink-0">
            <span className="text-[10px] font-black text-indigo-200 uppercase tracking-widest block">Portal Role</span>
            <span className="text-sm font-bold text-white tracking-wide mt-0.5 block">
              {session?.user?.role === 'ADMIN' ? 'System Administrator' : 'Group Agent'}
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Profile Details Card */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800/80 shadow-sm p-6 md:p-8 space-y-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-3 pb-4 border-b border-slate-100 dark:border-slate-800">
              <div className="w-9 h-9 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                <User size={18} />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 dark:text-white text-base">Profile Information</h3>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">Your public identity and contact coordinates.</p>
              </div>
            </div>

            <form onSubmit={handleUpdateProfile} className="space-y-6 mt-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-wider block ml-1">Full Name</label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                  <input 
                    type="text" 
                    value={formData.name}
                    onChange={e => setFormData({...formData, name: e.target.value})}
                    placeholder="Enter full name"
                    className="w-full h-12 pl-11 pr-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 text-sm font-semibold focus:border-indigo-600 focus:ring-4 focus:ring-indigo-600/10 outline-none transition-all dark:text-white" 
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-wider block ml-1">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                  <input 
                    type="email" 
                    disabled
                    value={formData.email}
                    className="w-full h-12 pl-11 pr-4 rounded-xl bg-slate-100/55 dark:bg-slate-800/10 border border-slate-200/40 dark:border-slate-800/40 text-sm text-slate-400 font-semibold cursor-not-allowed" 
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-wider block ml-1">Mobile Number</label>
                <div className="relative">
                  <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                  <input 
                    type="text" 
                    value={formData.phone}
                    onChange={e => setFormData({...formData, phone: e.target.value.replace(/\D/g, '').slice(0, 10)})}
                    placeholder="Enter 10-digit mobile number"
                    className="w-full h-12 pl-11 pr-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 text-sm font-semibold focus:border-indigo-600 focus:ring-4 focus:ring-indigo-600/10 outline-none transition-all dark:text-white" 
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-end">
                <button 
                  type="submit"
                  disabled={isUpdating}
                  className="w-full h-12 rounded-xl bg-indigo-600 text-white text-xs font-black uppercase tracking-wider hover:bg-indigo-700 active:scale-[0.98] transition-all flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/15 disabled:opacity-70"
                >
                  {isUpdating ? <Loader2 className="animate-spin" size={16} /> : <><Save size={16} /> Save Profile Changes</>}
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Security / Password Card */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800/80 shadow-sm p-6 md:p-8 space-y-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-3 pb-4 border-b border-slate-100 dark:border-slate-800">
              <div className="w-9 h-9 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                <KeyRound size={18} />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 dark:text-white text-base">Password & Security</h3>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">Keep your login credentials secure.</p>
              </div>
            </div>

            <form 
              onSubmit={async (e) => {
                e.preventDefault();
                const target = e.target as any;
                const currentPassword = target.currentPassword.value;
                const newPassword = target.newPassword.value;
                
                if (!currentPassword || !newPassword) return toast.error("Please fill all fields");

                try {
                  const res = await fetch('/api/user/change-password', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ currentPassword, newPassword }),
                  });
                  if (res.ok) {
                    toast.success("Password updated successfully!");
                    target.reset();
                  } else {
                    const data = await res.json();
                    toast.error(data.error || "Failed to update password");
                  }
                } catch (err) {
                  toast.error("Something went wrong");
                }
              }}
              className="space-y-6 mt-6"
            >
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-wider block ml-1">Current Password</label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                  <input 
                    name="currentPassword" 
                    type="password" 
                    placeholder="Enter current password"
                    className="w-full h-12 pl-11 pr-4 rounded-xl bg-slate-50/50 dark:bg-slate-850 border border-slate-200 dark:border-slate-800 text-sm font-semibold focus:border-indigo-600 focus:ring-4 focus:ring-indigo-600/10 outline-none transition-all dark:text-white" 
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-wider block ml-1">New Password</label>
                <div className="relative">
                  <Shield className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                  <input 
                    name="newPassword" 
                    type="password" 
                    placeholder="Enter new password"
                    className="w-full h-12 pl-11 pr-4 rounded-xl bg-slate-50/50 dark:bg-slate-850 border border-slate-200 dark:border-slate-800 text-sm font-semibold focus:border-indigo-600 focus:ring-4 focus:ring-indigo-600/10 outline-none transition-all dark:text-white" 
                  />
                </div>
              </div>

              {/* Spacing alignment */}
              <div className="hidden sm:block h-12" />

              <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-end">
                <button 
                  type="submit" 
                  className="w-full h-12 rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-white dark:text-slate-900 text-white text-xs font-black uppercase tracking-wider hover:scale-[1.02] active:scale-[0.98] transition-all"
                >
                  Update Password
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
