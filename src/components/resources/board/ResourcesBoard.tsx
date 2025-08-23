import { useState, useMemo } from 'react';
import { Resource } from '@/types/resource';
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

interface SubjectColumn {
  id: string;
  label: string;
  icon: string;
  color: string;
  subjectId?: string;
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

  // Define subject colors (cycling through a set)
  const subjectColors = [
    'bg-blue-50 border-blue-200',
    'bg-green-50 border-green-200', 
    'bg-purple-50 border-purple-200',
    'bg-orange-50 border-orange-200',
    'bg-pink-50 border-pink-200',
    'bg-indigo-50 border-indigo-200'
  ];

  // Get subject icons (you can customize these or make them configurable)
  const getSubjectIcon = (subjectName: string) => {
    const name = subjectName.toLowerCase();
    if (name.includes('math')) return '🔢';
    if (name.includes('science')) return '🔬';
    if (name.includes('english') || name.includes('language')) return '📚';
    if (name.includes('history')) return '📜';
    if (name.includes('art')) return '🎨';
    if (name.includes('music')) return '🎵';
    if (name.includes('computer') || name.includes('coding')) return '💻';
    return '📖'; // default icon
  };

  // Create subject columns (show all user subjects)
  const subjectColumns: SubjectColumn[] = useMemo(() => {
    if (!subjects?.length) return [];
    
    // Get resource counts per subject to determine order
    const subjectResourceCounts = subjects.map(subject => {
      const resourceCount = resources.filter(r => r.subject_id === subject.id).length;
      return { subject, resourceCount };
    });

    // Sort by resource count (subjects with resources first) then alphabetically
    const allSubjects = subjectResourceCounts
      .sort((a, b) => {
        // Subjects with resources first
        if (a.resourceCount > 0 && b.resourceCount === 0) return -1;
        if (a.resourceCount === 0 && b.resourceCount > 0) return 1;
        // Within same category (has resources or not), sort by resource count desc, then name
        if (a.resourceCount !== b.resourceCount) return b.resourceCount - a.resourceCount;
        return a.subject.name.localeCompare(b.subject.name);
      })
      .map(({ subject }, index) => ({
        id: subject.id,
        label: subject.name,
        icon: getSubjectIcon(subject.name),
        color: subjectColors[index % subjectColors.length],
        subjectId: subject.id
      }));

    return allSubjects;
  }, [subjects, resources]);


  // Organize resources by subject with favorites sorted to top
  const organizedResources = useMemo(() => {
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

    // Organize by subjects
    const organized: Record<string, Resource[]> = {};

    subjectColumns.forEach(column => {
      // Get resources for this specific subject
      const columnResources = filteredResources.filter(resource => 
        resource.subject_id === column.subjectId
      );

      // Sort within each column: favorites first, then by title
      columnResources.sort((a, b) => {
        // Favorites first
        if (a.is_favorite && !b.is_favorite) return -1;
        if (!a.is_favorite && b.is_favorite) return 1;
        // Then alphabetical by title
        return a.title.localeCompare(b.title);
      });

      organized[column.id] = columnResources;
    });

    return organized;
  }, [resources, searchTerm, showFavoritesOnly, subjectColumns]);

  const totalFilteredResources = Object.values(organizedResources).flat().length;
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 3 }).map((_, i) => (
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

      {/* Subject Board Grid - Responsive columns with natural wrapping */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6">
        {subjectColumns.map(column => {
          const columnResources = organizedResources[column.id] || [];
          
          // Don't show empty columns when filters are active
          if (hasActiveFilters && columnResources.length === 0) {
            return null;
          }

          return (
            <ResourceColumn
              key={column.id}
              title={column.label}
              icon={column.icon}
              color={column.color}
              resources={columnResources}
              onToggleFavorite={onToggleFavorite}
              onEdit={onEdit}
              onDelete={onDelete}
              onView={onView}
              onAddResource={onAddResource}
              searchTerm={searchTerm}
            />
          );
        })}
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