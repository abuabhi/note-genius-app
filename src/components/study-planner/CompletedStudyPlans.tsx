
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { BookOpen, Calendar, Clock, CheckCircle, Trash2 } from 'lucide-react';
import { useCompletedStudyPlans } from '@/hooks/useCompletedStudyPlans';
import { useDeleteStudyPlan } from '@/hooks/useDeleteStudyPlan';
import { StudyPlan } from '@/types/studyPlanner';
import { UnifiedDeleteDialog } from '@/components/ui/unified/UnifiedDeleteDialog';

export const CompletedStudyPlans = () => {
  const { studyPlans, isLoading } = useCompletedStudyPlans();

  if (isLoading) {
    return (
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Completed Study Plans</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(3)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-6 bg-gray-200 rounded mb-4"></div>
                <div className="h-4 bg-gray-200 rounded mb-2"></div>
                <div className="h-4 bg-gray-200 rounded mb-4"></div>
                <div className="h-8 bg-gray-200 rounded"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (studyPlans.length === 0) {
    return (
      <div className="text-center py-12">
        <CheckCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">No Completed Study Plans</h3>
        <p className="text-gray-600">Complete your first study plan to see it here.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">Completed Study Plans</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {studyPlans.map((plan) => (
          <CompletedStudyPlanCard key={plan.id} plan={plan} />
        ))}
      </div>
    </div>
  );
};

const CompletedStudyPlanCard = ({ plan }: { plan: StudyPlan }) => {
  const { deleteStudyPlan, isLoading: isDeleting } = useDeleteStudyPlan();
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  
  const completedDate = new Date(plan.updated_at);
  const formattedDate = completedDate.toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  });

  const handleDeletePlan = async () => {
    await deleteStudyPlan(plan.id);
  };

  return (
    <Card className="border-green-200 bg-gradient-to-br from-green-50/30 to-white shadow-sm hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-lg text-green-700 mb-1 flex items-center">
              <CheckCircle className="h-5 w-5 mr-2" />
              {plan.title}
            </CardTitle>
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="bg-green-100 text-green-700">
                {plan.subject}
              </Badge>
              {plan.topic && (
                <Badge variant="outline" className="text-xs border-green-300 text-green-600">
                  {plan.topic}
                </Badge>
              )}
            </div>
          </div>
          <Button
            onClick={() => setShowDeleteDialog(true)}
            variant="outline"
            size="sm"
            disabled={isDeleting}
            className="border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300 transition-all duration-200 rounded-lg h-8 w-8 p-0"
          >
            <Trash2 className="h-3 w-3" />
          </Button>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="flex items-center text-gray-600">
            <Calendar className="h-4 w-4 mr-2 text-green-500" />
            <span>Completed {formattedDate}</span>
          </div>
          <div className="flex items-center text-gray-600">
            <Clock className="h-4 w-4 mr-2 text-green-500" />
            <span>{plan.total_duration_hours}h studied</span>
          </div>
        </div>

        <div className="flex items-center justify-between text-sm text-gray-600 pt-2 border-t border-green-100">
          <span>{plan.sessions_completed} sessions completed</span>
          <span>{plan.topic ? '1 topic' : '0 topics'} mastered</span>
        </div>

        <div className="bg-green-100 p-3 rounded-lg">
          <p className="text-sm text-green-800 font-medium">
            🎉 Plan completed with {plan.completion_percentage}% success rate!
          </p>
        </div>
      </CardContent>

      {/* Delete Confirmation Dialog */}
      <UnifiedDeleteDialog
        isOpen={showDeleteDialog}
        onClose={() => setShowDeleteDialog(false)}
        onConfirm={handleDeletePlan}
        title="Delete Completed Study Plan"
        itemName={plan.title}
        itemType="study plan"
        description={`Are you sure you want to delete "${plan.title}"? This will permanently remove the completed study plan and all associated data.`}
      />
    </Card>
  );
};
