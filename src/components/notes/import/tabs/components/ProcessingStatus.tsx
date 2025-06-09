
import React from "react";
import { Card, CardContent } from "@/components/ui/card";

interface ProcessingStatusProps {
  fileType: string;
  isPremiumUser: boolean;
}

export const ProcessingStatus = ({ fileType, isPremiumUser }: ProcessingStatusProps) => {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="text-center">
          <div className="h-12 w-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Processing {fileType === 'application/pdf' ? 'PDF Document' : 'Image'}
          </h3>
          <p className="text-sm text-gray-600 mb-4">
            {isPremiumUser 
              ? "Using OpenAI Vision API for enhanced OCR accuracy..." 
              : "Using Google Vision API with OpenAI fallback..."
            }
          </p>
          <div className="bg-blue-50 p-3 rounded-lg">
            <p className="text-xs text-blue-700">
              AI-powered text extraction with automatic title/subject detection in progress...
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
