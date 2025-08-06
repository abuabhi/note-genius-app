
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
      "AI Chat",
      "Import as PDF",
      "Import from YouTube URL",
      "Inline expansion",
      "Study Plan",
      "Goals",
      "ToDO",
    ],
    description: "Perfect for trying out PrepGenie",
    buttonText: "Get Started Free",
    href: "/signup",
    isPopular: false,
  },
  {
    name: "GRADUATE",
    price: "14.99",
    yearlyPrice: "9.99", // A$119.92 ÷ 12 = A$9.99/month when billed annually
    period: "month",
    features: [
      "100 notes",
      "25 flashcard sets", 
      "100 cards per set",
      "500 MB storage",
      "AI features enabled",
      "AI Enrichment limits",
      "Number of Quizz",
      "AI Chat",
      "Import as PDF",
      "Import from YouTube URL",
      "Import from OneNote",
      "Import from Google Docs",
      "Inline expansion",
      "Study Plan",
      "Goals",
      "ToDO",
      "Export & Import",
    ],
    description: "Ideal for dedicated students",
    buttonText: "Choose Graduate",
    href: "/pricing",
    isPopular: true,
  },
  {
    name: "MASTER",
    price: "24.99",
    yearlyPrice: "16.66", // A$199.92 ÷ 12 = A$16.66/month when billed annually
    period: "month",
    features: [
      "250 notes",
      "50 flashcard sets",
      "100 cards per set", 
      "2GB storage",
      "Unlimited AI generations",
      "AI Enrichment Limits",
      "Number of Quiz",
      "AI Chat",
      "Import as PDF",
      "Import from YouTube URL",
      "Import from OneNote",
      "Import from Google Docs",
      "Handwritten notes",
      "Inline expansion",
      "Study Plan",
      "Goals",
      "ToDO",
      "Advanced analytics",
      "Advanced templates",
      "Priority support",
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
