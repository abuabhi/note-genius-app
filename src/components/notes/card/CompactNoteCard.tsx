
import React from 'react';
import { Note } from "@/types/note";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Book, Sparkles, Pin, Camera, Calendar } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { formatDistanceToNow } from "date-fns";
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
  
  const handleStudyClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    onNoteClick(note);
  };

  const handleCardClick = () => {
    onNoteClick(note);
  };

  // Single line of description for ultra-compact view
  const contentPreview = note.content 
    ? note.content.substring(0, 120) + (note.content.length > 120 ? '...' : '')
    : note.description.substring(0, 120) + (note.description.length > 120 ? '...' : '');

  return (
    <Card 
      className="group cursor-pointer transition-all duration-300 hover:shadow-lg hover:shadow-mint-500/10 hover:scale-[1.01] bg-white/90 backdrop-blur-sm border-0 shadow-md rounded-xl relative overflow-hidden"
      onClick={handleCardClick}
    >
      <CardContent className="p-3">
        {/* Top line: Title, Subject, Date, Reading Time */}
        <div className="flex items-center justify-between gap-3 mb-2">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            {/* Title - green color */}
            <h3 className="text-base font-bold text-green-700 truncate flex-shrink-0 max-w-[200px]">
              {note.title}
            </h3>
            
            {/* Subject Badge - mint green background, green text and icon */}
            <Badge 
              className="px-2 py-1 text-xs font-medium border-0 shadow-sm shrink-0 bg-mint-100 border-mint-200 text-green-700"
            >
              <Book className="h-3 w-3 mr-1 text-green-600" />
              {subjectName}
            </Badge>
            
            {/* Date - green color */}
            <div className="flex items-center gap-1 text-sm text-green-600 font-medium shrink-0">
              <Calendar className="h-3 w-3 text-green-600" />
              <span>{formatDistanceToNow(new Date(note.date), { addSuffix: true })}</span>
            </div>
          </div>
          
          {/* Right side: Reading time, Study button, and floating elements */}
          <div className="flex items-center gap-3 shrink-0">
            {/* Reading time - green color */}
            <div className="text-xs text-green-600 font-medium">
              ~{Math.ceil((note.content || note.description).split(' ').length / 200)} min read
            </div>
            
            {/* Study button */}
            <Button
              onClick={handleStudyClick}
              className="bg-gradient-to-r from-mint-600 to-mint-700 hover:from-mint-700 hover:to-mint-800 text-white font-medium rounded-lg transition-all duration-200 shadow-md shadow-mint-500/25 hover:shadow-mint-500/40 px-3 py-1 h-7"
              size="sm"
              type="button"
            >
              <Sparkles className="h-3 w-3 mr-1" />
              Study
            </Button>
            
            {/* Source type indicator */}
            {note.sourceType === 'scan' && (
              <div className="w-5 h-5 bg-blue-500/10 rounded-full flex items-center justify-center">
                <Camera className="h-3 w-3 text-blue-600" />
              </div>
            )}
            
            {/* Pin indicator */}
            {note.pinned && (
              <div className="w-5 h-5 bg-mint-500/10 rounded-full flex items-center justify-center">
                <Pin size={8} className="fill-mint-600 text-mint-600" />
              </div>
            )}
            
            {/* Actions */}
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
        
        {/* Description - two lines maximum */}
        <p className="text-gray-600 text-sm leading-relaxed line-clamp-2 mb-2 ml-1">
          {contentPreview}
        </p>
      </CardContent>
    </Card>
  );
};
