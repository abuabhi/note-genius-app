
import React from 'react';

/**
 * This component adds guide attributes to dashboard elements
 * It wraps existing dashboard components with the necessary data-guide attributes
 */

interface GuideWrapperProps {
  children: React.ReactNode;
  guideId: string;
  className?: string;
}

export const GuideWrapper: React.FC<GuideWrapperProps> = ({ 
  children, 
  guideId, 
  className = '' 
}) => {
  return (
    <div data-guide={guideId} className={className}>
      {children}
    </div>
  );
};

// Export specific guide wrappers for common dashboard elements
export const DashboardMainWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <GuideWrapper guideId="dashboard-main" className="w-full">
    {children}
  </GuideWrapper>
);

export const QuickActionsWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <GuideWrapper guideId="quick-actions" className="w-full">
    {children}
  </GuideWrapper>
);

export const ProgressSectionWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <GuideWrapper guideId="progress-section" className="w-full">
    {children}
  </GuideWrapper>
);

export const AddNoteButtonWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <GuideWrapper guideId="add-note-button">
    {children}
  </GuideWrapper>
);
