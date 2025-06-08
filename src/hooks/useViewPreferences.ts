
import { useState, useEffect } from 'react';

export type ViewMode = 'grid' | 'list';

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
    } catch (error) {
      console.warn('Failed to save view preference:', error);
      setViewMode(mode);
    }
  };

  return { viewMode, setViewMode: updateViewMode };
};
