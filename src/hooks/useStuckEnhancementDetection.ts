import { useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

/**
 * Hook to detect and automatically reset stuck enhancement statuses
 */
export const useStuckEnhancementDetection = (noteId: string) => {
  const resetStuckEnhancements = useCallback(async (forceReset: boolean = false) => {
    if (!noteId) return;
    
    console.log(`🔍 Checking for stuck enhancement statuses for note: ${noteId.substring(0, 8)}`);
    
    try {
      // Get current enhancement statuses and timestamps
      const { data, error } = await supabase
        .from('notes')
        .select(`
          id,
          summary_status, summary_generated_at,
          key_points_status, key_points_generated_at,
          markdown_content_status, markdown_content_generated_at,
          questions_status, questions_generated_at,
          enriched_status, enriched_content_generated_at
        `)
        .eq('id', noteId)
        .single();

      if (error) {
        console.error('❌ Error checking enhancement statuses:', error);
        return;
      }

      if (!data) return;

      const now = new Date();
      const STUCK_THRESHOLD_MINUTES = 5; // Consider status stuck after 5 minutes
      const updates: Record<string, string> = {};

      // Check each enhancement type for stuck status
      const enhancements = [
        { status: data.summary_status, timestamp: data.summary_generated_at, field: 'summary_status' },
        { status: data.key_points_status, timestamp: data.key_points_generated_at, field: 'key_points_status' },
        { status: data.markdown_content_status, timestamp: data.markdown_content_generated_at, field: 'markdown_content_status' },
        { status: data.questions_status, timestamp: data.questions_generated_at, field: 'questions_status' },
        { status: data.enriched_status, timestamp: data.enriched_content_generated_at, field: 'enriched_status' }
      ];

      for (const enhancement of enhancements) {
        if (enhancement.status === 'generating') {
          // If no timestamp exists or it's older than threshold, consider it stuck
          let isStuck = false;
          
          if (!enhancement.timestamp) {
            isStuck = true; // No timestamp but status is generating
          } else {
            const statusTime = new Date(enhancement.timestamp);
            const timeDiffMinutes = (now.getTime() - statusTime.getTime()) / (1000 * 60);
            isStuck = timeDiffMinutes > STUCK_THRESHOLD_MINUTES;
          }
          
          if (isStuck || forceReset) {
            updates[enhancement.field] = 'pending';
            console.log(`🔧 Resetting stuck ${enhancement.field} from 'generating' to 'pending'`);
          }
        }
      }

      // Apply updates if any
      if (Object.keys(updates).length > 0) {
        const { error: updateError } = await supabase
          .from('notes')
          .update({
            ...updates,
            updated_at: new Date().toISOString() // Force cache invalidation
          })
          .eq('id', noteId);

        if (updateError) {
          console.error('❌ Error resetting stuck statuses:', updateError);
        } else {
          console.log(`✅ Reset ${Object.keys(updates).length} stuck enhancement statuses:`, Object.keys(updates));
          
          // Force page reload to clear all cached state
          setTimeout(() => {
            window.location.reload();
          }, 1000);
        }
      } else {
        console.log('✅ No stuck enhancement statuses found');
      }
    } catch (error) {
      console.error('❌ Error in stuck enhancement detection:', error);
    }
  }, [noteId]);

  // Auto-check for stuck statuses on component mount
  useEffect(() => {
    resetStuckEnhancements();
  }, [resetStuckEnhancements]);

  return {
    resetStuckEnhancements
  };
};