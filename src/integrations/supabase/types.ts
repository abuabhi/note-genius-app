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
          category_id: string | null
          created_at: string
          description: string | null
          id: string
          is_built_in: boolean | null
          name: string
          subject: string | null
          topic: string | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          category_id?: string | null
          created_at?: string
          description?: string | null
          id?: string
          is_built_in?: boolean | null
          name: string
          subject?: string | null
          topic?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          category_id?: string | null
          created_at?: string
          description?: string | null
          id?: string
          is_built_in?: boolean | null
          name?: string
          subject?: string | null
          topic?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
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
          category: string
          content: string | null
          created_at: string
          date: string
          description: string
          id: string
          pinned: boolean | null
          source_type: string
          title: string
          updated_at: string
          user_id: string | null
        }
        Insert: {
          archived?: boolean | null
          category?: string
          content?: string | null
          created_at?: string
          date?: string
          description: string
          id?: string
          pinned?: boolean | null
          source_type?: string
          title: string
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          archived?: boolean | null
          category?: string
          content?: string | null
          created_at?: string
          date?: string
          description?: string
          id?: string
          pinned?: boolean | null
          source_type?: string
          title?: string
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string | null
          id: string
          updated_at: string | null
          user_tier: Database["public"]["Enums"]["user_tier"]
          username: string | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string | null
          id: string
          updated_at?: string | null
          user_tier?: Database["public"]["Enums"]["user_tier"]
          username?: string | null
        }
        Update: {
          avatar_url?: string | null
          created_at?: string | null
          id?: string
          updated_at?: string | null
          user_tier?: Database["public"]["Enums"]["user_tier"]
          username?: string | null
        }
        Relationships: []
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
          user_id: string
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
          user_id: string
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
      study_sessions: {
        Row: {
          break_time: number | null
          created_at: string | null
          duration: number | null
          end_time: string | null
          flashcard_set_id: string | null
          focus_time: number | null
          id: string
          is_active: boolean | null
          notes: string | null
          start_time: string
          subject: string | null
          title: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          break_time?: number | null
          created_at?: string | null
          duration?: number | null
          end_time?: string | null
          flashcard_set_id?: string | null
          focus_time?: number | null
          id?: string
          is_active?: boolean | null
          notes?: string | null
          start_time?: string
          subject?: string | null
          title: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          break_time?: number | null
          created_at?: string | null
          duration?: number | null
          end_time?: string | null
          flashcard_set_id?: string | null
          focus_time?: number | null
          id?: string
          is_active?: boolean | null
          notes?: string | null
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
          created_at: string
          id: string
          level: number | null
          name: string
          parent_id: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          level?: number | null
          name: string
          parent_id?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          level?: number | null
          name?: string
          parent_id?: string | null
          updated_at?: string
        }
        Relationships: [
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
      tier_limits: {
        Row: {
          ai_features_enabled: boolean
          ai_flashcard_generation: boolean | null
          collaboration_enabled: boolean
          max_flashcard_sets: number | null
          max_notes: number
          max_storage_mb: number
          ocr_enabled: boolean
          priority_support: boolean
          tier: Database["public"]["Enums"]["user_tier"]
        }
        Insert: {
          ai_features_enabled?: boolean
          ai_flashcard_generation?: boolean | null
          collaboration_enabled?: boolean
          max_flashcard_sets?: number | null
          max_notes: number
          max_storage_mb: number
          ocr_enabled?: boolean
          priority_support?: boolean
          tier: Database["public"]["Enums"]["user_tier"]
        }
        Update: {
          ai_features_enabled?: boolean
          ai_flashcard_generation?: boolean | null
          collaboration_enabled?: boolean
          max_flashcard_sets?: number | null
          max_notes?: number
          max_storage_mb?: number
          ocr_enabled?: boolean
          priority_support?: boolean
          tier?: Database["public"]["Enums"]["user_tier"]
        }
        Relationships: []
      }
      user_flashcard_progress: {
        Row: {
          created_at: string
          ease_factor: number | null
          flashcard_id: string | null
          id: string
          interval: number | null
          last_reviewed_at: string | null
          last_score: number | null
          next_review_at: string | null
          repetition: number | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          ease_factor?: number | null
          flashcard_id?: string | null
          id?: string
          interval?: number | null
          last_reviewed_at?: string | null
          last_score?: number | null
          next_review_at?: string | null
          repetition?: number | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          ease_factor?: number | null
          flashcard_id?: string | null
          id?: string
          interval?: number | null
          last_reviewed_at?: string | null
          last_score?: number | null
          next_review_at?: string | null
          repetition?: number | null
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
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
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
      user_tier: ["SCHOLAR", "GRADUATE", "MASTER", "DEAN"],
    },
  },
} as const
