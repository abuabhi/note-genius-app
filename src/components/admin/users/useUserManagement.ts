
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { UserTier } from "@/hooks/useRequireAuth";
import { User, InfluencerMetadata } from "./types";
import { useAuth } from "@/contexts/auth";

export const useUserManagement = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filter, setFilter] = useState<string>("all");
  const { toast } = useToast();
  const { user } = useAuth();

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      // Fetch user profiles from the profiles table
      const { data: profiles, error } = await supabase
        .from('profiles')
        .select(`
          id, username, user_tier, created_at, avatar_url, onboarding_completed,
          is_influencer, influencer_tier, influencer_metadata, influencer_promoted_at,
          influencer_promoted_by, influencer_expires_at, influencer_notes
        `);
        
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
          is_influencer: profile.is_influencer ?? false,
          influencer_tier: profile.influencer_tier,
          influencer_metadata: profile.influencer_metadata as InfluencerMetadata,
          influencer_promoted_at: profile.influencer_promoted_at,
          influencer_promoted_by: profile.influencer_promoted_by,
          influencer_expires_at: profile.influencer_expires_at,
          influencer_notes: profile.influencer_notes,
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

  const promoteToInfluencer = async (
    userId: string, 
    tier: 'GRADUATE' | 'MASTER',
    metadata: any,
    expirationMonths: number,
    notes?: string
  ) => {
    try {
      const expirationDate = new Date();
      expirationDate.setMonth(expirationDate.getMonth() + expirationMonths);
      
      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          is_influencer: true,
          influencer_tier: tier,
          influencer_metadata: metadata,
          influencer_promoted_at: new Date().toISOString(),
          influencer_promoted_by: user?.id,
          influencer_expires_at: expirationDate.toISOString(),
          influencer_notes: notes,
          user_tier: tier // Also update the actual tier
        })
        .eq('id', userId);
      
      if (profileError) throw profileError;

      // Create audit record
      const { error: auditError } = await supabase
        .from('influencer_promotions_audit')
        .insert({
          user_id: userId,
          promoted_by: user?.id,
          from_tier: users.find(u => u.id === userId)?.user_tier || 'SCHOLAR',
          to_tier: tier,
          expires_at: expirationDate.toISOString(),
          metadata,
          notes
        });

      if (auditError) throw auditError;
      
      // Update local state
      setUsers(users.map(u => 
        u.id === userId ? { 
          ...u, 
          is_influencer: true,
          influencer_tier: tier,
          influencer_metadata: metadata,
          influencer_promoted_at: new Date().toISOString(),
          influencer_expires_at: expirationDate.toISOString(),
          influencer_notes: notes,
          user_tier: tier as UserTier
        } : u
      ));
      
      toast({
        title: "User promoted to influencer",
        description: `User has been promoted to ${tier} tier as an influencer.`,
      });
    } catch (error) {
      console.error("Error promoting user to influencer:", error);
      toast({
        title: "Error promoting user",
        description: "Please try again later.",
        variant: "destructive",
      });
    }
  };

  const revokeInfluencer = async (userId: string, reason?: string) => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          is_influencer: false,
          influencer_tier: null,
          influencer_metadata: {},
          influencer_expires_at: null,
          influencer_notes: reason ? `Revoked: ${reason}` : 'Revoked',
          user_tier: 'SCHOLAR' // Revert to scholar
        })
        .eq('id', userId);
      
      if (error) throw error;
      
      // Update local state
      setUsers(users.map(u => 
        u.id === userId ? { 
          ...u, 
          is_influencer: false,
          influencer_tier: undefined,
          user_tier: UserTier.SCHOLAR
        } : u
      ));
      
      toast({
        title: "Influencer status revoked",
        description: "User has been reverted to SCHOLAR tier.",
      });
    } catch (error) {
      console.error("Error revoking influencer:", error);
      toast({
        title: "Error revoking influencer",
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
    let matchesTier = true;
    if (filter === "influencers") {
      matchesTier = user.is_influencer === true;
    } else if (filter === "non-influencers") {
      matchesTier = user.is_influencer !== true;
    } else if (filter !== "all") {
      matchesTier = user.user_tier === filter;
    }
    
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
    updateOnboardingStatus,
    promoteToInfluencer,
    revokeInfluencer
  };
};
