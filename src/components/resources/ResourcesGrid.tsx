import React from 'react';
import { FixedSizeList as List } from 'react-window';
import { Resource } from '@/types/resource';
import { ResourceCard } from './ResourceCard';
import { ResourcesEmptyState } from './ResourcesEmptyState';
import { ViewMode } from '@/hooks/useViewPreferences';

interface ResourcesGridProps {
  resources: Resource[];
  viewMode: ViewMode;
  onToggleFavorite: (id: string) => void;
  onEdit: (resource: Resource) => void;
  onDelete: (id: string) => void;
  onView: (resource: Resource) => void;
  onAddResource?: () => void;
  onImportResource?: () => void;
  loading: boolean;
  hasActiveFilters?: boolean;
}

const VIRTUALIZATION_THRESHOLD = 30;
const LIST_ITEM_HEIGHT = 100;

export const ResourcesGrid = ({
  resources,
  viewMode,
  onToggleFavorite,
  onEdit,
  onDelete,
  onView,
  onAddResource,
  onImportResource,
  loading,
  hasActiveFilters = false
}: ResourcesGridProps) => {
  const shouldVirtualize = resources.length > VIRTUALIZATION_THRESHOLD;

  if (loading) {
    return (
      <div className="bg-white/80 backdrop-blur-sm rounded-3xl border border-white/20 shadow-lg shadow-mint-500/5 p-6">
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-mint-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading resources...</p>
        </div>
      </div>
    );
  }

  if (resources.length === 0) {
    return (
      <div className="bg-white/80 backdrop-blur-sm rounded-3xl border border-white/20 shadow-lg shadow-mint-500/5 p-6">
        <ResourcesEmptyState
          hasActiveFilters={hasActiveFilters}
          onAddResource={onAddResource}
          onImportResource={onImportResource}
        />
      </div>
    );
  }

  if (viewMode === 'list') {
    // Virtualized list for large lists
    if (shouldVirtualize) {
      const Row = ({ index, style }: { index: number; style: React.CSSProperties }) => {
        const resource = resources[index];
        return (
          <div style={style} className="px-1">
            <div className="p-4 border rounded-lg hover:shadow-sm transition-shadow bg-white">
              <div className="flex items-center justify-between">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="font-medium truncate">{resource.title}</h3>
                    <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                      {resource.resource_type}
                    </span>
                    {resource.is_favorite && (
                      <span className="text-red-500">♥</span>
                    )}
                  </div>
                  <p className="text-sm text-gray-600 truncate">
                    {resource.description}
                  </p>
                </div>
                <div className="flex items-center gap-2 ml-4">
                  <button
                    onClick={() => onView(resource)}
                    className="text-primary hover:text-primary-dark text-sm"
                  >
                    Open
                  </button>
                  <button
                    onClick={() => onEdit(resource)}
                    className="text-gray-500 hover:text-gray-700 text-sm"
                  >
                    Edit
                  </button>
                </div>
              </div>
            </div>
          </div>
        );
      };

      return (
        <div className="bg-white/80 backdrop-blur-sm rounded-3xl border border-white/20 shadow-lg shadow-mint-500/5 p-6">
          <div className="text-xs text-gray-400 mb-2">
            Showing {resources.length} resources (virtualized for performance)
          </div>
          <List
            height={500}
            itemCount={resources.length}
            itemSize={LIST_ITEM_HEIGHT}
            width="100%"
          >
            {Row}
          </List>
        </div>
      );
    }

    // Standard list for smaller lists
    return (
      <div className="bg-white/80 backdrop-blur-sm rounded-3xl border border-white/20 shadow-lg shadow-mint-500/5 p-6">
        <div className="space-y-3">
          {resources.map((resource) => (
            <div 
              key={resource.id} 
              className="p-4 border rounded-lg hover:shadow-sm transition-shadow"
            >
              <div className="flex items-center justify-between">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="font-medium truncate">{resource.title}</h3>
                    <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                      {resource.resource_type}
                    </span>
                    {resource.is_favorite && (
                      <span className="text-red-500">♥</span>
                    )}
                  </div>
                  <p className="text-sm text-gray-600 truncate">
                    {resource.description}
                  </p>
                  {resource.author && (
                    <p className="text-xs text-gray-500 mt-1">
                      By {resource.author}
                    </p>
                  )}
                </div>
                <div className="flex items-center gap-2 ml-4">
                  <button
                    onClick={() => onView(resource)}
                    className="text-primary hover:text-primary-dark text-sm"
                  >
                    Open
                  </button>
                  <button
                    onClick={() => onEdit(resource)}
                    className="text-gray-500 hover:text-gray-700 text-sm"
                  >
                    Edit
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white/80 backdrop-blur-sm rounded-3xl border border-white/20 shadow-lg shadow-mint-500/5 p-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {resources.map((resource) => (
          <ResourceCard
            key={resource.id}
            resource={resource}
            onToggleFavorite={onToggleFavorite}
            onEdit={onEdit}
            onDelete={onDelete}
            onView={onView}
          />
        ))}
      </div>
    </div>
  );
};