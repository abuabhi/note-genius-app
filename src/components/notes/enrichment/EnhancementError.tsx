
import React from 'react';
import { Button } from '@/components/ui/button';
import { AlertCircle, RefreshCcw, XCircle } from 'lucide-react';
import { Card } from '@/components/ui/card';

interface EnhancementErrorProps {
  error: string;
  onRetry: () => void;
  onCancel?: () => void;
  title?: string;
  enhancementType?: string;
}

export const EnhancementError: React.FC<EnhancementErrorProps> = ({
  error,
  onRetry,
  onCancel,
  title = "Enhancement failed",
  enhancementType
}) => {
  // Parse error message to provide more user-friendly information
  const getDisplayError = () => {
    if (error.includes("limit")) {
      return "You've reached your monthly limit for AI enhancements.";
    }
    
    if (error.includes("timeout") || error.includes("timed out")) {
      return "The request took too long to process. Please try again.";
    }
    
    if (error.includes("token") || error.includes("tokens")) {
      return "Your note is too long for the AI to process at once. Try splitting it into smaller sections.";
    }
    
    if (error.includes("content") || error.includes("empty")) {
      return "No content was found to enhance. Please add some text to your note.";
    }
    
    if (error.includes("network") || error.includes("offline")) {
      return "Network connection issue. Please check your internet connection and try again.";
    }
    
    if (error.includes("API") || error.includes("server")) {
      return "Our AI service is currently experiencing issues. Please try again later.";
    }
    
    // Default error message
    return error;
  };
  
  return (
    <Card className="p-4 bg-red-50 border border-red-200 rounded-md">
      <div className="flex items-start gap-3">
        <AlertCircle className="h-5 w-5 text-red-500 mt-0.5 flex-shrink-0" />
        <div className="flex-1">
          <h3 className="text-red-700 font-medium mb-1">{title}</h3>
          {enhancementType && (
            <p className="text-xs font-medium text-red-600 mb-1">
              Type: {enhancementType}
            </p>
          )}
          <p className="text-red-600 text-sm mb-3">{getDisplayError()}</p>
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              className="text-red-600 border-red-300 hover:bg-red-50"
              onClick={onRetry}
            >
              <RefreshCcw className="h-3 w-3 mr-1" />
              Try Again
            </Button>
            
            {onCancel && (
              <Button 
                variant="ghost" 
                size="sm"
                onClick={onCancel}
                className="text-gray-500"
              >
                <XCircle className="h-3 w-3 mr-1" />
                Cancel
              </Button>
            )}
          </div>
          
          {/* Technical details for debugging (collapsed) */}
          <details className="mt-3">
            <summary className="text-xs text-red-500 cursor-pointer">Technical details</summary>
            <pre className="mt-1 text-xs bg-red-100 p-2 rounded overflow-auto max-h-24">
              {error}
            </pre>
          </details>
        </div>
      </div>
    </Card>
  );
};
