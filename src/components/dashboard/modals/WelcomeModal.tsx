import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useWelcomeModal } from '@/hooks/useWelcomeModal';
import { useNavigate } from 'react-router-dom';
import { 
  Star, 
  FileText, 
  CreditCard, 
  Target, 
  HelpCircle, 
  ArrowRight, 
  ArrowLeft,
  Sparkles,
  BookOpen,
  TrendingUp
} from 'lucide-react';

export const WelcomeModal = () => {
  const { 
    isOpen, 
    currentStep, 
    closeModal, 
    nextStep, 
    prevStep, 
    skipTour, 
    totalSteps 
  } = useWelcomeModal();
  
  const navigate = useNavigate();

  const handleAction = (route: string) => {
    closeModal();
    navigate(route);
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="text-center space-y-6">
            <div className="w-20 h-20 bg-gradient-to-r from-mint-500 to-blue-600 rounded-full flex items-center justify-center mx-auto">
              <Star className="h-10 w-10 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Welcome to PrepGenie!</h2>
              <p className="text-gray-600 leading-relaxed">
                Your all-in-one study companion designed to help you learn more effectively with AI-powered tools and smart organization.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="p-3 bg-mint-50 rounded-lg border border-mint-200">
                <BookOpen className="h-5 w-5 text-mint-600 mx-auto mb-2" />
                <p className="font-medium text-gray-900">Organize Notes</p>
                <p className="text-gray-600">Smart note management</p>
              </div>
              <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                <CreditCard className="h-5 w-5 text-blue-600 mx-auto mb-2" />
                <p className="font-medium text-gray-900">Study Flashcards</p>
                <p className="text-gray-600">Active recall learning</p>
              </div>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <div className="w-16 h-16 bg-mint-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Sparkles className="h-8 w-8 text-mint-600" />
              </div>
              <h2 className="text-xl font-bold text-gray-900 mb-2">Your Learning Toolkit</h2>
              <p className="text-gray-600">Everything you need to succeed in your studies</p>
            </div>
            
            <div className="space-y-3">
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <FileText className="h-5 w-5 text-blue-600" />
                <div>
                  <p className="font-medium text-gray-900">Smart Notes</p>
                  <p className="text-sm text-gray-600">Capture, organize, and enhance your study materials</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <CreditCard className="h-5 w-5 text-mint-600" />
                <div>
                  <p className="font-medium text-gray-900">Flashcards</p>
                  <p className="text-sm text-gray-600">Spaced repetition for better retention</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <HelpCircle className="h-5 w-5 text-orange-600" />
                <div>
                  <p className="font-medium text-gray-900">Quizzes</p>
                  <p className="text-sm text-gray-600">Test your knowledge and track progress</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <Target className="h-5 w-5 text-red-600" />
                <div>
                  <p className="font-medium text-gray-900">Goals & Analytics</p>
                  <p className="text-sm text-gray-600">Set targets and monitor your learning journey</p>
                </div>
              </div>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <TrendingUp className="h-8 w-8 text-orange-600" />
              </div>
              <h2 className="text-xl font-bold text-gray-900 mb-2">Quick Start Guide</h2>
              <p className="text-gray-600">Follow these steps to get the most out of PrepGenie</p>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-mint-500 text-white rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 mt-1">
                  1
                </div>
                <div>
                  <p className="font-medium text-gray-900">Create your first note</p>
                  <p className="text-sm text-gray-600">Start with study materials, textbooks, or lecture notes</p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 mt-1">
                  2
                </div>
                <div>
                  <p className="font-medium text-gray-900">Build flashcard sets</p>
                  <p className="text-sm text-gray-600">Convert notes into interactive study cards</p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-orange-500 text-white rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 mt-1">
                  3
                </div>
                <div>
                  <p className="font-medium text-gray-900">Set study goals</p>
                  <p className="text-sm text-gray-600">Define objectives and track your progress</p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-green-500 text-white rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 mt-1">
                  4
                </div>
                <div>
                  <p className="font-medium text-gray-900">Take quizzes</p>
                  <p className="text-sm text-gray-600">Test knowledge and identify areas for improvement</p>
                </div>
              </div>
            </div>
          </div>
        );

      case 4:
        return (
          <div className="text-center space-y-6">
            <div className="w-20 h-20 bg-gradient-to-r from-green-500 to-mint-600 rounded-full flex items-center justify-center mx-auto">
              <Star className="h-10 w-10 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Let's Begin!</h2>
              <p className="text-gray-600 mb-6">
                Choose your first action to start your learning journey with PrepGenie.
              </p>
            </div>
            
            <div className="grid grid-cols-1 gap-3">
              <Button 
                onClick={() => handleAction('/notes')}
                className="bg-mint-600 hover:bg-mint-700 text-white p-4 h-auto justify-start"
              >
                <FileText className="h-5 w-5 mr-3" />
                <div className="text-left">
                  <p className="font-medium">Create First Note</p>
                  <p className="text-sm text-mint-100">Start building your knowledge base</p>
                </div>
              </Button>
              
              <Button 
                variant="outline"
                onClick={() => handleAction('/flashcards/create')}
                className="border-mint-200 text-mint-700 hover:bg-mint-50 p-4 h-auto justify-start"
              >
                <CreditCard className="h-5 w-5 mr-3" />
                <div className="text-left">
                  <p className="font-medium">Make Flashcards</p>
                  <p className="text-sm text-gray-500">Create interactive study cards</p>
                </div>
              </Button>
              
              <Button 
                variant="outline"
                onClick={() => handleAction('/goals')}
                className="border-mint-200 text-mint-700 hover:bg-mint-50 p-4 h-auto justify-start"
              >
                <Target className="h-5 w-5 mr-3" />
                <div className="text-left">
                  <p className="font-medium">Set Study Goals</p>
                  <p className="text-sm text-gray-500">Define your learning objectives</p>
                </div>
              </Button>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onOpenChange={closeModal}>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="sr-only">Welcome to PrepGenie</DialogTitle>
            <Badge variant="outline" className="text-xs bg-mint-50 text-mint-700 border-mint-200">
              Step {currentStep} of {totalSteps}
            </Badge>
            <Button 
              variant="ghost" 
              size="sm"
              onClick={skipTour}
              className="text-gray-500 hover:text-gray-700"
            >
              Skip Tour
            </Button>
          </div>
        </DialogHeader>
        
        <div className="py-4">
          {renderStepContent()}
        </div>
        
        <div className="flex items-center justify-between pt-4 border-t">
          <Button 
            variant="outline"
            onClick={prevStep}
            disabled={currentStep === 1}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Previous
          </Button>
          
          <div className="flex space-x-1">
            {Array.from({ length: totalSteps }, (_, i) => (
              <div
                key={i}
                className={`w-2 h-2 rounded-full transition-colors ${
                  i + 1 === currentStep ? 'bg-mint-600' : i + 1 < currentStep ? 'bg-mint-300' : 'bg-gray-300'
                }`}
              />
            ))}
          </div>
          
          {currentStep < totalSteps ? (
            <Button 
              onClick={nextStep}
              className="bg-mint-600 hover:bg-mint-700 text-white flex items-center gap-2"
            >
              Next
              <ArrowRight className="h-4 w-4" />
            </Button>
          ) : (
            <Button 
              onClick={closeModal}
              className="bg-mint-600 hover:bg-mint-700 text-white"
            >
              Get Started
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};