
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
  
  const getSubjectName = () => {
    if (note.subject_id && !subjectsLoading && subjects.length > 0) {
      const foundSubject = subjects.find(s => s.id === note.subject_id);
      if (foundSubject) {
        return foundSubject.name;
      }
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

  const noteDate = new Date(note.date);
  const relativeTime = formatDistanceToNow(noteDate, { addSuffix: true });

  const contentPreview = note.content 
    ? note.content.substring(0, 150) + (note.content.length > 150 ? '...' : '')
    : note.description.substring(0, 150) + (note.description.length > 150 ? '...' : '');

  return (
    <Card 
      className="group cursor-pointer transition-all duration-300 hover:shadow-lg hover:shadow-mint-500/10 hover:scale-[1.01] bg-white/90 backdrop-blur-sm border-0 shadow-md rounded-xl relative overflow-hidden"
      onClick={handleCardClick}
    >
      <CardContent className="p-4">
        {/* Top row: Title, Subject, and Actions */}
        <div className="flex items-center justify-between gap-4 mb-3">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            {/* Title */}
            <h3 className="text-base font-bold text-green-700 truncate max-w-[200px]">
              {note.title}
            </h3>
            
            {/* Subject Badge */}
            <Badge className="px-2 py-1 text-xs font-medium border-0 shadow-sm shrink-0 bg-mint-100 border-mint-200 text-green-700">
              <Book className="h-3 w-3 mr-1 text-green-600" />
              {subjectName}
            </Badge>
          </div>
          
          {/* Right side indicators and actions */}
          <div className="flex items-center gap-2 shrink-0">
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
            
            {/* Actions menu */}
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
        </div>
        
        {/* Bottom row: Content, Date, Reading time, and Study button */}
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            {/* Content preview */}
            <p className="text-gray-600 text-sm leading-relaxed truncate flex-1">
              {contentPreview}
            </p>
            
            {/* Date */}
            <div className="flex items-center gap-1 text-sm text-green-600 font-medium shrink-0">
              <Calendar className="h-3 w-3 text-green-600" />
              <span className="whitespace-nowrap">{relativeTime}</span>
            </div>
          </div>
          
          {/* Right side: Reading time and Study button */}
          <div className="flex items-center gap-3 shrink-0">
            {/* Reading time */}
            <div className="text-xs text-green-600 font-medium whitespace-nowrap">
              ~{Math.ceil((note.content || note.description).split(' ').length / 200)} min
            </div>
            
            {/* Study button */}
            <Button
              onClick={handleStudyClick}
              className="bg-gradient-to-r from-mint-600 to-mint-700 hover:from-mint-700 hover:to-mint-800 text-white font-medium rounded-lg transition-all duration-200 shadow-md shadow-mint-500/25 hover:shadow-mint-500/40 px-3 py-1.5 h-7 shrink-0"
              size="sm"
              type="button"
            >
              <Sparkles className="h-3 w-3 mr-1" />
              Study
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
