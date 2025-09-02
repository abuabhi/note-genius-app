import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { ArrowRight, Users } from 'lucide-react';

export const StickyHeaderCTA = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      // Show after scrolling past hero section (roughly 600px)
      setIsVisible(window.scrollY > 600);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  if (!isVisible) return null;

  return (
    <div className="fixed top-16 left-0 right-0 z-40 bg-white/95 backdrop-blur-sm border-b border-mint-100 shadow-sm animate-in slide-in-from-top-2">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm">
            <Users className="h-4 w-4 text-mint-600" />
            <span className="font-medium text-gray-700">Join 50,000+ students</span>
            <span className="text-gray-500">studying smarter with AI</span>
          </div>
          
          <div className="flex items-center gap-3">
            <Button asChild size="sm" className="bg-mint-600 hover:bg-mint-700">
              <Link to="/signup" className="flex items-center gap-1">
                Start Free Trial
                <ArrowRight className="h-3 w-3" />
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};