
import { Note } from "@/types/note";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { ViewMode } from "@/hooks/useViewPreferences";
import { NoteCardHeader } from "./components/NoteCardHeader";
import { NoteCardContent } from "./components/NoteCardContent";
import { NoteCardMetadata } from "./components/NoteCardMetadata";
import { NoteCardActions } from "./NoteCardActions";
import { StandardListCard } from "@/components/ui/StandardListCard";
import { stripMarkdown } from "./utils/markdownUtils";
import { useUserSubjects } from "@/hooks/useUserSubjects";
import { Clock, Calendar, Sparkles } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { getSubjectColorClasses } from "@/utils/subjectColors";

interface NoteCardProps {
  note: Note;
  onNoteClick: (note: Note) => void;
  onShowDetails: (note: Note, e: React.MouseEvent) => void;
  onPin: (id: string, isPinned: boolean) => void;
  onDelete: (id: string) => Promise<void>;
  confirmDelete: string | null;
  viewMode?: ViewMode;
}

const calculateReadTime = (content: string): number => {
  const wordsPerMinute = 200;
  const wordCount = content.trim().split(/\s+/).length;
  const readTime = Math.ceil(wordCount / wordsPerMinute);
  return Math.max(1, readTime);
};

export const NoteCard = ({
  note,
  onNoteClick,
  onShowDetails,
  onPin,
  onDelete,
  confirmDelete,
  viewMode = 'grid'
}: NoteCardProps) => {
  const { subjects, isLoading: subjectsLoading } = useUserSubjects();
  const navigate = useNavigate();
  
  const getSubjectName = () => {
    if (note.subject_id && !subjectsLoading && subjects.length > 0) {
      const foundSubject = subjects.find(s => s.id === note.subject_id);
      if (foundSubject) {
        return foundSubject.name;
      }
    }
    return note.subject || "Uncategorized";
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

  const handleGoToStudyMode = () => {
    navigate(`/notes/study/${note.id}`);
  };

  const isListView = viewMode === 'list';
  
  if (isListView) {
    // Get description for list view - allow longer descriptions
    const description = content ? stripMarkdown(content).substring(0, 180) : '';
    const truncatedDescription = description.length > 180 ? description.substring(0, 177) + '...' : description;
    const subjectName = getSubjectName();

    return (
      <StandardListCard
        title={note.title}
        description={truncatedDescription || undefined}
        subjectName={subjectName}
        subjectBadgeColor={getSubjectColorClasses(subjectName)}
        primaryAction={{
          label: "Study",
          onClick: handleGoToStudyMode,
          icon: <Sparkles className="h-3.5 w-3.5 mr-1.5" />,
          className: "bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white px-4 py-2 h-8 text-xs font-medium rounded-lg shadow-sm hover:shadow-md transition-all duration-200"
        }}
        menuActions={
          <NoteCardActions 
            noteId={note.id}
            noteTitle={note.title}
            noteContent={note.content || note.description || ""}
            isPinned={!!note.pinned} 
            onPin={onPin}
            onDelete={onDelete}
            iconSize={4}
          />
        }
        metadata={[
          {
            icon: <Clock className="h-3.5 w-3.5" />,
            label: `${readTime}m read`
          },
          {
            icon: <Calendar className="h-3.5 w-3.5" />,
            label: formattedDate
          }
        ]}
        onClick={() => onNoteClick(note)}
        isPinned={!!note.pinned}
      />
    );
  }

  // Grid view - clean and simple
  return (
    <Card 
      className={`
        group relative cursor-pointer transition-all duration-200
        bg-white border border-gray-200 hover:border-gray-300 hover:shadow-md
        ${note.pinned ? 'ring-1 ring-yellow-300 border-yellow-300' : ''}
        rounded-lg h-full flex flex-col
      `}
      onClick={() => onNoteClick(note)}
    >
      {/* Actions positioned absolutely - always visible in grid view */}
      <div className="absolute top-3 right-3 z-10">
        <NoteCardActions 
          noteId={note.id}
          noteTitle={note.title}
          noteContent={note.content || note.description || ""}
          isPinned={!!note.pinned} 
          onPin={onPin}
          onDelete={onDelete}
          iconSize={4}
        />
      </div>

      <CardHeader className="p-4 pb-2 flex-1">
        <NoteCardHeader 
          note={note}
          onPin={onPin}
          onDelete={onDelete}
          viewMode={viewMode}
        />
        
        <NoteCardContent 
          note={note}
          stripMarkdown={stripMarkdown}
          viewMode={viewMode}
        />
      </CardHeader>
      
      {/* Simple footer */}
      <div className="p-4 pt-0 mt-auto">
        <NoteCardMetadata note={note} viewMode={viewMode} />
      </div>
    </Card>
  );
};
