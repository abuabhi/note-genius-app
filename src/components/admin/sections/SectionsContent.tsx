
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus } from "lucide-react";
import { Section } from "@/types/admin";
import { useSections } from "@/hooks/useSections";
import { useFlashcards } from "@/contexts/FlashcardContext";
import SectionsTable from "./SectionsTable";
import SectionFormDialog from "./SectionFormDialog";
import DeleteSectionDialog from "./DeleteSectionDialog";
import SectionsFilter from "./SectionsFilter";

const SectionsContent = () => {
  const { sections, isLoading, createSection, updateSection, deleteSection } = useSections();
  const { academicSubjects, fetchAcademicSubjects } = useFlashcards();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingSection, setEditingSection] = useState<Section | null>(null);
  const [name, setName] = useState("");
  const [subjectId, setSubjectId] = useState("");
  const [description, setDescription] = useState("");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [sectionToDelete, setSectionToDelete] = useState<Section | null>(null);
  const [filterSubject, setFilterSubject] = useState("");

  useEffect(() => {
    fetchAcademicSubjects();
  }, [fetchAcademicSubjects]);

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
      setSubjectId(section.academic_subject_id);
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
      academic_subject_id: subjectId,
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
    ? sections.filter(section => section.academic_subject_id === filterSubject)
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
          <SectionsFilter 
            filterSubject={filterSubject} 
            setFilterSubject={setFilterSubject} 
            categories={academicSubjects} 
          />
          
          <SectionsTable 
            sections={filteredSections}
            isLoading={isLoading}
            onEdit={handleOpenDialog}
            onDelete={(section) => {
              setSectionToDelete(section);
              setDeleteDialogOpen(true);
            }}
          />
        </CardContent>
      </Card>

      <SectionFormDialog 
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        editingSection={editingSection}
        name={name}
        setName={setName}
        subjectId={subjectId}
        setSubjectId={setSubjectId}
        description={description}
        setDescription={setDescription}
        onSubmit={handleSubmit}
        categories={academicSubjects}
      />

      <DeleteSectionDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        section={sectionToDelete}
        onConfirmDelete={handleConfirmDelete}
      />
    </div>
  );
};

export default SectionsContent;
