import { Resource } from '@/types/resource';
import { BoardResourceCard } from './BoardResourceCard';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';

interface ResourceColumnProps {
  title: string;
  icon: string;
  color: string;
  resources: Resource[];
  onToggleFavorite: (id: string) => void;
  onEdit: (resource: Resource) => void;
  onDelete: (id: string) => void;
  onView: (resource: Resource) => void;
  onAddResource: () => void;
  searchTerm: string;
}

export const ResourceColumn = ({
  title,
  icon,
  color,
  resources,
  onToggleFavorite,
  onEdit,
  onDelete,
  onView,
  onAddResource,
  searchTerm
}: ResourceColumnProps) => {
  return (
    <div className={`rounded-lg border-2 ${color} p-4 min-h-[300px] animate-fade-in`}>
      {/* Column Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <span className="text-lg">{icon}</span>
          <h3 className="font-semibold text-sm">{title}</h3>
          <Badge variant="secondary" className="text-xs">
            {resources.length}
          </Badge>
        </div>
        <Button
          variant="ghost"
          size="sm"
          className="h-6 w-6 p-0"
          onClick={onAddResource}
          title="Add resource"
        >
          <Plus className="h-3 w-3" />
        </Button>
      </div>

      {/* Resources List */}
      <div className="space-y-3">
        {resources.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <div className="text-2xl mb-2">📝</div>
            <p className="text-xs">No {title.toLowerCase()} yet</p>
          </div>
        ) : (
          resources.map((resource) => (
            <BoardResourceCard
              key={resource.id}
              resource={resource}
              onToggleFavorite={onToggleFavorite}
              onEdit={onEdit}
              onDelete={onDelete}
              onView={onView}
              searchTerm={searchTerm}
            />
          ))
        )}
      </div>
    </div>
  );
};