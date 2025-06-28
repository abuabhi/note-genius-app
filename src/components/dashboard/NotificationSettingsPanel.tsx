
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { Bell, Clock, Target, Trophy, BrainCircuit, Settings } from "lucide-react";
import { useState } from "react";
import { useNotificationSettings } from "@/hooks/useNotificationSettings";

export const NotificationSettingsPanel = () => {
  const { 
    settings, 
    updateSettings, 
    adaptiveInsights, 
    isLoading,
    applyRecommendations 
  } = useNotificationSettings();
  
  const [isExpanded, setIsExpanded] = useState(false);

  if (isLoading) {
    return (
      <Card className="border-mint-200 bg-white/60 backdrop-blur-sm">
        <CardContent className="p-4">
          <div className="animate-pulse space-y-2">
            <div className="h-4 bg-mint-100 rounded w-32"></div>
            <div className="h-3 bg-mint-100 rounded w-24"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-mint-200 hover:shadow-md transition-shadow bg-white/60 backdrop-blur-sm">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold flex items-center gap-2">
            <Bell className="h-5 w-5 text-mint-600" />
            Smart Notifications
            {adaptiveInsights?.hasRecommendations && (
              <Badge variant="secondary" className="bg-mint-100 text-mint-700">
                AI Suggestions
              </Badge>
            )}
          </CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsExpanded(!isExpanded)}
            className="hover:bg-mint-50"
          >
            <Settings className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Quick Toggles */}
        <div className="grid grid-cols-2 gap-4">
          <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg border border-blue-100">
            <div className="flex items-center gap-2">
              <Target className="h-4 w-4 text-blue-600" />
              <span className="text-sm font-medium text-blue-800">Study Reminders</span>
            </div>
            <Switch
              checked={settings.studyReminders}
              onCheckedChange={(checked) => 
                updateSettings({ studyReminders: checked })
              }
            />
          </div>
          
          <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg border border-yellow-100">
            <div className="flex items-center gap-2">
              <Trophy className="h-4 w-4 text-yellow-600" />
              <span className="text-sm font-medium text-yellow-800">Achievements</span>
            </div>
            <Switch
              checked={settings.achievements}
              onCheckedChange={(checked) => 
                updateSettings({ achievements: checked })
              }
            />
          </div>
        </div>

        {/* AI Recommendations */}
        {adaptiveInsights?.hasRecommendations && (
          <div className="bg-gradient-to-r from-mint-50 to-blue-50 p-4 rounded-lg border border-mint-200">
            <div className="flex items-center gap-2 mb-2">
              <BrainCircuit className="h-4 w-4 text-mint-600" />
              <span className="text-sm font-semibold text-mint-800">
                AI Recommendations
              </span>
            </div>
            <p className="text-xs text-mint-700 mb-3">
              {adaptiveInsights.suggestion}
            </p>
            <Button
              size="sm"
              variant="outline"
              className="border-mint-300 text-mint-700 hover:bg-mint-100"
              onClick={applyRecommendations}
            >
              Apply Suggestions
            </Button>
          </div>
        )}

        {/* Advanced Settings */}
        {isExpanded && (
          <div className="space-y-4 pt-4 border-t border-mint-100">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">Notification Frequency</span>
                <span className="text-xs text-gray-500">
                  {settings.frequency === 1 ? 'Minimal' : 
                   settings.frequency === 2 ? 'Moderate' : 'Frequent'}
                </span>
              </div>
              <Slider
                value={[settings.frequency]}
                onValueChange={([value]) => 
                  updateSettings({ frequency: value })
                }
                max={3}
                min={1}
                step={1}
                className="w-full"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg border border-purple-100">
                <span className="text-sm font-medium text-purple-800">Browser Notifications</span>
                <Switch
                  checked={settings.browserNotifications}
                  onCheckedChange={(checked) => 
                    updateSettings({ browserNotifications: checked })
                  }
                />
              </div>
              
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-100">
                <span className="text-sm font-medium text-gray-800">Quiet Hours</span>
                <Switch
                  checked={settings.respectQuietHours}
                  onCheckedChange={(checked) => 
                    updateSettings({ respectQuietHours: checked })
                  }
                />
              </div>
            </div>

            {/* Optimal Times */}
            <div>
              <span className="text-sm font-medium text-gray-700">Preferred Notification Times</span>
              <div className="flex flex-wrap gap-2 mt-2">
                {['Morning', 'Lunch', 'Evening'].map((time) => (
                  <Badge
                    key={time}
                    variant={settings.preferredTimes.includes(time.toLowerCase()) ? "default" : "outline"}
                    className={`cursor-pointer text-xs transition-colors ${
                      settings.preferredTimes.includes(time.toLowerCase()) 
                        ? 'bg-mint-500 hover:bg-mint-600 text-white' 
                        : 'hover:bg-mint-50 hover:border-mint-300'
                    }`}
                    onClick={() => {
                      const timeKey = time.toLowerCase();
                      const newTimes = settings.preferredTimes.includes(timeKey)
                        ? settings.preferredTimes.filter(t => t !== timeKey)
                        : [...settings.preferredTimes, timeKey];
                      updateSettings({ preferredTimes: newTimes });
                    }}
                  >
                    {time}
                  </Badge>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Status Indicator */}
        <div className="flex items-center justify-between text-xs text-gray-500 pt-2 border-t border-mint-100">
          <span>
            Adaptive learning {settings.adaptiveLearning ? 'enabled' : 'disabled'}
          </span>
          <div className="flex items-center gap-1">
            <div className={`w-2 h-2 rounded-full ${
              settings.studyReminders ? 'bg-green-500' : 'bg-gray-300'
            }`} />
            <span>Active</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
