
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Calendar, 
  BookOpen, 
  Target, 
  CheckSquare,
  Sparkles,
  Activity,
  Brain
} from "lucide-react";
import { Link } from "react-router-dom";
import { format } from "date-fns";
import { useUltraSimpleAnalytics } from "@/hooks/useUltraSimpleAnalytics";

export const DashboardHeroSection = () => {
  const today = format(new Date(), "EEEE, MMMM do");
  const { analytics, isLoading } = useUltraSimpleAnalytics();
  
  // Determine user's current stage and customize messaging
  const hasNotes = analytics.totalNotes > 0;
  const hasFlashcards = analytics.totalSets > 0;
  const hasQuizzes = analytics.totalQuizzes > 0;
  
  const getUserStage = () => {
    if (!hasNotes && !hasFlashcards && !hasQuizzes) {
      return {
        title: "Welcome to your learning workspace!",
        description: "Start your learning journey by creating notes, then build flashcards and quizzes to master your subjects.",
        badge: "Get Started",
        actions: [
          { to: "/notes", icon: BookOpen, text: "1. Create Notes", primary: true },
          { to: "/flashcards", icon: Brain, text: "2. Build Flashcards" },
          { to: "/quizzes", icon: Activity, text: "3. Create Quizzes" }
        ]
      };
    } else if (hasNotes && !hasFlashcards && !hasQuizzes) {
      return {
        title: "Great start with your notes!",
        description: "Now turn your notes into interactive flashcards and quizzes for better retention and practice.",
        badge: "Next Steps",
        actions: [
          { to: "/flashcards", icon: Brain, text: "Create Flashcards", primary: true },
          { to: "/quizzes", icon: Activity, text: "Create Quizzes" },
          { to: "/notes", icon: BookOpen, text: "Add More Notes" }
        ]
      };
    } else if (hasNotes && hasFlashcards && !hasQuizzes) {
      return {
        title: "Excellent progress!",
        description: "You have notes and flashcards. Create quizzes to test yourself, then organize with study plans and goals.",
        badge: "Keep Going",
        actions: [
          { to: "/quizzes", icon: Activity, text: "Create Quizzes", primary: true },
          { to: "/study-planner", icon: Calendar, text: "Plan Studies" },
          { to: "/goals", icon: Target, text: "Set Goals" }
        ]
      };
    } else {
      return {
        title: "Your learning system is ready!",
        description: "You have all the tools. Now create study plans and set goals to maximize your learning potential.",
        badge: "Optimize",
        actions: [
          { to: "/study-planner", icon: Calendar, text: "Create Study Plan", primary: true },
          { to: "/goals", icon: Target, text: "Set Study Goals" },
          { to: "/todos", icon: CheckSquare, text: "Plan Tasks" }
        ]
      };
    }
  };

  const userStage = getUserStage();

  return (
    <Card className="bg-gradient-to-r from-mint-500 to-blue-600 text-white border-none shadow-xl">
      <CardContent className="p-8">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-3">
              <Calendar className="h-5 w-5" />
              <span className="text-mint-100">{today}</span>
              <Badge variant="secondary" className="bg-white/20 text-white border-white/30">
                {userStage.badge}
              </Badge>
            </div>
            
            <h1 className="text-3xl lg:text-4xl font-bold mb-4">
              {userStage.title}
              <Sparkles className="inline h-8 w-8 ml-2 text-yellow-300" />
            </h1>
            
            <p className="text-mint-100 text-lg mb-6 max-w-2xl">
              {userStage.description}
            </p>

            <div className="flex flex-wrap gap-3">
              {userStage.actions.map((action, index) => (
                <Button 
                  key={action.to}
                  asChild 
                  size="lg"
                  className={action.primary 
                    ? "bg-white text-mint-600 hover:bg-mint-50 shadow-lg font-semibold"
                    : "bg-mint-700 text-white hover:bg-mint-800 border-none"
                  }
                >
                  <Link to={action.to}>
                    <action.icon className="h-4 w-4 mr-2" />
                    {action.text}
                  </Link>
                </Button>
              ))}
            </div>
          </div>
          
          <div className="flex-shrink-0">
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 text-center">
              <div className="text-3xl font-bold">
                {isLoading ? "..." : analytics.totalNotes + analytics.totalSets + analytics.totalQuizzes}
              </div>
              <div className="text-mint-100 text-sm">
                Total Items Created
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
