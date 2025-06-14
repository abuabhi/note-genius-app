
"use client";

import { buttonVariants } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import useMediaQuery from "@/hooks/useMediaQuery";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { Check, Star } from "lucide-react";
import { Link } from "react-router-dom";
import { useState, useRef } from "react";
import confetti from "canvas-confetti";
import NumberFlow from "@number-flow/react";

interface PricingPlan {
  name: string;
  price: string;
  yearlyPrice: string;
  period: string;
  features: string[];
  description: string;
  buttonText: string;
  href: string;
  isPopular: boolean;
}

interface PricingProps {
  plans: PricingPlan[];
  title?: string;
  description?: string;
}

export function Pricing({
  plans,
  title = "Simple, Transparent Pricing",
  description = "Choose the plan that works for you\nAll plans include access to our platform, lead generation tools, and dedicated support.",
}: PricingProps) {
  const [isMonthly, setIsMonthly] = useState(true);
  const isDesktop = useMediaQuery("(min-width: 768px)");
  const switchRef = useRef<HTMLButtonElement>(null);

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

  return (
    <div className="container py-20">
      <div className="text-center space-y-4 mb-12">
        <h2 className="text-4xl font-bold tracking-tight sm:text-5xl text-gray-900">
          {title}
        </h2>
        <p className="text-gray-600 text-lg whitespace-pre-line">
          {description}
        </p>
      </div>

      <div className="flex justify-center items-center mb-10 space-x-4">
        <span className={`font-semibold ${isMonthly ? 'text-mint-700' : 'text-gray-500'}`}>
          Monthly
        </span>
        <Label>
          <Switch
            ref={switchRef as any}
            checked={!isMonthly}
            onCheckedChange={handleToggle}
            className="relative data-[state=checked]:bg-mint-600"
          />
        </Label>
        <span className={`font-semibold ${!isMonthly ? 'text-mint-700' : 'text-gray-500'}`}>
          Annual <span className="text-mint-600">(Save 20%)</span>
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-10">
        {plans.map((plan, index) => {
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
                      scale: index === 0 || index === 2 ? 0.94 : 1.0,
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
                `rounded-2xl border-2 p-8 bg-mint-50 text-center lg:flex lg:flex-col lg:justify-between relative overflow-hidden`,
                plan.isPopular ? "border-mint-500 bg-mint-100 shadow-lg shadow-mint-100" : "border-mint-300",
                "flex flex-col min-h-full",
                !plan.isPopular && "mt-5",
                index === 0 || index === 2
                  ? "z-0 transform translate-x-0 translate-y-0"
                  : "z-10",
              )}
            >
              {plan.isPopular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 z-10">
                  <div className="bg-mint-600 text-white px-4 py-2 rounded-full flex items-center shadow-sm">
                    <Star className="h-4 w-4 fill-current mr-2" />
                    <span className="font-semibold text-sm">Most Popular</span>
                  </div>
                </div>
              )}
              
              <div className="flex-1">
                <div className="flex items-center gap-2 justify-center mb-4">
                  <h3 className="text-xl font-semibold text-gray-900">{plan.name}</h3>
                </div>
                
                <div className="mt-6 flex items-center justify-center gap-x-2">
                  <span className="text-5xl font-bold tracking-tight text-gray-900">
                    <NumberFlow
                      value={currentPrice}
                      format={{
                        style: "currency",
                        currency: "AUD",
                        minimumFractionDigits: isFree ? 0 : 2,
                        maximumFractionDigits: isFree ? 0 : 2,
                      }}
                      transformTiming={{
                        duration: 500,
                        easing: "ease-out",
                      }}
                      willChange
                      className="font-variant-numeric: tabular-nums"
                    />
                  </span>
                  {plan.period !== "Next 3 months" && (
                    <span className="text-sm font-semibold leading-6 tracking-wide text-gray-500">
                      / {plan.period}
                    </span>
                  )}
                </div>

                <p className="text-xs leading-5 text-gray-500 mb-6">
                  {isMonthly ? "billed monthly" : "billed annually"}
                </p>

                <p className="text-gray-500 mb-6">{plan.description}</p>

                <ul className="mt-5 gap-4 flex flex-col text-left mb-8">
                  {plan.features.map((feature, idx) => (
                    <li key={idx} className="flex items-start gap-3">
                      <Check className="h-5 w-5 text-mint-500 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-600">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="mt-auto">
                <Link
                  to={plan.href}
                  className={cn(
                    buttonVariants({
                      variant: plan.isPopular ? "default" : "outline",
                    }),
                    "w-full text-lg font-semibold",
                    plan.isPopular
                      ? "bg-mint-600 hover:bg-mint-700 text-white"
                      : "border-mint-300 hover:bg-mint-50 hover:text-mint-700"
                  )}
                >
                  {plan.buttonText}
                </Link>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
