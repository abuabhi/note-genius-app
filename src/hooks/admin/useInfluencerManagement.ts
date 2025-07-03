import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { User, InfluencerMetadata } from '@/components/admin/users/types';

export const useInfluencerManagement = () => {
  const [influencers, setInfluencers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('all');
  const { toast } = useToast();

  const fetchInfluencers = async () => {
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
        .eq('is_influencer', true)
        .order('influencer_promoted_at', { ascending: false });
        
      if (profileError) throw profileError;
      
      // Add placeholder emails - in production you'd want to join with auth.users
      const usersWithEmails = profileData?.map(profile => ({
        ...profile,
        email: profile.username ? `${profile.username}@example.com` : `user-${profile.id.slice(0, 8)}@example.com`,
        user_tier: profile.user_tier as any,
        influencer_metadata: profile.influencer_metadata as InfluencerMetadata
      })) as User[] || [];
      
      setInfluencers(usersWithEmails);
    } catch (error) {
      console.error('Error fetching influencers:', error);
      toast({
        title: "Error",
        description: "Failed to fetch influencers",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
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
          influencer_notes: reason || 'Manually revoked'
        })
        .eq('id', userId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Influencer status revoked successfully",
      });

      fetchInfluencers();
    } catch (error) {
      console.error('Error revoking influencer:', error);
      toast({
        title: "Error",
        description: "Failed to revoke influencer status",
        variant: "destructive",
      });
    }
  };

  const extendInfluencer = async (userId: string, months: number) => {
    try {
      const { data: profile } = await supabase
        .from('profiles')
        .select('influencer_expires_at')
        .eq('id', userId)
        .single();

      const currentExpiry = profile?.influencer_expires_at ? new Date(profile.influencer_expires_at) : new Date();
      const newExpiry = new Date(currentExpiry.getTime() + (months * 30 * 24 * 60 * 60 * 1000));

      const { error } = await supabase
        .from('profiles')
        .update({
          influencer_expires_at: newExpiry.toISOString()
        })
        .eq('id', userId);

      if (error) throw error;

      toast({
        title: "Success",
        description: `Influencer status extended by ${months} months`,
      });

      fetchInfluencers();
    } catch (error) {
      console.error('Error extending influencer:', error);
      toast({
        title: "Error",
        description: "Failed to extend influencer status",
        variant: "destructive",
      });
    }
  };

  const filteredInfluencers = influencers.filter(user => {
    const matchesSearch = user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (user.username || '').toLowerCase().includes(searchTerm.toLowerCase());
    
    if (!matchesSearch) return false;

    const now = new Date();
    const expiryDate = user.influencer_expires_at ? new Date(user.influencer_expires_at) : null;
    
    switch (filter) {
      case 'expiring':
        return expiryDate && expiryDate <= new Date(now.getTime() + (7 * 24 * 60 * 60 * 1000));
      case 'expired':
        return expiryDate && expiryDate < now;
      case 'graduate':
        return user.influencer_tier === 'GRADUATE';
      case 'master':
        return user.influencer_tier === 'MASTER';
      default:
        return true;
    }
  });

  useEffect(() => {
    fetchInfluencers();
  }, []);

  return {
    influencers: filteredInfluencers,
    loading,
    searchTerm,
    setSearchTerm,
    filter,
    setFilter,
    fetchInfluencers,
    revokeInfluencer,
    extendInfluencer,
  };
};