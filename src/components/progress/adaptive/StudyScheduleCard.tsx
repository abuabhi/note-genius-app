
import { ProgressCard } from "../shared/ProgressCard";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, Clock, Zap, Settings } from "lucide-react";
import { useAdaptiveLearning } from "@/hooks/progress/adaptive";

export const StudyScheduleCard = () => {
  const { adaptiveLearningInsights, isLoading } = useAdaptiveLearning();

  if (isLoading) {
    return (
      <ProgressCard title="Optimized Study Schedule" icon={Calendar}>
        <div className="h-64 animate-pulse bg-gray-200 rounded"></div>
      </ProgressCard>
    );
  }

  const { studySchedule } = adaptiveLearningInsights;

  const getDayName = (dayOfWeek: number) => {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    return days[dayOfWeek];
  };

  const getIntensityColor = (intensity: string) => {
    switch (intensity) {
      case 'intensive': return 'bg-red-100 text-red-800 border-red-200';
      case 'moderate': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default: return 'bg-green-100 text-green-800 border-green-200';
    }
  };

  return (
    <ProgressCard 
      title="Optimized Study Schedule" 
      icon={Calendar}
      headerAction={
        <Button variant="outline" size="sm">
          <Settings className="h-3 w-3 mr-1" />
          Customize
        </Button>
      }
    >
      <div className="space-y-6">
        {/* Optimal Time Slots */}
        <div className="space-y-3">
          <h4 className="font-medium text-gray-800 flex items-center gap-2">
            <Zap className="h-4 w-4 text-mint-600" />
            Peak Performance Times
          </h4>
          <div className="grid gap-2">
            {studySchedule.optimizedTimes.slice(0, 3).map((slot, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-mint-50 rounded-lg border border-mint-200">
                <div className="flex items-center gap-3">
                  <Clock className="h-4 w-4 text-mint-600" />
                  <span className="font-medium text-mint-800">
                    {slot.startTime} - {slot.endTime}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-xs">
                    {Math.round(slot.efficiencyScore * 100)}% efficiency
                  </Badge>
                  <Badge className="text-xs bg-mint-100 text-mint-700">
                    {slot.cognitiveLoad} focus
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Weekly Pattern */}
        <div className="space-y-3">
          <h4 className="font-medium text-gray-800">Weekly Pattern</h4>
          <div className="grid grid-cols-7 gap-1">
            {studySchedule.weeklyPattern.map((slot, index) => (
              <div key={index} className="text-center">
                <div className="text-xs font-medium text-gray-600 mb-1">
                  {getDayName(slot.dayOfWeek)}
                </div>
                <div className="p-2 bg-gray-50 rounded text-xs">
                  <div className="font-medium">{slot.startTime}</div>
                  <Badge 
                    className={`mt-1 text-xs ${getIntensityColor(slot.intensity)}`}
                  >
                    {slot.intensity}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Break Recommendations */}
        <div className="space-y-3">
          <h4 className="font-medium text-gray-800">Smart Break Schedule</h4>
          <div className="space-y-2">
            {studySchedule.adaptiveBreaks.map((breakRec, index) => (
              <div key={index} className="flex items-center justify-between p-2 bg-blue-50 rounded border border-blue-200">
                <div className="text-sm">
                  <span className="font-medium text-blue-800">
                    {breakRec.durationMinutes} min break
                  </span>
                  <span className="text-blue-600"> after {breakRec.afterMinutes} min</span>
                </div>
                <span className="text-xs text-blue-600">
                  {breakRec.suggestedActivity}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Preferences Summary */}
        <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-600">Session Length:</span>
              <div className="font-medium">{studySchedule.preferences.preferredStudyDuration} min</div>
            </div>
            <div>
              <span className="text-gray-600">Daily Max:</span>
              <div className="font-medium">{Math.round(studySchedule.preferences.maxDailyStudyTime / 60)} hours</div>
            </div>
            <div>
              <span className="text-gray-600">Study Style:</span>
              <div className="font-medium capitalize">{studySchedule.preferences.studyStyle}</div>
            </div>
            <div>
              <span className="text-gray-600">Break Style:</span>
              <div className="font-medium capitalize">{studySchedule.preferences.breakFrequency}</div>
            </div>
          </div>
        </div>
      </div>
    </ProgressCard>
  );
};
