
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
      // First get auth users
      const { data: authUsers, error: authError } = await supabase.auth.admin.listUsers();
      
      if (authError) throw authError;
      
      // Then get profiles for user_tier info
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('*');
        
      if (profilesError) throw profilesError;
      
      // Join the data
      const userData: User[] = authUsers.users.map(authUser => {
        const profile = profiles.find(p => p.id === authUser.id);
        return {
          id: authUser.id,
          email: authUser.email || '',
          username: profile?.username || authUser.email?.split('@')[0] || '',
          // Ensure we use the exact UserTier enum values
          user_tier: (profile?.user_tier as UserTier) || UserTier.SCHOLAR,
          created_at: authUser.created_at,
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
