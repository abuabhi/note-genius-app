
import { useState, useEffect } from "react";
import { useFlashcards } from "@/contexts/FlashcardContext";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { UserSubject } from "@/types/flashcard";
import { supabase } from "@/integrations/supabase/client";

export function AdminSubjectList() {
  const { userSubjects, setUserSubjects, fetchUserSubjects } = useFlashcards();
  const [loading, setLoading] = useState(true);
  const [newSubject, setNewSubject] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const loadUserSubjects = async () => {
      setLoading(true);
      try {
        await fetchUserSubjects();
      } catch (error) {
        console.error("Error loading user subjects:", error);
        toast({
          title: "Error",
          description: "Failed to load user subjects",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };
    
    loadUserSubjects();
  }, [fetchUserSubjects, toast]);

  const handleAddSubject = async () => {
    if (!newSubject.trim()) {
      toast({
        title: "Error",
        description: "Subject name cannot be empty",
        variant: "destructive"
      });
      return;
    }
    
    try {
      const { data, error } = await supabase
        .from('user_subjects')
        .insert({ name: newSubject.trim(), user_id: (await supabase.auth.getUser()).data.user?.id })
        .select()
        .single();
        
      if (error) throw error;
      
      toast({
        title: "Success",
        description: "Subject added successfully",
      });
      
      setNewSubject("");
      setDialogOpen(false);
      
      // Refresh user subjects
      fetchUserSubjects();
    } catch (error) {
      console.error("Error adding subject:", error);
      toast({
        title: "Error",
        description: "Failed to add academic subject",
        variant: "destructive"
      });
    }
  };

  if (loading) {
    return <div className="text-center p-4">Loading subjects...</div>;
  }

  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex justify-between mb-4">
          <h2 className="text-xl font-semibold">User Subjects</h2>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button>Add Subject</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add Academic Subject</DialogTitle>
                <DialogDescription>
                  Enter the name of the new academic subject.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="subject-name">Subject Name</Label>
                  <Input
                    id="subject-name"
                    value={newSubject}
                    onChange={(e) => setNewSubject(e.target.value)}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button onClick={handleAddSubject}>Add Subject</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Level</TableHead>
                <TableHead>Parent</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {userSubjects.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center">
                    No subjects found
                  </TableCell>
                </TableRow>
              ) : (
                userSubjects.map((subject) => (
                  <SubjectRow key={subject.id} subject={subject} />
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}

interface SubjectRowProps {
  subject: UserSubject;
}

function SubjectRow({ subject }: SubjectRowProps) {
  const renderSubjects = (subcategories?: UserSubject[]) => {
    if (!subcategories || subcategories.length === 0) {
      return null;
    }

    return (
      <>
        {subcategories.map((subsubject) => (
          <SubjectRow key={subsubject.id} subject={subsubject} />
        ))}
      </>
    );
  };

  return (
    <>
      <TableRow>
        <TableCell>{subject.name}</TableCell>
        <TableCell>N/A</TableCell>
        <TableCell>N/A</TableCell>
        <TableCell>
          <Button variant="outline" size="sm">
            Edit
          </Button>
        </TableCell>
      </TableRow>
      
    </>
  );
}
