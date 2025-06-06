
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Brain, Eye, BookOpen, Target, ChevronRight, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";

export const BehavioralInsightsCard = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Eye className="h-5 w-5 text-purple-600" />
          Behavioral Insights
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Insights Preview */}
        <div className="text-center py-8">
          <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Brain className="h-8 w-8 text-purple-600" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Discover Your Learning Style</h3>
          <p className="text-gray-600 mb-6">
            AI will analyze your study patterns and provide personalized insights to optimize your learning.
          </p>
          
          {/* Start Learning Buttons */}
          <div className="space-y-3">
            <Button asChild className="w-full bg-purple-600 hover:bg-purple-700">
              <Link to="/flashcards" className="flex items-center justify-center gap-2">
                <BookOpen className="h-4 w-4" />
                Start Learning Journey
                <ChevronRight className="h-4 w-4" />
              </Link>
            </Button>
            
            <Button asChild variant="outline" className="w-full border-purple-200 hover:bg-purple-50">
              <Link to="/quizzes" className="flex items-center justify-center gap-2">
                <Target className="h-4 w-4" />
                Take Learning Assessment
                <ChevronRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>

        {/* Preview Insights (shown dimmed) */}
        <div className="space-y-4 opacity-40">
          <div className="p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">Peak Performance Time</span>
              <Badge variant="outline" className="text-xs">Morning</Badge>
            </div>
            <div className="text-xs text-gray-600">You perform 23% better between 9-11 AM</div>
          </div>
          
          <div className="p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">Preferred Learning Style</span>
              <Badge variant="outline" className="text-xs">Visual</Badge>
            </div>
            <div className="text-xs text-gray-600">Responds well to diagrams and flashcards</div>
          </div>
          
          <div className="p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">Optimal Session Length</span>
              <Badge variant="outline" className="text-xs">25 minutes</Badge>
            </div>
            <div className="text-xs text-gray-600">Best retention with focused study bursts</div>
          </div>
        </div>

        {/* Fancy Notification */}
        <div className="relative bg-gradient-to-r from-purple-50 to-violet-50 border border-purple-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0">
              <Sparkles className="h-5 w-5 text-purple-600 animate-pulse" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-purple-900 mb-1">
                AI Learning Analytics
              </p>
              <p className="text-xs text-purple-700">
                Insights develop over time as AI learns your unique patterns.
              </p>
            </div>
          </div>
          <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-br from-purple-200/20 to-violet-200/20 rounded-full -mr-8 -mt-8 opacity-50"></div>
        </div>
      </CardContent>
    </Card>
  );
};
