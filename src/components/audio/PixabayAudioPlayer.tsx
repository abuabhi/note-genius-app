import React, { useState, useRef, useEffect } from 'react';
import { Play, Pause, Volume2, VolumeX, SkipBack, SkipForward } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { PixabayTrack } from '@/utils/pixabay';


interface PixabayAudioPlayerProps {
  track: PixabayTrack;
  onNext?: () => void;
  onPrevious?: () => void;
  hasNext?: boolean;
  hasPrevious?: boolean;
}

export function PixabayAudioPlayer({
  track,
  onNext,
  onPrevious,
  hasNext = false,
  hasPrevious = false
}: PixabayAudioPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState([0.7]);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleLoadedMetadata = () => {
      setDuration(audio.duration);
      setLoading(false);
    };

    const handleTimeUpdate = () => {
      setCurrentTime(audio.currentTime);
    };

    const handleEnded = () => {
      setIsPlaying(false);
      if (onNext && hasNext) {
        onNext();
      }
    };

    const handleError = (e: Event) => {
      console.error('Audio error:', e);
      setError('Failed to load audio');
      setLoading(false);
      setIsPlaying(false);
    };

    const handleLoadStart = () => {
      setLoading(true);
      setError(null);
    };

    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('ended', handleEnded);
    audio.addEventListener('error', handleError);
    audio.addEventListener('loadstart', handleLoadStart);

    return () => {
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('ended', handleEnded);
      audio.removeEventListener('error', handleError);
      audio.removeEventListener('loadstart', handleLoadStart);
    };
  }, [onNext, hasNext]);

  useEffect(() => {
    const audio = audioRef.current;
    if (audio) {
      audio.volume = isMuted ? 0 : volume[0];
    }
  }, [volume, isMuted]);

  const togglePlay = async () => {
    const audio = audioRef.current;
    if (!audio) return;

    try {
      if (isPlaying) {
        audio.pause();
        setIsPlaying(false);
      } else {
        await audio.play();
        setIsPlaying(true);
      }
    } catch (error) {
      console.error('Playback error:', error);
      setError('Playback failed');
      setIsPlaying(false);
    }
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
  };

  const handleSeek = (value: number[]) => {
    const audio = audioRef.current;
    if (audio && duration > 0) {
      const newTime = (value[0] / 100) * duration;
      audio.currentTime = newTime;
      setCurrentTime(newTime);
    }
  };

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const progressPercentage = duration > 0 ? (currentTime / duration) * 100 : 0;

  // Use direct Pixabay URL - no proxy needed
  const audioUrl = track.previewURL;

  return (
    <div className="bg-card border rounded-lg p-6 space-y-4">
      {/* Track Info */}
      <div className="text-center space-y-2">
        <h3 className="font-semibold text-lg truncate">
          {track.tags.split(',')[0]?.trim() || 'Music Track'}
        </h3>
        <p className="text-muted-foreground text-sm">by {track.user}</p>
        <p className="text-xs text-muted-foreground">
          {track.likes} likes • {track.downloads} downloads
        </p>
      </div>

      {/* Audio Element */}
      <audio
        ref={audioRef}
        src={audioUrl}
        preload="metadata"
        crossOrigin="anonymous"
      />

      {/* Progress Bar */}
      <div className="space-y-2">
        <Slider
          value={[progressPercentage]}
          onValueChange={handleSeek}
          max={100}
          step={0.1}
          className="w-full"
          disabled={duration === 0}
        />
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>{formatTime(currentTime)}</span>
          <span>{formatTime(duration)}</span>
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center justify-center space-x-4">
        <Button
          variant="outline"
          size="sm"
          onClick={onPrevious}
          disabled={!hasPrevious}
        >
          <SkipBack className="h-4 w-4" />
        </Button>

        <Button
          onClick={togglePlay}
          disabled={loading}
          size="lg"
          className="w-12 h-12 rounded-full"
        >
          {loading ? (
            <div className="animate-spin rounded-full h-4 w-4 border-2 border-background border-t-transparent" />
          ) : isPlaying ? (
            <Pause className="h-5 w-5" />
          ) : (
            <Play className="h-5 w-5" />
          )}
        </Button>

        <Button
          variant="outline"
          size="sm"
          onClick={onNext}
          disabled={!hasNext}
        >
          <SkipForward className="h-4 w-4" />
        </Button>
      </div>

      {/* Volume Control */}
      <div className="flex items-center space-x-3">
        <Button
          variant="ghost"
          size="sm"
          onClick={toggleMute}
        >
          {isMuted ? (
            <VolumeX className="h-4 w-4" />
          ) : (
            <Volume2 className="h-4 w-4" />
          )}
        </Button>
        <Slider
          value={volume}
          onValueChange={setVolume}
          max={1}
          step={0.01}
          className="flex-1"
        />
      </div>

      {/* Error Display */}
      {error && (
        <div className="text-center text-sm text-destructive bg-destructive/10 p-2 rounded">
          {error}
        </div>
      )}

      {/* Debug Info */}
      <details className="text-xs text-muted-foreground">
        <summary className="cursor-pointer">Debug Info</summary>
        <div className="mt-2 space-y-1 font-mono">
          <div>Audio URL: {audioUrl}</div>
          <div>ID: {track.id}</div>
          <div>Duration: {track.duration}s</div>
          <div>Playing: {isPlaying.toString()}</div>
          <div>Loading: {loading.toString()}</div>
          <div>Error: {error || 'none'}</div>
        </div>
      </details>
    </div>
  );
}