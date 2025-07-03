import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface InfluencerCoupon {
  id: string;
  influencer_id: string;
  coupon_code: string;
  discount_percentage?: number;
  discount_amount?: number;
  usage_limit?: number;
  current_usage: number;
  expires_at?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  profiles?: {
    username: string;
    user_tier: string;
  };
}

export interface CreateCouponData {
  influencer_id: string;
  discount_percentage?: number;
  discount_amount?: number;
  usage_limit?: number;
  expires_at?: string;
}

export const useCouponManagement = () => {
  const queryClient = useQueryClient();

  const {
    data: coupons,
    isLoading,
    error
  } = useQuery({
    queryKey: ['influencer-coupons'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('influencer_coupons')
        .select(`
          *,
          profiles!inner(username, user_tier)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as InfluencerCoupon[];
    },
  });

  const createCouponMutation = useMutation({
    mutationFn: async (couponData: CreateCouponData) => {
      // First get the influencer's username
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('username')
        .eq('id', couponData.influencer_id)
        .single();

      if (profileError) throw profileError;

      // Generate coupon code
      const { data: codeData, error: codeError } = await supabase
        .rpc('generate_influencer_coupon_code', {
          influencer_username: profile.username
        });

      if (codeError) throw codeError;

      // Create the coupon
      const { data, error } = await supabase
        .from('influencer_coupons')
        .insert({
          ...couponData,
          coupon_code: codeData
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['influencer-coupons'] });
      toast.success('Coupon created successfully');
    },
    onError: (error) => {
      toast.error(`Failed to create coupon: ${error.message}`);
    },
  });

  const updateCouponMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<InfluencerCoupon> }) => {
      const { data, error } = await supabase
        .from('influencer_coupons')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['influencer-coupons'] });
      toast.success('Coupon updated successfully');
    },
    onError: (error) => {
      toast.error(`Failed to update coupon: ${error.message}`);
    },
  });

  const deleteCouponMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('influencer_coupons')
        .update({ is_active: false })
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['influencer-coupons'] });
      toast.success('Coupon deactivated successfully');
    },
    onError: (error) => {
      toast.error(`Failed to deactivate coupon: ${error.message}`);
    },
  });

  return {
    coupons,
    isLoading,
    error,
    createCoupon: createCouponMutation.mutate,
    updateCoupon: updateCouponMutation.mutate,
    deleteCoupon: deleteCouponMutation.mutate,
    isCreating: createCouponMutation.isPending,
    isUpdating: updateCouponMutation.isPending,
    isDeleting: deleteCouponMutation.isPending,
  };
};