
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Camera } from 'lucide-react';
import { ImageUpload } from '../../scanning/ImageUpload';
import { useImageUpload } from '../../scanning/hooks/useImageUpload';
import { useDragAndDrop } from '../../scanning/hooks/useDragAndDrop';
import { useBatchProcessing } from '../../scanning/hooks/useBatchProcessing';
import { BatchProcessingView } from '../../scanning/BatchProcessingView';
import { ImageProcessor } from '../../scanning/ImageProcessor';
import { NoteMetadataForm } from '../../scanning/NoteMetadataForm';
import { Button } from '@/components/ui/button';
import { FileText, Loader2 } from 'lucide-react';

interface ScanImportTabProps {
  onSaveNote: (note: any) => Promise<boolean>;
  isPremiumUser?: boolean;
}

export const ScanImportTab = ({ onSaveNote, isPremiumUser }: ScanImportTabProps) => {
  const [selectedLanguage, setSelectedLanguage] = React.useState("eng");
  const [recognizedText, setRecognizedText] = React.useState("");
  const [noteTitle, setNoteTitle] = React.useState("");
  const [noteCategory, setNoteCategory] = React.useState("Uncategorized");
  const [isSaving, setIsSaving] = React.useState(false);
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
    setNoteCategory("Uncategorized");
    setProcessingMode('single');
    resetBatchProcessing();
    resetDragState();
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

  const saveBatchAsNotes = async () => {
    setIsSaving(true);
    const completedImages = processedImages.filter(img => img.status === 'completed');

    try {
      for (const image of completedImages) {
        const note = {
          title: image.title,
          description: image.recognizedText.substring(0, 100) + (image.recognizedText.length > 100 ? "..." : ""),
          date: new Date().toISOString().split('T')[0],
          category: image.category,
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

      resetForm();
    } catch (error) {
      console.error("Error saving batch notes:", error);
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

      const today = new Date();
      const dateString = today.toISOString().split('T')[0];

      const newNote = {
        title: noteTitle,
        description: recognizedText.substring(0, 100) + (recognizedText.length > 100 ? "..." : ""),
        date: dateString,
        category: noteCategory,
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
        resetForm();
      }
    } catch (error) {
      console.error("Error saving note:", error);
    } finally {
      setIsSaving(false);
    }
  };

  // Show batch processing view
  if (processingMode === 'batch') {
    return (
      <BatchProcessingView
        processedImages={processedImages}
        batchProgress={batchProgress}
        onSaveBatch={saveBatchAsNotes}
        onReset={resetForm}
        isSaving={isSaving}
      />
    );
  }

  return (
    <div className="space-y-6">
      <Card className="bg-white shadow-sm border border-gray-200">
        <CardHeader className="text-center pb-4">
          <div className="mx-auto w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center mb-3">
            <Camera className="h-6 w-6 text-gray-600" />
          </div>
          <CardTitle className="text-gray-800 text-lg font-semibold">Scan Documents</CardTitle>
          <p className="text-gray-600 text-sm mt-2">
            Capture or upload photos of handwritten notes and documents
          </p>
        </CardHeader>
        <CardContent className="pt-0">
          {!capturedImage ? (
            <div className="w-full">
              <ImageUpload 
                onImageUploaded={handleSingleImage} 
                onMultipleImagesUploaded={handleMultipleImages}
                isDragOver={isDragOver}
                onDragEnter={handleDragEnter}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDropEvent}
              />
            </div>
          ) : (
            <div className="space-y-6">
              <ImageProcessor 
                imageUrl={capturedImage} 
                onReset={() => setCapturedImage(null)}
                onTextExtracted={setRecognizedText}
                selectedLanguage={selectedLanguage}
                onLanguageChange={setSelectedLanguage}
                isPremiumUser={isPremiumUser}
              />
              
              {recognizedText && (
                <NoteMetadataForm 
                  title={noteTitle}
                  setTitle={setNoteTitle}
                  category={noteCategory}
                  setCategory={setNoteCategory}
                  isDisabled={!capturedImage || !recognizedText}
                  detectedLanguage={getLanguageName(selectedLanguage)}
                />
              )}

              <div className="flex justify-end">
                <Button
                  onClick={handleSaveNote}
                  disabled={!capturedImage || !recognizedText || !noteTitle || isSaving}
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
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

// Helper function to get the language name from the language code
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
