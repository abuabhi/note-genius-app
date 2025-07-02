import React from 'react';
import { Play, Clock, Video } from 'lucide-react';

interface YouTubeComingSoonPlaceholderProps {
  title: string;
  duration: string;
  className?: string;
}

export const YouTubeComingSoonPlaceholder = ({ 
  title, 
  duration, 
  className = "" 
}: YouTubeComingSoonPlaceholderProps) => {
  return (
    <div className={`relative bg-gray-900 rounded-lg overflow-hidden ${className}`}>
      {/* Video placeholder with aspect ratio */}
      <div className="aspect-video bg-gray-800 flex items-center justify-center relative">
        {/* Overlay gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-gray-900/50 to-gray-800/80" />
        
        {/* Play button */}
        <div className="relative z-10 flex flex-col items-center gap-3">
          <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center border border-white/30">
            <Play className="h-6 w-6 text-white ml-1" fill="currentColor" />
          </div>
          <div className="text-center">
            <p className="text-white font-medium text-sm mb-1">Video Coming Soon</p>
            <p className="text-gray-300 text-xs">Content in production</p>
          </div>
        </div>

        {/* Duration badge */}
        <div className="absolute bottom-3 right-3 bg-black/70 backdrop-blur-sm px-2 py-1 rounded text-white text-xs font-medium flex items-center gap-1">
          <Clock className="h-3 w-3" />
          {duration}
        </div>

        {/* Coming soon badge */}
        <div className="absolute top-3 left-3 bg-mint-500/90 backdrop-blur-sm px-2 py-1 rounded text-white text-xs font-medium flex items-center gap-1">
          <Video className="h-3 w-3" />
          Coming Soon
        </div>
      </div>

      {/* Video info */}
      <div className="p-3 bg-gray-100">
        <h4 className="font-medium text-gray-900 text-sm flex items-center gap-2">
          <Video className="h-4 w-4 text-mint-600" />
          {title}
        </h4>
        <p className="text-xs text-gray-600 mt-1">
          Video tutorial will be available soon
        </p>
      </div>
    </div>
  );
};