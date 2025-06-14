
"use client";

import { Pricing } from "@/components/ui/pricing";

const demoPlans = [
  {
    name: "SCHOLAR",
    price: "0",
    yearlyPrice: "0",
    period: "forever",
    features: [
      "10 notes",
      "5 flashcard sets",
      "20 cards per set",
      "100 MB storage",
      "Basic features",
    ],
    description: "Perfect for trying out PrepGenie",
    buttonText: "Get Started Free",
    href: "/signup",
    isPopular: false,
  },
  {
    name: "GRADUATE",
    price: "15.00",
    yearlyPrice: "12.00",
    period: "month",
    features: [
      "100 notes",
      "25 flashcard sets", 
      "100 cards per set",
      "500 MB storage",
      "AI features enabled",
      "OCR scanning",
      "Collaboration features",
    ],
    description: "Ideal for dedicated students",
    buttonText: "Choose Graduate",
    href: "/pricing",
    isPopular: true,
  },
  {
    name: "MASTER",
    price: "25.00",
    yearlyPrice: "20.00",
    period: "month",
    features: [
      "250 notes",
      "50 flashcard sets",
      "100 cards per set", 
      "2GB storage",
      "Unlimited AI generations",
      "Priority support",
      "Advanced analytics",
      "Team collaboration",
    ],
    description: "For serious academic achievers",
    buttonText: "Choose Master",
    href: "/pricing",
    isPopular: false,
  },
];

function PricingDemo() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-mint-50 via-mint-50/30 to-mint-50/10">
      <Pricing 
        plans={demoPlans}
        title="Choose Your Plan"
        description="Select the perfect plan for your learning journey\nAll plans include access to our comprehensive study tools and features."
      />
    </div>
  );
}

export { PricingDemo };
