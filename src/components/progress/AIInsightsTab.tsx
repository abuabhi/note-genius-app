
import { AdvancedAnalyticsDashboard } from "./AdvancedAnalyticsDashboard";
import { AdaptiveLearningDashboard } from "./adaptive/AdaptiveLearningDashboard";
import { ComingSoonBanner } from "./ComingSoonBanner";

export const AIInsightsTab = () => {
  return (
    <div className="space-y-8">
      {/* Advanced AI Analytics Section */}
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900 mb-2">Performance Analytics</h2>
          <p className="text-gray-600">AI-powered insights and comparative analysis</p>
        </div>
        
        <ComingSoonBanner
          title="Enhanced AI Analytics"
          description="Advanced performance insights with machine learning predictions and personalized recommendations are being developed."
        />
        
        <div className="opacity-60 relative">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent pointer-events-none rounded-lg"></div>
          <AdvancedAnalyticsDashboard />
        </div>
      </div>
      
      {/* AI-Powered Adaptive Learning Section */}
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900 mb-2">AI-Powered Adaptive Learning</h2>
          <p className="text-gray-600">Personalized learning paths and intelligent study optimization</p>
        </div>
        
        <ComingSoonBanner
          title="Full AI Adaptation Engine"
          description="Complete adaptive learning system with real-time optimization, behavioral analysis, and predictive scheduling is in development."
        />
        
        <div className="opacity-60 relative">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent pointer-events-none rounded-lg"></div>
          <AdaptiveLearningDashboard />
        </div>
      </div>
    </div>
  );
};
