
import { useState, useEffect } from "react";
import Layout from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Loader2 } from "lucide-react";

interface TierLimit {
  tier: string;
  max_notes: number;
  max_storage_mb: number;
  ocr_enabled: boolean;
  ai_features_enabled: boolean;
  collaboration_enabled: boolean;
  priority_support: boolean;
}

const PricingPage = () => {
  const [annual, setAnnual] = useState(false);
  const [tierLimits, setTierLimits] = useState<TierLimit[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    const fetchTierLimits = async () => {
      try {
        const { data, error } = await supabase
          .from('tier_limits')
          .select('*')
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

  const planPrices = {
    SCHOLAR: { monthly: 0, annually: 0 },
    GRADUATE: { monthly: 12.99, annually: 9.99 },
    MASTER: { monthly: 29.99, annually: 24.99 },
    DEAN: { monthly: 49.99, annually: 39.99 },
  };

  const tierDescriptions = {
    SCHOLAR: "Perfect for trying out StudyAI",
    GRADUATE: "For dedicated students",
    MASTER: "Perfect for advanced learners",
    DEAN: "Complete learning mastery",
  };

  const renderTierFeatures = (tier: TierLimit) => {
    const features = [
      `Up to ${tier.max_notes === 9999999 ? 'Unlimited' : tier.max_notes} notes`,
      `${tier.max_storage_mb === 9999999 ? 'Unlimited' : tier.max_storage_mb} MB storage`,
    ];
    
    if (tier.ocr_enabled) {
      features.push('Handwritten note scanning (OCR)');
    }
    
    if (tier.ai_features_enabled) {
      features.push('AI study recommendations');
      features.push('Smart flashcard generation');
    }
    
    if (tier.collaboration_enabled) {
      features.push('Collaborative study sessions');
      features.push('Share and co-edit notes');
    }
    
    if (tier.priority_support) {
      features.push('Priority support');
      features.push('Advanced analytics');
    }
    
    return features;
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
      <div className="bg-gradient-to-b from-white via-mint-50/30 to-mint-50/10">
        {/* Pricing Header */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center">
            <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl md:text-6xl">
              Knowledge Growth Tiers
            </h1>
            <p className="mt-6 max-w-2xl mx-auto text-xl text-gray-500">
              Choose the plan that elevates your learning journey
            </p>
            
            {/* Toggle */}
            <div className="mt-12">
              <div className="flex items-center justify-center">
                <span className={`mr-4 ${!annual ? 'font-semibold text-mint-700' : 'text-gray-500'}`}>
                  Monthly billing
                </span>
                <button
                  onClick={() => setAnnual(!annual)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-mint-600 ${annual ? 'bg-mint-600' : 'bg-gray-200'}`}
                >
                  <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${annual ? 'translate-x-6' : 'translate-x-1'}`} />
                </button>
                <span className={`ml-4 ${annual ? 'font-semibold text-mint-700' : 'text-gray-500'}`}>
                  Annual billing <span className="text-mint-600">(save 20%)</span>
                </span>
              </div>
            </div>
          </div>
        </div>
        
        {/* Pricing Cards */}
        <div className="bg-gradient-to-b from-mint-50/10 via-white to-mint-50/20 py-24">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              {tierLimits.map((tier) => {
                const tierKey = tier.tier as keyof typeof planPrices;
                const isPopular = tierKey === 'GRADUATE';
                const buttonText = tierKey === 'SCHOLAR' 
                  ? "Get Started" 
                  : `Upgrade to ${tierKey}`;
                const buttonLink = user 
                  ? "/settings?upgrade=true" 
                  : `/signup?plan=${tierKey.toLowerCase()}`;
                
                return (
                  <div 
                    key={tier.tier} 
                    className={`rounded-lg overflow-hidden border ${
                      isPopular 
                        ? 'border-mint-400 shadow-lg shadow-mint-100' 
                        : 'border-gray-200 shadow-sm'
                    }`}
                  >
                    <div className={`p-8 ${isPopular ? 'bg-mint-50' : 'bg-white'}`}>
                      <h3 className="text-xl font-semibold text-gray-900">{tier.tier}</h3>
                      <div className="mt-4 flex items-baseline">
                        <span className="text-4xl font-bold text-gray-900">
                          ${annual ? planPrices[tierKey].annually : planPrices[tierKey].monthly}
                        </span>
                        <span className="ml-2 text-gray-500">/month</span>
                      </div>
                      <p className="mt-2 text-gray-500">{tierDescriptions[tierKey]}</p>
                      <Button 
                        className={`mt-6 w-full ${
                          isPopular 
                            ? 'bg-mint-600 hover:bg-mint-700' 
                            : 'bg-gray-800 hover:bg-gray-900'
                        }`}
                        asChild
                      >
                        <Link to={buttonLink}>{buttonText}</Link>
                      </Button>
                    </div>
                    <div className="px-8 py-6 bg-gray-50 border-t border-gray-100">
                      <ul className="space-y-4">
                        {renderTierFeatures(tier).map((feature) => (
                          <li key={feature} className="flex items-start">
                            <Check className="h-5 w-5 text-mint-500 shrink-0 mr-3" />
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
        <div className="bg-gradient-to-b from-mint-50/20 via-white to-mint-50/30 py-24">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold text-gray-900">Frequently Asked Questions</h2>
              <div className="mt-2 h-1 w-20 bg-mint-500 mx-auto"></div>
            </div>

            <div className="space-y-8">
              <div className="bg-white p-6 rounded-lg shadow-sm border border-mint-100">
                <h3 className="text-lg font-semibold text-gray-900">Can I upgrade or downgrade my tier anytime?</h3>
                <p className="mt-2 text-gray-600">Yes, you can change your tier at any time. When upgrading, you'll have immediate access to new features. When downgrading, changes will take effect at the end of your current billing period.</p>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-sm border border-mint-100">
                <h3 className="text-lg font-semibold text-gray-900">Do you offer student discounts?</h3>
                <p className="mt-2 text-gray-600">Yes! We offer a special 20% discount for verified students. Contact our support team with your student ID for details.</p>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-sm border border-mint-100">
                <h3 className="text-lg font-semibold text-gray-900">What payment methods do you accept?</h3>
                <p className="mt-2 text-gray-600">We accept all major credit cards, PayPal, and select regional payment methods.</p>
              </div>
            </div>

            <div className="mt-8 text-center">
              <Link to="/faq" className="text-mint-600 hover:text-mint-800 font-medium">
                View all FAQs
              </Link>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default PricingPage;
