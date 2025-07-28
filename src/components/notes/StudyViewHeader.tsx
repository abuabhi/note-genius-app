
import { Note } from '@/types/note';
import { Badge } from '@/components/ui/badge';
import { Calendar, Tag, Youtube } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface StudyViewHeaderProps {
  title: string;
  subject?: string;
  createdAt: string;
  updatedAt: string;
  sourceType?: string;
  videoUrl?: string;
}

export const StudyViewHeader = ({ title, subject, createdAt, updatedAt, sourceType, videoUrl }: StudyViewHeaderProps) => {
  return (
    <div className="space-y-4 p-6 border-b">
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
          {sourceType === 'youtube' && videoUrl && (
            <a
              href={videoUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-3 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors"
              title="Watch YouTube video"
            >
              <Youtube className="h-5 w-5" />
              Watch Video
            </a>
          )}
        </div>
        
        <div className="flex items-center gap-4 text-sm text-gray-600">
          {subject && (
            <div className="flex items-center gap-1">
              <Tag className="h-4 w-4" />
              <Badge variant="outline">{subject}</Badge>
            </div>
          )}
          
          <div className="flex items-center gap-1">
            <Calendar className="h-4 w-4" />
            <span>Created {formatDistanceToNow(new Date(createdAt), { addSuffix: true })}</span>
          </div>
          
          {updatedAt !== createdAt && (
            <div className="flex items-center gap-1">
              <Calendar className="h-4 w-4" />
              <span>Updated {formatDistanceToNow(new Date(updatedAt), { addSuffix: true })}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
