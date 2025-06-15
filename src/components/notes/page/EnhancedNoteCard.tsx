
import { Note } from "@/types/note";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Pin, 
  Trash2, 
  Calendar, 
  FileText, 
  BookOpen,
  Eye,
  MoreHorizontal,
  Star,
  Sparkles
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { stripMarkdown } from "../card/utils/markdownUtils";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

interface EnhancedNoteCardProps {
  note: Note;
  onNoteClick: (note: Note) => void;
  onShowDetails: (note: Note, e: React.MouseEvent) => void;
  onPin: (id: string, isPinned: boolean) => void;
  onDelete: (id: string) => Promise<void>;
  confirmDelete: string | null;
}

export const EnhancedNoteCard = ({
  note,
  onNoteClick,
  onShowDetails,
  onPin,
  onDelete,
  confirmDelete
}: EnhancedNoteCardProps) => {
  const getSourceIcon = () => {
    switch (note.sourceType) {
      case 'scan': return <FileText className="h-3 w-3" />;
      case 'import': return <BookOpen className="h-3 w-3" />;
      default: return <FileText className="h-3 w-3" />;
    }
  };

  const handleStudyClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    onNoteClick(note);
  };

  const contentPreview = note.content 
    ? stripMarkdown(note.content).substring(0, 120) + (note.content.length > 120 ? '...' : '')
    : note.description.substring(0, 120) + (note.description.length > 120 ? '...' : '');

  return (
    <Card 
      className={`
        group relative overflow-hidden transition-all duration-300 cursor-pointer
        bg-white/95 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl
        hover:scale-[1.02] hover:-translate-y-1
        ${note.pinned ? 'ring-2 ring-yellow-400/50 shadow-yellow-500/20' : ''}
        ${note.archived ? 'opacity-75' : ''}
        rounded-xl
      `}
      onClick={() => onNoteClick(note)}
    >
      {/* Pin indicator */}
      {note.pinned && (
        <div className="absolute top-3 right-3 z-10">
          <div className="flex items-center justify-center w-6 h-6 bg-yellow-400 rounded-full shadow-lg">
            <Star className="h-3 w-3 text-white fill-white" />
          </div>
        </div>
      )}

      <CardHeader className="relative p-6 pb-4">
        {/* Header with subject and actions */}
        <div className="flex items-center justify-between mb-3">
          <Badge className="bg-mint-100 border-mint-200 text-green-700 border font-medium">
            {getSourceIcon()}
            <span className="ml-1">{note.subject}</span>
          </Badge>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button 
                variant="ghost" 
                size="icon"
                className="h-6 w-6 hover:bg-gray-100 shrink-0"
                onClick={(e) => e.stopPropagation()}
              >
                <MoreHorizontal className="h-3 w-3" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-40">
              <DropdownMenuItem onClick={(e) => onShowDetails(note, e)}>
                <Eye className="h-3 w-3 mr-2" />
                View Details
              </DropdownMenuItem>
              <DropdownMenuItem onClick={(e) => {
                e.stopPropagation();
                onPin(note.id, note.pinned);
              }}>
                <Pin className="h-3 w-3 mr-2" />
                {note.pinned ? 'Unpin' : 'Pin'} Note
              </DropdownMenuItem>
              <DropdownMenuItem 
                className="text-red-600 focus:text-red-600"
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(note.id);
                }}
              >
                <Trash2 className="h-3 w-3 mr-2" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Title */}
        <h3 className="text-lg font-bold text-green-700 mb-3 line-clamp-2 leading-tight">
          {note.title}
        </h3>
        
        {/* Content Preview */}
        <p className="text-gray-600 text-sm leading-relaxed line-clamp-3 mb-4">
          {contentPreview}
        </p>

        {/* Study button - always visible */}
        <div className="flex justify-end">
          <Button
            onClick={handleStudyClick}
            className="bg-gradient-to-r from-mint-600 to-mint-700 hover:from-mint-700 hover:to-mint-800 text-white font-medium rounded-lg transition-all duration-200 shadow-md shadow-mint-500/25 hover:shadow-mint-500/40 px-4 py-2"
            size="sm"
            type="button"
          >
            <Sparkles className="h-3 w-3 mr-1.5" />
            Study
          </Button>
        </div>
      </CardHeader>
      
      <CardFooter className="flex justify-between items-center px-6 py-4 pt-0 border-t border-gray-100">
        {/* Date */}
        <div className="flex items-center gap-1 text-sm text-green-600">
          <Calendar className="h-3 w-3" />
          <span>{formatDistanceToNow(new Date(note.date), { addSuffix: true })}</span>
        </div>
        
        {/* Reading time */}
        <div className="text-xs text-green-600">
          ~{Math.ceil((note.content || note.description).split(' ').length / 200)} min read
        </div>
      </CardFooter>
    </Card>
  );
};
