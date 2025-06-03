
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { 
  Lightbulb, 
  BookOpen, 
  Tag, 
  Search,
  Pin,
  Download
} from "lucide-react";

export const OnboardingTips = () => {
  const tips = [
    {
      icon: <Tag className="h-5 w-5 text-mint-600" />,
      title: "Organize with Subjects",
      description: "Group your notes by subject for better organization"
    },
    {
      icon: <Pin className="h-5 w-5 text-blue-600" />,
      title: "Pin Important Notes",
      description: "Keep your most important notes easily accessible"
    },
    {
      icon: <Search className="h-5 w-5 text-purple-600" />,
      title: "Search Everything",
      description: "Find any note quickly using our powerful search"
    },
    {
      icon: <BookOpen className="h-5 w-5 text-green-600" />,
      title: "Convert to Flashcards",
      description: "Turn your notes into study materials automatically"
    },
    {
      icon: <Download className="h-5 w-5 text-orange-600" />,
      title: "Export & Share",
      description: "Download notes as PDF or share via email"
    }
  ];

  return (
    <Card className="border-mint-200 bg-mint-50/50">
      <CardContent className="p-6">
        <div className="flex items-center space-x-3 mb-4">
          <Lightbulb className="h-6 w-6 text-mint-600" />
          <h3 className="text-lg font-semibold text-gray-900">Pro Tips</h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {tips.map((tip, index) => (
            <div key={index} className="flex items-start space-x-3 p-3 bg-white rounded-lg border border-mint-100">
              <div className="flex-shrink-0 mt-0.5">
                {tip.icon}
              </div>
              <div>
                <h4 className="font-medium text-gray-900 text-sm">{tip.title}</h4>
                <p className="text-xs text-gray-600 mt-1">{tip.description}</p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
