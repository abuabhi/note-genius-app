import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { SubjectSelector } from './SubjectSelector';
import { Card, CardContent } from '@/components/ui/card';
import { BookOpen, FileText, Target } from 'lucide-react';
import { stripHtmlAndDecode } from "@/components/notes/conversion/utils/contentProcessingUtils";

export interface DocumentToConfirm {
  id: string;
  title: string;
  content: string;
  suggestedSubject: string;
  confidence: number;
}

interface SubjectConfirmationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  documents: DocumentToConfirm[];
  onConfirm: (updatedDocuments: { id: string; subject: string }[]) => void;
  onCancel: () => void;
}

export const SubjectConfirmationDialog = ({
  open,
  onOpenChange,
  documents,
  onConfirm,
  onCancel
}: SubjectConfirmationDialogProps) => {
  const [selectedSubjects, setSelectedSubjects] = useState<Record<string, string>>({});

  // Sync selectedSubjects state when documents prop changes
  useEffect(() => {
    console.log('📋 SubjectConfirmationDialog: documents changed', documents.length);
    const initial: Record<string, string> = {};
    documents.forEach(doc => {
      initial[doc.id] = doc.suggestedSubject;
      console.log(`📋 Setting subject for ${doc.title}: ${doc.suggestedSubject}`);
    });
    setSelectedSubjects(initial);
  }, [documents]);

  const handleSubjectChange = (docId: string, subject: string) => {
    setSelectedSubjects(prev => ({
      ...prev,
      [docId]: subject
    }));
  };

  const handleConfirm = () => {
    console.log('📋 SubjectConfirmationDialog: confirming import', selectedSubjects);
    const updatedDocs = documents.map(doc => ({
      id: doc.id,
      subject: selectedSubjects[doc.id] || doc.suggestedSubject
    }));
    console.log('📋 SubjectConfirmationDialog: final documents for import', updatedDocs);
    onConfirm(updatedDocs);
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.8) return "text-green-600";
    if (confidence >= 0.6) return "text-yellow-600";
    return "text-red-600";
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Confirm Subjects for Import
          </DialogTitle>
          <DialogDescription>
            Review and adjust the suggested subjects for your documents before importing.
            AI-suggested subjects are shown with confidence scores.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {documents.map((doc) => (
            <Card key={doc.id} className="border-l-4 border-l-primary/20">
              <CardContent className="p-4">
                <div className="grid gap-4 md:grid-cols-2">
                  {/* Document Preview */}
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4 text-muted-foreground" />
                      <h4 className="font-medium text-sm truncate" title={doc.title}>
                        {doc.title}
                      </h4>
                    </div>
                    
                    <div className="bg-muted/50 rounded-md p-3 text-xs text-muted-foreground">
                      <p className="line-clamp-3">
                        {stripHtmlAndDecode(doc.content).substring(0, 200)}
                        {stripHtmlAndDecode(doc.content).length > 200 && '...'}
                      </p>
                    </div>

                    {/* AI Suggestion Info */}
                    <div className="flex items-center gap-2 text-xs">
                      <BookOpen className="h-3 w-3" />
                      <span>AI Suggested:</span>
                      <span className="font-medium">{doc.suggestedSubject}</span>
                      <span className={`font-medium ${getConfidenceColor(doc.confidence)}`}>
                        ({Math.round(doc.confidence * 100)}% confidence)
                      </span>
                    </div>
                  </div>

                  {/* Subject Selection */}
                  <div className="space-y-3">
                    <SubjectSelector
                      value={selectedSubjects[doc.id] || doc.suggestedSubject}
                      onValueChange={(subject) => handleSubjectChange(doc.id, subject)}
                      required
                      className="w-full"
                    />
                    
                    {selectedSubjects[doc.id] !== doc.suggestedSubject && (
                      <div className="text-xs text-blue-600 bg-blue-50 dark:bg-blue-950/20 p-2 rounded">
                        ✓ Subject updated from AI suggestion
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={onCancel}>
            Cancel Import
          </Button>
          <Button onClick={handleConfirm} className="min-w-[120px]">
            Import {documents.length} {documents.length === 1 ? 'Document' : 'Documents'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};