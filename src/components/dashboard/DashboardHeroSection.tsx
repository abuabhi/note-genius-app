
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Calendar, 
  Sparkles
} from "lucide-react";
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
        badge: "Get Started"
      };
    } else if (hasNotes && !hasFlashcards && !hasQuizzes) {
      return {
        title: "Great start with your notes!",
        description: "Now turn your notes into interactive flashcards and quizzes for better retention and practice.",
        badge: "Next Steps"
      };
    } else if (hasNotes && hasFlashcards && !hasQuizzes) {
      return {
        title: "Excellent progress!",
        description: "You have notes and flashcards. Create quizzes to test yourself, then organize with study plans and goals.",
        badge: "Keep Going"
      };
    } else {
      return {
        title: "Your learning system is ready!",
        description: "You have all the tools. Now create study plans and set goals to maximize your learning potential.",
        badge: "Optimize"
      };
    }
  };

  const userStage = getUserStage();

  return (
    <Card className="bg-gradient-to-r from-mint-500 to-blue-600 text-white border-none shadow-lg">
      <CardContent className="p-4">
        <div className="flex items-center gap-2 mb-2">
          <Calendar className="h-4 w-4" />
          <span className="text-mint-100 text-sm">{today}</span>
          <Badge variant="secondary" className="bg-white/20 text-white border-white/30 text-xs">
            {userStage.badge}
          </Badge>
        </div>
        
        <h1 className="text-xl lg:text-2xl font-bold mb-2">
          {userStage.title}
          <Sparkles className="inline h-5 w-5 ml-2 text-yellow-300" />
        </h1>
        
        <p className="text-mint-100 text-sm max-w-2xl">
          {userStage.description}
        </p>
      </CardContent>
    </Card>
  );
};
