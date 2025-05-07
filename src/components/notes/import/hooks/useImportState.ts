
import { useState } from "react";

export interface ImportState {
  selectedFile: File | null;
  fileType: string | null;
  fileUrl: string | null;
  extractedText: string;
  documentTitle: string;
  documentMetadata?: Record<string, any>;
}

const initialState: ImportState = {
  selectedFile: null,
  fileType: null,
  fileUrl: null,
  extractedText: '',
  documentTitle: '',
  documentMetadata: {}
};

export const useImportState = () => {
  const [importState, setImportState] = useState<ImportState>(initialState);

  // File management functions
  const fileOperations = {
    setSelectedFile: (file: File | null) => {
      setImportState(prev => ({ ...prev, selectedFile: file }));
    },
    
    setFileType: (type: string | null) => {
      setImportState(prev => ({ ...prev, fileType: type }));
    },
    
    setFileUrl: (url: string | null) => {
      setImportState(prev => ({ ...prev, fileUrl: url }));
    }
  };

  // Content management functions
  const contentOperations = {
    setExtractedText: (text: string) => {
      setImportState(prev => ({ ...prev, extractedText: text }));
    },
    
    setDocumentTitle: (title: string) => {
      setImportState(prev => ({ ...prev, documentTitle: title }));
    }
  };

  // Metadata operations
  const metadataOperations = {
    setDocumentMetadata: (metadata: Record<string, any>) => {
      setImportState(prev => ({ ...prev, documentMetadata: metadata }));
    }
  };

  // State reset function
  const resetState = () => {
    setImportState(initialState);
  };

  return {
    importState,
    ...fileOperations,
    ...contentOperations,
    ...metadataOperations,
    resetState
  };
};
