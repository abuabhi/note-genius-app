
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { FileText, Loader2 } from "lucide-react";
import { ImageProcessor } from "./ImageProcessor";
import { NoteMetadataForm } from "./NoteMetadataForm";
import { useImageUpload } from "./hooks/useImageUpload";
import { useDragAndDrop } from "./hooks/useDragAndDrop";
import { useBatchProcessing } from "./hooks/useBatchProcessing";
import { BatchProcessingView } from "./BatchProcessingView";
import { SingleImageCapture } from "./SingleImageCapture";
import { Note } from "@/types/note";

interface ScanWorkflowProps {
  onSaveNote: (note: Omit<Note, 'id'>) => Promise<boolean>;
  onClose: () => void;
  selectedLanguage: string;
  setSelectedLanguage: (language: string) => void;
  isPremiumUser?: boolean;
}

export const ScanWorkflow = ({ 
  onSaveNote, 
  onClose, 
  selectedLanguage,
  setSelectedLanguage,
  isPremiumUser = false
}: ScanWorkflowProps) => {
  const [activeTab, setActiveTab] = useState("camera");
  const [recognizedText, setRecognizedText] = useState("");
  const [noteTitle, setNoteTitle] = useState("");
  const [noteCategory, setNoteCategory] = useState("Uncategorized");
  const [isSaving, setIsSaving] = useState(false);
  const [processingMode, setProcessingMode] = useState<'single' | 'batch'>('single');
  
  const { 
    capturedImage, 
    setCapturedImage, 
    uploadImageToStorage, 
    handleImageCaptured 
  } = useImageUpload();

  const { isDragOver, handleDragOver, handleDragLeave, handleDrop } = useDragAndDrop();

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
    setActiveTab("camera");
    setProcessingMode('single');
    resetBatchProcessing();
  };

  const handleSingleImage = (imageUrl: string) => {
    handleImageCaptured(imageUrl);
    setActiveTab("upload");
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
        const note: Omit<Note, 'id'> = {
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
      onClose();
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
      // First upload the image to storage
      let imageUrl = null;
      if (capturedImage) {
        imageUrl = await uploadImageToStorage(capturedImage);
      }

      const today = new Date();
      const dateString = today.toISOString().split('T')[0];

      const newNote: Omit<Note, 'id'> = {
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
        onClose();
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
    <>
      {isDragOver && (
        <div className="fixed inset-0 bg-purple-100 bg-opacity-75 flex items-center justify-center z-50 pointer-events-none">
          <div className="bg-white p-8 rounded-lg shadow-lg text-center">
            <FileText className="h-16 w-16 text-purple-500 mx-auto mb-4" />
            <p className="text-lg font-medium text-purple-700">
              Drop your images here to scan
            </p>
            <p className="text-sm text-purple-500">
              Single image: Standard processing • Multiple images: Batch processing (up to 3 concurrent)
            </p>
          </div>
        </div>
      )}

      {!capturedImage ? (
        <SingleImageCapture
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          onImageCaptured={handleSingleImage}
          onMultipleImages={handleMultipleImages}
          isDragOver={isDragOver}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDropEvent}
        />
      ) : (
        <div className="mt-4 space-y-4">
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
        </div>
      )}
      
      <div className="mt-4 flex justify-end">
        <Button
          onClick={handleSaveNote}
          disabled={!capturedImage || !recognizedText || !noteTitle || isSaving}
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
              Save Note
            </>
          )}
        </Button>
      </div>
    </>
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
