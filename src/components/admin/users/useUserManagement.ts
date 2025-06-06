
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { UserTier } from "@/hooks/useRequireAuth";
import { User } from "./types";

export const useUserManagement = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filter, setFilter] = useState<string>("all");
  const { toast } = useToast();

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      // Fetch user profiles from the profiles table
      const { data: profiles, error } = await supabase
        .from('profiles')
        .select('id, username, user_tier, created_at, avatar_url, onboarding_completed');
        
      if (error) throw error;
      
      // Since we can't reliably access user emails directly,
      // we'll create user data using available profile information
      const userData: User[] = profiles.map(profile => {
        // Create email from username or use a placeholder
        const emailAddress = profile.username 
          ? `${profile.username}@example.com` 
          : `user-${profile.id.substring(0, 8)}@example.com`;
        
        return {
          id: profile.id,
          email: emailAddress,
          username: profile.username || '',
          user_tier: profile.user_tier as UserTier,
          created_at: profile.created_at || new Date().toISOString(),
          onboarding_completed: profile.onboarding_completed ?? false,
        };
      });
      
      setUsers(userData);
    } catch (error) {
      console.error("Error fetching users:", error);
      toast({
        title: "Error fetching users",
        description: "Please try again later.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const updateUserTier = async (userId: string, newTier: UserTier) => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ user_tier: newTier })
        .eq('id', userId);
      
      if (error) throw error;
      
      // Update local state
      setUsers(users.map(user => 
        user.id === userId ? { ...user, user_tier: newTier } : user
      ));
      
      toast({
        title: "User tier updated",
        description: "The user's tier has been successfully updated.",
      });
    } catch (error) {
      console.error("Error updating user tier:", error);
      toast({
        title: "Error updating user tier",
        description: "Please try again later.",
        variant: "destructive",
      });
    }
  };

  const updateOnboardingStatus = async (userId: string, completed: boolean) => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ onboarding_completed: completed })
        .eq('id', userId);
      
      if (error) throw error;
      
      // Update local state
      setUsers(users.map(user => 
        user.id === userId ? { ...user, onboarding_completed: completed } : user
      ));
      
      toast({
        title: "Onboarding status updated",
        description: `User's onboarding has been ${completed ? 'completed' : 'reset'}.`,
      });
    } catch (error) {
      console.error("Error updating onboarding status:", error);
      toast({
        title: "Error updating onboarding status",
        description: "Please try again later.",
        variant: "destructive",
      });
    }
  };

  // Filter users by search term and tier
  const filteredUsers = users.filter(user => {
    // Filter by search term
    const matchesSearch = user.email.toLowerCase().includes(searchTerm.toLowerCase()) || 
                        user.username?.toLowerCase().includes(searchTerm.toLowerCase());
    
    // Filter by tier
    const matchesTier = filter === "all" || user.user_tier === filter;
    
    return matchesSearch && matchesTier;
  });

  return { 
    users,
    filteredUsers, 
    loading, 
    searchTerm, 
    setSearchTerm, 
    filter, 
    setFilter, 
    fetchUsers,
    updateUserTier,
    updateOnboardingStatus
  };
};
