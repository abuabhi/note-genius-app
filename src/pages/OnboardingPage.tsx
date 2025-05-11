
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/auth";
import { useOnboardingStatus } from "@/hooks/useOnboardingStatus";
import { LoadingState } from "@/components/notes/page/LoadingState";
import Layout from "@/components/layout/Layout";
import { OnboardingForm } from "@/components/onboarding/OnboardingForm";
import { OnboardingHeader } from "@/components/onboarding/OnboardingHeader";

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
        <LoadingState message="Setting up your account..." />
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="min-h-[calc(100vh-16rem)] flex flex-col justify-center py-12 px-6 sm:px-6 lg:px-8 bg-gradient-to-b from-white via-mint-50/30 to-mint-50/10">
        <OnboardingHeader 
          title="Welcome to StudyApp!" 
          subtitle="Let's set up your account to personalize your experience."
        />

        <div className="mt-8">
          <OnboardingForm />
        </div>
      </div>
    </Layout>
  );
};

export default OnboardingPage;
