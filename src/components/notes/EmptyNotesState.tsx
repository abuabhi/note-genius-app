
import { Button } from "@/components/ui/button";
import { FileText, Plus, Scan, Upload, Sparkles } from "lucide-react";
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
      <div className="py-16">
        <EmptyState
          title="No notes found"
          description="Try adjusting your search terms or filters to find what you're looking for."
          icon={
            <div className="relative">
              <div className="w-20 h-20 bg-gradient-to-br from-mint-100 to-mint-200 rounded-2xl flex items-center justify-center shadow-lg">
                <FileText className="h-10 w-10 text-mint-600" />
              </div>
              <div className="absolute -top-2 -right-2 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                <span className="text-white text-xs font-bold">?</span>
              </div>
            </div>
          }
          className="text-center py-12"
        />
      </div>
    );
  }

  return (
    <div className="py-20">
      <EmptyState
        title="Welcome to your notes!"
        description="Start capturing your thoughts, ideas, and important information. Choose how you'd like to create your first note."
        icon={
          <div className="relative">
            <div className="w-24 h-24 bg-gradient-to-br from-mint-500 to-mint-600 rounded-3xl flex items-center justify-center shadow-xl">
              <FileText className="h-12 w-12 text-white" />
            </div>
            <div className="absolute -top-2 -right-2 w-8 h-8 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center animate-pulse">
              <Sparkles className="h-4 w-4 text-white" />
            </div>
          </div>
        }
        action={
          <div className="flex flex-col sm:flex-row gap-3 mt-8">
            <Button 
              onClick={onCreateNote}
              className="bg-gradient-to-r from-mint-600 to-mint-700 hover:from-mint-700 hover:to-mint-800 text-white shadow-lg shadow-mint-500/25 hover:shadow-mint-500/40 transition-all duration-200 px-6 py-3 rounded-xl"
            >
              <Plus className="h-4 w-4 mr-2" />
              Create Note
            </Button>
            <Button 
              variant="outline" 
              onClick={onScanNote}
              className="border-mint-200 text-mint-700 hover:bg-mint-50 hover:border-mint-300 transition-all duration-200 px-6 py-3 rounded-xl"
            >
              <Scan className="h-4 w-4 mr-2" />
              Scan Document
            </Button>
            <Button 
              variant="outline" 
              onClick={onImportNote}
              className="border-mint-200 text-mint-700 hover:bg-mint-50 hover:border-mint-300 transition-all duration-200 px-6 py-3 rounded-xl"
            >
              <Upload className="h-4 w-4 mr-2" />
              Import File
            </Button>
          </div>
        }
        className="text-center py-16"
      />
    </div>
  );
};
