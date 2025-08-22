import { useCallback, useEffect, useRef } from 'react';

interface UploadState {
  sessionId: string;
  timestamp: number;
  activeTab?: string;
  capturedImage?: string;
  recognizedText?: string;
  noteTitle?: string;
  noteSubject?: string;
  processingMode?: 'single' | 'batch';
  files?: { name: string; size: number; type: string }[];
}

export const useUploadPersistence = () => {
  const sessionIdRef = useRef<string>(`upload_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`);

  const saveUploadState = useCallback((state: Partial<UploadState>) => {
    try {
      const uploadState: UploadState = {
        sessionId: sessionIdRef.current,
        timestamp: Date.now(),
        ...state
      };
      
      sessionStorage.setItem('ocrUploadState', JSON.stringify(uploadState));
      console.log('💾 [UPLOAD PERSISTENCE] State saved:', {
        sessionId: uploadState.sessionId,
        hasImage: !!uploadState.capturedImage,
        hasText: !!uploadState.recognizedText,
        title: uploadState.noteTitle
      });
    } catch (error) {
      console.warn('⚠️ [UPLOAD PERSISTENCE] Failed to save state:', error);
    }
  }, []);

  const getPersistedUploadState = useCallback((): UploadState | null => {
    try {
      const saved = sessionStorage.getItem('ocrUploadState');
      if (!saved) return null;

      const state = JSON.parse(saved) as UploadState;
      
      // Check if state is recent (within last 30 minutes)
      const ageMinutes = (Date.now() - state.timestamp) / (1000 * 60);
      if (ageMinutes > 30) {
        console.log('🗑️ [UPLOAD PERSISTENCE] State expired, clearing');
        clearUploadState();
        return null;
      }

      console.log('🔄 [UPLOAD PERSISTENCE] State recovered:', {
        sessionId: state.sessionId,
        ageMinutes: Math.round(ageMinutes),
        hasImage: !!state.capturedImage,
        hasText: !!state.recognizedText
      });

      return state;
    } catch (error) {
      console.warn('⚠️ [UPLOAD PERSISTENCE] Failed to restore state:', error);
      return null;
    }
  }, []);

  const clearUploadState = useCallback(() => {
    try {
      sessionStorage.removeItem('ocrUploadState');
      console.log('🗑️ [UPLOAD PERSISTENCE] State cleared');
    } catch (error) {
      console.warn('⚠️ [UPLOAD PERSISTENCE] Failed to clear state:', error);
    }
  }, []);

  const updateUploadProgress = useCallback((progress: {
    files?: File[];
    currentFile?: string;
    completed?: number;
    total?: number;
  }) => {
    const currentState = getPersistedUploadState();
    if (currentState) {
      saveUploadState({
        ...currentState,
        ...progress,
        files: progress.files?.map(f => ({ name: f.name, size: f.size, type: f.type }))
      });
    }
  }, [getPersistedUploadState, saveUploadState]);

  // Auto-save state periodically during active uploads
  const startAutoSave = useCallback((getStateCallback: () => Partial<UploadState>) => {
    const interval = setInterval(() => {
      const state = getStateCallback();
      if (state.capturedImage || state.recognizedText || state.files?.length) {
        saveUploadState(state);
      }
    }, 5000); // Save every 5 seconds

    return () => clearInterval(interval);
  }, [saveUploadState]);

  // Clear state on successful save or explicit reset
  useEffect(() => {
    const handleBeforeUnload = () => {
      // Keep state on page unload so it can be recovered
      console.log('📤 [UPLOAD PERSISTENCE] Page unloading, keeping state for recovery');
    };

    const handleVisibilityChange = () => {
      if (document.hidden) {
        console.log('👁️ [UPLOAD PERSISTENCE] Tab hidden, state preserved');
      } else {
        console.log('👁️ [UPLOAD PERSISTENCE] Tab visible, checking for recovery');
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  return {
    saveUploadState,
    getPersistedUploadState,
    clearUploadState,
    updateUploadProgress,
    startAutoSave,
    sessionId: sessionIdRef.current
  };
};
