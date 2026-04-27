
import { Button } from "@/components/ui/button";
import { PlusCircle, Grid3X3, List, Activity, FileText } from "lucide-react";
import { StandardPageHeader } from "@/components/ui/StandardPageHeader";

interface QuizPageHeaderProps {
  loading: boolean;
  viewMode: 'grid' | 'list';
  onViewModeChange: (mode: 'grid' | 'list') => void;
  onOpenCreateDialog: () => void;
  onCreateFromNotes?: () => void;
}

export const QuizPageHeader = ({ 
  loading, 
  viewMode, 
  onViewModeChange,
  onOpenCreateDialog,
  onCreateFromNotes,
}: QuizPageHeaderProps) => {
  const breadcrumbs = [
    { label: "Quizzes" }
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

      {/* Create from Notes (only when handler provided / notes exist) */}
      {onCreateFromNotes && (
        <Button
          variant="outline"
          onClick={onCreateFromNotes}
          className="border-mint-200 text-mint-700 hover:bg-mint-50 font-semibold"
          disabled={loading}
        >
          <FileText className="h-4 w-4 mr-2" />
          From Notes
        </Button>
      )}

      {/* Create Quiz Button */}
      <Button
        onClick={onOpenCreateDialog}
        className="bg-gradient-to-r from-mint-500 to-blue-500 hover:from-mint-600 hover:to-blue-600 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-200"
        disabled={loading}
      >
        <PlusCircle className="h-4 w-4 mr-2" />
        Create Quiz
      </Button>
    </>
  );

  return (
    <StandardPageHeader
      title="Quiz Center"
      description="Test your knowledge and track your progress"
      icon={<Activity className="h-6 w-6 text-white" />}
      breadcrumbs={breadcrumbs}
      actions={actions}
    />
  );
};
