
import { useState } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Note } from "@/types/note";

interface NoteSelectionListProps {
  notes: Note[];
  selectedNotes: string[];
  onToggleNote: (noteId: string) => void;
  onSelectAll: () => void;
  disabled: boolean;
}

export const NoteSelectionList = ({
  notes,
  selectedNotes,
  onToggleNote,
  onSelectAll,
  disabled
}: NoteSelectionListProps) => {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <Label>Select Notes to Convert</Label>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={onSelectAll}
          disabled={disabled}
        >
          {selectedNotes.length === notes.length ? "Deselect All" : "Select All"}
        </Button>
      </div>
      
      <ScrollArea className="h-[200px] border rounded-md p-2">
        <div className="space-y-2">
          {notes.map((note) => (
            <div key={note.id} className="flex items-start space-x-2">
              <Checkbox
                id={`note-${note.id}`}
                checked={selectedNotes.includes(note.id)}
                onCheckedChange={() => onToggleNote(note.id)}
                disabled={disabled}
              />
              <Label
                htmlFor={`note-${note.id}`}
                className="text-sm font-normal leading-none cursor-pointer"
              >
                <div className="font-medium">{note.title}</div>
                <div className="text-xs text-muted-foreground truncate max-w-[300px]">
                  {note.description}
                </div>
              </Label>
            </div>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
};
