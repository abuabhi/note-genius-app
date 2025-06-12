
export interface HelpContentAnalytics {
  id: string;
  user_id: string;
  content_id: string;
  event_type: 'view' | 'video_play' | 'video_complete' | 'search' | 'interaction';
  context: string | null;
  session_id: string;
  metadata: Record<string, any>;
  created_at: string;
}

export interface HelpSearchAnalytics {
  id: string;
  user_id: string;
  search_term: string;
  results_count: number;
  selected_result_id: string | null;
  context: string | null;
  session_id: string;
  created_at: string;
}

export interface HelpSessionAnalytics {
  id: string;
  user_id: string;
  session_id: string;
  start_time: string;
  end_time: string | null;
  total_duration_seconds: number | null;
  pages_visited: number;
  videos_watched: number;
  searches_performed: number;
  context: string | null;
  created_at: string;
}

export interface HelpAnalyticsMetrics {
  totalViews: number;
  popularContent: Array<{
    content_id: string;
    title: string;
    views: number;
  }>;
  searchQueries: Array<{
    search_term: string;
    count: number;
  }>;
  averageSessionDuration: number;
  videoCompletionRate: number;
}
