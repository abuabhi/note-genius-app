import React, { createContext, useContext, useState, useCallback } from 'react';

interface SimpleHelpContextValue {
  isOpen: boolean;
  openHelp: () => void;
  closeHelp: () => void;
}

const SimpleHelpContext = createContext<SimpleHelpContextValue | null>(null);

export const useSimpleHelp = () => {
  const context = useContext(SimpleHelpContext);
  if (!context) {
    throw new Error('useSimpleHelp must be used within a SimpleHelpProvider');
  }
  return context;
};

export const SimpleHelpProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isOpen, setIsOpen] = useState(false);
  
  const openHelp = useCallback(() => {
    setIsOpen(true);
  }, []);

  const closeHelp = useCallback(() => {
    setIsOpen(false);
  }, []);

  const value: SimpleHelpContextValue = {
    isOpen,
    openHelp,
    closeHelp
  };

  return (
    <SimpleHelpContext.Provider value={value}>
      {children}
    </SimpleHelpContext.Provider>
  );
};