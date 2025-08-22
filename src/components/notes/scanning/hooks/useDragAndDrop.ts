
import { useState, useRef, useCallback } from "react";
import { useFileReader } from '@/hooks/file/useFileReader';

export interface DragDropHandlers {
  isDragOver: boolean;
  dragCounter: number;
  handleDragEnter: (e: React.DragEvent) => void;
  handleDragOver: (e: React.DragEvent) => void;
  handleDragLeave: (e: React.DragEvent) => void;
  handleDrop: (e: React.DragEvent, onSingleImage: (url: string) => void, onMultipleImages: (files: File[]) => void) => void;
  resetDragState: () => void;
}

export const useDragAndDrop = (): DragDropHandlers => {
  const [isDragOver, setIsDragOver] = useState(false);
  const dragCounter = useRef(0);
  
  const { readAsDataURL, abort } = useFileReader({
    onError: (error) => {
      console.error('❌ [DRAG DROP] File read error:', error);
    }
  });

  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounter.current++;
    
    if (e.dataTransfer.types.includes('Files')) {
      setIsDragOver(true);
    }
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    // Ensure drag over state is maintained
    if (e.dataTransfer.types.includes('Files')) {
      setIsDragOver(true);
    }
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounter.current--;
    
    // Only hide drag overlay when all drag events have left
    if (dragCounter.current === 0) {
      setIsDragOver(false);
    }
  }, []);

  const handleDrop = useCallback((
    e: React.DragEvent, 
    onSingleImage: (url: string) => void, 
    onMultipleImages: (files: File[]) => void
  ) => {
    e.preventDefault();
    e.stopPropagation();
    
    // Reset drag state
    dragCounter.current = 0;
    setIsDragOver(false);

    const files = Array.from(e.dataTransfer.files);
    const imageFiles = files.filter(file => file.type.startsWith('image/'));
    
    console.log(`Dropped ${files.length} files, ${imageFiles.length} are images`);
    
    if (imageFiles.length === 0) {
      console.warn('No image files found in drop');
      return;
    }

    if (imageFiles.length === 1) {
      // Single image processing with robust file reading
      const file = imageFiles[0];
      readAsDataURL(file)
        .then((imageUrl) => {
          console.log('Single image loaded for processing');
          onSingleImage(imageUrl);
        })
        .catch((error) => {
          console.error('❌ [DRAG DROP] Failed to read single image:', error);
        });
    } else {
      // Multiple images - batch processing
      console.log(`Starting batch processing for ${imageFiles.length} images`);
      onMultipleImages(imageFiles);
    }
  }, []);

  const resetDragState = useCallback(() => {
    dragCounter.current = 0;
    setIsDragOver(false);
    abort(); // Abort any ongoing file reading operations
  }, [abort]);

  return {
    isDragOver,
    dragCounter: dragCounter.current,
    handleDragEnter,
    handleDragOver,
    handleDragLeave,
    handleDrop,
    resetDragState
  };
};
