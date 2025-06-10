
import React, { useRef, useState } from "react";
import { Input } from "@/components/ui/input";
import { Upload } from "lucide-react";

interface FileDropZoneProps {
  onFileSelected: (file: File) => void;
}

export const FileDropZone = ({ onFileSelected }: FileDropZoneProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragOver, setIsDragOver] = useState(false);

  const handleInputFileSelected = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      onFileSelected(file);
    }
  };

  const handleDropZoneClick = () => {
    fileInputRef.current?.click();
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
    
    const files = Array.from(e.dataTransfer.files);
    const file = files[0];
    if (file) {
      onFileSelected(file);
    }
  };

  return (
    <div
      className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
        isDragOver 
          ? 'border-mint-500 bg-mint-50' 
          : 'border-mint-300 hover:border-mint-400 hover:bg-mint-50'
      }`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      onClick={handleDropZoneClick}
    >
      <Upload className="h-12 w-12 mx-auto mb-4 text-mint-400" />
      <p className="text-lg font-medium text-mint-700 mb-2">
        Drop your document here or click to browse
      </p>
      <p className="text-sm text-mint-500">
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
  );
};
