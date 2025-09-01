import { cn } from "@/lib/utils";
import { Loader2, CheckCircle } from "lucide-react";
import { Card, CardContent } from "./card";

// Progressive Loading States with smooth transitions

interface LoadingStateProps {
  className?: string;
  message?: string;
  progress?: number;
  stage?: string;
}

export const SmartLoadingState: React.FC<LoadingStateProps> = ({ 
  className, 
  message = "Loading...", 
  progress,
  stage 
}) => (
  <div className={cn("flex flex-col items-center justify-center p-8", className)}>
    <div className="relative mb-4">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
      {progress !== undefined && (
        <div className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 w-16 bg-gray-200 rounded-full h-1">
          <div 
            className="bg-primary h-1 rounded-full transition-all duration-300"
            style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
          />
        </div>
      )}
    </div>
    
    <p className="text-muted-foreground text-sm text-center">
      {message}
    </p>
    
    {stage && (
      <p className="text-xs text-muted-foreground/60 mt-1">
        {stage}
      </p>
    )}
  </div>
);

interface MultiStageLoadingProps {
  stages: Array<{
    id: string;
    label: string;
    completed?: boolean;
    active?: boolean;
  }>;
  className?: string;
}

export const MultiStageLoading: React.FC<MultiStageLoadingProps> = ({ 
  stages, 
  className 
}) => (
  <Card className={cn("w-full max-w-md", className)}>
    <CardContent className="p-6">
      <div className="space-y-3">
        {stages.map((stage, index) => (
          <div key={stage.id} className="flex items-center gap-3">
            <div className={cn(
              "w-6 h-6 rounded-full flex items-center justify-center transition-all duration-300",
              stage.completed 
                ? "bg-green-100 text-green-600" 
                : stage.active 
                ? "bg-primary/10 text-primary" 
                : "bg-gray-100 text-gray-400"
            )}>
              {stage.completed ? (
                <CheckCircle className="w-4 h-4" />
              ) : stage.active ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <span className="text-xs font-medium">{index + 1}</span>
              )}
            </div>
            
            <span className={cn(
              "text-sm transition-colors duration-300",
              stage.completed 
                ? "text-green-600 font-medium" 
                : stage.active 
                ? "text-foreground font-medium" 
                : "text-muted-foreground"
            )}>
              {stage.label}
            </span>
          </div>
        ))}
      </div>
    </CardContent>
  </Card>
);

// Skeleton loader with shimmer effect
export const ShimmerSkeleton: React.FC<{ className?: string }> = ({ className }) => (
  <div 
    className={cn(
      "animate-pulse bg-gradient-to-r from-muted via-muted/50 to-muted bg-[length:200%_100%] rounded-md",
      "animate-[shimmer_2s_ease-in-out_infinite]",
      className
    )}
  />
);

// Optimistic loading state - shows expected content structure
interface OptimisticLoadingProps {
  type: 'dashboard' | 'list' | 'form' | 'card';
  items?: number;
  className?: string;
}

export const OptimisticLoading: React.FC<OptimisticLoadingProps> = ({ 
  type, 
  items = 3, 
  className 
}) => {
  const renderSkeleton = () => {
    switch (type) {
      case 'dashboard':
        return (
          <div className="space-y-6">
            <ShimmerSkeleton className="h-32 w-full" />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {Array.from({ length: 3 }).map((_, i) => (
                <ShimmerSkeleton key={i} className="h-24" />
              ))}
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <ShimmerSkeleton className="h-64" />
              <ShimmerSkeleton className="h-64" />
            </div>
          </div>
        );
      
      case 'list':
        return (
          <div className="space-y-3">
            {Array.from({ length: items }).map((_, i) => (
              <div key={i} className="flex items-center space-x-3 p-3">
                <ShimmerSkeleton className="h-10 w-10 rounded-full" />
                <div className="flex-1 space-y-2">
                  <ShimmerSkeleton className="h-4 w-3/4" />
                  <ShimmerSkeleton className="h-3 w-1/2" />
                </div>
                <ShimmerSkeleton className="h-8 w-16" />
              </div>
            ))}
          </div>
        );
      
      case 'form':
        return (
          <div className="space-y-4">
            {Array.from({ length: items }).map((_, i) => (
              <div key={i} className="space-y-2">
                <ShimmerSkeleton className="h-4 w-1/4" />
                <ShimmerSkeleton className="h-10 w-full" />
              </div>
            ))}
            <div className="flex gap-2 pt-4">
              <ShimmerSkeleton className="h-10 w-20" />
              <ShimmerSkeleton className="h-10 w-24" />
            </div>
          </div>
        );
      
      case 'card':
        return (
          <Card>
            <CardContent className="p-6">
              <div className="space-y-3">
                <ShimmerSkeleton className="h-6 w-2/3" />
                <ShimmerSkeleton className="h-4 w-full" />
                <ShimmerSkeleton className="h-4 w-3/4" />
                <div className="flex gap-2 pt-2">
                  <ShimmerSkeleton className="h-8 w-16" />
                  <ShimmerSkeleton className="h-8 w-20" />
                </div>
              </div>
            </CardContent>
          </Card>
        );
      
      default:
        return <ShimmerSkeleton className="h-20 w-full" />;
    }
  };

  return (
    <div className={cn("animate-pulse", className)}>
      {renderSkeleton()}
    </div>
  );
};