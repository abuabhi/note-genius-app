
import { StudyStatsOverview } from "@/components/study/StudyStatsOverview";
import { StudyStatsCard } from "@/components/dashboard/StudyStatsCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, Clock, Target, BookOpen } from "lucide-react";

export const AnalyticsSection = () => {
  return (
    <div className="space-y-8">
      {/* Quick Overview Stats */}
      <div>
        <h2 className="text-xl font-semibold mb-4 text-mint-900">Your Learning Overview</h2>
        <StudyStatsOverview />
      </div>
      
      {/* Detailed Study Statistics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <StudyStatsCard />
        
        {/* Learning Progress Card */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-semibold flex items-center gap-2">
              <Target className="h-5 w-5 text-blue-600" />
              Learning Progress
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-center py-6">
              <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-2" />
              <p className="text-gray-600 text-sm">
                Start studying to see your learning progress here
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
