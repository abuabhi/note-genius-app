import { useState, useCallback } from 'react';

// Define the navigation link structure
interface NavigationLink {
  href: string;
  label: string;
}

type NavigationGuard = (path: string) => boolean;

export interface NavigationFormData {
  isSidebarOpen: boolean;
  toggleSidebar: () => void;
  closeSidebar: () => void;
  registerNavigationGuard: (guard: NavigationGuard) => () => void;
  menuLinks: NavigationLink[];
}

export const useNavigationForm = (): NavigationFormData => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [navigationGuards, setNavigationGuards] = useState<NavigationGuard[]>([]);
  
  // Empty menu links since we're now using the sidebar for navigation
  const menuLinks: NavigationLink[] = [];
  
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

  return {
    isSidebarOpen, 
    toggleSidebar, 
    closeSidebar,
    registerNavigationGuard,
    menuLinks
  };
};