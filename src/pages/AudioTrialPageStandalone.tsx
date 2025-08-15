import React, { useState, useEffect } from 'react';
import { Search, RefreshCw, AlertCircle, CheckCircle, XCircle, Play, Pause, Volume2, VolumeX, SkipBack, SkipForward } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';

// Pixabay API integration (standalone)
const PIXABAY_API_KEY = import.meta.env.VITE_PIXABAY_API_KEY || 'your-pixabay-api-key-here';

type PixabayTrack = {
  id: number;
  previewURL: string;
  tags: string;
  user: string;
  duration: number;
  downloads: number;
  likes: number;
  webformatURL: string;
  [key: string]: any;
};

type PixabayResponse = {
  total: number;
  totalHits: number;
  hits: PixabayTrack[];
};

// Simple audio player component
function SimpleAudioPlayer({ track }: { track: PixabayTrack }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const audioRef = React.useRef<HTMLAudioElement>(null);

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

    const handleError = () => {
      setError('Failed to load audio');
      setLoading(false);
    };

    const handleLoadStart = () => {
      setLoading(true);
      setError(null);
    };

    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('error', handleError);
    audio.addEventListener('loadstart', handleLoadStart);

    return () => {
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('error', handleError);
      audio.removeEventListener('loadstart', handleLoadStart);
    };
  }, []);

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
      setError('Playback failed');
      setIsPlaying(false);
    }
  };

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const progressPercentage = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div className="bg-card border rounded-lg p-6 space-y-4">
      <div className="text-center space-y-2">
        <h3 className="font-semibold text-lg truncate">
          {track.tags.split(',')[0]?.trim() || 'Music Track'}
        </h3>
        <p className="text-muted-foreground text-sm">by {track.user}</p>
      </div>

      <audio
        ref={audioRef}
        src={track.previewURL}
        preload="metadata"
        crossOrigin="anonymous"
      />

      <div className="space-y-2">
        <div className="w-full bg-secondary rounded-full h-2">
          <div 
            className="bg-primary h-2 rounded-full" 
            style={{ width: `${progressPercentage}%` }}
          />
        </div>
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>{formatTime(currentTime)}</span>
          <span>{formatTime(duration)}</span>
        </div>
      </div>

      <div className="flex items-center justify-center">
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
      </div>

      {error && (
        <div className="text-center text-sm text-destructive bg-destructive/10 p-2 rounded">
          {error}
        </div>
      )}

      <details className="text-xs text-muted-foreground">
        <summary className="cursor-pointer">Debug Info</summary>
        <div className="mt-2 space-y-1 font-mono">
          <div>Audio URL: {track.previewURL}</div>
          <div>Playing: {isPlaying.toString()}</div>
          <div>Error: {error || 'none'}</div>
        </div>
      </details>
    </div>
  );
}

async function searchPixabayMusic(query: string): Promise<PixabayResponse> {
  const params = new URLSearchParams({
    key: PIXABAY_API_KEY,
    q: encodeURIComponent(query),
    category: 'music',
    audio_type: 'music',
    per_page: '10',
    safesearch: 'true'
  });

  const response = await fetch(`https://pixabay.com/api/?${params}`);
  
  if (!response.ok) {
    throw new Error(`Pixabay API error: ${response.status}`);
  }

  return response.json();
}

export default function AudioTrialPageStandalone() {
  const [tracks, setTracks] = useState<PixabayTrack[]>([]);
  const [currentTrack, setCurrentTrack] = useState<PixabayTrack | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    loadStudyMusic();
  }, []);

  const loadStudyMusic = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await searchPixabayMusic('study music ambient');
      setTracks(response.hits);
      if (response.hits.length > 0) {
        setCurrentTrack(response.hits[0]);
      }
    } catch (err) {
      setError('Failed to load music');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const response = await searchPixabayMusic(searchQuery);
      setTracks(response.hits);
      if (response.hits.length > 0) {
        setCurrentTrack(response.hits[0]);
      }
    } catch (err) {
      setError('Search failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container max-w-4xl mx-auto p-6 space-y-6">
      <div className="text-center space-y-4">
        <h1 className="text-3xl font-bold">Audio Trial - Direct Pixabay Integration</h1>
        <p className="text-muted-foreground">
          Testing direct Pixabay API integration with no CSP restrictions.
        </p>
        <Badge variant="default">
          <CheckCircle className="h-3 w-3 mr-1" />
          Direct Integration Active
        </Badge>
      </div>

      <div className="flex space-x-2 max-w-md mx-auto">
        <Input
          placeholder="Search for music..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
        />
        <Button onClick={handleSearch} disabled={loading}>
          <Search className="h-4 w-4" />
        </Button>
      </div>

      {error && (
        <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4 text-center">
          <div className="flex items-center justify-center space-x-2 text-destructive">
            <AlertCircle className="h-4 w-4" />
            <span>{error}</span>
          </div>
        </div>
      )}

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Now Playing</h2>
          
          {currentTrack ? (
            <SimpleAudioPlayer track={currentTrack} />
          ) : (
            <div className="bg-card border rounded-lg p-8 text-center text-muted-foreground">
              <p>No track selected</p>
            </div>
          )}
        </div>

        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Track List</h2>
          
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {loading ? (
              <div className="text-center p-4">Loading...</div>
            ) : tracks.length === 0 ? (
              <div className="text-center p-4 text-muted-foreground">No tracks found</div>
            ) : (
              tracks.map((track) => (
                <div
                  key={track.id}
                  className={`p-3 border rounded-lg cursor-pointer hover:bg-accent ${
                    currentTrack?.id === track.id ? 'ring-2 ring-primary' : ''
                  }`}
                  onClick={() => setCurrentTrack(track)}
                >
                  <div className="font-medium truncate">
                    {track.tags.split(',')[0]?.trim() || 'Music Track'}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    by {track.user} • {track.likes} likes
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      <div className="bg-muted/50 rounded-lg p-4">
        <details>
          <summary className="cursor-pointer font-medium mb-2">Configuration</summary>
          <div className="space-y-2 text-sm">
            <div>API Key configured: {PIXABAY_API_KEY !== 'your-pixabay-api-key-here' ? '✅' : '❌'}</div>
            <div>Total tracks: {tracks.length}</div>
            <div>Current track: {currentTrack?.id || 'none'}</div>
            {PIXABAY_API_KEY === 'your-pixabay-api-key-here' && (
              <div className="text-amber-600">
                ⚠️ Set VITE_PIXABAY_API_KEY environment variable
              </div>
            )}
          </div>
        </details>
      </div>
    </div>
  );
}