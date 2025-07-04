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
      title: 'Profile Setup',
      description: 'Set up your account',
      completed: !!user,
      icon: CheckCircle,
      action: () => navigate('/settings'),
      actionText: 'Settings'
    },
    {
      id: 'note',
      title: 'First Note',
      description: 'Create a note',
      completed: totalNotes > 0,
      icon: FileText,
      action: () => navigate('/notes'),
      actionText: 'Create Note'
    },
    {
      id: 'flashcards',
      title: 'Flashcard Set',
      description: 'Build flashcards',
      completed: totalFlashcardSets > 0,
      icon: CreditCard,
      action: () => navigate('/flashcards/create'),
      actionText: 'Create Set'
    },
    {
      id: 'quiz',
      title: 'First Quiz',
      description: 'Test knowledge',
      completed: totalQuizzes > 0,
      icon: HelpCircle,
      action: () => navigate('/quiz/create'),
      actionText: 'Create Quiz'
    },
    {
      id: 'goal',
      title: 'Study Goal',
      description: 'Set objectives',
      completed: totalGoals > 0,
      icon: Target,
      action: () => navigate('/goals'),
      actionText: 'Set Goals'
    }
  ];

  const completedCount = checklistItems.filter(item => item.completed).length;
  const progressPercentage = (completedCount / checklistItems.length) * 100;
  
  // Auto-hide when all completed
  if (completedCount === checklistItems.length) {
    return null;
  }

  return (
    <Card className="bg-white border-mint-200 shadow-sm">
      <CardHeader className="pb-4">
        <CardTitle className="text-lg font-semibold text-gray-900 flex items-center justify-between">
          <span>Getting Started Checklist</span>
          <div className="flex items-center gap-2">
            <div className="w-16 h-2 bg-gray-200 rounded-full overflow-hidden">
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
      <CardContent>
        {/* Horizontal Progress Stepper */}
        <div className="relative">
          {/* Progress Line */}
          <div className="absolute top-6 left-6 right-6 h-0.5 bg-gray-200">
            <div 
              className="h-full bg-mint-500 transition-all duration-500 ease-out"
              style={{ width: `${Math.max(0, (completedCount - 1) / (checklistItems.length - 1) * 100)}%` }}
            />
          </div>
          
          {/* Checklist Items */}
          <div className="grid grid-cols-5 gap-4">
            {checklistItems.map((item, index) => {
              const IconComponent = item.completed ? CheckCircle : Circle;
              const isActive = !item.completed && index === completedCount;
              
              return (
                <div key={item.id} className="flex flex-col items-center text-center relative">
                  {/* Icon Circle */}
                  <div className={`
                    relative z-10 w-12 h-12 rounded-full flex items-center justify-center border-2 transition-all duration-300
                    ${item.completed 
                      ? 'bg-mint-500 border-mint-500 text-white' 
                      : isActive
                        ? 'bg-white border-mint-400 text-mint-600'
                        : 'bg-white border-gray-300 text-gray-400'
                    }
                  `}>
                    <IconComponent className="h-5 w-5" />
                  </div>
                  
                  {/* Title and Description */}
                  <div className="mt-3 space-y-1">
                    <h4 className={`text-sm font-medium ${
                      item.completed ? 'text-mint-700' : isActive ? 'text-gray-900' : 'text-gray-500'
                    }`}>
                      {item.title}
                    </h4>
                    <p className="text-xs text-gray-500">
                      {item.description}
                    </p>
                  </div>
                  
                  {/* Action Button - Only show for active item */}
                  {isActive && (
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={item.action}
                      className="mt-2 text-xs text-mint-600 border-mint-200 hover:bg-mint-50 font-medium h-7"
                    >
                      {item.actionText}
                    </Button>
                  )}
                  
                  {/* Completed Checkmark */}
                  {item.completed && (
                    <div className="mt-2 text-xs text-mint-600 font-medium">
                      ✓ Complete
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
        
        {/* Mobile Stack Version */}
        <div className="block md:hidden mt-4 space-y-2">
          {checklistItems.filter(item => !item.completed).slice(0, 1).map((item) => (
            <div 
              key={item.id} 
              className="flex items-center justify-between p-3 rounded-lg border bg-gray-50 border-gray-200"
            >
              <div className="flex items-center gap-3">
                <Circle className="h-5 w-5 text-gray-400" />
                <div>
                  <h4 className="font-medium text-gray-900">{item.title}</h4>
                  <p className="text-sm text-gray-600">{item.description}</p>
                </div>
              </div>
              <Button 
                variant="outline" 
                size="sm"
                onClick={item.action}
                className="text-mint-600 border-mint-200 hover:bg-mint-50 font-medium"
              >
                {item.actionText}
                <ArrowRight className="h-3 w-3 ml-1" />
              </Button>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};