
import { useState } from 'react';

export type ViewMode = 'grid' | 'list' | 'compact';

export const useViewPreferences = (key: string, defaultValue: ViewMode = 'grid') => {
  const [viewMode, setViewMode] = useState<ViewMode>(() => {
    try {
      const saved = localStorage.getItem(`viewMode_${key}`);
      return (saved as ViewMode) || defaultValue;
    } catch {
      return defaultValue;
    }
  });

  const updateViewMode = (mode: ViewMode) => {
    try {
      localStorage.setItem(`viewMode_${key}`, mode);
      setViewMode(mode);
    } catch {
      // Silently handle localStorage errors
      setViewMode(mode);
    }
  };

  return { viewMode, setViewMode: updateViewMode };
};
