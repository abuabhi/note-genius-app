import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";

// Enhanced skeleton components for better loading states

export const CardSkeleton = ({ 
  className,
  showHeader = true,
  showContent = true,
  lines = 3
}: {
  className?: string;
  showHeader?: boolean;
  showContent?: boolean;
  lines?: number;
}) => (
  <div className={cn("p-6 border rounded-lg bg-card", className)}>
    {showHeader && (
      <div className="mb-4">
        <Skeleton className="h-6 w-2/3 mb-2" />
        <Skeleton className="h-4 w-1/2" />
      </div>
    )}
    {showContent && (
      <div className="space-y-2">
        {Array.from({ length: lines }).map((_, i) => (
          <Skeleton key={i} className={cn(
            "h-4",
            i === lines - 1 ? "w-3/4" : "w-full"
          )} />
        ))}
      </div>
    )}
  </div>
);

export const TableSkeleton = ({ 
  rows = 5,
  columns = 4,
  className
}: {
  rows?: number;
  columns?: number;
  className?: string;
}) => (
  <div className={cn("w-full", className)}>
    {/* Table Header */}
    <div className="flex space-x-4 mb-4 pb-2 border-b">
      {Array.from({ length: columns }).map((_, i) => (
        <Skeleton key={i} className="h-4 flex-1" />
      ))}
    </div>
    {/* Table Rows */}
    {Array.from({ length: rows }).map((_, rowIndex) => (
      <div key={rowIndex} className="flex space-x-4 mb-3">
        {Array.from({ length: columns }).map((_, colIndex) => (
          <Skeleton key={colIndex} className="h-4 flex-1" />
        ))}
      </div>
    ))}
  </div>
);

export const DashboardSkeleton = ({ className }: { className?: string }) => (
  <div className={cn("space-y-6", className)}>
    {/* Hero Section */}
    <div className="bg-gradient-to-r from-primary/10 to-secondary/10 p-6 rounded-lg">
      <Skeleton className="h-8 w-1/2 mb-2" />
      <Skeleton className="h-4 w-3/4 mb-4" />
      <div className="flex gap-2">
        <Skeleton className="h-10 w-24" />
        <Skeleton className="h-10 w-32" />
      </div>
    </div>

    {/* Stats Grid */}
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {Array.from({ length: 3 }).map((_, i) => (
        <CardSkeleton key={i} showHeader={false} lines={2} />
      ))}
    </div>

    {/* Main Content */}
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <CardSkeleton lines={5} />
      <CardSkeleton lines={4} />
    </div>
  </div>
);

export const ListSkeleton = ({ 
  items = 5,
  showAvatar = false,
  className
}: {
  items?: number;
  showAvatar?: boolean;
  className?: string;
}) => (
  <div className={cn("space-y-3", className)}>
    {Array.from({ length: items }).map((_, i) => (
      <div key={i} className="flex items-center space-x-3 p-3 border rounded">
        {showAvatar && <Skeleton className="h-10 w-10 rounded-full" />}
        <div className="flex-1 space-y-1">
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-3 w-1/2" />
        </div>
        <Skeleton className="h-8 w-16" />
      </div>
    ))}
  </div>
);

export const FormSkeleton = ({ 
  fields = 4,
  className
}: {
  fields?: number;
  className?: string;
}) => (
  <div className={cn("space-y-4", className)}>
    <Skeleton className="h-6 w-1/3 mb-6" /> {/* Title */}
    {Array.from({ length: fields }).map((_, i) => (
      <div key={i} className="space-y-2">
        <Skeleton className="h-4 w-1/4" /> {/* Label */}
        <Skeleton className="h-10 w-full" /> {/* Input */}
      </div>
    ))}
    <div className="flex gap-2 pt-4">
      <Skeleton className="h-10 w-20" />
      <Skeleton className="h-10 w-24" />
    </div>
  </div>
);