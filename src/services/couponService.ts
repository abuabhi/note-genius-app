import { supabase } from '@/integrations/supabase/client';

export interface CouponValidationResult {
  valid: boolean;
  coupon_id?: string;
  influencer_id?: string;
  discount_percentage?: number;
  discount_amount?: number;
  usage_limit?: number;
  current_usage?: number;
  error?: string;
}

export interface ApplyCouponParams {
  coupon_code: string;
  order_amount: number;
}

export interface ApplyCouponResult {
  discount_amount: number;
  final_amount: number;
  coupon_details: CouponValidationResult;
}

export class CouponService {
  static async validateCoupon(couponCode: string): Promise<CouponValidationResult> {
    try {
      const { data, error } = await supabase
        .rpc('validate_coupon', { coupon_code_param: couponCode });

      if (error) throw error;
      
      // Type guard to ensure data is the expected format
      if (data && typeof data === 'object' && 'valid' in data) {
        return data as unknown as CouponValidationResult;
      }
      
      return {
        valid: false,
        error: 'Invalid response format'
      };
    } catch (error) {
      console.error('Error validating coupon:', error);
      return {
        valid: false,
        error: 'Failed to validate coupon'
      };
    }
  }

  static async applyCoupon({ coupon_code, order_amount }: ApplyCouponParams): Promise<ApplyCouponResult> {
    const couponDetails = await this.validateCoupon(coupon_code);
    
    if (!couponDetails.valid) {
      throw new Error(couponDetails.error || 'Invalid coupon');
    }

    let discount_amount = 0;
    
    if (couponDetails.discount_percentage) {
      discount_amount = (order_amount * couponDetails.discount_percentage) / 100;
    } else if (couponDetails.discount_amount) {
      discount_amount = Math.min(couponDetails.discount_amount, order_amount);
    }

    const final_amount = Math.max(0, order_amount - discount_amount);

    return {
      discount_amount,
      final_amount,
      coupon_details: couponDetails
    };
  }

  static async recordCouponUsage(params: {
    stripe_session_id: string;
    customer_email: string;
    influencer_id: string;
    coupon_code: string;
    order_amount: number;
    discount_amount: number;
    commission_amount: number;
    commission_rate: number;
  }) {
    try {
      // Record the order
      const { error: orderError } = await supabase
        .from('influencer_orders')
        .insert({
          stripe_session_id: params.stripe_session_id,
          customer_email: params.customer_email,
          influencer_id: params.influencer_id,
          coupon_code: params.coupon_code,
          order_amount: params.order_amount,
          discount_amount: params.discount_amount,
          commission_amount: params.commission_amount,
          commission_rate: params.commission_rate,
          status: 'completed',
          processed_at: new Date().toISOString()
        });

      if (orderError) throw orderError;

      // Update coupon usage count by fetching current usage and incrementing
      const { data: currentCoupon, error: fetchError } = await supabase
        .from('influencer_coupons')
        .select('current_usage')
        .eq('coupon_code', params.coupon_code)
        .single();

      if (fetchError) throw fetchError;

      const { error: couponError } = await supabase
        .from('influencer_coupons')
        .update({ 
          current_usage: (currentCoupon.current_usage || 0) + 1
        })
        .eq('coupon_code', params.coupon_code);

      if (couponError) throw couponError;

      // Record in the existing coupon_usage table for analytics
      const { error: usageError } = await supabase
        .from('coupon_usage')
        .insert({
          coupon_code: params.coupon_code,
          user_id: null, // Customer not necessarily a user
          influencer_id: params.influencer_id,
          order_value: params.order_amount,
          commission_rate: params.commission_rate,
          commission_amount: params.commission_amount,
          status: 'active'
        });

      if (usageError) throw usageError;

      return { success: true };
    } catch (error) {
      console.error('Error recording coupon usage:', error);
      throw error;
    }
  }

  static async getInfluencerCoupons(influencerId: string) {
    const { data, error } = await supabase
      .from('influencer_coupons')
      .select('*')
      .eq('influencer_id', influencerId)
      .eq('is_active', true)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  }

  static async getInfluencerOrders(influencerId: string) {
    const { data, error } = await supabase
      .from('influencer_orders')
      .select('*')
      .eq('influencer_id', influencerId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  }
}