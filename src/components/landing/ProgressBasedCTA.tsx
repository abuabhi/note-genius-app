import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { CheckCircle, ArrowRight, Sparkles } from 'lucide-react';

interface ProgressBasedCTAProps {
  milestone: number;
  total: number;
  message: string;
}

export const ProgressBasedCTA = ({ milestone, total, message }: ProgressBasedCTAProps) => {
  const [isVisible, setIsVisible] = useState(false);
  const [hasShown, setHasShown] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const scrollPercent = (window.scrollY / (document.body.scrollHeight - window.innerHeight)) * 100;
      const targetPercent = (milestone / total) * 100;
      
      if (scrollPercent >= targetPercent && !hasShown) {
        setIsVisible(true);
        setHasShown(true);
        
        // Auto-hide after 8 seconds
        setTimeout(() => setIsVisible(false), 8000);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [milestone, total, hasShown]);

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 max-w-sm animate-in slide-in-from-bottom-3">
      <div className="bg-white rounded-2xl shadow-xl border border-mint-200 p-4">
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0">
            <div className="w-10 h-10 bg-gradient-to-r from-mint-500 to-mint-600 rounded-full flex items-center justify-center">
              <CheckCircle className="h-5 w-5 text-white" />
            </div>
          </div>
          
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <Sparkles className="h-4 w-4 text-mint-600 animate-pulse" />
              <span className="text-sm font-semibold text-gray-900">Progress Update</span>
            </div>
            
            <p className="text-sm text-gray-600 mb-3">{message}</p>
            
            <div className="flex items-center gap-2">
              <Button asChild size="sm" className="bg-mint-600 hover:bg-mint-700 text-xs">
                <Link to="/signup" className="flex items-center gap-1">
                  Try It Now
                  <ArrowRight className="h-3 w-3" />
                </Link>
              </Button>
              
              <button 
                onClick={() => setIsVisible(false)}
                className="text-xs text-gray-500 hover:text-gray-700"
              >
                Maybe later
              </button>
            </div>
          </div>
          
          <button 
            onClick={() => setIsVisible(false)}
            className="text-gray-400 hover:text-gray-600"
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};