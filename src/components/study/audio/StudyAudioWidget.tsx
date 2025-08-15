// This component has been removed - all audio functionality now uses Supabase music only
import { Music } from "lucide-react";

export const StudyAudioWidget = () => {
  return (
    <div className="fixed bottom-6 right-6 z-40">
      <div className="rounded-full h-12 w-12 shadow-lg bg-muted flex items-center justify-center">
        <Music className="h-5 w-5 text-muted-foreground" />
      </div>
    </div>
  );
};

export default StudyAudioWidget;
