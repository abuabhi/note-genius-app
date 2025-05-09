
import { createContext, useContext, useState, ReactNode, useCallback } from 'react';

// Define the navigation link structure
interface NavigationLink {
  href: string;
  label: string;
}

type NavigationGuard = (path: string) => boolean;

interface NavigationContextProps {
  isSidebarOpen: boolean;
  toggleSidebar: () => void;
  closeSidebar: () => void;
  registerNavigationGuard: (guard: NavigationGuard) => () => void;
  menuLinks: NavigationLink[];
}

const NavigationContext = createContext<NavigationContextProps | undefined>(undefined);

export const NavigationProvider = ({ children }: { children: ReactNode }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [navigationGuards, setNavigationGuards] = useState<NavigationGuard[]>([]);
  
  // Default menu links
  const menuLinks: NavigationLink[] = [
    { href: "/dashboard", label: "Dashboard" },
    { href: "/notes", label: "Notes" },
    { href: "/flashcards", label: "Flashcards" },
    { href: "/schedule", label: "Schedule" },
    { href: "/goals", label: "Goals" },
    { href: "/settings", label: "Settings" }
  ];
  
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
        registerNavigationGuard,
        menuLinks
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

// Export the context hook with proper name
export const useNavigationContext = useNavigation;
