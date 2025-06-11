
import React from 'react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Loader2, AlertTriangle, FileText, BookOpen, Target, Calendar, Activity } from 'lucide-react';

interface SubjectDependencies {
  notes: number;
  flashcardSets: number;
  studyGoals: number;
  events: number;
  studySessions: number;
}

interface SubjectDeletionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  subjectName: string;
  dependencies: SubjectDependencies | null;
  isLoading: boolean;
  onConfirm: () => void;
}

export const SubjectDeletionDialog = ({
  open,
  onOpenChange,
  subjectName,
  dependencies,
  isLoading,
  onConfirm
}: SubjectDeletionDialogProps) => {
  const hasDependencies = dependencies && Object.values(dependencies).some(count => count > 0);

  const dependencyItems = [
    { key: 'notes', label: 'Notes', icon: FileText, count: dependencies?.notes || 0 },
    { key: 'flashcardSets', label: 'Flashcard Sets', icon: BookOpen, count: dependencies?.flashcardSets || 0 },
    { key: 'studyGoals', label: 'Study Goals', icon: Target, count: dependencies?.studyGoals || 0 },
    { key: 'events', label: 'Events', icon: Calendar, count: dependencies?.events || 0 },
    { key: 'studySessions', label: 'Study Sessions', icon: Activity, count: dependencies?.studySessions || 0 }
  ];

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="max-w-md">
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-destructive" />
            Delete Subject
          </AlertDialogTitle>
          <AlertDialogDescription className="space-y-4">
            {isLoading ? (
              <div className="flex items-center justify-center py-4">
                <Loader2 className="h-6 w-6 animate-spin" />
                <span className="ml-2">Checking for associated content...</span>
              </div>
            ) : (
              <>
                <p>
                  Are you sure you want to delete the subject <strong>"{subjectName}"</strong>?
                </p>
                
                {hasDependencies ? (
                  <>
                    <div className="bg-yellow-50 border border-yellow-200 rounded-md p-3">
                      <p className="text-sm text-yellow-800 font-medium mb-2">
                        Warning: This subject is currently used by:
                      </p>
                      <div className="space-y-2">
                        {dependencyItems
                          .filter(item => item.count > 0)
                          .map(item => {
                            const Icon = item.icon;
                            return (
                              <div key={item.key} className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                  <Icon className="h-4 w-4 text-yellow-600" />
                                  <span className="text-sm text-yellow-800">{item.label}</span>
                                </div>
                                <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
                                  {item.count}
                                </Badge>
                              </div>
                            );
                          })}
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Deleting this subject will not affect your existing content, but the subject 
                      will no longer be available for new items.
                    </p>
                  </>
                ) : (
                  <div className="bg-green-50 border border-green-200 rounded-md p-3">
                    <p className="text-sm text-green-800">
                      This subject is not currently used by any content and can be safely deleted.
                    </p>
                  </div>
                )}
              </>
            )}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isLoading}>Cancel</AlertDialogCancel>
          <AlertDialogAction 
            onClick={onConfirm}
            disabled={isLoading}
            className="bg-destructive hover:bg-destructive/90"
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                Deleting...
              </>
            ) : (
              'Delete Subject'
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
