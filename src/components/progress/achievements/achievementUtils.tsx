
import { Trophy, Award, Star, BookOpen, Target, Calendar, Zap, Gift } from "lucide-react";

export const getIcon = (iconName: string) => {
  switch (iconName) {
    case "Trophy":
      return <Trophy className="h-5 w-5" />;
    case "Award":
      return <Award className="h-5 w-5" />;
    case "Star":
      return <Star className="h-5 w-5" />;
    case "BookOpen":
      return <BookOpen className="h-5 w-5" />;
    case "Target":
      return <Target className="h-5 w-5" />;
    case "Calendar":
      return <Calendar className="h-5 w-5" />;
    case "Zap":
      return <Zap className="h-5 w-5" />;
    case "Gift":
      return <Gift className="h-5 w-5" />;
    default:
      return <Award className="h-5 w-5" />;
  }
};

export const getBadgeColor = (type: string) => {
  switch (type) {
    case "study":
      return "bg-blue-100 text-blue-800 border-blue-300";
    case "flashcard":
      return "bg-green-100 text-green-800 border-green-300";
    case "goal":
      return "bg-purple-100 text-purple-800 border-purple-300";
    case "streak":
      return "bg-yellow-100 text-yellow-800 border-yellow-300";
    default:
      return "bg-gray-100 text-gray-800 border-gray-300";
  }
};
