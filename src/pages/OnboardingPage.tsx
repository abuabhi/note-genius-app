
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/auth";
import { LoadingState } from "@/components/notes/page/LoadingState";
import Layout from "@/components/layout/Layout";
import { OnboardingWizard } from "@/components/onboarding/OnboardingWizard";

const OnboardingPage = () => {
  const { user, onboardingCompleted, onboardingLoading } = useAuth();
  const navigate = useNavigate();
  
  console.log('📋 [ONBOARDING PAGE] State:', { 
    userId: user?.id, 
    onboardingCompleted, 
    onboardingLoading 
  });
  
  useEffect(() => {
    // Redirect if already completed onboarding
    if (onboardingCompleted && !onboardingLoading) {
      console.log('📋 [ONBOARDING PAGE] Redirecting to dashboard - onboarding completed');
      navigate('/dashboard', { replace: true });
    }
  }, [onboardingCompleted, onboardingLoading, navigate]);

  if (onboardingLoading) {
    console.log('📋 [ONBOARDING PAGE] Showing loading state');
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
