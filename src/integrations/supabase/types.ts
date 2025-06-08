export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
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
          category_id: string | null
          country_id: string | null
          created_at: string
          description: string | null
          education_system: string | null
          id: string
          is_built_in: boolean | null
          name: string
          section_id: string | null
          subject: string | null
          topic: string | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          card_count?: number | null
          category_id?: string | null
          country_id?: string | null
          created_at?: string
          description?: string | null
          education_system?: string | null
          id?: string
          is_built_in?: boolean | null
          name: string
          section_id?: string | null
          subject?: string | null
          topic?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          card_count?: number | null
          category_id?: string | null
          country_id?: string | null
          created_at?: string
          description?: string | null
          education_system?: string | null
          id?: string
          is_built_in?: boolean | null
          name?: string
          section_id?: string | null
          subject?: string | null
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
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
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
          id: string
          improved_content: string | null
          improved_content_generated_at: string | null
          key_points: string | null
          key_points_generated_at: string | null
          markdown_content: string | null
          markdown_content_generated_at: string | null
          pinned: boolean | null
          source_type: string
          subject: string
          subject_id: string | null
          summary: string | null
          summary_generated_at: string | null
          summary_status: string | null
          title: string
          updated_at: string
          user_id: string | null
        }
        Insert: {
          archived?: boolean | null
          content?: string | null
          created_at?: string
          date?: string
          description: string
          id?: string
          improved_content?: string | null
          improved_content_generated_at?: string | null
          key_points?: string | null
          key_points_generated_at?: string | null
          markdown_content?: string | null
          markdown_content_generated_at?: string | null
          pinned?: boolean | null
          source_type?: string
          subject?: string
          subject_id?: string | null
          summary?: string | null
          summary_generated_at?: string | null
          summary_status?: string | null
          title: string
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          archived?: boolean | null
          content?: string | null
          created_at?: string
          date?: string
          description?: string
          id?: string
          improved_content?: string | null
          improved_content_generated_at?: string | null
          key_points?: string | null
          key_points_generated_at?: string | null
          markdown_content?: string | null
          markdown_content_generated_at?: string | null
          pinned?: boolean | null
          source_type?: string
          subject?: string
          subject_id?: string | null
          summary?: string | null
          summary_generated_at?: string | null
          summary_status?: string | null
          title?: string
          updated_at?: string
          user_id?: string | null
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
      profiles: {
        Row: {
          adaptive_learning_preferences: Json | null
          avatar_url: string | null
          country_id: string | null
          created_at: string | null
          dnd_end_time: string | null
          dnd_start_time: string | null
          do_not_disturb: boolean | null
          grade: Database["public"]["Enums"]["grade_level"] | null
          id: string
          notification_preferences: Json | null
          onboarding_completed: boolean | null
          referral_code: string | null
          school: string | null
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
          grade?: Database["public"]["Enums"]["grade_level"] | null
          id: string
          notification_preferences?: Json | null
          onboarding_completed?: boolean | null
          referral_code?: string | null
          school?: string | null
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
          grade?: Database["public"]["Enums"]["grade_level"] | null
          id?: string
          notification_preferences?: Json | null
          onboarding_completed?: boolean | null
          referral_code?: string | null
          school?: string | null
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
          completed_at: string | null
          created_at: string | null
          difficulty_level: number | null
          id: string
          quiz_id: string | null
          score_percentage: number | null
          subject: string | null
          time_per_question_avg: number | null
          user_id: string
        }
        Insert: {
          completed_at?: string | null
          created_at?: string | null
          difficulty_level?: number | null
          id?: string
          quiz_id?: string | null
          score_percentage?: number | null
          subject?: string | null
          time_per_question_avg?: number | null
          user_id: string
        }
        Update: {
          completed_at?: string | null
          created_at?: string | null
          difficulty_level?: number | null
          id?: string
          quiz_id?: string | null
          score_percentage?: number | null
          subject?: string | null
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
          category_id: string | null
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
          title: string
          updated_at: string
          user_id: string | null
        }
        Insert: {
          category_id?: string | null
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
          title: string
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          category_id?: string | null
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
          title?: string
          updated_at?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "quizzes_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "subject_categories"
            referencedColumns: ["id"]
          },
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
      reminders: {
        Row: {
          auto_tags: string[] | null
          created_at: string | null
          delivery_methods: Json
          depends_on_todo_id: string | null
          description: string | null
          due_date: string | null
          event_id: string | null
          goal_id: string | null
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
          auto_tags?: string[] | null
          created_at?: string | null
          delivery_methods?: Json
          depends_on_todo_id?: string | null
          description?: string | null
          due_date?: string | null
          event_id?: string | null
          goal_id?: string | null
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
          auto_tags?: string[] | null
          created_at?: string | null
          delivery_methods?: Json
          depends_on_todo_id?: string | null
          description?: string | null
          due_date?: string | null
          event_id?: string | null
          goal_id?: string | null
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
          created_at: string
          description: string | null
          id: string
          name: string
          subject_id: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          name: string
          subject_id?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          name?: string
          subject_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "sections_subject_id_fkey"
            columns: ["subject_id"]
            isOneToOne: false
            referencedRelation: "subject_categories"
            referencedColumns: ["id"]
          },
        ]
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
          created_at: string | null
          description: string | null
          end_date: string
          flashcard_set_id: string | null
          id: string
          is_completed: boolean | null
          progress: number | null
          start_date: string
          subject: string | null
          target_hours: number
          title: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          end_date: string
          flashcard_set_id?: string | null
          id?: string
          is_completed?: boolean | null
          progress?: number | null
          start_date?: string
          subject?: string | null
          target_hours: number
          title: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          description?: string | null
          end_date?: string
          flashcard_set_id?: string | null
          id?: string
          is_completed?: boolean | null
          progress?: number | null
          start_date?: string
          subject?: string | null
          target_hours?: number
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
          notes: string | null
          notes_created: number | null
          notes_reviewed: number | null
          quiz_score: number | null
          quiz_total_questions: number | null
          session_quality: string | null
          start_time: string
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
          notes?: string | null
          notes_created?: number | null
          notes_reviewed?: number | null
          quiz_score?: number | null
          quiz_total_questions?: number | null
          session_quality?: string | null
          start_time?: string
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
          notes?: string | null
          notes_created?: number | null
          notes_reviewed?: number | null
          quiz_score?: number | null
          quiz_total_questions?: number | null
          session_quality?: string | null
          start_time?: string
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
        ]
      }
      subject_categories: {
        Row: {
          country_id: string | null
          created_at: string
          education_system: string | null
          grade_id: string | null
          id: string
          level: number | null
          name: string
          parent_id: string | null
          updated_at: string
        }
        Insert: {
          country_id?: string | null
          created_at?: string
          education_system?: string | null
          grade_id?: string | null
          id?: string
          level?: number | null
          name: string
          parent_id?: string | null
          updated_at?: string
        }
        Update: {
          country_id?: string | null
          created_at?: string
          education_system?: string | null
          grade_id?: string | null
          id?: string
          level?: number | null
          name?: string
          parent_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "subject_categories_country_id_fkey"
            columns: ["country_id"]
            isOneToOne: false
            referencedRelation: "countries"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "subject_categories_grade_id_fkey"
            columns: ["grade_id"]
            isOneToOne: false
            referencedRelation: "grades"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "subject_categories_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "subject_categories"
            referencedColumns: ["id"]
          },
        ]
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
      tier_limits: {
        Row: {
          ai_features_enabled: boolean
          ai_flashcard_generation: boolean | null
          chat_enabled: boolean
          collaboration_enabled: boolean
          max_ai_flashcard_generations_per_month: number | null
          max_cards_per_set: number | null
          max_collaborations: number | null
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
          chat_enabled?: boolean
          collaboration_enabled?: boolean
          max_ai_flashcard_generations_per_month?: number | null
          max_cards_per_set?: number | null
          max_collaborations?: number | null
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
          chat_enabled?: boolean
          collaboration_enabled?: boolean
          max_ai_flashcard_generations_per_month?: number | null
          max_cards_per_set?: number | null
          max_collaborations?: number | null
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
          category: string
          created_at: string | null
          default_priority: string | null
          description: string | null
          id: string
          is_public: boolean | null
          name: string
          template_items: Json
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          category: string
          created_at?: string | null
          default_priority?: string | null
          description?: string | null
          id?: string
          is_public?: boolean | null
          name: string
          template_items?: Json
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          category?: string
          created_at?: string | null
          default_priority?: string | null
          description?: string | null
          id?: string
          is_public?: boolean | null
          name?: string
          template_items?: Json
          updated_at?: string | null
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
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      award_achievement: {
        Args: { p_user_id: string; p_achievement_title: string }
        Returns: boolean
      }
      calculate_arr: {
        Args: Record<PropertyKey, never>
        Returns: number
      }
      calculate_avg_session_length: {
        Args: Record<PropertyKey, never>
        Returns: number
      }
      calculate_churn_rate: {
        Args: Record<PropertyKey, never>
        Returns: number
      }
      calculate_dau: {
        Args: { target_date?: string }
        Returns: number
      }
      calculate_dau_enhanced: {
        Args: { target_date?: string }
        Returns: number
      }
      calculate_mau: {
        Args: { target_month?: string }
        Returns: number
      }
      calculate_mrr: {
        Args: Record<PropertyKey, never>
        Returns: number
      }
      calculate_session_quality: {
        Args: {
          p_duration: number
          p_cards_reviewed: number
          p_cards_correct: number
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
      check_user_in_conversation: {
        Args: { conversation_uuid: string }
        Returns: boolean
      }
      dismiss_announcement: {
        Args: { announcement_uuid: string }
        Returns: boolean
      }
      force_delete_note: {
        Args: { note_id: string }
        Returns: boolean
      }
      get_active_announcements: {
        Args: { user_tier_param?: string; current_page?: string }
        Returns: {
          id: string
          title: string
          content: string
          compact_text: string
          cta_text: string
          cta_url: string
          background_color: string
          text_color: string
          mobile_layout: string
          priority: number
          dismissible: boolean
        }[]
      }
      get_user_email_for_feedback: {
        Args: { feedback_user_id: string }
        Returns: string
      }
      process_referral_signup: {
        Args: { referred_user_id: string; referral_code_used: string }
        Returns: boolean
      }
    }
    Enums: {
      grade_level:
        | "Kindergarten"
        | "Grade 1"
        | "Grade 2"
        | "Grade 3"
        | "Grade 4"
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
        | "Postgraduate"
      user_tier: "SCHOLAR" | "GRADUATE" | "MASTER" | "DEAN"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      grade_level: [
        "Kindergarten",
        "Grade 1",
        "Grade 2",
        "Grade 3",
        "Grade 4",
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
        "Postgraduate",
      ],
      user_tier: ["SCHOLAR", "GRADUATE", "MASTER", "DEAN"],
    },
  },
} as const
