
import React, { useRef } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { FileText, Upload } from "lucide-react";

interface SimplifiedFileSelectorProps {
  isDragOver: boolean;
  onDragEnter: (e: React.DragEvent) => void;
  onDragOver: (e: React.DragEvent) => void;
  onDragLeave: (e: React.DragEvent) => void;
  onDrop: (e: React.DragEvent) => void;
  onFileSelect: (files: File[]) => void;
}

export const SimplifiedFileSelector = ({
  isDragOver,
  onDragEnter,
  onDragOver,
  onDragLeave,
  onDrop,
  onFileSelect
}: SimplifiedFileSelectorProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 0) {
      onFileSelect(files);
    }
    
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleCardClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <>
      {/* Global drag overlay */}
      {isDragOver && (
        <div className="fixed inset-0 bg-mint-100 bg-opacity-90 flex items-center justify-center z-50 pointer-events-none">
          <div className="bg-white p-8 rounded-xl shadow-xl text-center border-2 border-mint-300 border-dashed">
            <FileText className="h-16 w-16 text-mint-500 mx-auto mb-4 animate-pulse" />
            <p className="text-xl font-bold text-mint-700 mb-2">
              Drop Files to Scan
            </p>
            <p className="text-mint-600">
              PDF, PNG, JPG, WebP - up to 3 files
            </p>
          </div>
        </div>
      )}

      <Card 
        className={`border-dashed border-2 cursor-pointer transition-all duration-300 ${
          isDragOver 
            ? 'border-mint-500 bg-mint-50 shadow-lg scale-[1.02]' 
            : 'border-mint-300 hover:border-mint-400 hover:bg-mint-50'
        }`}
        onClick={handleCardClick}
        onDragEnter={onDragEnter}
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onDrop={onDrop}
      >
        <CardContent className="p-8 text-center">
          <div className={`transition-all duration-300 ${isDragOver ? 'scale-110' : ''}`}>
            <Upload className="h-12 w-12 mb-4 text-mint-600 mx-auto" />
          </div>
          
          <h3 className="text-lg font-semibold text-mint-700 mb-2">
            {isDragOver ? 'Drop your files here!' : 'Upload Documents'}
          </h3>
          
          <p className="text-mint-600 mb-4">
            {isDragOver 
              ? 'Release to process your files' 
              : 'Click to select or drag and drop files'
            }
          </p>
          
          <div className="text-sm text-mint-500 bg-mint-50 p-3 rounded-lg">
            <p className="font-medium mb-1">Supported formats:</p>
            <p>PDF, PNG, JPG, WebP • Maximum 3 files</p>
          </div>
        </CardContent>
      </Card>
      
      <input
        type="file"
        ref={fileInputRef}
        accept=".pdf,.png,.jpg,.jpeg,.webp"
        multiple
        onChange={handleFileChange}
        className="hidden"
      />
    </>
  );
};
