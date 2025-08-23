import { Resource } from '@/types/resource';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  ExternalLink, 
  Edit, 
  Trash2, 
  Heart, 
  Eye,
  Clock,
  User
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface BoardResourceCardProps {
  resource: Resource;
  onToggleFavorite: (id: string) => void;
  onEdit: (resource: Resource) => void;
  onDelete: (id: string) => void;
  onView: (resource: Resource) => void;
  searchTerm: string;
}

export const BoardResourceCard = ({
  resource,
  onToggleFavorite,
  onEdit,
  onDelete,
  onView,
  searchTerm
}: BoardResourceCardProps) => {
  // Helper function to highlight search terms
  const highlightText = (text: string, search: string) => {
    if (!search) return text;
    
    const regex = new RegExp(`(${search})`, 'gi');
    const parts = text.split(regex);
    
    return parts.map((part, index) => 
      regex.test(part) ? (
        <mark key={index} className="bg-yellow-200 px-1 rounded">
          {part}
        </mark>
      ) : (
        part
      )
    );
  };

  const getResourceTypeIcon = (type: string) => {
    switch (type) {
      case 'youtube_video': return '🎥';
      case 'article': return '📰';
      case 'pdf_document': return '📄';
      case 'website': return '🌐';
      case 'research_paper': return '📑';
      case 'lecture_recording': return '🎧';
      case 'textbook': return '📚';
      case 'reference_site': return '🔗';
      case 'dictionary': return '📖';
      case 'calculator': return '🧮';
      case 'syllabus': return '📋';
      case 'assignment_sheet': return '📝';
      case 'rubric': return '📊';
      default: return '📄';
    }
  };

  return (
    <div className="bg-white rounded-lg border shadow-sm p-3 hover:shadow-md transition-all duration-200 group animate-fade-in">
      {/* Header */}
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <span className="text-sm">{getResourceTypeIcon(resource.resource_type)}</span>
          <h4 className="font-medium text-sm truncate flex-1">
            {highlightText(resource.title, searchTerm)}
          </h4>
        </div>
        <Button
          variant="ghost"
          size="sm"
          className={cn(
            "h-6 w-6 p-0",
            resource.is_favorite 
              ? "text-red-500 hover:text-red-600" 
              : "text-muted-foreground hover:text-red-500"
          )}
          onClick={() => onToggleFavorite(resource.id)}
        >
          <Heart className={cn("h-3 w-3", resource.is_favorite && "fill-current")} />
        </Button>
      </div>

      {/* Description */}
      {resource.description && (
        <p className="text-xs text-muted-foreground mb-2 line-clamp-2">
          {highlightText(resource.description, searchTerm)}
        </p>
      )}

      {/* Metadata */}
      <div className="flex items-center gap-2 mb-2 text-xs text-muted-foreground">
        {resource.author && (
          <div className="flex items-center gap-1">
            <User className="h-3 w-3" />
            <span className="truncate max-w-20">{resource.author}</span>
          </div>
        )}
        <div className="flex items-center gap-1">
          <Eye className="h-3 w-3" />
          <span>{resource.access_count}</span>
        </div>
        {resource.duration_minutes && (
          <div className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            <span>{resource.duration_minutes}m</span>
          </div>
        )}
      </div>

      {/* Tags */}
      {resource.tags.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-2">
          {resource.tags.slice(0, 2).map((tag) => (
            <Badge key={tag} variant="outline" className="text-xs px-1.5 py-0">
              {highlightText(tag, searchTerm)}
            </Badge>
          ))}
          {resource.tags.length > 2 && (
            <Badge variant="outline" className="text-xs px-1.5 py-0">
              +{resource.tags.length - 2}
            </Badge>
          )}
        </div>
      )}

      {/* Difficulty Badge */}
      {resource.difficulty_level && (
        <div className="mb-2">
          <Badge 
            variant={
              resource.difficulty_level === 'beginner' ? 'default' :
              resource.difficulty_level === 'intermediate' ? 'secondary' : 
              'destructive'
            }
            className="text-xs"
          >
            {resource.difficulty_level}
          </Badge>
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-1">
        <Button
          variant="default"
          size="sm"
          onClick={() => onView(resource)}
          className="flex-1 h-7 text-xs"
        >
          <ExternalLink className="h-3 w-3 mr-1" />
          Open
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onEdit(resource)}
          className="h-7 px-2"
        >
          <Edit className="h-3 w-3" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onDelete(resource.id)}
          className="h-7 px-2 text-destructive hover:text-destructive"
        >
          <Trash2 className="h-3 w-3" />
        </Button>
      </div>
    </div>
  );
};