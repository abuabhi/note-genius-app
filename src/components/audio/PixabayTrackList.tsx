import React from 'react';
import { PixabayTrack } from '@/utils/pixabay';
import { Button } from '@/components/ui/button';
import { Play, Heart, Download } from 'lucide-react';

interface PixabayTrackListProps {
  tracks: PixabayTrack[];
  currentTrack?: PixabayTrack;
  onTrackSelect: (track: PixabayTrack) => void;
  loading?: boolean;
}

export function PixabayTrackList({
  tracks,
  currentTrack,
  onTrackSelect,
  loading = false
}: PixabayTrackListProps) {
  if (loading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="bg-card border rounded-lg p-4 animate-pulse">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-muted rounded" />
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-muted rounded w-3/4" />
                <div className="h-3 bg-muted rounded w-1/2" />
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (tracks.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <p>No tracks found. Try a different search term.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {tracks.map((track) => {
        const isCurrentTrack = currentTrack?.id === track.id;
        const mainTag = track.tags.split(',')[0]?.trim() || 'Music Track';
        
        return (
          <div
            key={track.id}
            className={`bg-card border rounded-lg p-4 transition-colors ${
              isCurrentTrack ? 'ring-2 ring-primary' : ''
            }`}
          >
            <div className="flex items-center space-x-4">
              {/* Play Button */}
              <Button
                variant={isCurrentTrack ? "default" : "outline"}
                size="sm"
                onClick={() => onTrackSelect(track)}
                className="shrink-0"
              >
                <Play className="h-4 w-4" />
              </Button>

              {/* Track Info */}
              <div className="flex-1 min-w-0">
                <h4 className="font-medium truncate">{mainTag}</h4>
                <p className="text-sm text-muted-foreground">by {track.user}</p>
                <div className="flex items-center space-x-4 mt-1 text-xs text-muted-foreground">
                  <span className="flex items-center">
                    <Heart className="h-3 w-3 mr-1" />
                    {track.likes}
                  </span>
                  <span className="flex items-center">
                    <Download className="h-3 w-3 mr-1" />
                    {track.downloads}
                  </span>
                  <span>{track.duration}s</span>
                </div>
              </div>

              {/* Tags */}
              <div className="hidden md:flex flex-wrap gap-1 max-w-xs">
                {track.tags.split(',').slice(0, 3).map((tag, index) => (
                  <span
                    key={index}
                    className="px-2 py-1 bg-muted text-xs rounded-full"
                  >
                    {tag.trim()}
                  </span>
                ))}
              </div>
            </div>

            {/* Mobile Tags */}
            <div className="md:hidden mt-3 flex flex-wrap gap-1">
              {track.tags.split(',').slice(0, 4).map((tag, index) => (
                <span
                  key={index}
                  className="px-2 py-1 bg-muted text-xs rounded-full"
                >
                  {tag.trim()}
                </span>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}