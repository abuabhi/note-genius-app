
import { Button } from "@/components/ui/button";
import { Clock, Calendar, Sparkles } from "lucide-react";
import { Note } from "@/types/note";
import { ViewMode } from "@/hooks/useViewPreferences";
import { formatDistanceToNow } from "date-fns";
import { useNavigate } from "react-router-dom";

interface NoteCardMetadataProps {
  note: Note;
  viewMode?: ViewMode;
}

const calculateReadTime = (content: string): number => {
  const wordsPerMinute = 200;
  const wordCount = content.trim().split(/\s+/).length;
  const readTime = Math.ceil(wordCount / wordsPerMinute);
  return Math.max(1, readTime);
};

export const NoteCardMetadata = ({ note, viewMode = 'grid' }: NoteCardMetadataProps) => {
  const navigate = useNavigate();
  
  const handleGoToStudyMode = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    navigate(`/notes/study/${note.id}`);
  };

  const content = note.content || note.description || '';
  const readTime = calculateReadTime(content);
  const userTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  const noteDate = new Date(note.date);
  
  const formattedDate = new Intl.DateTimeFormat('en-GB', {
    day: '2-digit',
    month: 'short', 
    year: 'numeric',
    timeZone: userTimezone
  }).format(noteDate);

  const isListView = viewMode === 'list';

  if (isListView) {
    return (
      <div className="flex items-center gap-2 text-xs text-gray-500">
        {/* Clock icon and read time */}
        <div className="flex items-center gap-1">
          <Clock className="h-3 w-3" />
          <span>{readTime}m</span>
        </div>
        
        {/* Date */}
        <div className="flex items-center gap-1">
          <Calendar className="h-3 w-3" />
          <span className="hidden sm:inline">{formattedDate}</span>
        </div>
        
        {/* Study button */}
        <Button
          onClick={handleGoToStudyMode}
          className="bg-green-600 hover:bg-green-700 text-white px-2 py-1 h-6 text-xs"
          size="sm"
        >
          <Sparkles className="h-3 w-3 mr-1" />
          Study
        </Button>
      </div>
    );
  }

  // Grid view - simple horizontal layout
  return (
    <div className="flex items-center justify-between w-full">
      {/* Left side - metadata */}
      <div className="flex items-center gap-3 text-sm text-gray-500">
        <div className="flex items-center gap-1">
          <Clock className="h-3 w-3" />
          <span>{readTime}m</span>
        </div>
        <div className="flex items-center gap-1">
          <Calendar className="h-3 w-3" />
          <span>{formattedDate}</span>
        </div>
      </div>

      {/* Right side - study button */}
      <Button
        onClick={handleGoToStudyMode}
        className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 text-sm"
        size="sm"
      >
        <Sparkles className="h-4 w-4 mr-1" />
        Study
      </Button>
    </div>
  );
};
