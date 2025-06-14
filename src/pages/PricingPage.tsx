
import { useState, useEffect } from "react";
import Layout from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, Star, Zap, Crown, Loader2 } from "lucide-react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/auth";
import { useSubscription } from "@/contexts/SubscriptionContext";
import { toast } from "sonner";

interface TierLimit {
  tier: string;
  max_notes: number;
  max_flashcard_sets: number;
  max_storage_mb: number;
  max_cards_per_set: number;
  max_ai_flashcard_generations_per_month: number;
  max_collaborations: number;
  ocr_enabled: boolean;
  ai_features_enabled: boolean;
  ai_flashcard_generation: boolean;
  note_enrichment_enabled: boolean;
  collaboration_enabled: boolean;
  priority_support: boolean;
  chat_enabled: boolean;
}

const PricingPage = () => {
  const [annual, setAnnual] = useState(false);
  const [tierLimits, setTierLimits] = useState<TierLimit[]>([]);
  const [loading, setLoading] = useState(true);
  const [checkoutLoading, setCheckoutLoading] = useState<string | null>(null);
  const { user } = useAuth();
  const { createCheckoutSession, subscriptionTier } = useSubscription();

  useEffect(() => {
    const fetchTierLimits = async () => {
      try {
        const { data, error } = await supabase
          .from('tier_limits')
          .select('*')
          .in('tier', ['SCHOLAR', 'GRADUATE', 'MASTER'])
          .order('max_notes');
          
        if (error) {
          throw error;
        }
        
        setTierLimits(data as TierLimit[]);
      } catch (error) {
        console.error('Error fetching tier limits:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchTierLimits();
  }, []);

  // Consistent pricing with create-checkout function
  const planPricing = {
    SCHOLAR: { monthly: 0, annually: 0 },
    GRADUATE: { monthly: 14.99, annually: 11.99 },
    MASTER: { monthly: 24.99, annually: 19.99 },
  };

  const tierDescriptions = {
    SCHOLAR: "Perfect for trying out PrepGenie",
    GRADUATE: "For dedicated students",
    MASTER: "For serious academic achievers",
  };

  const tierIcons = {
    SCHOLAR: Crown,
    GRADUATE: Star,
    MASTER: Zap,
  };

  const handleSubscribe = async (tier: 'GRADUATE' | 'MASTER') => {
    if (!user) {
      toast.error('Please log in to subscribe');
      return;
    }

    setCheckoutLoading(tier);
    try {
      await createCheckoutSession(tier, annual ? 'yearly' : 'monthly');
    } catch (error) {
      toast.error('Failed to create checkout session');
      console.error('Subscription error:', error);
    } finally {
      setCheckoutLoading(null);
    }
  };

  const renderTierFeatures = (tier: TierLimit) => {
    const features = [
      `${tier.max_notes === -1 ? 'Unlimited' : tier.max_notes} notes`,
      `${tier.max_flashcard_sets === -1 ? 'Unlimited' : tier.max_flashcard_sets} flashcard sets`,
      `${tier.max_cards_per_set === -1 ? 'Unlimited' : tier.max_cards_per_set} cards per set`,
      `${tier.max_storage_mb === -1 ? 'Unlimited' : tier.max_storage_mb + ' MB'} storage`,
      `${tier.max_collaborations === -1 ? 'Unlimited' : tier.max_collaborations} collaborations`,
    ];
    
    if (tier.ocr_enabled) {
      features.push('OCR scanning enabled');
    }
    
    if (tier.ai_features_enabled) {
      features.push('AI features enabled');
    }
    
    if (tier.ai_flashcard_generation) {
      const limit = tier.max_ai_flashcard_generations_per_month;
      features.push(`${limit === -1 ? 'Unlimited' : limit} AI flashcard generations/month`);
    }
    
    if (tier.note_enrichment_enabled) {
      features.push('Note enrichment enabled');
    }
    
    if (tier.collaboration_enabled) {
      features.push('Collaboration features');
    }
    
    if (tier.chat_enabled) {
      features.push('Chat features enabled');
    }
    
    if (tier.priority_support) {
      features.push('Priority support');
    }
    
    return features;
  };

  const getYearlySavings = (monthlyPrice: number) => {
    const yearlyTotal = monthlyPrice * 12;
    const yearlyPrice = monthlyPrice * 0.8 * 12; // 20% discount
    return Math.round(yearlyTotal - yearlyPrice);
  };

  if (loading) {
    return (
      <Layout>
        <div className="container mx-auto p-6 flex items-center justify-center h-[50vh]">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
            <p className="mt-2 text-muted-foreground">Loading pricing information...</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="bg-gradient-to-b from-mint-50 via-mint-50/30 to-mint-50/10">
        {/* Pricing Header */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl md:text-6xl">
              Choose Your Plan
            </h1>
            <p className="mt-6 max-w-2xl mx-auto text-xl text-gray-500">
              Select the perfect plan for your learning journey
            </p>
            
            {/* Billing Toggle */}
            <div className="mt-8">
              <div className="flex items-center justify-center">
                <span className={`mr-4 ${!annual ? 'font-semibold text-mint-700' : 'text-gray-500'}`}>
                  Monthly
                </span>
                <button
                  onClick={() => setAnnual(!annual)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-mint-600 ${annual ? 'bg-mint-600' : 'bg-gray-200'}`}
                >
                  <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${annual ? 'translate-x-6' : 'translate-x-1'}`} />
                </button>
                <span className={`ml-4 ${annual ? 'font-semibold text-mint-700' : 'text-gray-500'}`}>
                  Annual <span className="text-mint-600">(save 20%)</span>
                </span>
              </div>
            </div>
          </div>
        </div>
        
        {/* Pricing Cards */}
        <div className="bg-mint-50/20 py-8">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {tierLimits.map((tier) => {
                const tierKey = tier.tier as keyof typeof planPricing;
                const isPopular = tierKey === 'GRADUATE';
                const isCurrentPlan = subscriptionTier === tierKey;
                const TierIcon = tierIcons[tierKey];
                const price = annual ? planPricing[tierKey].annually : planPricing[tierKey].monthly;
                
                return (
                  <div 
                    key={tier.tier} 
                    className={`relative rounded-lg overflow-hidden border-2 ${
                      isPopular 
                        ? 'border-mint-500 shadow-lg shadow-mint-100 scale-105' 
                        : isCurrentPlan
                        ? 'border-mint-500 shadow-lg ring-2 ring-mint-200'
                        : 'border-mint-300'
                    }`}
                  >
                    {isPopular && (
                      <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 z-10">
                        <Badge className="bg-mint-600 text-white px-4 py-2 text-sm font-medium">
                          Most Popular
                        </Badge>
                      </div>
                    )}
                    
                    {isCurrentPlan && (
                      <div className="absolute -top-4 right-4 z-10">
                        <Badge className="bg-green-600 text-white px-3 py-1">
                          Current Plan
                        </Badge>
                      </div>
                    )}

                    <div className={`p-8 ${isPopular ? 'bg-mint-200' : 'bg-mint-100'}`}>
                      <div className="flex items-center gap-2 mb-4">
                        <TierIcon className="h-6 w-6 text-mint-600" />
                        <h3 className="text-xl font-semibold text-gray-900">{tier.tier}</h3>
                      </div>
                      
                      <div className="mb-4">
                        <div className="flex items-baseline">
                          <span className="text-4xl font-bold text-gray-900">
                            ${price}
                          </span>
                          <span className="ml-2 text-gray-500">/month</span>
                        </div>
                        {annual && tierKey !== 'SCHOLAR' && (
                          <div className="text-sm text-gray-500 mt-1">
                            Billed ${(price * 12).toFixed(2)} annually
                          </div>
                        )}
                        {annual && tierKey !== 'SCHOLAR' && (
                          <div className="text-sm text-mint-600 font-medium">
                            Save ${getYearlySavings(planPricing[tierKey].monthly)} per year
                          </div>
                        )}
                      </div>
                      
                      <p className="text-gray-500 mb-6">{tierDescriptions[tierKey]}</p>
                      
                      {tierKey === 'SCHOLAR' ? (
                        <Button 
                          className="w-full bg-mint-600 hover:bg-mint-700 text-white"
                          asChild
                        >
                          <Link to={user ? "/dashboard" : "/signup"}>
                            {user ? "Current Plan" : "Get Started Free"}
                          </Link>
                        </Button>
                      ) : (
                        <Button 
                          className={`w-full ${
                            isPopular 
                              ? 'bg-mint-600 hover:bg-mint-700' 
                              : 'bg-mint-600 hover:bg-mint-700'
                          } text-white`}
                          onClick={() => handleSubscribe(tierKey as 'GRADUATE' | 'MASTER')}
                          disabled={checkoutLoading === tierKey || isCurrentPlan}
                        >
                          {checkoutLoading === tierKey ? (
                            <>
                              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                              Processing...
                            </>
                          ) : isCurrentPlan ? (
                            'Current Plan'
                          ) : (
                            `Upgrade to ${tierKey}`
                          )}
                        </Button>
                      )}
                    </div>
                    
                    <div className={`px-8 py-6 ${isPopular ? 'bg-mint-100' : 'bg-mint-50'} border-t border-mint-200`}>
                      <ul className="space-y-4">
                        {renderTierFeatures(tier).map((feature) => (
                          <li key={feature} className="flex items-start">
                            <Check className="h-5 w-5 text-mint-500 shrink-0 mr-3 mt-0.5" />
                            <span className="text-gray-600">{feature}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                );
              })}
            </div>
            
            <div className="mt-16 text-center">
              <h3 className="text-2xl font-semibold text-gray-900">Need something custom?</h3>
              <p className="mt-2 text-gray-500">
                Contact our team for a custom solution tailored to your specific educational needs
              </p>
              <Button className="mt-6 bg-mint-600 hover:bg-mint-700" asChild>
                <Link to="/contact">Contact Us</Link>
              </Button>
            </div>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="bg-mint-50/30 py-16">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold text-gray-900">Frequently Asked Questions</h2>
              <div className="mt-2 h-1 w-20 bg-mint-500 mx-auto"></div>
            </div>

            <div className="space-y-8">
              <div className="bg-mint-50 p-6 rounded-lg shadow-sm border border-mint-200">
                <h3 className="text-lg font-semibold text-gray-900">Can I upgrade or downgrade my plan anytime?</h3>
                <p className="mt-2 text-gray-600">Yes, you can change your plan at any time. When upgrading, you'll have immediate access to new features. Changes are managed through our customer portal.</p>
              </div>
              <div className="bg-mint-50 p-6 rounded-lg shadow-sm border border-mint-200">
                <h3 className="text-lg font-semibold text-gray-900">How do I cancel my subscription?</h3>
                <p className="mt-2 text-gray-600">You can cancel your subscription at any time through the customer portal in your settings. Your access will continue until the end of your current billing period.</p>
              </div>
              <div className="bg-mint-50 p-6 rounded-lg shadow-sm border border-mint-200">
                <h3 className="text-lg font-semibold text-gray-900">Do you offer student discounts?</h3>
                <p className="mt-2 text-gray-600">Yes! We offer special pricing for verified students. Contact our support team with your student ID for details.</p>
              </div>
              <div className="bg-mint-50 p-6 rounded-lg shadow-sm border border-mint-200">
                <h3 className="text-lg font-semibold text-gray-900">What payment methods do you accept?</h3>
                <p className="mt-2 text-gray-600">We accept all major credit cards through our secure Stripe payment system.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default PricingPage;
