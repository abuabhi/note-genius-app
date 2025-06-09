
import { useRef } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Upload, Image, FileImage } from "lucide-react";

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
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const imageFiles = files.filter(file => file.type.startsWith('image/'));
    
    console.log(`Selected ${files.length} files, ${imageFiles.length} are images`);
    
    if (imageFiles.length === 0) return;

    if (imageFiles.length === 1) {
      // Single image processing
      const file = imageFiles[0];
      const reader = new FileReader();
      reader.onload = (event) => {
        const imageUrl = event.target?.result as string;
        console.log('Single image loaded from file input');
        onImageUploaded(imageUrl);
      };
      reader.readAsDataURL(file);
    } else if (onMultipleImagesUploaded) {
      // Multiple images - batch processing
      console.log(`Starting batch processing for ${imageFiles.length} selected images`);
      onMultipleImagesUploaded(imageFiles);
    }

    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleCardClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="w-full text-center">
      <Card 
        className={`border-dashed border-2 cursor-pointer transition-all duration-300 ease-in-out ${
          isDragOver 
            ? 'border-blue-500 bg-blue-50 shadow-lg scale-[1.02] ring-2 ring-blue-200' 
            : 'border-mint-300 hover:border-mint-400 hover:bg-mint-50 hover:shadow-md'
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
              <FileImage className="h-16 w-16 mb-4 text-blue-500 animate-bounce" />
            ) : (
              <Upload className="h-12 w-12 mb-4 text-mint-600" />
            )}
          </div>
          
          <div className="text-center">
            <p className={`text-lg font-medium transition-colors mb-2 ${
              isDragOver ? 'text-blue-700' : 'text-mint-700'
            }`}>
              {isDragOver ? 'Drop your images here!' : 'Upload Images'}
            </p>
            
            <p className={`text-sm transition-colors mb-3 ${
              isDragOver ? 'text-blue-600' : 'text-mint-600'
            }`}>
              {isDragOver 
                ? 'Release to process your images' 
                : 'Click to select or drag and drop images'
              }
            </p>
            
            <div className={`text-xs p-3 rounded-lg transition-colors ${
              isDragOver ? 'bg-blue-100 text-blue-700' : 'bg-mint-100 text-mint-600'
            }`}>
              <div className="flex items-center justify-center gap-2 mb-1">
                <Image className="h-3 w-3" />
                <span className="font-medium">Multiple file support</span>
              </div>
              <p>
                <strong>Single image:</strong> Standard OCR processing
              </p>
              <p>
                <strong>Multiple images:</strong> Batch processing (up to 3 concurrent)
              </p>
              <p className="mt-1">
                Supports: PNG, JPG, JPEG, GIF, BMP, TIFF, WebP
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <input
        type="file"
        ref={fileInputRef}
        accept="image/*"
        multiple
        onChange={handleFileChange}
        className="hidden"
      />
    </div>
  );
};
