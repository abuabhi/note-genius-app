
import { useState, useCallback } from "react";
import { useToast } from "@/hooks/use-toast";

export const useConversationErrors = () => {
  const [error, setError] = useState<Error | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const { toast } = useToast();

  const handleError = useCallback((error: any, message: string) => {
    console.error(message, error);
    setError(error instanceof Error ? error : new Error(message));
    
    if (retryCount < 3) {
      toast({
        title: 'Error',
        description: `${message}. Retrying...`,
        variant: 'destructive',
      });
    } else {
      toast({
        title: 'Connection Issues',
        description: 'Having trouble connecting to the chat service. Please try again later.',
        variant: 'destructive',
      });
    }
  }, [retryCount, toast]);

  const incrementRetry = useCallback(() => {
    setRetryCount(prev => prev + 1);
  }, []);

  const resetErrors = useCallback(() => {
    setError(null);
    setRetryCount(0);
  }, []);

  return {
    error,
    retryCount,
    handleError,
    incrementRetry,
    resetErrors,
  };
};
