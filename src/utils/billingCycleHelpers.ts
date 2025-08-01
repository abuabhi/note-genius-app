import { supabase } from "@/integrations/supabase/client";

/**
 * Get the current billing cycle dates for a user
 */
export const getUserBillingCycleDates = async (userId: string) => {
  try {
    const { data: subscriber, error } = await supabase
      .from('subscribers')
      .select('billing_cycle_start')
      .eq('user_id', userId)
      .single();

    if (error) {
      console.error('Error fetching subscriber data:', error);
      return null;
    }

    if (!subscriber?.billing_cycle_start) {
      console.warn('No billing cycle start date found for user');
      return null;
    }

    const billingCycleStart = new Date(subscriber.billing_cycle_start);
    const today = new Date();
    
    // Calculate the current billing cycle start by finding the most recent cycle start
    const currentYear = today.getFullYear();
    const currentMonth = today.getMonth();
    
    // Start with the user's original billing cycle start date
    let currentCycleStart = new Date(billingCycleStart);
    currentCycleStart.setFullYear(currentYear);
    currentCycleStart.setMonth(currentMonth);
    
    // If the cycle start day is greater than today's day, we're in the previous month's cycle
    if (currentCycleStart.getDate() > today.getDate()) {
      currentCycleStart.setMonth(currentCycleStart.getMonth() - 1);
    }
    
    // Calculate the end of the current cycle (day before next cycle starts)
    const currentCycleEnd = new Date(currentCycleStart);
    currentCycleEnd.setMonth(currentCycleEnd.getMonth() + 1);
    currentCycleEnd.setDate(currentCycleEnd.getDate() - 1);
    currentCycleEnd.setHours(23, 59, 59, 999);

    return {
      cycleStart: currentCycleStart,
      cycleEnd: currentCycleEnd,
      originalBillingStart: billingCycleStart
    };
  } catch (error) {
    console.error('Error calculating billing cycle dates:', error);
    return null;
  }
};

/**
 * Get AI enrichment usage count for the current billing cycle
 */
export const getAIEnrichmentCountForBillingCycle = async (userId: string) => {
  try {
    const billingDates = await getUserBillingCycleDates(userId);
    
    if (!billingDates) {
      console.warn('Could not determine billing cycle dates, returning total count');
      // Fallback to total count if we can't determine billing cycle
      const { count } = await supabase
        .from('note_enrichment_usage')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId);
      
      return count || 0;
    }

    console.log('Filtering AI enrichment by billing cycle:', {
      userId,
      cycleStart: billingDates.cycleStart.toISOString(),
      cycleEnd: billingDates.cycleEnd.toISOString()
    });

    const { count, error } = await supabase
      .from('note_enrichment_usage')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .gte('created_at', billingDates.cycleStart.toISOString())
      .lte('created_at', billingDates.cycleEnd.toISOString());

    if (error) {
      console.error('Error fetching AI enrichment count:', error);
      return 0;
    }

    console.log('AI enrichment count for current billing cycle:', count);
    return count || 0;
  } catch (error) {
    console.error('Error getting AI enrichment count for billing cycle:', error);
    return 0;
  }
};

/**
 * Handle tier upgrade with billing cycle tracking
 */
export const handleTierUpgrade = async (userId: string, fromTier: string, toTier: string) => {
  try {
    const billingDates = await getUserBillingCycleDates(userId);
    
    if (!billingDates) {
      throw new Error('Could not determine billing cycle dates');
    }

    // Calculate next billing date (end of current cycle + 1 day)
    const nextBillingDate = new Date(billingDates.cycleEnd);
    nextBillingDate.setDate(nextBillingDate.getDate() + 1);

    // Record the tier change for tracking and prorated billing
    const { error: historyError } = await supabase
      .from('tier_change_history')
      .insert({
        user_id: userId,
        from_tier: fromTier,
        to_tier: toTier,
        billing_cycle_start: billingDates.originalBillingStart.toISOString().split('T')[0],
        next_billing_date: nextBillingDate.toISOString().split('T')[0],
        change_date: new Date().toISOString()
      });

    if (historyError) {
      console.error('Error recording tier change history:', historyError);
      throw historyError;
    }

    console.log('Tier upgrade recorded successfully:', {
      userId,
      fromTier,
      toTier,
      nextBillingDate: nextBillingDate.toISOString()
    });

    return {
      success: true,
      nextBillingDate,
      billingCycleStart: billingDates.originalBillingStart
    };
  } catch (error) {
    console.error('Error handling tier upgrade:', error);
    throw error;
  }
};

/**
 * Initialize billing cycle for a new subscriber
 */
export const initializeBillingCycle = async (userId: string, subscriptionDate: Date, userEmail: string) => {
  try {
    const { error } = await supabase
      .from('subscribers')
      .upsert({
        user_id: userId,
        email: userEmail,
        billing_cycle_start: subscriptionDate.toISOString().split('T')[0] // Store as date
      });

    if (error) {
      console.error('Error initializing billing cycle:', error);
      throw error;
    }

    console.log('Billing cycle initialized for user:', userId, 'Starting:', subscriptionDate);
    return true;
  } catch (error) {
    console.error('Error initializing billing cycle:', error);
    throw error;
  }
};