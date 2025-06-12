
import React from 'react';

export const GuideBackdrop: React.FC = () => {
  return (
    <div 
      className="absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity duration-300"
      style={{ pointerEvents: 'auto' }}
    />
  );
};
