import { useState } from 'react';
import { useRequireAuth } from '@/hooks/useRequireAuth';
import { useStudyPlanner } from '@/hooks/useStudyPlanner';
import { useGoalsStats } from '@/hooks/useGoalsStats';
import { useStudyPlanSessions } from '@/hooks/useStudyPlanSessions';
import { StudyPlannerWizard } from '@/components/study-planner/StudyPlannerWizard';
import { StudyPlansGrid } from '@/components/study-planner/StudyPlansGrid';
import { StandardPageHeader } from '@/components/ui/StandardPageHeader';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus, Calendar, Target, TrendingUp, Play } from 'lucide-react';
import { Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const StudyPlannerPage = () => {
  const { user, loading } = useRequireAuth();
  const [showWizard, setShowWizard] = useState(false);
  const navigate = useNavigate();
  
  const {
    studyPlans,
    plansLoading,
    createPlan,
    generateSessions,
    convertToGoals,
    isCreating,
    isGenerating,
    isConverting,
  } = useStudyPlanner();

  const { data: goalsStats } = useGoalsStats();
  const { sessionStats } = useStudyPlanSessions();

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

  const handleCreatePlan = async (formData: any) => {
    try {
      await createPlan(formData);
      setShowWizard(false);
    } catch (error) {
      console.error('Failed to create plan:', error);
    }
  };

  const breadcrumbs = [
    { label: "Study Planner" }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-mint-50/30 via-white to-blue-50/30">
      <StandardPageHeader
        title="Study Planner"
        description="Create personalized study plans and convert them to trackable goals"
        icon={<Calendar className="h-6 w-6 text-white" />}
        breadcrumbs={breadcrumbs}
      />
      
      <div className="container mx-auto px-6 py-8">
        <div className="bg-white/60 backdrop-blur-sm rounded-xl border border-mint-100 p-6 shadow-lg">
          
          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-mint-50 p-4 rounded-lg border border-mint-100">
              <div className="flex items-center">
                <Target className="h-8 w-8 text-mint-600 mr-3" />
                <div>
                  <div className="text-2xl font-bold text-mint-700">
                    {studyPlans?.length || 0}
                  </div>
                  <div className="text-sm text-mint-600">Study Plans</div>
                </div>
              </div>
            </div>
            
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
              <div className="flex items-center">
                <Calendar className="h-8 w-8 text-blue-600 mr-3" />
                <div>
                  <div className="text-2xl font-bold text-blue-700">
                    {studyPlans?.filter(p => p.status === 'active').length || 0}
                  </div>
                  <div className="text-sm text-blue-600">Active Plans</div>
                </div>
              </div>
            </div>
            
            <div className="bg-green-50 p-4 rounded-lg border border-green-100">
              <div className="flex items-center">
                <TrendingUp className="h-8 w-8 text-green-600 mr-3" />
                <div>
                  <div className="text-2xl font-bold text-green-700">
                    {goalsStats?.goalsFromPlans || 0}
                  </div>
                  <div className="text-sm text-green-600">Goals Created</div>
                </div>
              </div>
            </div>

            <div 
              className="bg-purple-50 p-4 rounded-lg border border-purple-100 cursor-pointer hover:bg-purple-100 transition-colors"
              onClick={() => navigate('/study-sessions')}
            >
              <div className="flex items-center">
                <Play className="h-8 w-8 text-purple-600 mr-3" />
                <div>
                  <div className="text-2xl font-bold text-purple-700">
                    {sessionStats.total}
                  </div>
                  <div className="text-sm text-purple-600">Sessions Generated</div>
                </div>
              </div>
            </div>
          </div>

          {/* Header Actions */}
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Your Study Plans</h2>
              <p className="text-gray-600">Create and manage your personalized study schedules</p>
            </div>
            
            <div className="flex gap-3">
              {sessionStats.total > 0 && (
                <Button
                  variant="outline"
                  onClick={() => navigate('/study-sessions')}
                  className="border-purple-200 text-purple-700 hover:bg-purple-50"
                >
                  <Play className="h-4 w-4 mr-2" />
                  View Sessions
                </Button>
              )}
              
              <Dialog open={showWizard} onOpenChange={setShowWizard}>
                <DialogTrigger asChild>
                  <Button className="bg-mint-500 hover:bg-mint-600 text-white shadow-lg hover:shadow-xl transition-all">
                    <Plus className="h-4 w-4 mr-2" />
                    Create Study Plan
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>Create New Study Plan</DialogTitle>
                  </DialogHeader>
                  <StudyPlannerWizard
                    onSubmit={handleCreatePlan}
                    isLoading={isCreating}
                  />
                </DialogContent>
              </Dialog>
            </div>
          </div>

          {/* Plans Content */}
          {plansLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-mint-500" />
            </div>
          ) : (
            <StudyPlansGrid
              plans={studyPlans || []}
              onGenerateSessions={generateSessions}
              onConvertToGoals={convertToGoals}
              isGenerating={isGenerating}
              isConverting={isConverting}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default StudyPlannerPage;
