
import React, { useRef } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Upload, FileText } from "lucide-react";
import { useFileReader } from '@/hooks/file/useFileReader';

interface ImageUploadProps {
  onImageUploaded: (imageUrl: string) => void;
  onMultipleImagesUploaded?: (files: File[]) => void;
  isDragOver?: boolean;
  onDragEnter?: (e: React.DragEvent) => void;
  onDragOver?: (e: React.DragEvent) => void;
  onDragLeave?: (e: React.DragEvent) => void;
  onDrop?: (e: React.DragEvent) => void;
}

export const ImageUpload = ({ 
  onImageUploaded, 
  onMultipleImagesUploaded,
  isDragOver = false,
  onDragEnter,
  onDragOver,
  onDragLeave,
  onDrop
}: ImageUploadProps) => {
  const inputRef = useRef<HTMLInputElement>(null);
  
  const { readAsDataURL } = useFileReader({
    onError: (error) => {
      console.error('❌ [IMAGE UPLOAD] File read error:', error);
    }
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const imageFiles = files.filter(file => file.type.startsWith('image/'));
    
    console.log(`Selected ${files.length} files, ${imageFiles.length} are images`);
    
    if (imageFiles.length === 0) return;

    if (imageFiles.length === 1) {
      const file = imageFiles[0];
      readAsDataURL(file)
        .then((imageUrl) => {
          console.log('Single image loaded from file input');
          onImageUploaded(imageUrl);
        })
        .catch((error) => {
          console.error('❌ [IMAGE UPLOAD] Failed to read file:', error);
        });
    } else if (onMultipleImagesUploaded) {
      console.log(`Starting batch processing for ${imageFiles.length} selected images`);
      onMultipleImagesUploaded(imageFiles);
    }

    if (inputRef.current) {
      inputRef.current.value = '';
    }
  };

  const handleCardClick = () => {
    inputRef.current?.click();
  };

  return (
    <div className="w-full text-center">
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
        <CardContent className="p-8 flex flex-col items-center">
          <div className={`transition-all duration-300 ${isDragOver ? 'scale-110' : ''}`}>
            {isDragOver ? (
              <FileText className="h-12 w-12 mb-4 text-mint-500 animate-bounce" />
            ) : (
              <Upload className="h-12 w-12 mb-4 text-mint-600" />
            )}
          </div>
          
          <div className="text-center">
            <p className={`text-lg font-medium mb-2 ${
              isDragOver ? 'text-mint-700' : 'text-mint-700'
            }`}>
              {isDragOver ? 'Drop your images here!' : 'Upload Images'}
            </p>
            
            <p className={`text-sm mb-3 ${
              isDragOver ? 'text-mint-600' : 'text-mint-600'
            }`}>
              {isDragOver 
                ? 'Release to process your images' 
                : 'Click to select or drag and drop images'
              }
            </p>
            
            <div className={`text-xs p-3 rounded-lg ${
              isDragOver ? 'bg-mint-100 text-mint-700' : 'bg-mint-100 text-mint-600'
            }`}>
              <p className="font-medium">PNG, JPG, JPEG, WebP supported</p>
              <p>Single image or batch processing (up to 10 files)</p>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <input
        type="file"
        ref={inputRef}
        accept="image/*"
        multiple
        onChange={handleFileChange}
        className="hidden"
      />
    </div>
  );
};
