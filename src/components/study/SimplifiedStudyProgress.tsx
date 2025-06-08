
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Target, CheckCircle, TrendingUp, Flame, Award } from "lucide-react";
import { useUnifiedStudyStats } from "@/hooks/useUnifiedStudyStats";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

const StatCard = ({ icon: Icon, label, value, color, tooltip }: {
  icon: any;
  label: string;
  value: string | number;
  color: string;
  tooltip: string;
}) => (
  <TooltipProvider>
    <Tooltip>
      <TooltipTrigger asChild>
        <div className={`rounded-lg border border-mint-100 p-3 ${color} cursor-help`}>
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-md bg-mint-100">
              <Icon className="h-4 w-4 text-mint-600" />
            </div>
            <div>
              <p className="text-sm text-mint-600">{label}</p>
              <p className="text-base font-medium text-mint-800">{value}</p>
            </div>
          </div>
        </div>
      </TooltipTrigger>
      <TooltipContent>
        <p className="max-w-xs">{tooltip}</p>
      </TooltipContent>
    </Tooltip>
  </TooltipProvider>
);

export const SimplifiedStudyProgress = () => {
  const { stats, isLoading } = useUnifiedStudyStats();

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Card className="bg-white/60 backdrop-blur-sm border-mint-100">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-medium flex items-center gap-2 text-mint-800">
              <TrendingUp className="h-4 w-4 text-mint-500" />
              Study Progress
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-mint-50 rounded-md animate-pulse" />
                  <div className="flex-1 space-y-1">
                    <div className="h-3 bg-mint-50 rounded animate-pulse" />
                    <div className="h-3 bg-mint-50 rounded animate-pulse w-2/3" />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <Card className="bg-white/60 backdrop-blur-sm border-mint-100">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-medium flex items-center gap-2 text-mint-800">
            <TrendingUp className="h-4 w-4 text-mint-500" />
            Study Progress
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <StatCard
            icon={Flame}
            label="Study Streak"
            value={`${stats.streakDays} days`}
            color="bg-mint-50"
            tooltip="Number of consecutive days you've studied. Keep it going to build a strong learning habit!"
          />
          
          <StatCard
            icon={CheckCircle}
            label="Cards Mastered"
            value={stats.totalCardsMastered}
            color="bg-mint-50"
            tooltip="Cards you've mastered through spaced repetition (7+ day intervals) or completed recently with high accuracy (80%+)"
          />
          
          <StatCard
            icon={Award}
            label="Progress Level"
            value={stats.totalCardsMastered > 0 ? "Active Learner" : "Getting Started"}
            color="bg-mint-50"
            tooltip={stats.totalCardsMastered > 0 ? "You're actively learning and making progress!" : "Start studying to unlock your learning potential!"}
          />
        </CardContent>
      </Card>
    </div>
  );
};
