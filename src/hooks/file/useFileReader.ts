import { useCallback, useRef, useEffect } from 'react';

interface UseFileReaderOptions {
  onLoad?: (result: string) => void;
  onError?: (error: Error) => void;
}

export const useFileReader = ({ onLoad, onError }: UseFileReaderOptions = {}) => {
  const readerRef = useRef<FileReader | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  const readAsDataURL = useCallback(async (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      // Create new AbortController for this operation
      abortControllerRef.current = new AbortController();
      
      const reader = new FileReader();
      readerRef.current = reader;

      const cleanup = () => {
        readerRef.current = null;
        abortControllerRef.current = null;
      };

      // Handle abort signal
      abortControllerRef.current.signal.addEventListener('abort', () => {
        reader.abort();
        cleanup();
        reject(new Error('File reading was aborted'));
      });

      reader.onload = (event) => {
        const result = event.target?.result as string;
        if (result) {
          onLoad?.(result);
          resolve(result);
        } else {
          const error = new Error('Failed to read file - no result');
          onError?.(error);
          reject(error);
        }
        cleanup();
      };

      reader.onerror = () => {
        const error = new Error('Failed to read file');
        onError?.(error);
        reject(error);
        cleanup();
      };

      reader.onabort = () => {
        const error = new Error('File reading was aborted');
        onError?.(error);
        reject(error);
        cleanup();
      };

      try {
        reader.readAsDataURL(file);
      } catch (error) {
        const err = error instanceof Error ? error : new Error('Unknown error');
        onError?.(err);
        reject(err);
        cleanup();
      }
    });
  }, [onLoad, onError]);

  const abort = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    if (readerRef.current) {
      readerRef.current.abort();
    }
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      abort();
    };
  }, [abort]);

  return {
    readAsDataURL,
    abort,
    isReading: !!readerRef.current
  };
};