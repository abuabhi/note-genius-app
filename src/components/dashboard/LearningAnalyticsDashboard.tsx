
import { AnalyticsSection } from "./AnalyticsSection";
import { NotificationSettingsPanel } from "./NotificationSettingsPanel";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useUltraSimpleAnalytics } from "@/hooks/useUltraSimpleAnalytics";
import { BookOpen, Target, TrendingUp, Zap, ArrowRight } from "lucide-react";

const GettingStartedCard = () => {
  const navigate = useNavigate();

  return (
    <Card className="bg-gradient-to-br from-mint-50 to-blue-50 border-mint-200 shadow-sm">
      <CardHeader className="text-center pb-4">
        <div className="mx-auto w-16 h-16 bg-mint-100 rounded-full flex items-center justify-center mb-4">
          <TrendingUp className="h-8 w-8 text-mint-600" />
        </div>
        <CardTitle className="text-2xl font-bold text-mint-800">
          Your Learning Analytics Await!
        </CardTitle>
        <p className="text-mint-600 mt-2">
          Start studying to see your progress, streaks, and achievements tracked here.
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center p-4 bg-white/60 rounded-lg border border-mint-100">
            <BookOpen className="h-8 w-8 text-blue-600 mx-auto mb-2" />
            <h3 className="font-semibold text-gray-800">Study Sessions</h3>
            <p className="text-sm text-gray-600 mt-1">Track time spent learning</p>
          </div>
          <div className="text-center p-4 bg-white/60 rounded-lg border border-mint-100">
            <Target className="h-8 w-8 text-mint-600 mx-auto mb-2" />
            <h3 className="font-semibold text-gray-800">Goals & Progress</h3>
            <p className="text-sm text-gray-600 mt-1">Monitor your achievements</p>
          </div>
          <div className="text-center p-4 bg-white/60 rounded-lg border border-mint-100">
            <Zap className="h-8 w-8 text-yellow-600 mx-auto mb-2" />
            <h3 className="font-semibold text-gray-800">Streaks & Habits</h3>
            <p className="text-sm text-gray-600 mt-1">Build consistent learning</p>
          </div>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button 
            onClick={() => navigate('/flashcards')}
            className="bg-mint-500 hover:bg-mint-600 text-white flex items-center gap-2"
          >
            Browse Flashcard Sets
            <ArrowRight className="h-4 w-4" />
          </Button>
          <Button 
            variant="outline"
            onClick={() => navigate('/flashcards/create')}
            className="border-mint-200 hover:bg-mint-50 text-mint-700"
          >
            Create Your First Set
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export const LearningAnalyticsDashboard = () => {
  const { analytics, isLoading } = useUltraSimpleAnalytics();

  // Check if user has any meaningful study data
  const hasStudyData = !isLoading && (
    analytics.totalSessions > 0 || 
    analytics.totalStudyTime > 0 || 
    analytics.totalSets > 0 ||
    analytics.totalNotes > 0
  );

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse bg-mint-50 h-48 rounded-lg border border-mint-200"></div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="animate-pulse bg-mint-50 h-32 rounded-lg border border-mint-200"></div>
          <div className="animate-pulse bg-mint-50 h-32 rounded-lg border border-mint-200"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Getting Started or Analytics */}
      {hasStudyData ? (
        <div className="space-y-6">
          {/* Analytics */}
          <div>
            <AnalyticsSection />
          </div>
          
          {/* Notification Settings */}
          <div>
            <NotificationSettingsPanel />
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Getting Started */}
          <GettingStartedCard />
          
          {/* Notification Settings (always show) */}
          <div>
            <NotificationSettingsPanel />
          </div>
        </div>
      )}
    </div>
  );
};
