
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/auth";
import { toast } from "sonner";
import { GradeLevel } from "@/types/subject";
import { WelcomeStep } from "./wizard/WelcomeStep";
import { SubjectStep } from "./wizard/SubjectStep";
import { PreferencesStep } from "./wizard/PreferencesStep";
import { CompletionStep } from "./wizard/CompletionStep";
import { WizardProgress } from "./wizard/WizardProgress";
import { Card, CardContent } from "@/components/ui/card";

export interface OnboardingData {
  grade: GradeLevel | "";
  school: string;
  selectedSubjects: Set<string>;
  studyGoal: number;
  notifications: boolean;
}

export const OnboardingWizard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [data, setData] = useState<OnboardingData>({
    grade: "",
    school: "",
    selectedSubjects: new Set(),
    studyGoal: 5,
    notifications: true,
  });

  const totalSteps = 4;

  const nextStep = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const updateData = (updates: Partial<OnboardingData>) => {
    setData(prev => ({ ...prev, ...updates }));
  };

  const completeOnboarding = async () => {
    if (!user) {
      toast.error("You must be logged in to complete onboarding");
      return;
    }
    
    if (!data.grade) {
      toast.error("Please select your grade/education level");
      return;
    }
    
    if (data.selectedSubjects.size === 0) {
      toast.error("Please select at least one subject");
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Update user profile
      const { error: profileError } = await supabase
        .from('profiles')
        .update({ 
          grade: data.grade as GradeLevel,
          school: data.school.trim() || null,
          onboarding_completed: true
        })
        .eq('id', user.id);
        
      if (profileError) throw profileError;
      
      // Save selected subjects
      const subjectsToAdd = Array.from(data.selectedSubjects).map(name => ({
        user_id: user.id,
        name
      }));
      
      const { error: subjectsError } = await supabase
        .from('user_subjects')
        .insert(subjectsToAdd);
        
      if (subjectsError) throw subjectsError;
      
      // Move to completion step
      nextStep();
      
    } catch (error: any) {
      console.error("Error completing onboarding:", error);
      toast.error("Failed to complete onboarding: " + error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const finishOnboarding = () => {
    navigate('/dashboard', { replace: true });
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <WelcomeStep
            data={data}
            updateData={updateData}
            onNext={nextStep}
          />
        );
      case 2:
        return (
          <SubjectStep
            data={data}
            updateData={updateData}
            onNext={nextStep}
            onPrev={prevStep}
          />
        );
      case 3:
        return (
          <PreferencesStep
            data={data}
            updateData={updateData}
            onNext={completeOnboarding}
            onPrev={prevStep}
            isSubmitting={isSubmitting}
          />
        );
      case 4:
        return (
          <CompletionStep onFinish={finishOnboarding} />
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-[calc(100vh-16rem)] flex flex-col justify-center py-12 px-6 sm:px-6 lg:px-8 bg-gradient-to-b from-white via-mint-50/30 to-mint-50/10">
      <div className="sm:mx-auto sm:w-full sm:max-w-2xl">
        <WizardProgress currentStep={currentStep} totalSteps={totalSteps} />
        
        <Card className="mt-8 shadow-xl border-0">
          <CardContent className="p-8">
            {renderStep()}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
