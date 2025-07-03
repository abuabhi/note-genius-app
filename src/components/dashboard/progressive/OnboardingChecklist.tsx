import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle, Circle, FileText, CreditCard, HelpCircle, Target, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/auth/useAuth";
import { useLearningToolkit } from "@/hooks/useLearningToolkit";

export const OnboardingChecklist = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { totalNotes, totalFlashcardSets, totalQuizzes, totalGoals } = useLearningToolkit();

  const checklistItems = [
    {
      id: 'profile',
      title: 'Complete Profile Setup',
      description: 'Set up your account and preferences',
      completed: !!user, // Assume completed if user exists
      icon: CheckCircle,
      action: () => navigate('/settings'),
      actionText: 'View Settings'
    },
    {
      id: 'note',
      title: 'Create Your First Note',
      description: 'Start building your knowledge base',
      completed: totalNotes > 0,
      icon: FileText,
      action: () => navigate('/notes'),
      actionText: 'Create Note'
    },
    {
      id: 'flashcards',
      title: 'Make Your First Flashcard Set',
      description: 'Build interactive study materials',
      completed: totalFlashcardSets > 0,
      icon: CreditCard,
      action: () => navigate('/flashcards/create'),
      actionText: 'Create Flashcards'
    },
    {
      id: 'quiz',
      title: 'Take Your First Quiz',
      description: 'Test your knowledge and track progress',
      completed: totalQuizzes > 0,
      icon: HelpCircle,
      action: () => navigate('/quiz/create'),
      actionText: 'Create Quiz'
    },
    {
      id: 'goal',
      title: 'Set Your First Study Goal',
      description: 'Define your learning objectives',
      completed: totalGoals > 0,
      icon: Target,
      action: () => navigate('/goals'),
      actionText: 'Set Goals'
    }
  ];

  const completedCount = checklistItems.filter(item => item.completed).length;
  const progressPercentage = (completedCount / checklistItems.length) * 100;

  return (
    <Card className="bg-white border-mint-200 shadow-sm">
      <CardHeader>
        <CardTitle className="text-lg font-semibold text-gray-900 flex items-center justify-between">
          <span>Getting Started Checklist</span>
          <div className="flex items-center gap-2">
            <div className="w-12 h-2 bg-gray-200 rounded-full overflow-hidden">
              <div 
                className="h-full bg-mint-500 transition-all duration-300 ease-out"
                style={{ width: `${progressPercentage}%` }}
              />
            </div>
            <span className="text-sm text-gray-600 font-medium">
              {completedCount}/{checklistItems.length}
            </span>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {checklistItems.map((item) => {
          const IconComponent = item.completed ? CheckCircle : Circle;
          const iconColor = item.completed ? "text-mint-600" : "text-gray-400";
          
          return (
            <div 
              key={item.id} 
              className={`flex items-center justify-between p-3 rounded-lg border transition-all duration-200 ${
                item.completed 
                  ? 'bg-mint-50 border-mint-200' 
                  : 'bg-gray-50 border-gray-200 hover:border-mint-200'
              }`}
            >
              <div className="flex items-center gap-3">
                <IconComponent className={`h-5 w-5 ${iconColor}`} />
                <div>
                  <h4 className={`font-medium ${item.completed ? 'text-gray-700' : 'text-gray-900'}`}>
                    {item.title}
                  </h4>
                  <p className="text-sm text-gray-600">{item.description}</p>
                </div>
              </div>
              
              {!item.completed && (
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={item.action}
                  className="text-mint-600 border-mint-200 hover:bg-mint-50 font-medium"
                >
                  {item.actionText}
                  <ArrowRight className="h-3 w-3 ml-1" />
                </Button>
              )}
            </div>
          );
        })}
        
        {completedCount === checklistItems.length && (
          <div className="mt-4 p-4 bg-mint-50 border border-mint-200 rounded-lg text-center">
            <CheckCircle className="h-8 w-8 text-mint-600 mx-auto mb-2" />
            <h3 className="font-semibold text-mint-800 mb-1">Congratulations!</h3>
            <p className="text-sm text-mint-700">You've completed all the getting started steps.</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};