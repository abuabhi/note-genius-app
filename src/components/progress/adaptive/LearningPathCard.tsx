
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Brain, BookOpen, Target, TrendingUp, ChevronRight, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";

export const LearningPathCard = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Brain className="h-5 w-5 text-mint-600" />
          Adaptive Learning Paths
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Current Learning Path Status */}
        <div className="text-center py-8">
          <div className="mb-4">
            <div className="w-16 h-16 bg-mint-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Brain className="h-8 w-8 text-mint-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Start Your Learning Journey</h3>
            <p className="text-gray-600 mb-6">
              Begin studying to unlock personalized learning paths tailored to your progress.
            </p>
          </div>
          
          {/* Quick Study Actions */}
          <div className="space-y-3">
            <Button asChild className="w-full bg-mint-600 hover:bg-mint-700">
              <Link to="/flashcards" className="flex items-center justify-center gap-2">
                <BookOpen className="h-4 w-4" />
                Study Flashcards
                <ChevronRight className="h-4 w-4" />
              </Link>
            </Button>
            
            <Button asChild variant="outline" className="w-full border-mint-200 hover:bg-mint-50">
              <Link to="/quizzes" className="flex items-center justify-center gap-2">
                <Target className="h-4 w-4" />
                Take Quiz
                <ChevronRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>

        {/* Learning Path Preview (shown when user has study data) */}
        <div className="space-y-4 opacity-50">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">Mathematics Mastery</span>
              <Badge variant="outline" className="text-xs">Beginner</Badge>
            </div>
            <Progress value={25} className="h-2" />
            <div className="text-xs text-gray-500 mt-1">2 of 8 modules completed</div>
          </div>
          
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">Science Fundamentals</span>
              <Badge variant="outline" className="text-xs">Not Started</Badge>
            </div>
            <Progress value={0} className="h-2" />
            <div className="text-xs text-gray-500 mt-1">Ready to begin</div>
          </div>
        </div>

        {/* Fancy Notification */}
        <div className="relative bg-gradient-to-r from-mint-50 to-green-50 border border-mint-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0">
              <Sparkles className="h-5 w-5 text-mint-600 animate-pulse" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-mint-900 mb-1">
                AI-Powered Personalization
              </p>
              <p className="text-xs text-mint-700">
                Learning paths will be personalized based on your study patterns and performance.
              </p>
            </div>
          </div>
          <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-br from-mint-200/20 to-green-200/20 rounded-full -mr-8 -mt-8 opacity-50"></div>
        </div>
      </CardContent>
    </Card>
  );
};
