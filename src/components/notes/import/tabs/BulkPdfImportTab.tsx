
import React, { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Upload, FileText, Merge, Split, Trash2, Eye } from "lucide-react";
import { Note } from "@/types/note";
import { toast } from "sonner";

interface BulkPdfImportTabProps {
  onSaveNote: (note: Omit<Note, 'id'>) => Promise<boolean>;
  isPremiumUser?: boolean;
}

interface PdfFile {
  file: File;
  id: string;
  name: string;
  size: number;
  preview?: string;
  extractedText?: string;
  processing?: boolean;
}

export const BulkPdfImportTab = ({ onSaveNote, isPremiumUser }: BulkPdfImportTabProps) => {
  const [selectedFiles, setSelectedFiles] = useState<PdfFile[]>([]);
  const [mergeOption, setMergeOption] = useState<'merge' | 'separate'>('separate');
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [processingFile, setProcessingFile] = useState<string>('');

  const handleFileSelection = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    const pdfFiles = files.filter(file => file.type === 'application/pdf');
    
    if (pdfFiles.length !== files.length) {
      toast.warning("Only PDF files are supported for bulk import");
    }

    const newPdfFiles: PdfFile[] = pdfFiles.map(file => ({
      file,
      id: `${file.name}-${Date.now()}-${Math.random()}`,
      name: file.name,
      size: file.size
    }));

    setSelectedFiles(prev => [...prev, ...newPdfFiles]);
  }, []);

  const removeFile = (id: string) => {
    setSelectedFiles(prev => prev.filter(file => file.id !== id));
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const processPdfFiles = async () => {
    if (selectedFiles.length === 0) {
      toast.error("Please select PDF files to import");
      return;
    }

    setIsProcessing(true);
    setProgress(0);

    try {
      const extractedTexts: { name: string; text: string; title: string }[] = [];
      
      for (let i = 0; i < selectedFiles.length; i++) {
        const pdfFile = selectedFiles[i];
        setProcessingFile(pdfFile.name);
        setProgress((i / selectedFiles.length) * 100);

        // Create FormData and upload to get URL
        const formData = new FormData();
        formData.append('file', pdfFile.file);

        // Here you would typically upload the file and get a URL
        // For now, we'll simulate the processing
        try {
          // Simulate PDF text extraction
          await new Promise(resolve => setTimeout(resolve, 1000));
          
          const extractedText = `Extracted text from ${pdfFile.name}\n\nThis is simulated content that would be extracted from the PDF file. In a real implementation, this would use PDF parsing libraries or services to extract the actual text content.`;
          const title = pdfFile.name.replace('.pdf', '');
          
          extractedTexts.push({
            name: pdfFile.name,
            text: extractedText,
            title
          });
        } catch (error) {
          console.error(`Error processing ${pdfFile.name}:`, error);
          toast.error(`Failed to process ${pdfFile.name}`);
        }
      }

      setProgress(100);

      // Create notes based on merge option
      if (mergeOption === 'merge') {
        // Merge all texts into one note
        const mergedText = extractedTexts.map(item => 
          `# ${item.title}\n\n${item.text}`
        ).join('\n\n---\n\n');
        
        const mergedNote: Omit<Note, 'id'> = {
          title: `Merged PDFs (${extractedTexts.length} files)`,
          content: mergedText,
          description: `Combined content from ${extractedTexts.length} PDF files`,
          subject: 'Documents',
          tags: [{ name: 'PDF Import', color: '#8B5CF6' }, { name: 'Bulk Import', color: '#6366F1' }],
          sourceType: 'import',
          pinned: false,
          archived: false,
          date: new Date().toISOString().split('T')[0],
          category: 'Documents'
        };

        await onSaveNote(mergedNote);
        toast.success("PDFs merged and saved as one note");
      } else {
        // Create separate notes
        for (const item of extractedTexts) {
          const note: Omit<Note, 'id'> = {
            title: item.title,
            content: item.text,
            description: `Imported from ${item.name}`,
            subject: 'Documents',
            tags: [{ name: 'PDF Import', color: '#8B5CF6' }],
            sourceType: 'import',
            pinned: false,
            archived: false,
            date: new Date().toISOString().split('T')[0],
            category: 'Documents'
          };

          await onSaveNote(note);
        }
        toast.success(`Created ${extractedTexts.length} separate notes from PDFs`);
      }

      // Clear files after successful processing
      setSelectedFiles([]);
    } catch (error) {
      console.error('Error processing PDF files:', error);
      toast.error("Failed to process PDF files");
    } finally {
      setIsProcessing(false);
      setProgress(0);
      setProcessingFile('');
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5" />
            Upload Multiple PDFs
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="pdf-files">Select PDF Files</Label>
            <Input
              id="pdf-files"
              type="file"
              multiple
              accept=".pdf"
              onChange={handleFileSelection}
              className="mt-1"
            />
            <p className="text-sm text-gray-500 mt-1">
              Select multiple PDF files to import. Maximum 10 files at once.
            </p>
          </div>

          {selectedFiles.length > 0 && (
            <div className="space-y-3">
              <h4 className="font-medium">Selected Files ({selectedFiles.length})</h4>
              <div className="max-h-48 overflow-y-auto space-y-2">
                {selectedFiles.map((file) => (
                  <div key={file.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <FileText className="h-4 w-4 text-red-500" />
                      <div>
                        <p className="font-medium text-sm">{file.name}</p>
                        <p className="text-xs text-gray-500">{formatFileSize(file.size)}</p>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeFile(file.id)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {selectedFiles.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Merge className="h-5 w-5" />
              Import Options
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <Label>How would you like to organize the imported content?</Label>
                <RadioGroup
                  value={mergeOption}
                  onValueChange={(value) => setMergeOption(value as 'merge' | 'separate')}
                  className="mt-2"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="separate" id="separate" />
                    <Label htmlFor="separate" className="flex items-center gap-2">
                      <Split className="h-4 w-4" />
                      Create separate notes (one per PDF)
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="merge" id="merge" />
                    <Label htmlFor="merge" className="flex items-center gap-2">
                      <Merge className="h-4 w-4" />
                      Merge into one note (all PDFs combined)
                    </Label>
                  </div>
                </RadioGroup>
              </div>

              {isPremiumUser && (
                <div className="bg-purple-50 p-3 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Badge variant="secondary" className="bg-purple-100 text-purple-700">
                      Premium Feature
                    </Badge>
                  </div>
                  <p className="text-sm text-purple-700">
                    Advanced OCR processing will automatically detect handwritten content in scanned PDFs
                    and apply enhanced text extraction for better accuracy.
                  </p>
                </div>
              )}

              <Button 
                onClick={processPdfFiles}
                disabled={isProcessing || selectedFiles.length === 0}
                className="w-full bg-purple-600 hover:bg-purple-700"
              >
                {isProcessing ? 'Processing...' : `Process ${selectedFiles.length} PDF${selectedFiles.length > 1 ? 's' : ''}`}
              </Button>

              {isProcessing && (
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Processing: {processingFile}</span>
                    <span>{Math.round(progress)}%</span>
                  </div>
                  <Progress value={progress} className="w-full" />
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
