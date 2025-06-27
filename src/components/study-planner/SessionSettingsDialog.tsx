
import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { StudyPlan } from '@/types/studyPlanner';
import { Clock, Timer, Target } from 'lucide-react';

interface SessionSettingsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  studyPlan: StudyPlan;
}

export const SessionSettingsDialog: React.FC<SessionSettingsDialogProps> = ({
  open,
  onOpenChange,
  studyPlan
}) => {
  const [sessionDuration, setSessionDuration] = useState(studyPlan.session_duration_minutes || 45);
  const [breakDuration, setBreakDuration] = useState(studyPlan.break_duration_minutes || 10);
  const [maxSessions, setMaxSessions] = useState(studyPlan.max_sessions_per_day || 3);

  const handleSave = () => {
    // Save settings to study plan or user preferences
    console.log('Saving session settings:', {
      sessionDuration,
      breakDuration,
      maxSessions
    });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Timer className="h-5 w-5 text-mint-600" />
            Session Settings
          </DialogTitle>
          <DialogDescription>
            Configure your study session preferences for "{studyPlan.title}"
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Session Duration */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-gray-500" />
              <Label htmlFor="session-duration">Session Duration</Label>
            </div>
            <div className="space-y-2">
              <Slider
                value={[sessionDuration]}
                onValueChange={(value) => setSessionDuration(value[0])}
                max={120}
                min={15}
                step={15}
                className="w-full"
              />
              <div className="flex justify-between text-sm text-gray-500">
                <span>15 min</span>
                <span className="font-medium text-mint-600">{sessionDuration} min</span>
                <span>120 min</span>
              </div>
            </div>
          </div>

          {/* Break Duration */}
          <div className="space-y-3">
            <Label htmlFor="break-duration">Break Duration</Label>
            <div className="space-y-2">
              <Slider
                value={[breakDuration]}
                onValueChange={(value) => setBreakDuration(value[0])}
                max={30}
                min={5}
                step={5}
                className="w-full"
              />
              <div className="flex justify-between text-sm text-gray-500">
                <span>5 min</span>
                <span className="font-medium text-mint-600">{breakDuration} min</span>
                <span>30 min</span>
              </div>
            </div>
          </div>

          {/* Max Sessions Per Day */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Target className="h-4 w-4 text-gray-500" />
              <Label htmlFor="max-sessions">Max Sessions Per Day</Label>
            </div>
            <Input
              id="max-sessions"
              type="number"
              value={maxSessions}
              onChange={(e) => setMaxSessions(parseInt(e.target.value) || 1)}
              min={1}
              max={10}
              className="w-full"
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave} className="bg-mint-600 hover:bg-mint-700">
            Save Settings
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
