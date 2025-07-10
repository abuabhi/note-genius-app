
import React from 'react';
import { OptimizedBreadcrumb, OptimizedBreadcrumbItem, OptimizedBreadcrumbLink, OptimizedBreadcrumbList, OptimizedBreadcrumbPage, OptimizedBreadcrumbSeparator } from "@/components/ui/optimized-breadcrumb";

interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface StandardPageHeaderProps {
  title: string;
  description?: string;
  icon?: React.ReactNode;
  breadcrumbs?: BreadcrumbItem[];
  actions?: React.ReactNode;
  children?: React.ReactNode;
  className?: string;
}

export const StandardPageHeader = ({
  title,
  description,
  icon,
  breadcrumbs = [],
  actions,
  children,
  className = ""
}: StandardPageHeaderProps) => {
  const defaultBreadcrumbs = [
    { label: "Dashboard", href: "/dashboard" },
    ...breadcrumbs
  ];

  return (
    <div className={`bg-white/60 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-40 ${className}`}>
      <div className="container mx-auto px-6 py-4 space-y-4">
        {/* Breadcrumbs */}
        <OptimizedBreadcrumb>
          <OptimizedBreadcrumbList>
            {defaultBreadcrumbs.map((item, index) => {
              const isLast = index === defaultBreadcrumbs.length - 1;
              return (
                <React.Fragment key={index}>
                  <OptimizedBreadcrumbItem>
                    {item.href ? (
                      <OptimizedBreadcrumbLink to={item.href}>
                        {item.label}
                      </OptimizedBreadcrumbLink>
                    ) : (
                      <OptimizedBreadcrumbPage>
                        {item.label}
                      </OptimizedBreadcrumbPage>
                    )}
                  </OptimizedBreadcrumbItem>
                  {!isLast && <OptimizedBreadcrumbSeparator />}
                </React.Fragment>
              );
            })}
          </OptimizedBreadcrumbList>
        </OptimizedBreadcrumb>

        {/* Main Header Content */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex items-center gap-3">
            {icon && (
              <div className="p-2 bg-gradient-to-br from-mint-500 to-blue-500 rounded-xl">
                {icon}
              </div>
            )}
            <div>
              <h1 className="text-3xl font-bold text-mint-900">{title}</h1>
              {description && (
                <p className="text-gray-600 mt-1">{description}</p>
              )}
            </div>
          </div>
          
          {actions && (
            <div className="flex items-center gap-3 flex-shrink-0">
              {actions}
            </div>
          )}
        </div>

        {/* Additional Content */}
        {children && (
          <div className="pt-2">
            {children}
          </div>
        )}
      </div>
    </div>
  );
};
