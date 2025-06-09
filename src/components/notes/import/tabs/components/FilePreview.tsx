
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileImage, FileText, Sparkles } from "lucide-react";

interface FilePreviewProps {
  selectedFile: File;
  filePreviewUrl: string;
  isProcessing: boolean;
  isPremiumUser: boolean;
  onProcess: () => void;
}

export const FilePreview = ({
  selectedFile,
  filePreviewUrl,
  isProcessing,
  isPremiumUser,
  onProcess
}: FilePreviewProps) => {
  return (
    <Card className="bg-gray-50">
      <CardContent className="p-4">
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            {selectedFile.type === 'application/pdf' ? (
              <FileText className="h-5 w-5 text-red-500" />
            ) : (
              <FileImage className="h-5 w-5 text-blue-500" />
            )}
            <div>
              <p className="font-medium">{selectedFile.name}</p>
              <p className="text-sm text-gray-500">
                {(selectedFile.size / 1024 / 1024).toFixed(2)} MB • 
                {selectedFile.type === 'application/pdf' ? ' PDF Document' : ' Image'}
              </p>
            </div>
          </div>
          
          {/* Image/File Preview */}
          <div className="border rounded-lg overflow-hidden">
            {selectedFile.type.startsWith('image/') && filePreviewUrl ? (
              <img 
                src={filePreviewUrl} 
                alt="Selected document preview" 
                className="w-full h-48 object-contain bg-white"
              />
            ) : (
              <div className="flex items-center justify-center w-full h-48 bg-gray-100">
                <div className="text-center p-4">
                  <FileText className="h-12 w-12 text-red-500 mx-auto mb-2" />
                  <p className="text-sm text-gray-600">{selectedFile.name}</p>
                  <p className="text-xs text-gray-500">PDF document</p>
                </div>
              </div>
            )}
          </div>
          
          <div className="bg-blue-50 p-3 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="h-4 w-4 text-blue-600" />
              <span className="text-sm font-medium text-blue-700">AI-Powered OCR Ready</span>
            </div>
            <p className="text-xs text-blue-700">
              {isPremiumUser 
                ? "Premium: OpenAI Vision API for maximum accuracy on handwritten text"
                : "Using advanced Google Vision API with OpenAI fallback for best results"
              }
            </p>
          </div>
          
          <Button 
            onClick={onProcess}
            disabled={isProcessing}
            className="w-full bg-purple-600 hover:bg-purple-700"
          >
            {isProcessing ? 'Processing...' : 'Extract Text with AI'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
