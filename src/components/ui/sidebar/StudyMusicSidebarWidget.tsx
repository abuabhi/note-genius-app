import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Slider } from "@/components/ui/slider";
import { Music, Play, Pause, Volume2, Settings } from "lucide-react";
import { NavLink } from "./NavLink";
import { useAuth } from "@/contexts/auth";
import { supabase } from "@/integrations/supabase/client";
import StudyMusicManager, { StudyMusicTrack } from "@/utils/audio/StudyMusicManager";
import { toast } from "sonner";

interface StudyMusicSidebarWidgetProps {
  isCollapsed: boolean;
}

export const StudyMusicSidebarWidget = ({ isCollapsed }: StudyMusicSidebarWidgetProps) => {
  const { user } = useAuth();
  const [selectedTracks, setSelectedTracks] = useState<StudyMusicTrack[]>([]);
  const [currentTrack, setCurrentTrack] = useState<StudyMusicTrack | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(60);
  const [loading, setLoading] = useState(true);

  const manager = StudyMusicManager.instance;

  useEffect(() => {
    if (user) {
      loadUserMusicPreferences();
    }
  }, [user]);

  useEffect(() => {
    manager.setVolume(volume / 100);
  }, [volume, manager]);

  const loadUserMusicPreferences = async () => {
    try {
      setLoading(true);
      
      // Get user's selected track IDs from profile
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('study_music_preferences')
        .eq('id', user?.id)
        .single();

      if (profileError) throw profileError;

      const preferences = profile?.study_music_preferences as { selectedTracks?: string[] } | null;
      const selectedTrackIds = preferences?.selectedTracks || [];
      
      if (selectedTrackIds.length === 0) {
        setSelectedTracks([]);
        setLoading(false);
        return;
      }

      // Fetch track details from Pixabay
      const { data: musicData, error: musicError } = await supabase.functions.invoke('get-study-music', {
        body: { category: 'music', limit: 15 }
      });

      if (musicError) throw musicError;

      const allTracks = musicData?.tracks || [];
      const userTracks = allTracks.filter((track: any) => 
        selectedTrackIds.includes(track.id)
      ).map((track: any) => ({
        id: track.id,
        name: track.name,
        artist: track.artist,
        url: track.previewUrl || track.webformatURL,
        duration: track.duration
      }));

      setSelectedTracks(userTracks);
      manager.setTracks(userTracks);
      
    } catch (error) {
      console.error('Error loading music preferences:', error);
      toast.error('Failed to load your music preferences');
      setSelectedTracks([]);
    } finally {
      setLoading(false);
    }
  };

  const playTrack = async (track: StudyMusicTrack) => {
    if (currentTrack?.id === track.id && isPlaying) {
      manager.stop();
      setIsPlaying(false);
      setCurrentTrack(null);
    } else {
      await manager.playTrack(track.id);
      setCurrentTrack(track);
      setIsPlaying(true);
    }
  };

  const handleVolumeChange = (newVolume: number[]) => {
    setVolume(newVolume[0]);
  };

  if (loading) {
    return (
      <div className="flex items-center px-3 py-2 text-sm text-muted-foreground">
        <Music className="h-4 w-4 mr-2" />
        {!isCollapsed && "Loading music..."}
      </div>
    );
  }

  if (selectedTracks.length === 0) {
    return (
      <NavLink
        to="/settings?tab=music"
        icon={Music}
        label="Study Music"
        isActive={false}
        isCollapsed={isCollapsed}
        customClassName="text-muted-foreground"
      />
    );
  }

  if (isCollapsed) {
    return (
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className="h-auto p-2 justify-center"
          >
            <Music className="h-4 w-4" />
          </Button>
        </PopoverTrigger>
        <PopoverContent side="right" className="w-80 p-4">
          <StudyMusicContent
            selectedTracks={selectedTracks}
            currentTrack={currentTrack}
            isPlaying={isPlaying}
            volume={volume}
            onPlayTrack={playTrack}
            onVolumeChange={handleVolumeChange}
          />
        </PopoverContent>
      </Popover>
    );
  }

  return (
    <div className="px-3 py-2">
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-medium flex items-center">
          <Music className="h-4 w-4 mr-2" />
          Study Music
        </span>
        <NavLink
          to="/settings?tab=music"
          icon={Settings}
          label=""
          isActive={false}
          isCollapsed={true}
          customClassName="text-muted-foreground hover:text-foreground"
        />
      </div>
      
      <StudyMusicContent
        selectedTracks={selectedTracks}
        currentTrack={currentTrack}
        isPlaying={isPlaying}
        volume={volume}
        onPlayTrack={playTrack}
        onVolumeChange={handleVolumeChange}
      />
    </div>
  );
};

interface StudyMusicContentProps {
  selectedTracks: StudyMusicTrack[];
  currentTrack: StudyMusicTrack | null;
  isPlaying: boolean;
  volume: number;
  onPlayTrack: (track: StudyMusicTrack) => void;
  onVolumeChange: (volume: number[]) => void;
}

const StudyMusicContent = ({
  selectedTracks,
  currentTrack,
  isPlaying,
  volume,
  onPlayTrack,
  onVolumeChange
}: StudyMusicContentProps) => {
  return (
    <div className="space-y-3">
      {selectedTracks.map((track) => {
        const isCurrentTrack = currentTrack?.id === track.id;
        const trackIsPlaying = isCurrentTrack && isPlaying;
        
        return (
          <div key={track.id} className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onPlayTrack(track)}
              className="h-8 w-8 p-0 flex-shrink-0"
            >
              {trackIsPlaying ? (
                <Pause className="h-3 w-3" />
              ) : (
                <Play className="h-3 w-3" />
              )}
            </Button>
            
            <div className="flex-1 min-w-0">
              <div className={`text-xs font-medium truncate ${
                isCurrentTrack ? 'text-primary' : 'text-foreground'
              }`}>
                {track.name}
              </div>
              <div className="text-xs text-muted-foreground truncate">
                {track.artist}
              </div>
            </div>
          </div>
        );
      })}
      
      {selectedTracks.length > 0 && (
        <div className="flex items-center gap-2 pt-2 border-t">
          <Volume2 className="h-3 w-3 text-muted-foreground flex-shrink-0" />
          <Slider
            value={[volume]}
            onValueChange={onVolumeChange}
            max={100}
            step={1}
            className="flex-1"
          />
          <span className="text-xs text-muted-foreground w-8 text-right">
            {volume}%
          </span>
        </div>
      )}
    </div>
  );
};