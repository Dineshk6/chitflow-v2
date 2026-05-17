'use client';

import React, { useState } from 'react';
import { useSession } from 'next-auth/react';
import { useTheme } from 'next-themes';
import { toast } from 'sonner';
import { 
  User, 
  Bell, 
  Lock, 
  Globe, 
  Moon, 
  Sun,
  Shield,
  Loader2,
  Save
} from 'lucide-react';
import { cn } from '@/lib/utils';

export default function SettingsView() {
  const { data: session, update } = useSession();
  const { theme, setTheme } = useTheme();
  const [isUpdating, setIsUpdating] = useState(false);

  const [formData, setFormData] = useState({
    name: session?.user?.name || '',
    email: session?.user?.email || '',
    phone: (session?.user as any)?.phone || '',
  });

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUpdating(true);
    try {
      const res = await fetch('/api/user/update', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        toast.success("Profile updated successfully!");
        await update(); // Update local session
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
    <div className="space-y-8 max-w-4xl">
      <div>
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Settings</h1>
        <p className="text-slate-500 dark:text-slate-400 mt-1">Configure your account and application preferences.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="space-y-1">
          <h3 className="font-bold text-slate-900 dark:text-white text-lg">Profile Details</h3>
          <p className="text-xs text-slate-500 leading-relaxed">Update your personal identity across the ChitFlow network.</p>
        </div>
        <div className="md:col-span-2 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
          <form onSubmit={handleUpdateProfile} className="p-8 space-y-8">
            <div className="flex items-center gap-8 pb-8 border-b border-slate-100 dark:border-slate-800">
              <div className="w-24 h-24 rounded-full bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center text-white font-black text-3xl shadow-xl shadow-blue-500/20 border-4 border-white dark:border-slate-950">
                {initials}
              </div>
              <div className="space-y-3">
                <h4 className="font-bold text-slate-900 dark:text-white">Profile Photo</h4>
                <div className="flex gap-3">
                  <button type="button" className="px-5 py-2.5 rounded-xl bg-slate-900 dark:bg-white dark:text-slate-900 text-white text-xs font-bold hover:scale-[1.02] transition-all">
                    Upload New
                  </button>
                  <button type="button" className="px-5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-500 text-xs font-bold hover:bg-slate-50 dark:hover:bg-slate-800 transition-all">
                    Remove
                  </button>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Full Name</label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <input 
                    type="text" 
                    value={formData.name}
                    onChange={e => setFormData({...formData, name: e.target.value})}
                    className="w-full h-12 pl-12 pr-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 text-sm focus:ring-2 focus:ring-blue-500/20 outline-none transition-all" 
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Email Address</label>
                <input 
                  type="email" 
                  disabled
                  value={formData.email}
                  className="w-full h-12 px-4 rounded-2xl bg-slate-100 dark:bg-slate-800/20 border border-slate-200 dark:border-slate-800 text-sm text-slate-500 cursor-not-allowed" 
                />
              </div>
              <div className="space-y-2 sm:col-span-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Mobile Number</label>
                <input 
                  type="text" 
                  disabled
                  value={formData.phone}
                  className="w-full h-12 px-4 rounded-2xl bg-slate-100 dark:bg-slate-800/20 border border-slate-200 dark:border-slate-800 text-sm text-slate-500 cursor-not-allowed" 
                />
              </div>
            </div>

            <div className="pt-4">
              <button 
                type="submit"
                disabled={isUpdating}
                className="w-full sm:w-auto px-8 py-3 rounded-2xl bg-blue-600 text-white text-sm font-black shadow-lg shadow-blue-500/25 hover:bg-blue-700 transition-all flex items-center justify-center gap-2 disabled:opacity-70"
              >
                {isUpdating ? <Loader2 className="animate-spin" size={18} /> : <><Save size={18} /> Save Profile Changes</>}
              </button>
            </div>
          </form>
        </div>
      </div>

      <div className="h-px bg-slate-200 dark:bg-slate-800"></div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="space-y-1">
          <h3 className="font-bold text-slate-900 dark:text-white text-lg">Security</h3>
          <p className="text-xs text-slate-500 leading-relaxed">Protect your account with a strong password.</p>
        </div>
        <div className="md:col-span-2 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden p-8">
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
            className="space-y-6"
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Current Password</label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <input name="currentPassword" type="password" className="w-full h-12 pl-12 pr-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 text-sm focus:ring-2 focus:ring-blue-500/20 outline-none transition-all" />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">New Password</label>
                <div className="relative">
                  <Shield className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <input name="newPassword" type="password" className="w-full h-12 pl-12 pr-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 text-sm focus:ring-2 focus:ring-blue-500/20 outline-none transition-all" />
                </div>
              </div>
            </div>
            <button type="submit" className="px-8 py-3 rounded-2xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-sm font-black shadow-lg transition-all hover:scale-[1.02]">
              Update Password
            </button>
          </form>
        </div>
      </div>

      <div className="h-px bg-slate-200 dark:bg-slate-800"></div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="space-y-1">
          <h3 className="font-bold text-slate-900 dark:text-white text-lg">System Experience</h3>
          <p className="text-xs text-slate-500 leading-relaxed">Customize how the platform looks and feels on your device.</p>
        </div>
        <div className="md:col-span-2 space-y-4">
          <div className="bg-white dark:bg-slate-900 p-6 rounded-[28px] border border-slate-200 dark:border-slate-800 shadow-sm">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-5">
                <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-900/20 flex items-center justify-center text-indigo-600">
                  <Moon size={24} />
                </div>
                <div>
                  <h4 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-tight">Appearance Mode</h4>
                  <p className="text-xs text-slate-500">Automatically switch between themes.</p>
                </div>
              </div>
              <div className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl border border-slate-200/50 dark:border-slate-800">
                <button 
                  onClick={() => setTheme('light')}
                  className={cn(
                    "px-4 py-2 rounded-lg text-[11px] font-black uppercase transition-all",
                    theme === 'light' ? "bg-white text-blue-600 shadow-md" : "text-slate-500"
                  )}
                >
                  Light
                </button>
                <button 
                  onClick={() => setTheme('dark')}
                  className={cn(
                    "px-4 py-2 rounded-lg text-[11px] font-black uppercase transition-all",
                    theme === 'dark' ? "bg-slate-700 text-blue-400 shadow-md" : "text-slate-500"
                  )}
                >
                  Dark
                </button>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 p-6 rounded-[28px] border border-slate-200 dark:border-slate-800 shadow-sm">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-5">
                <div className="w-12 h-12 rounded-2xl bg-amber-50 dark:bg-amber-900/20 flex items-center justify-center text-amber-600">
                  <Bell size={24} />
                </div>
                <div>
                  <h4 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-tight">Smart Alerts</h4>
                  <p className="text-xs text-slate-500">Critical updates sent to your phone.</p>
                </div>
              </div>
              <div className="relative inline-flex h-7 w-12 items-center rounded-full bg-blue-600 cursor-pointer shadow-inner">
                <span className="inline-block h-5 w-5 translate-x-6 transform rounded-full bg-white shadow-md transition" />
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 p-6 rounded-[28px] border border-slate-200 dark:border-slate-800 shadow-sm">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-5">
                <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-900/20 flex items-center justify-center text-emerald-600">
                  <Globe size={24} />
                </div>
                <div>
                  <h4 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-tight">Regional Settings</h4>
                  <p className="text-xs text-slate-500">Language and currency localization.</p>
                </div>
              </div>
              <select className="text-xs font-black bg-transparent border-none focus:ring-0 text-slate-900 dark:text-white uppercase">
                <option>English (US)</option>
                <option>Hindi (भारत)</option>
                <option>Tamil (இந்தியா)</option>
              </select>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
