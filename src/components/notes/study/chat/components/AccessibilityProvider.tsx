
import { createContext, useContext, useState, useCallback, ReactNode } from 'react';

interface AccessibilityContextType {
  announceMessage: (message: string) => void;
  highContrast: boolean;
  setHighContrast: (enabled: boolean) => void;
  reducedMotion: boolean;
  setReducedMotion: (enabled: boolean) => void;
  fontSize: 'small' | 'medium' | 'large';
  setFontSize: (size: 'small' | 'medium' | 'large') => void;
}

const AccessibilityContext = createContext<AccessibilityContextType | null>(null);

export const useAccessibility = () => {
  const context = useContext(AccessibilityContext);
  if (!context) {
    throw new Error('useAccessibility must be used within AccessibilityProvider');
  }
  return context;
};

interface AccessibilityProviderProps {
  children: ReactNode;
}

export const AccessibilityProvider = ({ children }: AccessibilityProviderProps) => {
  const [highContrast, setHighContrast] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(
    typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches
  );
  const [fontSize, setFontSize] = useState<'small' | 'medium' | 'large'>('medium');

  const announceMessage = useCallback((message: string) => {
    // Create a live region announcement for screen readers
    const announcement = document.createElement('div');
    announcement.setAttribute('aria-live', 'polite');
    announcement.setAttribute('aria-atomic', 'true');
    announcement.className = 'sr-only';
    announcement.textContent = message;
    
    document.body.appendChild(announcement);
    
    // Remove after announcement
    setTimeout(() => {
      document.body.removeChild(announcement);
    }, 1000);
  }, []);

  return (
    <AccessibilityContext.Provider
      value={{
        announceMessage,
        highContrast,
        setHighContrast,
        reducedMotion,
        setReducedMotion,
        fontSize,
        setFontSize
      }}
    >
      <div
        className={`
          ${highContrast ? 'contrast-125 brightness-110' : ''}
          ${reducedMotion ? '[&_*]:!transition-none [&_*]:!animate-none' : ''}
          ${fontSize === 'small' ? 'text-sm' : fontSize === 'large' ? 'text-lg' : ''}
        `}
      >
        {children}
      </div>
    </AccessibilityContext.Provider>
  );
};
