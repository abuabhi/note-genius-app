import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Check, 
  X, 
  Crown, 
  Zap, 
  Star, 
  ArrowRight,
  Sparkles,
  Trophy,
  Users,
  Target
} from 'lucide-react';
import { UserTier } from '@/hooks/useUserTier';
import { useSubscription } from '@/contexts/SubscriptionContext';
import { cn } from '@/lib/utils';

interface TierComparisonCardProps {
  currentTier: UserTier;
  onUpgrade?: () => void;
  className?: string;
}

export const TierComparisonCard: React.FC<TierComparisonCardProps> = ({
  currentTier,
  onUpgrade,
  className
}) => {
  const { createCheckoutSession } = useSubscription();

  const tiers = [
    {
      tier: UserTier.SCHOLAR,
      name: 'Scholar',
      price: 'Free',
      icon: <Users className="h-5 w-5" />,
      color: 'border-gray-200',
      features: {
        notes: 10,
        flashcardSets: 5,
        aiGenerations: 0,
        collaboration: false,
        analytics: false,
        support: 'Community'
      }
    },
    {
      tier: UserTier.GRADUATE,
      name: 'Graduate',
      price: '$9.99/mo',
      icon: <Star className="h-5 w-5" />,
      color: 'border-blue-200',
      popular: true,
      features: {
        notes: 100,
        flashcardSets: 25,
        aiGenerations: 50,
        collaboration: true,
        analytics: true,
        support: 'Priority'
      }
    },
    {
      tier: UserTier.MASTER,
      name: 'Master',
      price: '$19.99/mo',
      icon: <Crown className="h-5 w-5" />,
      color: 'border-purple-200',
      features: {
        notes: 250,
        flashcardSets: 50,
        aiGenerations: 200,
        collaboration: true,
        analytics: true,
        support: 'Premium'
      }
    },
    {
      tier: UserTier.DEAN,
      name: 'Dean',
      price: 'Contact Us',
      icon: <Trophy className="h-5 w-5" />,
      color: 'border-gold-200',
      features: {
        notes: 'Unlimited',
        flashcardSets: 'Unlimited',
        aiGenerations: 'Unlimited',
        collaboration: true,
        analytics: true,
        support: 'White-glove'
      }
    }
  ];

  const featureRows = [
    { key: 'notes', label: 'Notes' },
    { key: 'flashcardSets', label: 'Flashcard Sets' },
    { key: 'aiGenerations', label: 'AI Generations/mo' },
    { key: 'collaboration', label: 'Collaboration' },
    { key: 'analytics', label: 'Advanced Analytics' },
    { key: 'support', label: 'Support Level' }
  ];

  const handleUpgrade = async (targetTier: UserTier) => {
    if (targetTier === UserTier.DEAN) {
      // Handle enterprise contact
      window.open('mailto:contact@studyflow.com?subject=Dean%20Tier%20Inquiry', '_blank');
      return;
    }

    if (targetTier === UserTier.GRADUATE || targetTier === UserTier.MASTER) {
      try {
        await createCheckoutSession(targetTier, 'monthly');
      } catch (error) {
        console.error('Error upgrading:', error);
      }
    }
  };

  const renderFeatureValue = (tier: any, featureKey: string) => {
    const value = tier.features[featureKey];
    
    if (typeof value === 'boolean') {
      return value ? (
        <Check className="h-4 w-4 text-green-600" />
      ) : (
        <X className="h-4 w-4 text-red-400" />
      );
    }
    
    if (typeof value === 'number' && value === 0) {
      return <X className="h-4 w-4 text-red-400" />;
    }
    
    return <span className="text-sm font-medium">{value}</span>;
  };

  return (
    <div className={cn("space-y-6", className)}>
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold">Choose Your Learning Tier</h2>
        <p className="text-muted-foreground">
          Unlock your full potential with the right plan for your goals
        </p>
      </div>

      {/* Tier cards */}
      <div className="grid md:grid-cols-4 gap-4">
        {tiers.map((tier) => {
          const isCurrent = tier.tier === currentTier;
          const isUpgrade = tier.tier > currentTier;
          
          return (
            <Card 
              key={tier.tier}
              className={cn(
                "relative transition-all duration-200 hover:shadow-lg",
                tier.color,
                isCurrent && "ring-2 ring-primary ring-offset-2",
                tier.popular && "border-2 border-blue-500 shadow-lg",
                isUpgrade && "hover:scale-105"
              )}
            >
              {tier.popular && (
                <Badge className="absolute -top-2 left-1/2 transform -translate-x-1/2 bg-blue-500">
                  Most Popular
                </Badge>
              )}
              
              {isCurrent && (
                <Badge className="absolute -top-2 left-1/2 transform -translate-x-1/2 bg-primary">
                  Current Plan
                </Badge>
              )}

              <CardHeader className="text-center pb-2">
                <div className="flex items-center justify-center mb-2">
                  {tier.icon}
                </div>
                <CardTitle className="text-lg">{tier.name}</CardTitle>
                <div className="text-2xl font-bold text-primary">
                  {tier.price}
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                <div className="space-y-2">
                  {featureRows.map((row) => (
                    <div key={row.key} className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">{row.label}</span>
                      {renderFeatureValue(tier, row.key)}
                    </div>
                  ))}
                </div>

                {isUpgrade && (
                  <Button
                    onClick={() => handleUpgrade(tier.tier)}
                    className="w-full"
                    variant={tier.popular ? "default" : "outline"}
                  >
                    {tier.tier === UserTier.DEAN ? (
                      "Contact Sales"
                    ) : (
                      <>
                        Upgrade Now
                        <ArrowRight className="h-4 w-4 ml-2" />
                      </>
                    )}
                  </Button>
                )}

                {isCurrent && (
                  <Button disabled className="w-full" variant="outline">
                    <Check className="h-4 w-4 mr-2" />
                    Current Plan
                  </Button>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Benefits section */}
      <Card className="bg-gradient-to-r from-primary/5 to-secondary/5">
        <CardContent className="p-6">
          <div className="text-center space-y-4">
            <div className="flex items-center justify-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" />
              <h3 className="text-lg font-semibold">Why Students Upgrade</h3>
            </div>
            
            <div className="grid md:grid-cols-3 gap-4 text-sm">
              <div className="flex items-center gap-2">
                <Target className="h-4 w-4 text-green-600" />
                <span>3x faster studying</span>
              </div>
              <div className="flex items-center gap-2">
                <Zap className="h-4 w-4 text-blue-600" />
                <span>AI-powered insights</span>
              </div>
              <div className="flex items-center gap-2">
                <Trophy className="h-4 w-4 text-purple-600" />
                <span>Higher grades</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};