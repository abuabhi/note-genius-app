
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Settings } from "lucide-react";
import { EmailDigestPreferences } from "@/hooks/useEmailDigestPreferences";

interface TaskSettingsSectionProps {
  preferences: EmailDigestPreferences;
  updatePreferences: (updates: Partial<EmailDigestPreferences>) => Promise<void>;
}

export const TaskSettingsSection = ({ preferences, updatePreferences }: TaskSettingsSectionProps) => {
  const taskSettings = [
    {
      key: "include_completed" as keyof EmailDigestPreferences,
      label: "Include Completed Tasks",
      description: "Show tasks you've completed recently",
      enabled: preferences.include_todos
    },
    {
      key: "only_urgent" as keyof EmailDigestPreferences,
      label: "Only Urgent Tasks",
      description: "Only include high-priority and overdue tasks",
      enabled: preferences.include_todos
    }
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <Settings className="h-4 w-4 text-gray-600" />
          Task Settings
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {taskSettings.map((setting) => (
          <div
            key={setting.key}
            className={`flex items-center justify-between p-3 rounded-lg border transition-all ${
              setting.enabled 
                ? 'bg-white border-gray-200 hover:bg-gray-50' 
                : 'bg-gray-50 border-gray-100'
            }`}
          >
            <div className={setting.enabled ? '' : 'opacity-50'}>
              <div className={`font-medium text-sm ${
                setting.enabled ? 'text-gray-900' : 'text-gray-500'
              }`}>
                {setting.label}
              </div>
              <div className={`text-xs ${
                setting.enabled ? 'text-muted-foreground' : 'text-gray-400'
              }`}>
                {setting.description}
              </div>
              {!setting.enabled && (
                <div className="text-xs text-orange-600 mt-1">
                  Enable "Task Updates" first
                </div>
              )}
            </div>
            <Switch
              checked={Boolean(preferences[setting.key])}
              onCheckedChange={(checked) => 
                updatePreferences({ [setting.key]: checked })
              }
              disabled={!setting.enabled}
            />
          </div>
        ))}
      </CardContent>
    </Card>
  );
};
