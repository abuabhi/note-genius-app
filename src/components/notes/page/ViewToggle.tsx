
import { Button } from "@/components/ui/button";
import { Grid3X3, List, LayoutGrid } from "lucide-react";
import { ViewMode } from '@/hooks/useViewPreferences';

interface ViewToggleProps {
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
}

export const ViewToggle = ({ viewMode, onViewModeChange }: ViewToggleProps) => {
  console.log('🎯 ViewToggle - Current viewMode:', viewMode);

  return (
    <div className="flex items-center bg-white/80 backdrop-blur-sm rounded-lg border border-gray-200 p-1 shadow-sm">
      <Button
        variant={viewMode === 'grid' ? 'default' : 'ghost'}
        size="sm"
        onClick={() => {
          console.log('🎯 ViewToggle - Switching to grid mode');
          onViewModeChange('grid');
        }}
        className={`h-8 px-3 transition-all duration-200 ${
          viewMode === 'grid' 
            ? 'bg-mint-600 text-white shadow-sm' 
            : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
        }`}
      >
        <LayoutGrid className="h-4 w-4 mr-1" />
        Grid
      </Button>
      
      <Button
        variant={viewMode === 'compact' ? 'default' : 'ghost'}
        size="sm"
        onClick={() => {
          console.log('🎯 ViewToggle - Switching to compact mode');
          onViewModeChange('compact');
        }}
        className={`h-8 px-3 transition-all duration-200 ${
          viewMode === 'compact' 
            ? 'bg-mint-600 text-white shadow-sm' 
            : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
        }`}
      >
        <List className="h-4 w-4 mr-1" />
        List
      </Button>
    </div>
  );
};
