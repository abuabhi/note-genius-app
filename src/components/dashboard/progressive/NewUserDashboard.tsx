import React from 'react';
import { UserProgressState } from '@/hooks/useUserProgressState';
import { GetStartedHeroSection } from './GetStartedHeroSection';
import { OnboardingChecklist } from './OnboardingChecklist';
import { QuickStartActions } from './QuickStartActions';
import { GettingStartedGuide } from './GettingStartedGuide';
import { StudySuggestions } from '@/components/analytics/StudySuggestions';

interface NewUserDashboardProps {
  progressState: UserProgressState;
}

export const NewUserDashboard = ({ progressState }: NewUserDashboardProps) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-mint-50/30 via-white to-blue-50/30">
      <div className="container mx-auto px-4 py-8 space-y-8">
        {/* Hero Section for New Users */}
        <GetStartedHeroSection />
        
        {/* Onboarding Checklist - First after hero section */}
        <OnboardingChecklist />
        
        {/* Quick Start Actions - Replace Learning Toolkit */}
        <QuickStartActions />
        
        {/* Welcome Tips Card */}
        <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Welcome to PrepGenie! 🎉</h3>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-3 text-sm text-gray-600">
              <p>
                <strong>Step 1:</strong> Start by creating your first note from study materials, textbooks, or lecture notes.
              </p>
              <p>
                <strong>Step 2:</strong> Transform your notes into interactive flashcards for better memorization.
              </p>
              <p>
                <strong>Step 3:</strong> Set study goals to track your progress and stay motivated.
              </p>
              <p>
                <strong>Step 4:</strong> Use quizzes to test your knowledge and identify areas for improvement.
              </p>
            </div>
            <div className="space-y-3">
              <div className="p-3 bg-mint-50 border border-mint-200 rounded-lg">
                <p className="text-sm text-mint-800 font-medium">
                  💡 Pro Tip: Import your existing study materials to get started quickly!
                </p>
              </div>
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm text-blue-800 font-medium">
                  ✨ Use AI features to enhance your notes and generate flashcards automatically!
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};