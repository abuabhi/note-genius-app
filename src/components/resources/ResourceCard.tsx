import React from 'react';
import { Resource } from '@/types/resource';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Heart, ExternalLink, Edit, Trash2 } from 'lucide-react';
import { getResourceTypeInfo } from '@/components/resources/utils/resourceTypes';
import { Badge } from '@/components/ui/badge';
import { formatDistanceToNow } from 'date-fns';
import * as Icons from 'lucide-react';

interface ResourceCardProps {
  resource: Resource;
  onToggleFavorite: (id: string) => void;
  onEdit: (resource: Resource) => void;
  onDelete: (id: string) => void;
  onView: (resource: Resource) => void;
}

export const ResourceCard = ({
  resource,
  onToggleFavorite,
  onEdit,
  onDelete,
  onView
}: ResourceCardProps) => {
  const resourceTypeInfo = getResourceTypeInfo(resource.resource_type);
  const IconComponent = (Icons as any)[resourceTypeInfo.icon] || Icons.Globe;

  return (
    <Card className="group hover:shadow-lg transition-all duration-200 h-full">
      <CardContent className="p-4 flex flex-col h-full">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-2">
            <IconComponent className="h-5 w-5 text-primary" />
            <Badge variant="secondary" className="text-xs">
              {resource.resource_type}
            </Badge>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onToggleFavorite(resource.id)}
            className="p-1 h-auto"
          >
            <Heart 
              fill={resource.is_favorite ? '#ef4444' : 'none'}
              className={`h-4 w-4 ${
                resource.is_favorite 
                  ? 'text-red-500' 
                  : 'text-gray-400 hover:text-red-500'
              }`}
            />
          </Button>
        </div>

        <div className="flex-1 mb-4">
          {resource.thumbnail_url && (
            <div className="mb-3">
              <img 
                src={resource.thumbnail_url} 
                alt={resource.title}
                className="w-full h-32 object-cover rounded-md"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = 'none';
                }}
              />
            </div>
          )}
          
          <h3 className="font-semibold text-sm mb-2 line-clamp-2 leading-tight">
            {resource.title}
          </h3>
          
          {resource.description && (
            <p className="text-gray-600 text-xs mb-2 line-clamp-2">
              {resource.description}
            </p>
          )}

          {resource.author && (
            <p className="text-gray-500 text-xs mb-1">
              By {resource.author}
            </p>
          )}

          {resource.difficulty_level && (
            <Badge variant="outline" className="text-xs mb-2">
              {resource.difficulty_level}
            </Badge>
          )}
        </div>

        <div className="space-y-3">
          {resource.tags.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {resource.tags.slice(0, 3).map((tag, index) => (
                <Badge key={index} variant="outline" className="text-xs">
                  {tag}
                </Badge>
              ))}
              {resource.tags.length > 3 && (
                <Badge variant="outline" className="text-xs">
                  +{resource.tags.length - 3} more
                </Badge>
              )}
            </div>
          )}

          <div className="flex items-center justify-between text-xs text-gray-500">
            <span>
              {formatDistanceToNow(new Date(resource.created_at), { addSuffix: true })}
            </span>
            <span>{resource.access_count} views</span>
          </div>

          <div className="flex gap-1">
            <Button
              variant="default"
              size="sm"
              onClick={() => onView(resource)}
              className="flex-1 h-8 text-xs"
            >
              <ExternalLink className="h-3 w-3 mr-1" />
              Open
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onEdit(resource)}
              className="h-8 px-2"
            >
              <Edit className="h-3 w-3" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onDelete(resource.id)}
              className="h-8 px-2 text-red-600 hover:text-red-700"
            >
              <Trash2 className="h-3 w-3" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};