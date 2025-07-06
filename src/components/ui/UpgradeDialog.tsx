import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { UserTier } from '@/hooks/useUserTier';
import { useSubscription } from '@/contexts/SubscriptionContext';
import { 
  Crown, 
  Zap, 
  Check, 
  Sparkles, 
  Brain, 
  Upload, 
  Users, 
  Star,
  ArrowRight
} from 'lucide-react';
import { toast } from 'sonner';

interface UpgradeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentTier: UserTier;
  targetTier: 'GRADUATE' | 'MASTER';
}

export const UpgradeDialog: React.FC<UpgradeDialogProps> = ({
  open,
  onOpenChange,
  currentTier,
  targetTier
}) => {
  const { createCheckoutSession } = useSubscription();

  const tierInfo = {
    GRADUATE: {
      name: 'Graduate',
      icon: Crown,
      price: '$9.99',
      tagline: 'AI-Powered Learning',
      color: 'from-mint-500 to-emerald-500',
      benefits: [
        { icon: Brain, text: 'AI Note Enrichment', desc: '50 enhancements/month' },
        { icon: Zap, text: 'AI Flashcard Generation', desc: '50 generations/month' },
        { icon: Upload, text: '10x More Storage', desc: '500MB vs 100MB' },
        { icon: Star, text: '10x More Notes', desc: '100 notes vs 10 notes' },
        { icon: Users, text: 'Collaboration', desc: 'Share with 5 people' },
        { icon: Sparkles, text: 'OCR Scanning', desc: 'Turn images into notes' }
      ]
    },
    MASTER: {
      name: 'Master',
      icon: Zap,
      price: '$19.99',
      tagline: 'Ultimate Learning Experience',
      color: 'from-purple-500 to-indigo-500',
      benefits: [
        { icon: Brain, text: 'Advanced AI Features', desc: '200 enhancements/month' },
        { icon: Zap, text: 'Unlimited AI Flashcards', desc: '200 generations/month' },
        { icon: Upload, text: 'Massive Storage', desc: '2GB storage space' },
        { icon: Star, text: '25x More Notes', desc: '250 notes capacity' },
        { icon: Users, text: 'Team Collaboration', desc: 'Share with 15 people' },
        { icon: Sparkles, text: 'Priority Support', desc: 'Get help faster' }
      ]
    }
  };

  const info = tierInfo[targetTier];
  const TierIcon = info.icon;

  const handleUpgrade = async () => {
    try {
      await createCheckoutSession(targetTier, 'monthly');
    } catch (error) {
      console.error('Error creating checkout session:', error);
      toast.error('Failed to start upgrade process');
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl p-0 overflow-hidden">
        {/* Hero Section */}
        <div className={`bg-gradient-to-r ${info.color} text-white p-6 text-center`}>
          <div className="flex items-center justify-center mb-4">
            <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
              <TierIcon className="h-6 w-6" />
            </div>
          </div>
          <DialogHeader className="text-center text-white space-y-2">
            <DialogTitle className="text-2xl font-bold text-white">
              Unlock {info.name} Features
            </DialogTitle>
            <DialogDescription className="text-white/90 text-base">
              {info.tagline}
            </DialogDescription>
          </DialogHeader>
          <Badge className="bg-white/20 text-white border-white/30 mt-2">
            Most Popular Choice
          </Badge>
        </div>

        {/* Benefits Section */}
        <div className="p-6">
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-mint-600" />
              What you'll unlock:
            </h3>
            <div className="grid gap-3">
              {info.benefits.map((benefit, index) => (
                <div key={index} className="flex items-start gap-3 p-3 bg-mint-50 rounded-lg">
                  <div className="w-8 h-8 bg-mint-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <benefit.icon className="h-4 w-4 text-mint-600" />
                  </div>
                  <div>
                    <div className="font-medium text-gray-900">{benefit.text}</div>
                    <div className="text-sm text-gray-600">{benefit.desc}</div>
                  </div>
                  <Check className="h-5 w-5 text-emerald-500 flex-shrink-0 mt-0.5" />
                </div>
              ))}
            </div>
          </div>

          {/* Social Proof */}
          <div className="bg-gradient-to-r from-gray-50 to-mint-50 rounded-lg p-4 mb-6">
            <div className="text-center">
              <div className="flex items-center justify-center gap-1 mb-2">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="h-4 w-4 text-yellow-400 fill-current" />
                ))}
              </div>
              <p className="text-sm text-gray-700 font-medium">
                Join 10,000+ students who've transformed their learning
              </p>
              <p className="text-xs text-gray-600 mt-1">
                "PrepGenie's AI features helped me ace my exams!" - Sarah M.
              </p>
            </div>
          </div>

          {/* Pricing & CTA */}
          <div className="space-y-4">
            <div className="text-center">
              <div className="text-3xl font-bold text-gray-900">
                {info.price}
                <span className="text-base font-normal text-gray-600">/month</span>
              </div>
              <p className="text-sm text-gray-600 mt-1">
                Less than a coffee per day ☕
              </p>
            </div>

            <div className="flex gap-3">
              <Button 
                onClick={handleUpgrade}
                className="flex-1 bg-gradient-to-r from-mint-600 to-emerald-600 hover:from-mint-700 hover:to-emerald-700 text-white font-medium py-3"
              >
                Unlock {info.name} Features
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </div>

            <div className="text-center">
              <p className="text-xs text-gray-500">
                ✓ 30-day money-back guarantee • ✓ Cancel anytime • ✓ Instant access
              </p>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};