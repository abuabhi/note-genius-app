
import React, { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Upload } from "lucide-react";
import { Note } from "@/types/note";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { FileDropZone } from "./components/FileDropZone";
import { SelectedFileCard } from "./components/SelectedFileCard";
import { ProcessingOptions } from "./components/ProcessingOptions";
import { ProcessedContent } from "./components/ProcessedContent";

interface FileImportTabProps {
  onSaveNote: (note: Omit<Note, 'id'>) => Promise<boolean>;
  isPremiumUser?: boolean;
}

export const FileImportTab = ({ onSaveNote, isPremiumUser }: FileImportTabProps) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [processedText, setProcessedText] = useState<string>('');
  const [documentTitle, setDocumentTitle] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [processingMethod, setProcessingMethod] = useState<string>('');
  const [forceOCR, setForceOCR] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);

  const handleFileSelected = (file: File) => {
    if (file) {
      setSelectedFile(file);
      setDocumentTitle(file.name.replace(/\.[^/.]+$/, "")); // Remove extension
      setProcessedText(''); // Clear previous content
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      const file = files[0];
      
      // Check if file type is supported
      const supportedTypes = ['.pdf', '.docx', '.doc', '.txt', '.md', '.png', '.jpg', '.jpeg'];
      const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase();
      
      if (supportedTypes.includes(fileExtension)) {
        handleFileSelected(file);
      } else {
        toast.error("Unsupported file type. Please select a PDF, Word document, text file, or image.");
      }
    }
  };

  const processDocument = async () => {
    if (!selectedFile) return;

    setIsProcessing(true);
    try {
      console.log('Starting document processing for:', selectedFile.name);
      
      // Upload file to Supabase storage first
      const fileExt = selectedFile.name.split('.').pop();
      const fileName = `${Date.now()}.${fileExt}`;
      const filePath = `documents/${fileName}`;

      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('documents')
        .upload(filePath, selectedFile);

      if (uploadError) {
        console.error('Upload error:', uploadError);
        throw new Error(`Failed to upload file: ${uploadError.message}`);
      }

      console.log('File uploaded successfully:', uploadData);

      // Get the public URL for the uploaded file
      const { data: { publicUrl } } = supabase.storage
        .from('documents')
        .getPublicUrl(filePath);

      console.log('File URL:', publicUrl);

      // Determine file type
      const fileType = selectedFile.type === 'application/pdf' ? 'pdf' : 
                      selectedFile.type.includes('word') || selectedFile.name.endsWith('.docx') ? 'docx' :
                      selectedFile.type.includes('text') ? 'txt' : 'unknown';

      console.log('Processing file type:', fileType, 'Force OCR:', forceOCR);

      // Call the document processing edge function
      const { data: processData, error: processError } = await supabase.functions.invoke('process-document', {
        body: {
          fileUrl: publicUrl,
          fileType: fileType,
          userId: (await supabase.auth.getUser()).data.user?.id,
          useOCR: forceOCR
        }
      });

      if (processError) {
        console.error('Processing error:', processError);
        throw new Error(`Failed to process document: ${processError.message}`);
      }

      console.log('Document processed successfully:', processData);

      if (processData?.success) {
        setProcessedText(processData.text || 'No text content extracted');
        setDocumentTitle(processData.title || documentTitle);
        setProcessingMethod(processData.metadata?.processingMethod || 'unknown');
        
        const method = processData.metadata?.processingMethod || 'standard';
        if (method.includes('ocr')) {
          toast.success("Document processed with OCR!");
        } else if (method === 'text-extraction') {
          toast.success("Document processed with text extraction!");
        } else {
          toast.success("Document processed successfully!");
        }
      } else {
        throw new Error(processData?.error || 'Unknown processing error');
      }

      // Clean up the uploaded file after processing
      await supabase.storage.from('documents').remove([filePath]);
      
    } catch (error) {
      console.error('Error processing document:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      toast.error(`Failed to process document: ${errorMessage}`);
      setProcessedText(`Error processing document: ${errorMessage}`);
    } finally {
      setIsProcessing(false);
    }
  };

  const saveAsNote = async () => {
    if (!processedText || !documentTitle) return;

    setIsSaving(true);
    try {
      const note: Omit<Note, 'id'> = {
        title: documentTitle,
        content: processedText,
        description: `Imported from ${selectedFile?.name || 'document'}`,
        tags: [{ name: 'Import', color: '#8B5CF6' }],
        sourceType: 'import',
        pinned: false,
        archived: false,
        date: new Date().toISOString().split('T')[0],
        category: 'Documents'
      };

      const success = await onSaveNote(note);
      if (success) {
        toast.success("Note saved successfully!");
        // Reset form
        setSelectedFile(null);
        setProcessedText('');
        setDocumentTitle('');
      }
    } catch (error) {
      console.error('Error saving note:', error);
      toast.error("Failed to save note");
    } finally {
      setIsSaving(false);
    }
  };

  const clearSelectedFile = () => {
    setSelectedFile(null);
    setProcessedText('');
    setDocumentTitle('');
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5" />
            Document Processing
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {!selectedFile ? (
            <FileDropZone
              onFileSelected={handleFileSelected}
              isDragOver={isDragOver}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
            />
          ) : (
            <SelectedFileCard
              file={selectedFile}
              onClear={clearSelectedFile}
            />
          )}

          <ProcessingOptions
            fileType={selectedFile?.type || ''}
            forceOCR={forceOCR}
            onForceOCRChange={setForceOCR}
          />

          {selectedFile && (
            <Button 
              onClick={processDocument}
              disabled={isProcessing}
              className="w-full"
            >
              {isProcessing ? 'Processing Document...' : 'Extract Text'}
            </Button>
          )}

          {processedText && (
            <ProcessedContent
              processedText={processedText}
              documentTitle={documentTitle}
              processingMethod={processingMethod}
              onTitleChange={setDocumentTitle}
              onSave={saveAsNote}
              isSaving={isSaving}
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
};
