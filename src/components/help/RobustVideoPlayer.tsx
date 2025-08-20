import React, { useState, useCallback } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Play, ExternalLink, AlertCircle, Clock } from 'lucide-react';
import ErrorBoundary from '@/components/common/ErrorBoundary';

interface VideoPlayerProps {
  videoUrl: string;
  title?: string;
  duration?: string;
  chapters?: Array<{
    time: number;
    title: string;
    description?: string;
  }>;
  className?: string;
}

const VideoPlayerContent: React.FC<VideoPlayerProps> = ({
  videoUrl,
  title = "Tutorial Video",
  duration,
  chapters = [],
  className = ""
}) => {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  // Extract YouTube ID from various URL formats
  const getYouTubeId = useCallback((url: string): string | null => {
    try {
      // Handle different YouTube URL formats
      const patterns = [
        /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
        /youtube\.com\/v\/([^&\n?#]+)/,
        /^([a-zA-Z0-9_-]{11})$/ // Direct ID
      ];

      for (const pattern of patterns) {
        const match = url.match(pattern);
        if (match && match[1]) {
          return match[1];
        }
      }
      return null;
    } catch {
      return null;
    }
  }, []);

  const videoId = getYouTubeId(videoUrl);

  const handleLoad = useCallback(() => {
    setIsLoading(false);
    setHasError(false);
  }, []);

  const handleError = useCallback(() => {
    setIsLoading(false);
    setHasError(true);
  }, []);

  const openYouTube = useCallback(() => {
    if (videoId) {
      window.open(`https://www.youtube.com/watch?v=${videoId}`, '_blank', 'noopener,noreferrer');
    }
  }, [videoId]);

  // Fallback for invalid video URLs
  if (!videoId || hasError) {
    return (
      <Card className={className}>
        <CardContent className="p-6 text-center">
          <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
          <h4 className="font-medium text-muted-foreground mb-2">{title}</h4>
          <p className="text-sm text-muted-foreground mb-4">
            Video unavailable or failed to load
          </p>
          <Button variant="outline" onClick={openYouTube} className="gap-2">
            <ExternalLink className="h-4 w-4" />
            Watch on YouTube
          </Button>
        </CardContent>
      </Card>
    );
  }

  const embedUrl = `https://www.youtube.com/embed/${videoId}?autoplay=0&modestbranding=1&rel=0&showinfo=0`;

  return (
    <div className={className}>
      {/* Video Header */}
      <div className="mb-3">
        <h4 className="font-medium text-foreground flex items-center gap-2">
          <Play className="h-4 w-4 text-primary" />
          {title}
        </h4>
        {duration && (
          <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
            <Clock className="h-3 w-3" />
            {duration}
          </p>
        )}
      </div>

      {/* Video Player */}
      <Card className="overflow-hidden">
        <div className="relative aspect-video">
          {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-muted/20">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          )}
          <iframe
            src={embedUrl}
            title={title}
            className="w-full h-full border-0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
            onLoad={handleLoad}
            onError={handleError}
            loading="lazy"
          />
        </div>
      </Card>

      {/* Video Chapters */}
      {chapters.length > 0 && (
        <Card className="mt-4">
          <CardContent className="p-4">
            <h5 className="font-medium text-foreground mb-3">Video Chapters</h5>
            <div className="space-y-2">
              {chapters.map((chapter, index) => (
                <div
                  key={index}
                  className="flex items-start gap-3 p-2 rounded hover:bg-muted/50 transition-colors cursor-pointer"
                  onClick={() => {
                    // Open YouTube with timestamp
                    const timeParam = `&t=${chapter.time}s`;
                    window.open(`https://www.youtube.com/watch?v=${videoId}${timeParam}`, '_blank', 'noopener,noreferrer');
                  }}
                >
                  <div className="flex-shrink-0 w-12 text-xs text-muted-foreground font-mono">
                    {Math.floor(chapter.time / 60)}:{(chapter.time % 60).toString().padStart(2, '0')}
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-sm">{chapter.title}</p>
                    {chapter.description && (
                      <p className="text-xs text-muted-foreground mt-1">{chapter.description}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

// Error Fallback Component
const VideoPlayerError: React.FC<{ title?: string }> = ({ title }) => (
  <Card className="p-6 text-center">
    <AlertCircle className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
    <p className="text-sm text-muted-foreground">
      Unable to load video: {title || "Unknown Video"}
    </p>
  </Card>
);

export const RobustVideoPlayer: React.FC<VideoPlayerProps> = (props) => (
  <ErrorBoundary 
    label="Video Player"
    fallback={<VideoPlayerError title={props.title} />}
  >
    <VideoPlayerContent {...props} />
  </ErrorBoundary>
);

export default RobustVideoPlayer;