import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { FileText, Sparkles, CheckCircle, Upload, ArrowRight } from 'lucide-react';
import { useImportState } from '../useImportState';
import { FileDropZone } from './components/FileDropZone';
import { SubjectSelector } from '../components/SubjectSelector';

import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';

interface FileImportTabProps {
  onSaveNote: (note: any) => Promise<boolean>;
  isPremiumUser?: boolean;
  onClose?: () => void;
}

export const FileImportTab = ({ onSaveNote, onClose }: FileImportTabProps) => {
  const [selectedSubject, setSelectedSubject] = useState<string>("Imports");
  const [editableTitle, setEditableTitle] = useState<string>("");
  const [isSaving, setIsSaving] = useState(false);
  const navigate = useNavigate();
  
  const {
    selectedFile,
    processedText,
    documentTitle,
    isProcessing,
    handleFileSelected,
    processDocument,
    setSelectedFile,
    setProcessedText
  } = useImportState(onSaveNote);

  // Update editable title when document title changes
  React.useEffect(() => {
    if (documentTitle && !editableTitle) {
      setEditableTitle(documentTitle);
    }
  }, [documentTitle, editableTitle]);

  const clearFiles = () => {
    setSelectedFile(null);
    setProcessedText(null);
    setEditableTitle("");
  };

  const handleSave = async () => {
    if (!editableTitle.trim()) {
      toast.error("Please enter a title for your note");
      return;
    }

    setIsSaving(true);
    try {
      const note = {
        title: editableTitle,
        content: processedText,
        date: new Date().toISOString(),
        subject: selectedSubject,
        description: `Imported document: ${editableTitle}`,
        sourceType: "import"
      };

      const success = await onSaveNote(note);
      if (success) {
        toast.success("Note imported successfully!");
        onClose?.();
        navigate("/notes");
      }
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-4">
      {!selectedFile && !processedText && (
        <FileDropZone onFileSelected={handleFileSelected} />
      )}

      {selectedFile && !processedText && (
        <Card className="bg-gray-50 border border-gray-200">
          <CardContent className="p-4">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-medium text-gray-900 flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-mint-500" />
                  Selected File
                </h3>
                <Button 
                  variant="outline" 
                  onClick={clearFiles} 
                  size="sm"
                  className="h-8 px-3 text-xs"
                >
                  Clear
                </Button>
              </div>
              
              <div className="flex items-center gap-3 p-3 bg-white rounded-lg border">
                <div className="p-2 bg-mint-50 rounded-md">
                  <FileText className="h-4 w-4 text-mint-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">{selectedFile.name}</p>
                  <p className="text-xs text-gray-500">
                    {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>
              </div>
              
              <Button 
                onClick={processDocument} 
                disabled={isProcessing}
                className="w-full bg-mint-500 hover:bg-mint-600 text-white"
              >
                {isProcessing ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Processing...
                  </div>
                ) : (
                  'Process File'
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {isProcessing && (
        <Card className="bg-gray-50 border border-gray-200">
          <CardContent className="p-6">
            <div className="text-center space-y-3">
              <div className="w-12 h-12 bg-mint-500 rounded-lg flex items-center justify-center mx-auto">
                <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-900">Processing Document</h3>
                <p className="text-xs text-gray-600">Extracting content...</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {processedText && (
        <Card className="bg-mint-50 border border-mint-200">
          <CardContent className="p-6">
            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-4">
                <CheckCircle className="h-5 w-5 text-mint-600" />
                <h3 className="text-lg font-medium text-mint-800">Content Extracted Successfully!</h3>
              </div>

              <SubjectSelector
                value={selectedSubject}
                onValueChange={setSelectedSubject}
                required
              />

              <div>
                <Label htmlFor="note-title" className="font-medium text-mint-800">
                  Note Title
                </Label>
                <Input
                  id="note-title"
                  value={editableTitle}
                  onChange={(e) => setEditableTitle(e.target.value)}
                  placeholder="Enter a title for your note"
                  className="bg-white border-mint-200 mt-1"
                />
                <p className="text-xs text-mint-600 mt-1">You can change this title later</p>
              </div>

              <Button 
                onClick={handleSave}
                disabled={!editableTitle.trim() || isSaving}
                className="w-full bg-mint-500 hover:bg-mint-600 text-white"
              >
                {isSaving ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Saving...
                  </div>
                ) : (
                  <>
                    <Upload className="h-4 w-4 mr-2" />
                    Save Note
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

    </div>
  );
};
