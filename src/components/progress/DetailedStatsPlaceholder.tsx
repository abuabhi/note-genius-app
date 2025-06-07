
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart3, TrendingUp, Clock, Target } from "lucide-react";

export const DetailedStatsPlaceholder = () => {
  return (
    <div className="space-y-8">
      <div className="text-center py-16">
        <div className="mb-6">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <BarChart3 className="h-16 w-16 text-gray-300" />
            <TrendingUp className="h-12 w-12 text-gray-200" />
          </div>
          <h2 className="text-3xl font-bold text-gray-700 mb-4">Detailed Statistics</h2>
          <p className="text-gray-500 text-lg max-w-md mx-auto">
            Advanced statistical analysis and detailed performance metrics are coming soon.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto mt-12 opacity-50">
          <Card>
            <CardHeader className="text-center">
              <Clock className="h-8 w-8 text-blue-400 mx-auto mb-2" />
              <CardTitle className="text-gray-600">Time Analytics</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-500">
                Detailed time tracking and productivity insights
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="text-center">
              <Target className="h-8 w-8 text-green-400 mx-auto mb-2" />
              <CardTitle className="text-gray-600">Performance Metrics</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-500">
                Advanced accuracy and learning curve analysis
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="text-center">
              <BarChart3 className="h-8 w-8 text-purple-400 mx-auto mb-2" />
              <CardTitle className="text-gray-600">Trend Analysis</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-500">
                Long-term progress tracking and predictions
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};
