import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Ticket, X } from 'lucide-react';
import { CouponService } from '@/services/couponService';
import { toast } from 'sonner';

interface CouponInputProps {
  orderAmount: number;
  onCouponApplied: (discount: number, couponCode: string, influencerId: string) => void;
  onCouponRemoved: () => void;
  appliedCoupon?: string;
}

export const CouponInput = ({ 
  orderAmount, 
  onCouponApplied, 
  onCouponRemoved, 
  appliedCoupon 
}: CouponInputProps) => {
  const [couponCode, setCouponCode] = useState('');
  const [isValidating, setIsValidating] = useState(false);

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) return;

    setIsValidating(true);
    try {
      const result = await CouponService.applyCoupon({
        coupon_code: couponCode.trim().toUpperCase(),
        order_amount: orderAmount
      });

      onCouponApplied(
        result.discount_amount, 
        couponCode.trim().toUpperCase(),
        result.coupon_details.influencer_id || ''
      );
      
      toast.success(`Coupon applied! You saved $${result.discount_amount.toFixed(2)}`);
      setCouponCode('');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Invalid coupon code');
    } finally {
      setIsValidating(false);
    }
  };

  const handleRemoveCoupon = () => {
    onCouponRemoved();
    toast.success('Coupon removed');
  };

  if (appliedCoupon) {
    return (
      <div className="flex items-center justify-between p-3 bg-success/10 border border-success rounded-lg">
        <div className="flex items-center gap-2">
          <Ticket className="h-4 w-4 text-success" />
          <span className="font-medium">Coupon Applied:</span>
          <Badge variant="outline" className="font-mono">
            {appliedCoupon}
          </Badge>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleRemoveCoupon}
          className="h-8 w-8 p-0"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <div className="flex gap-2">
        <Input
          placeholder="Enter coupon code"
          value={couponCode}
          onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
          onKeyDown={(e) => e.key === 'Enter' && handleApplyCoupon()}
          className="font-mono"
        />
        <Button
          onClick={handleApplyCoupon}
          disabled={!couponCode.trim() || isValidating}
          variant="outline"
        >
          {isValidating ? 'Validating...' : 'Apply'}
        </Button>
      </div>
    </div>
  );
};