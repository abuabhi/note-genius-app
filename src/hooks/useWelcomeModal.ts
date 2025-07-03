import { useState, useEffect } from 'react';
import { useUserProgressState } from './useUserProgressState';

export const useWelcomeModal = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const { userType } = useUserProgressState();

  useEffect(() => {
    // Show welcome modal for new users who haven't seen it before
    const hasSeenWelcome = localStorage.getItem('prepgenie-welcome-modal-seen');
    
    if (userType === 'new' && !hasSeenWelcome) {
      setIsOpen(true);
    }
  }, [userType]);

  const closeModal = () => {
    setIsOpen(false);
    localStorage.setItem('prepgenie-welcome-modal-seen', 'true');
  };

  const nextStep = () => {
    if (currentStep < 4) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const skipTour = () => {
    closeModal();
  };

  return {
    isOpen,
    currentStep,
    closeModal,
    nextStep,
    prevStep,
    skipTour,
    totalSteps: 4
  };
};