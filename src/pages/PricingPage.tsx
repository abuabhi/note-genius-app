
import Layout from "@/components/layout/Layout";
import { Pricing } from "@/components/ui/pricing";

const PricingPage = () => {
  // Updated pricing data to match Stripe configuration exactly
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
        "Community support"
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
        "OCR scanning",
        "Collaboration features",
        "Email support"
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
        "Priority support",
        "Advanced analytics",
        "Team collaboration",
        "Custom integrations"
      ],
      description: "For serious academic achievers",
      buttonText: "Choose Master",
      href: "/pricing",
      isPopular: false,
    },
  ];

  return (
    <Layout>
      <div className="bg-gradient-to-b from-mint-50 via-white to-mint-50/30 min-h-screen">
        <Pricing 
          plans={demoPlans}
          title="Choose Your Plan"
          description="Select the perfect plan for your learning journey. All plans include access to our comprehensive study tools and features."
        />
      </div>
    </Layout>
  );
};

export default PricingPage;
