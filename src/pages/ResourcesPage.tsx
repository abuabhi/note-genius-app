import { ErrorBoundary } from '@/components/common/ErrorBoundary';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Helmet } from 'react-helmet';
import { useState } from 'react';
import { ResourcesPageHeader } from '@/components/resources/page/ResourcesPageHeader';
import { ResourcesBoard } from '@/components/resources/board/ResourcesBoard';
import { useResources } from '@/hooks/useResources';
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
  
  // Dialog states
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingResource, setEditingResource] = useState<Resource | null>(null);

  // Minimal filters for board view - board will handle its own categorization and search
  const resourceFilters = {
    search: '',
    subject: 'all',
    resourceType: 'all',
    difficultyLevel: 'all',
    isFavorite: false,
    sort: 'newest'
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
      
      <ErrorBoundary
        fallback={<ErrorFallback error={new Error('Unknown error')} resetErrorBoundary={() => window.location.reload()} />}
        label="Resources Page"
      >
        <ResourcesPageHeader
          loading={isLoading}
          viewMode={viewMode}
          onViewModeChange={setViewMode}
          onAddResource={handleAddResource}
          onImportResource={handleImportResource}
        />

        <div className="container mx-auto px-6 py-8">
          <ResourcesBoard
            resources={resources}
            onToggleFavorite={handleToggleFavorite}
            onEdit={handleEditResource}
            onDelete={handleDeleteResource}
            onView={handleViewResource}
            onAddResource={handleAddResource}
            loading={isLoading}
          />
        </div>
      </ErrorBoundary>

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