import React, { useState, useEffect } from 'react';
import { Loader2 } from 'lucide-react';

interface ReactVideoPlayerProps {
  url: string;
  fallbackUrl?: string;
  title?: string;
  className?: string;
}

export const ReactVideoPlayer = ({ 
  url, 
  fallbackUrl, 
  title = "Demo Video", 
  className = "" 
}: ReactVideoPlayerProps) => {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [currentUrl, setCurrentUrl] = useState(url);
  const [embedUrl, setEmbedUrl] = useState('');

  // Convert URL to embed format
  useEffect(() => {
    const convertToEmbedUrl = (videoUrl: string) => {
      // Vimeo URL conversion
      if (videoUrl.includes('vimeo.com')) {
        const vimeoId = videoUrl.split('/').pop() || videoUrl.match(/\d+/)?.[0];
        if (vimeoId) {
          return `https://player.vimeo.com/video/${vimeoId}?autoplay=0&badge=0&title=0&byline=0&portrait=0`;
        }
      }
      
      // YouTube URL conversion
      if (videoUrl.includes('youtube.com') || videoUrl.includes('youtu.be')) {
        let videoId = '';
        if (videoUrl.includes('youtu.be/')) {
          videoId = videoUrl.split('youtu.be/')[1].split('?')[0];
        } else if (videoUrl.includes('watch?v=')) {
          videoId = videoUrl.split('watch?v=')[1].split('&')[0];
        }
        if (videoId) {
          return `https://www.youtube.com/embed/${videoId}?autoplay=0&controls=1&rel=0`;
        }
      }
      
      // Return original URL if no conversion needed
      return videoUrl;
    };

    setEmbedUrl(convertToEmbedUrl(currentUrl));
    setIsLoading(true);
    setHasError(false);
  }, [currentUrl]);

  const handleLoad = () => {
    setIsLoading(false);
    setHasError(false);
  };

  const handleError = () => {
    console.error(`Failed to load video: ${currentUrl}`);
    
    // Try fallback URL if available and we haven't already tried it
    if (fallbackUrl && currentUrl === url) {
      console.log(`Trying fallback URL: ${fallbackUrl}`);
      setCurrentUrl(fallbackUrl);
      return;
    }
    
    setIsLoading(false);
    setHasError(true);
  };

  const handleRetry = () => {
    setCurrentUrl(url); // Reset to original URL
  };

  // Set a timeout to handle cases where onLoad never fires
  useEffect(() => {
    const timer = setTimeout(() => {
      if (isLoading) {
        setIsLoading(false);
      }
    }, 5000); // 5 second timeout

    return () => clearTimeout(timer);
  }, [isLoading, embedUrl]);

  if (hasError) {
    return (
      <div className={`bg-white rounded-xl shadow-lg border border-mint-100 overflow-hidden ${className}`}>
        <div className="aspect-video w-full flex items-center justify-center bg-gray-50">
          <div className="text-center p-6">
            <div className="text-gray-400 mb-2 text-4xl">📹</div>
            <p className="text-gray-600 mb-4">Video Unavailable</p>
            <div className="space-y-2">
              <button 
                onClick={handleRetry}
                className="px-4 py-2 bg-mint-600 text-white rounded-lg hover:bg-mint-700 transition-colors mr-2"
              >
                Try Again
              </button>
              <a 
                href={currentUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block px-4 py-2 text-mint-600 hover:text-mint-700 underline"
              >
                Watch Directly
              </a>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-xl shadow-lg border border-mint-100 overflow-hidden ${className}`}>
      <div className="aspect-video w-full relative">
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-50 z-10">
            <div className="text-center">
              <Loader2 className="h-8 w-8 animate-spin text-mint-600 mx-auto mb-2" />
              <p className="text-sm text-gray-600">Loading video...</p>
            </div>
          </div>
        )}
        <iframe
          src={embedUrl}
          title={title}
          className="w-full h-full border-0 rounded-xl"
          allow="autoplay; fullscreen; picture-in-picture; encrypted-media"
          allowFullScreen
          onLoad={handleLoad}
          onError={handleError}
          referrerPolicy="strict-origin-when-cross-origin"
        />
      </div>
    </div>
  );
};