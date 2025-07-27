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
          <div className="mb-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-mint-600" />
              What you'll unlock:
            </h3>
            <div className="grid gap-2 md:grid-cols-2">
              {info.benefits.map((benefit, index) => (
                <div key={index} className="flex items-center gap-2 p-2 bg-mint-50 rounded-lg">
                  <div className="w-6 h-6 bg-mint-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <benefit.icon className="h-3 w-3 text-mint-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-gray-900 text-sm leading-tight">{benefit.text}</div>
                    <div className="text-xs text-gray-600 leading-tight">{benefit.desc}</div>
                  </div>
                  <Check className="h-4 w-4 text-emerald-500 flex-shrink-0" />
                </div>
              ))}
            </div>
          </div>

          {/* Combined Social Proof & Pricing */}
          <div className="bg-gradient-to-r from-gray-50 to-mint-50 rounded-lg p-4 mb-4">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-1 mb-1">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-3 w-3 text-yellow-400 fill-current" />
                  ))}
                  <span className="text-xs text-gray-600 ml-1">10,000+ students</span>
                </div>
                <p className="text-xs text-gray-600">
                  "AI features helped me ace my exams!" - Sarah M.
                </p>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-gray-900">
                  {info.price}
                  <span className="text-sm font-normal text-gray-600">/mo</span>
                </div>
                <p className="text-xs text-gray-600">Less than a coffee ☕</p>
              </div>
            </div>
          </div>

          {/* CTA Section */}
          <div className="space-y-3">
            <Button 
              onClick={handleUpgrade}
              className="w-full bg-gradient-to-r from-mint-600 to-emerald-600 hover:from-mint-700 hover:to-emerald-700 text-white font-medium py-3"
            >
              Unlock {info.name} Features
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>

            <p className="text-xs text-gray-500 text-center">
              ✓ 30-day money-back guarantee • ✓ Cancel anytime • ✓ Instant access
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};