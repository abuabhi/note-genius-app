
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
import { useMemo } from 'react';

export const FilterMenu = () => {
  const { 
    showArchived, 
    setShowArchived, 
    selectedSubject, 
    setSelectedSubject,
    notes
  } = useOptimizedNotes();
  
  const { subjects, isLoading: subjectsLoading } = useUserSubjects();

  // Extract all unique subjects from notes (both from subject_id and legacy subject field)
  const allAvailableSubjects = useMemo(() => {
    const subjectSet = new Set<string>();
    
    // Add subjects from user_subjects table
    subjects.forEach(subject => {
      subjectSet.add(subject.name);
    });
    
    // Add legacy subjects from notes.subject field
    notes.forEach(note => {
      if (note.category && note.category !== 'Uncategorized' && note.category.trim() !== '') {
        subjectSet.add(note.category);
      }
      if (note.subject && note.subject !== 'Uncategorized' && note.subject.trim() !== '') {
        subjectSet.add(note.subject);
      }
    });
    
    return Array.from(subjectSet).sort();
  }, [subjects, notes]);

  console.log('FilterMenu - Available subjects:', allAvailableSubjects);
  console.log('FilterMenu - Current selected subject:', selectedSubject);

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
        
        {!subjectsLoading && allAvailableSubjects.map((subject) => (
          <DropdownMenuItem
            key={subject}
            onClick={() => setSelectedSubject(subject)}
            className={selectedSubject === subject ? 'bg-accent' : ''}
          >
            {subject}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
