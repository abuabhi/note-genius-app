
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tag, Sparkles, Clock, Calendar } from "lucide-react";
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
      <div className="flex items-center gap-3 text-sm text-gray-500">
        {/* Read time */}
        <div className="flex items-center gap-1">
          <Clock className="h-3 w-3" />
          <span>{readTime}m</span>
        </div>
        
        {/* Date */}
        <div className="flex items-center gap-1">
          <Calendar className="h-3 w-3" />
          <span>{formattedDate}</span>
        </div>

        {/* Study Button */}
        <Button
          onClick={handleGoToStudyMode}
          className="bg-mint-600 hover:bg-mint-700 text-white rounded-lg px-3 py-1 h-7 text-xs"
          size="sm"
        >
          <Sparkles className="h-3 w-3 mr-1" />
          Study
        </Button>
      </div>
    );
  }

  // Grid view - redesigned cleaner footer
  return (
    <div className="flex justify-between items-center w-full">
      {/* Left side - simplified metadata */}
      <div className="flex items-center gap-4 text-sm text-gray-500">
        {/* Read time */}
        <div className="flex items-center gap-1">
          <Clock className="h-3 w-3" />
          <span>{readTime}m</span>
        </div>
        
        {/* Date */}
        <span className="text-xs">{formattedDate}</span>

        {/* Tags count - only if tags exist */}
        {note.tags && note.tags.length > 0 && (
          <div className="flex items-center gap-1">
            <Tag className="h-3 w-3" />
            <span className="text-xs">{note.tags.length}</span>
          </div>
        )}
      </div>

      {/* Right side - cleaner Study Button */}
      <Button
        onClick={handleGoToStudyMode}
        className="bg-mint-600 hover:bg-mint-700 text-white rounded-lg px-3 py-1.5 h-auto text-xs font-medium transition-all duration-200"
        size="sm"
      >
        <Sparkles className="h-3 w-3 mr-1" />
        Study
      </Button>
    </div>
  );
};
