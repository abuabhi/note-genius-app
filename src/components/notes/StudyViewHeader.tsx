
import { Note } from '@/types/note';
import { Badge } from '@/components/ui/badge';
import { Calendar, Tag } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface StudyViewHeaderProps {
  title: string;
  subject?: string;
  createdAt: string;
  updatedAt: string;
}

export const StudyViewHeader = ({ title, subject, createdAt, updatedAt }: StudyViewHeaderProps) => {
  return (
    <div className="space-y-4 p-6 border-b">
      <div className="space-y-2">
        <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
        
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
