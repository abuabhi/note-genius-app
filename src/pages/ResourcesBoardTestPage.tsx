import { ErrorBoundary } from 'react-error-boundary';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Helmet } from 'react-helmet';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { ResourcesBoard } from '@/components/resources/board/ResourcesBoard';
import { useResources } from '@/hooks/useResources';
import { Resource } from '@/types/resource';
import { toast } from 'sonner';
import { AddResourceDialog } from '@/components/resources/dialogs/AddResourceDialog';
import { EditResourceDialog } from '@/components/resources/dialogs/EditResourceDialog';

// Enhanced error fallback component
const ErrorFallback = ({ error, resetErrorBoundary }: { error: Error; resetErrorBoundary: () => void }) => {
  console.error('ResourcesBoardTestPage Error:', error);
  
  return (
    <div className="container mx-auto p-4 md:p-6">
      <Alert variant="destructive">
        <AlertTitle>Resources Board Test Page Error</AlertTitle>
        <AlertDescription className="mt-2 space-y-2">
          <p><strong>Error:</strong> {error.message}</p>
          <p><strong>Location:</strong> Resources board test page failed to load</p>
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

const ResourcesBoardTestPageContent = () => {
  // Dialog states
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingResource, setEditingResource] = useState<Resource | null>(null);

  // Minimal filters for testing - board will handle its own categorization
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
        <title>Resources Board Test - Study Helper</title>
        <meta name="description" content="Testing board-style resources layout" />
        <meta name="robots" content="noindex,nofollow" />
      </Helmet>
      
      <div className="container mx-auto px-6 py-8">
        <ErrorBoundary
          FallbackComponent={ErrorFallback}
          onReset={() => {
            console.log('Resetting resources board test page error boundary');
          }}
          onError={(error, errorInfo) => {
            console.error('Resources board test page error caught by boundary:', error, errorInfo);
          }}
        >
          <div className="space-y-6">
            {/* Test Page Header */}
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <div className="flex items-center gap-3">
                  <Button variant="ghost" size="sm" asChild>
                    <Link to="/resources">
                      <ArrowLeft className="h-4 w-4" />
                      Back to Resources
                    </Link>
                  </Button>
                </div>
                <h1 className="text-2xl font-bold">Resources Board Test</h1>
                <p className="text-muted-foreground">Testing Papaly-style board layout for resources</p>
              </div>
              <Button onClick={handleAddResource}>
                Add Resource
              </Button>
            </div>

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

const ResourcesBoardTestPage = () => {
  return <ResourcesBoardTestPageContent />;
};

export default ResourcesBoardTestPage;