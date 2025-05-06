
import { useRef } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { FileUp } from "lucide-react";

interface FileUploadProps {
  onFileSelected: (file: File) => void;
  acceptedTypes: string;
  selectedFile: File | null;
}

export const FileUpload = ({ onFileSelected, acceptedTypes, selectedFile }: FileUploadProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onFileSelected(file);
    }
  };

  return (
    <div className="w-full text-center">
      <Card 
        className={`border-dashed border-2 cursor-pointer ${selectedFile ? 'border-mint-500' : ''}`}
        onClick={() => fileInputRef.current?.click()}
      >
        <CardContent className="p-6 flex flex-col items-center">
          <FileUp className="h-12 w-12 text-mint-600 mb-2" />
          {selectedFile ? (
            <>
              <p className="font-medium text-mint-700">{selectedFile.name}</p>
              <p className="text-xs text-mint-500 mt-1">{(selectedFile.size / 1024).toFixed(2)} KB</p>
            </>
          ) : (
            <>
              <p className="text-sm text-mint-700">Click to select a document or drag and drop</p>
              <p className="text-xs text-mint-500 mt-2">Supports PDF, Word documents</p>
            </>
          )}
        </CardContent>
      </Card>
      <input
        type="file"
        ref={fileInputRef}
        accept={acceptedTypes}
        onChange={handleFileChange}
        className="hidden"
      />
    </div>
  );
};
