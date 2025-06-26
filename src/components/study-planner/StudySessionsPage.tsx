
import React, { useState } from 'react';
import { useRequireAuth } from '@/hooks/useRequireAuth';
import { useStudyPlanSessions } from '@/hooks/useStudyPlanSessions';
import { useStudyPlanner } from '@/hooks/useStudyPlanner';
import { StudySessionsGrid } from './StudySessionsGrid';
import { StudySessionsCalendar } from './StudySessionsCalendar';
import { SmartSchedulingSuggestions } from './SmartSchedulingSuggestions';
import { SchedulingInsightsDashboard } from './SchedulingInsightsDashboard';
import { SessionLinkingDialog } from './SessionLinkingDialog';
import { StandardPageHeader } from '@/components/ui/StandardPageHeader';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Calendar, Grid, Brain, BarChart3, Loader2, Link } from 'lucide-react';
import { StudyPlanSession } from '@/types/studyPlanner';

const StudySessionsPage = () => {
  const { user, loading } = useRequireAuth();
  const [viewMode, setViewMode] = useState<'grid' | 'calendar'>('grid');
  const [selectedSession, setSelectedSession] = useState<StudyPlanSession | null>(null);
  const [isLinkingDialogOpen, setIsLinkingDialogOpen] = useState(false);

  const {
    sessions,
    sessionStats,
    isLoading: sessionsLoading,
    startSession,
    completeSession,
    rescheduleSession,
    isStarting,
    isCompleting,
  } = useStudyPlanSessions();

  const { studyPlans } = useStudyPlanner();

  const handleSessionClick = (session: StudyPlanSession) => {
    setSelectedSession(session);
  };

  const handleLinkSession = (session: StudyPlanSession) => {
    setSelectedSession(session);
    setIsLinkingDialogOpen(true);
  };

  const handleRescheduleSession = async (sessionId: string) => {
    // This would open a rescheduling dialog in a real implementation
    console.log('Reschedule session:', sessionId);
  };

  const handleApplyRecommendation = async (
    sessionId: string,
    newDate: string,
    newStartTime: string,
    newEndTime: string
  ) => {
    await rescheduleSession(sessionId, newDate, newStartTime, newEndTime);
  };

  const handleGenerateOptimalSchedule = () => {
    // This would regenerate the entire schedule with AI optimization
    console.log('Generate optimal schedule');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-mint-50/30 via-white to-blue-50/30">
        <div className="container mx-auto p-4 md:p-6">
          <div className="flex items-center justify-center h-[80vh]">
            <Loader2 className="h-8 w-8 animate-spin text-mint-500" />
          </div>
        </div>
      </div>
    );
  }

  if (!user) return null;

  const currentPlan = studyPlans?.[0]; // For demo, use first plan

  return (
    <div className="min-h-screen bg-gradient-to-br from-mint-50/30 via-white to-blue-50/30">
      <StandardPageHeader
        title="Study Sessions"
        description="Manage your study sessions with AI-powered scheduling recommendations"
        icon={<Calendar className="h-6 w-6 text-white" />}
        breadcrumbs={[{ label: "Study Sessions" }]}
      />
      
      <div className="container mx-auto px-6 py-8">
        <div className="bg-white/60 backdrop-blur-sm rounded-xl border border-mint-100 p-6 shadow-lg">
          
          {/* Stats Header */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-mint-50 p-4 rounded-lg border border-mint-100">
              <div className="flex items-center">
                <Calendar className="h-8 w-8 text-mint-600 mr-3" />
                <div>
                  <div className="text-2xl font-bold text-mint-700">
                    {sessionStats.total}
                  </div>
                  <div className="text-sm text-mint-600">Total Sessions</div>
                </div>
              </div>
            </div>
            
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
              <div className="flex items-center">
                <Grid className="h-8 w-8 text-blue-600 mr-3" />
                <div>
                  <div className="text-2xl font-bold text-blue-700">
                    {sessionStats.completed}
                  </div>
                  <div className="text-sm text-blue-600">Completed</div>
                </div>
              </div>
            </div>
            
            <div className="bg-green-50 p-4 rounded-lg border border-green-100">
              <div className="flex items-center">
                <BarChart3 className="h-8 w-8 text-green-600 mr-3" />
                <div>
                  <div className="text-2xl font-bold text-green-700">
                    {sessionStats.active}
                  </div>
                  <div className="text-sm text-green-600">Active</div>
                </div>
              </div>
            </div>

            <div className="bg-purple-50 p-4 rounded-lg border border-purple-100">
              <div className="flex items-center">
                <Brain className="h-8 w-8 text-purple-600 mr-3" />
                <div>
                  <div className="text-2xl font-bold text-purple-700">
                    AI
                  </div>
                  <div className="text-sm text-purple-600">Smart Scheduling</div>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content Tabs */}
          <Tabs defaultValue="sessions" className="space-y-6">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="sessions" className="flex items-center gap-2">
                <Grid className="h-4 w-4" />
                Sessions
              </TabsTrigger>
              <TabsTrigger value="calendar" className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Calendar
              </TabsTrigger>
              <TabsTrigger value="ai-recommendations" className="flex items-center gap-2">
                <Brain className="h-4 w-4" />
                AI Recommendations
              </TabsTrigger>
              <TabsTrigger value="insights" className="flex items-center gap-2">
                <BarChart3 className="h-4 w-4" />
                Insights
              </TabsTrigger>
            </TabsList>

            <TabsContent value="sessions" className="space-y-6">
              {sessionsLoading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-mint-500" />
                </div>
              ) : (
                <StudySessionsGrid
                  sessions={sessions}
                  onStartSession={startSession}
                  onCompleteSession={completeSession}
                  onRescheduleSession={handleRescheduleSession}
                  onSessionClick={handleSessionClick}
                  onLinkSession={handleLinkSession}
                  isStarting={isStarting}
                  isCompleting={isCompleting}
                />
              )}
            </TabsContent>

            <TabsContent value="calendar" className="space-y-6">
              <div className="h-[600px]">
                <StudySessionsCalendar
                  sessions={sessions}
                  onSessionClick={handleSessionClick}
                />
              </div>
            </TabsContent>

            <TabsContent value="ai-recommendations" className="space-y-6">
              {currentPlan ? (
                <SmartSchedulingSuggestions
                  plan={currentPlan}
                  sessions={sessions}
                  onApplyRecommendation={handleApplyRecommendation}
                  onGenerateOptimalSchedule={handleGenerateOptimalSchedule}
                />
              ) : (
                <div className="text-center py-12">
                  <Brain className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    No Study Plan Found
                  </h3>
                  <p className="text-gray-600">
                    Create a study plan first to get AI-powered scheduling recommendations.
                  </p>
                </div>
              )}
            </TabsContent>

            <TabsContent value="insights" className="space-y-6">
              <SchedulingInsightsDashboard />
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {/* Session Linking Dialog */}
      <SessionLinkingDialog
        session={selectedSession}
        isOpen={isLinkingDialogOpen}
        onClose={() => {
          setIsLinkingDialogOpen(false);
          setSelectedSession(null);
        }}
      />
    </div>
  );
};

export default StudySessionsPage;
