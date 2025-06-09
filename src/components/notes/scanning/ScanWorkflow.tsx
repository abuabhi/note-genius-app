
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { FileText, Loader2, X, CheckCircle, AlertCircle } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CameraCapture } from "./CameraCapture";
import { ImageUpload } from "./ImageUpload";
import { ImageProcessor } from "./ImageProcessor";
import { NoteMetadataForm } from "./NoteMetadataForm";
import { useImageUpload } from "./hooks/useImageUpload";
import { Note } from "@/types/note";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

interface ScanWorkflowProps {
  onSaveNote: (note: Omit<Note, 'id'>) => Promise<boolean>;
  onClose: () => void;
  selectedLanguage: string;
  setSelectedLanguage: (language: string) => void;
  isPremiumUser?: boolean;
}

interface ProcessedImage {
  id: string;
  imageUrl: string;
  recognizedText: string;
  title: string;
  category: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  error?: string;
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
  const [processingMode, setProcessingMode] = useState<'single' | 'batch'>('single');
  const [processedImages, setProcessedImages] = useState<ProcessedImage[]>([]);
  const [batchProgress, setBatchProgress] = useState(0);
  
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
    setProcessingMode('single');
    setProcessedImages([]);
    setBatchProgress(0);
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

    if (imageFiles.length === 1) {
      // Single image processing
      const file = imageFiles[0];
      const reader = new FileReader();
      reader.onload = (event) => {
        const imageUrl = event.target?.result as string;
        handleImageCaptured(imageUrl);
        setActiveTab("upload");
      };
      reader.readAsDataURL(file);
    } else {
      // Multiple images - batch processing
      setProcessingMode('batch');
      processBatchImages(imageFiles);
    }
  };

  const processBatchImages = async (files: File[]) => {
    const batchImages: ProcessedImage[] = files.map((file, index) => ({
      id: `batch-${index}-${Date.now()}`,
      imageUrl: '',
      recognizedText: '',
      title: file.name.replace(/\.[^/.]+$/, ''),
      category: 'Scanned Documents',
      status: 'pending'
    }));

    setProcessedImages(batchImages);

    // Process images concurrently (3 at a time)
    const batchSize = 3;
    let completed = 0;

    for (let i = 0; i < files.length; i += batchSize) {
      const batch = files.slice(i, i + batchSize);
      const batchIndices = Array.from({ length: batch.length }, (_, idx) => i + idx);

      const batchPromises = batch.map(async (file, batchIdx) => {
        const imageIndex = batchIndices[batchIdx];
        
        try {
          // Update status to processing
          setProcessedImages(prev => prev.map((img, idx) => 
            idx === imageIndex ? { ...img, status: 'processing' } : img
          ));

          // Convert file to data URL
          const reader = new FileReader();
          const imageUrl = await new Promise<string>((resolve) => {
            reader.onload = (event) => resolve(event.target?.result as string);
            reader.readAsDataURL(file);
          });

          // Upload to storage
          const storageUrl = await uploadImageToStorage(imageUrl);

          // Process with OCR
          const response = await fetch('/api/process-image', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              imageUrl: storageUrl,
              language: selectedLanguage,
              useOpenAI: isPremiumUser
            })
          });

          if (!response.ok) {
            throw new Error('Failed to process image');
          }

          const result = await response.json();

          // Update with results
          setProcessedImages(prev => prev.map((img, idx) => 
            idx === imageIndex ? {
              ...img,
              imageUrl: storageUrl,
              recognizedText: result.text || '',
              status: 'completed'
            } : img
          ));

        } catch (error) {
          // Update with error
          setProcessedImages(prev => prev.map((img, idx) => 
            idx === imageIndex ? {
              ...img,
              status: 'failed',
              error: error instanceof Error ? error.message : 'Processing failed'
            } : img
          ));
        }

        completed++;
        setBatchProgress((completed / files.length) * 100);
      });

      await Promise.allSettled(batchPromises);
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
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-medium">Batch Processing ({processedImages.length} images)</h3>
          <Button variant="outline" onClick={resetForm}>
            <X className="h-4 w-4 mr-2" />
            Cancel
          </Button>
        </div>

        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Overall Progress</span>
            <span>{Math.round(batchProgress)}%</span>
          </div>
          <Progress value={batchProgress} className="w-full" />
        </div>

        <div className="space-y-2 max-h-60 overflow-y-auto">
          {processedImages.map((image, index) => (
            <Card key={image.id}>
              <CardContent className="p-3">
                <div className="flex items-center gap-3">
                  <div className="flex-shrink-0">
                    {image.status === 'completed' && <CheckCircle className="h-5 w-5 text-green-500" />}
                    {image.status === 'failed' && <AlertCircle className="h-5 w-5 text-red-500" />}
                    {image.status === 'processing' && (
                      <div className="h-5 w-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                    )}
                    {image.status === 'pending' && <div className="h-5 w-5 bg-gray-300 rounded-full" />}
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-sm">{image.title}</p>
                    {image.status === 'completed' && (
                      <p className="text-xs text-gray-500">
                        {image.recognizedText.substring(0, 50)}...
                      </p>
                    )}
                    {image.status === 'failed' && (
                      <p className="text-xs text-red-500">{image.error}</p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {batchProgress === 100 && (
          <div className="flex gap-2">
            <Button 
              onClick={saveBatchAsNotes}
              disabled={isSaving || processedImages.filter(img => img.status === 'completed').length === 0}
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
                  Save {processedImages.filter(img => img.status === 'completed').length} Notes
                </>
              )}
            </Button>
            <Button variant="outline" onClick={resetForm}>
              Start Over
            </Button>
          </div>
        )}
      </div>
    );
  }

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
                  Drop your images here to scan
                </p>
                <p className="text-sm text-purple-500">
                  Single image: Standard processing • Multiple images: Batch processing
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
                  💡 Tip: Drop a single image for standard processing, or multiple images for batch processing
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
