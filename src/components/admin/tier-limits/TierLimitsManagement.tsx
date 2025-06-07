
import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader, AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { TierLimitsTable } from "./TierLimitsTable";
import { EditTierLimitDialog } from "./EditTierLimitDialog";
import { toast } from "sonner";

export interface TierLimit {
  tier: string;
  max_notes: number;
  max_flashcard_sets: number;
  max_storage_mb: number;
  note_enrichment_limit_per_month: number | null;
  max_cards_per_set: number;
  max_ai_flashcard_generations_per_month: number;
  max_collaborations: number;
  ai_features_enabled: boolean;
  ai_flashcard_generation: boolean;
  note_enrichment_enabled: boolean;
  ocr_enabled: boolean;
  collaboration_enabled: boolean;
  priority_support: boolean;
  chat_enabled: boolean;
}

export const TierLimitsManagement = () => {
  const [editingTier, setEditingTier] = useState<TierLimit | null>(null);
  const queryClient = useQueryClient();

  const { data: tierLimits, isLoading, error } = useQuery({
    queryKey: ['admin-tier-limits'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('tier_limits')
        .select('*')
        .order('tier');

      if (error) {
        console.error('Error fetching tier limits:', error);
        throw error;
      }

      return data as TierLimit[];
    },
  });

  const updateTierLimitMutation = useMutation({
    mutationFn: async (updatedLimit: TierLimit) => {
      const { error } = await supabase
        .from('tier_limits')
        .update(updatedLimit)
        .eq('tier', updatedLimit.tier);

      if (error) throw error;
      return updatedLimit;
    },
    onSuccess: (updatedLimit) => {
      queryClient.invalidateQueries({ queryKey: ['admin-tier-limits'] });
      queryClient.invalidateQueries({ queryKey: ['tierLimits'] });
      toast.success(`Successfully updated ${updatedLimit.tier} tier limits`);
      setEditingTier(null);
    },
    onError: (error) => {
      console.error('Error updating tier limits:', error);
      toast.error('Failed to update tier limits');
    },
  });

  const handleEditTier = (tier: TierLimit) => {
    setEditingTier(tier);
  };

  const handleSaveTier = (updatedTier: TierLimit) => {
    updateTierLimitMutation.mutate(updatedTier);
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center h-64">
          <Loader className="h-8 w-8 animate-spin mb-4" />
          <p className="text-muted-foreground">Loading tier limits...</p>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          Failed to load tier limits: {error.message}
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>User Tier Limits Configuration</CardTitle>
          <CardDescription>
            Configure usage limits and feature access for each user tier. 
            Use -1 for unlimited values.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <TierLimitsTable 
            tierLimits={tierLimits || []} 
            onEditTier={handleEditTier}
          />
        </CardContent>
      </Card>

      <EditTierLimitDialog
        tierLimit={editingTier}
        open={!!editingTier}
        onOpenChange={(open) => !open && setEditingTier(null)}
        onSave={handleSaveTier}
        isLoading={updateTierLimitMutation.isPending}
      />
    </div>
  );
};
