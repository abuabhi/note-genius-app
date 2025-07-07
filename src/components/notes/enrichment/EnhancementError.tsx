import React from 'react';
import { AlertTriangle, RefreshCw, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

interface EnhancementErrorProps {
  error: string;
  onRetry?: () => void;
  title?: string;
  enhancementType?: string;
}

export const EnhancementError = ({
  error,
  onRetry,
  title = "Enhancement Failed",
  enhancementType = ""
}: EnhancementErrorProps) => {
  
  const getErrorMessage = (error: string, enhancementType: string) => {
    if (error.includes('timeout') || error.includes('timed out')) {
      return {
        title: "Request Timed Out",
        message: "The AI service is taking longer than expected. This sometimes happens during high demand periods.",
        suggestion: "Please try again in a moment. If the issue persists, the service may be experiencing temporary delays."
      };
    }
    
    if (error.includes('network') || error.includes('fetch')) {
      return {
        title: "Network Error",
        message: "Unable to connect to the AI enhancement service.",
        suggestion: "Please check your internet connection and try again."
      };
    }
    
    if (error.includes('limit') || error.includes('quota')) {
      return {
        title: "Usage Limit Reached",
        message: "You've reached your monthly enhancement limit for your current tier.",
        suggestion: "Upgrade to a higher tier for more AI enhancements, or wait until next month."
      };
    }
    
    if (error.includes('API key') || error.includes('authentication')) {
      return {
        title: "Service Configuration Error",
        message: "There's a temporary issue with the AI service configuration.",
        suggestion: "Please try again in a few minutes. If the issue persists, contact support."
      };
    }
    
    return {
      title: "Enhancement Failed",
      message: error || "An unexpected error occurred while processing your request.",
      suggestion: "Please try again. If the problem continues, the AI service may be temporarily unavailable."
    };
  };
  
  const errorDetails = getErrorMessage(error, enhancementType);
  
  return (
    <Card className="m-6 border-red-200 bg-red-50/50">
      <CardContent className="p-8">
        <div className="flex flex-col items-center text-center space-y-6">
          {/* Error Icon */}
          <div className="p-4 bg-red-100 rounded-full">
            <AlertTriangle className="h-8 w-8 text-red-600" />
          </div>
          
          {/* Error Title */}
          <div>
            <h3 className="text-xl font-semibold text-red-900 mb-2">
              {errorDetails.title}
            </h3>
            <p className="text-red-700/80 mb-3 max-w-md">
              {errorDetails.message}
            </p>
            <p className="text-red-600/70 text-sm max-w-md">
              {errorDetails.suggestion}
            </p>
          </div>
          
          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3">
            {onRetry && (
              <Button 
                onClick={onRetry}
                variant="outline"
                className="border-red-300 text-red-700 hover:bg-red-50 hover:border-red-400"
              >
                <RefreshCw className="mr-2 h-4 w-4" />
                Try Again
              </Button>
            )}
            
            <Button 
              variant="ghost"
              size="sm"
              className="text-red-600 hover:text-red-700 hover:bg-red-50"
              onClick={() => window.open('https://help.lovable.dev', '_blank')}
            >
              <ExternalLink className="mr-2 h-4 w-4" />
              Get Help
            </Button>
          </div>
          
          {/* Technical Details (Collapsible) */}
          <details className="w-full max-w-md">
            <summary className="text-xs text-red-500 cursor-pointer hover:text-red-600">
              Technical Details
            </summary>
            <div className="mt-2 p-3 bg-red-100 rounded text-xs text-red-700 font-mono text-left">
              Enhancement Type: {enhancementType}<br/>
              Error: {error}
            </div>
          </details>
        </div>
      </CardContent>
    </Card>
  );
};