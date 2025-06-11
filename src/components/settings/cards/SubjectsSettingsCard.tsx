
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useUserSubjects } from '@/hooks/useUserSubjects';
import { useSubjectDeletion } from '@/hooks/useSubjectDeletion';
import { Badge } from "@/components/ui/badge";
import { X, Plus, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { SubjectDeletionDialog } from './SubjectDeletionDialog';

export const SubjectsSettingsCard = () => {
  const { subjects, isLoading, addSubject, removeSubject } = useUserSubjects();
  const { checkDependencies, deleteSubject, isChecking, isDeleting } = useSubjectDeletion();
  const [newSubject, setNewSubject] = useState('');
  const [isAdding, setIsAdding] = useState(false);
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

  const handleAddSubject = async () => {
    if (!newSubject.trim()) return;
    
    try {
      setIsAdding(true);
      const success = await addSubject(newSubject);
      if (success) {
        setNewSubject('');
        toast.success(`Added subject: ${newSubject}`);
      } else {
        toast.error('Failed to add subject. It may already exist.');
      }
    } catch (error) {
      console.error('Error adding subject:', error);
      toast.error('Something went wrong adding your subject');
    } finally {
      setIsAdding(false);
    }
  };

  const handleDeleteClick = async (id: string, name: string) => {
    try {
      const dependencies = await checkDependencies(name);
      setDeletionDialog({
        open: true,
        subjectId: id,
        subjectName: name,
        dependencies
      });
    } catch (error) {
      console.error('Error checking dependencies:', error);
      toast.error('Failed to check subject dependencies');
    }
  };

  const handleConfirmDelete = async () => {
    try {
      const success = await deleteSubject(deletionDialog.subjectId);
      if (success) {
        setDeletionDialog({ open: false, subjectId: '', subjectName: '', dependencies: null });
      }
    } catch (error) {
      console.error('Error deleting subject:', error);
    }
  };

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Study Subjects</CardTitle>
          <CardDescription>
            Manage the subjects you study and organize your notes
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex flex-wrap gap-2">
            {isLoading ? (
              <div className="flex items-center justify-center w-full py-4">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : subjects.length > 0 ? (
              subjects.map(subject => (
                <Badge 
                  key={subject.id} 
                  variant="secondary"
                  className="flex items-center pl-3 pr-2 py-2 space-x-1"
                >
                  <span>{subject.name}</span>
                  <button 
                    className="ml-1 text-muted-foreground hover:text-destructive focus:outline-none disabled:opacity-50" 
                    onClick={() => handleDeleteClick(subject.id, subject.name)}
                    disabled={isChecking || isDeleting}
                  >
                    {isChecking ? (
                      <Loader2 className="h-3 w-3 animate-spin" />
                    ) : (
                      <X className="h-3 w-3" />
                    )}
                  </button>
                </Badge>
              ))
            ) : (
              <div className="text-sm text-muted-foreground w-full py-2">
                No subjects added yet. Add your study subjects below.
              </div>
            )}
          </div>

          <div className="flex space-x-2">
            <Input
              value={newSubject}
              onChange={(e) => setNewSubject(e.target.value)}
              placeholder="Add a new subject..."
              className="flex-1"
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleAddSubject();
                }
              }}
            />
            <Button 
              onClick={handleAddSubject} 
              disabled={!newSubject.trim() || isAdding}
            >
              {isAdding ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <><Plus className="h-4 w-4 mr-1" /> Add</>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

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

export default SubjectsSettingsCard;
