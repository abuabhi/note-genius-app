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
  audioUrl?: string;
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
    // Add a small delay to ensure everything is loaded
    const timer = setTimeout(() => {
      fetchStudyTracks();
      ensureUserHasDefaultTracks();
    }, 100);

    return () => clearTimeout(timer);
  }, []);

  const ensureUserHasDefaultTracks = async () => {
    if (!user) return;
    
    try {
      // Check if user has a selected track in the dedicated table
      const { data: selectedTrack } = await supabase
        .from('user_selected_music_track')
        .select(`
          track_id,
          study_music_tracks (
            id,
            name,
            is_default
          )
        `)
        .eq('user_id', user.id)
        .single();

      if (selectedTrack?.track_id) {
        // User has a selected track, load it into form
        form.setValue('selectedStudyTracks', [selectedTrack.track_id]);
        return;
      }
      
      // No user selection found, find and set the admin default
      const { data: defaultTrack } = await supabase
        .from('study_music_tracks')
        .select('id')
        .eq('is_default', true)
        .eq('is_active', true)
        .single();

      if (defaultTrack) {
        // Insert the default track as user's selection
        await supabase
          .from('user_selected_music_track')
          .insert({
            user_id: user.id,
            track_id: defaultTrack.id
          });
        
        form.setValue('selectedStudyTracks', [defaultTrack.id]);
      } else {
        // No default track found, use first available track
        const { data: firstTrack } = await supabase
          .from('study_music_tracks')
          .select('id')
          .eq('is_active', true)
          .limit(1)
          .single();
          
        if (firstTrack) {
          await supabase
            .from('user_selected_music_track')
            .insert({
              user_id: user.id,
              track_id: firstTrack.id
            });
          
          form.setValue('selectedStudyTracks', [firstTrack.id]);
        }
      }
    } catch (error) {
      console.error('Error ensuring default tracks:', error);
      // Fallback: try to get any available track from database
      try {
        const { data: tracks } = await supabase
          .from('study_music_tracks')
          .select('id')
          .eq('is_active', true)
          .limit(1);
          
        if (tracks && tracks.length > 0) {
          form.setValue('selectedStudyTracks', [tracks[0].id]);
        }
      } catch (fallbackError) {
        console.error('Fallback track loading failed:', fallbackError);
      }
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
      console.log('🎵 StudyMusicSettingsCard: Fetching study tracks...');
      
      const { data, error } = await supabase.functions.invoke('get-study-music', {
        body: { category: 'all', limit: 50 }
      });

      console.log('🎵 StudyMusicSettingsCard: Edge function response:', { data, error });
      
      if (error) throw error;
      
      const tracks = data?.tracks || [];
      console.log('🎵 StudyMusicSettingsCard: Setting', tracks.length, 'tracks');
      setTracks(tracks);
      
      if (data?.source === 'youtube-curated') {
        toast.info("Loaded curated YouTube study music collection");
      }
    } catch (error) {
      console.error('🎵 StudyMusicSettingsCard: Error fetching study tracks:', error);
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

  const toggleTrackSelection = async (trackId: string) => {
    const currentSelected = selectedTracks || [];
    const isSelected = currentSelected.includes(trackId);
    
    if (isSelected) {
      // Remove track (can't remove if it's the only one, must have one selected)
      if (currentSelected.length > 1) {
        const newSelected = currentSelected.filter((id: string) => id !== trackId);
        form.setValue('selectedStudyTracks', newSelected);
        
        // Update database with first remaining track
        if (user && newSelected.length > 0) {
          await supabase
            .from('user_selected_music_track')
            .upsert({
              user_id: user.id,
              track_id: newSelected[0]
            });
        }
      } else {
        toast.warning('You must have at least one study track selected');
      }
    } else {
      // Replace current selection with new track (single selection only)
      form.setValue('selectedStudyTracks', [trackId]);
      
      // Update database immediately
      if (user) {
        await supabase
          .from('user_selected_music_track')
          .upsert({
            user_id: user.id,
            track_id: trackId
          });
      }
    }
  };

  const playPreview = async (track: StudyTrack) => {
    if (playingTrack === track.id) {
      if (audio) {
        audio.pause();
        setAudio(null);
      }
      setPlayingTrack(null);
      return;
    }

    if (audio) {
      audio.pause();
      setAudio(null);
    }

    try {
      setPlayingTrack(track.id);
      console.log('🎵 Preview track:', track.name);
      
      // Generate signed URL directly for the track
      const { data: signedUrlData } = await supabase.storage
        .from('study-music')
        .createSignedUrl(`tracks/focus-flow-study-sessions.mp3`, 3600);
      
      if (!signedUrlData?.signedUrl) {
        toast.error('Cannot load audio file');
        setPlayingTrack(null);
        return;
      }
      
      const newAudio = new Audio();
      newAudio.volume = 0.4;
      newAudio.src = signedUrlData.signedUrl;
      
      newAudio.onloadeddata = async () => {
        try {
          await newAudio.play();
          toast.success(`Playing: ${track.name}`);
        } catch {
          toast.error('Cannot play audio');
          setPlayingTrack(null);
        }
      };
      
      newAudio.onerror = () => {
        toast.error('Audio loading failed');
        setPlayingTrack(null);
      };
      
      newAudio.onended = () => {
        setPlayingTrack(null);
        setAudio(null);
      };
      
      setAudio(newAudio);
      
    } catch (error) {
      console.error('Preview error:', error);
      toast.error('Preview failed');
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