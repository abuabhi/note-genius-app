import { ErrorBoundary } from 'react-error-boundary';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Helmet } from 'react-helmet';

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
            <div className="text-center py-12">
              <h1 className="text-3xl font-bold text-primary mb-4">Resources</h1>
              <p className="text-muted-foreground text-lg">
                Save and organize your study resources
              </p>
              <p className="text-muted-foreground mt-2">
                Coming soon - resource management functionality
              </p>
            </div>
          </div>
        </ErrorBoundary>
      </div>
    </div>
  );
};

const ResourcesPage = () => {
  return <ResourcesPageContent />;
};

export default ResourcesPage;