
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { FileText, Loader2 } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CameraCapture } from "./CameraCapture";
import { ImageUpload } from "./ImageUpload";
import { ImageProcessor } from "./ImageProcessor";
import { NoteMetadataForm } from "./NoteMetadataForm";
import { useImageUpload } from "./hooks/useImageUpload";
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
  const [isDragOver, setIsDragOver] = useState(false);
  
  const { 
    capturedImage, 
    setCapturedImage, 
    uploadImageToStorage, 
    handleImageCaptured 
  } = useImageUpload();

  const resetForm = () => {
    setCapturedImage(null);
    setRecognizedText("");
    setNoteTitle("");
    setNoteCategory("Uncategorized");
    setActiveTab("camera");
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);

    const files = Array.from(e.dataTransfer.files);
    const imageFiles = files.filter(file => file.type.startsWith('image/'));
    
    if (imageFiles.length === 0) {
      return;
    }

    const file = imageFiles[0]; // Take the first image file
    const reader = new FileReader();
    reader.onload = (event) => {
      const imageUrl = event.target?.result as string;
      handleImageCaptured(imageUrl);
      setActiveTab("upload"); // Switch to upload tab to show the processed image
    };
    reader.readAsDataURL(file);
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
          confidence: 0.8, // Simulated confidence score
          language: selectedLanguage // Store the selected language
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

  return (
    <>
      {!capturedImage ? (
        <div
          className={`transition-all duration-200 ${isDragOver ? 'bg-purple-50 border-purple-200' : ''}`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          {isDragOver && (
            <div className="fixed inset-0 bg-purple-100 bg-opacity-75 flex items-center justify-center z-50 pointer-events-none">
              <div className="bg-white p-8 rounded-lg shadow-lg text-center">
                <FileText className="h-16 w-16 text-purple-500 mx-auto mb-4" />
                <p className="text-lg font-medium text-purple-700">
                  Drop your image here to scan
                </p>
                <p className="text-sm text-purple-500">
                  Supports PNG, JPG, JPEG formats
                </p>
              </div>
            </div>
          )}
          
          <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-4">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="camera">Camera</TabsTrigger>
              <TabsTrigger value="upload">Upload / Drop</TabsTrigger>
            </TabsList>
            
            <TabsContent value="camera" className="min-h-[300px] flex items-center justify-center">
              <CameraCapture 
                onImageCaptured={handleImageCaptured}
                isActive={activeTab === "camera" && !capturedImage}
              />
            </TabsContent>
            
            <TabsContent value="upload" className="min-h-[300px] flex items-center justify-center">
              <div className="w-full">
                <div className={`transition-all duration-200 ${isDragOver ? 'border-purple-500 bg-purple-50' : ''}`}>
                  <ImageUpload onImageUploaded={handleImageCaptured} />
                </div>
                <p className="text-center text-sm text-gray-500 mt-4">
                  💡 Tip: You can also drag and drop images anywhere on this page
                </p>
              </div>
            </TabsContent>
          </Tabs>
        </div>
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
