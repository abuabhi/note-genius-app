import { Button } from "@/components/ui/button";
import { Music, PlayCircle, PauseCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/auth";
import { useStudyAudio } from "@/hooks/useStudyAudio";

interface StudyAudioSectionProps {
  isCollapsed: boolean;
}

export const StudyAudioSection = ({ isCollapsed }: StudyAudioSectionProps) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { enabled, toggle, preset, manager } = useStudyAudio();

  const handlePlayMusic = () => {
    if (!user) {
      navigate('/auth');
      return;
    }
    toggle();
  };

  const presetLabel = manager.labelForPreset(preset);

  return (
    <div className="w-full">
      <Button
        variant="ghost"
        size="sm"
        onClick={handlePlayMusic}
        className={cn(
          "w-full justify-start gap-3 h-10 px-3 rounded-lg transition-all duration-200",
          enabled && "bg-primary/10 text-primary"
        )}
      >
        <Music className="h-4 w-4 shrink-0" />
        {!isCollapsed && (
          <>
            <div className="flex-1 text-left min-w-0">
              <div className="text-sm font-medium truncate">Study Sounds</div>
              <div className="text-xs opacity-60 truncate">
                {enabled ? presetLabel : 'Click to focus'}
              </div>
            </div>
            {enabled ? (
              <PauseCircle className="h-5 w-5 shrink-0" />
            ) : (
              <PlayCircle className="h-5 w-5 shrink-0" />
            )}
          </>
        )}
        {isCollapsed && (
          <>
            {enabled ? (
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