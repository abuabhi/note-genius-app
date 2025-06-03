
import React from "react";
import { Button } from "@/components/ui/button";
import { FileText, Plus, Tag } from "lucide-react";

interface EmptySubjectStateProps {
  subjectName: string;
  onCreateNote?: () => void;
}

export const EmptySubjectState = ({ subjectName, onCreateNote }: EmptySubjectStateProps) => {
  return (
    <div className="text-center py-16 px-6">
      <div className="max-w-md mx-auto">
        {/* Subject Icon */}
        <div className="flex justify-center mb-6">
          <div className="w-16 h-16 bg-mint-100 rounded-full flex items-center justify-center">
            <Tag className="h-8 w-8 text-mint-600" />
          </div>
        </div>

        {/* Title and Description */}
        <h3 className="text-xl font-semibold text-gray-900 mb-3">
          No notes in {subjectName}
        </h3>
        <p className="text-gray-600 mb-6">
          Start building your {subjectName} knowledge base by creating your first note.
        </p>

        {/* Action Button */}
        {onCreateNote && (
          <Button 
            onClick={onCreateNote}
            className="bg-mint-600 hover:bg-mint-700 text-white font-medium"
          >
            <Plus className="mr-2 h-4 w-4" />
            Add Note to {subjectName}
          </Button>
        )}
      </div>
    </div>
  );
};
