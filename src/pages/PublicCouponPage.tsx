import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Ticket, Star, ArrowRight, Gift, Clock, Users } from "lucide-react";
import { CouponService } from "@/services/couponService";
import { toast } from "sonner";

const PublicCouponPage = () => {
  const { code } = useParams<{ code: string }>();
  const navigate = useNavigate();
  const [couponDetails, setCouponDetails] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const validateCoupon = async () => {
      if (!code) {
        setError("No coupon code provided");
        setLoading(false);
        return;
      }

      try {
        const result = await CouponService.validateCoupon(code);
        if (result.valid) {
          setCouponDetails(result);
        } else {
          setError(result.error || "Invalid coupon code");
        }
      } catch (err) {
        setError("Failed to validate coupon");
      } finally {
        setLoading(false);
      }
    };

    validateCoupon();
  }, [code]);

  const handleRedeem = () => {
    // Redirect to pricing page with coupon code
    navigate(`/pricing?coupon=${code}`);
  };

  const handleShare = async () => {
    const url = window.location.href;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Get ${getDiscountText()} off with this coupon!`,
          text: `Save money on your subscription with this exclusive coupon code: ${code}`,
          url: url,
        });
      } catch (err) {
        // Fallback to clipboard
        await navigator.clipboard.writeText(url);
        toast.success("Coupon link copied to clipboard!");
      }
    } else {
      // Fallback to clipboard
      await navigator.clipboard.writeText(url);
      toast.success("Coupon link copied to clipboard!");
    }
  };

  const getDiscountText = () => {
    if (!couponDetails) return "";
    
    if (couponDetails.discount_percentage) {
      return `${couponDetails.discount_percentage}%`;
    } else if (couponDetails.discount_amount) {
      return `$${couponDetails.discount_amount}`;
    }
    return "";
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary/5 to-secondary/5 flex items-center justify-center">
        <div className="text-center">
          <Ticket className="h-12 w-12 animate-pulse mx-auto mb-4 text-primary" />
          <p className="text-muted-foreground">Validating coupon...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-destructive/5 to-muted/5 flex items-center justify-center">
        <Card className="w-full max-w-md mx-4">
          <CardHeader className="text-center">
            <div className="mx-auto w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center mb-4">
              <Ticket className="h-8 w-8 text-destructive" />
            </div>
            <CardTitle className="text-destructive">Invalid Coupon</CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-muted-foreground mb-4">{error}</p>
            <Button onClick={() => navigate("/pricing")} variant="outline">
              View Pricing
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const isLimitedTime = couponDetails.usage_limit && couponDetails.current_usage;
  const usageRemaining = couponDetails.usage_limit - couponDetails.current_usage;

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5">
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-2xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-primary/10 rounded-full mb-4">
              <Gift className="h-10 w-10 text-primary" />
            </div>
            <h1 className="text-4xl font-bold mb-2">Exclusive Offer!</h1>
            <p className="text-xl text-muted-foreground">
              You've been invited to save with coupon code
            </p>
          </div>

          {/* Coupon Card */}
          <Card className="border-2 border-primary/20 shadow-lg mb-8">
            <CardHeader className="text-center bg-gradient-to-r from-primary/5 to-secondary/5">
              <div className="flex items-center justify-center gap-2 mb-2">
                <Ticket className="h-6 w-6 text-primary" />
                <Badge variant="secondary" className="font-mono text-lg px-4 py-1">
                  {code}
                </Badge>
              </div>
              <CardTitle className="text-3xl text-primary">
                Save {getDiscountText()}
              </CardTitle>
              <p className="text-muted-foreground">
                On your next subscription purchase
              </p>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="text-center">
                  <Star className="h-8 w-8 mx-auto mb-2 text-yellow-500" />
                  <p className="font-semibold">Premium Features</p>
                  <p className="text-sm text-muted-foreground">Full access included</p>
                </div>
                {isLimitedTime && (
                  <div className="text-center">
                    <Clock className="h-8 w-8 mx-auto mb-2 text-orange-500" />
                    <p className="font-semibold">Limited Time</p>
                    <p className="text-sm text-muted-foreground">
                      {usageRemaining} uses remaining
                    </p>
                  </div>
                )}
                <div className="text-center">
                  <Users className="h-8 w-8 mx-auto mb-2 text-blue-500" />
                  <p className="font-semibold">Trusted by Students</p>
                  <p className="text-sm text-muted-foreground">Join thousands learning</p>
                </div>
              </div>

              <div className="space-y-3">
                <Button 
                  onClick={handleRedeem} 
                  className="w-full text-lg py-6"
                  size="lg"
                >
                  Redeem Now & Save {getDiscountText()}
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
                
                <Button 
                  onClick={handleShare} 
                  variant="outline" 
                  className="w-full"
                >
                  Share This Deal
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Benefits */}
          <Card>
            <CardHeader>
              <CardTitle>What You'll Get</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                <li className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-primary rounded-full"></div>
                  <span>AI-powered study tools and flashcards</span>
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-primary rounded-full"></div>
                  <span>Advanced progress tracking and analytics</span>
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-primary rounded-full"></div>
                  <span>Unlimited notes and study sessions</span>
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-primary rounded-full"></div>
                  <span>Premium support and priority features</span>
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default PublicCouponPage;