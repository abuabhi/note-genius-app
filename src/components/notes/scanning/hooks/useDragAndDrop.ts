
import { useState } from "react";

export interface DragDropHandlers {
  isDragOver: boolean;
  handleDragOver: (e: React.DragEvent) => void;
  handleDragLeave: (e: React.DragEvent) => void;
  handleDrop: (e: React.DragEvent, onSingleImage: (url: string) => void, onMultipleImages: (files: File[]) => void) => void;
}

export const useDragAndDrop = (): DragDropHandlers => {
  const [isDragOver, setIsDragOver] = useState(false);

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

  const handleDrop = (
    e: React.DragEvent, 
    onSingleImage: (url: string) => void, 
    onMultipleImages: (files: File[]) => void
  ) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);

    const files = Array.from(e.dataTransfer.files);
    const imageFiles = files.filter(file => file.type.startsWith('image/'));
    
    if (imageFiles.length === 0) {
      return;
    }

    if (imageFiles.length === 1) {
      // Single image processing
      const file = imageFiles[0];
      const reader = new FileReader();
      reader.onload = (event) => {
        const imageUrl = event.target?.result as string;
        onSingleImage(imageUrl);
      };
      reader.readAsDataURL(file);
    } else {
      // Multiple images - batch processing
      onMultipleImages(imageFiles);
    }
  };

  return {
    isDragOver,
    handleDragOver,
    handleDragLeave,
    handleDrop
  };
};
