import { ErrorBoundary } from 'react-error-boundary';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Helmet } from 'react-helmet';
import { useState } from 'react';
import { ResourcesPageHeader } from '@/components/resources/page/ResourcesPageHeader';
import { ResourcesFilters } from '@/components/resources/ResourcesFilters';
import { ResourcesGrid } from '@/components/resources/ResourcesGrid';
import { useResources } from '@/hooks/useResources';
import { useUniversalFilters } from '@/hooks/useUniversalFilters';
import { useViewPreferences } from '@/hooks/useViewPreferences';
import { Resource } from '@/types/resource';
import { toast } from 'sonner';
import { AddResourceDialog } from '@/components/resources/dialogs/AddResourceDialog';
import { EditResourceDialog } from '@/components/resources/dialogs/EditResourceDialog';

// Enhanced error fallback component
const ErrorFallback = ({ error, resetErrorBoundary }: { error: Error; resetErrorBoundary: () => void }) => {
  console.error('ResourcesPage Error:', error);
  
  return (
    <div className="container mx-auto p-4 md:p-6">
      <Alert variant="destructive">
        <AlertTitle>Resources Page Error</AlertTitle>
        <AlertDescription className="mt-2 space-y-2">
          <p><strong>Error:</strong> {error.message}</p>
          <p><strong>Location:</strong> Resources page failed to load</p>
          <div className="flex gap-2 mt-4">
            <Button 
              variant="outline" 
              size="sm"
              onClick={resetErrorBoundary}
            >
              Try again
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => window.location.reload()}
            >
              Refresh page
            </Button>
          </div>
        </AlertDescription>
      </Alert>
    </div>
  );
};

const ResourcesPageContent = () => {
  const { viewMode, setViewMode } = useViewPreferences('resources');
  const [selectedResourceType, setSelectedResourceType] = useState('all');
  const [selectedDifficulty, setSelectedDifficulty] = useState('all');
  const [showFavorites, setShowFavorites] = useState(false);
  
  // Dialog states
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingResource, setEditingResource] = useState<Resource | null>(null);

  const {
    search,
    subject,
    sort,
    setSearch,
    setSubject,
    setSort,
    hasActiveFilters,
    activeFilterCount,
    clearFilters,
    debouncedSearch
  } = useUniversalFilters();

  // Create filter object for useResources
  const resourceFilters = {
    search: debouncedSearch,
    subject,
    resourceType: selectedResourceType,
    difficultyLevel: selectedDifficulty,
    isFavorite: showFavorites,
    sort
  };

  const {
    resources,
    isLoading,
    error,
    addResource,
    updateResource,
    deleteResource,
    toggleFavorite
  } = useResources({ filters: resourceFilters });

  const handleClearFilters = () => {
    clearFilters();
    setSelectedResourceType('all');
    setSelectedDifficulty('all');
    setShowFavorites(false);
  };

  const handleAddResource = () => {
    setIsAddDialogOpen(true);
  };

  const handleImportResource = () => {
    toast.info('Import functionality coming soon');
  };

  const handleEditResource = (resource: Resource) => {
    setEditingResource(resource);
    setIsEditDialogOpen(true);
  };

  const handleDeleteResource = async (id: string) => {
    try {
      await deleteResource(id);
    } catch (error) {
      // Error is handled by the hook
    }
  };

  const handleViewResource = (resource: Resource) => {
    window.open(resource.url, '_blank');
  };

  const handleToggleFavorite = async (id: string) => {
    try {
      const resource = resources.find(r => r.id === id);
      if (resource) {
        await toggleFavorite(id, resource.is_favorite);
      }
    } catch (error) {
      // Error is handled by the hook
    }
  };

  return (
    <div className="h-full">
      <Helmet>
        <title>Resources - Study Helper</title>
        <meta name="description" content="Save and organize your study resources" />
        <meta name="robots" content="noindex,nofollow" />
      </Helmet>
      
      <div className="container mx-auto px-6 py-8">
        <ErrorBoundary
          FallbackComponent={ErrorFallback}
          onReset={() => {
            console.log('Resetting resources page error boundary');
          }}
          onError={(error, errorInfo) => {
            console.error('Resources page error caught by boundary:', error, errorInfo);
          }}
        >
          <div className="space-y-6">
            <ResourcesPageHeader
              loading={isLoading}
              viewMode={viewMode}
              onViewModeChange={setViewMode}
              onAddResource={handleAddResource}
              onImportResource={handleImportResource}
            />

            <ResourcesFilters
              searchTerm={search}
              setSearchTerm={setSearch}
              selectedSubject={subject}
              setSelectedSubject={setSubject}
              selectedResourceType={selectedResourceType}
              setSelectedResourceType={setSelectedResourceType}
              selectedDifficulty={selectedDifficulty}
              setSelectedDifficulty={setSelectedDifficulty}
              showFavorites={showFavorites}
              setShowFavorites={setShowFavorites}
              sortType={sort}
              setSortType={setSort}
              hasActiveFilters={hasActiveFilters || selectedResourceType !== 'all' || selectedDifficulty !== 'all' || showFavorites}
              activeFilterCount={activeFilterCount + (selectedResourceType !== 'all' ? 1 : 0) + (selectedDifficulty !== 'all' ? 1 : 0) + (showFavorites ? 1 : 0)}
              clearFilters={handleClearFilters}
              loading={isLoading}
              totalCount={resources.length}
            />

            <ResourcesGrid
              resources={resources}
              viewMode={viewMode}
              onToggleFavorite={handleToggleFavorite}
              onEdit={handleEditResource}
              onDelete={handleDeleteResource}
              onView={handleViewResource}
              onAddResource={handleAddResource}
              onImportResource={handleImportResource}
              loading={isLoading}
              hasActiveFilters={hasActiveFilters || selectedResourceType !== 'all' || selectedDifficulty !== 'all' || showFavorites}
            />
          </div>
        </ErrorBoundary>
      </div>

      {/* Dialogs */}
      <AddResourceDialog 
        open={isAddDialogOpen} 
        onOpenChange={setIsAddDialogOpen}
      />
      
      <EditResourceDialog 
        open={isEditDialogOpen} 
        onOpenChange={(open) => {
          setIsEditDialogOpen(open);
          if (!open) {
            setEditingResource(null);
          }
        }}
        resource={editingResource}
      />
    </div>
  );
};

const ResourcesPage = () => {
  return <ResourcesPageContent />;
};

export default ResourcesPage;