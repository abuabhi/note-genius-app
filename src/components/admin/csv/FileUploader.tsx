
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Download, Upload } from "lucide-react";

interface FileUploaderProps {
  selectedFile?: File | null;
  isImporting?: boolean;
  templateType?: 'grades' | 'subjects' | 'sections' | 'flashcards';
  onFileChange?: (file: File | null) => void;
  onImport?: () => void;
  getTemplateCSV?: (type?: 'grades' | 'subjects' | 'sections' | 'flashcards') => string;
  onFileSelect?: (file: File | null) => void; // For compatibility
  acceptedTypes: string;
  description: string;
}

export function FileUploader({
  selectedFile,
  isImporting,
  templateType,
  onFileChange,
  onImport,
  getTemplateCSV,
  onFileSelect, // Added for backward compatibility
  acceptedTypes,
  description
}: FileUploaderProps) {
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      if (onFileChange) onFileChange(file);
      if (onFileSelect) onFileSelect(file); // For backward compatibility
    }
  };
  
  const downloadTemplate = () => {
    if (!getTemplateCSV || !templateType) return;
    
    const csvContent = getTemplateCSV(templateType);
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    
    // Create a URL for the blob
    const url = URL.createObjectURL(blob);
    link.href = url;
    link.setAttribute("download", `${templateType}_template.csv`);
    document.body.appendChild(link);
    link.click();
    
    // Clean up
    setTimeout(() => {
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    }, 100);
  };

  return (
    <div className="border rounded-md p-4 mt-6">
      <div className="flex flex-col space-y-4">
        <div className="flex justify-between items-center">
          <div>
            <h3 className="font-medium">Upload CSV File</h3>
            <p className="text-sm text-muted-foreground">
              {description}
            </p>
          </div>
          {getTemplateCSV && templateType && (
            <Button
              variant="outline"
              onClick={downloadTemplate}
              className="flex items-center"
            >
              <Download className="mr-2 h-4 w-4" />
              Download Template
            </Button>
          )}
        </div>

        <div className="flex items-center gap-4">
          <input
            type="file"
            accept={acceptedTypes}
            onChange={handleFileChange}
            className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border file:border-gray-300 file:text-sm file:font-semibold file:bg-transparent file:text-gray-700 hover:file:bg-gray-100"
          />
          {onImport && (
            <Button 
              onClick={onImport} 
              disabled={!selectedFile || isImporting}
              className="flex items-center"
            >
              <Upload className="mr-2 h-4 w-4" />
              {isImporting ? "Importing..." : "Import"}
            </Button>
          )}
        </div>

        {selectedFile && (
          <div className="text-sm">
            <p>Selected file: <span className="font-medium">{selectedFile.name}</span></p>
            <p>Size: {Math.round(selectedFile.size / 1024)} KB</p>
          </div>
        )}
      </div>
    </div>
  );
}
