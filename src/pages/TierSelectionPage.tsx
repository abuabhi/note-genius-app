import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/auth';
import Layout from '@/components/layout/Layout';
import { Pricing } from '@/components/ui/pricing';
import { LoadingState } from '@/components/notes/page/LoadingState';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Mail } from 'lucide-react';

const TierSelectionPage = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  // No longer need signup info since we have instant signup

  // Tier selection specific pricing data
  const tierPlans = [
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
      buttonText: "Continue with Scholar",
      href: "/onboarding",
      isPopular: false,
    },
    {
      name: "GRADUATE",
      price: "14.99",
      yearlyPrice: "9.99",
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
      href: "/payment",
      isPopular: true,
    },
    {
      name: "MASTER",
      price: "24.99",
      yearlyPrice: "16.66",
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
      href: "/payment",
      isPopular: false,
    },
  ];

  if (loading) {
    return (
      <Layout>
        <div className="min-h-screen bg-gradient-to-br from-mint-50/30 via-white to-blue-50/30">
          <LoadingState message="Loading tier selection..." />
        </div>
      </Layout>
    );
  }

  // Show loading while auth is being determined
  if (loading) {
    return (
      <Layout>
        <div className="min-h-screen bg-gradient-to-br from-mint-50/30 via-white to-blue-50/30">
          <LoadingState message="Loading tier selection..." />
        </div>
      </Layout>
    );
  }

  const handleTierSelection = (planName: string, billing: 'monthly' | 'yearly') => {
    if (planName === 'SCHOLAR') {
      // Free tier - go directly to onboarding
      navigate('/onboarding');
    } else if (planName === 'GRADUATE' || planName === 'MASTER') {
      // Paid tiers - go to payment with tier info
      navigate('/payment', { 
        state: { 
          selectedTier: planName as 'GRADUATE' | 'MASTER',
          billing: billing 
        }
      });
    }
  };

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-br from-mint-50/30 via-white to-blue-50/30">
        <div className="container mx-auto px-4 py-8">
          {/* Welcome message for authenticated users */}
          {user && (
            <div className="mb-6">
              <Alert className="border-mint-200 bg-mint-50">
                <Mail className="h-4 w-4" />
                <AlertDescription>
                  <strong>Welcome to PrepGenie!</strong> Your account is ready. Choose your plan below to continue.
                </AlertDescription>
              </Alert>
            </div>
          )}

          {/* Welcome Message */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Welcome to PrepGenie! 🎉
            </h1>
            <p className="text-lg text-gray-600">
              Choose your plan to get started with your learning journey
            </p>
          </div>
          
          {/* Pricing Component */}
          <Pricing 
            plans={tierPlans}
            title="Select Your Learning Plan"
            description="All plans include access to our comprehensive study tools. You can upgrade or downgrade anytime."
            onTierSelect={handleTierSelection}
          />
        </div>
      </div>
    </Layout>
  );
};

export default TierSelectionPage;