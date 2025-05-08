
import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { useNavigation } from "@/contexts/NavigationContext";

/**
 * Hook to prompt users about unsaved changes when they try to navigate away
 * @param isDirty Whether there are unsaved changes
 * @param setShowDialog Function to show the confirmation dialog
 * @param setPendingNavigation Function to set the pending navigation path
 */
export const useUnsavedChangesPrompt = (
  isDirty: boolean,
  setShowDialog: (show: boolean) => void,
  setPendingNavigation: (path: string | null) => void
) => {
  const location = useLocation();
  const { registerNavigationGuard } = useNavigation();

  // Handle browser refresh/close
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (isDirty) {
        const message = "You have unsaved changes. Are you sure you want to leave?";
        e.returnValue = message;
        return message;
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [isDirty]);

  // Register navigation guard to show dialog when navigating away
  useEffect(() => {
    if (isDirty) {
      const unregister = registerNavigationGuard((path) => {
        if (path !== location.pathname) {
          setPendingNavigation(path);
          setShowDialog(true);
          return false; // Prevent immediate navigation
        }
        return true; // Allow navigation
      });
      
      return unregister;
    }
  }, [isDirty, location.pathname, setShowDialog, setPendingNavigation, registerNavigationGuard]);
};
