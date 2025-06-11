
import React from "react";
import { TableCell, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Edit, Trash2 } from "lucide-react";
import { Section } from "@/types/admin";

interface SectionsTableProps {
  sections: Section[];
  isLoading: boolean;
  onEdit: (section: Section) => void;
  onDelete: (section: Section) => void;
}

const SectionsTable = ({ sections, isLoading, onEdit, onDelete }: SectionsTableProps) => {
  if (isLoading) {
    return (
      <TableRow>
        <TableCell colSpan={4} className="text-center py-8">
          Loading sections...
        </TableCell>
      </TableRow>
    );
  }

  if (!sections.length) {
    return (
      <TableRow>
        <TableCell colSpan={4} className="text-center py-8">
          No sections found
        </TableCell>
      </TableRow>
    );
  }

  return (
    <>
      {sections.map((section) => (
        <TableRow key={section.id}>
          <TableCell>{section.name}</TableCell>
          <TableCell>
            {section.subject?.name || 'No subject'}
          </TableCell>
          <TableCell>{section.description || '-'}</TableCell>
          <TableCell>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => onEdit(section)}
              >
                <Edit className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onDelete(section)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </TableCell>
        </TableRow>
      ))}
    </>
  );
};

export default SectionsTable;
