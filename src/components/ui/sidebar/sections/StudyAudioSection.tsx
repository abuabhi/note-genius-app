import { Button } from "@/components/ui/button";
import { Music, PlayCircle, PauseCircle, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/auth";
import { useStudyMusic } from "@/hooks/useStudyMusic";

interface StudyAudioSectionProps {
  isCollapsed: boolean;
}

export const StudyAudioSection = ({ isCollapsed }: StudyAudioSectionProps) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { isPlaying, currentTrack, loading, error, toggle } = useStudyMusic();

  const handlePlayMusic = () => {
    if (!user) {
      navigate('/auth');
      return;
    }
    toggle();
  };

  if (loading) {
    return (
      <div className="w-full">
        <Button
          variant="ghost"
          size="sm"
          disabled
          className="w-full justify-start gap-3 h-10 px-3 rounded-lg"
        >
          <Loader2 className="h-4 w-4 shrink-0 animate-spin" />
          {!isCollapsed && (
            <div className="flex-1 text-left min-w-0">
              <div className="text-sm font-medium truncate">Loading Music</div>
              <div className="text-xs opacity-60 truncate">Please wait...</div>
            </div>
          )}
        </Button>
      </div>
    );
  }

  if (error || !currentTrack) {
    return (
      <div className="w-full">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate('/settings')}
          className="w-full justify-start gap-3 h-10 px-3 rounded-lg text-muted-foreground"
        >
          <Music className="h-4 w-4 shrink-0" />
          {!isCollapsed && (
            <div className="flex-1 text-left min-w-0">
              <div className="text-sm font-medium truncate">No Music Selected</div>
              <div className="text-xs opacity-60 truncate">Click to choose music</div>
            </div>
          )}
        </Button>
      </div>
    );
  }

  return (
    <div className="w-full">
        <Button
        variant="ghost"
        size="sm"
        onClick={handlePlayMusic}
        className={cn(
          "w-full justify-start gap-3 h-10 px-3 rounded-lg transition-all duration-200",
          isPlaying && "bg-primary/10 text-primary"
        )}
      >
        <Music className="h-4 w-4 shrink-0" />
        {!isCollapsed && (
          <>
            <div className="flex-1 text-left min-w-0">
              <div className="text-sm font-medium truncate">Study Music</div>
              <div className="text-xs opacity-60 truncate">
                {isPlaying ? `${currentTrack.name} - ${currentTrack.artist}` : 'Click to play music'}
              </div>
            </div>
            {isPlaying ? (
              <PauseCircle className="h-5 w-5 shrink-0" />
            ) : (
              <PlayCircle className="h-5 w-5 shrink-0" />
            )}
          </>
        )}
        {isCollapsed && (
          <>
            {isPlaying ? (
              <PauseCircle className="h-4 w-4" />
            ) : (
              <PlayCircle className="h-4 w-4" />
            )}
          </>
        )}
      </Button>
    </div>
  );
};