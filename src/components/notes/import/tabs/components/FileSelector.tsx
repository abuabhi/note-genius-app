
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Upload, FileImage, FileText } from "lucide-react";
import { toast } from "sonner";

interface FileSelectorProps {
  isDragOver: boolean;
  onDragEnter: (e: React.DragEvent) => void;
  onDragOver: (e: React.DragEvent) => void;
  onDragLeave: (e: React.DragEvent) => void;
  onDrop: (e: React.DragEvent) => void;
  onFileSelect: (files: File[]) => void;
}

export const FileSelector = ({
  isDragOver,
  onDragEnter,
  onDragOver,
  onDragLeave,
  onDrop,
  onFileSelect
}: FileSelectorProps) => {
  const handleFileInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    const supportedFiles = files.filter(file => 
      file.type.startsWith('image/') || file.type === 'application/pdf'
    );
    
    if (supportedFiles.length === 0) {
      toast.error("Please select valid image files (.png, .jpg, .webp) or PDF files");
      return;
    }

    onFileSelect(supportedFiles);
  };

  const triggerFileInput = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.png,.jpg,.jpeg,.gif,.bmp,.tiff,.webp,.pdf';
    input.multiple = true;
    
    // Fix: Convert native Event to React ChangeEvent format
    input.onchange = (event: Event) => {
      const target = event.target as HTMLInputElement;
      const files = Array.from(target.files || []);
      const supportedFiles = files.filter(file => 
        file.type.startsWith('image/') || file.type === 'application/pdf'
      );
      
      if (supportedFiles.length === 0) {
        toast.error("Please select valid image files (.png, .jpg, .webp) or PDF files");
        return;
      }

      onFileSelect(supportedFiles);
    };
    
    input.click();
  };

  return (
    <div
      className={`border-2 border-dashed rounded-xl p-12 text-center cursor-pointer transition-all duration-300 ${
        isDragOver 
          ? 'border-purple-500 bg-purple-50 scale-[1.02] shadow-lg' 
          : 'border-gray-300 hover:border-purple-400 hover:bg-gray-50'
      }`}
      onDragEnter={onDragEnter}
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      onDrop={onDrop}
      onClick={triggerFileInput}
    >
      <div className={`transition-all duration-300 ${isDragOver ? 'scale-110' : ''}`}>
        {isDragOver ? (
          <FileImage className="h-20 w-20 mb-6 text-purple-500 animate-bounce mx-auto" />
        ) : (
          <Upload className="h-16 w-16 mb-6 text-gray-400 mx-auto" />
        )}
      </div>
      
      <h3 className={`text-2xl font-bold mb-3 transition-colors ${
        isDragOver ? 'text-purple-700' : 'text-gray-700'
      }`}>
        {isDragOver ? 'Drop Documents Here!' : 'Drag & Drop or Click to Scan'}
      </h3>
      
      <p className={`text-lg mb-4 transition-colors ${
        isDragOver ? 'text-purple-600' : 'text-gray-500'
      }`}>
        {isDragOver 
          ? 'Release to start processing your documents' 
          : 'Upload images or PDF files for OCR processing'
        }
      </p>
      
      <div className={`grid grid-cols-1 md:grid-cols-2 gap-4 p-4 rounded-xl transition-colors ${
        isDragOver ? 'bg-purple-100/50' : 'bg-gray-50'
      }`}>
        <div className="text-left">
          <div className="font-semibold text-sm mb-2 flex items-center">
            <FileImage className="h-4 w-4 mr-2" />
            Image Files
          </div>
          <ul className="text-xs space-y-1">
            <li>• Standard OCR with AI analysis</li>
            <li>• Handwriting recognition</li>
            <li>• PNG, JPG, WebP, GIF, etc.</li>
          </ul>
        </div>
        <div className="text-left">
          <div className="font-semibold text-sm mb-2 flex items-center">
            <FileText className="h-4 w-4 mr-2" />
            PDF Documents
          </div>
          <ul className="text-xs space-y-1">
            <li>• Convert to image for OCR</li>
            <li>• Process first page</li>
            <li>• Automatic text extraction</li>
          </ul>
        </div>
      </div>
      
      <p className="text-xs text-gray-500 mt-4">
        Supported: Images (PNG, JPG, GIF, BMP, TIFF, WebP) & PDF files
      </p>
    </div>
  );
};
