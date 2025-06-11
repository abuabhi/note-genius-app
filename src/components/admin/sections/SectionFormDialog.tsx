
import React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Section } from "@/types/admin";
import { AcademicSubject } from "@/types/flashcard";

interface SectionFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editingSection: Section | null;
  name: string;
  setName: (name: string) => void;
  subjectId: string;
  setSubjectId: (id: string) => void;
  description: string;
  setDescription: (description: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  categories: AcademicSubject[];
}

const SectionFormDialog = ({
  open,
  onOpenChange,
  editingSection,
  name,
  setName,
  subjectId,
  setSubjectId,
  description,
  setDescription,
  onSubmit,
  categories,
}: SectionFormDialogProps) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
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
        <form onSubmit={onSubmit}>
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
                  {categories.map((academicSubject) => (
                    <SelectItem key={academicSubject.id} value={academicSubject.id}>
                      {academicSubject.name}
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
  );
};

export default SectionFormDialog;
