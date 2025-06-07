
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Check, Crown, Zap, Shield, CreditCard, Calendar, Settings } from "lucide-react";
import { UserTier } from "@/hooks/useUserTier";
import { toast } from "@/hooks/use-toast";

interface MockStripeIntegrationProps {
  userTier: UserTier;
}

const tierPricing = {
  [UserTier.SCHOLAR]: { price: "Free", monthly: 0 },
  [UserTier.GRADUATE]: { price: "$9.99", monthly: 999 },
  [UserTier.MASTER]: { price: "$19.99", monthly: 1999 },
  [UserTier.DEAN]: { price: "$39.99", monthly: 3999 },
};

const tierFeatures = {
  [UserTier.SCHOLAR]: [
    "10 Notes",
    "5 Flashcard Sets", 
    "100MB Storage",
    "Basic Features"
  ],
  [UserTier.GRADUATE]: [
    "100 Notes",
    "25 Flashcard Sets",
    "500MB Storage", 
    "AI Features",
    "OCR Scanning"
  ],
  [UserTier.MASTER]: [
    "250 Notes",
    "50 Flashcard Sets",
    "2GB Storage",
    "Advanced AI Features",
    "Note Enrichment",
    "Priority Support"
  ],
  [UserTier.DEAN]: [
    "Unlimited Notes",
    "Unlimited Flashcard Sets", 
    "10GB Storage",
    "All Premium Features",
    "Priority Support",
    "Early Access"
  ],
};

const tierIcons = {
  [UserTier.SCHOLAR]: Crown,
  [UserTier.GRADUATE]: Zap,
  [UserTier.MASTER]: Shield,
  [UserTier.DEAN]: Crown,
};

export const MockStripeIntegration = ({ userTier }: MockStripeIntegrationProps) => {
  const [isUpgrading, setIsUpgrading] = useState(false);
  const [showBilling, setShowBilling] = useState(false);

  const handleMockUpgrade = async (targetTier: UserTier) => {
    setIsUpgrading(true);
    
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    toast({
      title: "Mock Upgrade Initiated",
      description: `Simulated upgrade to ${targetTier} tier. This is a demo - no payment processed.`,
    });
    
    setIsUpgrading(false);
  };

  const handleMockBilling = () => {
    toast({
      title: "Mock Billing Portal",
      description: "This would open Stripe Customer Portal in a real implementation.",
    });
  };

  const isCurrentTier = (tier: UserTier) => tier === userTier;
  const canUpgradeTo = (tier: UserTier) => {
    const tierOrder = [UserTier.SCHOLAR, UserTier.GRADUATE, UserTier.MASTER, UserTier.DEAN];
    return tierOrder.indexOf(tier) > tierOrder.indexOf(userTier);
  };

  return (
    <div className="space-y-6">
      {/* Mock Integration Notice */}
      <Alert className="border-amber-200 bg-amber-50">
        <Settings className="h-4 w-4 text-amber-600" />
        <AlertDescription className="text-amber-800">
          <strong>Demo Mode:</strong> This is a mock Stripe integration for demonstration purposes. 
          No real payments will be processed. Real Stripe integration coming soon!
        </AlertDescription>
      </Alert>

      {/* Current Subscription Status */}
      {userTier !== UserTier.SCHOLAR && (
        <Card className="border-mint-200 bg-mint-50/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-mint-800">
              <CreditCard className="h-5 w-5" />
              Current Subscription (Mock)
            </CardTitle>
            <CardDescription>Your subscription details and billing information</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">{userTier} Plan</p>
                <p className="text-sm text-muted-foreground">
                  {tierPricing[userTier].price}/month
                </p>
              </div>
              <Badge variant="default">Active</Badge>
            </div>
            
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="font-medium">Next Billing Date</p>
                <p className="text-muted-foreground flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  January 15, 2025
                </p>
              </div>
              <div>
                <p className="font-medium">Payment Method</p>
                <p className="text-muted-foreground">**** 4242 (Mock)</p>
              </div>
            </div>
            
            <Button 
              variant="outline" 
              onClick={handleMockBilling}
              className="w-full"
            >
              Manage Billing (Mock)
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Plan Comparison */}
      <Card>
        <CardHeader>
          <CardTitle>Choose Your Plan</CardTitle>
          <CardDescription>
            Select the plan that best fits your learning needs
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {Object.values(UserTier).map((tier) => {
              const TierIcon = tierIcons[tier];
              const isCurrent = isCurrentTier(tier);
              const canUpgrade = canUpgradeTo(tier);
              
              return (
                <div
                  key={tier}
                  className={`relative rounded-lg border p-4 ${
                    isCurrent 
                      ? 'border-mint-500 bg-mint-50 ring-2 ring-mint-200' 
                      : 'border-gray-200 hover:border-mint-300'
                  }`}
                >
                  {isCurrent && (
                    <Badge className="absolute -top-2 left-4 bg-mint-600">
                      Current Plan
                    </Badge>
                  )}
                  
                  <div className="text-center space-y-4">
                    <div>
                      <TierIcon className={`h-8 w-8 mx-auto ${
                        isCurrent ? 'text-mint-600' : 'text-gray-500'
                      }`} />
                      <h3 className="font-semibold mt-2">{tier}</h3>
                      <p className="text-2xl font-bold">{tierPricing[tier].price}</p>
                      {tier !== UserTier.SCHOLAR && (
                        <p className="text-sm text-muted-foreground">per month</p>
                      )}
                    </div>
                    
                    <ul className="space-y-2 text-sm">
                      {tierFeatures[tier].map((feature, index) => (
                        <li key={index} className="flex items-center gap-2">
                          <Check className="h-3 w-3 text-green-500 flex-shrink-0" />
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>
                    
                    {canUpgrade && (
                      <Button 
                        onClick={() => handleMockUpgrade(tier)}
                        disabled={isUpgrading}
                        className="w-full"
                      >
                        {isUpgrading ? "Processing..." : `Upgrade (Mock)`}
                      </Button>
                    )}
                    
                    {isCurrent && tier !== UserTier.SCHOLAR && (
                      <Button variant="outline" className="w-full" disabled>
                        Current Plan
                      </Button>
                    )}
                    
                    {tier === UserTier.SCHOLAR && !isCurrent && (
                      <Button variant="outline" className="w-full" disabled>
                        Downgrade (Contact Support)
                      </Button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Mock Billing History */}
      {userTier !== UserTier.SCHOLAR && (
        <Card>
          <CardHeader>
            <CardTitle>Billing History (Mock)</CardTitle>
            <CardDescription>Your recent payment history</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[
                { date: "Dec 15, 2024", amount: tierPricing[userTier].price, status: "Paid" },
                { date: "Nov 15, 2024", amount: tierPricing[userTier].price, status: "Paid" },
                { date: "Oct 15, 2024", amount: tierPricing[userTier].price, status: "Paid" },
              ].map((payment, index) => (
                <div key={index} className="flex justify-between items-center py-2 border-b last:border-b-0">
                  <div>
                    <p className="font-medium">{payment.date}</p>
                    <p className="text-sm text-muted-foreground">{userTier} Plan</p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">{payment.amount}</p>
                    <Badge variant="secondary" className="text-xs">
                      {payment.status}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
