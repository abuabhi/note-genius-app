
import React from "react";
import { useQueryClient } from "@tanstack/react-query";
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
import { useAuth } from "@/contexts/auth";
import { supabase } from "@/integrations/supabase/client";

interface StudyBreadcrumbProps {
  note: Note;
}

export const StudyBreadcrumb = ({ note }: StudyBreadcrumbProps) => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  // Prefetch notes when user hovers over the Notes breadcrumb
  const handlePrefetchNotes = () => {
    if (!user?.id) return;
    
    // Create a simplified query key that matches the one in useNotes
    const queryKey = ['notes', user.id, null, null, null, null].filter(Boolean);
    
    queryClient.prefetchQuery({
      queryKey,
      queryFn: async () => {
        const { data, error } = await supabase.rpc('filter_user_notes', {
          p_user_id: user.id,
          p_search_term: '',
          p_subject_name: 'all',
          p_show_archived: false,
          p_sort_by: 'newest',
          p_page_num: 0,
          p_page_size: 100
        });

        if (error) throw error;
        return data;
      },
      staleTime: 5000
    });
  };

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
            <OptimizedBreadcrumbLink 
              to="/notes" 
              className="flex items-center gap-1"
              onMouseEnter={handlePrefetchNotes}
            >
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
