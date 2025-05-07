
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
import { SubjectCategory } from "@/types/flashcard";
import { supabase } from "@/integrations/supabase/client";

export function AdminSubjectList() {
  const { fetchCategories, categories } = useFlashcards();
  const [loading, setLoading] = useState(true);
  const [newSubject, setNewSubject] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const loadCategories = async () => {
      setLoading(true);
      try {
        await fetchCategories();
      } catch (error) {
        console.error("Error loading categories:", error);
        toast({
          title: "Error",
          description: "Failed to load subject categories",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };
    
    loadCategories();
  }, [fetchCategories, toast]);

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
        .from('subject_categories')
        .insert({ name: newSubject.trim() })
        .select()
        .single();
        
      if (error) throw error;
      
      toast({
        title: "Success",
        description: "Subject category added successfully",
      });
      
      setNewSubject("");
      setDialogOpen(false);
      fetchCategories();
    } catch (error) {
      console.error("Error adding subject:", error);
      toast({
        title: "Error",
        description: "Failed to add subject category",
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
          <h2 className="text-xl font-semibold">Subject Categories</h2>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button>Add Subject</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add Subject Category</DialogTitle>
                <DialogDescription>
                  Enter the name of the new subject category.
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
              {categories.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center">
                    No subject categories found
                  </TableCell>
                </TableRow>
              ) : (
                categories.map((category) => (
                  <CategoryRow key={category.id} category={category} />
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}

interface CategoryRowProps {
  category: SubjectCategory;
}

function CategoryRow({ category }: CategoryRowProps) {
  const renderSubcategories = (subcategories?: SubjectCategory[]) => {
    if (!subcategories || subcategories.length === 0) {
      return null;
    }

    return (
      <>
        {subcategories.map((subcat) => (
          <CategoryRow key={subcat.id} category={subcat} />
        ))}
      </>
    );
  };

  return (
    <>
      <TableRow>
        <TableCell>{category.name}</TableCell>
        <TableCell>{category.level}</TableCell>
        <TableCell>{category.parent_id || "Root"}</TableCell>
        <TableCell>
          <Button variant="outline" size="sm">
            Edit
          </Button>
        </TableCell>
      </TableRow>
      {renderSubcategories(category.subcategories)}
    </>
  );
}
