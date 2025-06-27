
import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Plus, Calendar, TrendingUp, Clock } from 'lucide-react';
import { StandardPageHeader } from '@/components/ui/StandardPageHeader';
import { CreateStudyPlanForm } from '@/components/study-planner/CreateStudyPlanForm';
import { ActiveStudyPlans } from '@/components/study-planner/ActiveStudyPlans';
import { CompletedStudyPlans } from '@/components/study-planner/CompletedStudyPlans';
import { useActiveStudyPlans } from '@/hooks/useActiveStudyPlans';
import { useCompletedStudyPlans } from '@/hooks/useCompletedStudyPlans';
import { useStudyPlannerAnalytics } from '@/hooks/useStudyPlannerAnalytics';

export default function StudyPlannerPage() {
  const [activeTab, setActiveTab] = useState('plans');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const { studyPlans: activePlans, isLoading: activeLoading } = useActiveStudyPlans();
  const { studyPlans: completedPlans, isLoading: completedLoading } = useCompletedStudyPlans();
  const { analytics, isLoading: analyticsLoading } = useStudyPlannerAnalytics(); // General analytics

  const totalActivePlans = activePlans.length;
  const totalCompletedPlans = completedPlans.length;

  // Format time display
  const formatTime = (minutes: number) => {
    if (minutes < 60) {
      return `${minutes}m`;
    }
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-mint-50/30 via-white to-blue-50/30">
      <StandardPageHeader
        title="Study Planner"
        description="Create personalized study schedules and track your learning progress with intelligent planning."
        icon={<Calendar className="h-6 w-6 text-white" />}
        breadcrumbs={[{ label: "Study Planner" }]}
        actions={
          <Button 
            onClick={() => setShowCreateForm(true)}
            className="bg-mint-600 hover:bg-mint-700 text-white shadow-md hover:shadow-lg transition-all"
          >
            <Plus className="h-4 w-4 mr-2" />
            Create Study Plan
          </Button>
        }
      />

      <div className="container mx-auto px-6 py-8 max-w-7xl">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <div className="flex items-center justify-between">
            <TabsList className="grid w-full max-w-md grid-cols-2 bg-white/80 backdrop-blur-sm border border-mint-200 shadow-sm">
              <TabsTrigger 
                value="plans" 
                className="data-[state=active]:bg-mint-500 data-[state=active]:text-white data-[state=active]:shadow-md transition-all"
              >
                Plans ({totalActivePlans})
              </TabsTrigger>
              <TabsTrigger 
                value="completed"
                className="data-[state=active]:bg-mint-500 data-[state=active]:text-white data-[state=active]:shadow-md transition-all"
              >
                Completed ({totalCompletedPlans})
              </TabsTrigger>
            </TabsList>
          </div>

          {/* Enhanced Stats with Clean Data */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card className="border-mint-200 hover:shadow-md transition-shadow bg-white/80 backdrop-blur-sm">
              <CardContent className="p-4">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-mint-100 rounded-lg">
                    <Calendar className="h-5 w-5 text-mint-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Active Plans</p>
                    <p className="text-2xl font-semibold text-mint-800">
                      {activeLoading ? '...' : totalActivePlans}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-blue-200 hover:shadow-md transition-shadow bg-white/80 backdrop-blur-sm">
              <CardContent className="p-4">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <TrendingUp className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Completed</p>
                    <p className="text-2xl font-semibold text-blue-800">
                      {completedLoading ? '...' : totalCompletedPlans}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-purple-200 hover:shadow-md transition-shadow bg-white/80 backdrop-blur-sm">
              <CardContent className="p-4">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <Clock className="h-5 w-5 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Today's Study</p>
                    <p className="text-2xl font-semibold text-purple-800">
                      {analyticsLoading ? '...' : formatTime(analytics.todaySessionTime)}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-green-200 hover:shadow-md transition-shadow bg-white/80 backdrop-blur-sm">
              <CardContent className="p-4">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <TrendingUp className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Total Sessions</p>
                    <p className="text-2xl font-semibold text-green-800">
                      {analyticsLoading ? '...' : analytics.totalSessions}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <TabsContent value="plans" className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-medium text-gray-900">My Study Plans</h2>
            </div>
            <ActiveStudyPlans showAll={true} />
          </TabsContent>

          <TabsContent value="completed" className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-medium text-gray-900">Completed Plans</h2>
            </div>
            <CompletedStudyPlans />
          </TabsContent>
        </Tabs>

        {showCreateForm && (
          <CreateStudyPlanForm 
            open={showCreateForm}
            onClose={() => setShowCreateForm(false)}
          />
        )}
      </div>
    </div>
  );
}
