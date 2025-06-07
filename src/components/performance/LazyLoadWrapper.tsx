
import { Suspense, ReactNode } from 'react';
import { Skeleton } from '@/components/ui/skeleton';

interface LazyLoadWrapperProps {
  children: ReactNode;
  fallback?: ReactNode;
  className?: string;
}

const DefaultSkeleton = () => (
  <div className="space-y-4">
    <Skeleton className="h-8 w-full" />
    <div className="grid gap-4">
      <Skeleton className="h-32 w-full" />
      <Skeleton className="h-32 w-full" />
      <Skeleton className="h-32 w-full" />
    </div>
  </div>
);

export const LazyLoadWrapper = ({ 
  children, 
  fallback = <DefaultSkeleton />, 
  className = "" 
}: LazyLoadWrapperProps) => {
  return (
    <div className={className}>
      <Suspense fallback={fallback}>
        {children}
      </Suspense>
    </div>
  );
};
