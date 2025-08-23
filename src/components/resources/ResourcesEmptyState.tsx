import React from 'react';
import { EmptyState } from '@/components/ui/empty-state';
import { Button } from '@/components/ui/button';
import { Plus, Import, Bookmark, Youtube, FileText, Globe } from 'lucide-react';

interface ResourcesEmptyStateProps {
  hasActiveFilters?: boolean;
  onAddResource?: () => void;
  onImportResource?: () => void;
}

export const ResourcesEmptyState = ({ 
  hasActiveFilters, 
  onAddResource,
  onImportResource 
}: ResourcesEmptyStateProps) => {
  if (hasActiveFilters) {
    return (
      <EmptyState
        icon={<Bookmark className="h-12 w-12 text-gray-400" />}
        title="No resources found"
        description="Try adjusting your filters or search terms to find what you're looking for."
      />
    );
  }

  return (
    <div className="text-center py-12 space-y-6">
      <div className="flex justify-center">
        <div className="relative">
          <Bookmark className="h-16 w-16 text-gray-300" />
          <div className="absolute -top-1 -right-1">
            <div className="flex space-x-1">
              <Youtube className="h-4 w-4 text-red-500" />
              <FileText className="h-4 w-4 text-blue-500" />
              <Globe className="h-4 w-4 text-green-500" />
            </div>
          </div>
        </div>
      </div>
      
      <div className="space-y-2">
        <h3 className="text-xl font-semibold text-gray-900">
          Start Building Your Resource Library
        </h3>
        <p className="text-gray-600 max-w-md mx-auto">
          Save and organize all your study materials in one place. Add videos, articles, 
          PDFs, and more to create your personalized learning hub.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-lg mx-auto text-sm text-gray-500">
        <div className="flex items-center justify-center space-x-2">
          <Youtube className="h-4 w-4 text-red-500" />
          <span>YouTube Videos</span>
        </div>
        <div className="flex items-center justify-center space-x-2">
          <FileText className="h-4 w-4 text-blue-500" />
          <span>Articles & PDFs</span>
        </div>
        <div className="flex items-center justify-center space-x-2">
          <Globe className="h-4 w-4 text-green-500" />
          <span>Websites & More</span>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
        <Button onClick={onAddResource} size="lg">
          <Plus className="h-4 w-4 mr-2" />
          Add Your First Resource
        </Button>
        <Button variant="outline" onClick={onImportResource} size="lg">
          <Import className="h-4 w-4 mr-2" />
          Import Resources
        </Button>
      </div>

      <div className="text-xs text-gray-400 max-w-sm mx-auto">
        Resources are organized by subject and can be tagged, favorited, 
        and searched to help you find exactly what you need when studying.
      </div>
    </div>
  );
};