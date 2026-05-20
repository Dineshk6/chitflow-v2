'use client';

import React from 'react';
import Sidebar from './Sidebar';
import Navbar from './Navbar';
import CalculatorWidget from '../admin/CalculatorWidget';
import { NavigationProvider } from './NavigationProgress';
import { motion, AnimatePresence } from 'framer-motion';
import { usePathname, useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { Loader2 } from 'lucide-react';

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
      <div className="flex min-h-screen items-center justify-center bg-slate-100">
        <div className="text-center space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center mx-auto shadow-lg">
            <Loader2 className="w-7 h-7 text-white animate-spin" />
          </div>
          <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Loading workspace...</p>
        </div>
      </div>
    );
  }

  if (status === 'authenticated' && session?.user?.role !== 'ADMIN') {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-100 p-6">
        <div className="text-center space-y-4">
          <h1 className="text-2xl font-bold text-red-600">Access Denied</h1>
          <p className="text-slate-500">Your account does not have Agent permissions.</p>
          <button
            onClick={() => router.push('/auth/admin/login')}
            className="px-6 py-2 bg-slate-900 text-white rounded-xl font-bold"
          >
            Switch Account
          </button>
        </div>
      </div>
    );
  }

  return (
    <NavigationProvider>
      <div className="flex min-h-screen bg-slate-100">
        <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
        <div className="flex-1 flex flex-col min-w-0">
          <Navbar onMenuClick={() => setIsSidebarOpen(true)} />
          <main className="flex-1 p-4 sm:p-6 md:p-8 lg:p-10 overflow-y-auto overflow-x-hidden">
            <AnimatePresence mode="wait">
              <motion.div
                key={pathname}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.15 }}
                className="max-w-7xl mx-auto w-full"
              >
                {children}
              </motion.div>
            </AnimatePresence>
          </main>
        </div>
        <CalculatorWidget />
      </div>
    </NavigationProvider>
  );
}
