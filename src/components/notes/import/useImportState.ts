
import { useState } from "react";

export interface ImportState {
  selectedFile: File | null;
  fileUrl: string | null;
  fileType: string | null;
  extractedText: string;
  documentTitle: string;
}

export const useImportState = () => {
  const [importState, setImportState] = useState<ImportState>({
    selectedFile: null,
    fileUrl: null,
    fileType: null,
    extractedText: "",
    documentTitle: ""
  });

  const setSelectedFile = (file: File | null) => {
    setImportState(prev => ({ ...prev, selectedFile: file }));
  };

  const setFileUrl = (url: string | null) => {
    setImportState(prev => ({ ...prev, fileUrl: url }));
  };

  const setFileType = (type: string | null) => {
    setImportState(prev => ({ ...prev, fileType: type }));
  };

  const setExtractedText = (text: string) => {
    setImportState(prev => ({ ...prev, extractedText: text }));
  };

  const setDocumentTitle = (title: string) => {
    setImportState(prev => ({ ...prev, documentTitle: title }));
  };

  const resetState = () => {
    setImportState({
      selectedFile: null,
      fileUrl: null,
      fileType: null,
      extractedText: "",
      documentTitle: ""
    });
  };

  return {
    importState,
    setSelectedFile,
    setFileUrl,
    setFileType,
    setExtractedText,
    setDocumentTitle,
    resetState
  };
};
