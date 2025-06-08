
import { Note } from '@/types/note';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Pin, Archive, Calendar, FileText } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface OptimizedNotesGridProps {
  notes: Note[];
}

export const OptimizedNotesGrid = ({ notes }: OptimizedNotesGridProps) => {
  if (notes.length === 0) {
    return null;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {notes.map((note) => (
        <Card 
          key={note.id}
          className={`group hover:shadow-lg transition-all duration-200 cursor-pointer bg-white/80 backdrop-blur-sm border-mint-100/50 ${
            note.pinned ? 'ring-2 ring-mint-200' : ''
          } ${note.archived ? 'opacity-75' : ''}`}
        >
          <CardHeader className="pb-3">
            <div className="flex items-start justify-between">
              <h3 className="font-semibold text-gray-900 line-clamp-2 group-hover:text-mint-600 transition-colors">
                {note.title}
              </h3>
              <div className="flex gap-1 ml-2">
                {note.pinned && (
                  <Pin className="h-4 w-4 text-mint-600 fill-current" />
                )}
                {note.archived && (
                  <Archive className="h-4 w-4 text-gray-400" />
                )}
              </div>
            </div>
            
            <p className="text-sm text-gray-600 line-clamp-3">
              {note.description}
            </p>
          </CardHeader>

          <CardContent className="pt-0">
            <div className="space-y-3">
              {/* Subject/Category */}
              <Badge variant="secondary" className="bg-mint-50 text-mint-700 border-mint-200">
                {note.category}
              </Badge>

              {/* Tags */}
              {note.tags && note.tags.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {note.tags.slice(0, 3).map((tag, index) => (
                    <Badge 
                      key={index}
                      variant="outline" 
                      className="text-xs"
                      style={{ borderColor: tag.color, color: tag.color }}
                    >
                      {tag.name}
                    </Badge>
                  ))}
                  {note.tags.length > 3 && (
                    <Badge variant="outline" className="text-xs">
                      +{note.tags.length - 3} more
                    </Badge>
                  )}
                </div>
              )}

              {/* Metadata */}
              <div className="flex items-center justify-between text-xs text-gray-500">
                <div className="flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  {formatDistanceToNow(new Date(note.date), { addSuffix: true })}
                </div>
                
                <div className="flex items-center gap-1">
                  <FileText className="h-3 w-3" />
                  {note.sourceType}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
