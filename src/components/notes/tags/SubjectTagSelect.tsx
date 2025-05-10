
import { useState, useEffect } from "react";
import { useNotes } from "@/contexts/NoteContext";
import { Note } from "@/types/note";
import { generateColorFromString, getBestTextColor } from "@/utils/colorUtils";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Check } from "lucide-react";

interface SubjectTagSelectProps {
  note: Note;
  onSubjectChange?: (subject: string) => void;
}

export const SubjectTagSelect = ({ note, onSubjectChange }: SubjectTagSelectProps) => {
  const { availableCategories, updateNote } = useNotes();
  const [currentSubject, setCurrentSubject] = useState<string>(note.category || "");

  // Handle subject change
  const handleSubjectChange = async (value: string) => {
    setCurrentSubject(value);
    
    if (onSubjectChange) {
      onSubjectChange(value);
    } else {
      // If no external handler provided, update note directly
      try {
        await updateNote(note.id, { category: value });
      } catch (error) {
        console.error("Failed to update note subject:", error);
        // Reset to previous value on error
        setCurrentSubject(note.category || "");
      }
    }
  };

  // Update local state when note changes from outside
  useEffect(() => {
    setCurrentSubject(note.category || "");
  }, [note.category]);

  // Generate color for each subject
  const getSubjectDisplay = (subject: string) => {
    if (!subject) return null;
    
    const color = generateColorFromString(subject);
    const textColor = getBestTextColor(color);
    
    return (
      <Badge 
        style={{ 
          backgroundColor: color, 
          color: textColor 
        }}
        className="px-2 py-0.5 font-medium"
      >
        {subject}
      </Badge>
    );
  };

  return (
    <div className="w-full">
      <Select value={currentSubject} onValueChange={handleSubjectChange}>
        <SelectTrigger className="w-full border-mint-200 focus:ring-mint-400">
          <SelectValue placeholder="Select subject">
            {currentSubject ? getSubjectDisplay(currentSubject) : "Select subject"}
          </SelectValue>
        </SelectTrigger>
        <SelectContent className="bg-white">
          {availableCategories.map((category) => {
            const color = generateColorFromString(category);
            const textColor = getBestTextColor(color);
            
            return (
              <SelectItem 
                key={category} 
                value={category}
                className="flex items-center justify-between focus:bg-mint-50 focus:text-mint-700"
              >
                <div className="flex items-center gap-2">
                  <Badge 
                    style={{ 
                      backgroundColor: color, 
                      color: textColor 
                    }}
                    className="px-2 py-0.5 font-medium"
                  >
                    {category}
                  </Badge>
                </div>
              </SelectItem>
            );
          })}
        </SelectContent>
      </Select>
    </div>
  );
};
