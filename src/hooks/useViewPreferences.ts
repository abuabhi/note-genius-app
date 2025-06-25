
import { useState, useEffect } from 'react';

export type ViewMode = 'grid' | 'list' | 'compact';

export const useViewPreferences = (key: string, defaultValue: ViewMode = 'grid') => {
  const [viewMode, setViewMode] = useState<ViewMode>(() => {
    try {
      const saved = localStorage.getItem(`viewMode_${key}`);
      console.log('🎯 useViewPreferences - Loaded from localStorage:', saved);
      return (saved as ViewMode) || defaultValue;
    } catch {
      console.log('🎯 useViewPreferences - Using default value:', defaultValue);
      return defaultValue;
    }
  });

  const updateViewMode = (mode: ViewMode) => {
    console.log('🎯 useViewPreferences - Updating view mode from', viewMode, 'to', mode);
    try {
      localStorage.setItem(`viewMode_${key}`, mode);
      setViewMode(mode);
      console.log('🎯 useViewPreferences - Successfully updated to:', mode);
    } catch (error) {
      console.warn('Failed to save view preference:', error);
      setViewMode(mode);
    }
  };

  useEffect(() => {
    console.log('🎯 useViewPreferences - Current viewMode state:', viewMode);
  }, [viewMode]);

  return { viewMode, setViewMode: updateViewMode };
};
