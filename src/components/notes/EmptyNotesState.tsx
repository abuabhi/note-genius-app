
import React from "react";
import { Button } from "@/components/ui/button";
import { FileText, Plus, Lightbulb, BookOpen, Camera } from "lucide-react";
import { EmptyState } from "@/components/ui/empty-state";

interface EmptyNotesStateProps {
  onCreateNote?: () => void;
  onScanNote?: () => void;
  onImportNote?: () => void;
  isFiltered?: boolean;
}

export const EmptyNotesState = ({ 
  onCreateNote, 
  onScanNote, 
  onImportNote,
  isFiltered = false 
}: EmptyNotesStateProps) => {
  if (isFiltered) {
    return (
      <EmptyState
        icon={<FileText className="h-12 w-12 text-mint-400" />}
        title="No notes match your search"
        description="Try adjusting your search terms or filters to find what you're looking for."
        className="py-16"
      />
    );
  }

  return (
    <div className="text-center py-16 px-6">
      <div className="max-w-md mx-auto">
        {/* Main Icon */}
        <div className="flex justify-center mb-6">
          <div className="relative">
            <div className="w-20 h-20 bg-mint-100 rounded-full flex items-center justify-center">
              <BookOpen className="h-10 w-10 text-mint-600" />
            </div>
            <div className="absolute -top-2 -right-2 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
              <Plus className="h-4 w-4 text-blue-600" />
            </div>
          </div>
        </div>

        {/* Title and Description */}
        <h3 className="text-2xl font-semibold text-gray-900 mb-3">
          Start Your Learning Journey
        </h3>
        <p className="text-gray-600 mb-8 leading-relaxed">
          Create your first note to begin organizing your knowledge. You can type manually, scan documents, or import files.
        </p>

        {/* Action Buttons */}
        <div className="space-y-3 mb-8">
          {onCreateNote && (
            <Button 
              onClick={onCreateNote}
              className="w-full bg-mint-600 hover:bg-mint-700 text-white font-medium py-3"
            >
              <FileText className="mr-2 h-4 w-4" />
              Create Your First Note
            </Button>
          )}
          
          <div className="grid grid-cols-2 gap-3">
            {onScanNote && (
              <Button 
                onClick={onScanNote}
                variant="outline"
                className="border-mint-200 hover:bg-mint-50 font-medium py-2"
              >
                <Camera className="mr-2 h-4 w-4" />
                Scan Document
              </Button>
            )}
            
            {onImportNote && (
              <Button 
                onClick={onImportNote}
                variant="outline"
                className="border-mint-200 hover:bg-mint-50 font-medium py-2"
              >
                <Plus className="mr-2 h-4 w-4" />
                Import File
              </Button>
            )}
          </div>
        </div>

        {/* Tips Section */}
        <div className="bg-mint-50 rounded-lg p-4 border border-mint-100">
          <div className="flex items-start space-x-3">
            <Lightbulb className="h-5 w-5 text-mint-600 mt-0.5 flex-shrink-0" />
            <div className="text-left">
              <h4 className="font-medium text-mint-900 mb-2">Quick Tips:</h4>
              <ul className="text-sm text-mint-700 space-y-1">
                <li>• Use subjects to organize notes by topic</li>
                <li>• Pin important notes for quick access</li>
                <li>• Convert notes to flashcards for studying</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
