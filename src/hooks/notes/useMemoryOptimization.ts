import { useCallback, useRef, useEffect } from 'react';
import { Note } from '@/types/note';
import { useManagedInterval } from '@/utils/performance';

interface MemoryOptimizationConfig {
  enableLazyLoading: boolean;
  enableGarbageCollection: boolean;
  maxConcurrentImages: number;
  gcInterval: number; // GC interval in seconds
  memoryThreshold: number; // Memory threshold in MB before aggressive cleanup
}

interface UseMemoryOptimizationProps {
  config?: Partial<MemoryOptimizationConfig>;
  debugMode?: boolean;
}

export const useMemoryOptimization = ({
  config = {},
  debugMode = false
}: UseMemoryOptimizationProps = {}) => {
  const defaultConfig: MemoryOptimizationConfig = {
    enableLazyLoading: true,
    enableGarbageCollection: true,
    maxConcurrentImages: 10,
    gcInterval: 30,
    memoryThreshold: 50,
    ...config,
  };

  const loadedImages = useRef<Set<string>>(new Set());
  const imageObserver = useRef<IntersectionObserver | null>(null);
  const offScreenComponents = useRef<Set<string>>(new Set());
  const memoryStats = useRef({
    imagesLoaded: 0,
    componentsCleanedUp: 0,
    memoryFreed: 0,
    lastGCRun: Date.now(),
  });

  // Initialize intersection observer for lazy loading
  const initializeImageObserver = useCallback(() => {
    if (!defaultConfig.enableLazyLoading || imageObserver.current) return;

    imageObserver.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const img = entry.target as HTMLImageElement;
            const dataSrc = img.getAttribute('data-src');
            
            if (dataSrc && !loadedImages.current.has(dataSrc)) {
              // Check if we're at the concurrent limit
              if (loadedImages.current.size >= defaultConfig.maxConcurrentImages) {
                // Unload oldest images
                const oldestImages = Array.from(loadedImages.current).slice(0, 2);
                oldestImages.forEach(src => {
                  loadedImages.current.delete(src);
                  // Force garbage collection of image
                  const imgs = document.querySelectorAll(`img[src="${src}"]`);
                  imgs.forEach(imgEl => {
                    (imgEl as HTMLImageElement).src = '';
                  });
                });
              }

              img.src = dataSrc;
              img.removeAttribute('data-src');
              loadedImages.current.add(dataSrc);
              memoryStats.current.imagesLoaded++;
              
              if (debugMode) {
                console.log('🖼️ Lazy loaded image:', dataSrc, `(${loadedImages.current.size}/${defaultConfig.maxConcurrentImages})`);
              }
            }
            
            imageObserver.current?.unobserve(entry.target);
          }
        });
      },
      {
        rootMargin: '50px 0px', // Start loading 50px before entering viewport
        threshold: 0.1,
      }
    );
  }, [defaultConfig.enableLazyLoading, defaultConfig.maxConcurrentImages, debugMode]);

  // Setup lazy loading for an image element
  const setupLazyImage = useCallback((imgElement: HTMLImageElement, src: string) => {
    if (!defaultConfig.enableLazyLoading || !imageObserver.current) return;

    imgElement.setAttribute('data-src', src);
    imgElement.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMSIgaGVpZ2h0PSIxIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9IiNmMGYwZjAiLz48L3N2Zz4='; // 1x1 gray placeholder
    imageObserver.current.observe(imgElement);
  }, [defaultConfig.enableLazyLoading]);

  // Mark component as off-screen for potential cleanup
  const markOffScreen = useCallback((componentId: string) => {
    offScreenComponents.current.add(componentId);
    
    if (debugMode) {
      console.log('📱 Marked off-screen:', componentId, `(${offScreenComponents.current.size} total)`);
    }
  }, [debugMode]);

  // Mark component as on-screen (remove from cleanup candidates)
  const markOnScreen = useCallback((componentId: string) => {
    offScreenComponents.current.delete(componentId);
  }, []);

  // Force garbage collection for off-screen components
  const performGarbageCollection = useCallback(() => {
    if (!defaultConfig.enableGarbageCollection) return;

    const beforeMemory = getMemoryUsage();
    let cleanedUp = 0;

    // Clean up off-screen components
    offScreenComponents.current.forEach((componentId) => {
      const element = document.querySelector(`[data-component-id="${componentId}"]`);
      if (element) {
        // Remove event listeners and clear references
        const images = element.querySelectorAll('img');
        images.forEach(img => {
          img.src = '';
          img.removeAttribute('data-src');
        });
        
        // Clear any cached content
        const textElements = element.querySelectorAll('[data-cached-content]');
        textElements.forEach(el => {
          el.removeAttribute('data-cached-content');
        });
        
        cleanedUp++;
      }
    });

    // Clear off-screen components set
    offScreenComponents.current.clear();

    // Force browser garbage collection if available
    if ('gc' in window && typeof (window as any).gc === 'function') {
      (window as any).gc();
    }

    const afterMemory = getMemoryUsage();
    const memoryFreed = beforeMemory - afterMemory;
    
    memoryStats.current.componentsCleanedUp += cleanedUp;
    memoryStats.current.memoryFreed += memoryFreed;
    memoryStats.current.lastGCRun = Date.now();

    if (debugMode) {
      console.log('🗑️ Garbage collection completed:', {
        componentsCleanedUp: cleanedUp,
        memoryFreed: `${memoryFreed.toFixed(1)}MB`,
        totalFreed: `${memoryStats.current.memoryFreed.toFixed(1)}MB`,
      });
    }

    return {
      componentsCleanedUp: cleanedUp,
      memoryFreed,
      totalMemoryFreed: memoryStats.current.memoryFreed,
    };
  }, [defaultConfig.enableGarbageCollection, debugMode]);

  // Get current memory usage
  const getMemoryUsage = useCallback((): number => {
    if ('memory' in performance) {
      const memory = (performance as any).memory;
      return memory.usedJSHeapSize / 1024 / 1024; // Convert to MB
    }
    return 0;
  }, []);

  // Setup automatic garbage collection with managed interval
  const gcCallback = useCallback(() => {
    const currentMemory = getMemoryUsage();
    
    // Run GC if memory threshold is exceeded or if it's been a while
    if (currentMemory > defaultConfig.memoryThreshold || 
        Date.now() - memoryStats.current.lastGCRun > defaultConfig.gcInterval * 1000) {
      performGarbageCollection();
    }
  }, [defaultConfig.memoryThreshold, defaultConfig.gcInterval, performGarbageCollection, getMemoryUsage]);

  useManagedInterval(
    'memory-gc',
    gcCallback,
    defaultConfig.enableGarbageCollection ? defaultConfig.gcInterval * 1000 : null
  );

  // Initialize on mount
  useEffect(() => {
    initializeImageObserver();

    return () => {
      if (imageObserver.current) {
        imageObserver.current.disconnect();
      }
    };
  }, [initializeImageObserver]);

  // Optimize note content by truncating large text and deferring complex rendering
  const optimizeNoteContent = useCallback((note: Note, isVisible: boolean): Note => {
    if (!isVisible) {
      // Return minimal note data for off-screen notes
      return {
        ...note,
        content: note.content ? note.content.substring(0, 100) + '...' : note.content,
        description: note.description ? note.description.substring(0, 100) + '...' : note.description,
      };
    }

    return note;
  }, []);

  // Get memory optimization stats
  const getMemoryStats = useCallback(() => ({
    ...memoryStats.current,
    currentMemoryUsage: getMemoryUsage(),
    loadedImages: loadedImages.current.size,
    offScreenComponents: offScreenComponents.current.size,
    isGCEnabled: defaultConfig.enableGarbageCollection,
    isLazyLoadingEnabled: defaultConfig.enableLazyLoading,
  }), [getMemoryUsage, defaultConfig]);

  // Manual cleanup trigger
  const forceCleanup = useCallback(() => {
    // Clear all loaded images
    loadedImages.current.clear();
    
    // Perform garbage collection
    const gcResult = performGarbageCollection();
    
    // Clear image cache
    const images = document.querySelectorAll('img[data-src]');
    images.forEach(img => {
      (img as HTMLImageElement).src = '';
    });

    if (debugMode) {
      console.log('🧹 Manual cleanup completed:', gcResult);
    }

    return gcResult;
  }, [performGarbageCollection, debugMode]);

  return {
    setupLazyImage,
    markOffScreen,
    markOnScreen,
    optimizeNoteContent,
    performGarbageCollection,
    forceCleanup,
    getMemoryStats,
    getMemoryUsage,
  };
};

export default useMemoryOptimization;