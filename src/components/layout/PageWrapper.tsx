'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { usePathname } from 'next/navigation';

interface PageWrapperProps {
  children: React.ReactNode;
  loadingContent?: React.ReactNode;
}

export default function PageWrapper({ children, loadingContent }: PageWrapperProps) {
  const pathname = usePathname();
  const [isLoading, setIsLoading] = React.useState(!!loadingContent);

  React.useEffect(() => {
    if (!loadingContent) {
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    const timer = setTimeout(() => setIsLoading(false), 120);
    return () => clearTimeout(timer);
  }, [pathname, loadingContent]);

  if (!loadingContent) {
    return <>{children}</>;
  }

  return (
    <AnimatePresence mode="wait">
      {isLoading ? (
        <motion.div
          key={`loading-${pathname}`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
        >
          {loadingContent}
        </motion.div>
      ) : (
        <motion.div
          key={`content-${pathname}`}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2, ease: 'easeOut' }}
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
