
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { HelpAnalyticsMetrics } from '@/types/helpAnalytics';
import { helpContent } from '@/data/helpContent';

// Admin hook to fetch help analytics metrics
export const useHelpAnalyticsMetrics = (dateRange?: { from: Date; to: Date }) => {
  return useQuery({
    queryKey: ['help-analytics-metrics', dateRange],
    queryFn: async (): Promise<HelpAnalyticsMetrics> => {
      const whereClause = dateRange 
        ? `created_at >= '${dateRange.from.toISOString()}' AND created_at <= '${dateRange.to.toISOString()}'`
        : 'created_at >= NOW() - INTERVAL \'30 days\'';

      // Get total views
      const { data: totalViewsData } = await supabase
        .from('help_content_analytics')
        .select('id')
        .eq('event_type', 'view')
        .gte('created_at', dateRange?.from?.toISOString() || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString())
        .lte('created_at', dateRange?.to?.toISOString() || new Date().toISOString());

      // Get popular content
      const { data: popularContentData } = await supabase
        .from('help_content_analytics')
        .select('content_id')
        .eq('event_type', 'view')
        .gte('created_at', dateRange?.from?.toISOString() || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString())
        .lte('created_at', dateRange?.to?.toISOString() || new Date().toISOString());

      // Get search queries
      const { data: searchData } = await supabase
        .from('help_search_analytics')
        .select('search_term')
        .gte('created_at', dateRange?.from?.toISOString() || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString())
        .lte('created_at', dateRange?.to?.toISOString() || new Date().toISOString());

      // Get session durations
      const { data: sessionData } = await supabase
        .from('help_session_analytics')
        .select('total_duration_seconds')
        .not('total_duration_seconds', 'is', null)
        .gte('created_at', dateRange?.from?.toISOString() || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString())
        .lte('created_at', dateRange?.to?.toISOString() || new Date().toISOString());

      // Get video completion rates
      const { data: videoPlayData } = await supabase
        .from('help_content_analytics')
        .select('content_id')
        .eq('event_type', 'video_play')
        .gte('created_at', dateRange?.from?.toISOString() || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString())
        .lte('created_at', dateRange?.to?.toISOString() || new Date().toISOString());

      const { data: videoCompleteData } = await supabase
        .from('help_content_analytics')
        .select('content_id')
        .eq('event_type', 'video_complete')
        .gte('created_at', dateRange?.from?.toISOString() || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString())
        .lte('created_at', dateRange?.to?.toISOString() || new Date().toISOString());

      // Process data
      const totalViews = totalViewsData?.length || 0;

      // Count content views
      const contentViewCounts = popularContentData?.reduce((acc, item) => {
        acc[item.content_id] = (acc[item.content_id] || 0) + 1;
        return acc;
      }, {} as Record<string, number>) || {};

      const popularContent = Object.entries(contentViewCounts)
        .map(([content_id, views]) => {
          const content = helpContent.find(c => c.id === content_id);
          return {
            content_id,
            title: content?.title || 'Unknown Content',
            views
          };
        })
        .sort((a, b) => b.views - a.views)
        .slice(0, 10);

      // Count search terms
      const searchTermCounts = searchData?.reduce((acc, item) => {
        acc[item.search_term] = (acc[item.search_term] || 0) + 1;
        return acc;
      }, {} as Record<string, number>) || {};

      const searchQueries = Object.entries(searchTermCounts)
        .map(([search_term, count]) => ({ search_term, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 10);

      // Calculate average session duration
      const durations = sessionData?.map(s => s.total_duration_seconds).filter(Boolean) || [];
      const averageSessionDuration = durations.length > 0 
        ? durations.reduce((sum, duration) => sum + duration, 0) / durations.length 
        : 0;

      // Calculate video completion rate
      const videoPlays = videoPlayData?.length || 0;
      const videoCompletes = videoCompleteData?.length || 0;
      const videoCompletionRate = videoPlays > 0 ? (videoCompletes / videoPlays) * 100 : 0;

      return {
        totalViews,
        popularContent,
        searchQueries,
        averageSessionDuration,
        videoCompletionRate
      };
    },
    enabled: true
  });
};
