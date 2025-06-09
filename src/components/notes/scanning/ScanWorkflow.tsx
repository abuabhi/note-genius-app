
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
  const [activeTab, setActiveTab] = useState("upload"); // Default to upload for better UX
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
    setActiveTab("upload");
    setProcessingMode('single');
    resetBatchProcessing();
    resetDragState();
  };

  const handleSingleImage = (imageUrl: string) => {
    console.log('Processing single image');
    handleImageCaptured(imageUrl);
    // Don't force tab switch, let user stay where they are
  };

  const handleMultipleImages = (files: File[]) => {
    console.log(`Starting batch processing for ${files.length} images`);
    setProcessingMode('batch');
    processBatchImages(files);
  };

  const handleDropEvent = (e: React.DragEvent) => {
    console.log('Drop event triggered in ScanWorkflow');
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
    <div className="relative">
      {/* Global drag overlay */}
      {isDragOver && (
        <div className="fixed inset-0 bg-blue-100 bg-opacity-90 flex items-center justify-center z-50 pointer-events-none">
          <div className="bg-white p-8 rounded-xl shadow-xl text-center border-2 border-blue-300 border-dashed">
            <FileText className="h-20 w-20 text-blue-500 mx-auto mb-4 animate-pulse" />
            <p className="text-xl font-bold text-blue-700 mb-2">
              Drop Images to Scan
            </p>
            <p className="text-blue-600 max-w-sm">
              <strong>Single image:</strong> Standard OCR processing<br/>
              <strong>Multiple images:</strong> Batch processing (up to 3 concurrent)
            </p>
            <div className="mt-4 p-2 bg-blue-50 rounded-lg">
              <p className="text-sm text-blue-700 font-medium">
                ✨ Optimized for handwritten text recognition
              </p>
            </div>
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
          onDragEnter={handleDragEnter}
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
