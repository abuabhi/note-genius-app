
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Hash } from "lucide-react";
import { EmailDigestPreferences } from "@/hooks/useEmailDigestPreferences";

interface ContentLimitsSectionProps {
  preferences: EmailDigestPreferences;
  updatePreferences: (updates: Partial<EmailDigestPreferences>) => Promise<void>;
}

export const ContentLimitsSection = ({ preferences, updatePreferences }: ContentLimitsSectionProps) => {
  const limits = [
    {
      key: "notes_limit" as keyof EmailDigestPreferences,
      label: "Notes",
      enabled: preferences.include_notes,
      description: "Maximum recent notes to include"
    },
    {
      key: "flashcards_limit" as keyof EmailDigestPreferences,
      label: "Flashcard Sets",
      enabled: preferences.include_flashcards,
      description: "Maximum flashcard sets to show"
    },
    {
      key: "quizzes_limit" as keyof EmailDigestPreferences,
      label: "Quiz Results",
      enabled: preferences.include_quizzes,
      description: "Maximum quiz results to include"
    },
    {
      key: "study_sessions_limit" as keyof EmailDigestPreferences,
      label: "Study Sessions",
      enabled: preferences.include_study_sessions,
      description: "Maximum study sessions to show"
    }
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <Hash className="h-4 w-4 text-gray-600" />
          Content Limits
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {limits.map((limit) => (
            <div
              key={limit.key}
              className={`space-y-2 p-3 rounded-lg border transition-all ${
                limit.enabled 
                  ? 'bg-white border-gray-200' 
                  : 'bg-gray-50 border-gray-100'
              }`}
            >
              <div className="flex items-center justify-between">
                <label className={`text-sm font-medium ${
                  limit.enabled ? 'text-gray-900' : 'text-gray-500'
                }`}>
                  {limit.label}
                </label>
                {!limit.enabled && (
                  <span className="text-xs bg-gray-200 text-gray-600 px-2 py-1 rounded">
                    Disabled
                  </span>
                )}
              </div>
              <Input
                type="number"
                min="1"
                max="20"
                value={preferences[limit.key] as number}
                onChange={(e) => 
                  updatePreferences({ 
                    [limit.key]: Math.max(1, Math.min(20, parseInt(e.target.value) || 1))
                  })
                }
                disabled={!limit.enabled}
                className={limit.enabled ? '' : 'bg-gray-100'}
              />
              <p className={`text-xs ${
                limit.enabled ? 'text-muted-foreground' : 'text-gray-400'
              }`}>
                {limit.description}
              </p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
