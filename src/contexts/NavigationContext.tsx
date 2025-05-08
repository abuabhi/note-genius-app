
import { createContext, useContext, useState, ReactNode } from "react";
import { useNavigate } from "react-router-dom";

interface NavigationContextType {
  handleNavigation: (path: string) => void;
  registerNavigationGuard: (
    guard: (path: string) => boolean
  ) => () => void;
}

const NavigationContext = createContext<NavigationContextType | undefined>(undefined);

export const NavigationProvider = ({ children }: { children: ReactNode }) => {
  const navigate = useNavigate();
  const [navigationGuards, setNavigationGuards] = useState<Array<(path: string) => boolean>>([]);

  // Register a navigation guard and return a function to unregister it
  const registerNavigationGuard = (guard: (path: string) => boolean) => {
    setNavigationGuards((prev) => [...prev, guard]);
    return () => {
      setNavigationGuards((prev) => prev.filter((g) => g !== guard));
    };
  };

  // Run all navigation guards before navigating
  const handleNavigation = (path: string) => {
    // Check if any guard prevents navigation
    const canNavigate = navigationGuards.every((guard) => guard(path));
    
    if (canNavigate) {
      navigate(path);
    }
  };

  return (
    <NavigationContext.Provider value={{ handleNavigation, registerNavigationGuard }}>
      {children}
    </NavigationContext.Provider>
  );
};

export const useNavigation = () => {
  const context = useContext(NavigationContext);
  if (context === undefined) {
    throw new Error("useNavigation must be used within a NavigationProvider");
  }
  return context;
};
