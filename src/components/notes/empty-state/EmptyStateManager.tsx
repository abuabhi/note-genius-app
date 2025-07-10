import React from 'react';
import { useEmptyState } from '@/contexts/EmptyStateContext';
import { WelcomeOnboarding } from '../page/WelcomeOnboarding';
import { EmptySubjectState } from '../page/EmptySubjectState';
import { EmptyNotesState } from '../EmptyNotesState';

/**
 * Unified Empty State Manager
 * 
 * This component is the SINGLE point of truth for all empty state rendering.
 * It determines which empty state to show based on centralized logic in EmptyStateContext.
 * 
 * Priority order:
 * 1. Welcome state (first-time users)
 * 2. Subject-specific empty state (when filtering by subject)
 * 3. Filtered empty state (when search/filters are active)
 * 4. Generic empty state (default)
 */
export const EmptyStateManager = () => {
  const {
    emptyStateType,
    selectedSubject,
    onCreateNote,
    onImportNote,
    dismissWelcome,
    hasActiveFilters
  } = useEmptyState();

  // Don't render anything if no empty state should be shown
  if (emptyStateType === 'none') {
    return null;
  }

  // Render the appropriate empty state based on type
  switch (emptyStateType) {
    case 'welcome':
      return (
        <div className="space-y-8">
          <WelcomeOnboarding 
            onCreateNote={onCreateNote}
            onImportNote={onImportNote}
            onDismiss={dismissWelcome}
          />
          {/* Show generic empty state below welcome for visual continuity */}
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-br from-mint-50/50 to-blue-50/30 rounded-xl blur-xl"></div>
            <div className="relative bg-white/70 backdrop-blur-sm rounded-xl border border-mint-100/50 shadow-lg">
              <EmptyNotesState 
                onCreateNote={onCreateNote}
                onImportNote={onImportNote}
                isFiltered={false}
              />
            </div>
          </div>
        </div>
      );

    case 'subject':
      return (
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-br from-mint-50/50 to-blue-50/30 rounded-xl blur-xl"></div>
          <div className="relative bg-white/70 backdrop-blur-sm rounded-xl border border-mint-100/50 shadow-lg">
            <EmptySubjectState 
              subjectName={selectedSubject}
              onCreateNote={onCreateNote}
            />
          </div>
        </div>
      );

    case 'filtered':
      return (
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-br from-mint-50/50 to-blue-50/30 rounded-xl blur-xl"></div>
          <div className="relative bg-white/70 backdrop-blur-sm rounded-xl border border-mint-100/50 shadow-lg">
            <EmptyNotesState 
              onCreateNote={onCreateNote}
              onImportNote={onImportNote}
              isFiltered={hasActiveFilters}
              selectedSubject={selectedSubject}
            />
          </div>
        </div>
      );

    case 'generic':
      return (
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-br from-mint-50/50 to-blue-50/30 rounded-xl blur-xl"></div>
          <div className="relative bg-white/70 backdrop-blur-sm rounded-xl border border-mint-100/50 shadow-lg">
            <EmptyNotesState 
              onCreateNote={onCreateNote}
              onImportNote={onImportNote}
              isFiltered={false}
            />
          </div>
        </div>
      );

    default:
      return null;
  }
};