/**
 * Utility functions for robust error handling and message extraction
 */

export interface ExtractedError {
  message: string;
  code?: string;
  details?: string;
  hint?: string;
}

/**
 * Extracts a human-readable error message from any error type
 * Handles Supabase errors, fetch errors, and generic objects
 */
export function extractErrorMessage(error: unknown): ExtractedError {
  console.log("🔍 Error extraction input:", { error, type: typeof error });

  // Handle null/undefined
  if (!error) {
    return { message: "An unknown error occurred" };
  }

  // Handle string errors
  if (typeof error === 'string') {
    return { message: error };
  }

  // Handle Error objects
  if (error instanceof Error) {
    return { 
      message: error.message || "An error occurred",
      details: error.stack
    };
  }

  // Handle Supabase/PostgreSQL error objects
  if (typeof error === 'object' && error !== null) {
    const errorObj = error as any;

    // Supabase error format
    if (errorObj.message) {
      return {
        message: errorObj.message,
        code: errorObj.code || errorObj.error_code,
        details: errorObj.details,
        hint: errorObj.hint
      };
    }

    // PostgREST error format
    if (errorObj.error_description || errorObj.error) {
      return {
        message: errorObj.error_description || errorObj.error,
        code: errorObj.error_code || errorObj.code
      };
    }

    // Fetch/network error format
    if (errorObj.status && errorObj.statusText) {
      return {
        message: `Network error: ${errorObj.statusText} (${errorObj.status})`,
        code: errorObj.status.toString()
      };
    }

    // Generic object with toString
    if (errorObj.toString && typeof errorObj.toString === 'function') {
      const stringified = errorObj.toString();
      if (stringified !== '[object Object]') {
        return { message: stringified };
      }
    }

    // Attempt to extract any meaningful text properties
    const meaningfulProps = ['message', 'error', 'description', 'reason', 'text'];
    for (const prop of meaningfulProps) {
      if (errorObj[prop] && typeof errorObj[prop] === 'string') {
        return { 
          message: errorObj[prop],
          details: JSON.stringify(errorObj, null, 2)
        };
      }
    }

    // Last resort - stringify the object
    try {
      return { 
        message: "Error occurred - see details",
        details: JSON.stringify(errorObj, null, 2)
      };
    } catch {
      return { message: "An unidentifiable error occurred" };
    }
  }

  // Fallback for any other type
  return { message: `Unexpected error type: ${typeof error}` };
}

/**
 * Creates a user-friendly error message from any error
 */
export function createUserFriendlyError(error: unknown, context?: string): string {
  const extracted = extractErrorMessage(error);
  const prefix = context ? `${context}: ` : '';
  return `${prefix}${extracted.message}`;
}

/**
 * Logs an error with full context for debugging
 */
export function logErrorWithContext(error: unknown, context: string, additionalData?: any) {
  const extracted = extractErrorMessage(error);
  
  console.error(`❌ ${context}:`, {
    message: extracted.message,
    code: extracted.code,
    details: extracted.details,
    hint: extracted.hint,
    originalError: error,
    additionalData
  });
}

/**
 * Determines if an error is retryable based on its characteristics
 */
export function isRetryableError(error: unknown): boolean {
  const extracted = extractErrorMessage(error);
  const message = extracted.message.toLowerCase();
  const code = extracted.code;

  // Network/timeout errors are retryable
  if (message.includes('timeout') || message.includes('network') || message.includes('fetch')) {
    return true;
  }

  // Specific HTTP status codes that are retryable
  if (code && ['500', '502', '503', '504', '408', '429'].includes(code)) {
    return true;
  }

  // Authentication/permission errors are not retryable
  if (message.includes('unauthorized') || message.includes('forbidden') || code === '401' || code === '403') {
    return false;
  }

  // Database constraint/validation errors are not retryable
  if (message.includes('violates') || message.includes('constraint') || code?.startsWith('23')) {
    return false;
  }

  // Default to not retryable for safety
  return false;
}