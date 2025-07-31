import { useState, useCallback } from 'react';
import { toast } from 'sonner';

export interface ChatError {
  type: 'network' | 'server' | 'validation' | 'auth' | 'content_policy' | 'unknown';
  message: string;
  details?: string;
  timestamp: Date;
  retryable: boolean;
  suggestions?: string[];
  help?: {
    reason: string;
    commonTriggers: string[];
    nextSteps: string[];
  };
}

export const useErrorHandler = () => {
  const [errors, setErrors] = useState<ChatError[]>([]);
  const [retryCount, setRetryCount] = useState(0);

  const handleError = useCallback((error: any, context?: string) => {
    console.error('Chat error:', error, context);

    let chatError: ChatError;

    // Handle content policy violations with helpful messaging
    if (error?.error === 'Content Policy Violation' || error?.message?.includes('safety filters')) {
      chatError = {
        type: 'content_policy',
        message: 'Content flagged by AI safety filters - contains marketing/sales language that appears spammy',
        details: error.message || error.details,
        timestamp: new Date(),
        retryable: true,
        suggestions: error.suggestions || [
          'Remove aggressive sales language like "guaranteed" or "instant results"',
          'Replace promotional terms with educational language',
          'Use neutral, academic tone instead of persuasive marketing language'
        ],
        help: error.help
      };
    } else if (error?.message?.includes('fetch')) {
      chatError = {
        type: 'network',
        message: 'Network connection failed. Please check your internet connection.',
        details: error.message,
        timestamp: new Date(),
        retryable: true
      };
    } else if (error?.status >= 500) {
      chatError = {
        type: 'server',
        message: 'Server error occurred. Our team has been notified.',
        details: error.message,
        timestamp: new Date(),
        retryable: true
      };
    } else if (error?.status === 401) {
      chatError = {
        type: 'auth',
        message: 'Authentication failed. Please sign in again.',
        details: error.message,
        timestamp: new Date(),
        retryable: false
      };
    } else if (error?.status === 429) {
      chatError = {
        type: 'server',
        message: 'Too many requests. Please wait a moment before trying again.',
        details: error.message,
        timestamp: new Date(),
        retryable: true
      };
    } else {
      chatError = {
        type: 'unknown',
        message: error?.message || 'An unexpected error occurred',
        details: JSON.stringify(error),
        timestamp: new Date(),
        retryable: false
      };
    }

    setErrors(prev => [...prev.slice(-4), chatError]); // Keep last 5 errors

    // Show appropriate toast with enhanced content policy messaging
    if (chatError.type === 'content_policy') {
      toast.error('Content Policy Issue', {
        description: 'Your content contains marketing language that triggers AI safety filters. Click for suggestions.',
        duration: 8000,
        action: {
          label: 'View Suggestions',
          onClick: () => {
            // Create a more detailed toast with suggestions
            toast.info('Content Policy Suggestions', {
              description: chatError.suggestions?.slice(0, 2).join(' • ') || 'Rephrase content to be more educational',
              duration: 10000
            });
          }
        }
      });
    } else if (chatError.retryable && retryCount < 3) {
      toast.error(chatError.message, {
        action: {
          label: 'Retry',
          onClick: () => setRetryCount(prev => prev + 1)
        }
      });
    } else {
      toast.error(chatError.message);
    }

    return chatError;
  }, [retryCount]);

  const clearErrors = useCallback(() => {
    setErrors([]);
    setRetryCount(0);
  }, []);

  const getLastError = useCallback(() => {
    return errors[errors.length - 1];
  }, [errors]);

  return {
    errors,
    handleError,
    clearErrors,
    getLastError,
    retryCount,
    canRetry: retryCount < 3
  };
};