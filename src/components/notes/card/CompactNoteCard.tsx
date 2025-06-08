
import React from 'react';
import { Note } from "@/types/note";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Book, Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { generateColorFromString, getBestTextColor } from "@/utils/colorUtils";
import { format } from "date-fns";
import { useNavigate } from "react-router-dom";
import { useUserSubjects } from "@/hooks/useUserSubjects";

interface CompactNoteCardProps {
  note: Note;
}

export const CompactNoteCard = ({ note }: CompactNoteCardProps) => {
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
    navigate(`/notes/study/${note.id}`);
  };

  const handleCardClick = () => {
    navigate(`/notes/${note.id}`);
  };

  // Format date as dd-MMM-yyyy
  const formattedDate = format(new Date(note.date), "dd-MMM-yyyy");

  return (
    <Card 
      className="group cursor-pointer transition-all duration-300 hover:shadow-lg hover:scale-[1.02] bg-white/80 backdrop-blur-sm border-0 shadow-md rounded-xl"
      onClick={handleCardClick}
    >
      <CardHeader className="pb-3">
        <CardTitle className="text-lg font-semibold text-slate-800 line-clamp-2">
          {note.title}
        </CardTitle>
      </CardHeader>
      
      <CardContent className="pb-3">
        <div className="flex items-center gap-3 mb-3">
          <Badge 
            className="px-3 py-1 text-xs font-medium border-0 shadow-sm"
            style={{ 
              backgroundColor: subjectColor, 
              color: textColor 
            }}
          >
            <Book className="h-3 w-3 mr-1.5" />
            {subjectName}
          </Badge>
          
          <span className="text-xs text-slate-500 font-medium">
            {formattedDate}
          </span>
        </div>
      </CardContent>

      <CardFooter className="pt-0">
        <Button
          onClick={handleStudyClick}
          className="w-full bg-mint-600 hover:bg-mint-700 text-white font-medium rounded-lg transition-colors"
          size="sm"
        >
          <Sparkles className="h-4 w-4 mr-2" />
          Study
        </Button>
      </CardFooter>
    </Card>
  );
};
