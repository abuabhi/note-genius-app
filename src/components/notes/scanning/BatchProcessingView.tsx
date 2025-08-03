
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { FileText, Loader2, X, CheckCircle, AlertCircle, Files } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ChevronDown } from "lucide-react";
import { Note } from "@/types/note";

interface ProcessedImage {
  id: string;
  imageUrl: string;
  recognizedText: string;
  title: string;
  subject: string; // Changed from category to subject
  status: 'pending' | 'processing' | 'completed' | 'failed';
  error?: string;
}

interface BatchProcessingViewProps {
  processedImages: ProcessedImage[];
  batchProgress: number;
  onSaveSeparate: () => Promise<void>;
  onSaveMerged: (title: string, subject: string, content: string) => Promise<void>;
  onReset: () => void;
  isSaving: boolean;
  availableSubjects: string[];
}

export const BatchProcessingView = ({
  processedImages,
  batchProgress,
  onSaveSeparate,
  onSaveMerged,
  onReset,
  isSaving,
  availableSubjects = []
}: BatchProcessingViewProps) => {
  const [saveMode, setSaveMode] = useState<'separate' | 'merged'>('separate');
  const [mergedTitle, setMergedTitle] = useState('');
  const [mergedSubject, setMergedSubject] = useState('Uncategorized');
  const [showContentPreview, setShowContentPreview] = useState(false);

  const completedImages = processedImages.filter(img => img.status === 'completed');

  // Generate merged content preview
  const generateMergedContent = () => {
    return completedImages
      .map((img, index) => 
        `## Page ${index + 1}: ${img.title}\n\n${img.recognizedText}\n\n---\n`
      )
      .join('\n');
  };

  const handleSave = async () => {
    if (saveMode === 'separate') {
      await onSaveSeparate();
    } else {
      const mergedContent = generateMergedContent();
      await onSaveMerged(mergedTitle || `Merged Document - ${completedImages.length} Pages`, mergedSubject, mergedContent);
    }
  };

  const canSave = saveMode === 'separate' || (saveMode === 'merged' && mergedTitle.trim());
  
  return (
    <div className="flex flex-col h-full">
      {/* Fixed Header Section */}
      <div className="flex-shrink-0 space-y-4 border-b border-gray-200 pb-4 mb-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-medium">Batch Processing ({processedImages.length} images)</h3>
          <Button variant="outline" size="sm" onClick={onReset}>
            <X className="h-4 w-4 mr-2" />
            Cancel
          </Button>
        </div>

        <div className="space-y-2">
          <div className="flex justify-between text-sm text-gray-600">
            <span>Overall Progress</span>
            <span>{Math.round(batchProgress)}%</span>
          </div>
          <Progress value={batchProgress} className="w-full" />
        </div>
      </div>

      {/* Scrollable Document List */}
      <div className="flex-1 min-h-0 mb-4">
        <ScrollArea className="h-full">
          <div className="space-y-2 pr-3">
            {processedImages.map((image, index) => (
              <Card key={image.id} className="shadow-sm">
                <CardContent className="p-3">
                  <div className="flex items-center gap-3">
                    <div className="flex-shrink-0">
                      {image.status === 'completed' && <CheckCircle className="h-4 w-4 text-green-500" />}
                      {image.status === 'failed' && <AlertCircle className="h-4 w-4 text-red-500" />}
                      {image.status === 'processing' && (
                        <div className="h-4 w-4 border-2 border-mint-500 border-t-transparent rounded-full animate-spin" />
                      )}
                      {image.status === 'pending' && <div className="h-4 w-4 bg-gray-300 rounded-full" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm text-gray-900 truncate">{image.title}</p>
                      {image.status === 'completed' && (
                        <p className="text-xs text-gray-500 mt-1 line-clamp-2">
                          {image.recognizedText.substring(0, 80)}...
                        </p>
                      )}
                      {image.status === 'failed' && (
                        <p className="text-xs text-red-500 mt-1">{image.error}</p>
                      )}
                    </div>
                    <div className="flex-shrink-0 text-xs text-gray-400">
                      #{index + 1}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </ScrollArea>
      </div>

      {/* Fixed Save Options Section */}
      {batchProgress === 100 && completedImages.length > 0 && (
        <div className="flex-shrink-0 space-y-4 border-t border-gray-200 pt-4">
          <h4 className="font-medium text-gray-900">Save Options</h4>
          
          <RadioGroup
            value={saveMode}
            onValueChange={(value) => setSaveMode(value as 'separate' | 'merged')}
            className="space-y-3"
          >
            {/* Separate Notes Option */}
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="separate" id="separate" />
              <Label htmlFor="separate" className="cursor-pointer flex items-center gap-2 text-sm">
                <FileText className="h-4 w-4" />
                Save as Separate Notes ({completedImages.length} notes)
              </Label>
            </div>

            {/* Merged Note Option */}
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="merged" id="merged" />
              <Label htmlFor="merged" className="cursor-pointer flex items-center gap-2 text-sm">
                <Files className="h-4 w-4" />
                Merge into Single Note
              </Label>
            </div>
          </RadioGroup>

          {/* Merged note options */}
          {saveMode === 'merged' && (
            <div className="space-y-3 ml-6 border-l-2 border-mint-200 pl-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label htmlFor="merged-title" className="text-sm">Document Title</Label>
                  <Input
                    id="merged-title"
                    value={mergedTitle}
                    onChange={(e) => setMergedTitle(e.target.value)}
                    placeholder={`Merged Document - ${completedImages.length} Pages`}
                    className="text-sm"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="merged-subject" className="text-sm">Subject</Label>
                  <Select value={mergedSubject} onValueChange={setMergedSubject}>
                    <SelectTrigger className="text-sm">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Uncategorized">Uncategorized</SelectItem>
                      {availableSubjects.map((subject) => (
                        <SelectItem key={subject} value={subject}>
                          {subject}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <Collapsible open={showContentPreview} onOpenChange={setShowContentPreview}>
                <CollapsibleTrigger asChild>
                  <Button variant="ghost" size="sm" className="flex items-center gap-2 text-sm">
                    <ChevronDown className={`h-4 w-4 transition-transform ${showContentPreview ? 'rotate-180' : ''}`} />
                    {showContentPreview ? 'Hide' : 'Show'} Content Preview
                  </Button>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <ScrollArea className="h-24 border rounded-md p-2 mt-2 bg-gray-50">
                    <div className="text-xs text-gray-700 whitespace-pre-wrap">
                      {generateMergedContent()}
                    </div>
                  </ScrollArea>
                </CollapsibleContent>
              </Collapsible>
            </div>
          )}

          {/* Fixed Action Buttons */}
          <div className="flex gap-2 pt-2">
            <Button 
              onClick={handleSave}
              disabled={isSaving || !canSave}
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
                  Save {saveMode === 'separate' ? 'Notes' : 'Note'}
                </>
              )}
            </Button>
            <Button variant="outline" onClick={onReset}>
              Start Over
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};
