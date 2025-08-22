
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ImageUpload } from '../../scanning/ImageUpload';
import { useImageUpload } from '../../scanning/hooks/useImageUpload';
import { useDragAndDrop } from '../../scanning/hooks/useDragAndDrop';
import { useBatchProcessing } from '../../scanning/hooks/useBatchProcessing';
import { BatchProcessingView } from '../../scanning/BatchProcessingView';
import { ImageProcessor } from '../../scanning/ImageProcessor';
import { NoteMetadataForm } from '../../scanning/NoteMetadataForm';
import { Button } from '@/components/ui/button';
import { FileText, Loader2, Camera } from 'lucide-react';
import { getOrCreateSubjectId } from "@/utils/subjectHelpers";
import { useToast } from "@/hooks/use-toast";
import { PostSaveSuccessDialog } from "../../scanning/PostSaveSuccessDialog";

interface ScanImportTabProps {
  onSaveNote: (note: any) => Promise<boolean>;
  isPremiumUser?: boolean;
}

export const ScanImportTab = ({ onSaveNote, isPremiumUser }: ScanImportTabProps) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [selectedLanguage, setSelectedLanguage] = React.useState("eng");
  const [recognizedText, setRecognizedText] = React.useState("");
  const [noteTitle, setNoteTitle] = React.useState("");
  const [noteSubject, setNoteSubject] = React.useState("Uncategorized");
  const [isSaving, setIsSaving] = React.useState(false);
  
  const [showSuccessDialog, setShowSuccessDialog] = React.useState(false);
  const [lastSaveResult, setLastSaveResult] = React.useState<{ count: number; mode: 'separate' | 'merged' }>({ count: 0, mode: 'separate' });
  const [processingMode, setProcessingMode] = React.useState<'single' | 'batch'>('single');
  
  const { 
    capturedImage, 
    setCapturedImage, 
    uploadImageToStorage, 
    handleImageCaptured 
  } = useImageUpload();

  const { 
    isDragOver, 
    handleDragEnter,
    handleDragOver, 
    handleDragLeave, 
    handleDrop,
    resetDragState
  } = useDragAndDrop();

  const { 
    processedImages, 
    batchProgress, 
    processBatchImages, 
    resetBatchProcessing 
  } = useBatchProcessing({ 
    selectedLanguage, 
    isPremiumUser, 
    uploadImageToStorage 
  });

  const resetForm = () => {
    setCapturedImage(null);
    setRecognizedText("");
    setNoteTitle("");
    setNoteSubject("Uncategorized");
    setProcessingMode('single');
    resetBatchProcessing();
    resetDragState();
    setShowSuccessDialog(false);
  };


  const handleSingleImage = (imageUrl: string) => {
    handleImageCaptured(imageUrl);
  };

  const handleMultipleImages = (files: File[]) => {
    setProcessingMode('batch');
    processBatchImages(files);
  };

  const handleDropEvent = (e: React.DragEvent) => {
    handleDrop(e, handleSingleImage, handleMultipleImages);
  };

  // Handle auto-generated title
  const handleTitleGenerated = (title: string) => {
    if (!noteTitle || noteTitle === "") {
      setNoteTitle(title);
    }
  };

  // Handle auto-generated subject
  const handleSubjectGenerated = async (subject: string) => {
    if (noteSubject === "Uncategorized") {
      setNoteSubject(subject);
    }
  };

  const saveBatchAsNotes = async (batchSubject?: string) => {
    setIsSaving(true);
    const completedImages = processedImages.filter(img => img.status === 'completed');

    try {
      for (const image of completedImages) {
        // Use batch subject if provided, otherwise fall back to image subject
        const subjectToUse = batchSubject || image.subject || "Uncategorized";
        const subjectId = await getOrCreateSubjectId(subjectToUse);
        
        const note = {
          title: image.title,
          description: image.recognizedText.substring(0, 100) + (image.recognizedText.length > 100 ? "..." : ""),
          date: new Date().toISOString().split('T')[0],
          subject: subjectToUse, // Use batch subject or image subject
          subject_id: subjectId, // Use proper subject ID
          content: image.recognizedText,
          sourceType: 'scan',
          scanData: {
            originalImageUrl: image.imageUrl,
            recognizedText: image.recognizedText,
            confidence: 0.8,
            language: selectedLanguage
          }
        };

        await onSaveNote(note);
      }

      setLastSaveResult({ count: completedImages.length, mode: 'separate' });
      setShowSuccessDialog(true);
      toast({
        title: "Success!",
        description: `Successfully saved ${completedImages.length} notes from scanned documents.`,
      });

      resetForm();
    } catch (error) {
      console.error("Error saving batch notes:", error);
      toast({
        title: "Error",
        description: "Failed to save some notes. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const saveBatchAsMergedNote = async (title: string, subject: string, content: string) => {
    setIsSaving(true);
    const completedImages = processedImages.filter(img => img.status === 'completed');

    try {
      const subjectId = await getOrCreateSubjectId(subject);
      
      const mergedNote = {
        title,
        description: content.substring(0, 100) + (content.length > 100 ? "..." : ""),
        date: new Date().toISOString().split('T')[0],
        subject: subject, // Use subject instead of category
        subject_id: subjectId,
        content,
        sourceType: 'scan',
        scanData: {
          originalImageUrl: completedImages[0]?.imageUrl || '',
          recognizedText: content,
          confidence: 0.8,
          language: selectedLanguage
        }
      };

      await onSaveNote(mergedNote);
      setLastSaveResult({ count: completedImages.length, mode: 'merged' });
      setShowSuccessDialog(true);
      
      toast({
        title: "Success!",
        description: "Successfully merged and saved your scanned documents.",
      });

      resetForm();
    } catch (error) {
      console.error("Error saving merged note:", error);
      toast({
        title: "Error",
        description: "Failed to save the merged note. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveNote = async () => {
    if (!noteTitle.trim()) {
      return;
    }

    setIsSaving(true);

    try {
      let imageUrl = null;
      if (capturedImage) {
        imageUrl = await uploadImageToStorage(capturedImage);
      }

      // Get or create subject ID
      const subjectId = await getOrCreateSubjectId(noteSubject);

      const today = new Date();
      const dateString = today.toISOString().split('T')[0];

      const newNote = {
        title: noteTitle,
        description: recognizedText.substring(0, 100) + (recognizedText.length > 100 ? "..." : ""),
        date: dateString,
        subject: noteSubject, // Use subject instead of category
        subject_id: subjectId, // Use proper subject ID
        content: recognizedText,
        sourceType: 'scan',
        scanData: {
          originalImageUrl: imageUrl,
          recognizedText: recognizedText,
          confidence: 0.8,
          language: selectedLanguage
        }
      };

      const success = await onSaveNote(newNote);
      if (success) {
        toast({
          title: "Success!",
          description: "Your scanned note has been saved successfully.",
        });
        resetForm();
      }
    } catch (error) {
      console.error("Error saving note:", error);
      toast({
        title: "Error",
        description: "Failed to save the note. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  if (processingMode === 'batch') {
    return (
      <div data-processing="true">
        <BatchProcessingView
          processedImages={processedImages}
          batchProgress={batchProgress}
          onSaveSeparate={saveBatchAsNotes}
          onSaveMerged={saveBatchAsMergedNote}
          onReset={resetForm}
          isSaving={isSaving}
          
        />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full max-h-[calc(70vh-120px)]">
      <ScrollArea className="flex-1">
        <div className="space-y-4">
          {!capturedImage ? (
            <div className="border-2 border-dashed border-gray-300 rounded-xl p-12 text-center hover:border-mint-400 transition-colors bg-gradient-to-br from-gray-50 to-white">
              <div className="space-y-4">
                <div className="mx-auto w-16 h-16 bg-gradient-to-br from-mint-100 to-mint-200 rounded-xl flex items-center justify-center shadow-sm">
                  <Camera className="h-8 w-8 text-mint-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Upload Images</h3>
                  <p className="text-sm text-gray-600 max-w-sm mx-auto">
                    Click to select or drag and drop images. PNG, JPG, JPEG, WebP supported. Single image or batch processing (up to 10 files)
                  </p>
                </div>
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={(e) => e.target.files && handleMultipleImages(Array.from(e.target.files))}
                  className="hidden"
                  id="image-input"
                />
                <label
                  htmlFor="image-input"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-mint-500 text-white rounded-lg cursor-pointer hover:bg-mint-600 transition-colors text-sm font-medium shadow-sm hover:shadow-md"
                >
                  <Camera className="h-4 w-4" />
                  Upload Images
                </label>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <ImageProcessor 
                imageUrl={capturedImage} 
                onReset={() => setCapturedImage(null)}
                onTextExtracted={setRecognizedText}
                selectedLanguage={selectedLanguage}
                onLanguageChange={setSelectedLanguage}
                isPremiumUser={isPremiumUser}
                onTitleGenerated={handleTitleGenerated}
                onSubjectGenerated={handleSubjectGenerated}
              />
              
              {recognizedText && (
                <NoteMetadataForm 
                  title={noteTitle}
                  setTitle={setNoteTitle}
                  subject={noteSubject}
                  setSubject={setNoteSubject}
                  isDisabled={false}
                  detectedLanguage={getLanguageName(selectedLanguage)}
                />
              )}
            </div>
          )}
        </div>
      </ScrollArea>

      {/* Fixed save button footer */}
      {capturedImage && recognizedText && noteTitle.trim() && (
        <div className="border-t pt-4 mt-4 bg-white">
          <Button
            onClick={handleSaveNote}
            disabled={isSaving}
            className="w-full bg-mint-500 hover:bg-mint-600 text-white"
          >
            {isSaving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <FileText className="mr-2 h-4 w-4" />
                Save Note
              </>
            )}
          </Button>
        </div>
      )}

      {/* Dialogs */}
      <PostSaveSuccessDialog
        isOpen={showSuccessDialog}
        onClose={() => setShowSuccessDialog(false)}
        savedCount={lastSaveResult.count}
        saveMode={lastSaveResult.mode}
        onScanMore={() => {
          setShowSuccessDialog(false);
          resetForm();
        }}
        onViewNotes={() => navigate('/notes')}
      />
    </div>
  );
};

const getLanguageName = (code: string): string => {
  const languages = {
    eng: "English",
    fra: "French",
    spa: "Spanish",
    deu: "German",
    chi_sim: "Chinese",
    jpn: "Japanese"
  };
  
  return languages[code as keyof typeof languages] || code;
};
