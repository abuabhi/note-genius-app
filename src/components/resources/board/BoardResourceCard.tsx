import { Resource } from '@/types/resource';
import { Button } from '@/components/ui/button';
import { 
  ExternalLink, 
  Heart, 
  MoreHorizontal,
  Edit,
  Trash2
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { 
  DropdownMenu,
  DropdownMenuContent, 
  DropdownMenuItem,
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';

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
    <div 
      className="bg-white rounded-lg border shadow-sm p-3 hover:shadow-md transition-all duration-200 group animate-fade-in cursor-pointer"
      onClick={() => onView(resource)}
    >
      <div className="flex items-center justify-between">
        {/* Icon and Title with optional heart */}
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <span className="text-sm">{getResourceTypeIcon(resource.resource_type)}</span>
          {resource.is_favorite && (
            <Heart className="h-3 w-3 text-red-500 fill-current flex-shrink-0" />
          )}
          <h4 className="font-medium text-sm truncate flex-1">
            {highlightText(resource.title, searchTerm)}
          </h4>
        </div>

        {/* 3-dot menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
              onClick={(e) => e.stopPropagation()}
            >
              <MoreHorizontal className="h-3 w-3" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem 
              onClick={(e) => {
                e.stopPropagation();
                onToggleFavorite(resource.id);
              }}
            >
              <Heart className="h-3 w-3 mr-2" />
              {resource.is_favorite ? 'Remove from Favorites' : 'Add to Favorites'}
            </DropdownMenuItem>
            <DropdownMenuItem 
              onClick={(e) => {
                e.stopPropagation();
                onEdit(resource);
              }}
            >
              <Edit className="h-3 w-3 mr-2" />
              Edit Resource
            </DropdownMenuItem>
            <DropdownMenuItem 
              onClick={(e) => {
                e.stopPropagation();
                onDelete(resource.id);
              }}
              className="text-destructive"
            >
              <Trash2 className="h-3 w-3 mr-2" />
              Delete Resource
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
};