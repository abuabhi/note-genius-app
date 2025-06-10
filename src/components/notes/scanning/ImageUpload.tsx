
import { useRef } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Upload, FileText } from "lucide-react";

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
      const file = imageFiles[0];
      const reader = new FileReader();
      reader.onload = (event) => {
        const imageUrl = event.target?.result as string;
        console.log('Single image loaded from file input');
        onImageUploaded(imageUrl);
      };
      reader.readAsDataURL(file);
    } else if (onMultipleImagesUploaded) {
      console.log(`Starting batch processing for ${imageFiles.length} selected images`);
      onMultipleImagesUploaded(imageFiles);
    }

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
              <p>Single image or batch processing (up to 3 files)</p>
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
