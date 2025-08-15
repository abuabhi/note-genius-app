import React, { useState, useEffect } from 'react';
import { Search, RefreshCw, AlertCircle, CheckCircle, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PixabayAudioPlayer } from '@/components/audio/PixabayAudioPlayer';
import { PixabayTrackList } from '@/components/audio/PixabayTrackList';
import { searchMusic, getMusicByCategory, PixabayTrack, PixabayResponse } from '@/utils/pixabay';
import { toast } from 'sonner';

const MUSIC_CATEGORIES = [
  { id: 'study', label: 'Study Music', emoji: '📚' },
  { id: 'relaxing', label: 'Relaxing', emoji: '🧘' },
  { id: 'upbeat', label: 'Upbeat', emoji: '⚡' },
  { id: 'classical', label: 'Classical', emoji: '🎼' },
  { id: 'electronic', label: 'Electronic', emoji: '🎵' },
  { id: 'nature', label: 'Nature Sounds', emoji: '🌿' }
];

export default function AudioTrialPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [currentTrack, setCurrentTrack] = useState<PixabayTrack | null>(null);
  const [tracks, setTracks] = useState<PixabayTrack[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeCategory, setActiveCategory] = useState('study');
  const [cspStatus, setCspStatus] = useState<'unknown' | 'working' | 'blocked'>('unknown');

  // Load initial category on mount
  useEffect(() => {
    loadCategory('study');
  }, []);

  // Monitor CSP status based on audio loading
  useEffect(() => {
    if (currentTrack) {
      // Reset CSP status when new track is selected
      setCspStatus('unknown');
    }
  }, [currentTrack]);

  const loadCategory = async (category: string) => {
    setLoading(true);
    setError(null);
    setActiveCategory(category);
    
    try {
      const response: PixabayResponse = await getMusicByCategory(category);
      setTracks(response.hits);
      
      if (response.hits.length > 0) {
        setCurrentTrack(response.hits[0]);
      }
      
      toast.success(`Loaded ${response.hits.length} ${category} tracks`);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load music';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const response: PixabayResponse = await searchMusic(searchQuery.trim());
      setTracks(response.hits);
      
      if (response.hits.length > 0) {
        setCurrentTrack(response.hits[0]);
      }
      
      toast.success(`Found ${response.hits.length} tracks for "${searchQuery}"`);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Search failed';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleTrackSelect = (track: PixabayTrack) => {
    setCurrentTrack(track);
    setCspStatus('unknown');
  };

  const handleNext = () => {
    if (!currentTrack || tracks.length === 0) return;
    
    const currentIndex = tracks.findIndex(t => t.id === currentTrack.id);
    const nextIndex = (currentIndex + 1) % tracks.length;
    setCurrentTrack(tracks[nextIndex]);
  };

  const handlePrevious = () => {
    if (!currentTrack || tracks.length === 0) return;
    
    const currentIndex = tracks.findIndex(t => t.id === currentTrack.id);
    const previousIndex = currentIndex === 0 ? tracks.length - 1 : currentIndex - 1;
    setCurrentTrack(tracks[previousIndex]);
  };

  const getCurrentTrackIndex = () => {
    if (!currentTrack) return -1;
    return tracks.findIndex(t => t.id === currentTrack.id);
  };

  const currentIndex = getCurrentTrackIndex();
  const hasNext = tracks.length > 0 && currentIndex < tracks.length - 1;
  const hasPrevious = tracks.length > 0 && currentIndex > 0;

  // Monitor audio events for CSP status
  useEffect(() => {
    const handleAudioEvents = () => {
      const audioElements = document.querySelectorAll('audio');
      
      audioElements.forEach(audio => {
        const handleCanPlay = () => setCspStatus('working');
        const handleError = () => setCspStatus('blocked');
        
        audio.addEventListener('canplay', handleCanPlay);
        audio.addEventListener('error', handleError);
        
        return () => {
          audio.removeEventListener('canplay', handleCanPlay);
          audio.removeEventListener('error', handleError);
        };
      });
    };

    handleAudioEvents();
  }, [currentTrack]);

  return (
    <div className="container max-w-6xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="text-center space-y-4">
        <h1 className="text-3xl font-bold">Audio Trial - Pixabay Music</h1>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Testing external audio sources to diagnose CSP (Content Security Policy) issues. 
          This page uses Pixabay's royalty-free music API to test audio playback compatibility.
        </p>
        
        {/* CSP Status */}
        <div className="flex justify-center">
          <Badge variant={
            cspStatus === 'working' ? 'default' : 
            cspStatus === 'blocked' ? 'destructive' : 
            'outline'
          }>
            {cspStatus === 'working' && <CheckCircle className="h-3 w-3 mr-1" />}
            {cspStatus === 'blocked' && <XCircle className="h-3 w-3 mr-1" />}
            {cspStatus === 'unknown' && <AlertCircle className="h-3 w-3 mr-1" />}
            CSP Status: {cspStatus === 'working' ? 'Audio Working' : 
                        cspStatus === 'blocked' ? 'Audio Blocked' : 
                        'Testing...'}
          </Badge>
        </div>
      </div>

      {/* Search */}
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

      {/* Categories */}
      <div className="flex flex-wrap justify-center gap-2">
        {MUSIC_CATEGORIES.map((category) => (
          <Button
            key={category.id}
            variant={activeCategory === category.id ? 'default' : 'outline'}
            size="sm"
            onClick={() => loadCategory(category.id)}
            disabled={loading}
          >
            <span className="mr-2">{category.emoji}</span>
            {category.label}
          </Button>
        ))}
      </div>

      {/* Error Display */}
      {error && (
        <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4 text-center">
          <div className="flex items-center justify-center space-x-2 text-destructive">
            <AlertCircle className="h-4 w-4" />
            <span>{error}</span>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Audio Player */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Now Playing</h2>
          
          {currentTrack ? (
            <PixabayAudioPlayer
              track={currentTrack}
              onNext={handleNext}
              onPrevious={handlePrevious}
              hasNext={hasNext}
              hasPrevious={hasPrevious}
            />
          ) : (
            <div className="bg-card border rounded-lg p-8 text-center text-muted-foreground">
              <p>Select a track to start playing</p>
            </div>
          )}
        </div>

        {/* Track List */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Track List</h2>
            <Button
              variant="outline"
              size="sm"
              onClick={() => loadCategory(activeCategory)}
              disabled={loading}
            >
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            </Button>
          </div>
          
          <PixabayTrackList
            tracks={tracks}
            currentTrack={currentTrack}
            onTrackSelect={handleTrackSelect}
            loading={loading}
          />
        </div>
      </div>

      {/* Debug Information */}
      <div className="bg-muted/50 rounded-lg p-4">
        <details>
          <summary className="cursor-pointer font-medium mb-2">Debug Information</summary>
          <div className="space-y-2 text-sm font-mono">
            <div>Total tracks loaded: {tracks.length}</div>
            <div>Current track ID: {currentTrack?.id || 'none'}</div>
            <div>Active category: {activeCategory}</div>
            <div>Loading state: {loading.toString()}</div>
            <div>CSP status: {cspStatus}</div>
            <div>Error state: {error || 'none'}</div>
            <div>Current URL: {currentTrack?.previewURL || 'none'}</div>
            <div>Browser: {navigator.userAgent.split(' ').slice(-1)[0]}</div>
          </div>
        </details>
      </div>
    </div>
  );
}