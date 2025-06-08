
import React from "react";
import {
  OptimizedBreadcrumb,
  OptimizedBreadcrumbItem,
  OptimizedBreadcrumbLink,
  OptimizedBreadcrumbList,
  OptimizedBreadcrumbPage,
  OptimizedBreadcrumbSeparator,
} from "@/components/ui/optimized-breadcrumb";
import { Home, FileText } from "lucide-react";
import { useUserSubjects } from "@/hooks/useUserSubjects";
import { useNotes } from "@/contexts/NoteContext";

interface NotesPageBreadcrumbProps {
  activeSubjectId?: string | null;
}

export const NotesPageBreadcrumb = ({ activeSubjectId }: NotesPageBreadcrumbProps) => {
  const { subjects } = useUserSubjects();
  const { searchTerm, filteredNotes } = useNotes();
  
  const activeSubject = activeSubjectId 
    ? subjects.find(s => s.id === activeSubjectId)
    : null;

  const hasFilters = searchTerm || activeSubjectId;
  const resultsText = hasFilters ? `${filteredNotes.length} results` : '';

  return (
    <div className="flex items-center justify-between mb-2">
      <OptimizedBreadcrumb>
        <OptimizedBreadcrumbList>
          <OptimizedBreadcrumbItem>
            <OptimizedBreadcrumbLink to="/dashboard" className="flex items-center gap-1">
              <Home className="h-3 w-3" />
              Dashboard
            </OptimizedBreadcrumbLink>
          </OptimizedBreadcrumbItem>
          <OptimizedBreadcrumbSeparator />
          
          {!hasFilters ? (
            <OptimizedBreadcrumbItem>
              <OptimizedBreadcrumbPage className="flex items-center gap-1">
                <FileText className="h-3 w-3" />
                Notes
              </OptimizedBreadcrumbPage>
            </OptimizedBreadcrumbItem>
          ) : (
            <>
              <OptimizedBreadcrumbItem>
                <OptimizedBreadcrumbLink to="/notes" className="flex items-center gap-1">
                  <FileText className="h-3 w-3" />
                  Notes
                </OptimizedBreadcrumbLink>
              </OptimizedBreadcrumbItem>
              <OptimizedBreadcrumbSeparator />
              <OptimizedBreadcrumbItem>
                <OptimizedBreadcrumbPage>
                  {activeSubject ? activeSubject.name : 'Search Results'}
                </OptimizedBreadcrumbPage>
              </OptimizedBreadcrumbItem>
            </>
          )}
        </OptimizedBreadcrumbList>
      </OptimizedBreadcrumb>
      
      {resultsText && (
        <span className="text-sm text-muted-foreground">
          {resultsText}
        </span>
      )}
    </div>
  );
};
