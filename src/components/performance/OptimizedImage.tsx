
import { useState, useCallback, memo, useRef, useEffect } from 'react';
import { cn } from '@/lib/utils';

interface OptimizedImageProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  className?: string;
  priority?: boolean;
  placeholder?: string;
  quality?: number;
  sizes?: string;
  onLoad?: () => void;
  onError?: () => void;
}

// WebP/AVIF support detection
const supportsWebP = (() => {
  if (typeof window === 'undefined') return false;
  const canvas = document.createElement('canvas');
  canvas.width = 1;
  canvas.height = 1;
  return canvas.toDataURL('image/webp').indexOf('data:image/webp') === 0;
})();

const supportsAVIF = (() => {
  if (typeof window === 'undefined') return false;
  const canvas = document.createElement('canvas');
  canvas.width = 1;
  canvas.height = 1;
  return canvas.toDataURL('image/avif').indexOf('data:image/avif') === 0;
})();

export const OptimizedImage = memo(({ 
  src, 
  alt, 
  width, 
  height, 
  className = "", 
  priority = false,
  placeholder = "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjNmNGY2IiByeD0iNCIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBkb21pbmFudC1iYXNlbGluZT0iY2VudHJhbCIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZmlsbD0iIzlmYTJhNyIgZm9udC1mYW1pbHk9InN5c3RlbS11aSIgZm9udC1zaXplPSIxNCIgZm9udC13ZWlnaHQ9IjUwMCI+TG9hZGluZy4uLjwvdGV4dD48L3N2Zz4=",
  quality = 85,
  sizes,
  onLoad,
  onError
}: OptimizedImageProps) => {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [isInView, setIsInView] = useState(priority);
  const imgRef = useRef<HTMLImageElement>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);

  // Intersection Observer for lazy loading
  useEffect(() => {
    if (priority || isInView) return;

    observerRef.current = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          observerRef.current?.disconnect();
        }
      },
      { 
        rootMargin: '50px 0px',
        threshold: 0.1
      }
    );

    if (imgRef.current) {
      observerRef.current.observe(imgRef.current);
    }

    return () => observerRef.current?.disconnect();
  }, [priority, isInView]);

  // Generate optimized source URLs
  const generateSrcSet = useCallback((originalSrc: string) => {
    const baseUrl = originalSrc.split('?')[0];
    const isExternal = baseUrl.startsWith('http');
    
    if (isExternal) {
      // For external images, return as-is
      return originalSrc;
    }
    
    // For local images, we can potentially add size variants
    const sizes = [1, 1.5, 2]; // 1x, 1.5x, 2x
    return sizes.map(size => `${baseUrl}?w=${Math.round((width || 400) * size)}&q=${quality} ${size}x`).join(', ');
  }, [width, quality]);

  // Get optimized format source
  const getOptimizedSrc = useCallback((originalSrc: string) => {
    if (originalSrc.startsWith('data:') || originalSrc.startsWith('blob:')) {
      return originalSrc;
    }

    // Prefer AVIF, then WebP, then original
    const baseUrl = originalSrc.split('?')[0];
    const isExternal = baseUrl.startsWith('http');
    
    if (isExternal) return originalSrc;
    
    if (supportsAVIF) {
      return `${baseUrl}?format=avif&q=${quality}${width ? `&w=${width}` : ''}${height ? `&h=${height}` : ''}`;
    } else if (supportsWebP) {
      return `${baseUrl}?format=webp&q=${quality}${width ? `&w=${width}` : ''}${height ? `&h=${height}` : ''}`;
    }
    
    return originalSrc;
  }, [quality, width, height]);

  const handleLoad = useCallback(() => {
    setIsLoading(false);
    onLoad?.();
  }, [onLoad]);

  const handleError = useCallback(() => {
    setIsLoading(false);
    setHasError(true);
    onError?.();
  }, [onError]);

  if (hasError) {
    return (
      <div 
        className={cn(
          "flex items-center justify-center bg-gray-100 text-gray-400 rounded",
          className
        )}
        style={{ width, height }}
        aria-label={`Failed to load: ${alt}`}
      >
        <span className="text-sm">Image unavailable</span>
      </div>
    );
  }

  return (
    <div className="relative" ref={imgRef}>
      {isLoading && (
        <img
          src={placeholder}
          alt=""
          className={cn("absolute inset-0 object-cover", className)}
          style={{ width, height }}
          aria-hidden="true"
        />
      )}
      
      {isInView && (
        <picture>
          {/* AVIF format for modern browsers */}
          {supportsAVIF && (
            <source
              srcSet={generateSrcSet(getOptimizedSrc(src))}
              sizes={sizes}
              type="image/avif"
            />
          )}
          
          {/* WebP format for supported browsers */}
          {supportsWebP && (
            <source
              srcSet={generateSrcSet(getOptimizedSrc(src))}
              sizes={sizes}
              type="image/webp"
            />
          )}
          
          {/* Fallback to original format */}
          <img
            src={getOptimizedSrc(src)}
            srcSet={generateSrcSet(src)}
            sizes={sizes}
            alt={alt}
            width={width}
            height={height}
            className={cn(
              "transition-opacity duration-300 object-cover",
              isLoading ? "opacity-0" : "opacity-100",
              className
            )}
            onLoad={handleLoad}
            onError={handleError}
            loading={priority ? "eager" : "lazy"}
            decoding="async"
          />
        </picture>
      )}
    </div>
  );
});

OptimizedImage.displayName = 'OptimizedImage';
