
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useLearningToolkit } from "@/hooks/useLearningToolkit";
import { 
  FileText, 
  CreditCard, 
  HelpCircle, 
  CheckSquare, 
  Target,
  ArrowRight,
  BookOpen
} from "lucide-react";

export const LearningToolkitSection = () => {
  const navigate = useNavigate();
  const { 
    totalNotes, 
    totalFlashcardSets, 
    totalFlashcards, 
    totalQuizzes, 
    totalTodos, 
    totalGoals, 
    isLoading 
  } = useLearningToolkit();

  const toolkitItems = [
    {
      title: "Notes",
      value: totalNotes,
      icon: FileText,
      color: "blue",
      route: "/notes"
    },
    {
      title: "Flashcard Sets",
      value: totalFlashcardSets,
      icon: CreditCard,
      color: "mint",
      route: "/flashcards"
    },
    {
      title: "Total Cards",
      value: totalFlashcards,
      icon: BookOpen,
      color: "purple",
      route: "/flashcards"
    },
    {
      title: "Quizzes",
      value: totalQuizzes,
      icon: HelpCircle,
      color: "orange",
      route: "/quiz"
    },
    {
      title: "Todos",
      value: totalTodos,
      icon: CheckSquare,
      color: "green",
      route: "/todos"
    },
    {
      title: "Goals",
      value: totalGoals,
      icon: Target,
      color: "red",
      route: "/goals"
    }
  ];

  const getCardColors = (color: string) => {
    switch (color) {
      case 'mint': return 'bg-mint-50 border-mint-200';
      case 'blue': return 'bg-blue-50 border-blue-200';
      case 'purple': return 'bg-purple-50 border-purple-200';
      case 'orange': return 'bg-orange-50 border-orange-200';
      case 'green': return 'bg-green-50 border-green-200';
      case 'red': return 'bg-red-50 border-red-200';
      default: return 'bg-gray-50 border-gray-200';
    }
  };

  const getIconColors = (color: string) => {
    switch (color) {
      case 'mint': return 'text-mint-600 bg-mint-100';
      case 'blue': return 'text-blue-600 bg-blue-100';
      case 'purple': return 'text-purple-600 bg-purple-100';
      case 'orange': return 'text-orange-600 bg-orange-100';
      case 'green': return 'text-green-600 bg-green-100';
      case 'red': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  if (isLoading) {
    return (
      <div className="mb-8">
        <div className="flex items-center justify-between mb-6">
          <div className="animate-pulse bg-gray-200 h-6 w-48 rounded"></div>
          <div className="animate-pulse bg-gray-200 h-9 w-32 rounded"></div>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="animate-pulse bg-gray-100 h-32 rounded-lg border border-gray-200"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="mb-8">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-gray-800">Learning Toolkit</h2>
        <Button 
          variant="outline" 
          onClick={() => navigate('/dashboard')}
          className="text-mint-600 border-mint-200 hover:bg-mint-50 font-medium"
        >
          View All
          <ArrowRight className="h-4 w-4 ml-2" />
        </Button>
      </div>
      
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {toolkitItems.map((item, index) => {
          const IconComponent = item.icon;
          return (
            <Card 
              key={index} 
              className={`${getCardColors(item.color)} border shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer group`}
              onClick={() => navigate(item.route)}
            >
              <CardContent className="p-4">
                <div className="flex flex-col items-center text-center space-y-3">
                  <div className={`p-3 rounded-lg ${getIconColors(item.color)} group-hover:scale-110 transition-transform duration-200`}>
                    <IconComponent className="h-6 w-6" />
                  </div>
                  
                  <div>
                    <p className="text-2xl font-bold text-gray-900 mb-1">
                      {item.value}
                    </p>
                    <p className="text-sm font-medium text-gray-600">
                      {item.title}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};
