
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { FileText, Loader2, X, CheckCircle, AlertCircle, Files } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { useUserSubjects } from "@/hooks/useUserSubjects";
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
  onSaveSeparate: (batchSubject?: string) => Promise<void>;
  onSaveMerged: (title: string, subject: string, content: string) => Promise<void>;
  onReset: () => void;
  isSaving: boolean;
}

export const BatchProcessingView = ({
  processedImages,
  batchProgress,
  onSaveSeparate,
  onSaveMerged,
  onReset,
  isSaving
}: BatchProcessingViewProps) => {
  const [saveMode, setSaveMode] = useState<'separate' | 'merged'>('separate');
  const [mergedTitle, setMergedTitle] = useState('');
  const [mergedSubject, setMergedSubject] = useState('');
  const [batchSubject, setBatchSubject] = useState('');
  const [showContentPreview, setShowContentPreview] = useState(false);

  const { subjects, isLoading } = useUserSubjects();
  const availableSubjects = subjects.map(s => s.name);
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
      await onSaveSeparate(batchSubject);
    } else {
      const mergedContent = generateMergedContent();
      await onSaveMerged(mergedTitle || `Merged Document - ${completedImages.length} Pages`, mergedSubject, mergedContent);
    }
  };

  const canSave = (saveMode === 'separate' && batchSubject.trim()) || (saveMode === 'merged' && mergedTitle.trim() && mergedSubject.trim());
  const isComplete = batchProgress === 100;

  // Split documents into two columns
  const midPoint = Math.ceil(processedImages.length / 2);
  const leftColumn = processedImages.slice(0, midPoint);
  const rightColumn = processedImages.slice(midPoint);
  
  return (
    <div className="flex flex-col h-full">
      {/* Header Section - Hide when complete */}
      {!isComplete && (
        <div className="flex-shrink-0 space-y-4 border-b pb-4 mb-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium">Batch Processing ({processedImages.length} images)</h3>
            <Button variant="outline" size="sm" onClick={onReset}>
              <X className="h-4 w-4 mr-2" />
              Cancel
            </Button>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>Overall Progress</span>
              <span>{Math.round(batchProgress)}%</span>
            </div>
            <Progress value={batchProgress} className="w-full" />
          </div>
        </div>
      )}

      {/* Two-Column Document Grid */}
      <div className="flex-1 min-h-0 mb-4">
        <ScrollArea className="h-full">
          <div className="grid grid-cols-2 gap-4 pr-2">
            {/* Left Column */}
            <div className="space-y-1">
              {leftColumn.map((image, index) => (
                <DocumentRow key={image.id} image={image} displayIndex={index + 1} />
              ))}
            </div>

            {/* Right Column */}
            <div className="space-y-1">
              {rightColumn.map((image, index) => (
                <DocumentRow key={image.id} image={image} displayIndex={midPoint + index + 1} />
              ))}
            </div>
          </div>
        </ScrollArea>
      </div>

      {/* Save Options Section - Only when complete */}
      {isComplete && completedImages.length > 0 && (
        <div className="flex-shrink-0 space-y-4 border-t pt-4">
          <h4 className="font-medium">Save Options</h4>
          
          <RadioGroup
            value={saveMode}
            onValueChange={(value) => setSaveMode(value as 'separate' | 'merged')}
            className="flex gap-6"
          >
            {/* Separate Notes Option */}
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="separate" id="separate" />
              <Label htmlFor="separate" className="cursor-pointer flex items-center gap-2 text-sm">
                <FileText className="h-4 w-4" />
                Separate ({completedImages.length})
              </Label>
            </div>

            {/* Merged Note Option */}
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="merged" id="merged" />
              <Label htmlFor="merged" className="cursor-pointer flex items-center gap-2 text-sm">
                <Files className="h-4 w-4" />
                Merge into one
              </Label>
            </div>
          </RadioGroup>

          {/* Separate notes subject selection */}
          {saveMode === 'separate' && (
            <div className="space-y-2">
              <Label className="text-sm">Subject for all notes</Label>
              <Select value={batchSubject} onValueChange={setBatchSubject} disabled={isLoading}>
                <SelectTrigger className="text-sm h-8">
                  <SelectValue placeholder={isLoading ? "Loading..." : "Select subject for all notes"} />
                </SelectTrigger>
                <SelectContent>
                  {availableSubjects.map((subject) => (
                    <SelectItem key={subject} value={subject}>
                      {subject}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Merged note options */}
          {saveMode === 'merged' && (
            <div className="space-y-3">
              <div className="grid grid-cols-3 gap-2">
                <Input
                  value={mergedTitle}
                  onChange={(e) => setMergedTitle(e.target.value)}
                  placeholder="Title"
                  className="text-sm h-8"
                />
                <Select value={mergedSubject} onValueChange={setMergedSubject} disabled={isLoading}>
                  <SelectTrigger className="text-sm h-8">
                    <SelectValue placeholder={isLoading ? "Loading..." : "Select subject"} />
                  </SelectTrigger>
                  <SelectContent>
                    {availableSubjects.map((subject) => (
                      <SelectItem key={subject} value={subject}>
                        {subject}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Collapsible open={showContentPreview} onOpenChange={setShowContentPreview}>
                  <CollapsibleTrigger asChild>
                    <Button variant="outline" size="sm" className="h-8 text-xs">
                      {showContentPreview ? 'Hide' : 'Preview'}
                    </Button>
                  </CollapsibleTrigger>
                </Collapsible>
              </div>
              
              <Collapsible open={showContentPreview} onOpenChange={setShowContentPreview}>
                <CollapsibleContent>
                  <ScrollArea className="h-20 border rounded p-2 bg-muted/50">
                    <div className="text-xs whitespace-pre-wrap">
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
              className="bg-primary hover:bg-primary/90 text-primary-foreground"
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

// Single document row component
interface DocumentRowProps {
  image: ProcessedImage;
  displayIndex: number;
}

const DocumentRow = ({ image, displayIndex }: DocumentRowProps) => {
  const getStatusIcon = () => {
    switch (image.status) {
      case 'completed':
        return <CheckCircle className="h-3 w-3 text-green-500" />;
      case 'failed':
        return <AlertCircle className="h-3 w-3 text-red-500" />;
      case 'processing':
        return <Loader2 className="h-3 w-3 animate-spin text-blue-500" />;
      default:
        return <div className="h-3 w-3 bg-muted rounded-full" />;
    }
  };

  const getStatusText = () => {
    switch (image.status) {
      case 'completed':
        return 'Completed';
      case 'failed':
        return 'Failed';
      case 'processing':
        return 'Processing';
      default:
        return 'Pending';
    }
  };

  return (
    <div className="flex items-center gap-2 p-2 border rounded text-xs hover:bg-muted/50 transition-colors">
      {getStatusIcon()}
      <span className="font-medium truncate flex-1">{image.title}</span>
      {image.subject && (
        <>
          <span className="text-muted-foreground">-</span>
          <span className="text-muted-foreground truncate">{image.subject}</span>
        </>
      )}
      <span className="text-muted-foreground">-</span>
      <span className={`font-medium ${image.status === 'failed' ? 'text-red-500' : ''}`}>
        {getStatusText()}
      </span>
    </div>
  );
};
