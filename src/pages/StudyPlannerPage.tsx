
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Plus, BookOpen, Target, Clock, Calendar } from 'lucide-react';
import { StudyPlannerHeader } from '@/components/study-planner/StudyPlannerHeader';
import { CreateStudyPlanForm } from '@/components/study-planner/CreateStudyPlanForm';
import { ActiveStudyPlans } from '@/components/study-planner/ActiveStudyPlans';
import { CompletedStudyPlans } from '@/components/study-planner/CompletedStudyPlans';
import { StudyPlannerStats } from '@/components/study-planner/StudyPlannerStats';

export default function StudyPlannerPage() {
  const [activeTab, setActiveTab] = useState('overview');
  const [showCreateForm, setShowCreateForm] = useState(false);

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      <StudyPlannerHeader />
      
      <StudyPlannerStats />

      <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-8">
        <div className="flex items-center justify-between mb-6">
          <TabsList className="grid w-full max-w-md grid-cols-3">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="active">Active Plans</TabsTrigger>
            <TabsTrigger value="completed">Completed</TabsTrigger>
          </TabsList>
          
          <Button 
            onClick={() => setShowCreateForm(true)}
            className="bg-mint-600 hover:bg-mint-700 text-white"
          >
            <Plus className="h-4 w-4 mr-2" />
            Create Study Plan
          </Button>
        </div>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card className="border-mint-200">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center text-mint-700">
                  <BookOpen className="h-5 w-5 mr-2" />
                  Getting Started
                </CardTitle>
                <CardDescription>
                  Create your first study plan to organize your learning journey
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button 
                  onClick={() => setShowCreateForm(true)}
                  className="w-full bg-mint-100 text-mint-700 hover:bg-mint-200"
                  variant="secondary"
                >
                  Start Planning
                </Button>
              </CardContent>
            </Card>

            <Card className="border-blue-200">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center text-blue-700">
                  <Target className="h-5 w-5 mr-2" />
                  Set Goals
                </CardTitle>
                <CardDescription>
                  Convert your study plans to trackable goals
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button variant="outline" className="w-full border-blue-200 text-blue-700 hover:bg-blue-50">
                  View Goals
                </Button>
              </CardContent>
            </Card>

            <Card className="border-purple-200">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center text-purple-700">
                  <Clock className="h-5 w-5 mr-2" />
                  Track Progress
                </CardTitle>
                <CardDescription>
                  Monitor your study sessions and achievements
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button variant="outline" className="w-full border-purple-200 text-purple-700 hover:bg-purple-50">
                  View Analytics
                </Button>
              </CardContent>
            </Card>
          </div>

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
  );
}
