
import { EnhancedDashboardHeroSection } from "./EnhancedDashboardHeroSection";
import { StudySessionNotificationManager } from "./StudySessionNotificationManager";

export const DashboardHeroSection = () => {
  return (
    <>
      <StudySessionNotificationManager />
      <EnhancedDashboardHeroSection />
    </>
  );
};
