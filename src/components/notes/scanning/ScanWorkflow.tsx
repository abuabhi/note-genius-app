import { useState } from "react";
import { Button } from "@/components/ui/button";
import { FileText, Loader2 } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ImageProcessor } from "./ImageProcessor";
import { NoteMetadataForm } from "./NoteMetadataForm";
import { useImageUpload } from "./hooks/useImageUpload";
import { useDragAndDrop } from "./hooks/useDragAndDrop";
import { useBatchProcessing } from "./hooks/useBatchProcessing";
import { BatchProcessingView } from "./BatchProcessingView";
import { SingleImageCapture } from "./SingleImageCapture";
import { Note } from "@/types/note";
import { getOrCreateSubjectId } from "@/utils/subjectHelpers";

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
  const [activeTab, setActiveTab] = useState("upload");
  const [recognizedText, setRecognizedText] = useState("");
  const [noteTitle, setNoteTitle] = useState("");
  const [noteSubject, setNoteSubject] = useState("Uncategorized");
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
    setNoteSubject("Uncategorized");
    setActiveTab("upload");
    setProcessingMode('single');
    resetBatchProcessing();
    resetDragState();
  };

  const handleSingleImage = (imageUrl: string) => {
    console.log('Processing single image');
    handleImageCaptured(imageUrl);
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

  // Handle auto-generated title
  const handleTitleGenerated = (title: string) => {
    console.log('Auto-generated title:', title);
    if (!noteTitle || noteTitle === "") { // Only set if user hasn't manually entered a title
      setNoteTitle(title);
      console.log('Title set to:', title);
    }
  };

  // Handle auto-generated subject
  const handleSubjectGenerated = async (subject: string) => {
    console.log('Auto-generated subject:', subject);
    if (noteSubject === "Uncategorized") { // Only set if still default
      setNoteSubject(subject);
      console.log('Subject set to:', subject);
    }
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
          category: image.category, // This maps to the subject field in the database
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
    console.log('Save note clicked', { 
      noteTitle, 
      noteSubject, 
      capturedImage: !!capturedImage, 
      recognizedText: !!recognizedText 
    });
    
    if (!noteTitle.trim()) {
      console.log('No title provided, cannot save');
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
      console.log('Subject ID obtained:', subjectId);

      const today = new Date();
      const dateString = today.toISOString().split('T')[0];

      const newNote: Omit<Note, 'id'> = {
        title: noteTitle,
        description: recognizedText.substring(0, 100) + (recognizedText.length > 100 ? "..." : ""),
        date: dateString,
        category: noteSubject, // Keep for backward compatibility
        subject_id: subjectId, // Use the proper subject ID for relationships
        content: recognizedText,
        sourceType: 'scan',
        scanData: {
          originalImageUrl: imageUrl,
          recognizedText: recognizedText,
          confidence: 0.8,
          language: selectedLanguage
        }
      };

      console.log('Saving note with subject ID:', subjectId);
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

  // Debug logging
  console.log('ScanWorkflow render state:', {
    capturedImage: !!capturedImage,
    recognizedText: !!recognizedText,
    noteTitle,
    noteSubject,
    showSaveButton: !!(capturedImage && recognizedText && noteTitle.trim())
  });

  return (
    <div className="flex flex-col h-full">
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

      {/* Scrollable content area */}
      <ScrollArea className="flex-1 max-h-[calc(100vh-200px)]">
        <div className="p-1 space-y-4">
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
                  category={noteSubject}
                  setCategory={setNoteSubject}
                  isDisabled={false}
                  detectedLanguage={getLanguageName(selectedLanguage)}
                />
              )}
            </div>
          )}
        </div>
      </ScrollArea>
      
      {/* Fixed footer with Save button - Show when we have all required data */}
      {capturedImage && recognizedText && noteTitle.trim() && (
        <div className="flex-shrink-0 border-t p-4 bg-white">
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
