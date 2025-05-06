
import { useState } from "react";
import { Sheet, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Camera, FileText } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { Note } from "@/types/note";
import { CameraCapture } from "./scanning/CameraCapture";
import { ImageUpload } from "./scanning/ImageUpload";
import { ImageProcessor } from "./scanning/ImageProcessor";
import { NoteMetadataForm } from "./scanning/NoteMetadataForm";

interface ScanNoteDialogProps {
  onSaveNote: (note: Note) => void;
}

export const ScanNoteDialog = ({ onSaveNote }: ScanNoteDialogProps) => {
  const [activeTab, setActiveTab] = useState("camera");
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [recognizedText, setRecognizedText] = useState("");
  const [noteTitle, setNoteTitle] = useState("");
  const [noteCategory, setNoteCategory] = useState("Uncategorized");
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const { toast } = useToast();

  const handleImageCaptured = (imageUrl: string) => {
    setCapturedImage(imageUrl);
  };

  const resetForm = () => {
    setCapturedImage(null);
    setRecognizedText("");
    setNoteTitle("");
    setNoteCategory("Uncategorized");
    setActiveTab("camera");
  };

  const handleSaveNote = () => {
    if (!noteTitle.trim()) {
      toast({
        title: "Title Required",
        description: "Please add a title for your note.",
        variant: "destructive",
      });
      return;
    }

    const today = new Date();
    const dateString = today.toISOString().split('T')[0];

    const newNote: Note = {
      id: Date.now().toString(),
      title: noteTitle,
      description: recognizedText.substring(0, 100) + (recognizedText.length > 100 ? "..." : ""),
      date: dateString,
      category: noteCategory,
      content: recognizedText,
      sourceType: 'scan',
      scanData: {
        originalImageUrl: capturedImage,
        recognizedText: recognizedText,
        confidence: 0.8, // Simulated confidence score
      }
    };

    onSaveNote(newNote);
    resetForm();
    setIsSheetOpen(false);
    
    toast({
      title: "Note Created",
      description: "Your handwritten note has been converted and saved.",
    });
  };

  return (
    <Sheet open={isSheetOpen} onOpenChange={(open) => {
      setIsSheetOpen(open);
      if (!open) {
        resetForm();
      }
    }}>
      <SheetTrigger asChild>
        <Button>
          <Camera className="mr-2 h-4 w-4" />
          Scan Note
        </Button>
      </SheetTrigger>
      <SheetContent className="w-full sm:max-w-lg md:max-w-xl overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Scan Handwritten Note</SheetTitle>
          <SheetDescription>
            Capture or upload a photo of your handwritten notes to convert them to digital text.
          </SheetDescription>
        </SheetHeader>
        
        {!capturedImage ? (
          <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-4">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="camera">Camera</TabsTrigger>
              <TabsTrigger value="upload">Upload</TabsTrigger>
            </TabsList>
            
            <TabsContent value="camera" className="min-h-[300px] flex items-center justify-center">
              <CameraCapture 
                onImageCaptured={handleImageCaptured}
                isActive={activeTab === "camera" && !capturedImage && isSheetOpen}
              />
            </TabsContent>
            
            <TabsContent value="upload" className="min-h-[300px] flex items-center justify-center">
              <ImageUpload onImageUploaded={handleImageCaptured} />
            </TabsContent>
          </Tabs>
        ) : (
          <div className="mt-4 space-y-4">
            <ImageProcessor 
              imageUrl={capturedImage} 
              onReset={() => setCapturedImage(null)}
              onTextExtracted={setRecognizedText}
            />
            
            {recognizedText && (
              <NoteMetadataForm 
                title={noteTitle}
                setTitle={setNoteTitle}
                category={noteCategory}
                setCategory={setNoteCategory}
                isDisabled={!capturedImage || !recognizedText}
              />
            )}
          </div>
        )}
        
        <SheetFooter className="mt-4">
          <Button
            onClick={handleSaveNote}
            disabled={!capturedImage || !recognizedText || !noteTitle}
          >
            <FileText className="mr-2 h-4 w-4" />
            Save Note
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
};
