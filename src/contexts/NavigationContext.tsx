
import { createContext, useContext, useState, ReactNode, useCallback } from 'react';

type NavigationGuard = (path: string) => boolean;

interface NavigationContextProps {
  isSidebarOpen: boolean;
  toggleSidebar: () => void;
  closeSidebar: () => void;
  registerNavigationGuard: (guard: NavigationGuard) => () => void;
}

const NavigationContext = createContext<NavigationContextProps | undefined>(undefined);

export const NavigationProvider = ({ children }: { children: ReactNode }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [navigationGuards, setNavigationGuards] = useState<NavigationGuard[]>([]);
  
  const toggleSidebar = () => {
    setIsSidebarOpen(prev => !prev);
  };
  
  const closeSidebar = () => {
    setIsSidebarOpen(false);
  };

  const registerNavigationGuard = useCallback((guard: NavigationGuard) => {
    setNavigationGuards(prev => [...prev, guard]);

    // Return unregister function
    return () => {
      setNavigationGuards(prev => prev.filter(g => g !== guard));
    };
  }, []);

  return (
    <NavigationContext.Provider 
      value={{ 
        isSidebarOpen, 
        toggleSidebar, 
        closeSidebar,
        registerNavigationGuard
      }}
    >
      {children}
    </NavigationContext.Provider>
  );
};

export const useNavigation = () => {
  const context = useContext(NavigationContext);
  
  if (context === undefined) {
    throw new Error('useNavigation must be used within a NavigationProvider');
  }
  
  return context;
};
