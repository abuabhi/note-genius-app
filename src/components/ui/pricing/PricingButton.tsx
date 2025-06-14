
import React from 'react';
import { Link } from 'react-router-dom';
import { buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { PricingPlan } from './types';

interface PricingButtonProps {
  plan: PricingPlan;
  isPopular: boolean;
  isFree: boolean;
  isMonthly: boolean;
  onSubscribe?: (planName: string, billing: 'monthly' | 'yearly') => void;
}

export const PricingButton: React.FC<PricingButtonProps> = ({
  plan,
  isPopular,
  isFree,
  isMonthly,
  onSubscribe
}) => {
  const getButtonText = () => {
    if (isFree) return "Get Started Free";
    return `Choose ${plan.name}`;
  };

  const handleClick = () => {
    if (isFree) {
      // For free plan, redirect to signup
      return;
    }
    
    if (onSubscribe && (plan.name === 'GRADUATE' || plan.name === 'MASTER')) {
      const billing = isMonthly ? 'monthly' : 'yearly';
      onSubscribe(plan.name, billing);
    }
  };

  if (isFree) {
    return (
      <Link
        to="/signup"
        className={cn(
          buttonVariants({ variant: "outline" }),
          "w-full text-lg font-semibold py-4 h-auto transition-all duration-200",
          "border-2 border-gray-300 hover:border-mint-500 hover:bg-mint-50 hover:text-mint-700"
        )}
      >
        {getButtonText()}
      </Link>
    );
  }

  return (
    <button
      onClick={handleClick}
      className={cn(
        buttonVariants({ variant: isPopular ? "default" : "outline" }),
        "w-full text-lg font-semibold py-4 h-auto transition-all duration-200",
        isPopular
          ? "bg-gradient-to-r from-mint-600 to-mint-500 hover:from-mint-700 hover:to-mint-600 text-white shadow-lg"
          : "border-2 border-mint-300 hover:border-mint-500 hover:bg-mint-50 hover:text-mint-700"
      )}
    >
      {getButtonText()}
    </button>
  );
};
