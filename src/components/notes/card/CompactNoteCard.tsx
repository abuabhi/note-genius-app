
import React from 'react';
import { Note } from "@/types/note";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Book, Sparkles, Pin, Camera, Calendar } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { generateColorFromString, getBestTextColor } from "@/utils/colorUtils";
import { format, formatDistanceToNow } from "date-fns";
import { useUserSubjects } from "@/hooks/useUserSubjects";
import { NoteCardActions } from "./NoteCardActions";

interface CompactNoteCardProps {
  note: Note;
  onNoteClick: (note: Note) => void;
  onShowDetails: (note: Note, e: React.MouseEvent) => void;
  onPin: (id: string, isPinned: boolean) => void;
  onDelete: (id: string) => Promise<void>;
  confirmDelete: string | null;
}

export const CompactNoteCard = ({ 
  note, 
  onNoteClick,
  onShowDetails,
  onPin, 
  onDelete,
  confirmDelete 
}: CompactNoteCardProps) => {
  const { subjects, isLoading: subjectsLoading } = useUserSubjects();
  
  // Find the subject name based on subject_id or fall back to subject
  const getSubjectName = () => {
    if (note.subject_id && !subjectsLoading) {
      const foundSubject = subjects.find(s => s.id === note.subject_id);
      return foundSubject?.name || note.subject || "Uncategorized";
    }
    return note.subject || "Uncategorized";
  };

  const subjectName = getSubjectName();
  const subjectColor = generateColorFromString(subjectName);
  const textColor = getBestTextColor(subjectColor);
  
  const handleStudyClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    onNoteClick(note);
  };

  const handleCardClick = () => {
    onNoteClick(note);
  };

  // Two lines of description for list view
  const contentPreview = note.content 
    ? note.content.substring(0, 200) + (note.content.length > 200 ? '...' : '')
    : note.description.substring(0, 200) + (note.description.length > 200 ? '...' : '');

  return (
    <Card 
      className="group cursor-pointer transition-all duration-300 hover:shadow-lg hover:shadow-mint-500/10 hover:scale-[1.01] bg-white/90 backdrop-blur-sm border-0 shadow-md rounded-xl relative overflow-hidden py-2"
      onClick={handleCardClick}
    >
      {/* Compact list layout */}
      <CardHeader className="pb-2 pt-3 px-4">
        {/* Title, Subject, and Date on same line */}
        <div className="flex items-center justify-between gap-3 mb-2">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <h3 className="text-lg font-bold text-green-700 truncate">
              {note.title}
            </h3>
            
            <Badge 
              className="px-2 py-1 text-xs font-medium border-0 shadow-sm shrink-0"
              style={{ 
                backgroundColor: '#10B981', 
                color: 'white'
              }}
            >
              <Book className="h-3 w-3 mr-1" />
              {subjectName}
            </Badge>
            
            <div className="flex items-center gap-1 text-sm text-green-600 font-medium shrink-0">
              <Calendar className="h-4 w-4" />
              <span>{formatDistanceToNow(new Date(note.date), { addSuffix: true })}</span>
            </div>
          </div>
          
          {/* Floating elements and actions */}
          <div className="flex items-center gap-2 shrink-0">
            {note.sourceType === 'scan' && (
              <div className="w-6 h-6 bg-blue-500/10 rounded-full flex items-center justify-center">
                <Camera className="h-3 w-3 text-blue-600" />
              </div>
            )}
            {note.pinned && (
              <div className="w-6 h-6 bg-mint-500/10 rounded-full flex items-center justify-center">
                <Pin size={10} className="fill-mint-600 text-mint-600" />
              </div>
            )}
            
            {onPin && onDelete && (
              <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                <NoteCardActions 
                  noteId={note.id}
                  noteTitle={note.title}
                  noteContent={note.content || note.description || ""}
                  isPinned={!!note.pinned} 
                  onPin={onPin}
                  onDelete={onDelete}
                  iconSize={3}
                />
              </div>
            )}
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="pt-0 px-4 pb-3">
        {/* Two lines of description */}
        <p className="text-gray-600 text-sm leading-relaxed line-clamp-2 mb-3">
          {contentPreview}
        </p>
        
        {/* Study button and reading time */}
        <div className="flex items-center justify-between">
          <Button
            onClick={handleStudyClick}
            className="bg-gradient-to-r from-mint-600 to-mint-700 hover:from-mint-700 hover:to-mint-800 text-white font-medium rounded-lg transition-all duration-200 shadow-md shadow-mint-500/25 hover:shadow-mint-500/40 px-4 py-2"
            size="sm"
            type="button"
          >
            <Sparkles className="h-3 w-3 mr-1" />
            Study
          </Button>
          
          <div className="text-xs text-green-600 font-medium">
            ~{Math.ceil((note.content || note.description).split(' ').length / 200)} min read
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
