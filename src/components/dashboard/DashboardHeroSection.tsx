
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Calendar, 
  BookOpen, 
  Target, 
  CheckSquare,
  Sparkles 
} from "lucide-react";
import { Link } from "react-router-dom";
import { format } from "date-fns";
import { useUltraSimpleAnalytics } from "@/hooks/useUltraSimpleAnalytics";

export const DashboardHeroSection = () => {
  const today = format(new Date(), "EEEE, MMMM do");
  const { analytics, isLoading } = useUltraSimpleAnalytics();
  
  // Determine if user has notes and adjust messaging accordingly
  const hasNotes = analytics.totalNotes > 0;
  const noteButtonText = hasNotes ? "Create Note" : "Create First Note";
  const heroTitle = hasNotes 
    ? "Welcome back to your study workspace!" 
    : "Welcome to your clean workspace!";
  const heroDescription = hasNotes
    ? "Continue building your study routine. Add more notes, set new goals, and organize your tasks."
    : "Everything has been reset and you're ready to build your perfect study routine. Start by creating your first note, then set goals and organize tasks.";

  return (
    <Card className="bg-gradient-to-r from-mint-500 to-blue-600 text-white border-none shadow-xl">
      <CardContent className="p-8">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-3">
              <Calendar className="h-5 w-5" />
              <span className="text-mint-100">{today}</span>
              <Badge variant="secondary" className="bg-white/20 text-white border-white/30">
                {hasNotes ? "Keep Going" : "Fresh Start"}
              </Badge>
            </div>
            
            <h1 className="text-3xl lg:text-4xl font-bold mb-4">
              {heroTitle}
              <Sparkles className="inline h-8 w-8 ml-2 text-yellow-300" />
            </h1>
            
            <p className="text-mint-100 text-lg mb-6 max-w-2xl">
              {heroDescription}
            </p>

            <div className="flex flex-wrap gap-3">
              <Button 
                asChild 
                size="lg"
                className="bg-white text-mint-600 hover:bg-mint-50 shadow-lg font-semibold"
              >
                <Link to="/notes">
                  <BookOpen className="h-4 w-4 mr-2" />
                  1. {noteButtonText}
                </Link>
              </Button>
              
              <Button 
                asChild 
                variant="secondary" 
                className="bg-mint-700 text-white hover:bg-mint-800 border-none"
              >
                <Link to="/goals">
                  <Target className="h-4 w-4 mr-2" />
                  2. Set Study Goal
                </Link>
              </Button>
              
              <Button 
                asChild 
                variant="secondary" 
                className="bg-mint-700 text-white hover:bg-mint-800 border-none"
              >
                <Link to="/todos">
                  <CheckSquare className="h-4 w-4 mr-2" />
                  3. Plan Tasks
                </Link>
              </Button>
            </div>
          </div>
          
          <div className="flex-shrink-0">
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 text-center">
              <div className="text-3xl font-bold">
                {isLoading ? "..." : analytics.totalNotes}
              </div>
              <div className="text-mint-100 text-sm">
                {analytics.totalNotes === 1 ? "Note created" : "Notes created"}
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
