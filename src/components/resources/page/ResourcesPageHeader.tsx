import { StandardPageHeader } from '@/components/ui/StandardPageHeader';
import { ViewToggle } from '@/components/notes/page/ViewToggle';
import { Button } from '@/components/ui/button';
import { Plus, Import, Bookmark } from 'lucide-react';
import { ViewMode } from '@/hooks/useViewPreferences';

interface ResourcesPageHeaderProps {
  loading: boolean;
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
  onAddResource?: () => void;
  onImportResource?: () => void;
}

export const ResourcesPageHeader = ({ 
  loading, 
  viewMode, 
  onViewModeChange,
  onAddResource,
  onImportResource
}: ResourcesPageHeaderProps) => {
  const breadcrumbs = [
    { label: 'Study Helper', href: '/dashboard' },
    { label: 'Resources', href: '/resources' }
  ];

  const actions = (
    <div className="flex items-center gap-3">
      <ViewToggle viewMode={viewMode} onViewModeChange={onViewModeChange} />
      
      <Button
        variant="outline"
        size="sm"
        onClick={onImportResource}
        disabled={loading}
        className="hidden sm:flex"
      >
        <Import className="h-4 w-4 mr-2" />
        Import
      </Button>
      
      <Button
        onClick={onAddResource}
        disabled={loading}
        size="sm"
      >
        <Plus className="h-4 w-4 mr-2" />
        Add Resource
      </Button>
    </div>
  );

  return (
    <StandardPageHeader
      title="Resources"
      description="Save and organize your study resources"
      icon={<Bookmark className="h-5 w-5" />}
      breadcrumbs={breadcrumbs}
      actions={actions}
    />
  );
};