import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { CheckCircle, ArrowRight, ArrowLeft, Sparkles, Target, BookOpen, Trophy } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface OnboardingStep {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  content: React.ReactNode;
  actionLabel?: string;
  skipLabel?: string;
}

interface EnhancedOnboardingProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: () => void;
  userProfile?: {
    name?: string;
    email?: string;
    preferences?: any;
  };
}

export const EnhancedOnboarding: React.FC<EnhancedOnboardingProps> = ({
  isOpen,
  onClose,
  onComplete,
  userProfile
}) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<Set<string>>(new Set());
  const [isPersonalized, setIsPersonalized] = useState(false);

  const steps: OnboardingStep[] = [
    {
      id: 'welcome',
      title: `Welcome to PrepGenie${userProfile?.name ? `, ${userProfile.name}` : ''}!`,
      description: 'Let\'s get you started on your learning journey with a quick tour of the key features.',
      icon: <Sparkles className="w-6 h-6 text-purple-500" />,
      content: (
        <div className="space-y-4 text-center">
          <div className="mx-auto w-20 h-20 bg-gradient-to-br from-purple-100 to-pink-100 rounded-full flex items-center justify-center">
            <Sparkles className="w-10 h-10 text-purple-500" />
          </div>
          <p className="text-muted-foreground">
            PrepGenie helps you study smarter with AI-powered tools, interactive flashcards, and personalized learning paths.
          </p>
          <div className="flex justify-center gap-2">
            <Badge variant="secondary">AI-Powered</Badge>
            <Badge variant="secondary">Personalized</Badge>
            <Badge variant="secondary">Interactive</Badge>
          </div>
        </div>
      ),
      actionLabel: 'Start Tour'
    },
    {
      id: 'notes',
      title: 'Smart Note Taking',
      description: 'Create, organize, and enhance your notes with AI-powered insights.',
      icon: <BookOpen className="w-6 h-6 text-blue-500" />,
      content: (
        <div className="space-y-4">
          <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
            <BookOpen className="w-8 h-8 text-blue-500" />
          </div>
          <div className="space-y-3 text-sm">
            <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
              <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
              <span>Upload documents and create notes automatically</span>
            </div>
            <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
              <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
              <span>Get AI-powered summaries and key insights</span>
            </div>
            <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
              <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
              <span>Organize by subjects and tags</span>
            </div>
          </div>
        </div>
      ),
      actionLabel: 'Got it!'
    },
    {
      id: 'flashcards',
      title: 'Interactive Flashcards',
      description: 'Master any topic with spaced repetition and adaptive learning.',
      icon: <Target className="w-6 h-6 text-green-500" />,
      content: (
        <div className="space-y-4">
          <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
            <Target className="w-8 h-8 text-green-500" />
          </div>
          <div className="bg-card border rounded-lg p-4">
            <div className="text-center space-y-2">
              <h4 className="font-medium">Sample Flashcard</h4>
              <p className="text-sm text-muted-foreground">What is the capital of France?</p>
              <Button variant="outline" size="sm" className="mt-2">
                Reveal Answer
              </Button>
            </div>
          </div>
          <p className="text-sm text-muted-foreground text-center">
            Create flashcards from your notes or import existing sets. Our smart algorithm adapts to your learning pace.
          </p>
        </div>
      ),
      actionLabel: 'Awesome!'
    },
    {
      id: 'dashboard',
      title: 'Your Learning Dashboard',
      description: 'Track progress, set goals, and stay motivated with detailed analytics.',
      icon: <Trophy className="w-6 h-6 text-orange-500" />,
      content: (
        <div className="space-y-4">
          <div className="mx-auto w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center">
            <Trophy className="w-8 h-8 text-orange-500" />
          </div>
          <div className="grid grid-cols-2 gap-3 text-center">
            <Card>
              <CardContent className="p-3">
                <div className="text-2xl font-bold text-primary">0</div>
                <div className="text-xs text-muted-foreground">Study Sessions</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-3">
                <div className="text-2xl font-bold text-green-500">0</div>
                <div className="text-xs text-muted-foreground">Cards Mastered</div>
              </CardContent>
            </Card>
          </div>
          <p className="text-sm text-muted-foreground text-center">
            Monitor your learning journey with detailed insights and achievements.
          </p>
        </div>
      ),
      actionLabel: 'Perfect!'
    }
  ];

  const currentStepData = steps[currentStep];
  const progress = ((currentStep + 1) / steps.length) * 100;
  const isLastStep = currentStep === steps.length - 1;

  const handleNext = () => {
    // Mark current step as completed
    setCompletedSteps(prev => new Set([...prev, currentStepData.id]));
    
    if (isLastStep) {
      handleComplete();
    } else {
      setCurrentStep(prev => prev + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const handleSkip = () => {
    if (isLastStep) {
      handleComplete();
    } else {
      setCurrentStep(prev => prev + 1);
    }
  };

  const handleComplete = () => {
    toast.success('Welcome to PrepGenie! You\'re all set to start learning.', {
      duration: 3000,
    });
    onComplete();
    onClose();
  };

  const jumpToStep = (stepIndex: number) => {
    setCurrentStep(stepIndex);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>Getting Started</span>
            <Badge variant="outline" className="text-xs">
              {currentStep + 1} of {steps.length}
            </Badge>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Progress bar */}
          <div className="space-y-2">
            <Progress value={progress} className="h-2" />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Progress</span>
              <span>{Math.round(progress)}% complete</span>
            </div>
          </div>

          {/* Step indicators */}
          <div className="flex justify-center gap-2">
            {steps.map((step, index) => (
              <button
                key={step.id}
                onClick={() => jumpToStep(index)}
                className={cn(
                  "w-3 h-3 rounded-full transition-all duration-200",
                  index === currentStep 
                    ? "bg-primary scale-125" 
                    : completedSteps.has(step.id)
                    ? "bg-green-500"
                    : index < currentStep 
                    ? "bg-muted-foreground" 
                    : "bg-muted"
                )}
                disabled={index > currentStep && !completedSteps.has(step.id)}
              />
            ))}
          </div>

          {/* Current step content */}
          <div className="min-h-[400px] flex flex-col">
            <div className="flex items-center gap-3 mb-4">
              {currentStepData.icon}
              <div>
                <h3 className="text-xl font-semibold">{currentStepData.title}</h3>
                <p className="text-muted-foreground text-sm">{currentStepData.description}</p>
              </div>
            </div>

            <div className="flex-1">
              {currentStepData.content}
            </div>
          </div>

          {/* Navigation */}
          <div className="flex justify-between items-center pt-4 border-t">
            <div className="flex gap-2">
              {currentStep > 0 && (
                <Button
                  variant="outline"
                  onClick={handlePrevious}
                  className="gap-2"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Previous
                </Button>
              )}
            </div>

            <div className="flex gap-2">
              <Button
                variant="ghost"
                onClick={handleSkip}
              >
                {isLastStep ? 'Finish' : 'Skip'}
              </Button>
              
              <Button
                onClick={handleNext}
                className="gap-2"
              >
                {currentStepData.actionLabel || (isLastStep ? 'Get Started' : 'Next')}
                {!isLastStep && <ArrowRight className="w-4 h-4" />}
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};