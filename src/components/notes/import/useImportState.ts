
import { useState } from "react";

interface ImportState {
  selectedFile: File | null;
  fileType: string | null;
  fileUrl: string | null;
  extractedText: string;
  documentTitle: string;
  documentMetadata?: Record<string, any>;
}

export const useImportState = () => {
  const [importState, setImportState] = useState<ImportState>({
    selectedFile: null,
    fileType: null,
    fileUrl: null,
    extractedText: '',
    documentTitle: '',
    documentMetadata: {}
  });

  const setSelectedFile = (file: File | null) => {
    setImportState(prev => ({ ...prev, selectedFile: file }));
  };

  const setFileType = (type: string | null) => {
    setImportState(prev => ({ ...prev, fileType: type }));
  };

  const setFileUrl = (url: string | null) => {
    setImportState(prev => ({ ...prev, fileUrl: url }));
  };

  const setExtractedText = (text: string) => {
    setImportState(prev => ({ ...prev, extractedText: text }));
  };

  const setDocumentTitle = (title: string) => {
    setImportState(prev => ({ ...prev, documentTitle: title }));
  };

  const setDocumentMetadata = (metadata: Record<string, any>) => {
    setImportState(prev => ({ ...prev, documentMetadata: metadata }));
  };

  const resetState = () => {
    setImportState({
      selectedFile: null,
      fileType: null,
      fileUrl: null,
      extractedText: '',
      documentTitle: '',
      documentMetadata: {}
    });
  };

  return {
    importState,
    setSelectedFile,
    setFileType,
    setFileUrl,
    setExtractedText,
    setDocumentTitle,
    setDocumentMetadata,
    resetState
  };
};
