
import React from "react";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
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
                <FileText className="h-3 w-3" />
                Notes
              </BreadcrumbPage>
            </BreadcrumbItem>
          ) : (
            <>
              <BreadcrumbItem>
                <BreadcrumbLink href="/notes" className="flex items-center gap-1">
                  <FileText className="h-3 w-3" />
                  Notes
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>
                  {activeSubject ? activeSubject.name : 'Search Results'}
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
