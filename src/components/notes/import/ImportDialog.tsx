import { useState } from "react";
import { 
  Sheet, 
  SheetContent, 
  SheetDescription, 
  SheetHeader, 
  SheetTitle, 
  SheetTrigger 
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { FileUp } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Note } from "@/types/note";
import { ProcessedDocumentPreview } from "./ProcessedDocumentPreview";
import { useImportState } from "./hooks/useImportState";
import { processSelectedDocument } from "./importUtils";
import { ImportTabs } from "./tabs/ImportTabs";
import { ImportDialogFooter } from "./ImportDialogFooter";

interface ImportDialogProps {
  onSaveNote: (note: Omit<Note, 'id'>) => Promise<boolean>;
}

export const ImportDialog = ({ onSaveNote }: ImportDialogProps) => {
  const [activeTab, setActiveTab] = useState("file");
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();
  
  const { 
    importState,
    setSelectedFile,
    setFileType,
    setFileUrl,
    setExtractedText,
    setDocumentTitle,
    setDocumentMetadata,
    resetState
  } = useImportState();

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
    if (!importState.selectedFile && !importState.fileType) {
      toast({
        title: "No Document Selected",
        description: "Please select a document to import.",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);

    try {
      const result = await processSelectedDocument(
        importState.selectedFile, 
        importState.fileType
      );
      
      if (result.fileUrl) setFileUrl(result.fileUrl);
      setExtractedText(result.text);
      setDocumentTitle(result.title);
      
      if (result.metadata) {
        setDocumentMetadata(result.metadata);
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
    if (!importState.extractedText) {
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
        title: importState.documentTitle || "Imported Document",
        description: importState.extractedText.substring(0, 100) + (importState.extractedText.length > 100 ? "..." : ""),
        date: dateString,
        category: "Imported",
        content: importState.extractedText,
        sourceType: 'import',
        importData: {
          originalFileUrl: importState.fileUrl,
          fileType: importState.fileType || 'unknown',
          importedAt: today.toISOString()
        }
      };

      await onSaveNote(newNote);
      resetState();
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
        resetState();
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
            Import notes from PDF, Word, Notion, OneNote, Evernote, or Google Docs.
          </SheetDescription>
        </SheetHeader>
        
        {!importState.extractedText ? (
          <ImportTabs 
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            onFileSelected={handleFileSelected}
            onApiImport={handleApiImport}
            selectedFile={importState.selectedFile}
            processDocument={processDocument}
            isProcessing={isProcessing}
          />
        ) : (
          <ProcessedDocumentPreview
            text={importState.extractedText}
            title={importState.documentTitle}
            setTitle={setDocumentTitle}
          />
        )}
        
        <ImportDialogFooter
          onSave={handleSaveImportedNote}
          hasContent={!!importState.extractedText}
          isSaving={isSaving}
        />
      </SheetContent>
    </Sheet>
  );
};
