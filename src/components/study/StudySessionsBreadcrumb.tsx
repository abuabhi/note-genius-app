
import React from "react";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Home, Calendar } from "lucide-react";

interface StudySessionsBreadcrumbProps {
  activeFilter?: string;
  sessionCount?: number;
}

export const StudySessionsBreadcrumb = ({ activeFilter, sessionCount }: StudySessionsBreadcrumbProps) => {
  const hasFilters = activeFilter && activeFilter !== "all";
  const resultsText = sessionCount !== undefined ? `${sessionCount} sessions` : '';

  return (
    <div className="flex items-center justify-between mb-2">
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="/dashboard" className="flex items-center gap-1">
              <Home className="h-3 w-3" />
              Dashboard
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          
          {!hasFilters ? (
            <BreadcrumbItem>
              <BreadcrumbPage className="flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                Study Sessions
              </BreadcrumbPage>
            </BreadcrumbItem>
          ) : (
            <>
              <BreadcrumbItem>
                <BreadcrumbLink href="/study-sessions" className="flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  Study Sessions
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>
                  {activeFilter === 'recent' ? 'Recent Sessions' : 'Archived Sessions'}
                </BreadcrumbPage>
              </BreadcrumbItem>
            </>
          )}
        </BreadcrumbList>
      </Breadcrumb>
      
      {resultsText && (
        <span className="text-sm text-muted-foreground">
          {resultsText}
        </span>
      )}
    </div>
  );
};
