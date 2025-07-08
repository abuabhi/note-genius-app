import React from 'react';
import { Note } from '@/types/note';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { FileText, Pin, Trash2, Calendar } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface ProductionNotesListViewProps {
  notes: Note[];
  onNoteClick: (note: Note) => void;
  onPin: (id: string, pinned: boolean) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}

export const ProductionNotesListView = React.memo(({ 
  notes, 
  onNoteClick, 
  onPin, 
  onDelete 
}: ProductionNotesListViewProps) => {
  console.log('📝 ProductionNotesListView - Rendering with:', { noteCount: notes.length });

  if (notes.length === 0) {
    return (
      <div className="text-center p-8 text-gray-500">
        <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
        <p>No notes found</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {/* Header */}
      <div className="grid grid-cols-12 gap-4 px-4 py-2 text-sm font-medium text-gray-500 border-b border-gray-200">
        <div className="col-span-5">Title</div>
        <div className="col-span-2">Subject</div>
        <div className="col-span-2">Date</div>
        <div className="col-span-2">Source</div>
        <div className="col-span-1">Actions</div>
      </div>

      {/* Notes List */}
      {notes.map((note) => (
        <div
          key={note.id}
          className="grid grid-cols-12 gap-4 px-4 py-3 bg-white border border-gray-200 rounded-lg hover:border-mint-300 hover:shadow-sm transition-all duration-200 cursor-pointer"
          onClick={() => onNoteClick(note)}
        >
          {/* Title and Content Preview */}
          <div className="col-span-5 flex items-center space-x-3">
            {note.pinned && (
              <Pin className="h-4 w-4 text-mint-600 flex-shrink-0" />
            )}
            <div className="min-w-0 flex-1">
              <h3 className="font-medium text-gray-900 truncate">
                {note.title || 'Untitled Note'}
              </h3>
              {note.content && (
                <p className="text-sm text-gray-500 truncate">
                  {note.content.substring(0, 80)}...
                </p>
              )}
            </div>
          </div>

          {/* Subject */}
          <div className="col-span-2 flex items-center">
            <Badge 
              variant="secondary" 
              className="text-xs bg-blue-100 text-blue-800 truncate"
            >
              {note.subject || 'Uncategorized'}
            </Badge>
          </div>

          {/* Date */}
          <div className="col-span-2 flex items-center text-sm text-gray-500">
            <Calendar className="h-4 w-4 mr-1 flex-shrink-0" />
            {note.date ? formatDistanceToNow(new Date(note.date), { addSuffix: true }) : 'No date'}
          </div>

          {/* Source Type */}
          <div className="col-span-2 flex items-center">
            <Badge 
              variant="outline" 
              className="text-xs border-gray-300 text-gray-600"
            >
              {note.sourceType === 'manual' ? 'Manual' : 
               note.sourceType === 'scan' ? 'Scanned' : 
               note.sourceType === 'import' ? 'Imported' : 'YouTube'}
            </Badge>
          </div>

          {/* Actions */}
          <div className="col-span-1 flex items-center justify-end space-x-1">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={(e) => {
                e.stopPropagation();
                onPin(note.id, !note.pinned);
              }}
            >
              <Pin className={`h-4 w-4 ${note.pinned ? 'text-mint-600' : 'text-gray-400'}`} />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50"
              onClick={(e) => {
                e.stopPropagation();
                onDelete(note.id);
              }}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      ))}
    </div>
  );
});

ProductionNotesListView.displayName = 'ProductionNotesListView';