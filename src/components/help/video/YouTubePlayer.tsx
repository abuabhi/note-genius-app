
import React, { useState } from 'react';
import { VideoContent } from '@/types/help';
import { Play, Pause, Volume2, VolumeX, Maximize } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

interface YouTubePlayerProps {
  video: VideoContent;
  autoplay?: boolean;
  showControls?: boolean;
  className?: string;
}

export const YouTubePlayer: React.FC<YouTubePlayerProps> = ({
  video,
  autoplay = false,
  showControls = true,
  className = ''
}) => {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(false);

  const embedUrl = `https://www.youtube-nocookie.com/embed/${video.youtubeId}?` +
    `autoplay=${autoplay ? 1 : 0}&` +
    `rel=0&` +
    `modestbranding=1&` +
    `controls=${showControls ? 1 : 0}&` +
    `enablejsapi=1`;

  const handleLoad = () => {
    setIsLoading(false);
  };

  const handleError = () => {
    setError(true);
    setIsLoading(false);
  };

  if (error) {
    return (
      <Card className="p-8 text-center bg-gray-50">
        <div className="space-y-4">
          <div className="w-16 h-16 mx-auto bg-gray-200 rounded-full flex items-center justify-center">
            <Play className="h-6 w-6 text-gray-400" />
          </div>
          <div>
            <h3 className="font-medium text-gray-900">Video unavailable</h3>
            <p className="text-sm text-gray-600 mt-1">
              This video is temporarily unavailable. Please try again later.
            </p>
          </div>
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => window.open(`https://youtube.com/watch?v=${video.youtubeId}`, '_blank')}
          >
            Watch on YouTube
          </Button>
        </div>
      </Card>
    );
  }

  return (
    <div className={`relative bg-black rounded-lg overflow-hidden ${className}`}>
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100 rounded-lg">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-mint-600"></div>
        </div>
      )}
      
      <div className="relative pb-[56.25%] h-0"> {/* 16:9 aspect ratio */}
        <iframe
          src={embedUrl}
          title={video.title}
          className="absolute inset-0 w-full h-full"
          frameBorder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          onLoad={handleLoad}
          onError={handleError}
        />
      </div>

      {/* Video chapters overlay */}
      {video.chapters && video.chapters.length > 0 && (
        <div className="mt-4 space-y-2">
          <h4 className="text-sm font-medium text-gray-700">Chapters</h4>
          <div className="space-y-1">
            {video.chapters.map((chapter, index) => (
              <div key={index} className="flex items-center gap-3 p-2 rounded hover:bg-gray-50 cursor-pointer">
                <span className="text-xs text-gray-500 font-mono">
                  {Math.floor(chapter.time / 60)}:{(chapter.time % 60).toString().padStart(2, '0')}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">{chapter.title}</p>
                  {chapter.description && (
                    <p className="text-xs text-gray-600 truncate">{chapter.description}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
