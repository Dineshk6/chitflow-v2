'use client';

import React from 'react';
import Sidebar from './Sidebar';
import Navbar from './Navbar';

import { motion, AnimatePresence } from 'framer-motion';
import { usePathname, useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();
  const pathname = usePathname();
  const router = useRouter();
  const [isSidebarOpen, setIsSidebarOpen] = React.useState(false);

  React.useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/admin/login');
    }
  }, [status, router]);

  if (status === 'loading') {
    return (
      <div className="app-shell-bg min-h-screen flex">
        <div className="hidden lg:block w-64 border-r border-slate-200 bg-white animate-pulse" />
        <div className="flex-1 p-6 space-y-6">
          <div className="h-14 bg-white rounded-xl border border-slate-200 animate-pulse" />
          <div className="h-40 bg-white rounded-2xl border border-slate-200 animate-pulse" />
          <div className="grid grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-32 bg-white rounded-2xl border border-slate-200 animate-pulse" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (status === 'authenticated' && session?.user?.role !== 'ADMIN') {
    return (
      <div className="app-shell-bg flex items-center justify-center min-h-screen p-6">
        <div className="surface-card max-w-md w-full p-8 text-center space-y-4">
          <h1 className="text-2xl font-black text-red-600">Access Denied</h1>
          <p className="text-slate-600 text-sm">Your account does not have Agent permissions.</p>
          <button
            type="button"
            onClick={() => router.push('/auth/admin/login')}
            className="btn-primary w-full"
          >
            Switch Account
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen app-shell-bg">
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
      <div className="flex-1 flex flex-col min-w-0">
        <Navbar onMenuClick={() => setIsSidebarOpen(true)} />
        <main className="flex-1 p-3 sm:p-5 md:p-6 lg:p-7 overflow-y-auto overflow-x-hidden min-w-0">
          <AnimatePresence mode="wait">
            <motion.div
              key={pathname}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.2 }}
              className="max-w-6xl xl:max-w-7xl mx-auto w-full min-w-0"
            >
              {children}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}
