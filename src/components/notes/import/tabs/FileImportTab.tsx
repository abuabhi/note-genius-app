
import React, { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, Upload, FileImage, File, X } from "lucide-react";
import { Note } from "@/types/note";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

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
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelected = (file: File) => {
    if (file) {
      setSelectedFile(file);
      setDocumentTitle(file.name.replace(/\.[^/.]+$/, "")); // Remove extension
      setProcessedText(''); // Clear previous content
    }
  };

  const handleInputFileSelected = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      handleFileSelected(file);
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

  const handleDropZoneClick = () => {
    fileInputRef.current?.click();
  };

  const getFileIcon = (file: File) => {
    if (file.type === 'application/pdf') return <FileText className="h-5 w-5 text-red-500" />;
    if (file.type.includes('image/')) return <FileImage className="h-5 w-5 text-blue-500" />;
    if (file.type.includes('text/')) return <FileText className="h-5 w-5 text-green-500" />;
    return <File className="h-5 w-5 text-gray-500" />;
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
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
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
            <div
              className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
                isDragOver 
                  ? 'border-purple-500 bg-purple-50' 
                  : 'border-gray-300 hover:border-purple-400 hover:bg-gray-50'
              }`}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={handleDropZoneClick}
            >
              <Upload className="h-12 w-12 mx-auto mb-4 text-gray-400" />
              <p className="text-lg font-medium text-gray-700 mb-2">
                Drop your document here or click to browse
              </p>
              <p className="text-sm text-gray-500">
                Supports PDF, Word documents, text files, and images
              </p>
              <Input
                ref={fileInputRef}
                type="file"
                onChange={handleInputFileSelected}
                accept=".pdf,.docx,.doc,.txt,.md,.png,.jpg,.jpeg"
                className="hidden"
              />
            </div>
          ) : (
            <Card className="bg-gray-50">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {getFileIcon(selectedFile)}
                    <div>
                      <p className="font-medium">{selectedFile.name}</p>
                      <p className="text-sm text-gray-500">
                        {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={clearSelectedFile}
                    className="text-gray-500 hover:text-red-500"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {selectedFile?.type === 'application/pdf' && (
            <div className="flex items-center space-x-2 p-3 bg-blue-50 rounded-lg">
              <input
                type="checkbox"
                id="force-ocr"
                checked={forceOCR}
                onChange={(e) => setForceOCR(e.target.checked)}
                className="rounded"
              />
              <Label htmlFor="force-ocr" className="text-sm">
                Force OCR processing (for handwritten or scanned PDFs)
              </Label>
            </div>
          )}

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
            <div className="space-y-4">
              {processingMethod && (
                <div className="text-xs text-gray-600 bg-gray-100 p-2 rounded">
                  Processing method: {processingMethod}
                </div>
              )}
              
              <div>
                <Label htmlFor="title">Document Title</Label>
                <Input
                  id="title"
                  type="text"
                  value={documentTitle}
                  onChange={(e) => setDocumentTitle(e.target.value)}
                  placeholder="Enter a title for your note"
                  className="mt-1"
                />
              </div>
              
              <div>
                <Label>Content Preview</Label>
                <div className="border border-gray-200 rounded p-4 max-h-60 overflow-y-auto bg-gray-50 mt-1">
                  <pre className="whitespace-pre-wrap text-sm">{processedText}</pre>
                </div>
              </div>
              
              <Button
                onClick={saveAsNote}
                disabled={isSaving || !documentTitle}
                className="w-full bg-purple-600 hover:bg-purple-700"
              >
                {isSaving ? 'Saving...' : 'Save as Note'}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
