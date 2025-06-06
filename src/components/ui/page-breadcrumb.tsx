
import React from "react";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Home, Shield } from "lucide-react";
import { useLocation } from "react-router-dom";

interface PageBreadcrumbProps {
  pageName: string;
  pageIcon?: React.ReactNode;
}

export const PageBreadcrumb = ({ pageName, pageIcon }: PageBreadcrumbProps) => {
  const location = useLocation();
  const isAdminPage = location.pathname.startsWith('/admin');

  return (
    <div className="mb-4">
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="/dashboard" className="flex items-center gap-1">
              <Home className="h-3 w-3" />
              Dashboard
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          {isAdminPage ? (
            <>
              <BreadcrumbItem>
                <BreadcrumbLink href="/admin" className="flex items-center gap-1">
                  <Shield className="h-3 w-3" />
                  Administration
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage className="flex items-center gap-1">
                  {pageIcon}
                  {pageName}
                </BreadcrumbPage>
              </BreadcrumbItem>
            </>
          ) : (
            <BreadcrumbItem>
              <BreadcrumbPage className="flex items-center gap-1">
                {pageIcon}
                {pageName}
              </BreadcrumbPage>
            </BreadcrumbItem>
          )}
        </BreadcrumbList>
      </Breadcrumb>
    </div>
  );
};
