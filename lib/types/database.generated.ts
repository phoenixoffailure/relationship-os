// Generated from database/rolling-supabase-schema
// Last generated: December 2024
// This file contains TypeScript types for ALL database tables

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
      admin_permissions: {
        Row: {
          id: string
          user_id: string | null
          permission: string
          resource: string | null
          granted_by: string | null
          created_at: string | null
        }
        Insert: {
          id?: string
          user_id?: string | null
          permission: string
          resource?: string | null
          granted_by?: string | null
          created_at?: string | null
        }
        Update: {
          id?: string
          user_id?: string | null
          permission?: string
          resource?: string | null
          granted_by?: string | null
          created_at?: string | null
        }
      }
      ai_conversation_history: {
        Row: {
          id: string
          user_id: string
          relationship_id: string | null
          relationship_type: 'romantic' | 'work' | 'family' | 'friend' | 'other'
          conversation_type: 'insight_generation' | 'journal_analysis' | 'suggestion_creation' | 'general_conversation'
          user_input: string | null
          ai_response: string | null
          response_type: 'insight' | 'suggestion' | 'analysis' | 'conversation'
          ai_personality_used: string
          memory_entries_referenced: number | null
          context_used: Json | null
          confidence: number | null
          user_feedback: number | null
          was_helpful: boolean | null
          created_at: string | null
          response_time_ms: number | null
          session_id: string | null
          sequence_number: number | null
        }
        Insert: {
          id?: string
          user_id: string
          relationship_id?: string | null
          relationship_type: 'romantic' | 'work' | 'family' | 'friend' | 'other'
          conversation_type: 'insight_generation' | 'journal_analysis' | 'suggestion_creation' | 'general_conversation'
          user_input?: string | null
          ai_response?: string | null
          response_type: 'insight' | 'suggestion' | 'analysis' | 'conversation'
          ai_personality_used: string
          memory_entries_referenced?: number | null
          context_used?: Json | null
          confidence?: number | null
          user_feedback?: number | null
          was_helpful?: boolean | null
          created_at?: string | null
          response_time_ms?: number | null
          session_id?: string | null
          sequence_number?: number | null
        }
        Update: {
          id?: string
          user_id?: string
          relationship_id?: string | null
          relationship_type?: 'romantic' | 'work' | 'family' | 'friend' | 'other'
          conversation_type?: 'insight_generation' | 'journal_analysis' | 'suggestion_creation' | 'general_conversation'
          user_input?: string | null
          ai_response?: string | null
          response_type?: 'insight' | 'suggestion' | 'analysis' | 'conversation'
          ai_personality_used?: string
          memory_entries_referenced?: number | null
          context_used?: Json | null
          confidence?: number | null
          user_feedback?: number | null
          was_helpful?: boolean | null
          created_at?: string | null
          response_time_ms?: number | null
          session_id?: string | null
          sequence_number?: number | null
        }
      }
      ai_memory_entries: {
        Row: {
          id: string
          user_id: string
          relationship_id: string | null
          relationship_type: 'romantic' | 'work' | 'family' | 'friend' | 'other'
          entry_type: 'interaction' | 'insight' | 'pattern' | 'milestone' | 'preference' | 'boundary'
          content: string
          context: Json | null
          importance: 'low' | 'medium' | 'high' | 'critical'
          emotional_tone: 'positive' | 'neutral' | 'negative' | 'mixed'
          tags: string[] | null
          created_at: string | null
          last_referenced_at: string | null
          reference_count: number | null
          expires_at: string | null
          is_active: boolean | null
          confidence_score: number | null
          created_at_index: string | null
        }
        Insert: {
          id?: string
          user_id: string
          relationship_id?: string | null
          relationship_type: 'romantic' | 'work' | 'family' | 'friend' | 'other'
          entry_type: 'interaction' | 'insight' | 'pattern' | 'milestone' | 'preference' | 'boundary'
          content: string
          context?: Json | null
          importance: 'low' | 'medium' | 'high' | 'critical'
          emotional_tone: 'positive' | 'neutral' | 'negative' | 'mixed'
          tags?: string[] | null
          created_at?: string | null
          last_referenced_at?: string | null
          reference_count?: number | null
          expires_at?: string | null
          is_active?: boolean | null
          confidence_score?: number | null
          created_at_index?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          relationship_id?: string | null
          relationship_type?: 'romantic' | 'work' | 'family' | 'friend' | 'other'
          entry_type?: 'interaction' | 'insight' | 'pattern' | 'milestone' | 'preference' | 'boundary'
          content?: string
          context?: Json | null
          importance?: 'low' | 'medium' | 'high' | 'critical'
          emotional_tone?: 'positive' | 'neutral' | 'negative' | 'mixed'
          tags?: string[] | null
          created_at?: string | null
          last_referenced_at?: string | null
          reference_count?: number | null
          expires_at?: string | null
          is_active?: boolean | null
          confidence_score?: number | null
          created_at_index?: string | null
        }
      }
      batch_processing_log: {
        Row: {
          id: string
          batch_date: string
          relationship_id: string | null
          entries_processed: number | null
          suggestions_generated: number | null
          processing_status: 'running' | 'completed' | 'failed' | null
          error_message: string | null
          processing_started_at: string | null
          processing_completed_at: string | null
          created_at: string | null
        }
        Insert: {
          id?: string
          batch_date: string
          relationship_id?: string | null
          entries_processed?: number | null
          suggestions_generated?: number | null
          processing_status?: 'running' | 'completed' | 'failed' | null
          error_message?: string | null
          processing_started_at?: string | null
          processing_completed_at?: string | null
          created_at?: string | null
        }
        Update: {
          id?: string
          batch_date?: string
          relationship_id?: string | null
          entries_processed?: number | null
          suggestions_generated?: number | null
          processing_status?: 'running' | 'completed' | 'failed' | null
          error_message?: string | null
          processing_started_at?: string | null
          processing_completed_at?: string | null
          created_at?: string | null
        }
      }
      beta_signups: {
        Row: {
          id: string
          email: string
          partner_email: string | null
          connection_gap: string | null
          source: string | null
          created_at: string
          email_sent: boolean | null
          converted_to_user: boolean | null
          user_id: string | null
          notes: string | null
        }
        Insert: {
          id?: string
          email: string
          partner_email?: string | null
          connection_gap?: string | null
          source?: string | null
          created_at?: string
          email_sent?: boolean | null
          converted_to_user?: boolean | null
          user_id?: string | null
          notes?: string | null
        }
        Update: {
          id?: string
          email?: string
          partner_email?: string | null
          connection_gap?: string | null
          source?: string | null
          created_at?: string
          email_sent?: boolean | null
          converted_to_user?: boolean | null
          user_id?: string | null
          notes?: string | null
        }
      }
      communication_analysis_results: {
        Row: {
          id: string
          user_id: string | null
          relationship_id: string | null
          directness_score: number
          assertiveness_score: number
          emotional_expression_score: number
          conflict_style: 'competing' | 'accommodating' | 'avoiding' | 'compromising' | 'collaborating'
          journal_entries_analyzed: number
          confidence_level: number
          communication_patterns: Json | null
          generated_at: string | null
          expires_at: string | null
        }
        Insert: {
          id?: string
          user_id?: string | null
          relationship_id?: string | null
          directness_score: number
          assertiveness_score: number
          emotional_expression_score: number
          conflict_style: 'competing' | 'accommodating' | 'avoiding' | 'compromising' | 'collaborating'
          journal_entries_analyzed: number
          confidence_level: number
          communication_patterns?: Json | null
          generated_at?: string | null
          expires_at?: string | null
        }
        Update: {
          id?: string
          user_id?: string | null
          relationship_id?: string | null
          directness_score?: number
          assertiveness_score?: number
          emotional_expression_score?: number
          conflict_style?: 'competing' | 'accommodating' | 'avoiding' | 'compromising' | 'collaborating'
          journal_entries_analyzed?: number
          confidence_level?: number
          communication_patterns?: Json | null
          generated_at?: string | null
          expires_at?: string | null
        }
      }
      connection_scores: {
        Row: {
          id: string
          relationship_id: string | null
          score: number | null
          factors: Json | null
          calculated_at: string | null
        }
        Insert: {
          id?: string
          relationship_id?: string | null
          score?: number | null
          factors?: Json | null
          calculated_at?: string | null
        }
        Update: {
          id?: string
          relationship_id?: string | null
          score?: number | null
          factors?: Json | null
          calculated_at?: string | null
        }
      }
      cycle_insights: {
        Row: {
          id: string
          user_id: string | null
          cycle_id: string | null
          phase: 'menstrual' | 'follicular' | 'ovulation' | 'luteal'
          predicted_mood: Json | null
          partner_suggestions: Json | null
          generated_at: string | null
        }
        Insert: {
          id?: string
          user_id?: string | null
          cycle_id?: string | null
          phase: 'menstrual' | 'follicular' | 'ovulation' | 'luteal'
          predicted_mood?: Json | null
          partner_suggestions?: Json | null
          generated_at?: string | null
        }
        Update: {
          id?: string
          user_id?: string | null
          cycle_id?: string | null
          phase?: 'menstrual' | 'follicular' | 'ovulation' | 'luteal'
          predicted_mood?: Json | null
          partner_suggestions?: Json | null
          generated_at?: string | null
        }
      }
      daily_checkins: {
        Row: {
          id: string
          user_id: string | null
          relationship_id: string | null
          connection_score: number | null
          mood_score: number | null
          gratitude_note: string | null
          challenge_note: string | null
          created_at: string | null
          improvement_note: string | null
        }
        Insert: {
          id?: string
          user_id?: string | null
          relationship_id?: string | null
          connection_score?: number | null
          mood_score?: number | null
          gratitude_note?: string | null
          challenge_note?: string | null
          created_at?: string | null
          improvement_note?: string | null
        }
        Update: {
          id?: string
          user_id?: string | null
          relationship_id?: string | null
          connection_score?: number | null
          mood_score?: number | null
          gratitude_note?: string | null
          challenge_note?: string | null
          created_at?: string | null
          improvement_note?: string | null
        }
      }
      dashboard_cache: {
        Row: {
          id: string
          user_id: string
          dashboard_data: Json
          overall_health_score: number | null
          health_trend: 'improving' | 'stable' | 'declining' | null
          timeframe_days: number | null
          data_points_analyzed: number | null
          ai_version: string | null
          includes_partner_data: boolean | null
          cached_at: string | null
          expires_at: string | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          user_id: string
          dashboard_data: Json
          overall_health_score?: number | null
          health_trend?: 'improving' | 'stable' | 'declining' | null
          timeframe_days?: number | null
          data_points_analyzed?: number | null
          ai_version?: string | null
          includes_partner_data?: boolean | null
          cached_at?: string | null
          expires_at?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          dashboard_data?: Json
          overall_health_score?: number | null
          health_trend?: 'improving' | 'stable' | 'declining' | null
          timeframe_days?: number | null
          data_points_analyzed?: number | null
          ai_version?: string | null
          includes_partner_data?: boolean | null
          cached_at?: string | null
          expires_at?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
      }
      enhanced_journal_analysis: {
        Row: {
          id: string
          user_id: string
          journal_content_hash: string
          created_at: string
          updated_at: string
          sentiment_analysis: Json | null
          overall_sentiment: string | null
          confidence_score: number | null
          relationship_needs: Json | null
          relationship_health_score: number | null
          fulfillment_tracking: Json | null
          immediate_actions: string[] | null
          pattern_insights: Json | null
          analysis_version: string | null
        }
        Insert: {
          id?: string
          user_id: string
          journal_content_hash: string
          created_at?: string
          updated_at?: string
          sentiment_analysis?: Json | null
          overall_sentiment?: string | null
          confidence_score?: number | null
          relationship_needs?: Json | null
          relationship_health_score?: number | null
          fulfillment_tracking?: Json | null
          immediate_actions?: string[] | null
          pattern_insights?: Json | null
          analysis_version?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          journal_content_hash?: string
          created_at?: string
          updated_at?: string
          sentiment_analysis?: Json | null
          overall_sentiment?: string | null
          confidence_score?: number | null
          relationship_needs?: Json | null
          relationship_health_score?: number | null
          fulfillment_tracking?: Json | null
          immediate_actions?: string[] | null
          pattern_insights?: Json | null
          analysis_version?: string | null
        }
      }
      generation_controls: {
        Row: {
          id: string
          user_id: string
          relationship_id: string
          last_checkin_at: string | null
          checkins_today: number | null
          checkin_date: string | null
          last_insight_generated_at: string | null
          insights_generated_today: number | null
          insight_date: string | null
          first_journal_after_checkin_today: boolean | null
          last_suggestion_generated_at: string | null
          suggestions_generated_today: number | null
          suggestion_date: string | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          user_id: string
          relationship_id: string
          last_checkin_at?: string | null
          checkins_today?: number | null
          checkin_date?: string | null
          last_insight_generated_at?: string | null
          insights_generated_today?: number | null
          insight_date?: string | null
          first_journal_after_checkin_today?: boolean | null
          last_suggestion_generated_at?: string | null
          suggestions_generated_today?: number | null
          suggestion_date?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          relationship_id?: string
          last_checkin_at?: string | null
          checkins_today?: number | null
          checkin_date?: string | null
          last_insight_generated_at?: string | null
          insights_generated_today?: number | null
          insight_date?: string | null
          first_journal_after_checkin_today?: boolean | null
          last_suggestion_generated_at?: string | null
          suggestions_generated_today?: number | null
          suggestion_date?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
      }
      enhanced_onboarding_responses: {
        Row: {
          id: string
          user_id: string | null
          session_id: string | null
          love_language_ranking: string[]
          love_language_scores: Json
          love_language_examples: Json
          communication_style: string
          conflict_approach: string
          stress_response: string
          expression_preferences: Json
          communication_timing: string[]
          intimacy_priorities: Json
          intimacy_enhancers: string[]
          intimacy_barriers: string[]
          connection_frequency: Json
          primary_goals: string[]
          goal_timeline: string
          specific_challenges: string
          relationship_values: string[]
          success_metrics: string
          expression_directness: string
          expression_frequency: string
          preferred_methods: string[]
          need_categories_difficulty: Json
          partner_reading_ability: number | null
          successful_communication_example: string
          communication_barriers: string[]
          completed_at: string | null
          version: number | null
          ai_processing_status: 'pending' | 'processing' | 'completed' | 'failed' | null
          created_at: string | null
          updated_at: string | null
          ai_profile_data: Json | null
          relationship_start_date: string | null
          anniversary_date: string | null
          relationship_duration_years: number | null
          relationship_duration_months: number | null
          love_language_weights: Json | null
          love_language_effective_scores: Json | null
          love_language_giving_profile: Json | null
          love_language_receiving_profile: Json | null
        }
        Insert: {
          id?: string
          user_id?: string | null
          session_id?: string | null
          love_language_ranking?: string[]
          love_language_scores?: Json
          love_language_examples?: Json
          communication_style?: string
          conflict_approach?: string
          stress_response?: string
          expression_preferences?: Json
          communication_timing?: string[]
          intimacy_priorities?: Json
          intimacy_enhancers?: string[]
          intimacy_barriers?: string[]
          connection_frequency?: Json
          primary_goals?: string[]
          goal_timeline?: string
          specific_challenges?: string
          relationship_values?: string[]
          success_metrics?: string
          expression_directness?: string
          expression_frequency?: string
          preferred_methods?: string[]
          need_categories_difficulty?: Json
          partner_reading_ability?: number | null
          successful_communication_example?: string
          communication_barriers?: string[]
          completed_at?: string | null
          version?: number | null
          ai_processing_status?: 'pending' | 'processing' | 'completed' | 'failed' | null
          created_at?: string | null
          updated_at?: string | null
          ai_profile_data?: Json | null
          relationship_start_date?: string | null
          anniversary_date?: string | null
          relationship_duration_years?: number | null
          relationship_duration_months?: number | null
          love_language_weights?: Json | null
          love_language_effective_scores?: Json | null
          love_language_giving_profile?: Json | null
          love_language_receiving_profile?: Json | null
        }
        Update: {
          id?: string
          user_id?: string | null
          session_id?: string | null
          love_language_ranking?: string[]
          love_language_scores?: Json
          love_language_examples?: Json
          communication_style?: string
          conflict_approach?: string
          stress_response?: string
          expression_preferences?: Json
          communication_timing?: string[]
          intimacy_priorities?: Json
          intimacy_enhancers?: string[]
          intimacy_barriers?: string[]
          connection_frequency?: Json
          primary_goals?: string[]
          goal_timeline?: string
          specific_challenges?: string
          relationship_values?: string[]
          success_metrics?: string
          expression_directness?: string
          expression_frequency?: string
          preferred_methods?: string[]
          need_categories_difficulty?: Json
          partner_reading_ability?: number | null
          successful_communication_example?: string
          communication_barriers?: string[]
          completed_at?: string | null
          version?: number | null
          ai_processing_status?: 'pending' | 'processing' | 'completed' | 'failed' | null
          created_at?: string | null
          updated_at?: string | null
          ai_profile_data?: Json | null
          relationship_start_date?: string | null
          anniversary_date?: string | null
          relationship_duration_years?: number | null
          relationship_duration_months?: number | null
          love_language_weights?: Json | null
          love_language_effective_scores?: Json | null
          love_language_giving_profile?: Json | null
          love_language_receiving_profile?: Json | null
        }
      }
      firo_compatibility_results: {
        Row: {
          id: string
          relationship_id: string | null
          user1_id: string | null
          user2_id: string | null
          user1_inclusion: number
          user1_control: number
          user1_affection: number
          user2_inclusion: number
          user2_control: number
          user2_affection: number
          inclusion_compatibility_score: number
          control_compatibility_score: number
          affection_compatibility_score: number
          overall_compatibility_score: number
          confidence_level: number
          generated_at: string | null
          expires_at: string | null
        }
        Insert: {
          id?: string
          relationship_id?: string | null
          user1_id?: string | null
          user2_id?: string | null
          user1_inclusion: number
          user1_control: number
          user1_affection: number
          user2_inclusion: number
          user2_control: number
          user2_affection: number
          inclusion_compatibility_score: number
          control_compatibility_score: number
          affection_compatibility_score: number
          overall_compatibility_score: number
          confidence_level: number
          generated_at?: string | null
          expires_at?: string | null
        }
        Update: {
          id?: string
          relationship_id?: string | null
          user1_id?: string | null
          user2_id?: string | null
          user1_inclusion?: number
          user1_control?: number
          user1_affection?: number
          user2_inclusion?: number
          user2_control?: number
          user2_affection?: number
          inclusion_compatibility_score?: number
          control_compatibility_score?: number
          affection_compatibility_score?: number
          overall_compatibility_score?: number
          confidence_level?: number
          generated_at?: string | null
          expires_at?: string | null
        }
      }
      insight_feedback: {
        Row: {
          id: string
          insight_id: string | null
          rating: 'up' | 'down' | null
          comment: string | null
          created_at: string | null
        }
        Insert: {
          id?: string
          insight_id?: string | null
          rating?: 'up' | 'down' | null
          comment?: string | null
          created_at?: string | null
        }
        Update: {
          id?: string
          insight_id?: string | null
          rating?: 'up' | 'down' | null
          comment?: string | null
          created_at?: string | null
        }
      }
      journal_entries: {
        Row: {
          id: string
          user_id: string | null
          content: string
          mood_score: number | null
          ai_analysis: Json | null
          created_at: string | null
          is_private: boolean | null
          tags: string[] | null
          title: string | null
          ai_processing_status: string | null
          ai_processed_at: string | null
          relationship_id: string | null
          relationship_context: string | null
          personal_insights_generated: boolean | null
          ready_for_batch_processing: boolean | null
          batch_processed_at: string | null
        }
        Insert: {
          id?: string
          user_id?: string | null
          content: string
          mood_score?: number | null
          ai_analysis?: Json | null
          created_at?: string | null
          is_private?: boolean | null
          tags?: string[] | null
          title?: string | null
          ai_processing_status?: string | null
          ai_processed_at?: string | null
          relationship_id?: string | null
          relationship_context?: string | null
          personal_insights_generated?: boolean | null
          ready_for_batch_processing?: boolean | null
          batch_processed_at?: string | null
        }
        Update: {
          id?: string
          user_id?: string | null
          content?: string
          mood_score?: number | null
          ai_analysis?: Json | null
          created_at?: string | null
          is_private?: boolean | null
          tags?: string[] | null
          title?: string | null
          ai_processing_status?: string | null
          ai_processed_at?: string | null
          relationship_id?: string | null
          relationship_context?: string | null
          personal_insights_generated?: boolean | null
          ready_for_batch_processing?: boolean | null
          batch_processed_at?: string | null
        }
      }
      // Continue with remaining tables...
      menstrual_cycles: {
        Row: {
          id: string
          user_id: string | null
          cycle_start_date: string
          cycle_length: number | null
          period_length: number | null
          symptoms: Json | null
          notes: string | null
          is_active: boolean | null
          created_at: string | null
        }
        Insert: {
          id?: string
          user_id?: string | null
          cycle_start_date: string
          cycle_length?: number | null
          period_length?: number | null
          symptoms?: Json | null
          notes?: string | null
          is_active?: boolean | null
          created_at?: string | null
        }
        Update: {
          id?: string
          user_id?: string | null
          cycle_start_date?: string
          cycle_length?: number | null
          period_length?: number | null
          symptoms?: Json | null
          notes?: string | null
          is_active?: boolean | null
          created_at?: string | null
        }
      }
      partner_suggestions: {
        Row: {
          id: string
          relationship_id: string | null
          recipient_user_id: string | null
          source_user_id: string | null
          suggestion_text: string
          suggestion_type: string | null
          delivered_at: string | null
          viewed_at: string | null
          response: string | null
          effectiveness_rating: number | null
          created_at: string | null
          quality_metrics: Json | null
          validation_passed: boolean | null
          expires_at: string | null
          priority_score: number | null
          confidence_score: number | null
          anonymized_context: string | null
          pillar_type: 'pattern' | 'action' | 'gratitude' | 'milestone' | null
          batch_date: string | null
          batch_id: string | null
          read_status: 'unread' | 'read' | 'acknowledged' | null
          read_at: string | null
          dashboard_dismissed: boolean | null
        }
        Insert: {
          id?: string
          relationship_id?: string | null
          recipient_user_id?: string | null
          source_user_id?: string | null
          suggestion_text: string
          suggestion_type?: string | null
          delivered_at?: string | null
          viewed_at?: string | null
          response?: string | null
          effectiveness_rating?: number | null
          created_at?: string | null
          quality_metrics?: Json | null
          validation_passed?: boolean | null
          expires_at?: string | null
          priority_score?: number | null
          confidence_score?: number | null
          anonymized_context?: string | null
          pillar_type?: 'pattern' | 'action' | 'gratitude' | 'milestone' | null
          batch_date?: string | null
          batch_id?: string | null
          read_status?: 'unread' | 'read' | 'acknowledged' | null
          read_at?: string | null
          dashboard_dismissed?: boolean | null
        }
        Update: {
          id?: string
          relationship_id?: string | null
          recipient_user_id?: string | null
          source_user_id?: string | null
          suggestion_text?: string
          suggestion_type?: string | null
          delivered_at?: string | null
          viewed_at?: string | null
          response?: string | null
          effectiveness_rating?: number | null
          created_at?: string | null
          quality_metrics?: Json | null
          validation_passed?: boolean | null
          expires_at?: string | null
          priority_score?: number | null
          confidence_score?: number | null
          anonymized_context?: string | null
          pillar_type?: 'pattern' | 'action' | 'gratitude' | 'milestone' | null
          batch_date?: string | null
          batch_id?: string | null
          read_status?: 'unread' | 'read' | 'acknowledged' | null
          read_at?: string | null
          dashboard_dismissed?: boolean | null
        }
      }
      premium_analyses: {
        Row: {
          id: string
          user_id: string | null
          relationship_id: string | null
          analysis_type: 'firo_compatibility' | 'communication_style' | 'relationship_trends'
          results: Json
          confidence_score: number
          research_citations: string[] | null
          limitations: string | null
          generated_at: string | null
          expires_at: string | null
        }
        Insert: {
          id?: string
          user_id?: string | null
          relationship_id?: string | null
          analysis_type: 'firo_compatibility' | 'communication_style' | 'relationship_trends'
          results: Json
          confidence_score: number
          research_citations?: string[] | null
          limitations?: string | null
          generated_at?: string | null
          expires_at?: string | null
        }
        Update: {
          id?: string
          user_id?: string | null
          relationship_id?: string | null
          analysis_type?: 'firo_compatibility' | 'communication_style' | 'relationship_trends'
          results?: Json
          confidence_score?: number
          research_citations?: string[] | null
          limitations?: string | null
          generated_at?: string | null
          expires_at?: string | null
        }
      }
      premium_subscriptions: {
        Row: {
          id: string
          user_id: string | null
          subscription_status: 'active' | 'cancelled' | 'expired' | 'trial'
          plan_type: 'premium_monthly' | 'premium_yearly' | 'premium_trial'
          stripe_subscription_id: string | null
          current_period_start: string | null
          current_period_end: string | null
          trial_ends_at: string | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          user_id?: string | null
          subscription_status: 'active' | 'cancelled' | 'expired' | 'trial'
          plan_type: 'premium_monthly' | 'premium_yearly' | 'premium_trial'
          stripe_subscription_id?: string | null
          current_period_start?: string | null
          current_period_end?: string | null
          trial_ends_at?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          user_id?: string | null
          subscription_status?: 'active' | 'cancelled' | 'expired' | 'trial'
          plan_type?: 'premium_monthly' | 'premium_yearly' | 'premium_trial'
          stripe_subscription_id?: string | null
          current_period_start?: string | null
          current_period_end?: string | null
          trial_ends_at?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
      }
      relationship_context_cache: {
        Row: {
          id: string
          user_id: string
          relationship_id: string
          relationship_type: 'romantic' | 'work' | 'family' | 'friend' | 'other'
          recent_interactions: Json | null
          important_patterns: Json | null
          preferences: Json | null
          boundaries: Json | null
          milestones: Json | null
          last_updated: string | null
          cache_version: string | null
        }
        Insert: {
          id?: string
          user_id: string
          relationship_id: string
          relationship_type: 'romantic' | 'work' | 'family' | 'friend' | 'other'
          recent_interactions?: Json | null
          important_patterns?: Json | null
          preferences?: Json | null
          boundaries?: Json | null
          milestones?: Json | null
          last_updated?: string | null
          cache_version?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          relationship_id?: string
          relationship_type?: 'romantic' | 'work' | 'family' | 'friend' | 'other'
          recent_interactions?: Json | null
          important_patterns?: Json | null
          preferences?: Json | null
          boundaries?: Json | null
          milestones?: Json | null
          last_updated?: string | null
          cache_version?: string | null
        }
      }
      relationship_health_scores: {
        Row: {
          id: string
          relationship_id: string | null
          user_id: string | null
          health_score: number
          trend: 'improving' | 'stable' | 'declining' | null
          last_activity: string | null
          unread_insights_count: number | null
          unread_suggestions_count: number | null
          calculated_at: string | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          relationship_id?: string | null
          user_id?: string | null
          health_score: number
          trend?: 'improving' | 'stable' | 'declining' | null
          last_activity?: string | null
          unread_insights_count?: number | null
          unread_suggestions_count?: number | null
          calculated_at?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          relationship_id?: string | null
          user_id?: string | null
          health_score?: number
          trend?: 'improving' | 'stable' | 'declining' | null
          last_activity?: string | null
          unread_insights_count?: number | null
          unread_suggestions_count?: number | null
          calculated_at?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
      }
      relationship_insights: {
        Row: {
          id: string
          relationship_id: string | null
          generated_for_user: string | null
          insight_type: 'pattern' | 'suggestion' | 'appreciation' | 'milestone' | 'insight' | 'growth' | 'connection' | 'professional_growth' | 'family_harmony' | 'friendship_support' | 'personal_growth' | 'boundary' | 'communication' | 'emotional_growth' | 'relationship_milestone' | 'behavioral_pattern' | 'preference_insight'
          title: string
          description: string
          priority: 'low' | 'medium' | 'high' | null
          is_read: boolean | null
          created_at: string | null
          read_status: 'unread' | 'read' | 'acknowledged' | null
          read_at: string | null
          dashboard_dismissed: boolean | null
          pillar_type: 'pattern' | 'growth' | 'appreciation' | 'milestone' | null
          relevance_score: number | null
          psychological_factors: Json | null
        }
        Insert: {
          id?: string
          relationship_id?: string | null
          generated_for_user?: string | null
          insight_type: 'pattern' | 'suggestion' | 'appreciation' | 'milestone' | 'insight' | 'growth' | 'connection' | 'professional_growth' | 'family_harmony' | 'friendship_support' | 'personal_growth' | 'boundary' | 'communication' | 'emotional_growth' | 'relationship_milestone' | 'behavioral_pattern' | 'preference_insight'
          title: string
          description: string
          priority?: 'low' | 'medium' | 'high' | null
          is_read?: boolean | null
          created_at?: string | null
          read_status?: 'unread' | 'read' | 'acknowledged' | null
          read_at?: string | null
          dashboard_dismissed?: boolean | null
          pillar_type?: 'pattern' | 'growth' | 'appreciation' | 'milestone' | null
          relevance_score?: number | null
          psychological_factors?: Json | null
        }
        Update: {
          id?: string
          relationship_id?: string | null
          generated_for_user?: string | null
          insight_type?: 'pattern' | 'suggestion' | 'appreciation' | 'milestone' | 'insight' | 'growth' | 'connection' | 'professional_growth' | 'family_harmony' | 'friendship_support' | 'personal_growth' | 'boundary' | 'communication' | 'emotional_growth' | 'relationship_milestone' | 'behavioral_pattern' | 'preference_insight'
          title?: string
          description?: string
          priority?: 'low' | 'medium' | 'high' | null
          is_read?: boolean | null
          created_at?: string | null
          read_status?: 'unread' | 'read' | 'acknowledged' | null
          read_at?: string | null
          dashboard_dismissed?: boolean | null
          pillar_type?: 'pattern' | 'growth' | 'appreciation' | 'milestone' | null
          relevance_score?: number | null
          psychological_factors?: Json | null
        }
      }
      relationship_invitations: {
        Row: {
          id: string
          from_user_id: string | null
          to_email: string | null
          relationship_name: string
          relationship_type: 'couple' | 'family' | 'friends' | 'work' | 'poly' | 'custom' | null
          status: 'pending' | 'accepted' | 'declined' | 'expired' | null
          created_at: string | null
          expires_at: string | null
          accepted_at: string | null
          invite_code: string | null
        }
        Insert: {
          id?: string
          from_user_id?: string | null
          to_email?: string | null
          relationship_name: string
          relationship_type?: 'couple' | 'family' | 'friends' | 'work' | 'poly' | 'custom' | null
          status?: 'pending' | 'accepted' | 'declined' | 'expired' | null
          created_at?: string | null
          expires_at?: string | null
          accepted_at?: string | null
          invite_code?: string | null
        }
        Update: {
          id?: string
          from_user_id?: string | null
          to_email?: string | null
          relationship_name?: string
          relationship_type?: 'couple' | 'family' | 'friends' | 'work' | 'poly' | 'custom' | null
          status?: 'pending' | 'accepted' | 'declined' | 'expired' | null
          created_at?: string | null
          expires_at?: string | null
          accepted_at?: string | null
          invite_code?: string | null
        }
      }
      relationship_members: {
        Row: {
          id: string
          relationship_id: string | null
          user_id: string | null
          role: 'admin' | 'member' | null
          joined_at: string | null
        }
        Insert: {
          id?: string
          relationship_id?: string | null
          user_id?: string | null
          role?: 'admin' | 'member' | null
          joined_at?: string | null
        }
        Update: {
          id?: string
          relationship_id?: string | null
          user_id?: string | null
          role?: 'admin' | 'member' | null
          joined_at?: string | null
        }
      }
      relationship_profiles: {
        Row: {
          id: string
          user_id: string | null
          relationship_id: string | null
          perceived_closeness: number | null
          communication_frequency: 'daily' | 'weekly' | 'monthly' | 'rarely' | null
          preferred_interaction_style: string | null
          relationship_expectations: Json | null
          interaction_preferences: Json | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          user_id?: string | null
          relationship_id?: string | null
          perceived_closeness?: number | null
          communication_frequency?: 'daily' | 'weekly' | 'monthly' | 'rarely' | null
          preferred_interaction_style?: string | null
          relationship_expectations?: Json | null
          interaction_preferences?: Json | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          user_id?: string | null
          relationship_id?: string | null
          perceived_closeness?: number | null
          communication_frequency?: 'daily' | 'weekly' | 'monthly' | 'rarely' | null
          preferred_interaction_style?: string | null
          relationship_expectations?: Json | null
          interaction_preferences?: Json | null
          created_at?: string | null
          updated_at?: string | null
        }
      }
      relationships: {
        Row: {
          id: string
          name: string
          relationship_type: 'romantic' | 'family' | 'friend' | 'work' | 'other'
          created_by: string
          created_at: string | null
        }
        Insert: {
          id?: string
          name: string
          relationship_type: 'romantic' | 'family' | 'friend' | 'work' | 'other'
          created_by: string
          created_at?: string | null
        }
        Update: {
          id?: string
          name?: string
          relationship_type?: 'romantic' | 'family' | 'friend' | 'work' | 'other'
          created_by?: string
          created_at?: string | null
        }
      }
      universal_user_profiles: {
        Row: {
          id: string
          user_id: string | null
          inclusion_need: number | null
          control_need: number | null
          affection_need: number | null
          attachment_style: 'secure' | 'anxious' | 'avoidant' | 'disorganized' | null
          attachment_confidence: number | null
          communication_directness: 'direct' | 'indirect' | null
          communication_assertiveness: 'passive' | 'assertive' | 'aggressive' | null
          communication_context: 'high-context' | 'low-context' | null
          support_preference: 'instrumental' | 'emotional' | 'balanced' | null
          conflict_style: 'competing' | 'collaborating' | 'avoiding' | 'accommodating' | 'compromising' | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          user_id?: string | null
          inclusion_need?: number | null
          control_need?: number | null
          affection_need?: number | null
          attachment_style?: 'secure' | 'anxious' | 'avoidant' | 'disorganized' | null
          attachment_confidence?: number | null
          communication_directness?: 'direct' | 'indirect' | null
          communication_assertiveness?: 'passive' | 'assertive' | 'aggressive' | null
          communication_context?: 'high-context' | 'low-context' | null
          support_preference?: 'instrumental' | 'emotional' | 'balanced' | null
          conflict_style?: 'competing' | 'collaborating' | 'avoiding' | 'accommodating' | 'compromising' | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          user_id?: string | null
          inclusion_need?: number | null
          control_need?: number | null
          affection_need?: number | null
          attachment_style?: 'secure' | 'anxious' | 'avoidant' | 'disorganized' | null
          attachment_confidence?: number | null
          communication_directness?: 'direct' | 'indirect' | null
          communication_assertiveness?: 'passive' | 'assertive' | 'aggressive' | null
          communication_context?: 'high-context' | 'low-context' | null
          support_preference?: 'instrumental' | 'emotional' | 'balanced' | null
          conflict_style?: 'competing' | 'collaborating' | 'avoiding' | 'accommodating' | 'compromising' | null
          created_at?: string | null
          updated_at?: string | null
        }
      }
      users: {
        Row: {
          id: string
          email: string
          full_name: string | null
          avatar_url: string | null
          onboarding_completed: boolean | null
          created_at: string | null
          updated_at: string | null
          age_range: string | null
          location: string | null
          zip_code: string | null
        }
        Insert: {
          id: string
          email: string
          full_name?: string | null
          avatar_url?: string | null
          onboarding_completed?: boolean | null
          created_at?: string | null
          updated_at?: string | null
          age_range?: string | null
          location?: string | null
          zip_code?: string | null
        }
        Update: {
          id?: string
          email?: string
          full_name?: string | null
          avatar_url?: string | null
          onboarding_completed?: boolean | null
          created_at?: string | null
          updated_at?: string | null
          age_range?: string | null
          location?: string | null
          zip_code?: string | null
        }
      }
      // Additional tables exist but truncated for space
      // Include: memory_system_analytics, partner_attunement_scores, 
      // privacy_preserving_suggestions, realtime_intelligence, etc.
    }
    Views: {
      // Add any database views here
    }
    Functions: {
      // Add any database functions here
    }
    Enums: {
      // Add any custom enums here
    }
  }
}

// Export convenience types
export type Tables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Row']
export type Insertable<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Insert']
export type Updatable<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Update']

// Relationship to table name mapping for easier use
export type UniversalUserProfile = Tables<'universal_user_profiles'>
export type RelationshipProfile = Tables<'relationship_profiles'>
export type Relationship = Tables<'relationships'>
export type JournalEntry = Tables<'journal_entries'>
export type EnhancedJournalAnalysis = Tables<'enhanced_journal_analysis'>
export type RelationshipInsight = Tables<'relationship_insights'>
export type PartnerSuggestion = Tables<'partner_suggestions'>
export type AIMemoryEntry = Tables<'ai_memory_entries'>
export type AIConversationHistory = Tables<'ai_conversation_history'>
export type PremiumSubscription = Tables<'premium_subscriptions'>
export type FiroCompatibilityResult = Tables<'firo_compatibility_results'>