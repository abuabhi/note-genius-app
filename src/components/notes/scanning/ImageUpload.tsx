
import { useRef } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Upload } from "lucide-react";

interface ImageUploadProps {
  onImageUploaded: (imageUrl: string) => void;
}

export const ImageUpload = ({ onImageUploaded }: ImageUploadProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  return (
    <div className="w-full text-center">
      <Card 
        className="border-dashed border-2 cursor-pointer" 
        onClick={() => fileInputRef.current?.click()}
      >
        <CardContent className="p-6 flex flex-col items-center">
          <Upload className="h-12 w-12 text-mint-600 mb-2" />
          <p className="text-sm text-mint-700">Click to select an image or drag and drop</p>
          <p className="text-xs text-mint-500 mt-2">Supports PNG, JPG</p>
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
