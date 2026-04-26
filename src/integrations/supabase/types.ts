export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.3 (519615d)"
  }
  public: {
    Tables: {
      academic_calendars: {
        Row: {
          academic_year: string
          calendar_data: Json
          country_code: string
          created_at: string
          id: string
          institution_type: string
          state_region: string | null
          updated_at: string
        }
        Insert: {
          academic_year: string
          calendar_data?: Json
          country_code: string
          created_at?: string
          id?: string
          institution_type?: string
          state_region?: string | null
          updated_at?: string
        }
        Update: {
          academic_year?: string
          calendar_data?: Json
          country_code?: string
          created_at?: string
          id?: string
          institution_type?: string
          state_region?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      admin_rate_limiting: {
        Row: {
          action_type: string
          block_expires_at: string | null
          id: string
          is_blocked: boolean | null
          last_request_at: string | null
          request_count: number | null
          user_id: string
          window_start: string | null
        }
        Insert: {
          action_type: string
          block_expires_at?: string | null
          id?: string
          is_blocked?: boolean | null
          last_request_at?: string | null
          request_count?: number | null
          user_id: string
          window_start?: string | null
        }
        Update: {
          action_type?: string
          block_expires_at?: string | null
          id?: string
          is_blocked?: boolean | null
          last_request_at?: string | null
          request_count?: number | null
          user_id?: string
          window_start?: string | null
        }
        Relationships: []
      }
      admin_settings: {
        Row: {
          created_at: string
          id: string
          setting_key: string
          setting_value: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          setting_key: string
          setting_value: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          setting_key?: string
          setting_value?: string
          updated_at?: string
        }
        Relationships: []
      }
      admin_todos: {
        Row: {
          completed_at: string | null
          created_at: string
          created_by: string | null
          description: string | null
          due_date: string | null
          id: string
          priority: string
          status: string
          title: string
          updated_at: string
        }
        Insert: {
          completed_at?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          due_date?: string | null
          id?: string
          priority?: string
          status?: string
          title: string
          updated_at?: string
        }
        Update: {
          completed_at?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          due_date?: string | null
          id?: string
          priority?: string
          status?: string
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      announcements: {
        Row: {
          background_color: string | null
          compact_text: string | null
          content: string
          created_at: string | null
          created_by: string
          cta_text: string | null
          cta_url: string | null
          dismissible: boolean | null
          end_date: string
          id: string
          is_active: boolean | null
          mobile_layout: string | null
          priority: number | null
          start_date: string
          target_pages: Json | null
          target_tier: string | null
          text_align: string | null
          text_color: string | null
          title: string
          updated_at: string | null
        }
        Insert: {
          background_color?: string | null
          compact_text?: string | null
          content: string
          created_at?: string | null
          created_by: string
          cta_text?: string | null
          cta_url?: string | null
          dismissible?: boolean | null
          end_date: string
          id?: string
          is_active?: boolean | null
          mobile_layout?: string | null
          priority?: number | null
          start_date: string
          target_pages?: Json | null
          target_tier?: string | null
          text_align?: string | null
          text_color?: string | null
          title: string
          updated_at?: string | null
        }
        Update: {
          background_color?: string | null
          compact_text?: string | null
          content?: string
          created_at?: string | null
          created_by?: string
          cta_text?: string | null
          cta_url?: string | null
          dismissible?: boolean | null
          end_date?: string
          id?: string
          is_active?: boolean | null
          mobile_layout?: string | null
          priority?: number | null
          start_date?: string
          target_pages?: Json | null
          target_tier?: string | null
          text_align?: string | null
          text_color?: string | null
          title?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      app_features: {
        Row: {
          created_at: string
          description: string
          feature_key: string
          id: string
          is_enabled: boolean
          requires_tier: Database["public"]["Enums"]["user_tier"] | null
          updated_at: string
          visibility_mode: string
        }
        Insert: {
          created_at?: string
          description: string
          feature_key: string
          id?: string
          is_enabled?: boolean
          requires_tier?: Database["public"]["Enums"]["user_tier"] | null
          updated_at?: string
          visibility_mode?: string
        }
        Update: {
          created_at?: string
          description?: string
          feature_key?: string
          id?: string
          is_enabled?: boolean
          requires_tier?: Database["public"]["Enums"]["user_tier"] | null
          updated_at?: string
          visibility_mode?: string
        }
        Relationships: []
      }
      blog_analytics: {
        Row: {
          avg_time_on_page: number | null
          bounce_rate: number | null
          created_at: string | null
          date: string
          id: string
          post_id: string | null
          unique_visitors: number | null
          views: number | null
        }
        Insert: {
          avg_time_on_page?: number | null
          bounce_rate?: number | null
          created_at?: string | null
          date: string
          id?: string
          post_id?: string | null
          unique_visitors?: number | null
          views?: number | null
        }
        Update: {
          avg_time_on_page?: number | null
          bounce_rate?: number | null
          created_at?: string | null
          date?: string
          id?: string
          post_id?: string | null
          unique_visitors?: number | null
          views?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "blog_analytics_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "blog_posts"
            referencedColumns: ["id"]
          },
        ]
      }
      blog_campaign_runs: {
        Row: {
          blog_post_id: string | null
          campaign_id: string
          completed_at: string | null
          error_message: string | null
          id: string
          run_at: string
          status: string
          topic_used: string | null
        }
        Insert: {
          blog_post_id?: string | null
          campaign_id: string
          completed_at?: string | null
          error_message?: string | null
          id?: string
          run_at?: string
          status?: string
          topic_used?: string | null
        }
        Update: {
          blog_post_id?: string | null
          campaign_id?: string
          completed_at?: string | null
          error_message?: string | null
          id?: string
          run_at?: string
          status?: string
          topic_used?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "blog_campaign_runs_blog_post_id_fkey"
            columns: ["blog_post_id"]
            isOneToOne: false
            referencedRelation: "blog_posts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "blog_campaign_runs_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "blog_campaigns"
            referencedColumns: ["id"]
          },
        ]
      }
      blog_campaign_topics: {
        Row: {
          campaign_id: string
          created_at: string
          id: string
          is_used: boolean | null
          last_used_at: string | null
          sort_order: number | null
          topic: string
        }
        Insert: {
          campaign_id: string
          created_at?: string
          id?: string
          is_used?: boolean | null
          last_used_at?: string | null
          sort_order?: number | null
          topic: string
        }
        Update: {
          campaign_id?: string
          created_at?: string
          id?: string
          is_used?: boolean | null
          last_used_at?: string | null
          sort_order?: number | null
          topic?: string
        }
        Relationships: [
          {
            foreignKeyName: "blog_campaign_topics_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "blog_campaigns"
            referencedColumns: ["id"]
          },
        ]
      }
      blog_campaigns: {
        Row: {
          auto_publish: boolean
          category_id: string | null
          content_type: string | null
          created_at: string
          description: string | null
          fixed_topic: string | null
          frequency_type: string
          frequency_value: number
          id: string
          is_active: boolean
          keywords: string[] | null
          last_run_at: string | null
          max_word_count: number | null
          min_word_count: number | null
          name: string
          next_run_at: string | null
          publish_delay_hours: number | null
          seo_keywords: string[] | null
          status: string
          topic_strategy: string
          updated_at: string
          user_id: string
        }
        Insert: {
          auto_publish?: boolean
          category_id?: string | null
          content_type?: string | null
          created_at?: string
          description?: string | null
          fixed_topic?: string | null
          frequency_type?: string
          frequency_value?: number
          id?: string
          is_active?: boolean
          keywords?: string[] | null
          last_run_at?: string | null
          max_word_count?: number | null
          min_word_count?: number | null
          name: string
          next_run_at?: string | null
          publish_delay_hours?: number | null
          seo_keywords?: string[] | null
          status?: string
          topic_strategy?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          auto_publish?: boolean
          category_id?: string | null
          content_type?: string | null
          created_at?: string
          description?: string | null
          fixed_topic?: string | null
          frequency_type?: string
          frequency_value?: number
          id?: string
          is_active?: boolean
          keywords?: string[] | null
          last_run_at?: string | null
          max_word_count?: number | null
          min_word_count?: number | null
          name?: string
          next_run_at?: string | null
          publish_delay_hours?: number | null
          seo_keywords?: string[] | null
          status?: string
          topic_strategy?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      blog_categories: {
        Row: {
          color: string | null
          created_at: string
          description: string | null
          id: string
          name: string
          slug: string
          updated_at: string
        }
        Insert: {
          color?: string | null
          created_at?: string
          description?: string | null
          id?: string
          name: string
          slug: string
          updated_at?: string
        }
        Update: {
          color?: string | null
          created_at?: string
          description?: string | null
          id?: string
          name?: string
          slug?: string
          updated_at?: string
        }
        Relationships: []
      }
      blog_generation_queue: {
        Row: {
          content_type: string | null
          created_at: string | null
          error_message: string | null
          generated_post_id: string | null
          id: string
          processed_at: string | null
          status: string | null
          target_keywords: string[] | null
          topic: string
        }
        Insert: {
          content_type?: string | null
          created_at?: string | null
          error_message?: string | null
          generated_post_id?: string | null
          id?: string
          processed_at?: string | null
          status?: string | null
          target_keywords?: string[] | null
          topic: string
        }
        Update: {
          content_type?: string | null
          created_at?: string | null
          error_message?: string | null
          generated_post_id?: string | null
          id?: string
          processed_at?: string | null
          status?: string | null
          target_keywords?: string[] | null
          topic?: string
        }
        Relationships: [
          {
            foreignKeyName: "blog_generation_queue_generated_post_id_fkey"
            columns: ["generated_post_id"]
            isOneToOne: false
            referencedRelation: "blog_posts"
            referencedColumns: ["id"]
          },
        ]
      }
      blog_post_tags: {
        Row: {
          created_at: string
          id: string
          post_id: string
          tag_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          post_id: string
          tag_id: string
        }
        Update: {
          created_at?: string
          id?: string
          post_id?: string
          tag_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "blog_post_tags_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "blog_posts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "blog_post_tags_tag_id_fkey"
            columns: ["tag_id"]
            isOneToOne: false
            referencedRelation: "blog_tags"
            referencedColumns: ["id"]
          },
        ]
      }
      blog_posts: {
        Row: {
          author_id: string | null
          auto_publish: boolean | null
          category_id: string | null
          content: string
          created_at: string
          excerpt: string | null
          featured_image_url: string | null
          id: string
          is_ai_generated: boolean | null
          is_featured: boolean | null
          keywords: string[] | null
          published_at: string | null
          reading_time_minutes: number | null
          scheduled_for: string | null
          seo_description: string | null
          seo_title: string | null
          slug: string
          status: string
          title: string
          updated_at: string
          view_count: number | null
        }
        Insert: {
          author_id?: string | null
          auto_publish?: boolean | null
          category_id?: string | null
          content: string
          created_at?: string
          excerpt?: string | null
          featured_image_url?: string | null
          id?: string
          is_ai_generated?: boolean | null
          is_featured?: boolean | null
          keywords?: string[] | null
          published_at?: string | null
          reading_time_minutes?: number | null
          scheduled_for?: string | null
          seo_description?: string | null
          seo_title?: string | null
          slug: string
          status?: string
          title: string
          updated_at?: string
          view_count?: number | null
        }
        Update: {
          author_id?: string | null
          auto_publish?: boolean | null
          category_id?: string | null
          content?: string
          created_at?: string
          excerpt?: string | null
          featured_image_url?: string | null
          id?: string
          is_ai_generated?: boolean | null
          is_featured?: boolean | null
          keywords?: string[] | null
          published_at?: string | null
          reading_time_minutes?: number | null
          scheduled_for?: string | null
          seo_description?: string | null
          seo_title?: string | null
          slug?: string
          status?: string
          title?: string
          updated_at?: string
          view_count?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "blog_posts_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "blog_categories"
            referencedColumns: ["id"]
          },
        ]
      }
      blog_tags: {
        Row: {
          created_at: string
          id: string
          name: string
          slug: string
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          slug: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          slug?: string
        }
        Relationships: []
      }
      chat_conversations: {
        Row: {
          created_at: string
          id: string
          last_message_at: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          last_message_at?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          last_message_at?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      chat_messages: {
        Row: {
          conversation_id: string
          created_at: string
          id: string
          is_read: boolean | null
          message: string
          sender_id: string
        }
        Insert: {
          conversation_id: string
          created_at?: string
          id?: string
          is_read?: boolean | null
          message: string
          sender_id: string
        }
        Update: {
          conversation_id?: string
          created_at?: string
          id?: string
          is_read?: boolean | null
          message?: string
          sender_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "chat_messages_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "chat_conversations"
            referencedColumns: ["id"]
          },
        ]
      }
      contact_rate_limit: {
        Row: {
          created_at: string
          id: string
          ip_address: string
          submissions_count: number
          window_start: string
        }
        Insert: {
          created_at?: string
          id?: string
          ip_address: string
          submissions_count?: number
          window_start?: string
        }
        Update: {
          created_at?: string
          id?: string
          ip_address?: string
          submissions_count?: number
          window_start?: string
        }
        Relationships: []
      }
      contact_submissions: {
        Row: {
          admin_notes: string | null
          created_at: string
          email: string
          id: string
          message: string
          name: string
          responded_at: string | null
          status: string
          subject: string | null
          updated_at: string
        }
        Insert: {
          admin_notes?: string | null
          created_at?: string
          email: string
          id?: string
          message: string
          name: string
          responded_at?: string | null
          status?: string
          subject?: string | null
          updated_at?: string
        }
        Update: {
          admin_notes?: string | null
          created_at?: string
          email?: string
          id?: string
          message?: string
          name?: string
          responded_at?: string | null
          status?: string
          subject?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      content_analysis_cache: {
        Row: {
          analysis_result: Json
          content_hash: string
          content_type: string
          created_at: string | null
          expires_at: string | null
          id: string
          subject: string | null
          user_id: string
        }
        Insert: {
          analysis_result?: Json
          content_hash: string
          content_type: string
          created_at?: string | null
          expires_at?: string | null
          id?: string
          subject?: string | null
          user_id: string
        }
        Update: {
          analysis_result?: Json
          content_hash?: string
          content_type?: string
          created_at?: string | null
          expires_at?: string | null
          id?: string
          subject?: string | null
          user_id?: string
        }
        Relationships: []
      }
      contest_entries: {
        Row: {
          contest_id: string
          created_at: string
          id: string
          is_eligible: boolean
          referrals_count: number
          updated_at: string
          user_id: string
        }
        Insert: {
          contest_id: string
          created_at?: string
          id?: string
          is_eligible?: boolean
          referrals_count?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          contest_id?: string
          created_at?: string
          id?: string
          is_eligible?: boolean
          referrals_count?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "contest_entries_contest_id_fkey"
            columns: ["contest_id"]
            isOneToOne: false
            referencedRelation: "contests"
            referencedColumns: ["id"]
          },
        ]
      }
      contests: {
        Row: {
          created_at: string
          description: string
          end_date: string
          id: string
          is_active: boolean
          min_referrals_required: number
          prize_description: string
          start_date: string
          title: string
        }
        Insert: {
          created_at?: string
          description: string
          end_date: string
          id?: string
          is_active?: boolean
          min_referrals_required?: number
          prize_description: string
          start_date: string
          title: string
        }
        Update: {
          created_at?: string
          description?: string
          end_date?: string
          id?: string
          is_active?: boolean
          min_referrals_required?: number
          prize_description?: string
          start_date?: string
          title?: string
        }
        Relationships: []
      }
      conversation_participants: {
        Row: {
          conversation_id: string
          created_at: string
          id: string
          last_read_at: string | null
          user_id: string
        }
        Insert: {
          conversation_id: string
          created_at?: string
          id?: string
          last_read_at?: string | null
          user_id: string
        }
        Update: {
          conversation_id?: string
          created_at?: string
          id?: string
          last_read_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "conversation_participants_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "chat_conversations"
            referencedColumns: ["id"]
          },
        ]
      }
      countries: {
        Row: {
          code: string
          created_at: string
          flag_url: string | null
          id: string
          name: string
        }
        Insert: {
          code: string
          created_at?: string
          flag_url?: string | null
          id?: string
          name: string
        }
        Update: {
          code?: string
          created_at?: string
          flag_url?: string | null
          id?: string
          name?: string
        }
        Relationships: []
      }
      coupon_usage: {
        Row: {
          commission_amount: number | null
          commission_rate: number | null
          coupon_code: string
          created_at: string | null
          id: string
          influencer_id: string | null
          order_value: number | null
          status: string | null
          usage_date: string | null
          user_id: string | null
        }
        Insert: {
          commission_amount?: number | null
          commission_rate?: number | null
          coupon_code: string
          created_at?: string | null
          id?: string
          influencer_id?: string | null
          order_value?: number | null
          status?: string | null
          usage_date?: string | null
          user_id?: string | null
        }
        Update: {
          commission_amount?: number | null
          commission_rate?: number | null
          coupon_code?: string
          created_at?: string | null
          id?: string
          influencer_id?: string | null
          order_value?: number | null
          status?: string | null
          usage_date?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "coupon_usage_influencer_id_fkey"
            columns: ["influencer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      curriculum_topics: {
        Row: {
          created_at: string | null
          difficulty_level: number | null
          grade_level: string
          id: string
          learning_objectives: string[] | null
          prerequisites: string[] | null
          related_topics: string[] | null
          subject_name: string
          topic_description: string | null
          topic_name: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          difficulty_level?: number | null
          grade_level: string
          id?: string
          learning_objectives?: string[] | null
          prerequisites?: string[] | null
          related_topics?: string[] | null
          subject_name: string
          topic_description?: string | null
          topic_name: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          difficulty_level?: number | null
          grade_level?: string
          id?: string
          learning_objectives?: string[] | null
          prerequisites?: string[] | null
          related_topics?: string[] | null
          subject_name?: string
          topic_description?: string | null
          topic_name?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      digest_content_cache: {
        Row: {
          content_data: Json
          content_type: string
          expires_at: string | null
          generated_at: string | null
          id: string
          user_id: string
        }
        Insert: {
          content_data: Json
          content_type: string
          expires_at?: string | null
          generated_at?: string | null
          id?: string
          user_id: string
        }
        Update: {
          content_data?: Json
          content_type?: string
          expires_at?: string | null
          generated_at?: string | null
          id?: string
          user_id?: string
        }
        Relationships: []
      }
      email_digest_preferences: {
        Row: {
          created_at: string | null
          digest_enabled: boolean | null
          digest_time: string | null
          flashcards_limit: number | null
          frequency: string | null
          id: string
          include_completed: boolean | null
          include_flashcards: boolean | null
          include_goals: boolean | null
          include_notes: boolean | null
          include_quizzes: boolean | null
          include_recommendations: boolean | null
          include_streaks: boolean | null
          include_study_sessions: boolean | null
          include_todos: boolean | null
          last_digest_sent_at: string | null
          notes_limit: number | null
          only_urgent: boolean | null
          quizzes_limit: number | null
          study_sessions_limit: number | null
          timezone: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          digest_enabled?: boolean | null
          digest_time?: string | null
          flashcards_limit?: number | null
          frequency?: string | null
          id?: string
          include_completed?: boolean | null
          include_flashcards?: boolean | null
          include_goals?: boolean | null
          include_notes?: boolean | null
          include_quizzes?: boolean | null
          include_recommendations?: boolean | null
          include_streaks?: boolean | null
          include_study_sessions?: boolean | null
          include_todos?: boolean | null
          last_digest_sent_at?: string | null
          notes_limit?: number | null
          only_urgent?: boolean | null
          quizzes_limit?: number | null
          study_sessions_limit?: number | null
          timezone?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          digest_enabled?: boolean | null
          digest_time?: string | null
          flashcards_limit?: number | null
          frequency?: string | null
          id?: string
          include_completed?: boolean | null
          include_flashcards?: boolean | null
          include_goals?: boolean | null
          include_notes?: boolean | null
          include_quizzes?: boolean | null
          include_recommendations?: boolean | null
          include_streaks?: boolean | null
          include_study_sessions?: boolean | null
          include_todos?: boolean | null
          last_digest_sent_at?: string | null
          notes_limit?: number | null
          only_urgent?: boolean | null
          quizzes_limit?: number | null
          study_sessions_limit?: number | null
          timezone?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      events: {
        Row: {
          all_day: boolean | null
          color: string | null
          created_at: string
          description: string | null
          end_time: string
          event_type: string
          flashcard_set_id: string | null
          id: string
          is_recurring: boolean | null
          recurrence_pattern: Json | null
          start_time: string
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          all_day?: boolean | null
          color?: string | null
          created_at?: string
          description?: string | null
          end_time: string
          event_type?: string
          flashcard_set_id?: string | null
          id?: string
          is_recurring?: boolean | null
          recurrence_pattern?: Json | null
          start_time: string
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          all_day?: boolean | null
          color?: string | null
          created_at?: string
          description?: string | null
          end_time?: string
          event_type?: string
          flashcard_set_id?: string | null
          id?: string
          is_recurring?: boolean | null
          recurrence_pattern?: Json | null
          start_time?: string
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "events_flashcard_set_id_fkey"
            columns: ["flashcard_set_id"]
            isOneToOne: false
            referencedRelation: "flashcard_sets"
            referencedColumns: ["id"]
          },
        ]
      }
      exam_topic_links: {
        Row: {
          created_at: string
          id: string
          resource_id: string
          resource_type: string
          topic_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          resource_id: string
          resource_type: string
          topic_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          resource_id?: string
          resource_type?: string
          topic_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "exam_topic_links_topic_id_fkey"
            columns: ["topic_id"]
            isOneToOne: false
            referencedRelation: "exam_topics"
            referencedColumns: ["id"]
          },
        ]
      }
      exam_topics: {
        Row: {
          created_at: string
          exam_id: string
          id: string
          name: string
          position: number
          status: string
          updated_at: string
          user_id: string
          weight: number
        }
        Insert: {
          created_at?: string
          exam_id: string
          id?: string
          name: string
          position?: number
          status?: string
          updated_at?: string
          user_id: string
          weight?: number
        }
        Update: {
          created_at?: string
          exam_id?: string
          id?: string
          name?: string
          position?: number
          status?: string
          updated_at?: string
          user_id?: string
          weight?: number
        }
        Relationships: [
          {
            foreignKeyName: "exam_topics_exam_id_fkey"
            columns: ["exam_id"]
            isOneToOne: false
            referencedRelation: "exams"
            referencedColumns: ["id"]
          },
        ]
      }
      exams: {
        Row: {
          created_at: string
          event_id: string | null
          exam_date: string
          id: string
          location: string | null
          notes: string | null
          status: string
          study_plan_id: string | null
          subject_id: string | null
          target_readiness: number
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          event_id?: string | null
          exam_date: string
          id?: string
          location?: string | null
          notes?: string | null
          status?: string
          study_plan_id?: string | null
          subject_id?: string | null
          target_readiness?: number
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          event_id?: string | null
          exam_date?: string
          id?: string
          location?: string | null
          notes?: string | null
          status?: string
          study_plan_id?: string | null
          subject_id?: string | null
          target_readiness?: number
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "exams_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "exams_study_plan_id_fkey"
            columns: ["study_plan_id"]
            isOneToOne: false
            referencedRelation: "study_plans"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "exams_subject_id_fkey"
            columns: ["subject_id"]
            isOneToOne: false
            referencedRelation: "user_subjects"
            referencedColumns: ["id"]
          },
        ]
      }
      feedback: {
        Row: {
          admin_response: string | null
          created_at: string
          description: string | null
          id: string
          priority: string | null
          rating: number | null
          responded_at: string | null
          responded_by: string | null
          severity: string | null
          status: string
          title: string
          type: string
          updated_at: string
          user_id: string
        }
        Insert: {
          admin_response?: string | null
          created_at?: string
          description?: string | null
          id?: string
          priority?: string | null
          rating?: number | null
          responded_at?: string | null
          responded_by?: string | null
          severity?: string | null
          status?: string
          title: string
          type: string
          updated_at?: string
          user_id: string
        }
        Update: {
          admin_response?: string | null
          created_at?: string
          description?: string | null
          id?: string
          priority?: string | null
          rating?: number | null
          responded_at?: string | null
          responded_by?: string | null
          severity?: string | null
          status?: string
          title?: string
          type?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      feedback_attachments: {
        Row: {
          created_at: string
          feedback_id: string
          file_name: string
          file_size: number | null
          file_type: string
          file_url: string
          id: string
        }
        Insert: {
          created_at?: string
          feedback_id: string
          file_name: string
          file_size?: number | null
          file_type: string
          file_url: string
          id?: string
        }
        Update: {
          created_at?: string
          feedback_id?: string
          file_name?: string
          file_size?: number | null
          file_type?: string
          file_url?: string
          id?: string
        }
        Relationships: [
          {
            foreignKeyName: "feedback_attachments_feedback_id_fkey"
            columns: ["feedback_id"]
            isOneToOne: false
            referencedRelation: "feedback"
            referencedColumns: ["id"]
          },
        ]
      }
      flashcard_set_cards: {
        Row: {
          created_at: string
          flashcard_id: string
          id: string
          position: number
          set_id: string
        }
        Insert: {
          created_at?: string
          flashcard_id: string
          id?: string
          position: number
          set_id: string
        }
        Update: {
          created_at?: string
          flashcard_id?: string
          id?: string
          position?: number
          set_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "flashcard_set_cards_flashcard_id_fkey"
            columns: ["flashcard_id"]
            isOneToOne: false
            referencedRelation: "flashcards"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "flashcard_set_cards_set_id_fkey"
            columns: ["set_id"]
            isOneToOne: false
            referencedRelation: "flashcard_sets"
            referencedColumns: ["id"]
          },
        ]
      }
      flashcard_sets: {
        Row: {
          card_count: number | null
          country_id: string | null
          created_at: string
          description: string | null
          education_system: string | null
          id: string
          is_built_in: boolean | null
          name: string
          section_id: string | null
          subject: string | null
          subject_id: string | null
          topic: string | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          card_count?: number | null
          country_id?: string | null
          created_at?: string
          description?: string | null
          education_system?: string | null
          id?: string
          is_built_in?: boolean | null
          name: string
          section_id?: string | null
          subject?: string | null
          subject_id?: string | null
          topic?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          card_count?: number | null
          country_id?: string | null
          created_at?: string
          description?: string | null
          education_system?: string | null
          id?: string
          is_built_in?: boolean | null
          name?: string
          section_id?: string | null
          subject?: string | null
          subject_id?: string | null
          topic?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "flashcard_sets_country_id_fkey"
            columns: ["country_id"]
            isOneToOne: false
            referencedRelation: "countries"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "flashcard_sets_section_id_fkey"
            columns: ["section_id"]
            isOneToOne: false
            referencedRelation: "sections"
            referencedColumns: ["id"]
          },
        ]
      }
      flashcards: {
        Row: {
          back_content: string
          created_at: string
          difficulty: number | null
          front_content: string
          id: string
          is_built_in: boolean | null
          last_reviewed_at: string | null
          next_review_at: string | null
          set_id: string | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          back_content: string
          created_at?: string
          difficulty?: number | null
          front_content: string
          id?: string
          is_built_in?: boolean | null
          last_reviewed_at?: string | null
          next_review_at?: string | null
          set_id?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          back_content?: string
          created_at?: string
          difficulty?: number | null
          front_content?: string
          id?: string
          is_built_in?: boolean | null
          last_reviewed_at?: string | null
          next_review_at?: string | null
          set_id?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "flashcards_set_id_fkey"
            columns: ["set_id"]
            isOneToOne: false
            referencedRelation: "flashcard_sets"
            referencedColumns: ["id"]
          },
        ]
      }
      grades: {
        Row: {
          created_at: string
          description: string | null
          id: string
          level: number
          name: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          level: number
          name: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          level?: number
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
      help_content_analytics: {
        Row: {
          content_id: string
          context: string | null
          created_at: string
          event_type: string
          id: string
          metadata: Json | null
          session_id: string | null
          user_id: string
        }
        Insert: {
          content_id: string
          context?: string | null
          created_at?: string
          event_type: string
          id?: string
          metadata?: Json | null
          session_id?: string | null
          user_id: string
        }
        Update: {
          content_id?: string
          context?: string | null
          created_at?: string
          event_type?: string
          id?: string
          metadata?: Json | null
          session_id?: string | null
          user_id?: string
        }
        Relationships: []
      }
      help_search_analytics: {
        Row: {
          context: string | null
          created_at: string
          id: string
          results_count: number
          search_term: string
          selected_result_id: string | null
          session_id: string | null
          user_id: string
        }
        Insert: {
          context?: string | null
          created_at?: string
          id?: string
          results_count?: number
          search_term: string
          selected_result_id?: string | null
          session_id?: string | null
          user_id: string
        }
        Update: {
          context?: string | null
          created_at?: string
          id?: string
          results_count?: number
          search_term?: string
          selected_result_id?: string | null
          session_id?: string | null
          user_id?: string
        }
        Relationships: []
      }
      help_session_analytics: {
        Row: {
          context: string | null
          created_at: string
          end_time: string | null
          id: string
          pages_visited: number | null
          searches_performed: number | null
          session_id: string
          start_time: string
          total_duration_seconds: number | null
          user_id: string
          videos_watched: number | null
        }
        Insert: {
          context?: string | null
          created_at?: string
          end_time?: string | null
          id?: string
          pages_visited?: number | null
          searches_performed?: number | null
          session_id: string
          start_time?: string
          total_duration_seconds?: number | null
          user_id: string
          videos_watched?: number | null
        }
        Update: {
          context?: string | null
          created_at?: string
          end_time?: string | null
          id?: string
          pages_visited?: number | null
          searches_performed?: number | null
          session_id?: string
          start_time?: string
          total_duration_seconds?: number | null
          user_id?: string
          videos_watched?: number | null
        }
        Relationships: []
      }
      help_topic_sections: {
        Row: {
          content: string
          created_at: string
          help_topic_id: string
          id: string
          image_urls: Json | null
          sort_order: number
          title: string
          updated_at: string
        }
        Insert: {
          content: string
          created_at?: string
          help_topic_id: string
          id?: string
          image_urls?: Json | null
          sort_order?: number
          title: string
          updated_at?: string
        }
        Update: {
          content?: string
          created_at?: string
          help_topic_id?: string
          id?: string
          image_urls?: Json | null
          sort_order?: number
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "help_topic_sections_help_topic_id_fkey"
            columns: ["help_topic_id"]
            isOneToOne: false
            referencedRelation: "help_topics"
            referencedColumns: ["id"]
          },
        ]
      }
      help_topics: {
        Row: {
          category: string
          created_at: string | null
          created_by: string | null
          description: string
          id: string
          image_urls: Json | null
          is_active: boolean | null
          last_edited_by: string | null
          priority: number
          quick_tips: Json | null
          tags: Json | null
          title: string
          updated_at: string | null
          video_chapters: Json | null
          video_duration: string | null
          video_title: string | null
          video_url: string | null
        }
        Insert: {
          category: string
          created_at?: string | null
          created_by?: string | null
          description: string
          id?: string
          image_urls?: Json | null
          is_active?: boolean | null
          last_edited_by?: string | null
          priority?: number
          quick_tips?: Json | null
          tags?: Json | null
          title: string
          updated_at?: string | null
          video_chapters?: Json | null
          video_duration?: string | null
          video_title?: string | null
          video_url?: string | null
        }
        Update: {
          category?: string
          created_at?: string | null
          created_by?: string | null
          description?: string
          id?: string
          image_urls?: Json | null
          is_active?: boolean | null
          last_edited_by?: string | null
          priority?: number
          quick_tips?: Json | null
          tags?: Json | null
          title?: string
          updated_at?: string | null
          video_chapters?: Json | null
          video_duration?: string | null
          video_title?: string | null
          video_url?: string | null
        }
        Relationships: []
      }
      influencer_coupons: {
        Row: {
          coupon_code: string
          created_at: string | null
          current_usage: number | null
          discount_amount: number | null
          discount_percentage: number | null
          expires_at: string | null
          id: string
          influencer_id: string
          is_active: boolean | null
          updated_at: string | null
          usage_limit: number | null
        }
        Insert: {
          coupon_code: string
          created_at?: string | null
          current_usage?: number | null
          discount_amount?: number | null
          discount_percentage?: number | null
          expires_at?: string | null
          id?: string
          influencer_id: string
          is_active?: boolean | null
          updated_at?: string | null
          usage_limit?: number | null
        }
        Update: {
          coupon_code?: string
          created_at?: string | null
          current_usage?: number | null
          discount_amount?: number | null
          discount_percentage?: number | null
          expires_at?: string | null
          id?: string
          influencer_id?: string
          is_active?: boolean | null
          updated_at?: string | null
          usage_limit?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "influencer_coupons_influencer_id_fkey"
            columns: ["influencer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      influencer_orders: {
        Row: {
          commission_amount: number | null
          commission_rate: number | null
          coupon_code: string | null
          created_at: string | null
          customer_email: string | null
          discount_amount: number | null
          id: string
          influencer_id: string | null
          order_amount: number | null
          processed_at: string | null
          status: string | null
          stripe_session_id: string | null
          updated_at: string | null
        }
        Insert: {
          commission_amount?: number | null
          commission_rate?: number | null
          coupon_code?: string | null
          created_at?: string | null
          customer_email?: string | null
          discount_amount?: number | null
          id?: string
          influencer_id?: string | null
          order_amount?: number | null
          processed_at?: string | null
          status?: string | null
          stripe_session_id?: string | null
          updated_at?: string | null
        }
        Update: {
          commission_amount?: number | null
          commission_rate?: number | null
          coupon_code?: string | null
          created_at?: string | null
          customer_email?: string | null
          discount_amount?: number | null
          id?: string
          influencer_id?: string | null
          order_amount?: number | null
          processed_at?: string | null
          status?: string | null
          stripe_session_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "influencer_orders_influencer_id_fkey"
            columns: ["influencer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      influencer_payouts: {
        Row: {
          created_at: string | null
          id: string
          influencer_id: string
          payment_method: string | null
          payment_reference: string | null
          period_end: string
          period_start: string
          processed_at: string | null
          processed_by: string | null
          status: string | null
          total_commission: number
          total_usage_count: number | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          influencer_id: string
          payment_method?: string | null
          payment_reference?: string | null
          period_end: string
          period_start: string
          processed_at?: string | null
          processed_by?: string | null
          status?: string | null
          total_commission?: number
          total_usage_count?: number | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          influencer_id?: string
          payment_method?: string | null
          payment_reference?: string | null
          period_end?: string
          period_start?: string
          processed_at?: string | null
          processed_by?: string | null
          status?: string | null
          total_commission?: number
          total_usage_count?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "influencer_payouts_influencer_id_fkey"
            columns: ["influencer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      influencer_promotions_audit: {
        Row: {
          created_at: string | null
          expires_at: string | null
          from_tier: string | null
          id: string
          metadata: Json | null
          notes: string | null
          promoted_by: string
          promotion_type: string | null
          to_tier: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          expires_at?: string | null
          from_tier?: string | null
          id?: string
          metadata?: Json | null
          notes?: string | null
          promoted_by: string
          promotion_type?: string | null
          to_tier?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          expires_at?: string | null
          from_tier?: string | null
          id?: string
          metadata?: Json | null
          notes?: string | null
          promoted_by?: string
          promotion_type?: string | null
          to_tier?: string | null
          user_id?: string
        }
        Relationships: []
      }
      learning_insights: {
        Row: {
          confidence_score: number | null
          created_at: string | null
          expires_at: string | null
          generated_at: string | null
          id: string
          insight_data: Json
          insight_type: string
          is_active: boolean | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          confidence_score?: number | null
          created_at?: string | null
          expires_at?: string | null
          generated_at?: string | null
          id?: string
          insight_data?: Json
          insight_type: string
          is_active?: boolean | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          confidence_score?: number | null
          created_at?: string | null
          expires_at?: string | null
          generated_at?: string | null
          id?: string
          insight_data?: Json
          insight_type?: string
          is_active?: boolean | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      learning_patterns: {
        Row: {
          created_at: string | null
          detected_at: string | null
          id: string
          last_confirmed_at: string | null
          pattern_data: Json
          pattern_type: string
          strength_score: number | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          detected_at?: string | null
          id?: string
          last_confirmed_at?: string | null
          pattern_data?: Json
          pattern_type: string
          strength_score?: number | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          detected_at?: string | null
          id?: string
          last_confirmed_at?: string | null
          pattern_data?: Json
          pattern_type?: string
          strength_score?: number | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      learning_progress: {
        Row: {
          confidence_level: number
          created_at: string
          first_seen_at: string
          flashcard_id: string
          id: string
          is_difficult: boolean
          is_known: boolean
          last_seen_at: string
          times_correct: number
          times_seen: number
          updated_at: string
          user_id: string
        }
        Insert: {
          confidence_level?: number
          created_at?: string
          first_seen_at?: string
          flashcard_id: string
          id?: string
          is_difficult?: boolean
          is_known?: boolean
          last_seen_at?: string
          times_correct?: number
          times_seen?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          confidence_level?: number
          created_at?: string
          first_seen_at?: string
          flashcard_id?: string
          id?: string
          is_difficult?: boolean
          is_known?: boolean
          last_seen_at?: string
          times_correct?: number
          times_seen?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "learning_progress_flashcard_id_fkey"
            columns: ["flashcard_id"]
            isOneToOne: false
            referencedRelation: "flashcards"
            referencedColumns: ["id"]
          },
        ]
      }
      learning_velocity_metrics: {
        Row: {
          cards_mastered: number | null
          created_at: string | null
          date: string | null
          id: string
          learning_acceleration: number | null
          retention_rate: number | null
          review_efficiency: number | null
          user_id: string
        }
        Insert: {
          cards_mastered?: number | null
          created_at?: string | null
          date?: string | null
          id?: string
          learning_acceleration?: number | null
          retention_rate?: number | null
          review_efficiency?: number | null
          user_id: string
        }
        Update: {
          cards_mastered?: number | null
          created_at?: string | null
          date?: string | null
          id?: string
          learning_acceleration?: number | null
          retention_rate?: number | null
          review_efficiency?: number | null
          user_id?: string
        }
        Relationships: []
      }
      mock_subscriptions: {
        Row: {
          cancelled_at: string | null
          created_at: string
          id: string
          mrr_amount: number
          plan_name: string
          status: string
          updated_at: string
          user_id: string | null
        }
        Insert: {
          cancelled_at?: string | null
          created_at?: string
          id?: string
          mrr_amount?: number
          plan_name?: string
          status?: string
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          cancelled_at?: string | null
          created_at?: string
          id?: string
          mrr_amount?: number
          plan_name?: string
          status?: string
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      note_chat_messages: {
        Row: {
          created_at: string | null
          id: string
          message: string
          note_id: string
          response: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          message: string
          note_id: string
          response: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          message?: string
          note_id?: string
          response?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "note_chat_messages_note_id_fkey"
            columns: ["note_id"]
            isOneToOne: false
            referencedRelation: "notes"
            referencedColumns: ["id"]
          },
        ]
      }
      note_content_expansions: {
        Row: {
          content_type: string
          created_at: string | null
          expanded_content: string
          id: string
          note_id: string
          original_text: string
          position_marker: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          content_type: string
          created_at?: string | null
          expanded_content: string
          id?: string
          note_id: string
          original_text: string
          position_marker: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          content_type?: string
          created_at?: string | null
          expanded_content?: string
          id?: string
          note_id?: string
          original_text?: string
          position_marker?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "note_content_expansions_note_id_fkey"
            columns: ["note_id"]
            isOneToOne: false
            referencedRelation: "notes"
            referencedColumns: ["id"]
          },
        ]
      }
      note_enrichment_usage: {
        Row: {
          completion_tokens: number
          created_at: string
          id: string
          llm_provider: string
          month_year: string
          note_id: string
          prompt_tokens: number
          user_id: string
        }
        Insert: {
          completion_tokens?: number
          created_at?: string
          id?: string
          llm_provider: string
          month_year: string
          note_id: string
          prompt_tokens?: number
          user_id: string
        }
        Update: {
          completion_tokens?: number
          created_at?: string
          id?: string
          llm_provider?: string
          month_year?: string
          note_id?: string
          prompt_tokens?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "note_enrichment_usage_note_id_fkey"
            columns: ["note_id"]
            isOneToOne: false
            referencedRelation: "notes"
            referencedColumns: ["id"]
          },
        ]
      }
      note_tags: {
        Row: {
          created_at: string
          id: string
          note_id: string
          tag_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          note_id: string
          tag_id: string
        }
        Update: {
          created_at?: string
          id?: string
          note_id?: string
          tag_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "note_tags_note_id_fkey"
            columns: ["note_id"]
            isOneToOne: false
            referencedRelation: "notes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "note_tags_tag_id_fkey"
            columns: ["tag_id"]
            isOneToOne: false
            referencedRelation: "tags"
            referencedColumns: ["id"]
          },
        ]
      }
      notes: {
        Row: {
          archived: boolean | null
          content: string | null
          created_at: string
          date: string
          description: string
          enriched_content: string | null
          enriched_content_generated_at: string | null
          enriched_status: string | null
          id: string
          improved_content: string | null
          improved_content_generated_at: string | null
          improved_content_status: string | null
          key_points: string | null
          key_points_generated_at: string | null
          key_points_status: string | null
          markdown_content: string | null
          markdown_content_generated_at: string | null
          markdown_content_status: string | null
          pinned: boolean | null
          questions_content: string | null
          questions_generated_at: string | null
          questions_status: string | null
          source_type: string
          subject: string
          subject_id: string | null
          summary: string | null
          summary_generated_at: string | null
          summary_status: string | null
          title: string
          updated_at: string
          user_id: string | null
          video_metadata: Json | null
          video_url: string | null
        }
        Insert: {
          archived?: boolean | null
          content?: string | null
          created_at?: string
          date?: string
          description: string
          enriched_content?: string | null
          enriched_content_generated_at?: string | null
          enriched_status?: string | null
          id?: string
          improved_content?: string | null
          improved_content_generated_at?: string | null
          improved_content_status?: string | null
          key_points?: string | null
          key_points_generated_at?: string | null
          key_points_status?: string | null
          markdown_content?: string | null
          markdown_content_generated_at?: string | null
          markdown_content_status?: string | null
          pinned?: boolean | null
          questions_content?: string | null
          questions_generated_at?: string | null
          questions_status?: string | null
          source_type?: string
          subject?: string
          subject_id?: string | null
          summary?: string | null
          summary_generated_at?: string | null
          summary_status?: string | null
          title: string
          updated_at?: string
          user_id?: string | null
          video_metadata?: Json | null
          video_url?: string | null
        }
        Update: {
          archived?: boolean | null
          content?: string | null
          created_at?: string
          date?: string
          description?: string
          enriched_content?: string | null
          enriched_content_generated_at?: string | null
          enriched_status?: string | null
          id?: string
          improved_content?: string | null
          improved_content_generated_at?: string | null
          improved_content_status?: string | null
          key_points?: string | null
          key_points_generated_at?: string | null
          key_points_status?: string | null
          markdown_content?: string | null
          markdown_content_generated_at?: string | null
          markdown_content_status?: string | null
          pinned?: boolean | null
          questions_content?: string | null
          questions_generated_at?: string | null
          questions_status?: string | null
          source_type?: string
          subject?: string
          subject_id?: string | null
          summary?: string | null
          summary_generated_at?: string | null
          summary_status?: string | null
          title?: string
          updated_at?: string
          user_id?: string | null
          video_metadata?: Json | null
          video_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "notes_subject_id_fkey"
            columns: ["subject_id"]
            isOneToOne: false
            referencedRelation: "user_subjects"
            referencedColumns: ["id"]
          },
        ]
      }
      performance_benchmarks: {
        Row: {
          created_at: string | null
          grade_level: string | null
          id: string
          metric_type: string
          metric_value: number
          sample_size: number | null
          subject_name: string
          time_period: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          grade_level?: string | null
          id?: string
          metric_type: string
          metric_value: number
          sample_size?: number | null
          subject_name: string
          time_period?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          grade_level?: string | null
          id?: string
          metric_type?: string
          metric_value?: number
          sample_size?: number | null
          subject_name?: string
          time_period?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      plan_templates: {
        Row: {
          created_at: string
          description: string | null
          id: string
          is_public: boolean
          name: string
          subject: string
          template_data: Json
          updated_at: string
          usage_count: number
          user_id: string | null
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          is_public?: boolean
          name: string
          subject: string
          template_data?: Json
          updated_at?: string
          usage_count?: number
          user_id?: string | null
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          is_public?: boolean
          name?: string
          subject?: string
          template_data?: Json
          updated_at?: string
          usage_count?: number
          user_id?: string | null
        }
        Relationships: []
      }
      predictive_analytics_cache: {
        Row: {
          accuracy_score: number | null
          cache_key: string
          created_at: string | null
          expires_at: string | null
          id: string
          prediction_data: Json
          user_id: string
        }
        Insert: {
          accuracy_score?: number | null
          cache_key: string
          created_at?: string | null
          expires_at?: string | null
          id?: string
          prediction_data?: Json
          user_id: string
        }
        Update: {
          accuracy_score?: number | null
          cache_key?: string
          created_at?: string | null
          expires_at?: string | null
          id?: string
          prediction_data?: Json
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          adaptive_learning_preferences: Json | null
          avatar_url: string | null
          country_id: string | null
          created_at: string | null
          dnd_end_time: string | null
          dnd_start_time: string | null
          do_not_disturb: boolean | null
          first_name: string | null
          grade: Database["public"]["Enums"]["grade_level"] | null
          id: string
          influencer_expires_at: string | null
          influencer_metadata: Json | null
          influencer_notes: string | null
          influencer_promoted_at: string | null
          influencer_promoted_by: string | null
          influencer_tier: string | null
          is_influencer: boolean | null
          notification_preferences: Json | null
          onboarding_completed: boolean | null
          referral_code: string | null
          school: string | null
          study_music_preferences: Json | null
          timezone: string
          updated_at: string | null
          user_tier: Database["public"]["Enums"]["user_tier"]
          username: string | null
          weekly_study_goal_hours: number | null
          whatsapp_phone: string | null
        }
        Insert: {
          adaptive_learning_preferences?: Json | null
          avatar_url?: string | null
          country_id?: string | null
          created_at?: string | null
          dnd_end_time?: string | null
          dnd_start_time?: string | null
          do_not_disturb?: boolean | null
          first_name?: string | null
          grade?: Database["public"]["Enums"]["grade_level"] | null
          id: string
          influencer_expires_at?: string | null
          influencer_metadata?: Json | null
          influencer_notes?: string | null
          influencer_promoted_at?: string | null
          influencer_promoted_by?: string | null
          influencer_tier?: string | null
          is_influencer?: boolean | null
          notification_preferences?: Json | null
          onboarding_completed?: boolean | null
          referral_code?: string | null
          school?: string | null
          study_music_preferences?: Json | null
          timezone?: string
          updated_at?: string | null
          user_tier?: Database["public"]["Enums"]["user_tier"]
          username?: string | null
          weekly_study_goal_hours?: number | null
          whatsapp_phone?: string | null
        }
        Update: {
          adaptive_learning_preferences?: Json | null
          avatar_url?: string | null
          country_id?: string | null
          created_at?: string | null
          dnd_end_time?: string | null
          dnd_start_time?: string | null
          do_not_disturb?: boolean | null
          first_name?: string | null
          grade?: Database["public"]["Enums"]["grade_level"] | null
          id?: string
          influencer_expires_at?: string | null
          influencer_metadata?: Json | null
          influencer_notes?: string | null
          influencer_promoted_at?: string | null
          influencer_promoted_by?: string | null
          influencer_tier?: string | null
          is_influencer?: boolean | null
          notification_preferences?: Json | null
          onboarding_completed?: boolean | null
          referral_code?: string | null
          school?: string | null
          study_music_preferences?: Json | null
          timezone?: string
          updated_at?: string | null
          user_tier?: Database["public"]["Enums"]["user_tier"]
          username?: string | null
          weekly_study_goal_hours?: number | null
          whatsapp_phone?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "profiles_country_id_fkey"
            columns: ["country_id"]
            isOneToOne: false
            referencedRelation: "countries"
            referencedColumns: ["id"]
          },
        ]
      }
      quiz_attempts_draft: {
        Row: {
          answers: Json
          current_question: number
          id: string
          quiz_id: string
          started_at: string
          updated_at: string
          user_id: string
        }
        Insert: {
          answers?: Json
          current_question?: number
          id?: string
          quiz_id: string
          started_at?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          answers?: Json
          current_question?: number
          id?: string
          quiz_id?: string
          started_at?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      quiz_card_responses: {
        Row: {
          created_at: string
          flashcard_id: string
          id: string
          is_correct: boolean
          points_earned: number
          quiz_session_id: string
          response_time_seconds: number
          time_bonus: number
          user_answer: string
        }
        Insert: {
          created_at?: string
          flashcard_id: string
          id?: string
          is_correct: boolean
          points_earned?: number
          quiz_session_id: string
          response_time_seconds: number
          time_bonus?: number
          user_answer: string
        }
        Update: {
          created_at?: string
          flashcard_id?: string
          id?: string
          is_correct?: boolean
          points_earned?: number
          quiz_session_id?: string
          response_time_seconds?: number
          time_bonus?: number
          user_answer?: string
        }
        Relationships: [
          {
            foreignKeyName: "quiz_card_responses_quiz_session_id_fkey"
            columns: ["quiz_session_id"]
            isOneToOne: false
            referencedRelation: "quiz_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      quiz_options: {
        Row: {
          content: string
          created_at: string
          id: string
          is_correct: boolean
          position: number
          question_id: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          is_correct?: boolean
          position?: number
          question_id: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          is_correct?: boolean
          position?: number
          question_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "quiz_options_question_id_fkey"
            columns: ["question_id"]
            isOneToOne: false
            referencedRelation: "quiz_questions"
            referencedColumns: ["id"]
          },
        ]
      }
      quiz_performance_history: {
        Row: {
          academic_subject: string | null
          completed_at: string | null
          created_at: string | null
          difficulty_level: number | null
          id: string
          quiz_id: string | null
          score_percentage: number | null
          time_per_question_avg: number | null
          user_id: string
        }
        Insert: {
          academic_subject?: string | null
          completed_at?: string | null
          created_at?: string | null
          difficulty_level?: number | null
          id?: string
          quiz_id?: string | null
          score_percentage?: number | null
          time_per_question_avg?: number | null
          user_id: string
        }
        Update: {
          academic_subject?: string | null
          completed_at?: string | null
          created_at?: string | null
          difficulty_level?: number | null
          id?: string
          quiz_id?: string | null
          score_percentage?: number | null
          time_per_question_avg?: number | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "quiz_performance_history_quiz_id_fkey"
            columns: ["quiz_id"]
            isOneToOne: false
            referencedRelation: "quizzes"
            referencedColumns: ["id"]
          },
        ]
      }
      quiz_question_responses: {
        Row: {
          created_at: string
          id: string
          is_correct: boolean
          question_id: string
          result_id: string
          selected_option_id: string | null
          time_spent_seconds: number | null
        }
        Insert: {
          created_at?: string
          id?: string
          is_correct?: boolean
          question_id: string
          result_id: string
          selected_option_id?: string | null
          time_spent_seconds?: number | null
        }
        Update: {
          created_at?: string
          id?: string
          is_correct?: boolean
          question_id?: string
          result_id?: string
          selected_option_id?: string | null
          time_spent_seconds?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "quiz_question_responses_question_id_fkey"
            columns: ["question_id"]
            isOneToOne: false
            referencedRelation: "quiz_questions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "quiz_question_responses_result_id_fkey"
            columns: ["result_id"]
            isOneToOne: false
            referencedRelation: "quiz_results"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "quiz_question_responses_selected_option_id_fkey"
            columns: ["selected_option_id"]
            isOneToOne: false
            referencedRelation: "quiz_options"
            referencedColumns: ["id"]
          },
        ]
      }
      quiz_questions: {
        Row: {
          created_at: string
          difficulty: number | null
          explanation: string | null
          id: string
          position: number
          question: string
          question_type: string
          quiz_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          difficulty?: number | null
          explanation?: string | null
          id?: string
          position?: number
          question: string
          question_type?: string
          quiz_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          difficulty?: number | null
          explanation?: string | null
          id?: string
          position?: number
          question?: string
          question_type?: string
          quiz_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "quiz_questions_quiz_id_fkey"
            columns: ["quiz_id"]
            isOneToOne: false
            referencedRelation: "quizzes"
            referencedColumns: ["id"]
          },
        ]
      }
      quiz_results: {
        Row: {
          completed_at: string
          created_at: string
          duration_seconds: number | null
          id: string
          quiz_id: string
          score: number
          total_questions: number
          user_id: string
        }
        Insert: {
          completed_at?: string
          created_at?: string
          duration_seconds?: number | null
          id?: string
          quiz_id: string
          score: number
          total_questions: number
          user_id: string
        }
        Update: {
          completed_at?: string
          created_at?: string
          duration_seconds?: number | null
          id?: string
          quiz_id?: string
          score?: number
          total_questions?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "quiz_results_quiz_id_fkey"
            columns: ["quiz_id"]
            isOneToOne: false
            referencedRelation: "quizzes"
            referencedColumns: ["id"]
          },
        ]
      }
      quiz_sessions: {
        Row: {
          average_response_time: number | null
          correct_answers: number
          created_at: string
          duration_seconds: number | null
          end_time: string | null
          flashcard_set_id: string
          grade: string | null
          id: string
          mode: string
          start_time: string
          total_cards: number
          total_score: number
          user_id: string
        }
        Insert: {
          average_response_time?: number | null
          correct_answers?: number
          created_at?: string
          duration_seconds?: number | null
          end_time?: string | null
          flashcard_set_id: string
          grade?: string | null
          id?: string
          mode?: string
          start_time?: string
          total_cards: number
          total_score?: number
          user_id: string
        }
        Update: {
          average_response_time?: number | null
          correct_answers?: number
          created_at?: string
          duration_seconds?: number | null
          end_time?: string | null
          flashcard_set_id?: string
          grade?: string | null
          id?: string
          mode?: string
          start_time?: string
          total_cards?: number
          total_score?: number
          user_id?: string
        }
        Relationships: []
      }
      quizzes: {
        Row: {
          country_id: string | null
          created_at: string
          description: string | null
          education_system: string | null
          grade_id: string | null
          id: string
          is_public: boolean | null
          section_id: string | null
          source_id: string | null
          source_type: string
          subject_id: string | null
          title: string
          updated_at: string
          user_id: string | null
          user_subject_id: string | null
        }
        Insert: {
          country_id?: string | null
          created_at?: string
          description?: string | null
          education_system?: string | null
          grade_id?: string | null
          id?: string
          is_public?: boolean | null
          section_id?: string | null
          source_id?: string | null
          source_type?: string
          subject_id?: string | null
          title: string
          updated_at?: string
          user_id?: string | null
          user_subject_id?: string | null
        }
        Update: {
          country_id?: string | null
          created_at?: string
          description?: string | null
          education_system?: string | null
          grade_id?: string | null
          id?: string
          is_public?: boolean | null
          section_id?: string | null
          source_id?: string | null
          source_type?: string
          subject_id?: string | null
          title?: string
          updated_at?: string
          user_id?: string | null
          user_subject_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "quizzes_country_id_fkey"
            columns: ["country_id"]
            isOneToOne: false
            referencedRelation: "countries"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "quizzes_grade_id_fkey"
            columns: ["grade_id"]
            isOneToOne: false
            referencedRelation: "grades"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "quizzes_section_id_fkey"
            columns: ["section_id"]
            isOneToOne: false
            referencedRelation: "sections"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "quizzes_user_subject_id_fkey"
            columns: ["user_subject_id"]
            isOneToOne: false
            referencedRelation: "user_subjects"
            referencedColumns: ["id"]
          },
        ]
      }
      referrals: {
        Row: {
          completed_at: string | null
          created_at: string
          id: string
          points_awarded: number | null
          referral_code: string
          referred_user_id: string
          referrer_id: string
          status: string
        }
        Insert: {
          completed_at?: string | null
          created_at?: string
          id?: string
          points_awarded?: number | null
          referral_code: string
          referred_user_id: string
          referrer_id: string
          status?: string
        }
        Update: {
          completed_at?: string | null
          created_at?: string
          id?: string
          points_awarded?: number | null
          referral_code?: string
          referred_user_id?: string
          referrer_id?: string
          status?: string
        }
        Relationships: []
      }
      reminder_cleanup_config: {
        Row: {
          auto_cleanup_enabled: boolean | null
          cleanup_schedule: string | null
          created_at: string | null
          id: string
          last_cleanup_at: string | null
          retention_days: number | null
          updated_at: string | null
        }
        Insert: {
          auto_cleanup_enabled?: boolean | null
          cleanup_schedule?: string | null
          created_at?: string | null
          id?: string
          last_cleanup_at?: string | null
          retention_days?: number | null
          updated_at?: string | null
        }
        Update: {
          auto_cleanup_enabled?: boolean | null
          cleanup_schedule?: string | null
          created_at?: string | null
          id?: string
          last_cleanup_at?: string | null
          retention_days?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }
      reminders: {
        Row: {
          archived_reason: string | null
          auto_archived_at: string | null
          auto_tags: string[] | null
          created_at: string | null
          delivery_methods: Json
          depends_on_todo_id: string | null
          description: string | null
          due_date: string | null
          escalation_level: string | null
          event_id: string | null
          goal_id: string | null
          grace_period_days: number | null
          id: string
          notification_status: string | null
          priority: string
          recurrence: string | null
          recurrence_end_date: string | null
          reminder_time: string
          status: string
          template_id: string | null
          title: string
          type: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          archived_reason?: string | null
          auto_archived_at?: string | null
          auto_tags?: string[] | null
          created_at?: string | null
          delivery_methods?: Json
          depends_on_todo_id?: string | null
          description?: string | null
          due_date?: string | null
          escalation_level?: string | null
          event_id?: string | null
          goal_id?: string | null
          grace_period_days?: number | null
          id?: string
          notification_status?: string | null
          priority?: string
          recurrence?: string | null
          recurrence_end_date?: string | null
          reminder_time: string
          status?: string
          template_id?: string | null
          title: string
          type: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          archived_reason?: string | null
          auto_archived_at?: string | null
          auto_tags?: string[] | null
          created_at?: string | null
          delivery_methods?: Json
          depends_on_todo_id?: string | null
          description?: string | null
          due_date?: string | null
          escalation_level?: string | null
          event_id?: string | null
          goal_id?: string | null
          grace_period_days?: number | null
          id?: string
          notification_status?: string | null
          priority?: string
          recurrence?: string | null
          recurrence_end_date?: string | null
          reminder_time?: string
          status?: string
          template_id?: string | null
          title?: string
          type?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "reminders_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reminders_goal_id_fkey"
            columns: ["goal_id"]
            isOneToOne: false
            referencedRelation: "study_goals"
            referencedColumns: ["id"]
          },
        ]
      }
      resources: {
        Row: {
          access_count: number
          author: string | null
          created_at: string
          description: string | null
          difficulty_level: string | null
          duration_minutes: number | null
          file_size_mb: number | null
          id: string
          is_favorite: boolean
          language: string | null
          last_accessed_at: string | null
          metadata: Json | null
          resource_type: string
          subject_id: string | null
          tags: string[] | null
          thumbnail_url: string | null
          title: string
          updated_at: string
          url: string
          user_id: string
        }
        Insert: {
          access_count?: number
          author?: string | null
          created_at?: string
          description?: string | null
          difficulty_level?: string | null
          duration_minutes?: number | null
          file_size_mb?: number | null
          id?: string
          is_favorite?: boolean
          language?: string | null
          last_accessed_at?: string | null
          metadata?: Json | null
          resource_type: string
          subject_id?: string | null
          tags?: string[] | null
          thumbnail_url?: string | null
          title: string
          updated_at?: string
          url: string
          user_id: string
        }
        Update: {
          access_count?: number
          author?: string | null
          created_at?: string
          description?: string | null
          difficulty_level?: string | null
          duration_minutes?: number | null
          file_size_mb?: number | null
          id?: string
          is_favorite?: boolean
          language?: string | null
          last_accessed_at?: string | null
          metadata?: Json | null
          resource_type?: string
          subject_id?: string | null
          tags?: string[] | null
          thumbnail_url?: string | null
          title?: string
          updated_at?: string
          url?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "resources_subject_id_fkey"
            columns: ["subject_id"]
            isOneToOne: false
            referencedRelation: "user_subjects"
            referencedColumns: ["id"]
          },
        ]
      }
      scan_data: {
        Row: {
          confidence: number | null
          created_at: string
          id: string
          language: string | null
          note_id: string
          original_image_url: string | null
          recognized_text: string | null
        }
        Insert: {
          confidence?: number | null
          created_at?: string
          id?: string
          language?: string | null
          note_id: string
          original_image_url?: string | null
          recognized_text?: string | null
        }
        Update: {
          confidence?: number | null
          created_at?: string
          id?: string
          language?: string | null
          note_id?: string
          original_image_url?: string | null
          recognized_text?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "scan_data_note_id_fkey"
            columns: ["note_id"]
            isOneToOne: false
            referencedRelation: "notes"
            referencedColumns: ["id"]
          },
        ]
      }
      sections: {
        Row: {
          academic_subject_id: string | null
          created_at: string
          description: string | null
          id: string
          name: string
          updated_at: string
        }
        Insert: {
          academic_subject_id?: string | null
          created_at?: string
          description?: string | null
          id?: string
          name: string
          updated_at?: string
        }
        Update: {
          academic_subject_id?: string | null
          created_at?: string
          description?: string | null
          id?: string
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
      security_audit_log: {
        Row: {
          action: string
          attempted_at: string
          error_message: string | null
          id: string
          ip_address: string | null
          success: boolean
          table_name: string
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          action: string
          attempted_at?: string
          error_message?: string | null
          id?: string
          ip_address?: string | null
          success?: boolean
          table_name: string
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          action?: string
          attempted_at?: string
          error_message?: string | null
          id?: string
          ip_address?: string | null
          success?: boolean
          table_name?: string
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      security_monitoring: {
        Row: {
          access_granted: boolean
          action_type: string
          created_at: string | null
          id: string
          ip_address: string | null
          metadata: Json | null
          resource_accessed: string
          risk_level: string
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          access_granted?: boolean
          action_type: string
          created_at?: string | null
          id?: string
          ip_address?: string | null
          metadata?: Json | null
          resource_accessed: string
          risk_level?: string
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          access_granted?: boolean
          action_type?: string
          created_at?: string | null
          id?: string
          ip_address?: string | null
          metadata?: Json | null
          resource_accessed?: string
          risk_level?: string
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      shared_flashcard_sets: {
        Row: {
          created_at: string
          expires_at: string | null
          flashcard_set_id: string
          id: string
          owner_user_id: string
          permission_level: string
          recipient_user_id: string
        }
        Insert: {
          created_at?: string
          expires_at?: string | null
          flashcard_set_id: string
          id?: string
          owner_user_id: string
          permission_level: string
          recipient_user_id: string
        }
        Update: {
          created_at?: string
          expires_at?: string | null
          flashcard_set_id?: string
          id?: string
          owner_user_id?: string
          permission_level?: string
          recipient_user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "shared_flashcard_sets_flashcard_set_id_fkey"
            columns: ["flashcard_set_id"]
            isOneToOne: false
            referencedRelation: "flashcard_sets"
            referencedColumns: ["id"]
          },
        ]
      }
      simple_flashcard_progress: {
        Row: {
          created_at: string
          flashcard_id: string
          id: string
          last_reviewed_at: string
          review_count: number
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          flashcard_id: string
          id?: string
          last_reviewed_at?: string
          review_count?: number
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          flashcard_id?: string
          id?: string
          last_reviewed_at?: string
          review_count?: number
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      study_achievements: {
        Row: {
          achieved_at: string | null
          badge_image: string | null
          created_at: string | null
          description: string | null
          id: string
          points: number | null
          title: string
          type: string
          user_id: string | null
        }
        Insert: {
          achieved_at?: string | null
          badge_image?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          points?: number | null
          title: string
          type: string
          user_id?: string | null
        }
        Update: {
          achieved_at?: string | null
          badge_image?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          points?: number | null
          title?: string
          type?: string
          user_id?: string | null
        }
        Relationships: []
      }
      study_analytics: {
        Row: {
          analytics_data: Json | null
          consistency_score: number | null
          created_at: string | null
          date: string
          flashcard_accuracy: number | null
          id: string
          learning_velocity: number | null
          optimal_study_time: string | null
          quiz_average_score: number | null
          subjects_studied: string[] | null
          total_study_time: number | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          analytics_data?: Json | null
          consistency_score?: number | null
          created_at?: string | null
          date?: string
          flashcard_accuracy?: number | null
          id?: string
          learning_velocity?: number | null
          optimal_study_time?: string | null
          quiz_average_score?: number | null
          subjects_studied?: string[] | null
          total_study_time?: number | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          analytics_data?: Json | null
          consistency_score?: number | null
          created_at?: string | null
          date?: string
          flashcard_accuracy?: number | null
          id?: string
          learning_velocity?: number | null
          optimal_study_time?: string | null
          quiz_average_score?: number | null
          subjects_studied?: string[] | null
          total_study_time?: number | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      study_goals: {
        Row: {
          academic_subject: string | null
          archived_at: string | null
          archived_reason: string | null
          created_at: string | null
          description: string | null
          end_date: string | null
          extension_count: number | null
          flashcard_set_id: string | null
          grace_period_days: number | null
          id: string
          is_completed: boolean | null
          kind: string
          progress: number | null
          start_date: string
          status: string | null
          target_hours: number | null
          title: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          academic_subject?: string | null
          archived_at?: string | null
          archived_reason?: string | null
          created_at?: string | null
          description?: string | null
          end_date?: string | null
          extension_count?: number | null
          flashcard_set_id?: string | null
          grace_period_days?: number | null
          id?: string
          is_completed?: boolean | null
          kind?: string
          progress?: number | null
          start_date?: string
          status?: string | null
          target_hours?: number | null
          title: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          academic_subject?: string | null
          archived_at?: string | null
          archived_reason?: string | null
          created_at?: string | null
          description?: string | null
          end_date?: string | null
          extension_count?: number | null
          flashcard_set_id?: string | null
          grace_period_days?: number | null
          id?: string
          is_completed?: boolean | null
          kind?: string
          progress?: number | null
          start_date?: string
          status?: string | null
          target_hours?: number | null
          title?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "study_goals_flashcard_set_id_fkey"
            columns: ["flashcard_set_id"]
            isOneToOne: false
            referencedRelation: "flashcard_sets"
            referencedColumns: ["id"]
          },
        ]
      }
      study_group_members: {
        Row: {
          group_id: string
          id: string
          joined_at: string
          role: string
          user_id: string
        }
        Insert: {
          group_id: string
          id?: string
          joined_at?: string
          role: string
          user_id: string
        }
        Update: {
          group_id?: string
          id?: string
          joined_at?: string
          role?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "study_group_members_group_id_fkey"
            columns: ["group_id"]
            isOneToOne: false
            referencedRelation: "study_groups"
            referencedColumns: ["id"]
          },
        ]
      }
      study_group_resources: {
        Row: {
          created_at: string
          created_by: string
          group_id: string
          id: string
          resource_id: string
          resource_type: string
        }
        Insert: {
          created_at?: string
          created_by: string
          group_id: string
          id?: string
          resource_id: string
          resource_type: string
        }
        Update: {
          created_at?: string
          created_by?: string
          group_id?: string
          id?: string
          resource_id?: string
          resource_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "study_group_resources_group_id_fkey"
            columns: ["group_id"]
            isOneToOne: false
            referencedRelation: "study_groups"
            referencedColumns: ["id"]
          },
        ]
      }
      study_groups: {
        Row: {
          created_at: string
          description: string | null
          id: string
          is_public: boolean
          name: string
          owner_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          is_public?: boolean
          name: string
          owner_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          is_public?: boolean
          name?: string
          owner_id?: string
          updated_at?: string
        }
        Relationships: []
      }
      study_music_tracks: {
        Row: {
          artist: string
          audio_file_path: string
          category: string | null
          created_at: string
          created_by: string | null
          duration_seconds: number | null
          id: string
          is_active: boolean | null
          is_default: boolean
          name: string
          sort_order: number | null
          tags: string[] | null
          thumbnail_path: string | null
          updated_at: string
        }
        Insert: {
          artist: string
          audio_file_path: string
          category?: string | null
          created_at?: string
          created_by?: string | null
          duration_seconds?: number | null
          id?: string
          is_active?: boolean | null
          is_default?: boolean
          name: string
          sort_order?: number | null
          tags?: string[] | null
          thumbnail_path?: string | null
          updated_at?: string
        }
        Update: {
          artist?: string
          audio_file_path?: string
          category?: string | null
          created_at?: string
          created_by?: string | null
          duration_seconds?: number | null
          id?: string
          is_active?: boolean | null
          is_default?: boolean
          name?: string
          sort_order?: number | null
          tags?: string[] | null
          thumbnail_path?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      study_plan_sessions: {
        Row: {
          actual_end_time: string | null
          actual_start_time: string | null
          completion_notes: string | null
          created_at: string
          description: string | null
          duration_minutes: number
          id: string
          performance_rating: number | null
          priority: string
          scheduled_date: string
          scheduled_end_time: string
          scheduled_start_time: string
          session_type: string
          status: string
          study_plan_id: string
          title: string
          topic: string | null
          updated_at: string
        }
        Insert: {
          actual_end_time?: string | null
          actual_start_time?: string | null
          completion_notes?: string | null
          created_at?: string
          description?: string | null
          duration_minutes: number
          id?: string
          performance_rating?: number | null
          priority?: string
          scheduled_date: string
          scheduled_end_time: string
          scheduled_start_time: string
          session_type?: string
          status?: string
          study_plan_id: string
          title: string
          topic?: string | null
          updated_at?: string
        }
        Update: {
          actual_end_time?: string | null
          actual_start_time?: string | null
          completion_notes?: string | null
          created_at?: string
          description?: string | null
          duration_minutes?: number
          id?: string
          performance_rating?: number | null
          priority?: string
          scheduled_date?: string
          scheduled_end_time?: string
          scheduled_start_time?: string
          session_type?: string
          status?: string
          study_plan_id?: string
          title?: string
          topic?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "study_plan_sessions_study_plan_id_fkey"
            columns: ["study_plan_id"]
            isOneToOne: false
            referencedRelation: "study_plans"
            referencedColumns: ["id"]
          },
        ]
      }
      study_plans: {
        Row: {
          available_days: Json
          available_times: Json
          created_at: string
          description: string | null
          difficulty_level: string
          end_date: string
          id: string
          is_converted_to_goals: boolean
          preferred_session_duration: number
          start_date: string
          status: string
          study_style: string
          subject: string
          title: string
          topics: Json
          total_hours_per_week: number
          updated_at: string
          user_id: string
        }
        Insert: {
          available_days?: Json
          available_times?: Json
          created_at?: string
          description?: string | null
          difficulty_level?: string
          end_date: string
          id?: string
          is_converted_to_goals?: boolean
          preferred_session_duration?: number
          start_date: string
          status?: string
          study_style?: string
          subject: string
          title: string
          topics?: Json
          total_hours_per_week?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          available_days?: Json
          available_times?: Json
          created_at?: string
          description?: string | null
          difficulty_level?: string
          end_date?: string
          id?: string
          is_converted_to_goals?: boolean
          preferred_session_duration?: number
          start_date?: string
          status?: string
          study_style?: string
          subject?: string
          title?: string
          topics?: Json
          total_hours_per_week?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      study_session_activities: {
        Row: {
          activity_type: string
          created_at: string | null
          duration_seconds: number | null
          end_time: string | null
          id: string
          performance_data: Json | null
          resource_id: string | null
          session_id: string | null
          start_time: string
        }
        Insert: {
          activity_type: string
          created_at?: string | null
          duration_seconds?: number | null
          end_time?: string | null
          id?: string
          performance_data?: Json | null
          resource_id?: string | null
          session_id?: string | null
          start_time?: string
        }
        Update: {
          activity_type?: string
          created_at?: string | null
          duration_seconds?: number | null
          end_time?: string | null
          id?: string
          performance_data?: Json | null
          resource_id?: string | null
          session_id?: string | null
          start_time?: string
        }
        Relationships: [
          {
            foreignKeyName: "study_session_activities_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "study_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      study_sessions: {
        Row: {
          activity_type: string | null
          auto_created: boolean | null
          break_time: number | null
          cards_correct: number | null
          cards_reviewed: number | null
          created_at: string | null
          duration: number | null
          end_time: string | null
          flashcard_set_id: string | null
          focus_time: number | null
          id: string
          is_active: boolean | null
          learning_velocity: number | null
          manual_entry_date: string | null
          manual_entry_notes: string | null
          manual_verified: boolean | null
          notes: string | null
          notes_created: number | null
          notes_reviewed: number | null
          quiz_score: number | null
          quiz_total_questions: number | null
          session_quality: string | null
          session_source: string
          start_time: string
          study_plan_id: string | null
          subject: string | null
          title: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          activity_type?: string | null
          auto_created?: boolean | null
          break_time?: number | null
          cards_correct?: number | null
          cards_reviewed?: number | null
          created_at?: string | null
          duration?: number | null
          end_time?: string | null
          flashcard_set_id?: string | null
          focus_time?: number | null
          id?: string
          is_active?: boolean | null
          learning_velocity?: number | null
          manual_entry_date?: string | null
          manual_entry_notes?: string | null
          manual_verified?: boolean | null
          notes?: string | null
          notes_created?: number | null
          notes_reviewed?: number | null
          quiz_score?: number | null
          quiz_total_questions?: number | null
          session_quality?: string | null
          session_source?: string
          start_time?: string
          study_plan_id?: string | null
          subject?: string | null
          title: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          activity_type?: string | null
          auto_created?: boolean | null
          break_time?: number | null
          cards_correct?: number | null
          cards_reviewed?: number | null
          created_at?: string | null
          duration?: number | null
          end_time?: string | null
          flashcard_set_id?: string | null
          focus_time?: number | null
          id?: string
          is_active?: boolean | null
          learning_velocity?: number | null
          manual_entry_date?: string | null
          manual_entry_notes?: string | null
          manual_verified?: boolean | null
          notes?: string | null
          notes_created?: number | null
          notes_reviewed?: number | null
          quiz_score?: number | null
          quiz_total_questions?: number | null
          session_quality?: string | null
          session_source?: string
          start_time?: string
          study_plan_id?: string | null
          subject?: string | null
          title?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "study_sessions_flashcard_set_id_fkey"
            columns: ["flashcard_set_id"]
            isOneToOne: false
            referencedRelation: "flashcard_sets"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "study_sessions_study_plan_id_fkey"
            columns: ["study_plan_id"]
            isOneToOne: false
            referencedRelation: "study_plans"
            referencedColumns: ["id"]
          },
        ]
      }
      subscribers: {
        Row: {
          billing_cycle_start: string
          created_at: string
          email: string
          id: string
          stripe_customer_id: string | null
          subscribed: boolean
          subscription_end: string | null
          subscription_tier: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          billing_cycle_start: string
          created_at?: string
          email: string
          id?: string
          stripe_customer_id?: string | null
          subscribed?: boolean
          subscription_end?: string | null
          subscription_tier?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          billing_cycle_start?: string
          created_at?: string
          email?: string
          id?: string
          stripe_customer_id?: string | null
          subscribed?: boolean
          subscription_end?: string | null
          subscription_tier?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      tags: {
        Row: {
          color: string | null
          created_at: string
          id: string
          name: string
        }
        Insert: {
          color?: string | null
          created_at?: string
          id?: string
          name: string
        }
        Update: {
          color?: string | null
          created_at?: string
          id?: string
          name?: string
        }
        Relationships: []
      }
      test_question_attempts: {
        Row: {
          created_at: string
          flashcard_id: string
          id: string
          is_correct: boolean
          question_type: string
          test_session_id: string
          time_spent_seconds: number | null
          user_answer: string | null
        }
        Insert: {
          created_at?: string
          flashcard_id: string
          id?: string
          is_correct: boolean
          question_type?: string
          test_session_id: string
          time_spent_seconds?: number | null
          user_answer?: string | null
        }
        Update: {
          created_at?: string
          flashcard_id?: string
          id?: string
          is_correct?: boolean
          question_type?: string
          test_session_id?: string
          time_spent_seconds?: number | null
          user_answer?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "test_question_attempts_flashcard_id_fkey"
            columns: ["flashcard_id"]
            isOneToOne: false
            referencedRelation: "flashcards"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "test_question_attempts_test_session_id_fkey"
            columns: ["test_session_id"]
            isOneToOne: false
            referencedRelation: "test_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      test_sessions: {
        Row: {
          correct_answers: number
          created_at: string
          end_time: string | null
          flashcard_set_id: string
          id: string
          start_time: string
          status: string
          time_limit_seconds: number | null
          total_questions: number
          user_id: string
        }
        Insert: {
          correct_answers?: number
          created_at?: string
          end_time?: string | null
          flashcard_set_id: string
          id?: string
          start_time?: string
          status?: string
          time_limit_seconds?: number | null
          total_questions: number
          user_id: string
        }
        Update: {
          correct_answers?: number
          created_at?: string
          end_time?: string | null
          flashcard_set_id?: string
          id?: string
          start_time?: string
          status?: string
          time_limit_seconds?: number | null
          total_questions?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "test_sessions_flashcard_set_id_fkey"
            columns: ["flashcard_set_id"]
            isOneToOne: false
            referencedRelation: "flashcard_sets"
            referencedColumns: ["id"]
          },
        ]
      }
      tier_change_history: {
        Row: {
          billing_cycle_start: string
          change_date: string
          created_at: string
          from_tier: string
          id: string
          next_billing_date: string
          prorated_amount: number | null
          to_tier: string
          user_id: string
        }
        Insert: {
          billing_cycle_start: string
          change_date?: string
          created_at?: string
          from_tier: string
          id?: string
          next_billing_date: string
          prorated_amount?: number | null
          to_tier: string
          user_id: string
        }
        Update: {
          billing_cycle_start?: string
          change_date?: string
          created_at?: string
          from_tier?: string
          id?: string
          next_billing_date?: string
          prorated_amount?: number | null
          to_tier?: string
          user_id?: string
        }
        Relationships: []
      }
      tier_limits: {
        Row: {
          ai_features_enabled: boolean
          ai_flashcard_generation: boolean | null
          max_ai_flashcard_generations_per_month: number | null
          max_cards_per_set: number | null
          max_flashcard_sets: number | null
          max_notes: number
          max_storage_mb: number
          note_enrichment_enabled: boolean
          note_enrichment_limit_per_month: number | null
          ocr_enabled: boolean
          priority_support: boolean
          tier: Database["public"]["Enums"]["user_tier"]
        }
        Insert: {
          ai_features_enabled?: boolean
          ai_flashcard_generation?: boolean | null
          max_ai_flashcard_generations_per_month?: number | null
          max_cards_per_set?: number | null
          max_flashcard_sets?: number | null
          max_notes: number
          max_storage_mb: number
          note_enrichment_enabled?: boolean
          note_enrichment_limit_per_month?: number | null
          ocr_enabled?: boolean
          priority_support?: boolean
          tier: Database["public"]["Enums"]["user_tier"]
        }
        Update: {
          ai_features_enabled?: boolean
          ai_flashcard_generation?: boolean | null
          max_ai_flashcard_generations_per_month?: number | null
          max_cards_per_set?: number | null
          max_flashcard_sets?: number | null
          max_notes?: number
          max_storage_mb?: number
          note_enrichment_enabled?: boolean
          note_enrichment_limit_per_month?: number | null
          ocr_enabled?: boolean
          priority_support?: boolean
          tier?: Database["public"]["Enums"]["user_tier"]
        }
        Relationships: []
      }
      todo_templates: {
        Row: {
          created_at: string | null
          default_priority: string | null
          description: string | null
          id: string
          is_public: boolean | null
          name: string
          subject: string
          template_items: Json
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          default_priority?: string | null
          description?: string | null
          id?: string
          is_public?: boolean | null
          name: string
          subject: string
          template_items?: Json
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          default_priority?: string | null
          description?: string | null
          id?: string
          is_public?: boolean | null
          name?: string
          subject?: string
          template_items?: Json
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      topic_suggestions_cache: {
        Row: {
          created_at: string | null
          expires_at: string | null
          id: string
          subject_name: string
          suggestions: Json
          user_id: string
        }
        Insert: {
          created_at?: string | null
          expires_at?: string | null
          id?: string
          subject_name: string
          suggestions: Json
          user_id: string
        }
        Update: {
          created_at?: string | null
          expires_at?: string | null
          id?: string
          subject_name?: string
          suggestions?: Json
          user_id?: string
        }
        Relationships: []
      }
      transcription_settings: {
        Row: {
          alert_email: string
          base_offset: number
          created_at: string
          id: string
          updated_at: string
        }
        Insert: {
          alert_email?: string
          base_offset?: number
          created_at?: string
          id?: string
          updated_at?: string
        }
        Update: {
          alert_email?: string
          base_offset?: number
          created_at?: string
          id?: string
          updated_at?: string
        }
        Relationships: []
      }
      user_academic_preferences: {
        Row: {
          academic_year: string | null
          country_code: string
          created_at: string
          id: string
          institution_type: string
          state_region: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          academic_year?: string | null
          country_code?: string
          created_at?: string
          id?: string
          institution_type?: string
          state_region?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          academic_year?: string | null
          country_code?: string
          created_at?: string
          id?: string
          institution_type?: string
          state_region?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_activity_feed: {
        Row: {
          activity_data: Json | null
          activity_type: string
          created_at: string
          id: string
          is_public: boolean
          user_id: string | null
        }
        Insert: {
          activity_data?: Json | null
          activity_type: string
          created_at?: string
          id?: string
          is_public?: boolean
          user_id?: string | null
        }
        Update: {
          activity_data?: Json | null
          activity_type?: string
          created_at?: string
          id?: string
          is_public?: boolean
          user_id?: string | null
        }
        Relationships: []
      }
      user_connections: {
        Row: {
          created_at: string
          id: string
          receiver_id: string
          sender_id: string
          status: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          receiver_id: string
          sender_id: string
          status?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          receiver_id?: string
          sender_id?: string
          status?: string
          updated_at?: string
        }
        Relationships: []
      }
      user_dismissed_announcements: {
        Row: {
          announcement_id: string
          dismissed_at: string | null
          id: string
          user_id: string
        }
        Insert: {
          announcement_id: string
          dismissed_at?: string | null
          id?: string
          user_id: string
        }
        Update: {
          announcement_id?: string
          dismissed_at?: string | null
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_dismissed_announcements_announcement_id_fkey"
            columns: ["announcement_id"]
            isOneToOne: false
            referencedRelation: "announcements"
            referencedColumns: ["id"]
          },
        ]
      }
      user_flashcard_progress: {
        Row: {
          created_at: string
          ease_factor: number | null
          flashcard_id: string | null
          grade: string | null
          id: string
          interval: number | null
          last_reviewed_at: string | null
          last_score: number | null
          mastery_level: number | null
          next_review_at: string | null
          repetition: number | null
          time_to_master_days: number | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          ease_factor?: number | null
          flashcard_id?: string | null
          grade?: string | null
          id?: string
          interval?: number | null
          last_reviewed_at?: string | null
          last_score?: number | null
          mastery_level?: number | null
          next_review_at?: string | null
          repetition?: number | null
          time_to_master_days?: number | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          ease_factor?: number | null
          flashcard_id?: string | null
          grade?: string | null
          id?: string
          interval?: number | null
          last_reviewed_at?: string | null
          last_score?: number | null
          mastery_level?: number | null
          next_review_at?: string | null
          repetition?: number | null
          time_to_master_days?: number | null
          updated_at?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "user_flashcard_progress_flashcard_id_fkey"
            columns: ["flashcard_id"]
            isOneToOne: false
            referencedRelation: "flashcards"
            referencedColumns: ["id"]
          },
        ]
      }
      user_selected_music_track: {
        Row: {
          id: string
          selected_at: string
          track_id: string
          user_id: string
        }
        Insert: {
          id?: string
          selected_at?: string
          track_id: string
          user_id: string
        }
        Update: {
          id?: string
          selected_at?: string
          track_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_selected_music_track_track_id_fkey"
            columns: ["track_id"]
            isOneToOne: false
            referencedRelation: "study_music_tracks"
            referencedColumns: ["id"]
          },
        ]
      }
      user_sessions_security: {
        Row: {
          created_at: string | null
          expires_at: string
          failed_attempts: number | null
          id: string
          ip_address: string | null
          is_active: boolean | null
          last_activity: string | null
          locked_until: string | null
          session_token: string
          user_agent: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          expires_at: string
          failed_attempts?: number | null
          id?: string
          ip_address?: string | null
          is_active?: boolean | null
          last_activity?: string | null
          locked_until?: string | null
          session_token: string
          user_agent?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          expires_at?: string
          failed_attempts?: number | null
          id?: string
          ip_address?: string | null
          is_active?: boolean | null
          last_activity?: string | null
          locked_until?: string | null
          session_token?: string
          user_agent?: string | null
          user_id?: string
        }
        Relationships: []
      }
      user_subjects: {
        Row: {
          created_at: string | null
          id: string
          name: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          name: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          name?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      user_topic_progress: {
        Row: {
          created_at: string | null
          id: string
          last_activity_at: string | null
          progress_type: string
          resource_count: number | null
          subject_name: string
          topic_name: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          last_activity_at?: string | null
          progress_type: string
          resource_count?: number | null
          subject_name: string
          topic_name: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          last_activity_at?: string | null
          progress_type?: string
          resource_count?: number | null
          subject_name?: string
          topic_name?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      video_ab_tests: {
        Row: {
          conversion_rate: number | null
          created_at: string
          id: string
          is_active: boolean
          total_conversions: number | null
          total_views: number | null
          traffic_percentage: number
          updated_at: string
          variant_name: string
          video_key: string
          video_url: string
        }
        Insert: {
          conversion_rate?: number | null
          created_at?: string
          id?: string
          is_active?: boolean
          total_conversions?: number | null
          total_views?: number | null
          traffic_percentage?: number
          updated_at?: string
          variant_name: string
          video_key: string
          video_url: string
        }
        Update: {
          conversion_rate?: number | null
          created_at?: string
          id?: string
          is_active?: boolean
          total_conversions?: number | null
          total_views?: number | null
          traffic_percentage?: number
          updated_at?: string
          variant_name?: string
          video_key?: string
          video_url?: string
        }
        Relationships: []
      }
      video_analytics: {
        Row: {
          created_at: string
          event_type: string
          id: string
          referrer: string | null
          session_id: string
          timestamp_seconds: number | null
          user_agent: string | null
          user_id: string | null
          video_key: string
          video_url: string
        }
        Insert: {
          created_at?: string
          event_type: string
          id?: string
          referrer?: string | null
          session_id: string
          timestamp_seconds?: number | null
          user_agent?: string | null
          user_id?: string | null
          video_key: string
          video_url: string
        }
        Update: {
          created_at?: string
          event_type?: string
          id?: string
          referrer?: string | null
          session_id?: string
          timestamp_seconds?: number | null
          user_agent?: string | null
          user_id?: string | null
          video_key?: string
          video_url?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      auto_escalate_overdue_todos: { Args: never; Returns: undefined }
      auto_publish_scheduled_posts: { Args: never; Returns: undefined }
      award_achievement: {
        Args: { p_achievement_title: string; p_user_id: string }
        Returns: boolean
      }
      batch_dismiss_reminders: {
        Args: { p_reminder_ids: string[]; p_user_id: string }
        Returns: {
          dismissed_count: number
          failed_ids: string[]
        }[]
      }
      calculate_arr: { Args: never; Returns: number }
      calculate_avg_session_length: { Args: never; Returns: number }
      calculate_churn_rate: { Args: never; Returns: number }
      calculate_dau: { Args: { target_date?: string }; Returns: number }
      calculate_dau_enhanced: {
        Args: { target_date?: string }
        Returns: number
      }
      calculate_mau: { Args: { target_month?: string }; Returns: number }
      calculate_mrr: { Args: never; Returns: number }
      calculate_next_campaign_run: {
        Args: {
          p_frequency_type: string
          p_frequency_value: number
          p_last_run?: string
        }
        Returns: string
      }
      calculate_session_quality: {
        Args: {
          p_cards_correct: number
          p_cards_reviewed: number
          p_duration: number
          p_quiz_score: number
          p_quiz_total: number
        }
        Returns: string
      }
      check_and_award_achievements: {
        Args: { p_user_id: string }
        Returns: {
          new_achievement_title: string
        }[]
      }
      check_session_security: {
        Args: { p_ip_address: string; p_user_id: string }
        Returns: Json
      }
      check_user_in_conversation: {
        Args: { conversation_uuid: string }
        Returns: boolean
      }
      cleanup_expired_analytics_cache: { Args: never; Returns: undefined }
      cleanup_expired_suggestions_cache: { Args: never; Returns: undefined }
      cleanup_old_reminders: {
        Args: { retention_days?: number }
        Returns: {
          archived_count: number
          cleanup_summary: Json
          deleted_count: number
        }[]
      }
      create_next_recurring_reminder: {
        Args: { original_reminder_id: string }
        Returns: string
      }
      dashboard_counts: {
        Args: { _user_id: string }
        Returns: {
          active_goals_count: number
          flashcard_sets_count: number
          notes_count: number
          quizzes_count: number
        }[]
      }
      dismiss_announcement: {
        Args: { announcement_uuid: string }
        Returns: boolean
      }
      filter_user_flashcard_sets: {
        Args: {
          p_page_num?: number
          p_page_size?: number
          p_search_term?: string
          p_sort_by?: string
          p_subject_name?: string
          p_user_id: string
        }
        Returns: Json
      }
      filter_user_notes: {
        Args: {
          p_page_num?: number
          p_page_size?: number
          p_search_term?: string
          p_show_archived?: boolean
          p_sort_by?: string
          p_subject_name?: string
          p_user_id: string
        }
        Returns: Json
      }
      filter_user_quizzes: {
        Args: {
          p_page_num?: number
          p_page_size?: number
          p_search_term?: string
          p_sort_by?: string
          p_subject_name?: string
          p_user_id: string
        }
        Returns: Json
      }
      force_delete_note: { Args: { note_id: string }; Returns: boolean }
      force_delete_note_optimized: {
        Args: { note_id_param: string }
        Returns: boolean
      }
      generate_influencer_coupon_code: {
        Args: { influencer_username: string }
        Returns: string
      }
      generate_unique_referral_code: {
        Args: { base_code?: string }
        Returns: string
      }
      get_active_announcements: {
        Args: { current_page?: string; user_tier_param?: string }
        Returns: {
          background_color: string
          compact_text: string
          content: string
          cta_text: string
          cta_url: string
          dismissible: boolean
          id: string
          mobile_layout: string
          priority: number
          text_color: string
          title: string
        }[]
      }
      get_ai_enrichment_count_for_billing_cycle: {
        Args: {
          cycle_end_param: string
          cycle_start_param: string
          user_id_param: string
        }
        Returns: number
      }
      get_digest_users: {
        Args: never
        Returns: {
          digest_time: string
          email: string
          last_digest_sent_at: string
          timezone: string
          user_id: string
          username: string
        }[]
      }
      get_my_referral_code: {
        Args: { preferred_base?: string }
        Returns: string
      }
      get_next_campaign_topic: {
        Args: { p_campaign_id: string }
        Returns: string
      }
      get_or_create_referral_code: {
        Args: { p_user_id: string; preferred_base?: string }
        Returns: string
      }
      get_overdue_goals: {
        Args: { p_user_id: string }
        Returns: {
          days_overdue: number
          end_date: string
          goal_id: string
          in_grace_period: boolean
          title: string
        }[]
      }
      get_overdue_todos: {
        Args: { p_user_id: string }
        Returns: {
          days_overdue: number
          description: string
          due_date: string
          escalation_level: string
          in_grace_period: boolean
          priority: string
          title: string
          todo_id: string
        }[]
      }
      get_reminder_system_health: { Args: never; Returns: Json }
      get_security_alerts: {
        Args: never
        Returns: {
          alert_id: string
          alert_type: string
          created_at: string
          message: string
          metadata: Json
          severity: string
          user_email: string
        }[]
      }
      get_security_status: { Args: never; Returns: Json }
      get_user_email_for_feedback: {
        Args: { feedback_user_id: string }
        Returns: string
      }
      get_user_reminders_paginated: {
        Args: {
          p_limit?: number
          p_offset?: number
          p_status?: string[]
          p_user_id: string
        }
        Returns: {
          created_at: string
          delivery_methods: Json
          description: string
          due_date: string
          escalation_level: string
          id: string
          priority: string
          recurrence: string
          reminder_time: string
          status: string
          title: string
          type: string
          updated_at: string
          user_id: string
        }[]
      }
      is_dean_user: { Args: { user_id_param: string }; Returns: boolean }
      is_dean_user_secure: { Args: { user_id_param: string }; Returns: boolean }
      is_dean_user_verified: {
        Args: { user_id_param: string }
        Returns: boolean
      }
      log_quiz_creation_debug: {
        Args: { context?: string; quiz_data: Json }
        Returns: undefined
      }
      log_security_access: {
        Args: {
          p_action: string
          p_error_message?: string
          p_success?: boolean
          p_table_name: string
        }
        Returns: undefined
      }
      log_sensitive_access: {
        Args: { p_operation: string; p_table_name: string; p_user_id?: string }
        Returns: undefined
      }
      process_referral_signup: {
        Args: { referral_code_used: string; referred_user_id: string }
        Returns: boolean
      }
      update_user_tier: {
        Args: { new_tier: string; reason?: string; target_user_id: string }
        Returns: boolean
      }
      validate_contact_submission: {
        Args: { p_email: string; p_ip_address: string; p_message: string }
        Returns: Json
      }
      validate_coupon: { Args: { coupon_code_param: string }; Returns: Json }
      validate_coupon_secure: {
        Args: { coupon_code_param: string }
        Returns: Json
      }
      verify_complete_lockdown: {
        Args: never
        Returns: {
          anon_can_insert: boolean
          anon_can_select: boolean
          public_can_select: boolean
          rls_enabled: boolean
          rls_forced: boolean
          table_name: string
        }[]
      }
      verify_table_security: {
        Args: never
        Returns: {
          has_anon_access: boolean
          has_public_access: boolean
          table_name: string
        }[]
      }
    }
    Enums: {
      grade_level:
        | "Grade 5"
        | "Grade 6"
        | "Grade 7"
        | "Grade 8"
        | "Grade 9"
        | "Grade 10"
        | "Grade 11"
        | "Grade 12"
        | "Undergraduate"
        | "Graduate"
        | "Post Graduate"
      user_tier: "SCHOLAR" | "GRADUATE" | "MASTER" | "DEAN"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      grade_level: [
        "Grade 5",
        "Grade 6",
        "Grade 7",
        "Grade 8",
        "Grade 9",
        "Grade 10",
        "Grade 11",
        "Grade 12",
        "Undergraduate",
        "Graduate",
        "Post Graduate",
      ],
      user_tier: ["SCHOLAR", "GRADUATE", "MASTER", "DEAN"],
    },
  },
} as const
