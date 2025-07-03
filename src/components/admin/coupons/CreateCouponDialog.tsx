import React from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import { useForm, Controller } from 'react-hook-form';
import { useCouponManagement, CreateCouponData } from '@/hooks/admin/useCouponManagement';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface CreateCouponDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface FormData extends CreateCouponData {
  discount_type: 'percentage' | 'amount';
  discount_value: number;
  has_usage_limit: boolean;
  has_expiry: boolean;
  expiry_date?: Date;
}

export const CreateCouponDialog = ({ open, onOpenChange }: CreateCouponDialogProps) => {
  const { createCoupon, isCreating } = useCouponManagement();
  
  const { data: influencers } = useQuery({
    queryKey: ['active-influencers'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, username, user_tier')
        .eq('is_influencer', true)
        .order('username');
      
      if (error) throw error;
      return data;
    },
  });

  const { control, handleSubmit, watch, reset, formState: { errors } } = useForm<FormData>({
    defaultValues: {
      discount_type: 'percentage',
      discount_value: 10,
      has_usage_limit: false,
      has_expiry: false,
    }
  });

  const discountType = watch('discount_type');
  const hasUsageLimit = watch('has_usage_limit');
  const hasExpiry = watch('has_expiry');

  const onSubmit = (data: FormData) => {
    const couponData: CreateCouponData = {
      influencer_id: data.influencer_id,
      usage_limit: data.has_usage_limit ? data.usage_limit : undefined,
      expires_at: data.has_expiry ? data.expiry_date?.toISOString() : undefined,
    };

    if (data.discount_type === 'percentage') {
      couponData.discount_percentage = data.discount_value;
    } else {
      couponData.discount_amount = data.discount_value;
    }

    createCoupon(couponData);
    reset();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Create New Coupon</DialogTitle>
          <DialogDescription>
            Create a new coupon code for an influencer. The coupon code will be automatically generated.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="influencer_id">Select Influencer</Label>
            <Controller
              name="influencer_id"
              control={control}
              rules={{ required: 'Please select an influencer' }}
              render={({ field }) => (
                <Select onValueChange={field.onChange} value={field.value}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose an influencer" />
                  </SelectTrigger>
                  <SelectContent>
                    {influencers?.map((influencer) => (
                      <SelectItem key={influencer.id} value={influencer.id}>
                        <div className="flex items-center gap-2">
                          <span>{influencer.username}</span>
                          <span className="text-xs text-muted-foreground">
                            ({influencer.user_tier})
                          </span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
            {errors.influencer_id && (
              <p className="text-sm text-destructive">{errors.influencer_id.message}</p>
            )}
          </div>

          <div className="space-y-4">
            <Label>Discount Type</Label>
            <Controller
              name="discount_type"
              control={control}
              render={({ field }) => (
                <RadioGroup
                  onValueChange={field.onChange}
                  value={field.value}
                  className="flex gap-6"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="percentage" id="percentage" />
                    <Label htmlFor="percentage">Percentage Off</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="amount" id="amount" />
                    <Label htmlFor="amount">Fixed Amount Off</Label>
                  </div>
                </RadioGroup>
              )}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="discount_value">
              {discountType === 'percentage' ? 'Discount Percentage' : 'Discount Amount ($)'}
            </Label>
            <Controller
              name="discount_value"
              control={control}
              rules={{ 
                required: 'Discount value is required',
                min: { value: 0.01, message: 'Discount must be greater than 0' },
                max: discountType === 'percentage' ? 
                  { value: 100, message: 'Percentage cannot exceed 100%' } : 
                  undefined
              }}
              render={({ field }) => (
                <Input
                  type="number"
                  step="0.01"
                  placeholder={discountType === 'percentage' ? '10' : '5.00'}
                  {...field}
                  onChange={(e) => field.onChange(parseFloat(e.target.value))}
                />
              )}
            />
            {errors.discount_value && (
              <p className="text-sm text-destructive">{errors.discount_value.message}</p>
            )}
          </div>

          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Controller
                name="has_usage_limit"
                control={control}
                render={({ field }) => (
                  <input
                    type="checkbox"
                    id="has_usage_limit"
                    checked={field.value}
                    onChange={field.onChange}
                    className="rounded border-gray-300"
                  />
                )}
              />
              <Label htmlFor="has_usage_limit">Set usage limit</Label>
            </div>

            {hasUsageLimit && (
              <div className="ml-6 space-y-2">
                <Label htmlFor="usage_limit">Maximum Uses</Label>
                <Controller
                  name="usage_limit"
                  control={control}
                  rules={hasUsageLimit ? { 
                    required: 'Usage limit is required',
                    min: { value: 1, message: 'Usage limit must be at least 1' }
                  } : {}}
                  render={({ field }) => (
                    <Input
                      type="number"
                      placeholder="100"
                      {...field}
                      onChange={(e) => field.onChange(parseInt(e.target.value))}
                    />
                  )}
                />
                {errors.usage_limit && (
                  <p className="text-sm text-destructive">{errors.usage_limit.message}</p>
                )}
              </div>
            )}
          </div>

          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Controller
                name="has_expiry"
                control={control}
                render={({ field }) => (
                  <input
                    type="checkbox"
                    id="has_expiry"
                    checked={field.value}
                    onChange={field.onChange}
                    className="rounded border-gray-300"
                  />
                )}
              />
              <Label htmlFor="has_expiry">Set expiry date</Label>
            </div>

            {hasExpiry && (
              <div className="ml-6 space-y-2">
                <Label>Expiry Date</Label>
                <Controller
                  name="expiry_date"
                  control={control}
                  rules={hasExpiry ? { required: 'Expiry date is required' } : {}}
                  render={({ field }) => (
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className="w-full justify-start text-left font-normal"
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {field.value ? format(field.value, 'PPP') : 'Pick a date'}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          disabled={(date) => date < new Date()}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  )}
                />
                {errors.expiry_date && (
                  <p className="text-sm text-destructive">{errors.expiry_date.message}</p>
                )}
              </div>
            )}
          </div>

          <div className="flex justify-end gap-3">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isCreating}>
              {isCreating ? 'Creating...' : 'Create Coupon'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};