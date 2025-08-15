import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Badge } from "@/components/ui/badge";
import { Play, Pause, Check, Music, Loader2 } from "lucide-react";
import { UseFormReturn } from "react-hook-form";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface StudyTrack {
  id: string;
  name: string;
  artist: string;
  duration: number;
  previewUrl: string;
  tags: string[];
  webformatURL: string;
}

interface StudyMusicSettingsCardProps {
  form: UseFormReturn<any>;
}

export const StudyMusicSettingsCard = ({ form }: StudyMusicSettingsCardProps) => {
  const [tracks, setTracks] = useState<StudyTrack[]>([]);
  const [loading, setLoading] = useState(true);
  const [playingTrack, setPlayingTrack] = useState<string | null>(null);
  const [audio, setAudio] = useState<HTMLAudioElement | null>(null);
  
  const selectedTracks = form.watch('selectedStudyTracks') || [];

  useEffect(() => {
    fetchStudyTracks();
  }, []);

  useEffect(() => {
    return () => {
      if (audio) {
        audio.pause();
        audio.remove();
      }
    };
  }, [audio]);

  const fetchStudyTracks = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase.functions.invoke('get-study-music', {
        body: { category: 'music', limit: 15 }
      });

      if (error) throw error;
      
      setTracks(data?.tracks || []);
      
      if (data?.source === 'fallback') {
        toast.info("Using curated study music collection");
      }
    } catch (error) {
      console.error('Error fetching study tracks:', error);
      toast.error('Failed to load study music tracks');
      setTracks([]);
    } finally {
      setLoading(false);
    }
  };

  const toggleTrackSelection = (trackId: string) => {
    const currentSelected = selectedTracks || [];
    const isSelected = currentSelected.includes(trackId);
    
    if (isSelected) {
      // Remove track
      const newSelected = currentSelected.filter((id: string) => id !== trackId);
      form.setValue('selectedStudyTracks', newSelected);
    } else if (currentSelected.length < 3) {
      // Add track (max 3)
      const newSelected = [...currentSelected, trackId];
      form.setValue('selectedStudyTracks', newSelected);
    } else {
      toast.warning('You can only select up to 3 study tracks');
    }
  };

  const playPreview = async (track: StudyTrack) => {
    if (playingTrack === track.id) {
      // Stop current track
      if (audio) {
        audio.pause();
        setAudio(null);
      }
      setPlayingTrack(null);
      return;
    }

    // Stop any currently playing audio
    if (audio) {
      audio.pause();
      setAudio(null);
    }

    if (!track.previewUrl) {
      toast.info('Preview not available for this track');
      return;
    }

    try {
      const newAudio = new Audio(track.previewUrl);
      newAudio.volume = 0.3; // Lower volume for preview
      
      newAudio.onended = () => {
        setPlayingTrack(null);
        setAudio(null);
      };
      
      newAudio.onerror = () => {
        toast.error('Unable to play preview');
        setPlayingTrack(null);
        setAudio(null);
      };

      await newAudio.play();
      setAudio(newAudio);
      setPlayingTrack(track.id);
    } catch (error) {
      console.error('Error playing preview:', error);
      toast.error('Unable to play preview');
    }
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Music className="h-5 w-5" />
          Study Music
        </CardTitle>
        <CardDescription>
          Choose up to 3 study music tracks to appear in your sidebar. These will replace the generated noise sounds with real music for better focus.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <FormField
          control={form.control}
          name="selectedStudyTracks"
          render={() => (
            <FormItem>
              <FormLabel>Selected Tracks ({selectedTracks?.length || 0}/3)</FormLabel>
              {selectedTracks?.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-4">
                  {selectedTracks.map((trackId: string) => {
                    const track = tracks.find(t => t.id === trackId);
                    return track ? (
                      <Badge key={trackId} variant="secondary" className="text-sm">
                        {track.name} - {track.artist}
                      </Badge>
                    ) : null;
                  })}
                </div>
              )}
              <FormMessage />
            </FormItem>
          )}
        />

        {loading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin" />
            <span className="ml-2">Loading study music...</span>
          </div>
        ) : (
          <>
            <div className="grid gap-3">
              {tracks.map((track) => {
                const isSelected = selectedTracks?.includes(track.id);
                const isPlaying = playingTrack === track.id;
                
                return (
                  <div
                    key={track.id}
                    className={`border rounded-lg p-4 transition-colors ${
                      isSelected 
                        ? 'border-primary bg-primary/5' 
                        : 'border-border hover:border-primary/50'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium truncate">{track.name}</h4>
                        <p className="text-sm text-muted-foreground truncate">
                          {track.artist} • {formatDuration(track.duration)}
                        </p>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {track.tags.slice(0, 3).map((tag, index) => (
                            <Badge key={index} variant="outline" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2 ml-4">
                        {track.previewUrl && (
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => playPreview(track)}
                            className="h-8 w-8 p-0"
                          >
                            {isPlaying ? (
                              <Pause className="h-4 w-4" />
                            ) : (
                              <Play className="h-4 w-4" />
                            )}
                          </Button>
                        )}
                        
                        <Button
                          type="button"
                          variant={isSelected ? "default" : "outline"}
                          size="sm"
                          onClick={() => toggleTrackSelection(track.id)}
                          disabled={!isSelected && selectedTracks?.length >= 3}
                        >
                          {isSelected ? (
                            <>
                              <Check className="h-4 w-4 mr-1" />
                              Selected
                            </>
                          ) : (
                            'Select'
                          )}
                        </Button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {tracks.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                <Music className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No study tracks available at the moment.</p>
                <Button 
                  type="button"
                  variant="outline" 
                  onClick={fetchStudyTracks}
                  className="mt-2"
                >
                  Try Again
                </Button>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
};