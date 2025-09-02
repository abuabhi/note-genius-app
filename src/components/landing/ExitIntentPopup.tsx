import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { X, Gift, ArrowRight } from 'lucide-react';

export const ExitIntentPopup = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [hasShown, setHasShown] = useState(false);

  useEffect(() => {
    const handleMouseLeave = (e: MouseEvent) => {
      // Trigger when mouse leaves the top of the viewport
      if (e.clientY <= 0 && !hasShown) {
        setIsOpen(true);
        setHasShown(true);
      }
    };

    // Also show after 30 seconds if user hasn't left
    const timer = setTimeout(() => {
      if (!hasShown) {
        setIsOpen(true);
        setHasShown(true);
      }
    }, 30000);

    document.addEventListener('mouseleave', handleMouseLeave);
    
    return () => {
      document.removeEventListener('mouseleave', handleMouseLeave);
      clearTimeout(timer);
    };
  }, [hasShown]);

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="max-w-md mx-auto">
        <button 
          onClick={() => setIsOpen(false)}
          className="absolute right-4 top-4 text-gray-400 hover:text-gray-600"
        >
          <X className="h-4 w-4" />
        </button>
        
        <DialogHeader className="text-center space-y-4">
          <div className="mx-auto w-16 h-16 bg-gradient-to-r from-mint-500 to-mint-600 rounded-full flex items-center justify-center">
            <Gift className="h-8 w-8 text-white" />
          </div>
          
          <DialogTitle className="text-2xl font-bold text-gray-900">
            Wait! Don't Miss Out 🎁
          </DialogTitle>
          
          <DialogDescription className="text-gray-600 space-y-2">
            <p className="text-base">
              Before you go, grab your <strong>exclusive 50% discount</strong> on Premium features!
            </p>
            <p className="text-sm">
              Join 50,000+ students who improved their grades by 35% on average.
            </p>
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 pt-2">
          <div className="bg-mint-50 rounded-lg p-4 border border-mint-200">
            <div className="flex items-center justify-between mb-2">
              <span className="font-semibold text-mint-900">Special Offer</span>
              <span className="text-xs bg-red-500 text-white px-2 py-1 rounded">LIMITED TIME</span>
            </div>
            <div className="text-2xl font-bold text-mint-700">50% OFF</div>
            <div className="text-sm text-mint-600">Premium AI Study Tools</div>
          </div>

          <div className="flex flex-col gap-2">
            <Button asChild size="lg" className="w-full bg-mint-600 hover:bg-mint-700">
              <Link to="/signup" className="flex items-center justify-center gap-2">
                Claim 50% Discount
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => setIsOpen(false)}
              className="text-gray-500 hover:text-gray-700"
            >
              Maybe later
            </Button>
          </div>

          <div className="text-xs text-center text-gray-500 space-y-1">
            <p>✓ Cancel anytime • ✓ No credit card required</p>
            <p>✓ Works on all devices • ✓ Free forever plan available</p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};