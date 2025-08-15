import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Play, Pause, Music, Volume2 } from 'lucide-react';
import { Slider } from '@/components/ui/slider';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/auth';
import StudyMusicManager from '@/utils/audio/StudyMusicManager';

interface MusicTrack {
  id: string;
  name: string;
  artist: string;
  audioUrl: string;
  thumbnailUrl: string;
  duration: number;
  category: string;
  tags: string[];
}

interface MusicSelectorProps {
  value?: string;
  onChange?: (trackId: string) => void;
}

export const MusicSelector = ({ value, onChange }: MusicSelectorProps) => {
  const { user } = useAuth();
  const [tracks, setTracks] = useState<MusicTrack[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTrack, setSelectedTrack] = useState<string>(value || '');
  const [previewingTrack, setPreviewingTrack] = useState<string | null>(null);
  const [previewVolume, setPreviewVolume] = useState([0.3]);
  const [categories, setCategories] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState('all');

  const musicManager = StudyMusicManager.instance;

  useEffect(() => {
    loadTracks();
  }, [selectedCategory]);

  useEffect(() => {
    if (value && value !== selectedTrack) {
      setSelectedTrack(value);
    }
  }, [value]);

  const loadTracks = async () => {
    try {
      const { data, error } = await supabase.functions.invoke('get-study-music', {
        body: { category: selectedCategory, limit: 50 }
      });

      if (error) throw error;

      const tracks = data?.tracks || [];
      const categories = data?.categories || [];
      
      setTracks(tracks);
      setCategories(['all', ...categories]);
    } catch (error) {
      console.error('Error loading tracks:', error);
      toast.error('Failed to load music tracks');
    } finally {
      setLoading(false);
    }
  };

  const handleTrackSelect = async (trackId: string) => {
    setSelectedTrack(trackId);
    
    if (onChange) {
      onChange(trackId);
    }

    // Update user's selection in database
    if (user) {
      try {
        const { error } = await supabase
          .from('user_selected_music_track')
          .upsert({
            user_id: user.id,
            track_id: trackId,
            selected_at: new Date().toISOString()
          });

        if (error) throw error;
        toast.success('Music selection saved');
      } catch (error) {
        console.error('Error saving selection:', error);
        toast.error('Failed to save selection');
      }
    }
  };

  const togglePreview = async (track: MusicTrack) => {
    if (previewingTrack === track.id) {
      // Stop preview
      musicManager.stop();
      setPreviewingTrack(null);
    } else {
      // Start preview
      try {
        musicManager.setTracks([{
          id: track.id,
          name: track.name,
          artist: track.artist,
          url: track.audioUrl,
          duration: Math.min(track.duration, 30), // 30-second preview
          audio_file_path: track.audioUrl // Use audioUrl as the file path for previews
        }]);
        musicManager.setVolume(previewVolume[0]);
        await musicManager.playTrack(track.id);
        setPreviewingTrack(track.id);

        // Auto-stop after 30 seconds
        setTimeout(() => {
          if (previewingTrack === track.id) {
            musicManager.stop();
            setPreviewingTrack(null);
          }
        }, 30000);
      } catch (error) {
        console.error('Error playing preview:', error);
        toast.error('Failed to play preview');
      }
    }
  };

  const handleVolumeChange = (newVolume: number[]) => {
    setPreviewVolume(newVolume);
    musicManager.setVolume(newVolume[0]);
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center h-32">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Music className="h-5 w-5" />
          Study Music Selection
        </CardTitle>
        <CardDescription>
          Choose your preferred study music. You can preview tracks before selecting.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Category Filter */}
        <div>
          <Label className="text-sm font-medium mb-2 block">Category</Label>
          <div className="flex flex-wrap gap-2">
            {categories.map((category) => (
              <Button
                key={category}
                variant={selectedCategory === category ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedCategory(category)}
                className="capitalize"
              >
                {category === 'all' ? 'All Categories' : category}
              </Button>
            ))}
          </div>
        </div>

        {/* Volume Control for Previews */}
        <div className="space-y-2">
          <Label className="text-sm font-medium flex items-center gap-2">
            <Volume2 className="h-4 w-4" />
            Preview Volume
          </Label>
          <Slider
            value={previewVolume}
            onValueChange={handleVolumeChange}
            max={1}
            min={0}
            step={0.1}
            className="w-32"
          />
        </div>

        {/* Track Selection */}
        <div>
          <Label className="text-sm font-medium mb-3 block">Select Track</Label>
          <RadioGroup value={selectedTrack} onValueChange={handleTrackSelect}>
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {tracks.map((track) => (
                <div key={track.id} className="flex items-center space-x-3 p-3 rounded-lg border hover:bg-muted/50">
                  <RadioGroupItem value={track.id} id={track.id} />
                  
                  {/* Track Info */}
                  <div className="flex-1 min-w-0">
                    <Label htmlFor={track.id} className="cursor-pointer">
                      <div className="font-medium truncate">{track.name}</div>
                      <div className="text-sm text-muted-foreground truncate">{track.artist}</div>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="outline" className="text-xs">
                          {track.category}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          {formatDuration(track.duration)}
                        </span>
                      </div>
                      {track.tags.length > 0 && (
                        <div className="flex gap-1 mt-1">
                          {track.tags.slice(0, 3).map((tag, index) => (
                            <Badge key={index} variant="secondary" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </Label>
                  </div>

                  {/* Preview Button */}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => togglePreview(track)}
                    disabled={!track.audioUrl}
                    className="shrink-0"
                  >
                    {previewingTrack === track.id ? (
                      <Pause className="h-4 w-4" />
                    ) : (
                      <Play className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              ))}
            </div>
          </RadioGroup>
        </div>

        {tracks.length === 0 && (
          <div className="text-center py-8">
            <Music className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No tracks available</h3>
            <p className="text-muted-foreground">
              {selectedCategory === 'all' 
                ? 'No music tracks have been uploaded yet.'
                : `No tracks found in the ${selectedCategory} category.`
              }
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};