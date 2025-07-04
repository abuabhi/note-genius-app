
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
      
      console.log('🔍 Fetching users via get-admin-users edge function...');
      
      // Call the admin edge function to get users with real emails
      const { data: usersData, error: usersError } = await supabase.functions.invoke('get-admin-users');
      
      console.log('📊 Edge function response:', { usersData, usersError });
      
      if (usersError) {
        console.error('❌ Edge function error:', usersError);
        throw usersError;
      }
      
      if (!usersData) {
        console.warn('⚠️ No users data returned from edge function');
        setUsers([]);
        return;
      }
      
      console.log('✅ Raw users data:', usersData);
      
      const usersWithTypedData = usersData.map((user: any) => ({
        ...user,
        user_tier: user.user_tier as UserTier,
        influencer_metadata: user.influencer_metadata as InfluencerMetadata | null
      })) as User[];
      
      console.log('🎯 Processed users:', usersWithTypedData);
      
      setUsers(usersWithTypedData);
      
      toast({
        title: "Success",
        description: `Loaded ${usersWithTypedData.length} users`,
      });
    } catch (error) {
      console.error('❌ Error fetching users:', error);
      toast({
        title: "Error",
        description: `Failed to fetch users: ${error instanceof Error ? error.message : 'Unknown error'}`,
        variant: "destructive",
      });
      setUsers([]); // Set empty array on error
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
      console.log('🚀 Starting influencer promotion...', { userId, tier, expirationMonths });
      
      const { data: currentUser } = await supabase.auth.getUser();
      if (!currentUser.user) {
        console.error('❌ User not authenticated');
        throw new Error('Not authenticated');
      }
      
      console.log('✅ Current user authenticated:', currentUser.user.id);

      const expirationDate = new Date();
      expirationDate.setMonth(expirationDate.getMonth() + expirationMonths);

      console.log('📅 Calculated expiration date:', expirationDate.toISOString());

      const updateData = {
        is_influencer: true,
        influencer_tier: tier,
        influencer_metadata: metadata,
        influencer_promoted_at: new Date().toISOString(),
        influencer_promoted_by: currentUser.user.id,
        influencer_expires_at: expirationDate.toISOString(),
        influencer_notes: notes || `Promoted to ${tier} influencer`
      };

      console.log('📊 Update data:', updateData);

      const { data: updateResult, error } = await supabase
        .from('profiles')
        .update(updateData)
        .eq('id', userId)
        .select();

      if (error) {
        console.error('❌ Database update error:', error);
        throw error;
      }

      console.log('✅ Database update successful:', updateResult);

      // Try to create audit record
      try {
        const { error: auditError } = await supabase
          .from('influencer_promotions_audit')
          .insert({
            user_id: userId,
            promoted_by: currentUser.user.id,
            from_tier: 'SCHOLAR',
            to_tier: tier,
            promotion_type: 'influencer',
            expires_at: expirationDate.toISOString(),
            metadata: metadata,
            notes: notes
          });

        if (auditError) {
          console.warn('⚠️ Audit record creation failed (non-critical):', auditError);
        } else {
          console.log('✅ Audit record created successfully');
        }
      } catch (auditErr) {
        console.warn('⚠️ Audit record creation error (non-critical):', auditErr);
      }

      toast({
        title: "Success",
        description: `User promoted to ${tier} influencer successfully!`,
      });

      // Refresh the users list
      await fetchUsers();
      
    } catch (error) {
      console.error('❌ Error promoting to influencer:', error);
      toast({
        title: "Error",
        description: `Failed to promote user: ${error instanceof Error ? error.message : 'Unknown error'}`,
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
