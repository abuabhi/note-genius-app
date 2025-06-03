
import { Suspense } from "react";

const WelcomeBanner = () => {
  try {
    const { WelcomeBanner: Banner } = require("@/components/dashboard/WelcomeBanner");
    return <Banner />;
  } catch (error) {
    console.error('WelcomeBanner failed to load:', error);
    return (
      <div className="mb-8 p-6 bg-gradient-to-r from-mint-50 to-mint-100 rounded-lg">
        <h1 className="text-2xl font-bold text-mint-900 mb-2">Welcome to StudyBuddy</h1>
        <p className="text-mint-700">Start your learning journey today!</p>
      </div>
    );
  }
};

export const DashboardWelcomeBanner = () => {
  return (
    <Suspense fallback={<div>Loading welcome banner...</div>}>
      <WelcomeBanner />
    </Suspense>
  );
};
