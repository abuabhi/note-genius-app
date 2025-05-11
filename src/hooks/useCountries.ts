
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/auth';
import { supabase } from '@/integrations/supabase/client';

export interface Country {
  id: string;
  name: string;
  code: string;
  flag_url?: string;
}

export const useCountries = () => {
  const { user } = useAuth();
  const [countries, setCountries] = useState<Country[]>([]);
  const [userCountry, setUserCountry] = useState<Country | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchCountries = async () => {
      setIsLoading(true);
      try {
        const { data, error } = await supabase
          .from('countries')
          .select('*')
          .order('name');

        if (error) throw error;
        setCountries(data as Country[]);

        if (user) {
          const { data: profileData, error: profileError } = await supabase
            .from('profiles')
            .select('country_id')
            .eq('id', user.id)
            .single();

          if (profileError) {
            console.warn('Error fetching user country:', profileError);
          } else if (profileData && profileData.country_id) {
            const userCountryData = data.find(c => c.id === profileData.country_id);
            if (userCountryData) {
              setUserCountry(userCountryData as Country);
            }
          }
        }
      } catch (error) {
        console.error('Error fetching countries:', error);
        setCountries([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCountries();
  }, [user]);

  const updateUserCountry = async (countryId: string) => {
    if (!user) return { success: false, error: 'User not authenticated' };

    try {
      const { error } = await supabase
        .from('profiles')
        .update({ country_id: countryId })
        .eq('id', user.id);

      if (error) throw error;

      const newUserCountry = countries.find(c => c.id === countryId);
      if (newUserCountry) {
        setUserCountry(newUserCountry);
      }

      return { success: true };
    } catch (error) {
      console.error('Error updating user country:', error);
      return { success: false, error };
    }
  };

  return { countries, userCountry, updateUserCountry, isLoading };
};
