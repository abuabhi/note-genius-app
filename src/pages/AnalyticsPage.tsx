
import { useState } from "react";
import { useRequireAuth } from "@/hooks/useRequireAuth";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BarChart3, TrendingUp, History, Target, Trophy, FileText, Brain } from "lucide-react";
import { EnhancedSubjectProgressDashboard } from "@/components/analytics/EnhancedSubjectProgressDashboard";
import { StandardPageHeader } from "@/components/ui/StandardPageHeader";
import { NotesAnalytics } from "@/components/analytics/redesigned/NotesAnalytics";
import { FlashcardsAnalytics } from "@/components/analytics/redesigned/FlashcardsAnalytics";
import { QuizAnalytics } from "@/components/analytics/redesigned/QuizAnalytics";
import { EnhancedSessionHistory } from "@/components/analytics/redesigned/EnhancedSessionHistory";
import { OptimizedStudyAchievements } from "@/components/analytics/redesigned/OptimizedStudyAchievements";
import { StudySessionChart } from "@/components/analytics/charts/StudySessionChart";
import { FlashcardProvider } from "@/contexts/FlashcardContext";
import { Helmet } from 'react-helmet';

const AnalyticsPage = () => {
  const { user, loading } = useRequireAuth();
  const [activeTab, setActiveTab] = useState("subjects");

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-mint-50/30 via-white to-blue-50/30">
        <div className="container mx-auto p-4 md:p-6">
          <div className="flex items-center justify-center h-[80vh]">
            <div className="relative w-12 h-12">
              <div className="absolute inset-0 border-4 border-mint-100 rounded-full"></div>
              <div className="absolute inset-0 border-4 border-mint-500 rounded-full border-t-transparent animate-spin"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const breadcrumbs = [
    { label: "Analytics" }
  ];

  return (
    <FlashcardProvider>
      <Helmet>
        <meta name="robots" content="noindex,nofollow" />
      </Helmet>
      <div className="min-h-screen bg-gradient-to-br from-mint-50/30 via-white to-blue-50/30">
        <StandardPageHeader
          title="Learning Analytics"
          description="Track your progress across subjects, content types, and study sessions with AI-powered insights"
          icon={<BarChart3 className="h-6 w-6 text-white" />}
          breadcrumbs={breadcrumbs}
        />
        
        <div className="container mx-auto px-6 py-8">
          {/* Analytics Content */}
          <div className="bg-white/60 backdrop-blur-sm rounded-xl border border-mint-100 p-6 shadow-lg">
            <Tabs defaultValue="subjects" value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-4 md:w-auto md:inline-flex bg-mint-50 border border-mint-200">
                <TabsTrigger 
                  value="subjects" 
                  className="data-[state=active]:bg-mint-500 data-[state=active]:text-white"
                >
                  <Target className="h-4 w-4 mr-2" />
                  Subject Analytics
                </TabsTrigger>
                <TabsTrigger 
                  value="overview" 
                  className="data-[state=active]:bg-mint-500 data-[state=active]:text-white"
                >
                  <TrendingUp className="h-4 w-4 mr-2" />
                  Content Overview
                </TabsTrigger>
                <TabsTrigger 
                  value="sessions"
                  className="data-[state=active]:bg-mint-500 data-[state=active]:text-white"
                >
                  <History className="h-4 w-4 mr-2" />
                  Study Sessions
                </TabsTrigger>
                <TabsTrigger 
                  value="achievements"
                  className="data-[state=active]:bg-mint-500 data-[state=active]:text-white"
                >
                  <Trophy className="h-4 w-4 mr-2" />
                  Achievements
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="subjects" className="mt-6">
                <div className="error-boundary">
                  <EnhancedSubjectProgressDashboard />
                </div>
              </TabsContent>
              
              <TabsContent value="overview" className="mt-6">
                <div className="space-y-8">
                  {/* Content Type Navigation */}
                  <div className="flex flex-wrap gap-4 p-4 bg-mint-50 rounded-lg border border-mint-200">
                    <div className="flex items-center gap-2 text-mint-700">
                      <FileText className="h-5 w-5" />
                      <span className="font-medium">Notes</span>
                    </div>
                    <div className="w-px h-6 bg-mint-300"></div>
                    <div className="flex items-center gap-2 text-blue-700">
                      <Brain className="h-5 w-5" />
                      <span className="font-medium">Flashcards</span>
                    </div>
                    <div className="w-px h-6 bg-mint-300"></div>
                    <div className="flex items-center gap-2 text-purple-700">
                      <BarChart3 className="h-5 w-5" />
                      <span className="font-medium">Quizzes</span>
                    </div>
                  </div>

                  {/* Notes Analytics */}
                  <div>
                    <h3 className="text-xl font-semibold text-mint-900 mb-4 flex items-center gap-2">
                      <FileText className="h-5 w-5 text-mint-600" />
                      Notes Analytics
                    </h3>
                    <NotesAnalytics />
                  </div>

                  {/* Flashcards Analytics */}
                  <div>
                    <h3 className="text-xl font-semibold text-blue-900 mb-4 flex items-center gap-2">
                      <Brain className="h-5 w-5 text-blue-600" />
                      Flashcards Analytics
                    </h3>
                    <FlashcardsAnalytics />
                  </div>

                  {/* Quiz Analytics */}
                  <div>
                    <h3 className="text-xl font-semibold text-purple-900 mb-4 flex items-center gap-2">
                      <BarChart3 className="h-5 w-5 text-purple-600" />
                      Quiz Analytics
                    </h3>
                    <QuizAnalytics />
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="sessions" className="mt-6">
                <div className="space-y-6">
                  {/* Study Sessions Chart */}
                  <StudySessionChart />
                  
                  {/* Session History */}
                  <EnhancedSessionHistory />
                </div>
              </TabsContent>
              
              <TabsContent value="achievements" className="mt-6">
                <OptimizedStudyAchievements />
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </FlashcardProvider>
  );
};

export default AnalyticsPage;
