import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FileText, CreditCard, Target, ArrowRight, Lightbulb } from "lucide-react";
import { useNavigate } from "react-router-dom";

export const GettingStartedGuide = () => {
  const navigate = useNavigate();

  const tips = [
    {
      id: 'notes',
      title: "Start with Notes",
      description: "Begin by creating notes from your textbooks, lectures, or study materials. Notes are the foundation of your learning library.",
      icon: FileText,
      color: "blue",
      actionText: "Create First Note",
      action: () => navigate('/notes'),
      benefits: ["Organize knowledge", "Easy to search", "Convert to flashcards"]
    },
    {
      id: 'flashcards',
      title: "Build Your Library",
      description: "Transform your notes into interactive flashcards for active recall and spaced repetition learning.",
      icon: CreditCard,
      color: "mint", 
      actionText: "Make Flashcards",
      action: () => navigate('/flashcards/create'),
      benefits: ["Active recall", "Spaced repetition", "Track mastery"]
    },
    {
      id: 'goals',
      title: "Track Progress",
      description: "Set study goals and track your progress to stay motivated and achieve your learning objectives.",
      icon: Target,
      color: "orange",
      actionText: "Set Goals",
      action: () => navigate('/goals'),
      benefits: ["Stay motivated", "Track achievements", "Plan studies"]
    }
  ];

  const getIconColors = (color: string) => {
    switch (color) {
      case 'mint': return 'text-mint-600 bg-mint-100';
      case 'blue': return 'text-blue-600 bg-blue-100';
      case 'orange': return 'text-orange-600 bg-orange-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getBadgeColors = (color: string) => {
    switch (color) {
      case 'mint': return 'bg-mint-50 text-mint-700 border-mint-200';
      case 'blue': return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'orange': return 'bg-orange-50 text-orange-700 border-orange-200';
      default: return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  return (
    <Card className="mb-8 bg-white border-gray-200 shadow-sm">
      <CardHeader>
        <CardTitle className="text-xl font-semibold text-gray-800 flex items-center gap-2">
          <div className="w-6 h-6 bg-mint-100 rounded-full flex items-center justify-center">
            <Lightbulb className="h-4 w-4 text-mint-600" />
          </div>
          Getting Started Guide
          <Badge variant="outline" className="text-xs bg-mint-50 text-mint-700 border-mint-200 font-medium">
            New User Tips
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {tips.map((tip, index) => {
            const IconComponent = tip.icon;
            
            return (
              <div 
                key={tip.id}
                className="relative"
              >
                <div className="p-5 bg-gray-50 rounded-lg border border-gray-200 hover:shadow-sm transition-all duration-200 h-full flex flex-col">
                  <div className="flex items-start gap-3 mb-4">
                    <div className={`p-2 rounded-lg ${getIconColors(tip.color)} flex-shrink-0`}>
                      <IconComponent className="h-5 w-5" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900 mb-1">
                        {tip.title}
                      </h3>
                      <p className="text-sm text-gray-600 leading-relaxed">
                        {tip.description}
                      </p>
                    </div>
                  </div>
                  
                  <div className="mb-4 flex-1">
                    <div className="flex flex-wrap gap-1">
                      {tip.benefits.map((benefit, idx) => (
                        <Badge 
                          key={idx}
                          variant="outline" 
                          className={`text-xs ${getBadgeColors(tip.color)}`}
                        >
                          {benefit}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  
                  <Button 
                    variant="outline"
                    size="sm"
                    onClick={tip.action}
                    className="w-full text-mint-600 border-mint-200 hover:bg-mint-50 font-medium mt-auto"
                  >
                    {tip.actionText}
                    <ArrowRight className="h-3 w-3 ml-2" />
                  </Button>
                </div>
                
                {index < tips.length - 1 && (
                  <div className="hidden md:block absolute top-1/2 -right-3 w-6 h-0.5 bg-gray-300 z-10" />
                )}
              </div>
            );
          })}
        </div>
        
        <div className="mt-6 pt-4 border-t border-gray-200">
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-600 font-medium">
              💡 Tip: Start with creating a few notes, then turn them into flashcards for better retention
            </p>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => navigate('/help')}
              className="text-mint-600 border-mint-200 hover:bg-mint-50 font-medium"
            >
              Need Help?
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};