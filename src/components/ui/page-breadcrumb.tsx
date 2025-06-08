
import { OptimizedBreadcrumb, OptimizedBreadcrumbItem, OptimizedBreadcrumbLink, OptimizedBreadcrumbList, OptimizedBreadcrumbPage, OptimizedBreadcrumbSeparator } from "@/components/ui/optimized-breadcrumb";

interface PageBreadcrumbProps {
  pageName: string;
  pageIcon?: React.ReactNode;
  parentName?: string;
  parentPath?: string;
}

export const PageBreadcrumb = ({ 
  pageName, 
  pageIcon, 
  parentName = "Dashboard", 
  parentPath = "/dashboard" 
}: PageBreadcrumbProps) => {
  return (
    <OptimizedBreadcrumb>
      <OptimizedBreadcrumbList>
        <OptimizedBreadcrumbItem>
          <OptimizedBreadcrumbLink to={parentPath}>
            {parentName}
          </OptimizedBreadcrumbLink>
        </OptimizedBreadcrumbItem>
        <OptimizedBreadcrumbSeparator />
        <OptimizedBreadcrumbItem>
          <OptimizedBreadcrumbPage className="flex items-center gap-2">
            {pageIcon}
            {pageName}
          </OptimizedBreadcrumbPage>
        </OptimizedBreadcrumbItem>
      </OptimizedBreadcrumbList>
    </OptimizedBreadcrumb>
  );
};
