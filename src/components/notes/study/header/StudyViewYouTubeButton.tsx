import { Youtube } from "lucide-react";
import { Button } from "@/components/ui/button";

interface StudyViewYouTubeButtonProps {
  videoUrl: string;
}

export const StudyViewYouTubeButton = ({ videoUrl }: StudyViewYouTubeButtonProps) => {
  const handleClick = () => {
    window.open(videoUrl, '_blank', 'noopener,noreferrer');
  };

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleClick}
      className="gap-2"
    >
      <Youtube className="h-4 w-4 text-red-500" />
      Watch Video
    </Button>
  );
};