
import { useState } from 'react';
import { useOptimizedNotes } from '@/contexts/OptimizedNotesContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, FileText, Clock } from 'lucide-react';
import { Note } from '@/types/note';

interface NoteSelectionTabProps {
  selectedNotes: Note[];
  onNotesChange: (notes: Note[]) => void;
}

export const NoteSelectionTab = ({ selectedNotes, onNotesChange }: NoteSelectionTabProps) => {
  const { notes } = useOptimizedNotes();
  const [searchTerm, setSearchTerm] = useState('');

  const filteredNotes = notes.filter(note => 
    note.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    note.content?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    note.subject.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const toggleNoteSelection = (note: Note) => {
    const isSelected = selectedNotes.some(n => n.id === note.id);
    if (isSelected) {
      onNotesChange(selectedNotes.filter(n => n.id !== note.id));
    } else {
      onNotesChange([...selectedNotes, note]);
    }
  };

  return (
    <div className="space-y-4">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
        <Input
          placeholder="Search notes..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      <div className="grid gap-3 max-h-96 overflow-y-auto">
        {filteredNotes.map((note) => {
          const isSelected = selectedNotes.some(n => n.id === note.id);
          
          return (
            <Card
              key={note.id}
              className={`cursor-pointer transition-all hover:shadow-md ${
                isSelected ? 'ring-2 ring-blue-500 bg-blue-50' : ''
              }`}
              onClick={() => toggleNoteSelection(note)}
            >
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="font-medium text-sm mb-1">{note.title}</h3>
                    <p className="text-xs text-gray-600 mb-2 line-clamp-2">
                      {note.description || note.content}
                    </p>
                    <div className="flex items-center gap-4 text-xs text-gray-500">
                      <span className="flex items-center gap-1">
                        <FileText className="h-3 w-3" />
                        {note.subject}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {note.date}
                      </span>
                    </div>
                  </div>
                  <Button
                    variant={isSelected ? "default" : "outline"}
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleNoteSelection(note);
                    }}
                  >
                    {isSelected ? 'Selected' : 'Select'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {filteredNotes.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          <FileText className="h-12 w-12 mx-auto mb-3 opacity-50" />
          <p>No notes found matching your search.</p>
        </div>
      )}
    </div>
  );
};
