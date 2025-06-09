
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Camera, Upload, FileImage } from "lucide-react";
import { Note } from "@/types/note";
import { toast } from "sonner";

interface ScanImportTabProps {
  onSaveNote: (note: Omit<Note, 'id'>) => Promise<boolean>;
  isPremiumUser?: boolean;
}

export const ScanImportTab = ({ onSaveNote, isPremiumUser }: ScanImportTabProps) => {
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [extractedText, setExtractedText] = useState<string>('');
  const [documentTitle, setDocumentTitle] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const handleImageSelected = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedImage(file);
      setDocumentTitle(file.name.replace(/\.[^/.]+$/, "")); // Remove extension
      setExtractedText(''); // Clear previous content
    }
  };

  const processImage = async () => {
    if (!selectedImage) return;

    setIsProcessing(true);
    try {
      // Simulate OCR processing
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      // In a real implementation, this would use OCR services
      const simulatedText = `Text extracted from ${selectedImage.name}\n\nThis is simulated OCR content that would be extracted from the image. The actual implementation would use OCR services like Tesseract.js or cloud-based OCR APIs to extract text from images.\n\nExtracted content:\n- Handwritten notes\n- Printed text\n- Tables and diagrams\n- Mathematical formulas`;
      
      setExtractedText(simulatedText);
      toast.success("Image processed successfully!");
    } catch (error) {
      console.error('Error processing image:', error);
      toast.error("Failed to process image");
    } finally {
      setIsProcessing(false);
    }
  };

  const saveAsNote = async () => {
    if (!extractedText || !documentTitle) return;

    setIsSaving(true);
    try {
      const note: Omit<Note, 'id'> = {
        title: documentTitle,
        content: extractedText,
        description: `Scanned from ${selectedImage?.name || 'image'}`,
        subject: 'Scanned Documents',
        tags: [{ name: 'OCR', color: '#F59E0B' }, { name: 'Scan', color: '#8B5CF6' }],
        sourceType: 'scan',
        pinned: false,
        archived: false,
        date: new Date().toISOString().split('T')[0],
        category: 'Scanned Documents'
      };

      const success = await onSaveNote(note);
      if (success) {
        toast.success("Note saved successfully!");
        // Reset form
        setSelectedImage(null);
        setExtractedText('');
        setDocumentTitle('');
      }
    } catch (error) {
      console.error('Error saving note:', error);
      toast.error("Failed to save note");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Camera className="h-5 w-5" />
            Scan Document or Image
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="image-file">Select Image</Label>
            <Input
              id="image-file"
              type="file"
              onChange={handleImageSelected}
              accept=".png,.jpg,.jpeg,.gif,.bmp,.tiff"
              className="mt-1"
            />
            <p className="text-sm text-gray-500 mt-1">
              Supported formats: PNG, JPG, JPEG, GIF, BMP, TIFF
            </p>
          </div>

          {selectedImage && (
            <Card className="bg-gray-50">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <FileImage className="h-5 w-5 text-blue-500" />
                  <div>
                    <p className="font-medium">{selectedImage.name}</p>
                    <p className="text-sm text-gray-500">
                      {(selectedImage.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                </div>
                
                <Button 
                  onClick={processImage}
                  disabled={isProcessing}
                  className="w-full mt-3"
                >
                  {isProcessing ? 'Processing...' : 'Extract Text (OCR)'}
                </Button>
              </CardContent>
            </Card>
          )}

          {extractedText && (
            <div className="space-y-4">
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
                <Label>Extracted Text</Label>
                <div className="border border-gray-200 rounded p-4 max-h-60 overflow-y-auto bg-gray-50 mt-1">
                  <pre className="whitespace-pre-wrap text-sm">{extractedText}</pre>
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

          {!isPremiumUser && (
            <div className="bg-yellow-50 p-3 rounded-lg mt-4">
              <p className="text-sm text-yellow-700">
                <strong>Premium Feature:</strong> Advanced OCR with handwriting recognition is available for premium users.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
