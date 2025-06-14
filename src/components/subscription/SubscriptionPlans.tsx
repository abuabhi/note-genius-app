
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Check, Star, Zap, Crown, Loader2 } from 'lucide-react';
import { useSubscription } from '@/contexts/SubscriptionContext';
import { toast } from 'sonner';

interface PlanFeature {
  text: string;
  included: boolean;
}

interface Plan {
  id: 'GRADUATE' | 'MASTER';
  name: string;
  description: string;
  monthlyPrice: number;
  yearlyPrice: number;
  features: PlanFeature[];
  popular?: boolean;
  icon: React.ReactNode;
}

const plans: Plan[] = [
  {
    id: 'GRADUATE',
    name: 'Graduate',
    description: 'Perfect for dedicated students',
    monthlyPrice: 14.99,
    yearlyPrice: 11.99,
    icon: <Star className="h-6 w-6" />,
    features: [
      { text: '100 notes', included: true },
      { text: '25 flashcard sets', included: true },
      { text: '100 cards per set', included: true },
      { text: '50 AI enrichments/month', included: true },
      { text: '50 AI flashcard generations/month', included: true },
      { text: '500MB storage', included: true },
      { text: '5 collaborations', included: true },
      { text: 'AI features enabled', included: true },
      { text: 'OCR enabled', included: true },
    ],
  },
  {
    id: 'MASTER',
    name: 'Master',
    description: 'For serious academic achievers',
    monthlyPrice: 24.99,
    yearlyPrice: 19.99,
    popular: true,
    icon: <Zap className="h-6 w-6" />,
    features: [
      { text: '250 notes', included: true },
      { text: '50 flashcard sets', included: true },
      { text: '100 cards per set', included: true },
      { text: '200 AI enrichments/month', included: true },
      { text: '200 AI flashcard generations/month', included: true },
      { text: '2GB storage', included: true },
      { text: '15 collaborations', included: true },
      { text: 'All AI features', included: true },
      { text: 'Priority support', included: true },
    ],
  },
];

export const SubscriptionPlans: React.FC = () => {
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');
  const { createCheckoutSession, subscriptionTier } = useSubscription();
  const [loading, setLoading] = useState<string | null>(null);

  const handleSubscribe = async (planId: 'GRADUATE' | 'MASTER') => {
    setLoading(planId);
    try {
      await createCheckoutSession(planId, billingCycle);
    } catch (error) {
      toast.error('Failed to create checkout session');
      console.error('Subscription error:', error);
    } finally {
      setLoading(null);
    }
  };

  const getYearlySavings = (monthlyPrice: number) => {
    const yearlyTotal = monthlyPrice * 12;
    const yearlyPrice = monthlyPrice * 0.8 * 12; // 20% discount
    return Math.round(yearlyTotal - yearlyPrice);
  };

  return (
    <div className="space-y-8">
      {/* Billing Toggle */}
      <div className="flex justify-center">
        <div className="flex items-center space-x-4 bg-gray-100 p-1 rounded-lg">
          <button
            onClick={() => setBillingCycle('monthly')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              billingCycle === 'monthly'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Monthly
          </button>
          <button
            onClick={() => setBillingCycle('yearly')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              billingCycle === 'yearly'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Yearly
            <Badge className="ml-2 bg-mint-500 text-white">Save 20%</Badge>
          </button>
        </div>
      </div>

      {/* Plans Grid */}
      <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
        {plans.map((plan) => (
          <Card
            key={plan.id}
            className={`relative ${
              plan.popular
                ? 'border-mint-500 shadow-lg shadow-mint-500/20 scale-105'
                : 'border-gray-200'
            } ${
              subscriptionTier === plan.id
                ? 'ring-2 ring-mint-500 ring-opacity-50'
                : ''
            }`}
          >
            {plan.popular && (
              <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                <Badge className="bg-mint-500 text-white px-3 py-1">
                  Most Popular
                </Badge>
              </div>
            )}

            <CardHeader className="text-center pb-4">
              <div className="flex justify-center mb-4 text-mint-600">
                {plan.icon}
              </div>
              <CardTitle className="text-2xl font-bold">{plan.name}</CardTitle>
              <p className="text-gray-600">{plan.description}</p>
              
              <div className="mt-4">
                <div className="text-3xl font-bold">
                  ${billingCycle === 'monthly' ? plan.monthlyPrice : plan.yearlyPrice}
                  <span className="text-lg font-normal text-gray-600">
                    /{billingCycle === 'monthly' ? 'mo' : 'mo'}
                  </span>
                </div>
                {billingCycle === 'yearly' && (
                  <div className="text-sm text-gray-500">
                    Billed ${(plan.yearlyPrice * 12).toFixed(2)} annually
                  </div>
                )}
                {billingCycle === 'yearly' && (
                  <div className="text-sm text-mint-600 font-medium">
                    Save ${getYearlySavings(plan.monthlyPrice)} per year
                  </div>
                )}
              </div>
            </CardHeader>

            <CardContent className="space-y-4">
              <div className="space-y-3">
                {plan.features.map((feature, index) => (
                  <div key={index} className="flex items-center space-x-3">
                    <Check className="h-5 w-5 text-mint-500 flex-shrink-0" />
                    <span className="text-sm">{feature.text}</span>
                  </div>
                ))}
              </div>

              <Button
                onClick={() => handleSubscribe(plan.id)}
                disabled={loading === plan.id || subscriptionTier === plan.id}
                className={`w-full ${
                  plan.popular
                    ? 'bg-mint-600 hover:bg-mint-700'
                    : 'bg-gray-900 hover:bg-gray-800'
                } text-white`}
              >
                {loading === plan.id ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Processing...
                  </>
                ) : subscriptionTier === plan.id ? (
                  'Current Plan'
                ) : (
                  `Subscribe to ${plan.name}`
                )}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};
