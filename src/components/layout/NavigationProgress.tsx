'use client';

import { useState, useEffect, createContext, useContext } from 'react';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';

const NavigationContext = createContext({
  isNavigating: false,
  startNavigation: () => {},
  stopNavigation: () => {}
});

export function useNavigation() {
  return useContext(NavigationContext);
}

export function NavigationProgress({ children }: { children: React.ReactNode }) {
  const [isNavigating, setIsNavigating] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    setIsNavigating(false);
  }, [pathname]);

  const startNavigation = () => setIsNavigating(true);
  const stopNavigation = () => setIsNavigating(false);

  return (
    <NavigationContext.Provider value={{ isNavigating, startNavigation, stopNavigation }}>
      <AnimatePresence>
        {isNavigating && (
          <motion.div
            initial={{ width: '0%', opacity: 1 }}
            animate={{ width: '70%', transition: { duration: 2, ease: 'easeOut' } }}
            exit={{ width: '100%', opacity: 0, transition: { duration: 0.3 } }}
            className="fixed top-0 left-0 h-1 bg-blue-500 z-[100]"
          />
        )}
      </AnimatePresence>
      {children}
    </NavigationContext.Provider>
  );
}
