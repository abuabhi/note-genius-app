
import { Card, CardContent } from "@/components/ui/card";
import { Trophy, Award, Target } from "lucide-react";

interface AchievementStatsProps {
  totalPoints: number;
  achievementsCount: number;
  availableCount: number;
}

export const AchievementStats = ({ totalPoints, achievementsCount, availableCount }: AchievementStatsProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <Card className="bg-gradient-to-r from-yellow-50 to-yellow-100 border-yellow-200">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-yellow-800">Total Points</p>
              <p className="text-2xl font-bold text-yellow-900">{totalPoints}</p>
            </div>
            <Trophy className="h-8 w-8 text-yellow-600" />
          </div>
        </CardContent>
      </Card>

      <Card className="bg-gradient-to-r from-purple-50 to-purple-100 border-purple-200">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-purple-800">Achievements</p>
              <p className="text-2xl font-bold text-purple-900">{achievementsCount}</p>
            </div>
            <Award className="h-8 w-8 text-purple-600" />
          </div>
        </CardContent>
      </Card>

      <Card className="bg-gradient-to-r from-green-50 to-green-100 border-green-200">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-green-800">Available</p>
              <p className="text-2xl font-bold text-green-900">{availableCount}</p>
            </div>
            <Target className="h-8 w-8 text-green-600" />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
