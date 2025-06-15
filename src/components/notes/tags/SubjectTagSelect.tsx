import { useState } from 'react';
import { useOptimizedNotes } from '@/contexts/OptimizedNotesContext';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Note } from '@/types/note';

interface SubjectTagSelectProps {
  note: Note;
}

export const SubjectTagSelect: React.FC<SubjectTagSelectProps> = ({ note }) => {
  const { updateNote } = useOptimizedNotes();
  const [isUpdating, setIsUpdating] = useState(false);

  const handleSubjectChange = async (subject: string) => {
    setIsUpdating(true);
    try {
      await updateNote(note.id, { subject });
    } catch (error) {
      console.error("Error updating note subject:", error);
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <Select onValueChange={handleSubjectChange} disabled={isUpdating}>
      <SelectTrigger className="w-[180px]">
        <SelectValue placeholder="Select subject" defaultValue={note.subject || ''} />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="General">General</SelectItem>
        <SelectItem value="Personal">Personal</SelectItem>
        <SelectItem value="Work">Work</SelectItem>
        <SelectItem value="School">School</SelectItem>
        <SelectItem value="Ideas">Ideas</SelectItem>
      </SelectContent>
    </Select>
  );
};
