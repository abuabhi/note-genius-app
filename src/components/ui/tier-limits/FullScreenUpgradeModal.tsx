import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Crown, 
  Zap, 
  Users, 
  TrendingUp, 
  Clock, 
  Star,
  ArrowRight,
  Sparkles,
  Trophy,
  Target
} from 'lucide-react';
import { UserTier } from '@/hooks/useUserTier';
import { useSubscription } from '@/contexts/SubscriptionContext';
import { cn } from '@/lib/utils';

interface FullScreenUpgradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentTier: UserTier;
  blockedFeature: string;
  usedCount?: number;
  limit?: number;
}

export const FullScreenUpgradeModal: React.FC<FullScreenUpgradeModalProps> = ({
  isOpen,
  onClose,
  currentTier,
  blockedFeature,
  usedCount,
  limit
}) => {
  const { createCheckoutSession } = useSubscription();
  const [timeLeft, setTimeLeft] = useState(10);
  const [isLoading, setIsLoading] = useState(false);

  // Countdown timer for urgency
  useEffect(() => {
    if (!isOpen) return;
    
    const timer = setInterval(() => {
      setTimeLeft(prev => prev > 0 ? prev - 1 : 0);
    }, 1000);

    return () => clearInterval(timer);
  }, [isOpen]);

  const getUpgradeInfo = () => {
    if (currentTier === UserTier.SCHOLAR) {
      return {
        tier: 'GRADUATE' as const,
        name: 'Graduate',
        price: '$9.99',
        originalPrice: '$19.99',
        discount: '50%',
        features: [
          '100 Notes (vs 10)',
          '25 Flashcard Sets (vs 5)', 
          '50 AI Generations/month',
          'OCR Text Recognition',
          'Priority Support',
          'Advanced Analytics'
        ]
      };
    } else if (currentTier === UserTier.GRADUATE) {
      return {
        tier: 'MASTER' as const,
        name: 'Master',
        price: '$19.99',
        originalPrice: '$39.99',
        discount: '50%',
        features: [
          '250 Notes (vs 100)',
          '50 Flashcard Sets (vs 25)',
          '200 AI Generations/month',
          'Unlimited Collaborations',
          'Custom Templates',
          'Export to Multiple Formats'
        ]
      };
    }
    return null;
  };

  const upgradeInfo = getUpgradeInfo();

  const handleUpgrade = async () => {
    if (!upgradeInfo) return;
    
    setIsLoading(true);
    try {
      await createCheckoutSession(upgradeInfo.tier, 'monthly');
    } catch (error) {
      console.error('Error upgrading:', error);
      setIsLoading(false);
    }
  };

  const socialProofStats = [
    { icon: <Users className="h-4 w-4" />, text: "15,000+ students upgraded", color: "text-green-600" },
    { icon: <TrendingUp className="h-4 w-4" />, text: "Average GPA increase: +0.8", color: "text-blue-600" },
    { icon: <Clock className="h-4 w-4" />, text: "Save 15+ hours/month", color: "text-purple-600" },
    { icon: <Star className="h-4 w-4" />, text: "4.9/5 student satisfaction", color: "text-yellow-600" }
  ];

  const testimonials = [
    {
      name: "Sarah M.",
      quote: "Upgraded after hitting my limit - best decision ever! My productivity doubled.",
      course: "Pre-Med"
    },
    {
      name: "James K.",
      quote: "The AI features alone saved me 20+ hours per week. Worth every penny.",
      course: "Computer Science"
    },
    {
      name: "Emma R.",
      quote: "From struggling to top 10% of my class after upgrading. Game changer!",
      course: "Business"
    }
  ];

  if (!upgradeInfo) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto p-0">
        <div className="relative bg-gradient-to-br from-primary/5 via-white to-secondary/5">
          {/* Header */}
          <DialogHeader className="p-6 pb-0">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-full bg-destructive/10">
                  <Target className="h-6 w-6 text-destructive" />
                </div>
                <div>
                  <DialogTitle className="text-2xl font-bold">
                    {blockedFeature} Limit Reached
                  </DialogTitle>
                  <p className="text-muted-foreground">
                    You've used {usedCount}/{limit} {blockedFeature.toLowerCase()}
                  </p>
                </div>
              </div>
              
              {/* Urgency timer */}
              <div className="text-center">
                <Badge variant="destructive" className="animate-pulse">
                  Limited Time: {timeLeft}s
                </Badge>
                <p className="text-xs text-muted-foreground mt-1">
                  50% off expires soon!
                </p>
              </div>
            </div>
          </DialogHeader>

          <div className="p-6 space-y-6">
            {/* Main upgrade card */}
            <Card className="border-2 border-primary/20 shadow-lg">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Crown className="h-6 w-6 text-primary" />
                    <CardTitle className="text-xl">
                      Upgrade to {upgradeInfo.name}
                    </CardTitle>
                    <Badge className="bg-green-100 text-green-800 border-green-200">
                      Most Popular
                    </Badge>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center gap-2">
                      <span className="text-lg line-through text-muted-foreground">
                        {upgradeInfo.originalPrice}
                      </span>
                      <span className="text-2xl font-bold text-primary">
                        {upgradeInfo.price}
                      </span>
                      <Badge variant="destructive">
                        {upgradeInfo.discount} OFF
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">/month</p>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  {upgradeInfo.features.map((feature, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <Sparkles className="h-4 w-4 text-primary" />
                      <span className="text-sm">{feature}</span>
                    </div>
                  ))}
                </div>
                
                <Button 
                  onClick={handleUpgrade}
                  className="w-full py-6 text-lg font-semibold bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    "Processing..."
                  ) : (
                    <>
                      <Crown className="h-5 w-5 mr-2" />
                      Upgrade Now - Save {upgradeInfo.discount}
                      <ArrowRight className="h-5 w-5 ml-2" />
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>

            {/* Social proof */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {socialProofStats.map((stat, index) => (
                <Card key={index} className="text-center p-3">
                  <div className={cn("flex items-center justify-center gap-1 mb-1", stat.color)}>
                    {stat.icon}
                    <Trophy className="h-3 w-3" />
                  </div>
                  <p className="text-xs font-medium">{stat.text}</p>
                </Card>
              ))}
            </div>

            {/* Testimonials */}
            <div className="space-y-3">
              <h3 className="font-semibold text-center mb-4">What Students Say</h3>
              <div className="grid md:grid-cols-3 gap-4">
                {testimonials.map((testimonial, index) => (
                  <Card key={index} className="p-4 bg-secondary/20">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="flex text-yellow-400">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} className="h-3 w-3 fill-current" />
                        ))}
                      </div>
                      <Badge variant="outline" className="text-xs">
                        {testimonial.course}
                      </Badge>
                    </div>
                    <p className="text-sm italic mb-2">"{testimonial.quote}"</p>
                    <p className="text-xs font-medium">- {testimonial.name}</p>
                  </Card>
                ))}
              </div>
            </div>

            {/* Bottom CTA */}
            <Card className="bg-gradient-to-r from-primary/10 to-secondary/10 border-primary/20">
              <CardContent className="p-4 text-center">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <Zap className="h-5 w-5 text-primary" />
                  <span className="font-semibold">Don't let limits hold you back!</span>
                </div>
                <p className="text-sm text-muted-foreground mb-3">
                  Join thousands of students who upgraded and transformed their learning
                </p>
                <Button 
                  variant="outline" 
                  onClick={onClose}
                  className="mr-2"
                >
                  Maybe Later
                </Button>
                <Button 
                  onClick={handleUpgrade}
                  disabled={isLoading}
                  className="bg-primary hover:bg-primary/90"
                >
                  {isLoading ? "Processing..." : "Upgrade Now"}
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};