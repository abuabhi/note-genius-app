
import React from "react";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { FileUpload } from "../FileUpload";

interface FileImportTabProps {
  onFileSelected: (file: File) => void;
  selectedFile: File | null;
  processDocument: () => Promise<void>;
  isProcessing: boolean;
}

export const FileImportTab = ({ 
  onFileSelected,
  selectedFile,
  processDocument,
  isProcessing
}: FileImportTabProps) => {
  return (
    <div className="min-h-[300px] flex flex-col items-center justify-center">
      <FileUpload 
        onFileSelected={onFileSelected}
        acceptedTypes=".pdf,.docx,.doc"
        selectedFile={selectedFile}
      />
      
      {selectedFile && (
        <Button 
          onClick={processDocument} 
          disabled={isProcessing} 
          className="mt-4"
        >
          {isProcessing ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Processing...
            </>
          ) : (
            <>Process Document</>
          )}
        </Button>
      )}
    </div>
  );
};
