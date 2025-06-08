
import React from "react";
import {
  OptimizedBreadcrumb,
  OptimizedBreadcrumbItem,
  OptimizedBreadcrumbLink,
  OptimizedBreadcrumbList,
  OptimizedBreadcrumbPage,
  OptimizedBreadcrumbSeparator,
} from "@/components/ui/optimized-breadcrumb";
import { Home, FileText, BookOpen } from "lucide-react";
import { Note } from "@/types/note";

interface StudyBreadcrumbProps {
  note: Note;
}

export const StudyBreadcrumb = ({ note }: StudyBreadcrumbProps) => {
  return (
    <div className="mb-4">
      <OptimizedBreadcrumb>
        <OptimizedBreadcrumbList>
          <OptimizedBreadcrumbItem>
            <OptimizedBreadcrumbLink to="/dashboard" className="flex items-center gap-1">
              <Home className="h-3 w-3" />
              Dashboard
            </OptimizedBreadcrumbLink>
          </OptimizedBreadcrumbItem>
          <OptimizedBreadcrumbSeparator />
          <OptimizedBreadcrumbItem>
            <OptimizedBreadcrumbLink to="/notes" className="flex items-center gap-1">
              <FileText className="h-3 w-3" />
              Notes
            </OptimizedBreadcrumbLink>
          </OptimizedBreadcrumbItem>
          <OptimizedBreadcrumbSeparator />
          <OptimizedBreadcrumbItem>
            <OptimizedBreadcrumbPage className="flex items-center gap-1">
              <BookOpen className="h-3 w-3" />
              {note.title.length > 30 ? `${note.title.substring(0, 30)}...` : note.title}
            </OptimizedBreadcrumbPage>
          </OptimizedBreadcrumbItem>
        </OptimizedBreadcrumbList>
      </OptimizedBreadcrumb>
    </div>
  );
};
