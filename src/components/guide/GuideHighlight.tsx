
import React from 'react';
import { GuideStep } from '@/types/guide';

interface GuideHighlightProps {
  targetElement: HTMLElement;
  step: GuideStep;
}

export const GuideHighlight: React.FC<GuideHighlightProps> = ({ targetElement, step }) => {
  const rect = targetElement.getBoundingClientRect();
  const padding = 8;

  const highlightStyle = {
    position: 'absolute' as const,
    left: rect.left - padding,
    top: rect.top - padding,
    width: rect.width + padding * 2,
    height: rect.height + padding * 2,
    pointerEvents: 'none' as const,
    zIndex: 10001,
  };

  return (
    <div
      style={highlightStyle}
      className="border-2 border-mint-400 rounded-lg shadow-lg animate-pulse bg-mint-100/20"
    >
      {/* Pulsing effect overlay */}
      <div className="absolute inset-0 border-2 border-mint-300 rounded-lg animate-ping opacity-75" />
    </div>
  );
};
