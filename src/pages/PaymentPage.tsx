import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/auth';
import { useSubscription } from '@/contexts/SubscriptionContext';
import Layout from '@/components/layout/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { LoadingState } from '@/components/notes/page/LoadingState';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, ArrowLeft, CreditCard } from 'lucide-react';
import { toast } from 'sonner';

interface LocationState {
  selectedTier: 'GRADUATE' | 'MASTER';
  billing: 'monthly' | 'yearly';
}

const PaymentPage = () => {
  const { user, loading } = useAuth();
  const { createCheckoutSession } = useSubscription();
  const navigate = useNavigate();
  const location = useLocation();
  const [isProcessing, setIsProcessing] = useState(false);
  
  const state = location.state as LocationState;

  useEffect(() => {
    // Redirect to login if not authenticated
    if (!loading && !user) {
      navigate('/login', { replace: true });
      return;
    }

    // Redirect to tier selection if no tier selected
    if (!loading && user && !state?.selectedTier) {
      navigate('/tier-selection', { replace: true });
    }
  }, [user, loading, navigate, state]);

  const tierDetails = {
    GRADUATE: {
      name: 'Graduate',
      monthlyPrice: 14.99,
      yearlyPrice: 9.99,
      features: [
        '100 notes',
        '25 flashcard sets',
        '100 cards per set',
        '500 MB storage',
        'AI features enabled',
        'OCR scanning',
        'Collaboration features',
        'Email support'
      ]
    },
    MASTER: {
      name: 'Master',
      monthlyPrice: 24.99,
      yearlyPrice: 16.66,
      features: [
        '250 notes',
        '50 flashcard sets',
        '100 cards per set',
        '2GB storage',
        'Unlimited AI generations',
        'Priority support',
        'Advanced analytics',
        'Team collaboration',
        'Custom integrations'
      ]
    }
  };

  const handlePayment = async () => {
    if (!state?.selectedTier || !state?.billing) {
      toast.error('Invalid payment configuration');
      return;
    }

    setIsProcessing(true);
    try {
      await createCheckoutSession(state.selectedTier, state.billing);
      // The createCheckoutSession will redirect to Stripe
    } catch (error) {
      console.error('Payment error:', error);
      toast.error('Failed to start payment process. Please try again.');
      setIsProcessing(false);
    }
  };

  const handleGoBack = () => {
    navigate('/tier-selection');
  };

  if (loading) {
    return (
      <Layout>
        <div className="min-h-screen bg-gradient-to-br from-mint-50/30 via-white to-blue-50/30">
          <LoadingState message="Loading payment..." />
        </div>
      </Layout>
    );
  }

  if (!user || !state?.selectedTier) {
    return null; // Will redirect
  }

  const tier = tierDetails[state.selectedTier];
  const price = state.billing === 'monthly' ? tier.monthlyPrice : tier.yearlyPrice;
  const savings = state.billing === 'yearly' ? (tier.monthlyPrice * 12 - tier.yearlyPrice * 12).toFixed(2) : null;

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-br from-mint-50/30 via-white to-blue-50/30">
        <div className="container mx-auto px-4 py-8 max-w-2xl">
          {/* Back Button */}
          <Button
            variant="ghost"
            onClick={handleGoBack}
            className="mb-6 text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Plan Selection
          </Button>

          {/* Payment Card */}
          <Card className="shadow-lg border-0">
            <CardHeader className="text-center pb-6">
              <CardTitle className="text-2xl font-bold text-gray-900">
                Complete Your Purchase
              </CardTitle>
              <p className="text-gray-600 mt-2">
                You're almost ready to unlock the full power of PrepGenie!
              </p>
            </CardHeader>
            
            <CardContent className="space-y-6">
              {/* Plan Summary */}
              <div className="bg-gradient-to-br from-mint-50 to-blue-50 rounded-xl p-6 border border-mint-200">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">{tier.name} Plan</h3>
                    <p className="text-gray-600 capitalize">{state.billing} billing</p>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-mint-600">
                      ${price}
                      <span className="text-sm text-gray-600">
                        /{state.billing === 'monthly' ? 'month' : 'year'}
                      </span>
                    </div>
                    {savings && (
                      <Badge variant="secondary" className="mt-1">
                        Save ${savings}/year
                      </Badge>
                    )}
                  </div>
                </div>

                {/* Features */}
                <div className="space-y-2">
                  <h4 className="font-semibold text-gray-900 mb-3">What's included:</h4>
                  <div className="grid grid-cols-1 gap-2">
                    {tier.features.map((feature, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-mint-600 flex-shrink-0" />
                        <span className="text-gray-700 text-sm">{feature}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Payment Button */}
              <Button
                onClick={handlePayment}
                disabled={isProcessing}
                className="w-full bg-gradient-to-r from-mint-600 to-mint-500 hover:from-mint-700 hover:to-mint-600 text-white py-4 text-lg font-semibold shadow-lg"
              >
                {isProcessing ? (
                  <div className="flex items-center gap-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                    Processing...
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <CreditCard className="h-5 w-5" />
                    Proceed to Payment
                  </div>
                )}
              </Button>

              {/* Security Notice */}
              <p className="text-xs text-gray-500 text-center">
                🔒 Your payment is secure and encrypted. You can cancel anytime from your account settings.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
};

export default PaymentPage;