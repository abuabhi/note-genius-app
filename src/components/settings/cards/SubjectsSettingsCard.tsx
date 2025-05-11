
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useUserSubjects } from '@/hooks/useUserSubjects';
import { Badge } from "@/components/ui/badge";
import { X, Plus, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

export const SubjectsSettingsCard = () => {
  const { subjects, isLoading, addSubject, removeSubject } = useUserSubjects();
  const [newSubject, setNewSubject] = useState('');
  const [isAdding, setIsAdding] = useState(false);

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

  const handleRemoveSubject = async (id: string, name: string) => {
    try {
      const success = await removeSubject(id);
      if (success) {
        toast.success(`Removed subject: ${name}`);
      } else {
        toast.error('Failed to remove subject');
      }
    } catch (error) {
      console.error('Error removing subject:', error);
      toast.error('Something went wrong removing this subject');
    }
  };

  return (
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
                  className="ml-1 text-muted-foreground hover:text-destructive focus:outline-none" 
                  onClick={() => handleRemoveSubject(subject.id, subject.name)}
                >
                  <X className="h-3 w-3" />
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
  );
};

export default SubjectsSettingsCard;
