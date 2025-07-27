
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { FileText, ArrowLeft, Save, Info } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface ProcessedContentProps {
  title: string;
  content: string;
  onSave: (finalTitle: string) => Promise<void>;
  onBack: () => void;
}

export const ProcessedContent = ({ title, content, onSave, onBack }: ProcessedContentProps) => {
  const [editableTitle, setEditableTitle] = useState(title);

  const handleSave = async () => {
    await onSave(editableTitle);
  };

  return (
    <TooltipProvider>
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
            <div className="flex items-center gap-2 mb-2">
              <Label htmlFor="document-title" className="font-medium text-mint-800">
                Document Title:
              </Label>
              <Tooltip>
                <TooltipTrigger>
                  <Info className="h-4 w-4 text-mint-600" />
                </TooltipTrigger>
                <TooltipContent>
                  <p>You can change this title later</p>
                </TooltipContent>
              </Tooltip>
            </div>
            <Input
              id="document-title"
              value={editableTitle}
              onChange={(e) => setEditableTitle(e.target.value)}
              placeholder="Enter document title"
              className="bg-mint-50 border-mint-200"
            />
          </div>
          
          <div>
            <h3 className="font-medium text-mint-800 mb-2">Content Preview:</h3>
            <div className="max-h-60 overflow-y-auto bg-mint-50 p-4 rounded border border-mint-200">
              <pre className="whitespace-pre-wrap text-sm text-mint-700">{content}</pre>
            </div>
          </div>
          
          <Button 
            onClick={handleSave} 
            className="w-full bg-mint-500 hover:bg-mint-600 text-white"
            disabled={!editableTitle.trim()}
          >
            <Save className="h-4 w-4 mr-2" />
            Save as Note
          </Button>
        </CardContent>
      </Card>
    </TooltipProvider>
  );
};
