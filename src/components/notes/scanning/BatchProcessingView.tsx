
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { FileText, Loader2, X, CheckCircle, AlertCircle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Note } from "@/types/note";

interface ProcessedImage {
  id: string;
  imageUrl: string;
  recognizedText: string;
  title: string;
  category: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  error?: string;
}

interface BatchProcessingViewProps {
  processedImages: ProcessedImage[];
  batchProgress: number;
  onSaveBatch: () => Promise<void>;
  onReset: () => void;
  isSaving: boolean;
}

export const BatchProcessingView = ({
  processedImages,
  batchProgress,
  onSaveBatch,
  onReset,
  isSaving
}: BatchProcessingViewProps) => {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium">Batch Processing ({processedImages.length} images)</h3>
        <Button variant="outline" onClick={onReset}>
          <X className="h-4 w-4 mr-2" />
          Cancel
        </Button>
      </div>

      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span>Overall Progress</span>
          <span>{Math.round(batchProgress)}%</span>
        </div>
        <Progress value={batchProgress} className="w-full" />
      </div>

      <div className="space-y-2 max-h-60 overflow-y-auto">
        {processedImages.map((image, index) => (
          <Card key={image.id}>
            <CardContent className="p-3">
              <div className="flex items-center gap-3">
                <div className="flex-shrink-0">
                  {image.status === 'completed' && <CheckCircle className="h-5 w-5 text-green-500" />}
                  {image.status === 'failed' && <AlertCircle className="h-5 w-5 text-red-500" />}
                  {image.status === 'processing' && (
                    <div className="h-5 w-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                  )}
                  {image.status === 'pending' && <div className="h-5 w-5 bg-gray-300 rounded-full" />}
                </div>
                <div className="flex-1">
                  <p className="font-medium text-sm">{image.title}</p>
                  {image.status === 'completed' && (
                    <p className="text-xs text-gray-500">
                      {image.recognizedText.substring(0, 50)}...
                    </p>
                  )}
                  {image.status === 'failed' && (
                    <p className="text-xs text-red-500">{image.error}</p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {batchProgress === 100 && (
        <div className="flex gap-2">
          <Button 
            onClick={onSaveBatch}
            disabled={isSaving || processedImages.filter(img => img.status === 'completed').length === 0}
            className="bg-mint-500 hover:bg-mint-600 text-white"
          >
            {isSaving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <FileText className="mr-2 h-4 w-4" />
                Save {processedImages.filter(img => img.status === 'completed').length} Notes
              </>
            )}
          </Button>
          <Button variant="outline" onClick={onReset}>
            Start Over
          </Button>
        </div>
      )}
    </div>
  );
};
