'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';

type NavigationContextValue = {
  isNavigating: boolean;
  startNavigation: () => void;
};

const NavigationContext = React.createContext<NavigationContextValue>({
  isNavigating: false,
  startNavigation: () => {},
});

export function NavigationProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [isNavigating, setIsNavigating] = React.useState(false);
  const prevPath = React.useRef(pathname);

  const startNavigation = React.useCallback(() => {
    setIsNavigating(true);
  }, []);

  React.useEffect(() => {
    if (prevPath.current !== pathname) {
      prevPath.current = pathname;
      setIsNavigating(false);
    }
  }, [pathname]);

  return (
    <NavigationContext.Provider value={{ isNavigating, startNavigation }}>
      {children}
      <div
        className={cn(
          'fixed top-0 left-0 right-0 z-[60] h-1 overflow-hidden pointer-events-none transition-opacity duration-200',
          isNavigating ? 'opacity-100' : 'opacity-0'
        )}
        aria-hidden
      >
        <div className="h-full w-full bg-indigo-100">
          <div className="h-full w-1/3 min-w-[8rem] bg-gradient-to-r from-blue-500 via-indigo-500 to-violet-500 animate-[nav-progress_0.9s_ease-in-out_infinite]" />
        </div>
      </div>
    </NavigationContext.Provider>
  );
}

export function useNavigation() {
  return React.useContext(NavigationContext);
}
