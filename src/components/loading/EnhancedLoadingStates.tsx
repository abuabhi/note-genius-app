
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Loader2, Wifi, WifiOff } from 'lucide-react';
import { Button } from '@/components/ui/button';

// Enhanced skeleton for flashcard sets list
export const FlashcardSetsListSkeleton = () => (
  <div className="space-y-4">
    {Array.from({ length: 6 }).map((_, i) => (
      <Card key={i} className="animate-pulse">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex-1 space-y-3">
              <div className="flex items-center gap-3">
                <Skeleton className="h-4 w-4 rounded" />
                <Skeleton className="h-6 w-48" />
                <Skeleton className="h-5 w-16 rounded-full" />
              </div>
              <div className="flex items-center gap-4">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-32" />
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <Skeleton className="h-2 rounded-full" style={{ width: `${Math.random() * 60 + 20}%` }} />
              </div>
            </div>
            <div className="flex gap-2 ml-6">
              <Skeleton className="h-9 w-20" />
              <Skeleton className="h-9 w-9 rounded" />
            </div>
          </div>
        </CardContent>
      </Card>
    ))}
  </div>
);

// Enhanced skeleton for dashboard cards
export const DashboardCardSkeleton = () => (
  <Card className="animate-pulse">
    <CardHeader className="pb-3">
      <div className="flex items-center justify-between">
        <Skeleton className="h-5 w-32" />
        <Skeleton className="h-5 w-5 rounded" />
      </div>
    </CardHeader>
    <CardContent>
      <div className="space-y-3">
        <Skeleton className="h-8 w-24" />
        <Skeleton className="h-4 w-40" />
      </div>
    </CardContent>
  </Card>
);

// Enhanced skeleton for notes grid
export const NotesGridSkeleton = () => (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
    {Array.from({ length: 9 }).map((_, i) => (
      <Card key={i} className="animate-pulse">
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="space-y-2 flex-1">
              <Skeleton className="h-5 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
            </div>
            <Skeleton className="h-8 w-8 rounded" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-5/6" />
            <Skeleton className="h-4 w-4/6" />
            <div className="flex gap-2 mt-4">
              <Skeleton className="h-6 w-16 rounded-full" />
              <Skeleton className="h-6 w-20 rounded-full" />
            </div>
          </div>
        </CardContent>
      </Card>
    ))}
  </div>
);

// Progressive loading indicator
interface ProgressiveLoadingProps {
  stage: 'initializing' | 'loading' | 'processing' | 'finalizing';
  message?: string;
}

export const ProgressiveLoading = ({ stage, message }: ProgressiveLoadingProps) => {
  const stages = [
    { key: 'initializing', label: 'Initializing...', progress: 25 },
    { key: 'loading', label: 'Loading data...', progress: 50 },
    { key: 'processing', label: 'Processing...', progress: 75 },
    { key: 'finalizing', label: 'Finalizing...', progress: 100 }
  ];

  const currentStage = stages.find(s => s.key === stage) || stages[0];

  return (
    <div className="flex flex-col items-center justify-center py-12 space-y-4">
      <div className="relative">
        <div className="w-16 h-16 border-4 border-mint-100 rounded-full"></div>
        <div className="absolute inset-0 w-16 h-16 border-4 border-mint-500 rounded-full border-t-transparent animate-spin"></div>
      </div>
      <div className="text-center space-y-2">
        <p className="text-lg font-medium text-mint-700">
          {message || currentStage.label}
        </p>
        <div className="w-48 bg-mint-100 rounded-full h-2">
          <div 
            className="bg-mint-500 h-2 rounded-full transition-all duration-500 ease-out"
            style={{ width: `${currentStage.progress}%` }}
          />
        </div>
      </div>
    </div>
  );
};

// Network aware loading state
interface NetworkAwareLoadingProps {
  isOnline: boolean;
  isLoading: boolean;
  onRetry?: () => void;
  children: React.ReactNode;
}

export const NetworkAwareLoading = ({ 
  isOnline, 
  isLoading, 
  onRetry, 
  children 
}: NetworkAwareLoadingProps) => {
  if (!isOnline) {
    return (
      <div className="flex flex-col items-center justify-center py-12 space-y-4">
        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
          <WifiOff className="h-8 w-8 text-red-600" />
        </div>
        <div className="text-center space-y-2">
          <p className="text-lg font-medium text-red-700">No Internet Connection</p>
          <p className="text-sm text-red-600">Please check your connection and try again</p>
          {onRetry && (
            <Button onClick={onRetry} variant="outline" size="sm" className="mt-4">
              <Wifi className="h-4 w-4 mr-2" />
              Retry
            </Button>
          )}
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="flex items-center space-x-3">
          <Loader2 className="h-6 w-6 animate-spin text-mint-500" />
          <span className="text-mint-700 font-medium">Loading...</span>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};

// Timeout loading with retry
interface TimeoutLoadingProps {
  timeout?: number;
  onTimeout?: () => void;
  children: React.ReactNode;
}

export const TimeoutLoading = ({ 
  timeout = 10000, 
  onTimeout, 
  children 
}: TimeoutLoadingProps) => {
  const [hasTimedOut, setHasTimedOut] = React.useState(false);

  React.useEffect(() => {
    const timer = setTimeout(() => {
      setHasTimedOut(true);
      onTimeout?.();
    }, timeout);

    return () => clearTimeout(timer);
  }, [timeout, onTimeout]);

  if (hasTimedOut) {
    return (
      <div className="flex flex-col items-center justify-center py-12 space-y-4">
        <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center">
          <Loader2 className="h-8 w-8 text-orange-600" />
        </div>
        <div className="text-center space-y-2">
          <p className="text-lg font-medium text-orange-700">Taking longer than expected</p>
          <p className="text-sm text-orange-600">The request is still processing...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};
