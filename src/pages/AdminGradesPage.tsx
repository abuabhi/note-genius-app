
import { useState } from "react";
import Layout from "@/components/layout/Layout";
import { useRequireAuth, UserTier } from "@/hooks/useRequireAuth";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ShieldAlert, Plus, Pencil, Trash } from "lucide-react";
import { useGrades } from "@/hooks/useGrades";
import { Grade } from "@/types/admin";

const AdminGradesPage = () => {
  const { userProfile, loading } = useRequireAuth();
  
  // Check if user is admin (DEAN tier)
  if (loading) {
    return (
      <Layout>
        <div className="container mx-auto p-6">
          <div className="flex justify-center items-center h-64">
            <span>Loading...</span>
          </div>
        </div>
      </Layout>
    );
  }
  
  if (userProfile?.user_tier !== UserTier.DEAN) {
    return (
      <Layout>
        <div className="container mx-auto p-6">
          <Alert variant="destructive">
            <ShieldAlert className="h-4 w-4" />
            <AlertDescription>
              You don't have permission to access this page.
            </AlertDescription>
          </Alert>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <GradesContent />
    </Layout>
  );
};

const GradesContent = () => {
  const { grades, isLoading, createGrade, updateGrade, deleteGrade } = useGrades();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingGrade, setEditingGrade] = useState<Grade | null>(null);
  const [name, setName] = useState("");
  const [level, setLevel] = useState("");
  const [description, setDescription] = useState("");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [gradeToDelete, setGradeToDelete] = useState<Grade | null>(null);

  const resetForm = () => {
    setName("");
    setLevel("");
    setDescription("");
    setEditingGrade(null);
  };

  const handleOpenDialog = (grade?: Grade) => {
    if (grade) {
      setEditingGrade(grade);
      setName(grade.name);
      setLevel(grade.level.toString());
      setDescription(grade.description || "");
    } else {
      resetForm();
    }
    setDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const gradeData = {
      name,
      level: parseInt(level),
      description: description || null,
    };

    if (editingGrade) {
      await updateGrade.mutateAsync({
        id: editingGrade.id,
        ...gradeData,
        created_at: editingGrade.created_at,
        updated_at: editingGrade.updated_at
      });
    } else {
      await createGrade.mutateAsync(gradeData);
    }

    setDialogOpen(false);
    resetForm();
  };

  const handleConfirmDelete = async () => {
    if (gradeToDelete) {
      await deleteGrade.mutateAsync(gradeToDelete.id);
      setDeleteDialogOpen(false);
      setGradeToDelete(null);
    }
  };

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Manage Grades</h1>
        <Button onClick={() => handleOpenDialog()}>
          <Plus className="mr-2 h-4 w-4" />
          Add Grade
        </Button>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle>Grades</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center p-4">Loading grades...</div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Level</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {grades.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center">
                        No grades found
                      </TableCell>
                    </TableRow>
                  ) : (
                    grades.map((grade) => (
                      <TableRow key={grade.id}>
                        <TableCell className="font-medium">{grade.name}</TableCell>
                        <TableCell>{grade.level}</TableCell>
                        <TableCell>{grade.description || "-"}</TableCell>
                        <TableCell className="text-right space-x-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleOpenDialog(grade)}
                          >
                            <Pencil className="h-4 w-4" />
                            <span className="sr-only">Edit</span>
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setGradeToDelete(grade);
                              setDeleteDialogOpen(true);
                            }}
                          >
                            <Trash className="h-4 w-4" />
                            <span className="sr-only">Delete</span>
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Create/Edit Grade Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingGrade ? "Edit Grade" : "Add New Grade"}
            </DialogTitle>
            <DialogDescription>
              {editingGrade
                ? "Update the grade details"
                : "Enter the details for the new grade"}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="name">Grade Name</Label>
                <Input
                  id="name"
                  placeholder="e.g., Grade 1"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="level">Level</Label>
                <Input
                  id="level"
                  type="number"
                  min="1"
                  placeholder="e.g., 1"
                  value={level}
                  onChange={(e) => setLevel(e.target.value)}
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="description">Description (Optional)</Label>
                <Input
                  id="description"
                  placeholder="e.g., First grade level"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="submit">Save</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Delete</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete the grade "{gradeToDelete?.name}"? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleConfirmDelete}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminGradesPage;
