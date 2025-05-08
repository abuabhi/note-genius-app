
import React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Pencil, Trash } from "lucide-react";
import { Section } from "@/types/admin";

interface SectionsTableProps {
  sections: Section[];
  isLoading: boolean;
  onEdit: (section: Section) => void;
  onDelete: (section: Section) => void;
}

const SectionsTable = ({
  sections,
  isLoading,
  onEdit,
  onDelete,
}: SectionsTableProps) => {
  if (isLoading) {
    return <div className="text-center p-4">Loading sections...</div>;
  }

  return (
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
          {sections.length === 0 ? (
            <TableRow>
              <TableCell colSpan={4} className="text-center">
                No sections found
              </TableCell>
            </TableRow>
          ) : (
            sections.map((section) => (
              <TableRow key={section.id}>
                <TableCell className="font-medium">{section.name}</TableCell>
                <TableCell>{section.subject?.name || "-"}</TableCell>
                <TableCell>{section.description || "-"}</TableCell>
                <TableCell className="text-right space-x-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onEdit(section)}
                  >
                    <Pencil className="h-4 w-4" />
                    <span className="sr-only">Edit</span>
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onDelete(section)}
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
  );
};

export default SectionsTable;
