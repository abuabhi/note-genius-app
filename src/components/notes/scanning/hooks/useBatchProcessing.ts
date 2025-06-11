
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";

interface ProcessedImage {
  id: string;
  imageUrl: string;
  recognizedText: string;
  title: string;
  category: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  error?: string;
}

interface BatchProcessingOptions {
  selectedLanguage: string;
  isPremiumUser: boolean;
  uploadImageToStorage: (imageUrl: string) => Promise<string | null>;
}

export const useBatchProcessing = ({ selectedLanguage, isPremiumUser, uploadImageToStorage }: BatchProcessingOptions) => {
  const [processedImages, setProcessedImages] = useState<ProcessedImage[]>([]);
  const [batchProgress, setBatchProgress] = useState(0);

  const processBatchImages = async (files: File[]) => {
    const batchImages: ProcessedImage[] = files.map((file, index) => ({
      id: `batch-${index}-${Date.now()}`,
      imageUrl: '',
      recognizedText: '',
      title: file.name.replace(/\.[^/.]+$/, ''),
      category: 'Scanned Documents',
      status: 'pending'
    }));

    setProcessedImages(batchImages);

    // Process images concurrently (3 at a time)
    const batchSize = 3;
    let completed = 0;

    for (let i = 0; i < files.length; i += batchSize) {
      const batch = files.slice(i, i + batchSize);
      const batchIndices = Array.from({ length: batch.length }, (_, idx) => i + idx);

      const batchPromises = batch.map(async (file, batchIdx) => {
        const imageIndex = batchIndices[batchIdx];
        
        try {
          // Update status to processing
          setProcessedImages(prev => prev.map((img, idx) => 
            idx === imageIndex ? { ...img, status: 'processing' } : img
          ));

          // Convert file to data URL first
          const reader = new FileReader();
          const dataUrl = await new Promise<string>((resolve, reject) => {
            reader.onload = (event) => resolve(event.target?.result as string);
            reader.onerror = () => reject(new Error('Failed to read file'));
            reader.readAsDataURL(file);
          });

          console.log(`Processing image ${imageIndex + 1}: ${file.name}`);

          // Try to upload to storage first
          let imageUrlForProcessing = dataUrl;
          try {
            const storageUrl = await uploadImageToStorage(dataUrl);
            if (storageUrl) {
              imageUrlForProcessing = storageUrl;
              console.log(`Image uploaded to storage: ${storageUrl}`);
            } else {
              console.log('Storage upload failed, using data URL for processing');
            }
          } catch (uploadError) {
            console.error('Storage upload error:', uploadError);
            console.log('Falling back to data URL for processing');
          }

          // Process with OCR using the best available URL
          const { data, error } = await supabase.functions.invoke('process-image', {
            body: {
              imageUrl: imageUrlForProcessing,
              language: selectedLanguage,
              useOpenAI: isPremiumUser,
              enhanceImage: false // Disable enhancement for batch processing for better performance
            }
          });

          if (error) {
            throw new Error(error.message || 'Failed to process image');
          }

          if (!data || !data.success) {
            throw new Error(data?.error || 'OCR processing failed');
          }

          console.log(`OCR processing completed for image ${imageIndex + 1}`);

          // Update with results
          setProcessedImages(prev => prev.map((img, idx) => 
            idx === imageIndex ? {
              ...img,
              imageUrl: imageUrlForProcessing,
              recognizedText: data.text || 'No text detected',
              status: 'completed'
            } : img
          ));

        } catch (error) {
          console.error(`Error processing image ${imageIndex + 1}:`, error);
          
          // Update with error
          setProcessedImages(prev => prev.map((img, idx) => 
            idx === imageIndex ? {
              ...img,
              status: 'failed',
              error: error instanceof Error ? error.message : 'Processing failed'
            } : img
          ));
        }

        completed++;
        setBatchProgress((completed / files.length) * 100);
      });

      await Promise.allSettled(batchPromises);
    }
  };

  const resetBatchProcessing = () => {
    setProcessedImages([]);
    setBatchProgress(0);
  };

  return {
    processedImages,
    batchProgress,
    processBatchImages,
    resetBatchProcessing
  };
};
