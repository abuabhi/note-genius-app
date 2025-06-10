
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FileText, ArrowLeft, Save } from 'lucide-react';

interface ProcessedContentProps {
  title: string;
  content: string;
  onSave: () => Promise<void>;
  onBack: () => void;
}

export const ProcessedContent = ({ title, content, onSave, onBack }: ProcessedContentProps) => {
  return (
    <Card className="border border-mint-200">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-mint-800">
            <FileText className="h-5 w-5 text-mint-600" />
            Processed Document
          </CardTitle>
          <Button variant="outline" onClick={onBack} size="sm">
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <h3 className="font-medium text-mint-800 mb-2">Document Title:</h3>
          <p className="text-mint-700 bg-mint-50 p-2 rounded border border-mint-200">{title}</p>
        </div>
        
        <div>
          <h3 className="font-medium text-mint-800 mb-2">Content Preview:</h3>
          <div className="max-h-60 overflow-y-auto bg-mint-50 p-4 rounded border border-mint-200">
            <pre className="whitespace-pre-wrap text-sm text-mint-700">{content}</pre>
          </div>
        </div>
        
        <Button 
          onClick={onSave} 
          className="w-full bg-mint-500 hover:bg-mint-600 text-white"
        >
          <Save className="h-4 w-4 mr-2" />
          Save as Note
        </Button>
      </CardContent>
    </Card>
  );
};
