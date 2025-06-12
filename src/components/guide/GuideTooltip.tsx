
import React from 'react';
import { Guide, GuideStep } from '@/types/guide';
import { useGuide } from '@/contexts/GuideContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { 
  ArrowRight, 
  ArrowLeft, 
  SkipForward, 
  X, 
  Clock,
  CheckCircle
} from 'lucide-react';

interface GuideTooltipProps {
  step: GuideStep;
  guide: Guide;
  stepIndex: number;
  position: { x: number; y: number };
  targetElement: HTMLElement;
}

export const GuideTooltip: React.FC<GuideTooltipProps> = ({ 
  step, 
  guide, 
  stepIndex, 
  position,
  targetElement 
}) => {
  const { 
    nextStep, 
    previousStep, 
    skipStep, 
    skipGuide, 
    stopGuide 
  } = useGuide();

  const progress = ((stepIndex + 1) / guide.steps.length) * 100;
  const isLastStep = stepIndex === guide.steps.length - 1;
  const isFirstStep = stepIndex === 0;

  // Calculate tooltip position to avoid going off-screen
  const tooltipWidth = 320;
  const tooltipHeight = 200; // approximate
  const padding = 20;

  let adjustedX = position.x;
  let adjustedY = position.y;

  // Adjust horizontal position
  if (position.x + tooltipWidth / 2 > window.innerWidth - padding) {
    adjustedX = window.innerWidth - tooltipWidth - padding;
  } else if (position.x - tooltipWidth / 2 < padding) {
    adjustedX = padding;
  } else {
    adjustedX = position.x - tooltipWidth / 2;
  }

  // Adjust vertical position
  if (position.y + tooltipHeight > window.innerHeight - padding) {
    adjustedY = position.y - tooltipHeight - padding;
  } else if (position.y < padding) {
    adjustedY = padding;
  }

  const tooltipStyle = {
    position: 'absolute' as const,
    left: adjustedX,
    top: adjustedY,
    width: tooltipWidth,
    zIndex: 10002,
    pointerEvents: 'auto' as const,
  };

  return (
    <div style={tooltipStyle}>
      <Card className="shadow-xl border-mint-200 bg-white">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="text-xs">
                Step {stepIndex + 1} of {guide.steps.length}
              </Badge>
              <div className="flex items-center gap-1 text-xs text-gray-500">
                <Clock className="h-3 w-3" />
                {guide.estimatedDuration}m
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={stopGuide}
              className="h-6 w-6 p-0"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          <CardTitle className="text-sm font-medium">{step.title}</CardTitle>
          <Progress value={progress} className="h-1" />
        </CardHeader>

        <CardContent className="space-y-4">
          <p className="text-sm text-gray-700">{step.content}</p>

          {step.action && step.actionText && (
            <div className="p-3 bg-mint-50 rounded-lg border border-mint-200">
              <p className="text-xs font-medium text-mint-800 mb-1">
                Action Required:
              </p>
              <p className="text-xs text-mint-700">{step.actionText}</p>
            </div>
          )}

          <div className="flex items-center justify-between pt-2">
            <div className="flex gap-2">
              {!isFirstStep && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={previousStep}
                  className="text-xs"
                >
                  <ArrowLeft className="h-3 w-3 mr-1" />
                  Back
                </Button>
              )}
              
              {step.optional && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={skipStep}
                  className="text-xs text-gray-500"
                >
                  <SkipForward className="h-3 w-3 mr-1" />
                  Skip
                </Button>
              )}
            </div>

            <div className="flex gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={skipGuide}
                className="text-xs text-gray-500"
              >
                Exit Tour
              </Button>
              
              <Button
                size="sm"
                onClick={nextStep}
                className="text-xs bg-mint-600 hover:bg-mint-700"
              >
                {isLastStep ? (
                  <>
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Complete
                  </>
                ) : (
                  <>
                    Next
                    <ArrowRight className="h-3 w-3 ml-1" />
                  </>
                )}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
