
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Plus, Calendar, TrendingUp, Clock, Users } from 'lucide-react';
import { StandardPageHeader } from '@/components/ui/StandardPageHeader';
import { CreateStudyPlanForm } from '@/components/study-planner/CreateStudyPlanForm';
import { ActiveStudyPlans } from '@/components/study-planner/ActiveStudyPlans';
import { CompletedStudyPlans } from '@/components/study-planner/CompletedStudyPlans';
import { StudyPlannerStats } from '@/components/study-planner/StudyPlannerStats';

export default function StudyPlannerPage() {
  const [activeTab, setActiveTab] = useState('overview');
  const [showCreateForm, setShowCreateForm] = useState(false);

  return (
    <div className="min-h-screen bg-gradient-to-br from-mint-50/30 via-white to-blue-50/30">
      <StandardPageHeader
        title="Study Planner"
        description="Create personalized study schedules, track your progress, and achieve your learning goals with intelligent planning."
        icon={<Calendar className="h-6 w-6 text-white" />}
        breadcrumbs={[{ label: "Study Planner" }]}
        actions={
          <Button 
            onClick={() => setShowCreateForm(true)}
            className="bg-mint-600 hover:bg-mint-700 text-white"
          >
            <Plus className="h-4 w-4 mr-2" />
            Create Study Plan
          </Button>
        }
      />

      <div className="container mx-auto px-6 py-8 max-w-7xl">
        {/* Compact Stats Overview */}
        <div className="mb-8">
          <StudyPlannerStats />
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <div className="flex items-center justify-between">
            <TabsList className="grid w-full max-w-md grid-cols-3 bg-white border border-mint-200">
              <TabsTrigger 
                value="overview" 
                className="data-[state=active]:bg-mint-100 data-[state=active]:text-mint-700"
              >
                Overview
              </TabsTrigger>
              <TabsTrigger 
                value="active"
                className="data-[state=active]:bg-mint-100 data-[state=active]:text-mint-700"
              >
                Active Plans
              </TabsTrigger>
              <TabsTrigger 
                value="completed"
                className="data-[state=active]:bg-mint-100 data-[state=active]:text-mint-700"
              >
                Completed
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="overview" className="space-y-6">
            {/* Quick Action Card */}
            <Card className="border-mint-200 bg-gradient-to-br from-mint-50 to-blue-50">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-2">
                    <h3 className="text-xl font-semibold text-mint-800">Ready to start planning?</h3>
                    <p className="text-mint-600">Create your first study plan and begin your learning journey.</p>
                  </div>
                  <Button 
                    onClick={() => setShowCreateForm(true)}
                    size="lg"
                    className="bg-mint-600 hover:bg-mint-700 text-white px-6"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Create Study Plan
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card className="border-mint-200 hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-mint-100 rounded-lg">
                      <Calendar className="h-5 w-5 text-mint-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Active Plans</p>
                      <p className="text-xl font-semibold text-mint-800">3</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-blue-200 hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <TrendingUp className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Completed</p>
                      <p className="text-xl font-semibold text-blue-800">12</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-purple-200 hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-purple-100 rounded-lg">
                      <Clock className="h-5 w-5 text-purple-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Hours This Week</p>
                      <p className="text-xl font-semibold text-purple-800">24</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-orange-200 hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-orange-100 rounded-lg">
                      <Users className="h-5 w-5 text-orange-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Study Streak</p>
                      <p className="text-xl font-semibold text-orange-800">7 days</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Recent Activity Preview */}
            <ActiveStudyPlans showAll={false} />
          </TabsContent>

          <TabsContent value="active">
            <ActiveStudyPlans showAll={true} />
          </TabsContent>

          <TabsContent value="completed">
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
