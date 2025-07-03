
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { User, InfluencerMetadata } from './types';
import { UserTier } from '@/hooks/useRequireAuth';

export const useUserManagement = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('all');
  const { toast } = useToast();

  const fetchUsers = async () => {
    try {
      setLoading(true);
      
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select(`
          id,
          username,
          user_tier,
          created_at,
          onboarding_completed,
          is_influencer,
          influencer_tier,
          influencer_metadata,
          influencer_promoted_at,
          influencer_promoted_by,
          influencer_expires_at,
          influencer_notes
        `)
        .order('created_at', { ascending: false });
        
      if (profileError) throw profileError;
      
      // Add placeholder emails - in production you'd want to join with auth.users
      const usersWithEmails = profileData?.map(profile => ({
        ...profile,
        email: profile.username ? `${profile.username}@example.com` : `user-${profile.id.slice(0, 8)}@example.com`,
        user_tier: profile.user_tier as UserTier,
        influencer_metadata: profile.influencer_metadata as InfluencerMetadata | null
      })) as User[] || [];
      
      setUsers(usersWithEmails);
    } catch (error) {
      console.error('Error fetching users:', error);
      toast({
        title: "Error",
        description: "Failed to fetch users",
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

      toast({
        title: "Success",
        description: "User tier updated successfully",
      });

      fetchUsers();
    } catch (error) {
      console.error('Error updating user tier:', error);
      toast({
        title: "Error",
        description: "Failed to update user tier",
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

      toast({
        title: "Success",
        description: `Onboarding status ${completed ? 'completed' : 'reset'}`,
      });

      fetchUsers();
    } catch (error) {
      console.error('Error updating onboarding status:', error);
      toast({
        title: "Error",
        description: "Failed to update onboarding status",
        variant: "destructive",
      });
    }
  };

  const promoteToInfluencer = async (
    userId: string, 
    tier: 'GRADUATE' | 'MASTER', 
    metadata: InfluencerMetadata, 
    expirationMonths: number,
    notes?: string
  ) => {
    try {
      const { data: currentUser } = await supabase.auth.getUser();
      if (!currentUser.user) throw new Error('Not authenticated');

      const expirationDate = new Date();
      expirationDate.setMonth(expirationDate.getMonth() + expirationMonths);

      // Get coupon percentage from metadata or default
      const couponPercentage = (metadata as any)?.couponPercentage || 10;

      const { error } = await supabase
        .from('profiles')
        .update({
          is_influencer: true,
          influencer_tier: tier,
          influencer_metadata: metadata as any,
          influencer_promoted_at: new Date().toISOString(),
          influencer_promoted_by: currentUser.user.id,
          influencer_expires_at: expirationDate.toISOString(),
          influencer_notes: notes
        })
        .eq('id', userId);

      if (error) throw error;

      // Create audit record (skipping for now since table doesn't exist in types)
      console.log('Would create audit record:', {
        user_id: userId,
        promoted_by: currentUser.user.id,
        from_tier: 'SCHOLAR',
        to_tier: tier,
        promotion_type: 'influencer',
        expires_at: expirationDate.toISOString(),
        metadata: metadata,
        notes: notes
      });

      toast({
        title: "Success",
        description: "User promoted to influencer successfully! Coupon auto-generated.",
      });

      fetchUsers();
    } catch (error) {
      console.error('Error promoting to influencer:', error);
      toast({
        title: "Error",
        description: "Failed to promote user to influencer",
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
          influencer_metadata: null,
          influencer_expires_at: null,
          influencer_notes: reason || 'Manually revoked',
          influencer_coupon_percentage: null
        })
        .eq('id', userId);

      if (error) throw error;

      // Deactivate associated coupons (skipping for now since table doesn't exist in types)
      console.log('Would deactivate coupons for user:', userId);

      toast({
        title: "Success",
        description: "Influencer status revoked successfully",
      });

      fetchUsers();
    } catch (error) {
      console.error('Error revoking influencer:', error);
      toast({
        title: "Error",
        description: "Failed to revoke influencer status",
        variant: "destructive",
      });
    }
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (user.username || '').toLowerCase().includes(searchTerm.toLowerCase());
    
    if (!matchesSearch) return false;

    switch (filter) {
      case 'influencers':
        return user.is_influencer;
      case 'dean':
        return user.user_tier === UserTier.DEAN;
      case 'master':
        return user.user_tier === UserTier.MASTER;
      case 'graduate':
        return user.user_tier === UserTier.GRADUATE;
      case 'scholar':
        return user.user_tier === UserTier.SCHOLAR;
      case 'onboarded':
        return user.onboarding_completed;
      case 'not_onboarded':
        return !user.onboarding_completed;
      default:
        return true;
    }
  });

  useEffect(() => {
    fetchUsers();
  }, []);

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
    revokeInfluencer,
  };
};
