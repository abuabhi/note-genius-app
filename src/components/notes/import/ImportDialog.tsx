
import { useState } from "react";
import { 
  Sheet, 
  SheetContent, 
  SheetDescription, 
  SheetFooter, 
  SheetHeader, 
  SheetTitle, 
  SheetTrigger 
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { FileUp, Loader2 } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { Note } from "@/types/note";
import { FileUpload } from "./FileUpload";
import { ApiImport } from "./ApiImport";
import { ProcessedDocumentPreview } from "./ProcessedDocumentPreview";
import { supabase } from "@/integrations/supabase/client";

interface ImportDialogProps {
  onSaveNote: (note: Omit<Note, 'id'>) => Promise<void>;
}

export const ImportDialog = ({ onSaveNote }: ImportDialogProps) => {
  const [activeTab, setActiveTab] = useState("file");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [fileUrl, setFileUrl] = useState<string | null>(null);
  const [fileType, setFileType] = useState<string | null>(null);
  const [extractedText, setExtractedText] = useState("");
  const [documentTitle, setDocumentTitle] = useState("");
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();

  const resetForm = () => {
    setSelectedFile(null);
    setFileUrl(null);
    setFileType(null);
    setExtractedText("");
    setDocumentTitle("");
    setActiveTab("file");
    setIsProcessing(false);
  };

  const uploadFileToStorage = async (file: File): Promise<string | null> => {
    try {
      // Get current user and generate path
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        throw new Error("User not authenticated");
      }
      
      const userId = session.user.id;
      const fileExt = file.name.split('.').pop();
      const fileName = `${userId}/${Date.now()}.${fileExt}`;
      
      // Upload to Supabase Storage
      const { data, error } = await supabase.storage
        .from('note_images')
        .upload(fileName, file);
      
      if (error) throw error;
      
      // Get the public URL
      const { data: urlData } = supabase.storage
        .from('note_images')
        .getPublicUrl(data.path);
      
      return urlData.publicUrl;
    } catch (error) {
      console.error('Error uploading file:', error);
      toast({
        title: "Upload Failed",
        description: "Could not upload file to storage.",
        variant: "destructive",
      });
      return null;
    }
  };

  const handleFileSelected = (file: File) => {
    setSelectedFile(file);
    const type = file.name.split('.').pop()?.toLowerCase();
    setFileType(type || null);
  };

  const handleApiImport = (type: string, content: string) => {
    setFileType(type);
    setExtractedText(content);
    setDocumentTitle(`Imported ${type.charAt(0).toUpperCase() + type.slice(1)} Note`);
  };

  const processDocument = async () => {
    if (!selectedFile && !fileType) {
      toast({
        title: "No Document Selected",
        description: "Please select a document to import.",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);

    try {
      // If we have a file, upload it first
      if (selectedFile) {
        const uploadedUrl = await uploadFileToStorage(selectedFile);
        if (!uploadedUrl) {
          throw new Error("Failed to upload file");
        }
        setFileUrl(uploadedUrl);

        // Call our edge function to process the document
        const { data: { session } } = await supabase.auth.getSession();
        const userId = session?.user.id;

        const response = await supabase.functions.invoke('process-document', {
          body: {
            fileUrl: uploadedUrl,
            fileType: fileType,
            userId: userId
          }
        });

        if (response.error) {
          throw new Error(response.error.message || 'Error processing document');
        }

        setExtractedText(response.data.text);
        setDocumentTitle(response.data.title);
      }
    } catch (error) {
      console.error('Error processing document:', error);
      toast({
        title: "Processing Failed",
        description: error instanceof Error ? error.message : "Failed to process document",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSaveImportedNote = async () => {
    if (!extractedText) {
      toast({
        title: "No Content",
        description: "There is no content to save.",
        variant: "destructive",
      });
      return;
    }

    setIsSaving(true);

    try {
      const today = new Date();
      const dateString = today.toISOString().split('T')[0];

      const newNote: Omit<Note, 'id'> = {
        title: documentTitle || "Imported Document",
        description: extractedText.substring(0, 100) + (extractedText.length > 100 ? "..." : ""),
        date: dateString,
        category: "Imported",
        content: extractedText,
        sourceType: 'import',
        importData: {
          originalFileUrl: fileUrl,
          fileType: fileType || 'unknown',
          importedAt: today.toISOString()
        }
      };

      await onSaveNote(newNote);
      resetForm();
      setIsSheetOpen(false);
      
      toast({
        title: "Document Imported",
        description: "Your document has been successfully imported as a note.",
      });
    } catch (error) {
      console.error("Error saving imported note:", error);
      toast({
        title: "Error",
        description: "Failed to save the imported note. Please try again.",
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
          <FileUp className="mr-2 h-4 w-4" />
          Import
        </Button>
      </SheetTrigger>
      <SheetContent className="w-full sm:max-w-lg md:max-w-xl overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Import Document</SheetTitle>
          <SheetDescription>
            Import notes from PDF, Word, Apple Notes, Notion, or OneNote.
          </SheetDescription>
        </SheetHeader>
        
        {!extractedText ? (
          <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-4">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="file">File Import</TabsTrigger>
              <TabsTrigger value="api">API Import</TabsTrigger>
            </TabsList>
            
            <TabsContent value="file" className="min-h-[300px] flex flex-col items-center justify-center">
              <FileUpload 
                onFileSelected={handleFileSelected}
                acceptedTypes=".pdf,.docx,.doc"
                selectedFile={selectedFile}
              />
              
              {selectedFile && (
                <Button 
                  onClick={processDocument} 
                  disabled={isProcessing} 
                  className="mt-4"
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>Process Document</>
                  )}
                </Button>
              )}
            </TabsContent>
            
            <TabsContent value="api" className="min-h-[300px]">
              <ApiImport onImport={handleApiImport} />
            </TabsContent>
          </Tabs>
        ) : (
          <ProcessedDocumentPreview
            text={extractedText}
            title={documentTitle}
            setTitle={setDocumentTitle}
          />
        )}
        
        <SheetFooter className="mt-4">
          <Button
            onClick={handleSaveImportedNote}
            disabled={!extractedText || isSaving}
          >
            {isSaving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>Save as Note</>
            )}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
};
