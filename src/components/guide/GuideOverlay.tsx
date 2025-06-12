import React, { useEffect, useState, useCallback } from 'react';
import { useGuide } from '@/contexts/GuideContext';
import { GuideTooltip } from './GuideTooltip';
import { GuideHighlight } from './GuideHighlight';
import { GuideBackdrop } from './GuideBackdrop';

export const GuideOverlay: React.FC = () => {
  const { isActive, currentGuide, currentStepIndex } = useGuide();
  const [targetElement, setTargetElement] = useState<HTMLElement | null>(null);
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });

  const currentStep = currentGuide?.steps[currentStepIndex];

  // Find and track the target element
  useEffect(() => {
    if (!isActive || !currentStep) {
      setTargetElement(null);
      return;
    }

    const findTarget = () => {
      const element = document.querySelector(currentStep.target) as HTMLElement;
      if (element) {
        setTargetElement(element);
        updateTooltipPosition(element);
      } else {
        // If element not found, try again after a short delay
        setTimeout(findTarget, 100);
      }
    };

    findTarget();
  }, [isActive, currentStep]);

  const updateTooltipPosition = useCallback((element: HTMLElement) => {
    if (!currentStep) return;

    const rect = element.getBoundingClientRect();
    const padding = 20;

    let x = 0;
    let y = 0;

    switch (currentStep.position) {
      case 'top':
        x = rect.left + rect.width / 2;
        y = rect.top - padding;
        break;
      case 'bottom':
        x = rect.left + rect.width / 2;
        y = rect.bottom + padding;
        break;
      case 'left':
        x = rect.left - padding;
        y = rect.top + rect.height / 2;
        break;
      case 'right':
        x = rect.right + padding;
        y = rect.top + rect.height / 2;
        break;
      case 'center':
        x = window.innerWidth / 2;
        y = window.innerHeight / 2;
        break;
    }

    setTooltipPosition({ x, y });
  }, [currentStep]);

  // Update position on window resize
  useEffect(() => {
    if (!targetElement) return;

    const handleResize = () => updateTooltipPosition(targetElement);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [targetElement, updateTooltipPosition]);

  // Handle scroll to keep tooltip positioned correctly
  useEffect(() => {
    if (!targetElement) return;

    const handleScroll = () => updateTooltipPosition(targetElement);
    window.addEventListener('scroll', handleScroll, true);
    return () => window.removeEventListener('scroll', handleScroll, true);
  }, [targetElement, updateTooltipPosition]);

  if (!isActive || !currentGuide || !currentStep) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-[9999] pointer-events-none">
      <GuideBackdrop />
      
      {targetElement && (
        <>
          <GuideHighlight
            targetElement={targetElement}
            step={currentStep}
          />
          <GuideTooltip
            step={currentStep}
            guide={currentGuide}
            stepIndex={currentStepIndex}
            position={tooltipPosition}
            targetElement={targetElement}
          />
        </>
      )}
    </div>
  );
};
