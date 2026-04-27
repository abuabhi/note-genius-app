
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { BookOpen, Target, CheckSquare, FileText, Zap, TrendingUp } from "lucide-react";
import { EmailDigestPreferences } from "@/hooks/useEmailDigestPreferences";

interface ContentTypesSectionProps {
  preferences: EmailDigestPreferences;
  updatePreferences: (updates: Partial<EmailDigestPreferences>) => Promise<void>;
}

export const ContentTypesSection = ({ preferences, updatePreferences }: ContentTypesSectionProps) => {
  const contentTypes = [
    {
      group: "Study Goals",
      items: [
        {
          key: "include_goals" as keyof EmailDigestPreferences,
          label: "Goals Progress",
          description: "Your study goals and achievement progress",
          icon: Target,
          color: "text-blue-600"
        },
        {
          key: "include_todos" as keyof EmailDigestPreferences,
          label: "Task Updates",
          description: "Pending and completed tasks",
          icon: CheckSquare,
          color: "text-green-600"
        }
      ]
    },
    {
      group: "Study Content",
      items: [
        {
          key: "include_notes" as keyof EmailDigestPreferences,
          label: "Recent Notes",
          description: "Your latest notes and study materials",
          icon: FileText,
          color: "text-purple-600"
        },
        {
          key: "include_flashcards" as keyof EmailDigestPreferences,
          label: "Flashcard Sets",
          description: "New flashcards and review status",
          icon: BookOpen,
          color: "text-orange-600"
        },
        {
          key: "include_quizzes" as keyof EmailDigestPreferences,
          label: "Quiz Results",
          description: "Recent quiz scores and performance",
          icon: Zap,
          color: "text-yellow-600"
        },
        {
          key: "include_study_sessions" as keyof EmailDigestPreferences,
          label: "Study Sessions",
          description: "Session summaries and time tracking",
          icon: TrendingUp,
          color: "text-indigo-600"
        }
      ]
    },
    {
      group: "Additional Features",
      items: [
        {
          key: "include_streaks" as keyof EmailDigestPreferences,
          label: "Study Streaks",
          description: "Streak counters and achievements",
          icon: TrendingUp,
          color: "text-red-600"
        },
        {
          key: "include_recommendations" as keyof EmailDigestPreferences,
          label: "AI Recommendations",
          description: "Personalized study suggestions",
          icon: Zap,
          color: "text-cyan-600"
        }
      ]
    }
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <FileText className="h-4 w-4 text-purple-600" />
          Content Types
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {contentTypes.map((group) => (
          <div key={group.group} className="space-y-3">
            <h4 className="font-medium text-gray-900 text-sm">{group.group}</h4>
            <div className="space-y-3">
              {group.items.map((item) => (
                <div
                  key={item.key}
                  className="flex items-center justify-between p-3 rounded-lg border hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-start gap-3">
                    <item.icon className={`h-4 w-4 mt-0.5 ${item.color}`} />
                    <div>
                      <div className="font-medium text-sm">{item.label}</div>
                      <div className="text-xs text-muted-foreground">
                        {item.description}
                      </div>
                    </div>
                  </div>
                  <Switch
                    checked={Boolean(preferences[item.key])}
                    onCheckedChange={(checked) => 
                      updatePreferences({ [item.key]: checked })
                    }
                  />
                </div>
              ))}
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
};
