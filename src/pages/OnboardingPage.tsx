
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/auth";
import { useOnboardingStatus } from "@/hooks/useOnboardingStatus";
import { LoadingState } from "@/components/notes/page/LoadingState";
import Layout from "@/components/layout/Layout";
import { OnboardingWizard } from "@/components/onboarding/OnboardingWizard";

const OnboardingPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { isOnboardingCompleted, isLoading: statusLoading } = useOnboardingStatus(user);
  
  useEffect(() => {
    // Redirect if already completed onboarding
    if (isOnboardingCompleted && !statusLoading) {
      navigate('/dashboard');
    }
  }, [isOnboardingCompleted, statusLoading, navigate]);

  if (statusLoading) {
    return (
      <Layout>
        <div className="min-h-screen bg-gradient-to-br from-mint-50/30 via-white to-blue-50/30">
          <LoadingState message="Setting up your account..." />
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-br from-mint-50/30 via-white to-blue-50/30">
        <OnboardingWizard />
      </div>
    </Layout>
  );
};

export default OnboardingPage;
