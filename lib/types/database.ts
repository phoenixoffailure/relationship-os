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
      connection_scores: {
        Row: {
          calculated_at: string | null
          factors: Json | null
          id: string
          relationship_id: string | null
          score: number | null
        }
        Insert: {
          calculated_at?: string | null
          factors?: Json | null
          id?: string
          relationship_id?: string | null
          score?: number | null
        }
        Update: {
          calculated_at?: string | null
          factors?: Json | null
          id?: string
          relationship_id?: string | null
          score?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "connection_scores_relationship_id_fkey"
            columns: ["relationship_id"]
            referencedRelation: "relationships"
            referencedColumns: ["id"]
          },
        ]
      }
      cycle_insights: {
        Row: {
          cycle_id: string | null
          generated_at: string | null
          id: string
          partner_suggestions: Json | null
          phase: string
          predicted_mood: Json | null
          user_id: string | null
        }
        Insert: {
          cycle_id?: string | null
          generated_at?: string | null
          id?: string
          partner_suggestions?: Json | null
          phase: string
          predicted_mood?: Json | null
          user_id?: string | null
        }
        Update: {
          cycle_id?: string | null
          generated_at?: string | null
          id?: string
          partner_suggestions?: Json | null
          phase?: string
          predicted_mood?: Json | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "cycle_insights_cycle_id_fkey"
            columns: ["cycle_id"]
            referencedRelation: "menstrual_cycles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cycle_insights_user_id_fkey"
            columns: ["user_id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      daily_checkins: {
        Row: {
          challenge_note: string | null
          connection_score: number | null
          created_at: string | null
          gratitude_note: string | null
          id: string
          mood_score: number | null
          relationship_id: string | null
          user_id: string | null
        }
        Insert: {
          challenge_note?: string | null
          connection_score?: number | null
          created_at?: string | null
          gratitude_note?: string | null
          id?: string
          mood_score?: number | null
          relationship_id?: string | null
          user_id?: string | null
        }
        Update: {
          challenge_note?: string | null
          connection_score?: number | null
          created_at?: string | null
          gratitude_note?: string | null
          id?: string
          mood_score?: number | null
          relationship_id?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "daily_checkins_relationship_id_fkey"
            columns: ["relationship_id"]
            referencedRelation: "relationships"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "daily_checkins_user_id_fkey"
            columns: ["user_id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      enhanced_onboarding_responses: {
        Row: {
          ai_processing_status: string
          ai_profile_data: Json | null
          challenge_note: string | null
          communication_barriers: string[] | null
          communication_style: string | null
          communication_timing: string[] | null
          completed_at: string | null
          conflict_approach: string | null
          connection_frequency: Json | null
          created_at: string
          expression_directness: string | null
          expression_frequency: string | null
          expression_preferences: Json | null
          goal_timeline: string | null
          id: string
          intimacy_barriers: string[] | null
          intimacy_enhancers: string[] | null
          intimacy_priorities: Json | null
          love_language_examples: Json | null
          love_language_ranking: string[] | null
          love_language_scores: Json | null
          need_categories_difficulty: Json | null
          partner_reading_ability: number | null
          preferred_methods: string[] | null
          primary_goals: string[] | null
          relationship_values: string[] | null
          session_id: string
          specific_challenges: string | null
          stress_response: string | null
          success_metrics: string | null
          successful_communication_example: string | null
          updated_at: string
          user_id: string | null
          version: number
        }
        Insert: {
          ai_processing_status?: string
          ai_profile_data?: Json | null
          challenge_note?: string | null
          communication_barriers?: string[] | null
          communication_style?: string | null
          communication_timing?: string[] | null
          completed_at?: string | null
          conflict_approach?: string | null
          connection_frequency?: Json | null
          created_at?: string
          expression_directness?: string | null
          expression_frequency?: string | null
          expression_preferences?: Json | null
          goal_timeline?: string | null
          id?: string
          intimacy_barriers?: string[] | null
          intimacy_enhancers?: string[] | null
          intimacy_priorities?: Json | null
          love_language_examples?: Json | null
          love_language_ranking?: string[] | null
          love_language_scores?: Json | null
          need_categories_difficulty?: Json | null
          partner_reading_ability?: number | null
          preferred_methods?: string[] | null
          primary_goals?: string[] | null
          relationship_values?: string[] | null
          session_id: string
          specific_challenges?: string | null
          stress_response?: string | null
          success_metrics?: string | null
          successful_communication_example?: string | null
          updated_at?: string
          user_id?: string | null
          version?: number
        }
        Update: {
          ai_processing_status?: string
          ai_profile_data?: Json | null
          challenge_note?: string | null
          communication_barriers?: string[] | null
          communication_style?: string | null
          communication_timing?: string[] | null
          completed_at?: string | null
          conflict_approach?: string | null
          connection_frequency?: Json | null
          created_at?: string
          expression_directness?: string | null
          expression_frequency?: string | null
          expression_preferences?: Json | null
          goal_timeline?: string | null
          id?: string
          intimacy_barriers?: string[] | null
          intimacy_enhancers?: string[] | null
          intimacy_priorities?: Json | null
          love_language_examples?: Json | null
          love_language_ranking?: string[] | null
          love_language_scores?: Json | null
          need_categories_difficulty?: Json | null
          partner_reading_ability?: number | null
          preferred_methods?: string[] | null
          primary_goals?: string[] | null
          relationship_values?: string[] | null
          session_id?: string
          specific_challenges?: string | null
          stress_response?: string | null
          success_metrics?: string | null
          successful_communication_example?: string | null
          updated_at?: string
          user_id?: string | null
          version?: number
        }
        Relationships: [
          {
            foreignKeyName: "enhanced_onboarding_responses_user_id_fkey"
            columns: ["user_id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      journal_entries: {
        Row: {
          ai_analysis: Json | null
          content: string
          created_at: string | null
          id: string
          mood_score: number | null
          user_id: string | null
        }
        Insert: {
          ai_analysis?: Json | null
          content: string
          created_at?: string | null
          id?: string
          mood_score?: number | null
          user_id?: string | null
        }
        Update: {
          ai_analysis?: Json | null
          content?: string
          created_at?: string | null
          id?: string
          mood_score?: number | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "journal_entries_user_id_fkey"
            columns: ["user_id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      menstrual_cycles: {
        Row: {
          created_at: string | null
          cycle_length: number | null
          cycle_start_date: string
          id: string
          is_active: boolean | null
          notes: string | null
          period_length: number | null
          symptoms: Json | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          cycle_length?: number | null
          cycle_start_date: string
          id?: string
          is_active?: boolean | null
          notes?: string | null
          period_length?: number | null
          symptoms?: Json | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          cycle_length?: number | null
          cycle_start_date?: string
          id?: string
          is_active?: boolean | null
          notes?: string | null
          period_length?: number | null
          symptoms?: Json | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "menstrual_cycles_user_id_fkey"
            columns: ["user_id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      onboarding_responses: {
        Row: {
          completed_at: string | null
          id: string
          responses: Json
          user_id: string | null
        }
        Insert: {
          completed_at?: string | null
          id?: string
          responses: Json
          user_id?: string | null
        }
        Update: {
          completed_at?: string | null
          id?: string
          responses?: Json
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "onboarding_responses_user_id_fkey"
            columns: ["user_id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      partner_suggestions: {
        Row: {
          id: string
          relationship_id: string
          recipient_user_id: string
          source_user_id: string
          suggestion_type: string
          suggestion_text: string
          anonymized_context: string | null
          priority_score: number
          confidence_score: number | null
          delivered_at: string | null
          viewed_at: string | null
          response: string | null
          effectiveness_rating: number | null
          created_at: string
          updated_at: string | null
          expires_at: string
        }
        Insert: {
          id?: string
          relationship_id: string
          recipient_user_id: string
          source_user_id: string
          suggestion_type: string
          suggestion_text: string
          anonymized_context?: string | null
          priority_score?: number
          confidence_score?: number | null
          delivered_at?: string | null
          viewed_at?: string | null
          response?: string | null
          effectiveness_rating?: number | null
          created_at?: string
          updated_at?: string | null
          expires_at?: string
        }
        Update: {
          id?: string
          relationship_id?: string
          recipient_user_id?: string
          source_user_id?: string
          suggestion_type?: string
          suggestion_text?: string
          anonymized_context?: string | null
          priority_score?: number
          confidence_score?: number | null
          delivered_at?: string | null
          viewed_at?: string | null
          response?: string | null
          effectiveness_rating?: number | null
          created_at?: string
          updated_at?: string | null
          expires_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "partner_suggestions_relationship_id_fkey"
            columns: ["relationship_id"]
            referencedRelation: "relationships"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "partner_suggestions_recipient_user_id_fkey"
            columns: ["recipient_user_id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "partner_suggestions_source_user_id_fkey"
            columns: ["source_user_id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      relationship_insights: {
        Row: {
          created_at: string | null
          description: string
          generated_for_user: string | null
          id: string
          insight_type: string
          is_read: boolean | null
          priority: string | null
          relationship_id: string | null
          title: string
        }
        Insert: {
          created_at?: string | null
          description: string
          generated_for_user?: string | null
          id?: string
          insight_type: string
          is_read?: boolean | null
          priority?: string | null
          relationship_id?: string | null
          title: string
        }
        Update: {
          created_at?: string | null
          description?: string
          generated_for_user?: string | null
          id?: string
          insight_type?: string
          is_read?: boolean | null
          priority?: string | null
          relationship_id?: string | null
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "relationship_insights_generated_for_user_fkey"
            columns: ["generated_for_user"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "relationship_insights_relationship_id_fkey"
            columns: ["relationship_id"]
            referencedRelation: "relationships"
            referencedColumns: ["id"]
          },
        ]
      }
      relationship_members: {
        Row: {
          id: string
          joined_at: string | null
          relationship_id: string | null
          role: string | null
          user_id: string | null
        }
        Insert: {
          id?: string
          joined_at?: string | null
          relationship_id?: string | null
          role?: string | null
          user_id?: string | null
        }
        Update: {
          id?: string
          joined_at?: string | null
          relationship_id?: string | null
          role?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "relationship_members_relationship_id_fkey"
            columns: ["relationship_id"]
            referencedRelation: "relationships"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "relationship_members_user_id_fkey"
            columns: ["user_id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      relationships: {
        Row: {
          created_at: string | null
          created_by: string
          id: string
          name: string
          relationship_type: string
        }
        Insert: {
          created_at?: string | null
          created_by: string
          id?: string
          name: string
          relationship_type: string
        }
        Update: {
          created_at?: string | null
          created_by?: string
          id?: string
          name?: string
          relationship_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "relationships_created_by_fkey"
            columns: ["created_by"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      users: {
        Row: {
          avatar_url: string | null
          created_at: string | null
          email: string
          full_name: string | null
          id: string
          onboarding_completed: boolean | null
          updated_at: string | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string | null
          email: string
          full_name?: string | null
          id: string
          onboarding_completed?: boolean | null
          updated_at?: string | null
        }
        Update: {
          avatar_url?: string | null
          created_at?: string | null
          email?: string
          full_name?: string | null
          id?: string
          onboarding_completed?: boolean | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "users_id_fkey"
            columns: ["id"]
            referencedRelation: "users"
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
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type PublicSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (PublicSchema["Tables"] & PublicSchema["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] &
        PublicSchema["Views"])
    ? (PublicSchema["Tables"] &
        PublicSchema["Views"])[PublicTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof PublicSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
    ? PublicSchema["Enums"][PublicEnumNameOrOptions]
    : never

// ============================================
// HELPER TYPES FOR PARTNER SUGGESTIONS
// ============================================

// Type for creating new suggestions
export type PartnerSuggestionInsert = Database['public']['Tables']['partner_suggestions']['Insert']

// Type for suggestion with user details (for UI components)
export type PartnerSuggestionWithUsers = Database['public']['Tables']['partner_suggestions']['Row'] & {
  recipient_user: {
    id: string
    full_name: string | null
    email: string
  }
  source_user: {
    id: string
    full_name: string | null
    email: string
  }
  relationship: {
    id: string
    name: string
    relationship_type: string
  }
}

// Enum for suggestion types (for validation)
export const SUGGESTION_TYPES = [
  'love_language_action',
  'communication_improvement', 
  'intimacy_connection',
  'goal_support',
  'conflict_resolution',
  'quality_time',
  'stress_support'
] as const

export type SuggestionType = typeof SUGGESTION_TYPES[number]

// Type for suggestion generation request
export interface GenerateSuggestionRequest {
  relationshipId: string
  sourceUserId: string
  needType: SuggestionType
  needContext: string
  priority?: number
}

// Type for suggestion delivery
export interface SuggestionDelivery {
  suggestionId: string
  deliveredAt: string
}

// Type for suggestion response
export interface SuggestionResponse {
  suggestionId: string
  response: string
  effectivenessRating: number // 1-5
  viewedAt: string
}