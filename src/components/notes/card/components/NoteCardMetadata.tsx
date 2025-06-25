
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
      <div className="flex items-center gap-3 text-sm text-gray-500 flex-shrink-0 whitespace-nowrap">
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
          className="bg-mint-600 hover:bg-mint-700 text-white rounded-lg px-3 py-1 h-7 text-xs whitespace-nowrap"
          size="sm"
        >
          <Sparkles className="h-3 w-3 mr-1" />
          Study
        </Button>
      </div>
    );
  }

  // Grid view - beautiful, centered footer with lime green accent
  return (
    <div className="flex flex-col items-center justify-center w-full space-y-3">
      {/* Metadata row - perfectly centered with lime green styling */}
      <div className="flex items-center justify-center gap-6 text-sm">
        {/* Read time in lime green */}
        <div className="flex items-center gap-1.5 text-lime-600">
          <Clock className="h-4 w-4" />
          <span className="font-semibold">{readTime}m</span>
        </div>
        
        {/* Date in bold lime green */}
        <div className="flex items-center gap-1.5 text-lime-600">
          <Calendar className="h-4 w-4" />
          <span className="font-bold">{formattedDate}</span>
        </div>

        {/* Tags count - subtle */}
        {note.tags && note.tags.length > 0 && (
          <div className="flex items-center gap-1 text-gray-400">
            <Tag className="h-3 w-3" />
            <span className="text-xs">{note.tags.length}</span>
          </div>
        )}
      </div>

      {/* Study Button - elegant and centered */}
      <Button
        onClick={handleGoToStudyMode}
        className="bg-gradient-to-r from-mint-600 to-mint-700 hover:from-mint-700 hover:to-mint-800 text-white rounded-full px-6 py-2 text-sm font-medium transition-all duration-300 shadow-sm hover:shadow-md"
        size="sm"
      >
        <Sparkles className="h-4 w-4 mr-2" />
        Study Mode
      </Button>
    </div>
  );
};
