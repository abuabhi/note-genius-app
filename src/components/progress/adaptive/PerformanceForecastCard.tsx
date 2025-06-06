
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, BarChart3, BookOpen, Target, ChevronRight, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";

export const PerformanceForecastCard = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-green-600" />
          Performance Forecast
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Forecast Preview */}
        <div className="text-center py-8">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <BarChart3 className="h-8 w-8 text-green-600" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Unlock Performance Insights</h3>
          <p className="text-gray-600 mb-6">
            Start studying to see AI-powered predictions of your learning progress and performance trends.
          </p>
          
          {/* Study Action Buttons */}
          <div className="space-y-3">
            <Button asChild className="w-full bg-green-600 hover:bg-green-700">
              <Link to="/flashcards" className="flex items-center justify-center gap-2">
                <BookOpen className="h-4 w-4" />
                Begin Studying
                <ChevronRight className="h-4 w-4" />
              </Link>
            </Button>
            
            <Button asChild variant="outline" className="w-full border-green-200 hover:bg-green-50">
              <Link to="/quizzes" className="flex items-center justify-center gap-2">
                <Target className="h-4 w-4" />
                Take Assessment
                <ChevronRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>

        {/* Preview Metrics (shown dimmed) */}
        <div className="grid grid-cols-2 gap-4 opacity-40">
          <div className="text-center p-3 bg-gray-50 rounded-lg">
            <div className="text-2xl font-bold text-green-600 mb-1">85%</div>
            <div className="text-xs text-gray-600">Predicted Score</div>
          </div>
          
          <div className="text-center p-3 bg-gray-50 rounded-lg">
            <div className="text-2xl font-bold text-blue-600 mb-1">7 days</div>
            <div className="text-xs text-gray-600">To Mastery</div>
          </div>
        </div>

        <div className="space-y-2 opacity-40">
          <div className="flex items-center justify-between">
            <span className="text-sm">Current Trajectory</span>
            <Badge variant="outline" className="text-xs">Improving</Badge>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm">Confidence Level</span>
            <Badge variant="outline" className="text-xs">High</Badge>
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
                AI-Powered Accuracy
              </p>
              <p className="text-xs text-green-700">
                Forecasts become more accurate with consistent study activity.
              </p>
            </div>
          </div>
          <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-br from-green-200/20 to-emerald-200/20 rounded-full -mr-8 -mt-8 opacity-50"></div>
        </div>
      </CardContent>
    </Card>
  );
};
