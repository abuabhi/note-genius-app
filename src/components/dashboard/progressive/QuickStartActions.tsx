import { Card, CardContent } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { 
  FileText, 
  Upload, 
  Camera, 
  CreditCard, 
  HelpCircle, 
  Target,
  Plus,
  BookOpen
} from "lucide-react";

export const QuickStartActions = () => {
  const navigate = useNavigate();

  const quickActions = [
    {
      title: "Create First Note",
      description: "Start building your knowledge base",
      icon: FileText,
      color: "blue",
      action: () => navigate('/notes')
    },
    {
      title: "Import Documents",
      description: "Open Notes and use the Import button",
      icon: Upload,
      color: "mint",
      action: () => navigate('/notes')
    },
    {
      title: "Scan Notes",
      description: "Open Notes and use the Scan option",
      icon: Camera,
      color: "purple",
      action: () => navigate('/notes')
    },
    {
      title: "Build Flashcards",
      description: "Create interactive study cards",
      icon: CreditCard,
      color: "orange",
      action: () => navigate('/flashcards/create')
    },
    {
      title: "Take a Quiz",
      description: "Test your knowledge and progress",
      icon: HelpCircle,
      color: "green",
      action: () => navigate('/quiz/create')
    },
    {
      title: "Set Study Goals",
      description: "Define your learning objectives",
      icon: Target,
      color: "red",
      action: () => navigate('/goals')
    }
  ];

  const getCardColors = (color: string) => {
    switch (color) {
      case 'mint': return 'bg-mint-50 border-mint-200 hover:bg-mint-100';
      case 'blue': return 'bg-blue-50 border-blue-200 hover:bg-blue-100';
      case 'purple': return 'bg-purple-50 border-purple-200 hover:bg-purple-100';
      case 'orange': return 'bg-orange-50 border-orange-200 hover:bg-orange-100';
      case 'green': return 'bg-green-50 border-green-200 hover:bg-green-100';
      case 'red': return 'bg-red-50 border-red-200 hover:bg-red-100';
      default: return 'bg-gray-50 border-gray-200 hover:bg-gray-100';
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

  return (
    <div className="mb-8">
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
          <BookOpen className="h-5 w-5 text-mint-600" />
          Quick Start Actions
        </h2>
        <p className="text-gray-600 mt-1">Choose an action to begin your learning journey</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {quickActions.map((action, index) => {
          const IconComponent = action.icon;
          return (
            <Card 
              key={index} 
              className={`${getCardColors(action.color)} border shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer group`}
              onClick={action.action}
            >
              <CardContent className="p-5">
                <div className="flex items-start gap-4">
                  <div className={`p-3 rounded-lg ${getIconColors(action.color)} group-hover:scale-110 transition-transform duration-200 flex-shrink-0`}>
                    <IconComponent className="h-5 w-5" />
                  </div>
                  
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 mb-1">
                      {action.title}
                    </h3>
                    <p className="text-sm text-gray-600">
                      {action.description}
                    </p>
                  </div>
                  
                  <Plus className="h-4 w-4 text-gray-400 group-hover:text-gray-600 transition-colors duration-200" />
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};