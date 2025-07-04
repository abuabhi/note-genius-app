
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Sparkles, GraduationCap, User } from "lucide-react";
import { GradeSelection } from "../GradeSelection";
import { SchoolInput } from "../SchoolInput";
import { OnboardingData } from "../OnboardingWizard";

interface WelcomeStepProps {
  data: OnboardingData;
  updateData: (updates: Partial<OnboardingData>) => void;
  onNext: () => void;
}

export const WelcomeStep = ({ data, updateData, onNext }: WelcomeStepProps) => {
  const canProceed = data.grade !== "" && data.firstName.trim() !== "";

  return (
    <div className="space-y-8">
      <div className="text-center">
        <div className="flex justify-center mb-4">
          <div className="w-16 h-16 bg-gradient-to-br from-mint-500 to-blue-600 rounded-2xl flex items-center justify-center shadow-lg">
            <Sparkles className="h-8 w-8 text-white" />
          </div>
        </div>
        <h2 className="text-3xl font-bold bg-gradient-to-r from-mint-700 to-blue-700 bg-clip-text text-transparent mb-3">
          Welcome to PrepGenie!
        </h2>
        <p className="text-lg text-slate-600 max-w-md mx-auto">
          Let's personalize your learning experience by setting up your academic profile.
        </p>
      </div>

      <div className="bg-mint-50/50 rounded-xl p-6 border border-mint-100">
        <div className="flex items-center gap-3 mb-4">
          <GraduationCap className="h-5 w-5 text-mint-600" />
          <h3 className="font-semibold text-slate-800">Academic Information</h3>
        </div>
        
        <div className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="firstName" className="text-sm font-medium text-slate-700 flex items-center gap-2">
              <User className="h-4 w-4 text-mint-600" />
              First Name
            </Label>
            <Input
              id="firstName"
              type="text"
              value={data.firstName}
              onChange={(e) => updateData({ firstName: e.target.value })}
              placeholder="Enter your first name"
              className="border-mint-200 focus:border-mint-500 focus:ring-mint-500"
            />
          </div>

          <GradeSelection 
            grade={data.grade} 
            setGrade={(grade) => updateData({ grade })} 
          />

          <SchoolInput 
            school={data.school} 
            setSchool={(school) => updateData({ school })} 
          />
        </div>
      </div>

      <div className="flex justify-end">
        <Button
          onClick={onNext}
          disabled={!canProceed}
          className="bg-mint-600 hover:bg-mint-700 px-8"
        >
          Continue
        </Button>
      </div>
    </div>
  );
};
