
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
      // Fetch user profiles from the profiles table instead of the auth.admin API
      const { data: profiles, error } = await supabase
        .from('profiles')
        .select('id, username, user_tier, created_at, avatar_url');
        
      if (error) throw error;
      
      // For each profile, get the email from the users view if available
      // This approach avoids the need for admin privileges
      const { data: authUsers, error: authError } = await supabase
        .from('users')
        .select('id, email')
        .in('id', profiles.map(profile => profile.id));
      
      // If we can't access the users view, we'll just use the profiles data
      // and leave email fields empty or use username as a fallback
      const emailMap = new Map();
      
      if (!authError && authUsers) {
        authUsers.forEach(user => {
          emailMap.set(user.id, user.email);
        });
      }
      
      // Join the data
      const userData: User[] = profiles.map(profile => {
        return {
          id: profile.id,
          email: emailMap.get(profile.id) || `${profile.username || 'user'}@example.com`,
          username: profile.username || '',
          user_tier: profile.user_tier as UserTier,
          created_at: profile.created_at || new Date().toISOString(),
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
    updateUserTier 
  };
};
