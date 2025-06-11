
import React, { useState } from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { FilterOption } from "./FilterOption";
import { useUserSubjects } from "@/hooks/useUserSubjects";
import { useSubjectDeletion } from "@/hooks/useSubjectDeletion";
import { SubjectDeletionDialog } from "@/components/settings/cards/SubjectDeletionDialog";
import { X } from 'lucide-react';

interface CategoryFilterProps {
  category?: string;
  availableCategories: string[];
  onCategoryChange: (category: string | undefined) => void;
}

export const CategoryFilter = ({
  category,
  availableCategories,
  onCategoryChange
}: CategoryFilterProps) => {
  const { subjects } = useUserSubjects();
  const { checkDependencies, deleteSubject, isChecking, isDeleting } = useSubjectDeletion();
  const [deletionDialog, setDeletionDialog] = useState<{
    open: boolean;
    subjectId: string;
    subjectName: string;
    dependencies: any;
  }>({
    open: false,
    subjectId: '',
    subjectName: '',
    dependencies: null
  });
  
  // Use only user subjects, ignore availableCategories (which are note titles)
  const userSubjects = subjects || [];

  const handleDeleteClick = async (e: React.MouseEvent, subjectId: string, subjectName: string) => {
    e.stopPropagation();
    try {
      const dependencies = await checkDependencies(subjectName);
      setDeletionDialog({
        open: true,
        subjectId,
        subjectName,
        dependencies
      });
    } catch (error) {
      console.error('Error checking dependencies:', error);
    }
  };

  const handleConfirmDelete = async () => {
    try {
      const success = await deleteSubject(deletionDialog.subjectId);
      if (success) {
        // Reset filter if the deleted subject was selected
        if (category === deletionDialog.subjectName) {
          onCategoryChange(undefined);
        }
        setDeletionDialog({ open: false, subjectId: '', subjectName: '', dependencies: null });
      }
    } catch (error) {
      console.error('Error deleting subject:', error);
    }
  };
  
  return (
    <>
      <FilterOption label="Subject">
        <Select
          value={category || "_any"}
          onValueChange={(value) => 
            onCategoryChange(value === "_any" ? undefined : value)
          }
        >
          <SelectTrigger id="category" className="border-mint-200 focus:ring-mint-400">
            <SelectValue placeholder="Any subject" />
          </SelectTrigger>
          <SelectContent className="bg-white">
            <SelectItem value="_any">Any subject</SelectItem>
            
            {userSubjects.map(subject => (
              <SelectItem key={subject.id} value={subject.name} className="group">
                <div className="flex items-center justify-between w-full">
                  <span>{subject.name}</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="ml-2 h-4 w-4 p-0 opacity-0 group-hover:opacity-100 hover:bg-destructive hover:text-destructive-foreground"
                    onClick={(e) => handleDeleteClick(e, subject.id, subject.name)}
                    disabled={isChecking || isDeleting}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </FilterOption>

      <SubjectDeletionDialog
        open={deletionDialog.open}
        onOpenChange={(open) => setDeletionDialog(prev => ({ ...prev, open }))}
        subjectName={deletionDialog.subjectName}
        dependencies={deletionDialog.dependencies}
        isLoading={isChecking || isDeleting}
        onConfirm={handleConfirmDelete}
      />
    </>
  );
};
