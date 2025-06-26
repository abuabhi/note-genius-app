
import { Button } from "@/components/ui/button";
import { FileText, Plus, Import, Grid3X3, List } from "lucide-react";
import { StandardPageHeader } from "@/components/ui/StandardPageHeader";

interface NotesPageHeaderProps {
  loading: boolean;
  viewMode: 'grid' | 'list';
  onViewModeChange: (mode: 'grid' | 'list') => void;
  onOpenManualDialog: () => void;
  onOpenImportDialog: () => void;
}

export const NotesPageHeader = ({ 
  loading, 
  viewMode, 
  onViewModeChange,
  onOpenManualDialog,
  onOpenImportDialog
}: NotesPageHeaderProps) => {
  const breadcrumbs = [
    { label: "Notes" }
  ];

  const actions = (
    <>
      {/* View Mode Toggle */}
      <div className="flex rounded-lg border border-gray-200 bg-white shadow-sm">
        <Button
          variant={viewMode === 'grid' ? "default" : "ghost"}
          size="sm"
          onClick={() => onViewModeChange('grid')}
          className={`rounded-r-none ${viewMode === 'grid' ? 'bg-mint-500 text-white' : 'text-gray-600'}`}
        >
          <Grid3X3 className="h-4 w-4" />
        </Button>
        <Button
          variant={viewMode === 'list' ? "default" : "ghost"}
          size="sm"
          onClick={() => onViewModeChange('list')}
          className={`rounded-l-none ${viewMode === 'list' ? 'bg-mint-500 text-white' : 'text-gray-600'}`}
        >
          <List className="h-4 w-4" />
        </Button>
      </div>

      {/* Import Button */}
      <Button
        onClick={onOpenImportDialog}
        variant="outline"
        className="bg-white hover:bg-gray-50 border-gray-200 text-gray-700"
        disabled={loading}
      >
        <Import className="h-4 w-4 mr-2" />
        Import
      </Button>

      {/* Add Note Button */}
      <Button
        onClick={onOpenManualDialog}
        className="bg-gradient-to-r from-mint-500 to-blue-500 hover:from-mint-600 hover:to-blue-600 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-200"
        disabled={loading}
      >
        <Plus className="h-4 w-4 mr-2" />
        Add Note
      </Button>
    </>
  );

  return (
    <StandardPageHeader
      title="Notes"
      description="Create, organize, and manage your study notes"
      icon={<FileText className="h-6 w-6 text-white" />}
      breadcrumbs={breadcrumbs}
      actions={actions}
    />
  );
};
