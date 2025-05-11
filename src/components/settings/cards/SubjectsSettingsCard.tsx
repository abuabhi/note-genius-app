
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { Trash2 } from "lucide-react";
import { useUserSubjects } from "@/hooks/useUserSubjects";
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

export const SubjectsSettingsCard = () => {
  const { subjects, addSubject, removeSubject, isLoading } = useUserSubjects();
  const [newSubjectName, setNewSubjectName] = useState("");
  const [isAdding, setIsAdding] = useState(false);
  const [subjectToDelete, setSubjectToDelete] = useState<string | null>(null);

  const handleAddSubject = async () => {
    if (!newSubjectName.trim()) return;
    
    setIsAdding(true);
    try {
      const success = await addSubject(newSubjectName);
      if (success) {
        setNewSubjectName("");
        toast.success("Subject added successfully");
      } else {
        toast.error("Failed to add subject");
      }
    } finally {
      setIsAdding(false);
    }
  };

  const confirmDeleteSubject = async () => {
    if (!subjectToDelete) return;
    
    try {
      const success = await removeSubject(subjectToDelete);
      if (success) {
        toast.success("Subject removed successfully");
      } else {
        toast.error("Failed to remove subject");
      }
    } finally {
      setSubjectToDelete(null);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Subject Management</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Add New Subject */}
          <div className="space-y-2">
            <h3 className="text-sm font-medium">Add New Subject</h3>
            <div className="flex space-x-2">
              <Input
                value={newSubjectName}
                onChange={(e) => setNewSubjectName(e.target.value)}
                placeholder="Enter subject name"
                className="flex-1"
              />
              <Button 
                onClick={handleAddSubject} 
                disabled={!newSubjectName.trim() || isAdding}
              >
                {isAdding ? "Adding..." : "Add"}
              </Button>
            </div>
          </div>

          {/* Subject List */}
          <div className="space-y-2">
            <h3 className="text-sm font-medium">Your Subjects</h3>
            {isLoading ? (
              <p className="text-sm text-muted-foreground">Loading subjects...</p>
            ) : subjects.length === 0 ? (
              <p className="text-sm text-muted-foreground">No subjects added yet.</p>
            ) : (
              <div className="space-y-2">
                {subjects.map((subject) => (
                  <div 
                    key={subject.id} 
                    className="flex items-center justify-between p-2 border rounded-md"
                  >
                    <span className="text-sm">{subject.name}</span>
                    <AlertDialog open={subjectToDelete === subject.id} onOpenChange={(isOpen) => {
                      if (!isOpen) setSubjectToDelete(null);
                    }}>
                      <AlertDialogTrigger asChild>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          className="text-red-500 hover:bg-red-50 hover:text-red-600"
                          onClick={() => setSubjectToDelete(subject.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete Subject</AlertDialogTitle>
                          <AlertDialogDescription>
                            Are you sure you want to delete "{subject.name}"? 
                            This may affect notes associated with this subject.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction 
                            className="bg-red-500 hover:bg-red-600"
                            onClick={confirmDeleteSubject}
                          >
                            Delete
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
