
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/auth';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface EmailDigestPreferences {
  id?: string;
  user_id: string;
  digest_enabled: boolean;
  digest_time: string;
  timezone: string;
  frequency: 'daily' | 'weekly' | 'never';
  include_goals: boolean;
  include_todos: boolean;
  include_completed: boolean;
  only_urgent: boolean;
  last_digest_sent_at?: string;
}

export const useEmailDigestPreferences = () => {
  const { user } = useAuth();
  const [preferences, setPreferences] = useState<EmailDigestPreferences | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchPreferences = async () => {
    if (!user) return;

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('email_digest_preferences')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      if (data) {
        // Type-cast the database response to ensure proper typing
        const typedData: EmailDigestPreferences = {
          ...data,
          frequency: data.frequency as 'daily' | 'weekly' | 'never'
        };
        setPreferences(typedData);
      } else {
        // Create default preferences
        const defaultPrefs = {
          user_id: user.id,
          digest_enabled: true,
          digest_time: '08:00:00',
          timezone: 'UTC',
          frequency: 'daily' as const,
          include_goals: true,
          include_todos: true,
          include_completed: false,
          only_urgent: false,
        };
        
        const { data: newData, error: insertError } = await supabase
          .from('email_digest_preferences')
          .insert(defaultPrefs)
          .select()
          .single();

        if (insertError) throw insertError;
        
        // Type-cast the database response
        const typedNewData: EmailDigestPreferences = {
          ...newData,
          frequency: newData.frequency as 'daily' | 'weekly' | 'never'
        };
        setPreferences(typedNewData);
      }
    } catch (error) {
      console.error('Error fetching email digest preferences:', error);
      toast.error('Failed to load email preferences');
    } finally {
      setLoading(false);
    }
  };

  const updatePreferences = async (updates: Partial<EmailDigestPreferences>) => {
    if (!user || !preferences) return;

    try {
      const { data, error } = await supabase
        .from('email_digest_preferences')
        .update(updates)
        .eq('user_id', user.id)
        .select()
        .single();

      if (error) throw error;

      // Type-cast the database response
      const typedData: EmailDigestPreferences = {
        ...data,
        frequency: data.frequency as 'daily' | 'weekly' | 'never'
      };
      setPreferences(typedData);
      toast.success('Email preferences updated');
    } catch (error) {
      console.error('Error updating email digest preferences:', error);
      toast.error('Failed to update email preferences');
    }
  };

  useEffect(() => {
    fetchPreferences();
  }, [user]);

  return {
    preferences,
    loading,
    updatePreferences,
    refetch: fetchPreferences
  };
};
