
import React, { useRef } from "react";
import { Input } from "@/components/ui/input";
import { Upload } from "lucide-react";

interface FileDropZoneProps {
  onFileSelected: (file: File) => void;
  isDragOver: boolean;
  onDragOver: (e: React.DragEvent) => void;
  onDragLeave: (e: React.DragEvent) => void;
  onDrop: (e: React.DragEvent) => void;
}

export const FileDropZone = ({
  onFileSelected,
  isDragOver,
  onDragOver,
  onDragLeave,
  onDrop
}: FileDropZoneProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleInputFileSelected = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      onFileSelected(file);
    }
  };

  const handleDropZoneClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div
      className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
        isDragOver 
          ? 'border-purple-500 bg-purple-50' 
          : 'border-gray-300 hover:border-purple-400 hover:bg-gray-50'
      }`}
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      onDrop={onDrop}
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
  );
};
