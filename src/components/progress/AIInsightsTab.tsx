
import { AdvancedAnalyticsDashboard } from "./AdvancedAnalyticsDashboard";
import { AdaptiveLearningDashboard } from "./adaptive/AdaptiveLearningDashboard";

export const AIInsightsTab = () => {
  return (
    <div className="space-y-8">
      {/* Advanced AI Analytics Section */}
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900 mb-2">Performance Analytics</h2>
          <p className="text-gray-600">AI-powered insights and comparative analysis</p>
        </div>
        <AdvancedAnalyticsDashboard />
      </div>
      
      {/* AI-Powered Adaptive Learning Section */}
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900 mb-2">AI-Powered Adaptive Learning</h2>
          <p className="text-gray-600">Personalized learning paths and intelligent study optimization</p>
        </div>
        <AdaptiveLearningDashboard />
      </div>
    </div>
  );
};
