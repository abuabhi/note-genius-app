
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Mail, Clock, Settings2 } from "lucide-react";
import { useEmailDigestPreferences } from "@/hooks/useEmailDigestPreferences";
import { Skeleton } from "@/components/ui/skeleton";

export const EmailDigestSettingsCard = () => {
  const { preferences, loading, updatePreferences } = useEmailDigestPreferences();

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5 text-blue-600" />
            Email Digest Settings
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
        </CardContent>
      </Card>
    );
  }

  if (!preferences) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Mail className="h-5 w-5 text-blue-600" />
          Email Digest Settings
        </CardTitle>
        <CardDescription>
          Configure your daily email digest with study progress and reminders
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Master Toggle */}
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label htmlFor="digest-enabled">Enable Daily Email Digest</Label>
            <p className="text-sm text-muted-foreground">
              Receive a daily summary of your study progress and tasks
            </p>
          </div>
          <Switch
            id="digest-enabled"
            checked={preferences.digest_enabled}
            onCheckedChange={(checked) => updatePreferences({ digest_enabled: checked })}
          />
        </div>

        {preferences.digest_enabled && (
          <>
            <Separator />
            
            {/* Timing Settings */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-mint-600" />
                <h4 className="font-medium">Delivery Settings</h4>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="digest-time">Delivery Time</Label>
                  <Select
                    value={preferences.digest_time}
                    onValueChange={(value) => updatePreferences({ digest_time: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="06:00:00">6:00 AM</SelectItem>
                      <SelectItem value="07:00:00">7:00 AM</SelectItem>
                      <SelectItem value="08:00:00">8:00 AM</SelectItem>
                      <SelectItem value="09:00:00">9:00 AM</SelectItem>
                      <SelectItem value="18:00:00">6:00 PM</SelectItem>
                      <SelectItem value="19:00:00">7:00 PM</SelectItem>
                      <SelectItem value="20:00:00">8:00 PM</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="frequency">Frequency</Label>
                  <Select
                    value={preferences.frequency}
                    onValueChange={(value: 'daily' | 'weekly' | 'never') => 
                      updatePreferences({ frequency: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="daily">Daily</SelectItem>
                      <SelectItem value="weekly">Weekly</SelectItem>
                      <SelectItem value="never">Never</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            <Separator />

            {/* Content Settings */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Settings2 className="h-4 w-4 text-mint-600" />
                <h4 className="font-medium">Content Settings</h4>
              </div>

              <div className="space-y-4">
                {/* Goals and Tasks */}
                <div className="space-y-3">
                  <h5 className="font-medium text-sm">Goals & Tasks</h5>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="include-goals" className="text-sm">Study Goals</Label>
                      <Switch
                        id="include-goals"
                        checked={preferences.include_goals}
                        onCheckedChange={(checked) => updatePreferences({ include_goals: checked })}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label htmlFor="include-todos" className="text-sm">Tasks & Reminders</Label>
                      <Switch
                        id="include-todos"
                        checked={preferences.include_todos}
                        onCheckedChange={(checked) => updatePreferences({ include_todos: checked })}
                      />
                    </div>
                  </div>
                </div>

                {/* Study Content */}
                <div className="space-y-3">
                  <h5 className="font-medium text-sm">Study Content</h5>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="include-notes" className="text-sm">Recent Notes</Label>
                      <Switch
                        id="include-notes"
                        checked={preferences.include_notes}
                        onCheckedChange={(checked) => updatePreferences({ include_notes: checked })}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label htmlFor="include-flashcards" className="text-sm">Flashcard Sets</Label>
                      <Switch
                        id="include-flashcards"
                        checked={preferences.include_flashcards}
                        onCheckedChange={(checked) => updatePreferences({ include_flashcards: checked })}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label htmlFor="include-quizzes" className="text-sm">Quiz Results</Label>
                      <Switch
                        id="include-quizzes"
                        checked={preferences.include_quizzes}
                        onCheckedChange={(checked) => updatePreferences({ include_quizzes: checked })}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label htmlFor="include-sessions" className="text-sm">Study Sessions</Label>
                      <Switch
                        id="include-sessions"
                        checked={preferences.include_study_sessions}
                        onCheckedChange={(checked) => updatePreferences({ include_study_sessions: checked })}
                      />
                    </div>
                  </div>
                </div>

                {/* Additional Features */}
                <div className="space-y-3">
                  <h5 className="font-medium text-sm">Additional Features</h5>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="include-streaks" className="text-sm">Study Streaks</Label>
                      <Switch
                        id="include-streaks"
                        checked={preferences.include_streaks}
                        onCheckedChange={(checked) => updatePreferences({ include_streaks: checked })}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label htmlFor="include-recommendations" className="text-sm">AI Recommendations</Label>
                      <Switch
                        id="include-recommendations"
                        checked={preferences.include_recommendations}
                        onCheckedChange={(checked) => updatePreferences({ include_recommendations: checked })}
                      />
                    </div>
                  </div>
                </div>

                {/* Content Limits */}
                <div className="space-y-3">
                  <h5 className="font-medium text-sm">Content Limits</h5>
                  <div className="grid grid-cols-2 gap-4">
                    {preferences.include_notes && (
                      <div className="space-y-2">
                        <Label htmlFor="notes-limit" className="text-sm">Notes Limit</Label>
                        <Select
                          value={preferences.notes_limit.toString()}
                          onValueChange={(value) => updatePreferences({ notes_limit: parseInt(value) })}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="3">3</SelectItem>
                            <SelectItem value="5">5</SelectItem>
                            <SelectItem value="10">10</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    )}
                    {preferences.include_flashcards && (
                      <div className="space-y-2">
                        <Label htmlFor="flashcards-limit" className="text-sm">Flashcard Sets Limit</Label>
                        <Select
                          value={preferences.flashcards_limit.toString()}
                          onValueChange={(value) => updatePreferences({ flashcards_limit: parseInt(value) })}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="3">3</SelectItem>
                            <SelectItem value="5">5</SelectItem>
                            <SelectItem value="10">10</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    )}
                    {preferences.include_quizzes && (
                      <div className="space-y-2">
                        <Label htmlFor="quizzes-limit" className="text-sm">Quiz Results Limit</Label>
                        <Select
                          value={preferences.quizzes_limit.toString()}
                          onValueChange={(value) => updatePreferences({ quizzes_limit: parseInt(value) })}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="2">2</SelectItem>
                            <SelectItem value="3">3</SelectItem>
                            <SelectItem value="5">5</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    )}
                    {preferences.include_study_sessions && (
                      <div className="space-y-2">
                        <Label htmlFor="sessions-limit" className="text-sm">Study Sessions Limit</Label>
                        <Select
                          value={preferences.study_sessions_limit.toString()}
                          onValueChange={(value) => updatePreferences({ study_sessions_limit: parseInt(value) })}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="3">3</SelectItem>
                            <SelectItem value="5">5</SelectItem>
                            <SelectItem value="10">10</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    )}
                  </div>
                </div>

                {/* Task Settings */}
                <div className="space-y-3">
                  <h5 className="font-medium text-sm">Task Settings</h5>
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="only-urgent" className="text-sm">Only Urgent Tasks</Label>
                      <p className="text-xs text-muted-foreground">
                        Include only urgent and critical priority tasks
                      </p>
                    </div>
                    <Switch
                      id="only-urgent"
                      checked={preferences.only_urgent}
                      onCheckedChange={(checked) => updatePreferences({ only_urgent: checked })}
                    />
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
};
