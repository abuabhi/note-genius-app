
import { useState } from "react";
import { Sheet, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Camera, FileText, Loader2 } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { Note } from "@/types/note";
import { CameraCapture } from "./scanning/CameraCapture";
import { ImageUpload } from "./scanning/ImageUpload";
import { ImageProcessor } from "./scanning/ImageProcessor";
import { NoteMetadataForm } from "./scanning/NoteMetadataForm";
import { supabase } from "@/integrations/supabase/client";

interface ScanNoteDialogProps {
  onSaveNote: (note: Omit<Note, 'id'>) => Promise<void>;
}

export const ScanNoteDialog = ({ onSaveNote }: ScanNoteDialogProps) => {
  const [activeTab, setActiveTab] = useState("camera");
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [recognizedText, setRecognizedText] = useState("");
  const [noteTitle, setNoteTitle] = useState("");
  const [noteCategory, setNoteCategory] = useState("Uncategorized");
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
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

  const uploadImageToStorage = async (imageUrl: string): Promise<string | null> => {
    try {
      // Extract base64 data
      const base64Data = imageUrl.split(',')[1];
      
      // Convert to Blob
      const byteCharacters = atob(base64Data);
      const byteArrays = [];
      
      for (let offset = 0; offset < byteCharacters.length; offset += 1024) {
        const slice = byteCharacters.slice(offset, offset + 1024);
        const byteNumbers = new Array(slice.length);
        for (let i = 0; i < slice.length; i++) {
          byteNumbers[i] = slice.charCodeAt(i);
        }
        const byteArray = new Uint8Array(byteNumbers);
        byteArrays.push(byteArray);
      }
      
      const blob = new Blob(byteArrays, { type: 'image/png' });
      
      // Get current user and generate path
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        throw new Error("User not authenticated");
      }
      
      const userId = session.user.id;
      const fileName = `${userId}/${Date.now()}.png`;
      
      // Upload to Supabase Storage
      const { data, error } = await supabase.storage
        .from('note_images')
        .upload(fileName, blob);
      
      if (error) throw error;
      
      // Get the public URL
      const { data: urlData } = supabase.storage
        .from('note_images')
        .getPublicUrl(data.path);
      
      return urlData.publicUrl;
    } catch (error) {
      console.error('Error uploading image:', error);
      toast({
        title: "Upload Failed",
        description: "Could not upload image to storage.",
        variant: "destructive",
      });
      return null;
    }
  };

  const handleSaveNote = async () => {
    if (!noteTitle.trim()) {
      toast({
        title: "Title Required",
        description: "Please add a title for your note.",
        variant: "destructive",
      });
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
        }
      };

      await onSaveNote(newNote);
      resetForm();
      setIsSheetOpen(false);
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
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
};
