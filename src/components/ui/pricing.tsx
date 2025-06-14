
"use client";

import { buttonVariants } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import useMediaQuery from "@/hooks/useMediaQuery";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { useState, useRef } from "react";
import confetti from "canvas-confetti";
import { PricingProps } from "./pricing/types";
import { PricingCard } from "./pricing/PricingCard";
import { useSubscription } from "@/contexts/SubscriptionContext";
import { toast } from "sonner";

export function Pricing({
  plans,
  title = "Choose Your Plan",
  description = "Select the perfect plan for your learning journey\nAll plans include access to our comprehensive study tools and features.",
}: PricingProps) {
  const [isMonthly, setIsMonthly] = useState(true);
  const isDesktop = useMediaQuery("(min-width: 768px)");
  const switchRef = useRef<HTMLButtonElement>(null);
  const { createCheckoutSession } = useSubscription();

  const handleToggle = (checked: boolean) => {
    setIsMonthly(!checked);
    if (checked && switchRef.current) {
      const rect = switchRef.current.getBoundingClientRect();
      const x = rect.left + rect.width / 2;
      const y = rect.top + rect.height / 2;

      confetti({
        particleCount: 50,
        spread: 60,
        origin: {
          x: x / window.innerWidth,
          y: y / window.innerHeight,
        },
        colors: [
          "#3dc087", // mint-500
          "#2b9c6c", // mint-600
          "#257c57", // mint-700
          "#62d3a3", // mint-400
        ],
        ticks: 200,
        gravity: 1.2,
        decay: 0.94,
        startVelocity: 30,
        shapes: ["circle"],
      });
    }
  };

  const handleSubscribe = async (planName: string, billing: 'monthly' | 'yearly') => {
    try {
      if (planName === 'GRADUATE' || planName === 'MASTER') {
        await createCheckoutSession(planName, billing);
        toast.success(`Redirecting to checkout for ${planName} plan...`);
      }
    } catch (error) {
      console.error('Subscription error:', error);
      toast.error('Failed to start checkout process. Please try again.');
    }
  };

  return (
    <div className="container py-20">
      <div className="text-center space-y-6 mb-16">
        <h1 className="text-5xl font-bold tracking-tight text-gray-900 mb-4">
          {title}
        </h1>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed whitespace-pre-line">
          {description}
        </p>
      </div>

      <div className="flex justify-center items-center mb-12">
        <div className="flex items-center space-x-6 bg-gray-50 p-2 rounded-2xl border border-gray-200">
          <span className={`font-semibold px-4 py-2 rounded-xl transition-all ${
            isMonthly ? 'text-mint-700 bg-white shadow-sm' : 'text-gray-500'
          }`}>
            Monthly
          </span>
          <Label className="cursor-pointer">
            <Switch
              ref={switchRef as any}
              checked={!isMonthly}
              onCheckedChange={handleToggle}
              className="relative data-[state=checked]:bg-mint-600"
            />
          </Label>
          <span className={`font-semibold px-4 py-2 rounded-xl transition-all ${
            !isMonthly ? 'text-mint-700 bg-white shadow-sm' : 'text-gray-500'
          }`}>
            Annual 
            <span className="text-mint-600 ml-2 text-sm font-medium">(Save 20%)</span>
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-10 max-w-7xl mx-auto">
        {plans.map((plan, index) => (
          <PricingCard
            key={index}
            plan={plan}
            isMonthly={isMonthly}
            index={index}
            isDesktop={isDesktop}
            onSubscribe={handleSubscribe}
          />
        ))}
      </div>

      <div className="mt-16 text-center">
        <p className="text-gray-500 text-sm">
          All plans include a 14-day free trial. No credit card required for Scholar plan.
        </p>
      </div>
    </div>
  );
}
