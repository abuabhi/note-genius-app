
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, BookOpen, Target, ChevronRight, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";

export const LearningVelocityCard = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-green-600" />
          Learning Velocity Analysis
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Empty State for New Users */}
        <div className="text-center py-8">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <TrendingUp className="h-8 w-8 text-green-600" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Track Your Learning Velocity</h3>
          <p className="text-gray-600 mb-6">
            Start studying to see AI-powered analysis of your learning pace and optimal session lengths.
          </p>
          
          {/* Study Action Buttons */}
          <div className="space-y-3">
            <Button asChild className="w-full bg-green-600 hover:bg-green-700">
              <Link to="/flashcards" className="flex items-center justify-center gap-2">
                <BookOpen className="h-4 w-4" />
                Begin Learning
                <ChevronRight className="h-4 w-4" />
              </Link>
            </Button>
            
            <Button asChild variant="outline" className="w-full border-green-200 hover:bg-green-50">
              <Link to="/quizzes" className="flex items-center justify-center gap-2">
                <Target className="h-4 w-4" />
                Take Practice Quiz
                <ChevronRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>

        {/* Preview Metrics (shown dimmed) */}
        <div className="space-y-4 opacity-40">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">Current Learning Trend</span>
              <Badge variant="outline" className="text-xs">Stable</Badge>
            </div>
            <div className="text-xs text-gray-600">You're maintaining a steady learning pace. Consistency is key!</div>
          </div>
          
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">Your Optimal Session Length</span>
            </div>
            <div className="bg-gray-50 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-green-600 mb-1">25 min</div>
              <div className="text-xs text-gray-600">Moderate session length is your sweet spot</div>
            </div>
          </div>
          
          <div>
            <div className="text-sm font-medium mb-2">Velocity Insights</div>
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center">
                <div className="text-sm text-gray-600">Trend Direction</div>
                <div className="text-xs text-gray-500">—</div>
              </div>
              <div className="text-center">
                <div className="text-sm text-gray-600">Learning Style</div>
                <div className="text-xs text-gray-500">Quick</div>
              </div>
            </div>
          </div>
          
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <div className="flex items-start gap-2">
              <div className="text-blue-600 text-sm">💡</div>
              <div className="text-xs text-blue-700">
                <strong>Tip:</strong> Perfect pace! Maintain this rhythm and consider setting new challenge goals.
              </div>
            </div>
          </div>
        </div>

        {/* Fancy Notification */}
        <div className="relative bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0">
              <Sparkles className="h-5 w-5 text-green-600 animate-pulse" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-green-900 mb-1">
                AI Learning Optimization
              </p>
              <p className="text-xs text-green-700">
                Velocity analysis becomes more accurate as you build consistent study habits.
              </p>
            </div>
          </div>
          <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-br from-green-200/20 to-emerald-200/20 rounded-full -mr-8 -mt-8 opacity-50"></div>
        </div>
      </CardContent>
    </Card>
  );
};
