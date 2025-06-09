
import { useRef, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Upload } from "lucide-react";

interface ImageUploadProps {
  onImageUploaded: (imageUrl: string) => void;
}

export const ImageUpload = ({ onImageUploaded }: ImageUploadProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragOver, setIsDragOver] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const imageUrl = event.target?.result as string;
        onImageUploaded(imageUrl);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);

    const files = Array.from(e.dataTransfer.files);
    const imageFiles = files.filter(file => file.type.startsWith('image/'));
    
    if (imageFiles.length > 0) {
      const file = imageFiles[0];
      const reader = new FileReader();
      reader.onload = (event) => {
        const imageUrl = event.target?.result as string;
        onImageUploaded(imageUrl);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="w-full text-center">
      <Card 
        className={`border-dashed border-2 cursor-pointer transition-all duration-200 ${
          isDragOver 
            ? 'border-mint-500 bg-mint-50 shadow-lg scale-105' 
            : 'border-mint-300 hover:border-mint-400 hover:bg-mint-50'
        }`}
        onClick={() => fileInputRef.current?.click()}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <CardContent className="p-6 flex flex-col items-center">
          <Upload className={`h-12 w-12 mb-2 transition-colors ${
            isDragOver ? 'text-mint-500' : 'text-mint-600'
          }`} />
          <p className={`text-sm font-medium transition-colors ${
            isDragOver ? 'text-mint-700' : 'text-mint-700'
          }`}>
            {isDragOver ? 'Drop your image here' : 'Click to select an image or drag and drop'}
          </p>
          <p className="text-xs text-mint-500 mt-2">Supports PNG, JPG, JPEG</p>
        </CardContent>
      </Card>
      <input
        type="file"
        ref={fileInputRef}
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
      />
    </div>
  );
};
