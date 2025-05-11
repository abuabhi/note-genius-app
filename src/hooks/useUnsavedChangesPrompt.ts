
import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

export const useUnsavedChangesPrompt = (
  isDirty: boolean,
  setShowDialog: (show: boolean) => void,
  setPendingNavigation: (path: string | null) => void
) => {
  const location = useLocation();

  useEffect(() => {
    if (!isDirty) return;

    // Custom event handler for navigation attempts
    const handleBeforeNavigate = (event: any) => {
      // Don't block if form is pristine (no changes)
      if (!isDirty) return;

      // If there's a nextPath, store it 
      if (event.detail && event.detail.nextPath) {
        event.preventDefault();
        setPendingNavigation(event.detail.nextPath);
        setShowDialog(true);
      }
    };

    // Add event listener
    window.addEventListener('beforeNavigate', handleBeforeNavigate);

    return () => {
      window.removeEventListener('beforeNavigate', handleBeforeNavigate);
    };
  }, [isDirty, setShowDialog, setPendingNavigation]);

  // Reset pending navigation when location changes
  useEffect(() => {
    setPendingNavigation(null);
  }, [location, setPendingNavigation]);
};

export default useUnsavedChangesPrompt;
