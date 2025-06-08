
import React from 'react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuCheckboxItem,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { Filter, Archive, ArchiveRestore } from 'lucide-react';
import { useOptimizedNotes } from '@/contexts/OptimizedNotesContext';
import { useUserSubjects } from '@/hooks/useUserSubjects';

export const FilterMenu = () => {
  const { 
    showArchived, 
    setShowArchived, 
    selectedSubject, 
    setSelectedSubject 
  } = useOptimizedNotes();
  
  const { subjects, isLoading: subjectsLoading } = useUserSubjects();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <Filter className="h-4 w-4" />
          Filter
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-56">
        <DropdownMenuCheckboxItem
          checked={showArchived}
          onCheckedChange={setShowArchived}
          className="flex items-center gap-2"
        >
          {showArchived ? (
            <ArchiveRestore className="h-4 w-4" />
          ) : (
            <Archive className="h-4 w-4" />
          )}
          {showArchived ? 'Hide Archived' : 'Show Archived'}
        </DropdownMenuCheckboxItem>
        
        <DropdownMenuSeparator />
        
        <DropdownMenuItem
          onClick={() => setSelectedSubject('all')}
          className={selectedSubject === 'all' ? 'bg-accent' : ''}
        >
          All Subjects
        </DropdownMenuItem>
        
        {!subjectsLoading && subjects.map((subject) => (
          <DropdownMenuItem
            key={subject.id}
            onClick={() => setSelectedSubject(subject.name)}
            className={selectedSubject === subject.name ? 'bg-accent' : ''}
          >
            {subject.name}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
