
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

export const DashboardHeroSection = () => {
  const today = format(new Date(), "EEEE, MMMM do");

  return (
    <Card className="bg-gradient-to-r from-mint-500 to-blue-600 text-white border-none shadow-xl">
      <CardContent className="p-8">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-3">
              <Calendar className="h-5 w-5" />
              <span className="text-mint-100">{today}</span>
              <Badge variant="secondary" className="bg-white/20 text-white border-white/30">
                Fresh Start
              </Badge>
            </div>
            
            <h1 className="text-3xl lg:text-4xl font-bold mb-4">
              Welcome to your clean workspace! 
              <Sparkles className="inline h-8 w-8 ml-2 text-yellow-300" />
            </h1>
            
            <p className="text-mint-100 text-lg mb-6 max-w-2xl">
              Everything has been reset and you're ready to build your perfect study routine. 
              Start by creating your first note, setting a goal, or organizing your tasks.
            </p>

            <div className="flex flex-wrap gap-3">
              <Button 
                asChild 
                variant="secondary" 
                className="bg-white text-mint-600 hover:bg-mint-50"
              >
                <Link to="/notes">
                  <BookOpen className="h-4 w-4 mr-2" />
                  Create First Note
                </Link>
              </Button>
              
              <Button 
                asChild 
                variant="outline" 
                className="border-white/30 text-white hover:bg-white/10"
              >
                <Link to="/goals">
                  <Target className="h-4 w-4 mr-2" />
                  Set Study Goal
                </Link>
              </Button>
              
              <Button 
                asChild 
                variant="outline" 
                className="border-white/30 text-white hover:bg-white/10"
              >
                <Link to="/todos">
                  <CheckSquare className="h-4 w-4 mr-2" />
                  Plan Tasks
                </Link>
              </Button>
            </div>
          </div>
          
          <div className="flex-shrink-0">
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 text-center">
              <div className="text-3xl font-bold">0</div>
              <div className="text-mint-100 text-sm">Items to focus on</div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
