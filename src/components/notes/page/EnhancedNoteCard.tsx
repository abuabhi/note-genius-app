
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
  Star
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
      case 'scan': return <FileText className="h-4 w-4" />;
      case 'import': return <BookOpen className="h-4 w-4" />;
      default: return <FileText className="h-4 w-4" />;
    }
  };

  const getSourceColor = () => {
    switch (note.sourceType) {
      case 'scan': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'import': return 'bg-purple-100 text-purple-700 border-purple-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const contentPreview = note.content 
    ? stripMarkdown(note.content).substring(0, 120) + (note.content.length > 120 ? '...' : '')
    : note.description.substring(0, 120) + (note.description.length > 120 ? '...' : '');

  return (
    <Card 
      className={`
        group relative overflow-hidden transition-all duration-300 cursor-pointer
        bg-white/95 backdrop-blur-sm border-0 shadow-lg hover:shadow-2xl
        hover:scale-[1.02] hover:-translate-y-2
        ${note.pinned ? 'ring-2 ring-yellow-400/50 shadow-yellow-500/20' : ''}
        ${note.archived ? 'opacity-75' : ''}
        rounded-2xl
        before:absolute before:inset-0 before:bg-gradient-to-br before:from-mint-500/5 before:via-transparent before:to-blue-500/5 before:opacity-0 before:transition-opacity before:duration-300
        hover:before:opacity-100
      `}
      onClick={() => onNoteClick(note)}
    >
      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-transparent via-white/10 to-mint-50/20 pointer-events-none" />
      
      {/* Floating pin indicator */}
      {note.pinned && (
        <div className="absolute top-4 right-4 z-10">
          <div className="flex items-center justify-center w-8 h-8 bg-yellow-400 rounded-full shadow-lg">
            <Star className="h-4 w-4 text-white fill-white" />
          </div>
        </div>
      )}

      <CardHeader className="relative p-6 pb-4">
        {/* Subject Badge */}
        <div className="flex items-center justify-between mb-3">
          <Badge className={`${getSourceColor()} border font-medium`}>
            {getSourceIcon()}
            <span className="ml-1.5">{note.subject}</span>
          </Badge>
          
          {/* Actions Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button 
                variant="ghost" 
                size="icon"
                className="opacity-0 group-hover:opacity-100 transition-opacity h-8 w-8 hover:bg-gray-100"
                onClick={(e) => e.stopPropagation()}
              >
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem onClick={(e) => onShowDetails(note, e)}>
                <Eye className="h-4 w-4 mr-2" />
                View Details
              </DropdownMenuItem>
              <DropdownMenuItem onClick={(e) => {
                e.stopPropagation();
                onPin(note.id, note.pinned);
              }}>
                <Pin className="h-4 w-4 mr-2" />
                {note.pinned ? 'Unpin' : 'Pin'} Note
              </DropdownMenuItem>
              <DropdownMenuItem 
                className="text-red-600 focus:text-red-600"
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(note.id);
                }}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Title */}
        <h3 className="text-xl font-bold text-gray-900 mb-3 line-clamp-2 leading-tight">
          {note.title}
        </h3>
        
        {/* Content Preview */}
        <p className="text-gray-600 text-sm leading-relaxed line-clamp-3">
          {contentPreview}
        </p>
      </CardHeader>
      
      <CardFooter className="flex justify-between items-center px-6 py-4 pt-0">
        {/* Date */}
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <Calendar className="h-4 w-4" />
          <span>{formatDistanceToNow(new Date(note.date), { addSuffix: true })}</span>
        </div>
        
        {/* Word count estimate */}
        <div className="text-xs text-gray-400">
          ~{Math.ceil((note.content || note.description).split(' ').length / 200)} min read
        </div>
      </CardFooter>
    </Card>
  );
};
