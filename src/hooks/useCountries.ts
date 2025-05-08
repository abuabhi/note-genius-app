
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export type Country = {
  id: string;
  name: string;
  code: string;
  flag_url: string | null;
};

export const useCountries = () => {
  const { user } = useAuth();
  const [selectedCountry, setSelectedCountry] = useState<string | null>(null);

  // Fetch all countries
  const { data: countries = [], isLoading } = useQuery({
    queryKey: ["countries"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("countries")
        .select("*")
        .order("name");

      if (error) throw error;
      return data as Country[];
    },
  });

  // Fetch user's country
  const { data: userCountry } = useQuery({
    queryKey: ["userCountry", user?.id],
    queryFn: async () => {
      if (!user) return null;
      
      const { data, error } = await supabase
        .from("profiles")
        .select("country_id, countries(id, name, code, flag_url)")
        .eq("id", user.id)
        .single();
      
      if (error || !data) return null;
      return data.countries as Country;
    },
    enabled: !!user
  });

  // Update user's country preference
  const updateUserCountry = async (countryId: string) => {
    if (!user) return { success: false };
    
    const { error } = await supabase
      .from("profiles")
      .update({ country_id: countryId })
      .eq("id", user.id);
    
    if (error) return { success: false, error };
    setSelectedCountry(countryId);
    return { success: true };
  };

  return {
    countries,
    isLoading,
    userCountry,
    selectedCountry: selectedCountry || userCountry?.id,
    setSelectedCountry,
    updateUserCountry
  };
};
