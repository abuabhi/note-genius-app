import { useState, useMemo } from 'react';
import { Resource, ResourceType } from '@/types/resource';
import { ResourceColumn } from './ResourceColumn';
import { BoardResourceCard } from './BoardResourceCard';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Search, Filter, RotateCcw } from 'lucide-react';
import { useUserSubjects } from '@/hooks/useUserSubjects';

interface ResourcesBoardProps {
  resources: Resource[];
  onToggleFavorite: (id: string) => void;
  onEdit: (resource: Resource) => void;
  onDelete: (id: string) => void;
  onView: (resource: Resource) => void;
  onAddResource: () => void;
  loading: boolean;
}

interface ResourceCategory {
  id: string;
  label: string;
  icon: string;
  color: string;
  types?: ResourceType[];
  filterFn?: (resource: Resource) => boolean;
}

export const ResourcesBoard = ({
  resources,
  onToggleFavorite,
  onEdit,
  onDelete,
  onView,
  onAddResource,
  loading
}: ResourcesBoardProps) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  const { subjects } = useUserSubjects();

  // Define resource categories
  const categories: ResourceCategory[] = [
    {
      id: 'videos',
      label: 'Videos & Media',
      icon: '🎥',
      color: 'bg-red-50 border-red-200',
      types: ['youtube_video', 'lecture_recording']
    },
    {
      id: 'documents',
      label: 'Documents',
      icon: '📄',
      color: 'bg-blue-50 border-blue-200',
      types: ['pdf_document', 'textbook', 'research_paper']
    },
    {
      id: 'articles',
      label: 'Articles & Web',
      icon: '📰',
      color: 'bg-green-50 border-green-200',
      types: ['article', 'website', 'reference_site']
    },
    {
      id: 'tools',
      label: 'Tools & Utilities',
      icon: '🧮',
      color: 'bg-purple-50 border-purple-200',
      types: ['calculator', 'dictionary']
    },
    {
      id: 'academic',
      label: 'Academic Materials',
      icon: '📚',
      color: 'bg-orange-50 border-orange-200',
      types: ['syllabus', 'assignment_sheet', 'rubric']
    },
    {
      id: 'favorites',
      label: 'Favorites',
      icon: '⭐',
      color: 'bg-yellow-50 border-yellow-200',
      filterFn: (resource: Resource) => resource.is_favorite
    }
  ];

  // Categorize resources
  const categorizedResources = useMemo(() => {
    let filteredResources = resources;

    // Apply search filter
    if (searchTerm) {
      const lowercaseSearch = searchTerm.toLowerCase();
      filteredResources = resources.filter(resource => 
        resource.title.toLowerCase().includes(lowercaseSearch) ||
        resource.description?.toLowerCase().includes(lowercaseSearch) ||
        resource.author?.toLowerCase().includes(lowercaseSearch) ||
        resource.tags.some(tag => tag.toLowerCase().includes(lowercaseSearch))
      );
    }

    // Apply favorites filter
    if (showFavoritesOnly) {
      filteredResources = filteredResources.filter(resource => resource.is_favorite);
    }

    // Categorize the filtered resources
    const categorized: Record<string, Resource[]> = {};

    categories.forEach(category => {
      if (category.filterFn) {
        categorized[category.id] = filteredResources.filter(category.filterFn);
      } else if (category.types) {
        categorized[category.id] = filteredResources.filter(resource => 
          category.types!.includes(resource.resource_type)
        );
      } else {
        categorized[category.id] = [];
      }
    });

    // Add uncategorized resources to a catch-all category
    const categorizedResourceIds = new Set(
      Object.values(categorized).flat().map(r => r.id)
    );
    
    const uncategorized = filteredResources.filter(resource => 
      !categorizedResourceIds.has(resource.id)
    );

    if (uncategorized.length > 0) {
      categorized['other'] = uncategorized;
    }

    return categorized;
  }, [resources, searchTerm, showFavoritesOnly, categories]);

  const totalFilteredResources = Object.values(categorizedResources).flat().length;
  const hasActiveFilters = searchTerm !== '' || showFavoritesOnly;

  const clearFilters = () => {
    setSearchTerm('');
    setShowFavoritesOnly(false);
  };

  if (loading) {
    return (
      <div className="space-y-6">
        {/* Loading skeleton */}
        <div className="flex flex-col md:flex-row gap-4">
          <div className="h-10 bg-muted rounded animate-pulse flex-1" />
          <div className="h-10 bg-muted rounded animate-pulse w-32" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="space-y-4">
              <div className="h-8 bg-muted rounded animate-pulse" />
              <div className="space-y-2">
                <div className="h-24 bg-muted rounded animate-pulse" />
                <div className="h-24 bg-muted rounded animate-pulse" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Board Filters */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search across all categories..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex gap-2">
          <Button
            variant={showFavoritesOnly ? "default" : "outline"}
            size="sm"
            onClick={() => setShowFavoritesOnly(!showFavoritesOnly)}
          >
            <Filter className="h-4 w-4 mr-2" />
            Favorites Only
          </Button>
          {hasActiveFilters && (
            <Button variant="outline" size="sm" onClick={clearFilters}>
              <RotateCcw className="h-4 w-4 mr-2" />
              Clear
            </Button>
          )}
        </div>
      </div>

      {/* Filter Summary */}
      {hasActiveFilters && (
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Active filters:</span>
          {searchTerm && (
            <Badge variant="secondary">Search: {searchTerm}</Badge>
          )}
          {showFavoritesOnly && (
            <Badge variant="secondary">Favorites Only</Badge>
          )}
          <span className="text-sm text-muted-foreground">
            ({totalFilteredResources} resources found)
          </span>
        </div>
      )}

      {/* Resource Board Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6">
        {categories.map(category => {
          const categoryResources = categorizedResources[category.id] || [];
          
          // Don't show empty categories when filters are active (unless it's favorites)
          if (hasActiveFilters && categoryResources.length === 0 && category.id !== 'favorites') {
            return null;
          }

          return (
            <ResourceColumn
              key={category.id}
              title={category.label}
              icon={category.icon}
              color={category.color}
              resources={categoryResources}
              onToggleFavorite={onToggleFavorite}
              onEdit={onEdit}
              onDelete={onDelete}
              onView={onView}
              onAddResource={onAddResource}
              searchTerm={searchTerm}
            />
          );
        })}
        
        {/* Uncategorized resources */}
        {categorizedResources['other'] && (
          <ResourceColumn
            title="Other"
            icon="📁"
            color="bg-gray-50 border-gray-200"
            resources={categorizedResources['other']}
            onToggleFavorite={onToggleFavorite}
            onEdit={onEdit}
            onDelete={onDelete}
            onView={onView}
            onAddResource={onAddResource}
            searchTerm={searchTerm}
          />
        )}
      </div>

      {/* Empty State */}
      {totalFilteredResources === 0 && (
        <div className="text-center py-12">
          <div className="text-4xl mb-4">📚</div>
          <h3 className="text-lg font-medium mb-2">
            {hasActiveFilters ? 'No resources match your filters' : 'No resources yet'}
          </h3>
          <p className="text-muted-foreground mb-4">
            {hasActiveFilters 
              ? 'Try adjusting your search or clearing filters'
              : 'Add your first resource to get started'
            }
          </p>
          {hasActiveFilters ? (
            <Button variant="outline" onClick={clearFilters}>
              Clear Filters
            </Button>
          ) : (
            <Button onClick={onAddResource}>
              Add Resource
            </Button>
          )}
        </div>
      )}
    </div>
  );
};