
import { BookOpen, GraduationCap, FileText, Calendar, Settings, BarChart } from "lucide-react";
import { QuickActionCard } from "./QuickActionCard";

interface QuickActionsGridProps {
  isFeatureVisible: (key: string) => boolean;
}

export const QuickActionsGrid = ({ isFeatureVisible }: QuickActionsGridProps) => {
  const FEATURE_KEYS = {
    SCHEDULE: "schedule",
    NOTES: "notes",
    SETTINGS: "settings",
    QUIZZES: "quizzes",
  };

  return (
    <>
      <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {/* Flashcards Card - Core feature, always visible */}
        <QuickActionCard
          title="Flashcards"
          description="Study with flashcards"
          href="/flashcards"
          icon={BookOpen}
          buttonText="View Flashcards"
          variant="default"
        />

        {/* Quizzes Card - Show if feature is visible */}
        {isFeatureVisible(FEATURE_KEYS.QUIZZES) && (
          <QuickActionCard
            title="Quizzes"
            description="Test your knowledge"
            href="/quizzes"
            icon={GraduationCap}
            buttonText="Take Quiz"
            variant="default"
            secondaryAction={{
              href: "/quiz/history",
              icon: BarChart,
              text: "Quiz History"
            }}
          />
        )}

        {/* Notes Card - Core functionality, always visible */}
        <QuickActionCard
          title="My Notes"
          description="Access your study materials"
          href="/notes"
          icon={FileText}
          buttonText="View Notes"
          variant="default"
        />

        {/* Schedule Card - Only show if feature is visible */}
        {isFeatureVisible(FEATURE_KEYS.SCHEDULE) && (
          <QuickActionCard
            title="Schedule"
            description="Manage your study calendar"
            href="/schedule"
            icon={Calendar}
            buttonText="View Schedule"
            variant="default"
          />
        )}

        {/* Settings Card - Core functionality, always visible */}
        <QuickActionCard
          title="Settings"
          description="Manage your preferences"
          href="/settings"
          icon={Settings}
          buttonText="View Settings"
          variant="default"
        />
      </div>
    </>
  );
};
