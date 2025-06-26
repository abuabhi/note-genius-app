
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useStudyPlanSessions } from '@/hooks/useStudyPlanSessions';
import { SchedulingInsightsDashboard } from './SchedulingInsightsDashboard';
import { SmartSchedulingSuggestions } from './SmartSchedulingSuggestions';
import { SessionOrchestrator } from './SessionOrchestrator';
import { AdaptiveLearningDashboard } from './AdaptiveLearningDashboard';
import { Brain, Calendar, Zap, TrendingUp } from 'lucide-react';

const StudySessionsPage = () => {
  const { sessions, startSession, completeSession, rescheduleSession } = useStudyPlanSessions();
  const [selectedStudyPlan] = useState(null); // This would come from route params or selection

  const handleApplyRecommendation = async (
    sessionId: string, 
    newDate: string, 
    newStartTime: string, 
    newEndTime: string
  ) => {
    try {
      await rescheduleSession({
        sessionId,
        newDate,
        newStartTime,
        newEndTime,
      });
    } catch (error) {
      console.error('Failed to apply recommendation:', error);
    }
  };

  const handleGenerateOptimalSchedule = () => {
    // This would integrate with the smart scheduling system
    console.log('Generating optimal schedule...');
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Adaptive Study Sessions</h1>
          <p className="text-gray-600 mt-2">
            AI-powered learning that adapts to your performance in real-time
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Calendar className="h-4 w-4 mr-2" />
            Schedule
          </Button>
          <Button size="sm">
            <Brain className="h-4 w-4 mr-2" />
            Start Session
          </Button>
        </div>
      </div>

      <Tabs defaultValue="dashboard" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="dashboard" className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            Live Dashboard
          </TabsTrigger>
          <TabsTrigger value="orchestrator" className="flex items-center gap-2">
            <Zap className="h-4 w-4" />
            Smart Orchestration
          </TabsTrigger>
          <TabsTrigger value="insights" className="flex items-center gap-2">
            <Brain className="h-4 w-4" />
            Performance Insights
          </TabsTrigger>
          <TabsTrigger value="scheduling" className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            Smart Scheduling
          </TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard" className="space-y-6">
          <AdaptiveLearningDashboard />
        </TabsContent>

        <TabsContent value="orchestrator" className="space-y-6">
          <SessionOrchestrator />
        </TabsContent>

        <TabsContent value="insights" className="space-y-6">
          <SchedulingInsightsDashboard />
        </TabsContent>

        <TabsContent value="scheduling" className="space-y-6">
          {selectedStudyPlan ? (
            <SmartSchedulingSuggestions
              plan={selectedStudyPlan}
              sessions={sessions}
              onApplyRecommendation={handleApplyRecommendation}
              onGenerateOptimalSchedule={handleGenerateOptimalSchedule}
            />
          ) : (
            <Card>
              <CardContent className="p-6 text-center">
                <Calendar className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Select a Study Plan
                </h3>
                <p className="text-gray-600">
                  Choose a study plan to see smart scheduling suggestions
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default StudySessionsPage;
