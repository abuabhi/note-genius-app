import React, { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ImageGalleryProps {
  images: string[];
  className?: string;
}

const ImageGallery: React.FC<ImageGalleryProps> = ({ 
  images, 
  className = '' 
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  if (!images || images.length === 0) {
    return null;
  }

  if (images.length === 1) {
    return (
      <div className={`my-4 ${className}`}>
        <img
          src={images[0]}
          alt="Help illustration"
          className="w-full min-h-[600px] max-h-[800px] rounded-lg shadow-md object-contain bg-muted/30"
          onError={(e) => {
            e.currentTarget.style.display = 'none';
          }}
        />
      </div>
    );
  }

  const nextImage = () => {
    setCurrentIndex((prev) => (prev + 1) % images.length);
  };

  const prevImage = () => {
    setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  return (
    <div className={`my-4 ${className}`}>
      {/* Main Image Display */}
      <div className="relative">
        <img
          src={images[currentIndex]}
          alt={`Help illustration ${currentIndex + 1}`}
          className="w-full min-h-[600px] max-h-[800px] rounded-lg shadow-md object-contain bg-muted/30"
          onError={(e) => {
            e.currentTarget.style.display = 'none';
          }}
        />
        
        {/* Navigation Arrows */}
        <Button
          variant="outline"
          size="sm"
          className="absolute left-2 top-1/2 -translate-y-1/2 bg-background/80 backdrop-blur-sm"
          onClick={prevImage}
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        
        <Button
          variant="outline"
          size="sm"
          className="absolute right-2 top-1/2 -translate-y-1/2 bg-background/80 backdrop-blur-sm"
          onClick={nextImage}
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
      
      {/* Thumbnail Strip */}
      <div className="flex justify-center gap-2 mt-3 px-4 overflow-x-auto">
        {images.map((image, index) => (
          <button
            key={index}
            onClick={() => setCurrentIndex(index)}
            className={`flex-shrink-0 w-24 h-24 rounded border-2 overflow-hidden transition-all ${
              index === currentIndex 
                ? 'border-primary shadow-lg' 
                : 'border-border hover:border-primary/50'
            }`}
          >
            <img
              src={image}
              alt={`Thumbnail ${index + 1}`}
              className="w-full h-full object-cover"
              onError={(e) => {
                e.currentTarget.style.display = 'none';
              }}
            />
          </button>
        ))}
      </div>
      
      {/* Image Counter */}
      <div className="text-center mt-2 text-sm text-muted-foreground">
        {currentIndex + 1} of {images.length}
      </div>
    </div>
  );
};

// Export both named and default
export { ImageGallery };
export default ImageGallery;