
import { useLocation } from "react-router-dom";
import { EnhancedDashboardHeroSection } from "./EnhancedDashboardHeroSection";
import { AdaptiveNotificationManager } from "./AdaptiveNotificationManager";

export const DashboardHeroSection = () => {
  const location = useLocation();
  
  return (
    <>
      {/* Only show notification manager on dashboard pages */}
      {location.pathname === '/dashboard' && <AdaptiveNotificationManager />}
      <EnhancedDashboardHeroSection />
    </>
  );
};
