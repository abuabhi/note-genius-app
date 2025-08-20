import React, { useState, useCallback } from 'react';
import { ChevronLeft, ChevronRight, ImageIcon, AlertCircle } from 'lucide-react';
import { Card } from '@/components/ui/card';
import ErrorBoundary from '@/components/common/ErrorBoundary';

interface RobustImageGalleryProps {
  images: string[];
  className?: string;
  title?: string;
}

const ImageGalleryContent: React.FC<RobustImageGalleryProps> = ({ 
  images, 
  className = "",
  title 
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [imageErrors, setImageErrors] = useState<Set<number>>(new Set());
  const [loadingImages, setLoadingImages] = useState<Set<number>>(new Set());

  // Filter out invalid URLs and images with errors
  const validImages = images.filter((url, index) => 
    url && 
    typeof url === 'string' && 
    url.trim() !== '' && 
    !imageErrors.has(index)
  );

  const handleImageError = useCallback((index: number) => {
    setImageErrors(prev => new Set([...prev, index]));
    setLoadingImages(prev => {
      const newSet = new Set(prev);
      newSet.delete(index);
      return newSet;
    });
  }, []);

  const handleImageLoad = useCallback((index: number) => {
    setLoadingImages(prev => {
      const newSet = new Set(prev);
      newSet.delete(index);
      return newSet;
    });
  }, []);

  const handleImageLoadStart = useCallback((index: number) => {
    setLoadingImages(prev => new Set([...prev, index]));
  }, []);

  const nextImage = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % validImages.length);
  }, [validImages.length]);

  const prevImage = useCallback(() => {
    setCurrentIndex((prev) => (prev - 1 + validImages.length) % validImages.length);
  }, [validImages.length]);

  // Return null if no valid images
  if (validImages.length === 0) {
    return null;
  }

  // Single image - simple display
  if (validImages.length === 1) {
    return (
      <div className={`relative ${className}`}>
        {title && <h4 className="font-medium text-muted-foreground mb-3">{title}</h4>}
        <div className="relative bg-muted/20 rounded-lg overflow-hidden">
          <img
            src={validImages[0]}
            alt={title || "Help illustration"}
            className="w-full h-auto max-h-96 object-contain"
            onError={() => handleImageError(0)}
            onLoad={() => handleImageLoad(0)}
            onLoadStart={() => handleImageLoadStart(0)}
            loading="lazy"
          />
          {loadingImages.has(0) && (
            <div className="absolute inset-0 flex items-center justify-center bg-muted/20">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Multiple images - gallery with navigation
  return (
    <div className={`relative ${className}`}>
      {title && <h4 className="font-medium text-muted-foreground mb-3">{title}</h4>}
      
      {/* Main Image Display */}
      <Card className="relative overflow-hidden">
        <div className="relative bg-muted/10">
          <img
            src={validImages[currentIndex]}
            alt={`${title || "Help illustration"} ${currentIndex + 1}`}
            className="w-full h-auto max-h-96 object-contain"
            onError={() => handleImageError(images.indexOf(validImages[currentIndex]))}
            onLoad={() => handleImageLoad(images.indexOf(validImages[currentIndex]))}
            onLoadStart={() => handleImageLoadStart(images.indexOf(validImages[currentIndex]))}
            loading="lazy"
          />
          
          {/* Loading State */}
          {loadingImages.has(images.indexOf(validImages[currentIndex])) && (
            <div className="absolute inset-0 flex items-center justify-center bg-muted/20">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          )}

          {/* Navigation Buttons */}
          {validImages.length > 1 && (
            <>
              <button
                onClick={prevImage}
                className="absolute left-2 top-1/2 -translate-y-1/2 p-2 bg-background/80 hover:bg-background rounded-full shadow-md transition-colors"
                aria-label="Previous image"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button
                onClick={nextImage}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-background/80 hover:bg-background rounded-full shadow-md transition-colors"
                aria-label="Next image"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </>
          )}

          {/* Image Counter */}
          <div className="absolute bottom-2 right-2 px-2 py-1 bg-background/80 rounded text-xs text-muted-foreground">
            {currentIndex + 1} / {validImages.length}
          </div>
        </div>
      </Card>

      {/* Thumbnail Strip */}
      {validImages.length > 1 && (
        <div className="flex gap-2 mt-3 overflow-x-auto pb-2">
          {validImages.map((image, index) => (
            <button
              key={`${image}-${index}`}
              onClick={() => setCurrentIndex(index)}
              className={`flex-shrink-0 w-16 h-16 rounded border-2 overflow-hidden transition-all ${
                index === currentIndex 
                  ? 'border-primary ring-1 ring-primary' 
                  : 'border-border hover:border-muted-foreground'
              }`}
            >
              <img
                src={image}
                alt={`Thumbnail ${index + 1}`}
                className="w-full h-full object-cover"
                onError={() => handleImageError(images.indexOf(image))}
                loading="lazy"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

// Error Fallback Component
const ImageGalleryError: React.FC<{ images: string[] }> = ({ images }) => (
  <Card className="p-6 text-center">
    <AlertCircle className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
    <p className="text-sm text-muted-foreground">
      Unable to display images ({images.length} image{images.length !== 1 ? 's' : ''} failed to load)
    </p>
  </Card>
);

export const RobustImageGallery: React.FC<RobustImageGalleryProps> = (props) => (
  <ErrorBoundary 
    label="Image Gallery"
    fallback={<ImageGalleryError images={props.images} />}
  >
    <ImageGalleryContent {...props} />
  </ErrorBoundary>
);

export default RobustImageGallery;