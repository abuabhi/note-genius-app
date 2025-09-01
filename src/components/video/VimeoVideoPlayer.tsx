import React from 'react';

interface VimeoVideoPlayerProps {
  videoId: string;
  title?: string;
  className?: string;
}

export const VimeoVideoPlayer = ({ videoId, title = "Demo Video", className = "" }: VimeoVideoPlayerProps) => {
  const embedUrl = `https://player.vimeo.com/video/${videoId}?badge=0&autopause=0&player_id=0&app_id=58479`;

  return (
    <div className={`bg-white rounded-xl shadow-lg border border-mint-100 overflow-hidden ${className}`}>
      <div className="aspect-video w-full">
        <iframe
          src={embedUrl}
          title={title}
          allow="autoplay; fullscreen; picture-in-picture"
          allowFullScreen
          className="w-full h-full border-0"
          loading="lazy"
        />
      </div>
    </div>
  );
};