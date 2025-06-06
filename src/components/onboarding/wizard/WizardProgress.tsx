
import { Check } from "lucide-react";

interface WizardProgressProps {
  currentStep: number;
  totalSteps: number;
}

export const WizardProgress = ({ currentStep, totalSteps }: WizardProgressProps) => {
  const steps = [
    { number: 1, title: "Welcome" },
    { number: 2, title: "Subjects" },
    { number: 3, title: "Preferences" },
    { number: 4, title: "Complete" },
  ];

  return (
    <div className="mb-8">
      <div className="flex items-center justify-between">
        {steps.map((step, index) => (
          <div key={step.number} className="flex items-center">
            <div className="flex flex-col items-center">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all duration-300 ${
                  currentStep > step.number
                    ? "bg-mint-600 border-mint-600 text-white"
                    : currentStep === step.number
                    ? "bg-mint-100 border-mint-600 text-mint-600"
                    : "bg-white border-gray-300 text-gray-400"
                }`}
              >
                {currentStep > step.number ? (
                  <Check className="h-5 w-5" />
                ) : (
                  <span className="text-sm font-medium">{step.number}</span>
                )}
              </div>
              <span
                className={`mt-2 text-xs font-medium ${
                  currentStep >= step.number ? "text-mint-600" : "text-gray-400"
                }`}
              >
                {step.title}
              </span>
            </div>
            {index < steps.length - 1 && (
              <div
                className={`flex-1 h-0.5 mx-4 transition-all duration-300 ${
                  currentStep > step.number ? "bg-mint-600" : "bg-gray-200"
                }`}
              />
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
