import React from 'react';
import { Note } from "@/types/note";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Book, Sparkles, Pin, Camera } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { generateColorFromString, getBestTextColor } from "@/utils/colorUtils";
import { format } from "date-fns";
import { useNavigate } from "react-router-dom";
import { useUserSubjects } from "@/hooks/useUserSubjects";
import { NoteCardActions } from "./NoteCardActions";

interface CompactNoteCardProps {
  note: Note;
  onPin?: (id: string, isPinned: boolean) => void;
  onDelete?: (id: string) => Promise<void>;
}

export const CompactNoteCard = ({ note, onPin, onDelete }: CompactNoteCardProps) => {
  const navigate = useNavigate();
  const { subjects, isLoading: subjectsLoading } = useUserSubjects();
  
  // Find the subject name based on subject_id or fall back to category
  const getSubjectName = () => {
    if (note.subject_id && !subjectsLoading) {
      const foundSubject = subjects.find(s => s.id === note.subject_id);
      return foundSubject?.name || note.category || "Uncategorized";
    }
    return note.category || "Uncategorized";
  };

  const subjectName = getSubjectName();
  const subjectColor = generateColorFromString(subjectName);
  const textColor = getBestTextColor(subjectColor);
  
  const handleStudyClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    console.log("🎯 CompactNoteCard Study button clicked - Navigating to study mode for note:", note.id, note.title);
    navigate(`/notes/study/${note.id}`);
  };

  const handleCardClick = () => {
    navigate(`/notes/${note.id}`);
  };

  // Format date as dd-MMM-yyyy
  const formattedDate = format(new Date(note.date), "dd-MMM-yyyy");

  return (
    <Card 
      className="group cursor-pointer transition-all duration-300 hover:shadow-xl hover:shadow-mint-500/10 hover:scale-[1.02] hover:-translate-y-1 bg-white/90 backdrop-blur-sm border-0 shadow-lg rounded-2xl relative overflow-hidden"
      onClick={handleCardClick}
    >
      {/* Subtle gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-transparent via-white/20 to-mint-50/30 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      
      {/* Enhanced floating elements */}
      <div className="absolute top-3 left-3 flex items-center gap-2 z-10">
        {note.sourceType === 'scan' && (
          <div className="w-7 h-7 bg-blue-500/10 backdrop-blur-sm rounded-full flex items-center justify-center shadow-lg border border-blue-200/30">
            <Camera className="h-3 w-3 text-blue-600" />
          </div>
        )}
        {note.pinned && (
          <div className="w-7 h-7 bg-mint-500/10 backdrop-blur-sm rounded-full flex items-center justify-center shadow-lg border border-mint-200/30">
            <Pin size={12} className="fill-mint-600 text-mint-600" />
          </div>
        )}
      </div>

      {/* Enhanced three-dot menu */}
      {onPin && onDelete && (
        <div className="absolute top-3 right-3 z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
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
      )}
      
      <CardHeader className="pb-4 pt-6">
        <CardTitle className="text-lg font-bold text-green-700 line-clamp-2 pr-8 leading-relaxed group-hover:text-green-800 transition-colors">
          {note.title}
        </CardTitle>
      </CardHeader>
      
      <CardContent className="pb-4">
        <div className="flex items-center gap-3 mb-4">
          <Badge 
            className="px-3 py-1.5 text-xs font-medium border-0 shadow-sm transition-all duration-200 hover:shadow-md"
            style={{ 
              backgroundColor: subjectColor, 
              color: textColor 
            }}
          >
            <Book className="h-3 w-3 mr-1.5" />
            {subjectName}
          </Badge>
          
          <span className="text-sm text-gray-600 font-bold bg-slate-50 px-2 py-1 rounded-full">
            {formattedDate}
          </span>
        </div>
      </CardContent>

      <CardFooter className="pt-0 pb-6">
        <Button
          onClick={handleStudyClick}
          className="w-full bg-gradient-to-r from-mint-600 to-mint-700 hover:from-mint-700 hover:to-mint-800 text-white font-medium rounded-xl transition-all duration-200 relative z-10 shadow-lg shadow-mint-500/25 hover:shadow-mint-500/40 hover:scale-[1.02]"
          size="sm"
          type="button"
        >
          <Sparkles className="h-4 w-4 mr-2" />
          Study Mode
        </Button>
      </CardFooter>
    </Card>
  );
};
