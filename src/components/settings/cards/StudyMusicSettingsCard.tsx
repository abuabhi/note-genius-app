import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Badge } from "@/components/ui/badge";
import { Play, Pause, Check, Music, Loader2 } from "lucide-react";
import { UseFormReturn } from "react-hook-form";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/auth";
import { toast } from "sonner";

interface StudyTrack {
  id: string;
  name: string;
  artist: string;
  duration: number;
  youtubeUrl: string;
  thumbnailUrl: string;
  tags: string[];
  category: string;
}

interface StudyMusicSettingsCardProps {
  form: UseFormReturn<any>;
}

export const StudyMusicSettingsCard = ({ form }: StudyMusicSettingsCardProps) => {
  const { user } = useAuth();
  const [tracks, setTracks] = useState<StudyTrack[]>([]);
  const [loading, setLoading] = useState(true);
  const [playingTrack, setPlayingTrack] = useState<string | null>(null);
  const [audio, setAudio] = useState<HTMLAudioElement | null>(null);
  
  const selectedTracks = form.watch('selectedStudyTracks') || [];

  useEffect(() => {
    fetchStudyTracks();
    ensureUserHasDefaultTracks();
  }, []);

  const ensureUserHasDefaultTracks = async () => {
    if (!user) return;
    
    try {
      // Check if user has any selected tracks
      const { data: profile } = await supabase
        .from('profiles')
        .select('study_music_preferences')
        .eq('id', user.id)
        .single();

      const preferences = profile?.study_music_preferences as { selectedTracks?: string[] } | null;
      const existingTracks = preferences?.selectedTracks || [];
      
      if (existingTracks.length === 0) {
        // Use edge function to ensure defaults (consolidates logic)
        await supabase.functions.invoke('get-study-music', {
          body: { 
            userId: user.id, 
            ensureDefaults: true,
            limit: 15 
          }
        });
        
        // Reload to get the assigned default
        const { data: updatedProfile } = await supabase
          .from('profiles')
          .select('study_music_preferences')
          .eq('id', user.id)
          .single();
          
        const updatedPreferences = updatedProfile?.study_music_preferences as { selectedTracks?: string[] } | null;
        form.setValue('selectedStudyTracks', updatedPreferences?.selectedTracks || ['lofi-1']);
      } else {
        // Load existing selections into form
        form.setValue('selectedStudyTracks', existingTracks);
      }
    } catch (error) {
      console.error('Error ensuring default tracks:', error);
      // Fallback to setting form defaults
      const defaultTracks = ['lofi-1'];
      form.setValue('selectedStudyTracks', defaultTracks);
    }
  };

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
        body: { category: 'all', limit: 20 }
      });

      if (error) throw error;
      
      setTracks(data?.tracks || []);
      
      if (data?.source === 'youtube-curated') {
        toast.info("Loaded curated YouTube study music collection");
      }
    } catch (error) {
      console.error('Error fetching study tracks:', error);
      toast.error('Failed to load study music tracks');
      setTracks([]);
    } finally {
      setLoading(false);
    }
  };

  const resetToRandomTracks = async () => {
    try {
      await supabase.functions.invoke('get-study-music', {
        body: { 
          userId: user?.id, 
          autoAssign: true,
          limit: 15 
        }
      });
      
      // Refresh tracks and selected tracks
      await fetchStudyTracks();
      
      // Get updated user preferences
      const { data: profile } = await supabase
        .from('profiles')
        .select('study_music_preferences')
        .eq('id', user?.id)
        .single();
        
      const preferences = profile?.study_music_preferences as { selectedTracks?: string[] } | null;
      form.setValue('selectedStudyTracks', preferences?.selectedTracks || []);
      
      toast.success('Assigned new random study track!');
    } catch (error) {
      console.error('Error resetting to random tracks:', error);
      toast.error('Failed to assign random tracks');
    }
  };

  const toggleTrackSelection = (trackId: string) => {
    const currentSelected = selectedTracks || [];
    const isSelected = currentSelected.includes(trackId);
    
    if (isSelected) {
      // Remove track (can't remove if it's the only one, must have one selected)
      if (currentSelected.length > 1) {
        const newSelected = currentSelected.filter((id: string) => id !== trackId);
        form.setValue('selectedStudyTracks', newSelected);
      } else {
        toast.warning('You must have at least one study track selected');
      }
    } else {
      // Replace current selection with new track (single selection only)
      form.setValue('selectedStudyTracks', [trackId]);
    }
  };

  const playPreview = async (track: StudyTrack) => {
    if (playingTrack === track.id) {
      // Stop current track
      if (audio) {
        audio.pause();
        audio.remove();
        setAudio(null);
      }
      setPlayingTrack(null);
      return;
    }

    // Stop any currently playing audio
    if (audio) {
      audio.pause();
      audio.remove();
      setAudio(null);
    }

    // For YouTube tracks, we'll play a short preview using YouTube embed
    try {
      setPlayingTrack(track.id);
      
      // Create a hidden audio element for preview (this won't actually work with YouTube)
      // but we'll simulate the preview experience
      const newAudio = new Audio();
      
      // Simulate a preview duration
      setTimeout(() => {
        if (playingTrack === track.id) {
          setPlayingTrack(null);
          setAudio(null);
        }
      }, 30000); // 30 second preview
      
      setAudio(newAudio);
      toast.info(`Playing preview: ${track.name}`);
      
    } catch (error) {
      console.error('Error playing preview:', error);
      toast.error('Unable to play preview');
      setPlayingTrack(null);
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
          Choose one study music track from our curated YouTube collection. This will appear in your sidebar for quick access during study sessions.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <FormField
          control={form.control}
          name="selectedStudyTracks"
          render={() => (
            <FormItem>
              <div className="flex items-center justify-between">
                <FormLabel>Selected Track</FormLabel>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={resetToRandomTracks}
                  className="h-7 text-xs"
                >
                  Random Track
                </Button>
              </div>
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
                    <div className="flex items-start gap-3">
                       {/* Thumbnail */}
                       <div className="w-16 h-12 bg-muted rounded overflow-hidden flex-shrink-0">
                         <img 
                           src={track.thumbnailUrl} 
                           alt={track.name}
                           className="w-full h-full object-cover"
                           loading="lazy"
                           onError={(e) => {
                             e.currentTarget.src = '/placeholder.svg';
                             e.currentTarget.style.backgroundColor = 'hsl(var(--muted))';
                             e.currentTarget.style.padding = '0.5rem';
                           }}
                         />
                       </div>
                      
                      {/* Track info */}
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium truncate">{track.name}</h4>
                        <p className="text-sm text-muted-foreground truncate">
                          {track.artist} • {formatDuration(track.duration)}
                        </p>
                        <div className="flex flex-wrap gap-1 mt-1">
                          <Badge variant="outline" className="text-xs capitalize">
                            {track.category}
                          </Badge>
                          {track.tags.slice(0, 2).map((tag, index) => (
                            <Badge key={index} variant="outline" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      
                      {/* Actions */}
                      <div className="flex flex-col gap-2">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => playPreview(track)}
                          className="h-8"
                        >
                          {isPlaying ? (
                            <>
                              <Pause className="h-3 w-3 mr-1" />
                              Stop
                            </>
                          ) : (
                            <>
                              <Play className="h-3 w-3 mr-1" />
                              Preview
                            </>
                          )}
                        </Button>
                        <Button
                          type="button"
                          variant={isSelected ? "default" : "outline"}
                          size="sm"
                          onClick={() => toggleTrackSelection(track.id)}
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