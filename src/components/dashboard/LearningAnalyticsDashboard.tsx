
import { AnalyticsSection } from "./AnalyticsSection";
import { NotificationSettingsPanel } from "./NotificationSettingsPanel";

export const LearningAnalyticsDashboard = () => {
  return (
    <div className="space-y-6">
      {/* Notification Settings */}
      <div>
        <NotificationSettingsPanel />
      </div>
      
      {/* Analytics */}
      <div>
        <AnalyticsSection />
      </div>
    </div>
  );
};
