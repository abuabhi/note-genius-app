import React, { useState } from 'react';

interface VimeoVideoPlayerProps {
  videoId: string;
  title?: string;
  className?: string;
}

export const VimeoVideoPlayer = ({ videoId, title = "Demo Video", className = "" }: VimeoVideoPlayerProps) => {
  const [hasError, setHasError] = useState(false);
  const embedUrl = `https://player.vimeo.com/video/${videoId}?autoplay=0&badge=0&autopause=0&title=0&byline=0&portrait=0&responsive=1`;

  const handleError = () => {
    console.error(`Failed to load Vimeo video: ${videoId}`);
    setHasError(true);
  };

  if (hasError) {
    return (
      <div className={`bg-white rounded-xl shadow-lg border border-mint-100 overflow-hidden ${className}`}>
        <div className="aspect-video w-full flex items-center justify-center bg-gray-50">
          <div className="text-center p-6">
            <div className="text-gray-400 mb-2">📹</div>
            <p className="text-gray-600 mb-2">Video Unavailable</p>
            <a 
              href={`https://vimeo.com/${videoId}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:text-primary/80 underline"
            >
              Watch on Vimeo
            </a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-xl shadow-lg border border-mint-100 overflow-hidden ${className}`}>
      <div className="aspect-video w-full">
        <iframe
          src={embedUrl}
          title={title}
          frameBorder="0"
          allow="autoplay; fullscreen; picture-in-picture; encrypted-media"
          allowFullScreen
          className="w-full h-full border-0"
          referrerPolicy="strict-origin-when-cross-origin"
        />
      </div>
    </div>
  );
};