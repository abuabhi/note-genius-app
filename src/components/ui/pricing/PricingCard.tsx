
import React from 'react';
import { motion } from 'framer-motion';
import { Star } from 'lucide-react';
import { cn } from '@/lib/utils';
import { PricingPlan } from './types';
import { PriceDisplay } from './PriceDisplay';
import { FeatureList } from './FeatureList';
import { PricingButton } from './PricingButton';

interface PricingCardProps {
  plan: PricingPlan;
  isMonthly: boolean;
  index: number;
  isDesktop: boolean;
  onSubscribe?: (planName: string, billing: 'monthly' | 'yearly') => void;
}

export const PricingCard: React.FC<PricingCardProps> = ({
  plan,
  isMonthly,
  index,
  isDesktop,
  onSubscribe
}) => {
  const currentPrice = isMonthly ? Number(plan.price) : Number(plan.yearlyPrice);
  const isFree = currentPrice === 0;

  return (
    <motion.div
      key={index}
      initial={{ y: 50, opacity: 1 }}
      whileInView={
        isDesktop
          ? {
              y: plan.isPopular ? -20 : 0,
              opacity: 1,
              x: index === 2 ? -30 : index === 0 ? 30 : 0,
              scale: index === 0 || index === 2 ? 0.96 : 1.0,
            }
          : {}
      }
      viewport={{ once: true }}
      transition={{
        duration: 1.6,
        type: "spring",
        stiffness: 100,
        damping: 30,
        delay: 0.4,
        opacity: { duration: 0.5 },
      }}
      className={cn(
        "relative overflow-hidden rounded-3xl border-2 bg-white shadow-lg transition-all duration-300 hover:shadow-xl",
        plan.isPopular 
          ? "border-mint-500 shadow-mint-100 ring-2 ring-mint-500/20" 
          : "border-gray-200 hover:border-mint-300",
        "flex flex-col min-h-full p-8",
        !plan.isPopular && "mt-5"
      )}
    >
      {plan.isPopular && (
        <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 z-10">
          <div className="bg-gradient-to-r from-mint-600 to-mint-500 text-white px-6 py-2 rounded-full flex items-center shadow-lg">
            <Star className="h-4 w-4 fill-current mr-2" />
            <span className="font-semibold text-sm">Most Popular</span>
          </div>
        </div>
      )}
      
      <div className="flex-1 text-center">
        <div className="mb-6">
          <h3 className="text-2xl font-bold text-gray-900 mb-2">{plan.name}</h3>
          <p className="text-gray-600 text-sm leading-relaxed">{plan.description}</p>
        </div>
        
        <PriceDisplay 
          currentPrice={currentPrice}
          period={plan.period}
          isMonthly={isMonthly}
          isFree={isFree}
        />

        <div className="mt-8 mb-8">
          <FeatureList features={plan.features} />
        </div>
      </div>

      <div className="mt-auto">
        <PricingButton 
          plan={plan}
          isPopular={plan.isPopular}
          isFree={isFree}
          isMonthly={isMonthly}
          onSubscribe={onSubscribe}
        />
      </div>
    </motion.div>
  );
};
