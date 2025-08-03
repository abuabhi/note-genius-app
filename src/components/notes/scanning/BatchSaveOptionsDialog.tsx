import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FileText, Files, Loader2 } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';

interface ProcessedImage {
  id: string;
  imageUrl: string;
  recognizedText: string;
  title: string;
  subject: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  error?: string;
}

interface BatchSaveOptionsDialogProps {
  isOpen: boolean;
  onClose: () => void;
  processedImages: ProcessedImage[];
  onSaveSeparate: () => Promise<void>;
  onSaveMerged: (title: string, subject: string, content: string) => Promise<void>;
  isSaving: boolean;
  availableSubjects: string[];
}

export const BatchSaveOptionsDialog = ({
  isOpen,
  onClose,
  processedImages,
  onSaveSeparate,
  onSaveMerged,
  isSaving,
  availableSubjects = []
}: BatchSaveOptionsDialogProps) => {
  console.log('BatchSaveOptionsDialog render - isOpen:', isOpen);
  const [saveMode, setSaveMode] = useState<'separate' | 'merged'>('separate');
  const [mergedTitle, setMergedTitle] = useState('');
  const [mergedSubject, setMergedSubject] = useState('Uncategorized');

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
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Files className="h-5 w-5" />
            Save {completedImages.length} Scanned Documents
          </DialogTitle>
          <DialogDescription>
            Choose how you'd like to save your scanned documents
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 space-y-6">
          <RadioGroup
            value={saveMode}
            onValueChange={(value) => setSaveMode(value as 'separate' | 'merged')}
            className="grid grid-cols-1 md:grid-cols-2 gap-4"
          >
            {/* Separate Notes Option */}
            <div className="space-y-2">
              <Card className={`cursor-pointer transition-all ${
                saveMode === 'separate' ? 'ring-2 ring-primary' : 'hover:shadow-md'
              }`}>
                <CardHeader className="pb-3">
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="separate" id="separate" />
                    <Label htmlFor="separate" className="cursor-pointer font-medium">
                      Save as Separate Notes
                    </Label>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                    <FileText className="h-4 w-4" />
                    {completedImages.length} individual notes
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Each scanned page becomes a separate note with its own title and subject.
                  </p>
                </CardContent>
              </Card>

              {saveMode === 'separate' && (
                <ScrollArea className="h-40 border rounded-md p-3">
                  <div className="space-y-2">
                    {completedImages.map((img, index) => (
                      <div key={img.id} className="text-sm border-l-2 border-primary pl-3">
                        <div className="font-medium">{img.title}</div>
                        <div className="text-muted-foreground">Subject: {img.subject}</div>
                        <div className="text-xs text-muted-foreground truncate">
                          {img.recognizedText.substring(0, 100)}...
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              )}
            </div>

            {/* Merged Note Option */}
            <div className="space-y-2">
              <Card className={`cursor-pointer transition-all ${
                saveMode === 'merged' ? 'ring-2 ring-primary' : 'hover:shadow-md'
              }`}>
                <CardHeader className="pb-3">
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="merged" id="merged" />
                    <Label htmlFor="merged" className="cursor-pointer font-medium">
                      Merge into Single Note
                    </Label>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                    <FileText className="h-4 w-4" />
                    1 combined note
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Combine all scanned pages into one comprehensive document.
                  </p>
                </CardContent>
              </Card>

              {saveMode === 'merged' && (
                <div className="space-y-3">
                  <div className="space-y-2">
                    <Label htmlFor="merged-title">Document Title</Label>
                    <Input
                      id="merged-title"
                      value={mergedTitle}
                      onChange={(e) => setMergedTitle(e.target.value)}
                      placeholder={`Merged Document - ${completedImages.length} Pages`}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="merged-subject">Subject</Label>
                    <Select value={mergedSubject} onValueChange={setMergedSubject}>
                      <SelectTrigger>
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

                  <div className="space-y-2">
                    <Label>Content Preview</Label>
                    <ScrollArea className="h-32 border rounded-md p-3">
                      <Textarea
                        value={generateMergedContent()}
                        readOnly
                        className="min-h-[100px] resize-none border-none"
                      />
                    </ScrollArea>
                  </div>
                </div>
              )}
            </div>
          </RadioGroup>
        </div>

        <div className="flex justify-between pt-4 border-t">
          <Button variant="outline" onClick={onClose} disabled={isSaving}>
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            disabled={!canSave || isSaving}
            className="min-w-[120px]"
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
        </div>
      </DialogContent>
    </Dialog>
  );
};