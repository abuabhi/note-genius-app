
import { useState } from "react";
import { Note } from "@/types/note";
import { uploadFileToStorage, processSelectedDocument } from "./importUtils";

export const useImportState = (
  onSaveNote: (note: Omit<Note, 'id'>) => Promise<boolean>,
  onComplete?: () => void
) => {
  // Tab state
  const [activeTab, setActiveTab] = useState("file");
  
  // File state
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  
  // Processed content state
  const [processedText, setProcessedText] = useState<string | null>(null);
  const [documentTitle, setDocumentTitle] = useState("");
  const [fileUrl, setFileUrl] = useState<string | null>(null);
  const [fileType, setFileType] = useState<string | null>(null);
  
  // Loading states
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Handle file selection
  const handleFileSelected = (file: File) => {
    setSelectedFile(file);
    setProcessedText(null);
    setDocumentTitle(file.name.split('.')[0] || "Imported Document");
    setFileType(file.name.split('.').pop()?.toLowerCase() || null);
  };

  // Handle API import
  const handleApiImport = (type: string, content: string) => {
    setProcessedText(content);
    setDocumentTitle(`Imported from ${type}`);
    setFileType(type);
    setSelectedFile(null);
  };

  // Process the selected document
  const processDocument = async () => {
    if (!selectedFile && !fileType) return;
    
    setIsProcessing(true);
    
    try {
      const result = await processSelectedDocument(selectedFile, fileType || "unknown");
      setProcessedText(result.text);
      setDocumentTitle(result.title);
      setFileUrl(result.fileUrl);
    } catch (error) {
      console.error("Error processing document:", error);
      setProcessedText("Error processing document. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  // Save the processed document as a note
  const saveAsNote = async () => {
    if (!processedText) return;
    
    setIsSaving(true);
    
    try {
      const note: Omit<Note, 'id'> = {
        title: documentTitle,
        content: processedText,
        date: new Date().toISOString(),
        subject: "Imports",
        description: `Imported ${fileType ? `from ${fileType} file` : "document"}`,
        sourceType: "import",
        importData: {
          originalFileUrl: fileUrl || undefined,
          fileType: fileType || "unknown",
          importedAt: new Date().toISOString()
        }
      };
      
      const success = await onSaveNote(note);
      
      if (success && onComplete) {
        onComplete();
      }
    } catch (error) {
      console.error("Error saving note:", error);
    } finally {
      setIsSaving(false);
    }
  };

  return {
    activeTab,
    setActiveTab,
    selectedFile,
    setSelectedFile,
    processedText,
    setProcessedText,
    documentTitle,
    setDocumentTitle,
    fileUrl,
    setFileUrl,
    fileType,
    setFileType,
    isProcessing,
    setIsProcessing,
    isSaving,
    setIsSaving,
    handleFileSelected,
    handleApiImport,
    processDocument,
    saveAsNote
  };
};
