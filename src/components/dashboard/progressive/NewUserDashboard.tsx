import React from 'react';
import { UserProgressState } from '@/hooks/useUserProgressState';
import { GetStartedHeroSection } from './GetStartedHeroSection';
import { OnboardingChecklist } from './OnboardingChecklist';
import { QuickStartActions } from './QuickStartActions';

interface NewUserDashboardProps {
  progressState: UserProgressState;
}

/**
 * Streamlined new-user dashboard:
 * - Hero (entry point — "PDF → flashcards & quiz")
 * - Onboarding checklist (single source of truth for what to do next)
 * - Quick start actions (3 cards)
 *
 * Removed: redundant 4-step "Welcome Tips" card and StudySuggestions
 * (suggestions need data the user doesn't have yet).
 */
export const NewUserDashboard = ({ progressState }: NewUserDashboardProps) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-mint-50/30 via-white to-blue-50/30">
      <div className="container mx-auto px-4 py-8 space-y-8">
        <GetStartedHeroSection />
        <OnboardingChecklist />
        <QuickStartActions />
      </div>
    </div>
  );
};
