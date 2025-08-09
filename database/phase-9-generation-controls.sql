-- Phase 9: Generation Controls Table for Launch Rules Implementation
-- Purpose: Track and enforce daily limits for check-ins, insights, and partner suggestions
-- Critical for sustainable unit economics and premium conversion

-- Drop existing table if it exists (for clean migration)
DROP TABLE IF EXISTS public.generation_controls CASCADE;

-- Create generation_controls table
CREATE TABLE IF NOT EXISTS public.generation_controls (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  relationship_id uuid NOT NULL REFERENCES public.relationships(id) ON DELETE CASCADE,
  
  -- Check-in tracking (1 per relationship per day)
  last_checkin_at timestamptz,
  checkins_today integer DEFAULT 0,
  checkin_date date,
  
  -- Insight generation tracking
  last_insight_generated_at timestamptz,
  insights_generated_today integer DEFAULT 0,
  insight_date date,
  first_journal_after_checkin_today boolean DEFAULT false,
  
  -- Partner suggestion tracking (premium only)
  last_suggestion_generated_at timestamptz,
  suggestions_generated_today integer DEFAULT 0,
  suggestion_date date,
  
  -- Metadata
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  
  -- Ensure one control record per user-relationship pair
  CONSTRAINT unique_user_relationship UNIQUE (user_id, relationship_id)
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_genctrl_user_rel 
  ON public.generation_controls(user_id, relationship_id);

CREATE INDEX IF NOT EXISTS idx_genctrl_last_checkin 
  ON public.generation_controls(last_checkin_at);

CREATE INDEX IF NOT EXISTS idx_genctrl_checkin_date 
  ON public.generation_controls(checkin_date);

CREATE INDEX IF NOT EXISTS idx_genctrl_insight_date 
  ON public.generation_controls(insight_date);

-- Enable Row Level Security
ALTER TABLE public.generation_controls ENABLE ROW LEVEL SECURITY;

-- RLS Policies

-- Users can only see their own generation controls
CREATE POLICY "Users can view own generation controls" 
  ON public.generation_controls
  FOR SELECT
  USING (auth.uid() = user_id);

-- Users can insert their own generation controls
CREATE POLICY "Users can insert own generation controls" 
  ON public.generation_controls
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own generation controls
CREATE POLICY "Users can update own generation controls" 
  ON public.generation_controls
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Users can delete their own generation controls
CREATE POLICY "Users can delete own generation controls" 
  ON public.generation_controls
  FOR DELETE
  USING (auth.uid() = user_id);

-- Create trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_generation_controls_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_generation_controls_updated_at_trigger
  BEFORE UPDATE ON public.generation_controls
  FOR EACH ROW
  EXECUTE FUNCTION update_generation_controls_updated_at();

-- Helper function to check if user can check in today
CREATE OR REPLACE FUNCTION can_user_checkin(p_user_id uuid, p_relationship_id uuid)
RETURNS boolean AS $$
DECLARE
  v_last_checkin_date date;
  v_today date;
BEGIN
  v_today := CURRENT_DATE;
  
  SELECT checkin_date INTO v_last_checkin_date
  FROM public.generation_controls
  WHERE user_id = p_user_id 
    AND relationship_id = p_relationship_id;
  
  -- If no record exists or last checkin was not today, allow checkin
  RETURN v_last_checkin_date IS NULL OR v_last_checkin_date < v_today;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Helper function to check if user can generate insight
CREATE OR REPLACE FUNCTION can_generate_insight(p_user_id uuid, p_relationship_id uuid, p_is_premium boolean)
RETURNS boolean AS $$
DECLARE
  v_control_record RECORD;
  v_today date;
  v_has_checkin_today boolean;
BEGIN
  v_today := CURRENT_DATE;
  
  -- Get the control record
  SELECT * INTO v_control_record
  FROM public.generation_controls
  WHERE user_id = p_user_id 
    AND relationship_id = p_relationship_id;
  
  -- If no record exists, no insight can be generated
  IF NOT FOUND THEN
    RETURN false;
  END IF;
  
  -- Check if user has checked in today
  v_has_checkin_today := v_control_record.checkin_date = v_today;
  
  -- No checkin today = no insight
  IF NOT v_has_checkin_today THEN
    RETURN false;
  END IF;
  
  -- Premium users can generate unlimited insights after checkin
  IF p_is_premium THEN
    RETURN true;
  END IF;
  
  -- Free users can only generate one insight (first journal after checkin)
  RETURN NOT v_control_record.first_journal_after_checkin_today;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Helper function to update checkin tracking
CREATE OR REPLACE FUNCTION record_checkin(p_user_id uuid, p_relationship_id uuid)
RETURNS void AS $$
DECLARE
  v_today date;
BEGIN
  v_today := CURRENT_DATE;
  
  -- Insert or update the control record
  INSERT INTO public.generation_controls (
    user_id, 
    relationship_id, 
    last_checkin_at, 
    checkins_today,
    checkin_date
  )
  VALUES (
    p_user_id, 
    p_relationship_id, 
    now(), 
    1,
    v_today
  )
  ON CONFLICT (user_id, relationship_id) 
  DO UPDATE SET
    last_checkin_at = now(),
    checkins_today = 1,
    checkin_date = v_today,
    -- Reset insight tracking for the new day
    insights_generated_today = CASE 
      WHEN generation_controls.insight_date < v_today THEN 0 
      ELSE generation_controls.insights_generated_today 
    END,
    insight_date = CASE 
      WHEN generation_controls.insight_date < v_today THEN NULL 
      ELSE generation_controls.insight_date 
    END,
    first_journal_after_checkin_today = false;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Helper function to record insight generation
CREATE OR REPLACE FUNCTION record_insight_generation(p_user_id uuid, p_relationship_id uuid)
RETURNS void AS $$
DECLARE
  v_today date;
BEGIN
  v_today := CURRENT_DATE;
  
  UPDATE public.generation_controls
  SET 
    last_insight_generated_at = now(),
    insights_generated_today = CASE 
      WHEN insight_date = v_today THEN insights_generated_today + 1 
      ELSE 1 
    END,
    insight_date = v_today,
    first_journal_after_checkin_today = true
  WHERE user_id = p_user_id 
    AND relationship_id = p_relationship_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant necessary permissions
GRANT ALL ON public.generation_controls TO authenticated;
GRANT EXECUTE ON FUNCTION can_user_checkin TO authenticated;
GRANT EXECUTE ON FUNCTION can_generate_insight TO authenticated;
GRANT EXECUTE ON FUNCTION record_checkin TO authenticated;
GRANT EXECUTE ON FUNCTION record_insight_generation TO authenticated;

-- Add comments for documentation
COMMENT ON TABLE public.generation_controls IS 'Tracks daily generation limits for check-ins, insights, and partner suggestions per user-relationship pair';
COMMENT ON COLUMN public.generation_controls.last_checkin_at IS 'Timestamp of the most recent check-in for this relationship';
COMMENT ON COLUMN public.generation_controls.checkins_today IS 'Number of check-ins today (should always be 0 or 1)';
COMMENT ON COLUMN public.generation_controls.checkin_date IS 'Date of the last check-in (used for daily reset logic)';
COMMENT ON COLUMN public.generation_controls.first_journal_after_checkin_today IS 'Whether the first journal after today''s check-in has been submitted (for free tier limit)';
COMMENT ON FUNCTION can_user_checkin IS 'Checks if a user can perform a check-in for a specific relationship today';
COMMENT ON FUNCTION can_generate_insight IS 'Checks if a user can generate an insight based on tier and daily limits';
COMMENT ON FUNCTION record_checkin IS 'Records a successful check-in and resets daily counters';
COMMENT ON FUNCTION record_insight_generation IS 'Records that an insight was generated';