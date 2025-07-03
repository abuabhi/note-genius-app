import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CalendarClock, Clock, Edit, Star, Trophy, Zap } from 'lucide-react';

export const GoalSettingDemo = () => {
  // Demo goal data
  const demoGoal = {
    title: "Master Biology for HSC",
    description: "Complete comprehensive biology preparation with focus on photosynthesis and cellular respiration",
    progress: 68,
    target_hours: 40,
    daysLeft: 12,
    subject: "Biology",
    rewardPoints: 340,
    milestoneBonus: 25
  };

  return (
    <div className="mt-6">
      <Card className="bg-gradient-to-br from-white to-gray-50 max-w-md mx-auto">
        <CardHeader className="pb-2">
          <div className="flex justify-between items-start">
            <CardTitle className="text-lg">{demoGoal.title}</CardTitle>
            <div className="flex space-x-1">
              <Badge variant="secondary">{demoGoal.subject}</Badge>
            </div>
          </div>
          <CardDescription>{demoGoal.description}</CardDescription>
          
          {/* Motivational message */}
          <div className="mt-2 p-2 bg-white/60 rounded-md border border-gray-200">
            <p className="text-xs text-center font-medium text-gray-700">
              ⭐ Great progress! Keep it up!
            </p>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-3 pb-2">
          <div>
            <div className="flex justify-between mb-1 text-xs text-gray-500">
              <span>Progress • ⭐ Halfway champion!</span>
              <span>{demoGoal.progress}%</span>
            </div>
            <Progress value={demoGoal.progress} className="h-3" />
          </div>

          {/* Reward points section */}
          <div className="flex items-center justify-between p-2 bg-white/60 rounded-md border border-gray-200">
            <div className="flex items-center gap-2">
              <Star className="h-4 w-4 text-yellow-500" />
              <span className="text-sm font-medium">Reward Points</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="text-sm font-bold text-yellow-600">{demoGoal.rewardPoints}</span>
              <span className="text-xs text-gray-500">pts</span>
              <Badge variant="outline" className="ml-1 text-xs bg-green-50 text-green-700">
                +{demoGoal.milestoneBonus} milestone
              </Badge>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div className="flex items-center gap-1">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <span>{demoGoal.target_hours} hours target</span>
            </div>
            <div className="flex items-center gap-1">
              <CalendarClock className="h-4 w-4 text-muted-foreground" />
              <span>{demoGoal.daysLeft} days left</span>
            </div>
          </div>
          
          <div className="text-xs text-muted-foreground">
            <div>From: Feb 15, 2024</div>
            <div>To: Mar 30, 2024</div>
          </div>

          {/* Progress encouragement */}
          <div className="flex items-center gap-2 p-2 bg-blue-50 rounded-md border border-blue-200">
            <Zap className="h-4 w-4 text-blue-500" />
            <span className="text-xs text-blue-700">
              Automatically tracked from your study sessions!
            </span>
          </div>
        </CardContent>
        
        <CardFooter className="pt-2">
          <div className="flex justify-end gap-2 w-full">
            <Button variant="outline" size="sm">
              <Edit className="h-3.5 w-3.5 mr-1" />
              Edit Goal
            </Button>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
};