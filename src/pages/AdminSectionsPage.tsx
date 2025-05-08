
import { useState, useEffect } from "react";
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
import {
  ShieldAlert,
  Plus,
  Pencil,
  Trash,
  Filter,
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useSections } from "@/hooks/useSections";
import { Section } from "@/types/admin";
import { useFlashcards } from "@/contexts/FlashcardContext";

const AdminSectionsPage = () => {
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
      <SectionsContent />
    </Layout>
  );
};

const SectionsContent = () => {
  const { sections, isLoading, createSection, updateSection, deleteSection } = useSections();
  const { categories, fetchCategories } = useFlashcards();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingSection, setEditingSection] = useState<Section | null>(null);
  const [name, setName] = useState("");
  const [subjectId, setSubjectId] = useState("");
  const [description, setDescription] = useState("");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [sectionToDelete, setSectionToDelete] = useState<Section | null>(null);
  const [filterSubject, setFilterSubject] = useState("");
  
  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  const resetForm = () => {
    setName("");
    setSubjectId("");
    setDescription("");
    setEditingSection(null);
  };

  const handleOpenDialog = (section?: Section) => {
    if (section) {
      setEditingSection(section);
      setName(section.name);
      setSubjectId(section.subject_id);
      setDescription(section.description || "");
    } else {
      resetForm();
    }
    setDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const sectionData = {
      name,
      subject_id: subjectId,
      description: description || null,
    };

    if (editingSection) {
      await updateSection.mutateAsync({
        id: editingSection.id,
        ...sectionData,
        created_at: editingSection.created_at,
        updated_at: editingSection.updated_at,
        subject: undefined // excluded from update
      });
    } else {
      await createSection.mutateAsync(sectionData);
    }

    setDialogOpen(false);
    resetForm();
  };

  const handleConfirmDelete = async () => {
    if (sectionToDelete) {
      await deleteSection.mutateAsync(sectionToDelete.id);
      setDeleteDialogOpen(false);
      setSectionToDelete(null);
    }
  };

  // Filter sections based on subject filter
  const filteredSections = filterSubject
    ? sections.filter(section => section.subject_id === filterSubject)
    : sections;

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Manage Sections</h1>
        <Button onClick={() => handleOpenDialog()}>
          <Plus className="mr-2 h-4 w-4" />
          Add Section
        </Button>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle>Sections</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="mb-4">
            <div className="flex items-center space-x-2">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <Label htmlFor="filter-subject">Filter by Subject:</Label>
              <Select
                value={filterSubject}
                onValueChange={setFilterSubject}
              >
                <SelectTrigger id="filter-subject" className="w-[200px]">
                  <SelectValue placeholder="All Subjects" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Subjects</SelectItem>
                  {categories.map((category) => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          
          {isLoading ? (
            <div className="text-center p-4">Loading sections...</div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Subject</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredSections.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center">
                        No sections found
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredSections.map((section) => (
                      <TableRow key={section.id}>
                        <TableCell className="font-medium">{section.name}</TableCell>
                        <TableCell>{section.subject?.name || "-"}</TableCell>
                        <TableCell>{section.description || "-"}</TableCell>
                        <TableCell className="text-right space-x-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleOpenDialog(section)}
                          >
                            <Pencil className="h-4 w-4" />
                            <span className="sr-only">Edit</span>
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setSectionToDelete(section);
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

      {/* Create/Edit Section Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingSection ? "Edit Section" : "Add New Section"}
            </DialogTitle>
            <DialogDescription>
              {editingSection
                ? "Update the section details"
                : "Enter the details for the new section"}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="name">Section Name</Label>
                <Input
                  id="name"
                  placeholder="e.g., Algebra"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="subject">Subject</Label>
                <Select
                  value={subjectId}
                  onValueChange={setSubjectId}
                  required
                >
                  <SelectTrigger id="subject">
                    <SelectValue placeholder="Select a subject" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category.id} value={category.id}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="description">Description (Optional)</Label>
                <Input
                  id="description"
                  placeholder="e.g., Section covering algebra concepts"
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
              Are you sure you want to delete the section "{sectionToDelete?.name}"? This action cannot be undone.
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

export default AdminSectionsPage;
