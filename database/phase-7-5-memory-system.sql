-- Phase 7.5: Advanced Context Switching & Memory System Database Schema
-- Creates tables for AI memory storage and relationship-specific context management

-- AI Memory Entries Table
-- Stores individual memory entries for each user-relationship pair
CREATE TABLE IF NOT EXISTS ai_memory_entries (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    relationship_id UUID REFERENCES relationships(id) ON DELETE CASCADE,
    relationship_type TEXT NOT NULL CHECK (relationship_type IN ('romantic', 'work', 'family', 'friend', 'other')),
    
    -- Memory content and classification
    entry_type TEXT NOT NULL CHECK (entry_type IN ('interaction', 'insight', 'pattern', 'milestone', 'preference', 'boundary')),
    content TEXT NOT NULL,
    context JSONB DEFAULT '{}',
    
    -- Memory importance and characteristics
    importance TEXT NOT NULL CHECK (importance IN ('low', 'medium', 'high', 'critical')),
    emotional_tone TEXT NOT NULL CHECK (emotional_tone IN ('positive', 'neutral', 'negative', 'mixed')),
    tags TEXT[] DEFAULT '{}',
    
    -- Memory lifecycle
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_referenced_at TIMESTAMP WITH TIME ZONE,
    reference_count INTEGER DEFAULT 0,
    expires_at TIMESTAMP WITH TIME ZONE, -- NULL means never expires
    
    -- Memory validation
    is_active BOOLEAN DEFAULT TRUE,
    confidence_score DECIMAL(3,2) DEFAULT 0.80, -- 0.00 to 1.00
    
    -- Indexing and performance
    created_at_index TIMESTAMP WITH TIME ZONE DEFAULT NOW() -- Duplicate for index performance
);

-- Relationship Context Cache Table
-- Caches frequently accessed relationship context for performance
CREATE TABLE IF NOT EXISTS relationship_context_cache (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    relationship_id UUID NOT NULL REFERENCES relationships(id) ON DELETE CASCADE,
    relationship_type TEXT NOT NULL CHECK (relationship_type IN ('romantic', 'work', 'family', 'friend', 'other')),
    
    -- Cached context data
    recent_interactions JSONB DEFAULT '[]',
    important_patterns JSONB DEFAULT '[]',
    preferences JSONB DEFAULT '[]',
    boundaries JSONB DEFAULT '[]',
    milestones JSONB DEFAULT '[]',
    
    -- Cache metadata
    last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    cache_version TEXT DEFAULT '1.0',
    
    -- Unique constraint
    UNIQUE(user_id, relationship_id)
);

-- AI Conversation History Table
-- Tracks AI conversations with context switching
CREATE TABLE IF NOT EXISTS ai_conversation_history (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    relationship_id UUID REFERENCES relationships(id) ON DELETE CASCADE,
    relationship_type TEXT NOT NULL CHECK (relationship_type IN ('romantic', 'work', 'family', 'friend', 'other')),
    
    -- Conversation details
    conversation_type TEXT NOT NULL CHECK (conversation_type IN ('insight_generation', 'journal_analysis', 'suggestion_creation', 'general_conversation')),
    user_input TEXT,
    ai_response TEXT,
    response_type TEXT NOT NULL CHECK (response_type IN ('insight', 'suggestion', 'analysis', 'conversation')),
    
    -- AI personality and context used
    ai_personality_used TEXT NOT NULL, -- e.g., "Intimate Relationship Counselor"
    memory_entries_referenced INTEGER DEFAULT 0,
    context_used JSONB DEFAULT '{}',
    
    -- Response quality metrics
    confidence DECIMAL(3,2) DEFAULT 0.80,
    user_feedback INTEGER, -- 1 to 5 rating
    was_helpful BOOLEAN,
    
    -- Timing
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    response_time_ms INTEGER,
    
    -- Session tracking
    session_id UUID, -- Groups related conversations
    sequence_number INTEGER DEFAULT 1 -- Order within session
);

-- Memory Analytics Table
-- Tracks memory system performance and usage analytics
CREATE TABLE IF NOT EXISTS memory_system_analytics (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    relationship_id UUID REFERENCES relationships(id) ON DELETE CASCADE,
    relationship_type TEXT CHECK (relationship_type IN ('romantic', 'work', 'family', 'friend', 'other')),
    
    -- Analytics data
    memory_operation TEXT NOT NULL CHECK (memory_operation IN ('store', 'retrieve', 'update', 'delete', 'cleanup')),
    operation_success BOOLEAN NOT NULL,
    memory_count INTEGER DEFAULT 0,
    operation_time_ms INTEGER DEFAULT 0,
    
    -- Context
    triggered_by TEXT, -- API endpoint or system process
    operation_metadata JSONB DEFAULT '{}',
    error_message TEXT,
    
    -- Timestamp
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for optimal query performance

-- AI Memory Entries Indexes
CREATE INDEX IF NOT EXISTS idx_memory_entries_user_relationship 
ON ai_memory_entries(user_id, relationship_id);

CREATE INDEX IF NOT EXISTS idx_memory_entries_type_importance 
ON ai_memory_entries(relationship_type, importance);

CREATE INDEX IF NOT EXISTS idx_memory_entries_created_at 
ON ai_memory_entries(created_at_index DESC);

CREATE INDEX IF NOT EXISTS idx_memory_entries_reference_count 
ON ai_memory_entries(reference_count DESC);

CREATE INDEX IF NOT EXISTS idx_memory_entries_active 
ON ai_memory_entries(is_active, expires_at) WHERE is_active = TRUE;

CREATE INDEX IF NOT EXISTS idx_memory_entries_tags 
ON ai_memory_entries USING GIN(tags);

-- Relationship Context Cache Indexes
CREATE INDEX IF NOT EXISTS idx_context_cache_user_relationship 
ON relationship_context_cache(user_id, relationship_id);

CREATE INDEX IF NOT EXISTS idx_context_cache_updated 
ON relationship_context_cache(last_updated DESC);

-- Conversation History Indexes
CREATE INDEX IF NOT EXISTS idx_conversation_user_relationship 
ON ai_conversation_history(user_id, relationship_id);

CREATE INDEX IF NOT EXISTS idx_conversation_type_created 
ON ai_conversation_history(conversation_type, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_conversation_session 
ON ai_conversation_history(session_id, sequence_number);

-- Memory Analytics Indexes
CREATE INDEX IF NOT EXISTS idx_analytics_user_operation 
ON memory_system_analytics(user_id, memory_operation);

CREATE INDEX IF NOT EXISTS idx_analytics_created_at 
ON memory_system_analytics(created_at DESC);

-- Row Level Security (RLS) Policies

-- Enable RLS on all tables
ALTER TABLE ai_memory_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE relationship_context_cache ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_conversation_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE memory_system_analytics ENABLE ROW LEVEL SECURITY;

-- AI Memory Entries RLS Policies
CREATE POLICY "Users can access their own memory entries" ON ai_memory_entries
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Service role can access all memory entries" ON ai_memory_entries
    FOR ALL USING (current_user = 'service_role');

-- Relationship Context Cache RLS Policies
CREATE POLICY "Users can access their own context cache" ON relationship_context_cache
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Service role can access all context cache" ON relationship_context_cache
    FOR ALL USING (current_user = 'service_role');

-- Conversation History RLS Policies
CREATE POLICY "Users can access their own conversation history" ON ai_conversation_history
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Service role can access all conversation history" ON ai_conversation_history
    FOR ALL USING (current_user = 'service_role');

-- Memory Analytics RLS Policies
CREATE POLICY "Users can access their own analytics" ON memory_system_analytics
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Service role can access all analytics" ON memory_system_analytics
    FOR ALL USING (current_user = 'service_role');

-- Memory cleanup function
CREATE OR REPLACE FUNCTION cleanup_expired_memories()
RETURNS INTEGER AS $$
DECLARE
    deleted_count INTEGER;
BEGIN
    -- Delete expired memories
    DELETE FROM ai_memory_entries 
    WHERE expires_at IS NOT NULL AND expires_at <= NOW();
    
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    
    -- Log cleanup operation
    INSERT INTO memory_system_analytics (
        user_id, 
        memory_operation, 
        operation_success, 
        memory_count, 
        triggered_by,
        operation_metadata
    )
    VALUES (
        gen_random_uuid(), -- System operation
        'cleanup',
        TRUE,
        deleted_count,
        'scheduled_cleanup',
        jsonb_build_object('expired_memories_deleted', deleted_count, 'cleanup_time', NOW())
    );
    
    RETURN deleted_count;
END;
$$ LANGUAGE plpgsql;

-- Memory system statistics function
CREATE OR REPLACE FUNCTION get_memory_system_stats()
RETURNS TABLE (
    total_memories BIGINT,
    active_memories BIGINT,
    memories_by_type JSONB,
    memories_by_importance JSONB,
    memories_by_relationship_type JSONB,
    avg_confidence NUMERIC,
    total_conversations BIGINT,
    avg_memory_references NUMERIC
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        COUNT(*) as total_memories,
        COUNT(*) FILTER (WHERE is_active = TRUE) as active_memories,
        
        jsonb_object_agg(entry_type, type_count) as memories_by_type,
        jsonb_object_agg(importance, importance_count) as memories_by_importance,
        jsonb_object_agg(relationship_type, rel_type_count) as memories_by_relationship_type,
        
        AVG(confidence_score) as avg_confidence,
        
        (SELECT COUNT(*) FROM ai_conversation_history) as total_conversations,
        (SELECT AVG(memory_entries_referenced) FROM ai_conversation_history) as avg_memory_references
        
    FROM (
        SELECT 
            entry_type,
            importance,
            relationship_type,
            confidence_score,
            is_active,
            COUNT(*) OVER (PARTITION BY entry_type) as type_count,
            COUNT(*) OVER (PARTITION BY importance) as importance_count,
            COUNT(*) OVER (PARTITION BY relationship_type) as rel_type_count
        FROM ai_memory_entries
    ) stats_data;
END;
$$ LANGUAGE plpgsql;

-- Update context cache function
CREATE OR REPLACE FUNCTION update_relationship_context_cache(
    p_user_id UUID,
    p_relationship_id UUID,
    p_relationship_type TEXT
)
RETURNS VOID AS $$
DECLARE
    recent_interactions JSONB;
    important_patterns JSONB;
    preferences JSONB;
    boundaries JSONB;
    milestones JSONB;
BEGIN
    -- Get recent interactions (last 10)
    SELECT jsonb_agg(
        jsonb_build_object(
            'id', id,
            'content', content,
            'created_at', created_at,
            'importance', importance
        )
    ) INTO recent_interactions
    FROM (
        SELECT id, content, created_at, importance
        FROM ai_memory_entries
        WHERE user_id = p_user_id 
        AND relationship_id = p_relationship_id
        AND entry_type = 'interaction'
        AND is_active = TRUE
        ORDER BY created_at DESC
        LIMIT 10
    ) recent;
    
    -- Get important patterns (top 5)
    SELECT jsonb_agg(
        jsonb_build_object(
            'id', id,
            'content', content,
            'importance', importance,
            'reference_count', reference_count
        )
    ) INTO important_patterns
    FROM (
        SELECT id, content, importance, reference_count
        FROM ai_memory_entries
        WHERE user_id = p_user_id 
        AND relationship_id = p_relationship_id
        AND entry_type = 'pattern'
        AND is_active = TRUE
        ORDER BY 
            CASE importance 
                WHEN 'critical' THEN 4 
                WHEN 'high' THEN 3 
                WHEN 'medium' THEN 2 
                ELSE 1 
            END DESC,
            reference_count DESC
        LIMIT 5
    ) patterns;
    
    -- Get preferences (top 10)
    SELECT jsonb_agg(
        jsonb_build_object(
            'id', id,
            'content', content,
            'importance', importance
        )
    ) INTO preferences
    FROM (
        SELECT id, content, importance
        FROM ai_memory_entries
        WHERE user_id = p_user_id 
        AND relationship_id = p_relationship_id
        AND entry_type = 'preference'
        AND is_active = TRUE
        ORDER BY 
            CASE importance 
                WHEN 'critical' THEN 4 
                WHEN 'high' THEN 3 
                WHEN 'medium' THEN 2 
                ELSE 1 
            END DESC
        LIMIT 10
    ) prefs;
    
    -- Get boundaries (top 5)
    SELECT jsonb_agg(
        jsonb_build_object(
            'id', id,
            'content', content,
            'importance', importance
        )
    ) INTO boundaries
    FROM (
        SELECT id, content, importance
        FROM ai_memory_entries
        WHERE user_id = p_user_id 
        AND relationship_id = p_relationship_id
        AND entry_type = 'boundary'
        AND is_active = TRUE
        ORDER BY 
            CASE importance 
                WHEN 'critical' THEN 4 
                WHEN 'high' THEN 3 
                WHEN 'medium' THEN 2 
                ELSE 1 
            END DESC
        LIMIT 5
    ) bounds;
    
    -- Get milestones
    SELECT jsonb_agg(
        jsonb_build_object(
            'id', id,
            'content', content,
            'created_at', created_at
        )
    ) INTO milestones
    FROM (
        SELECT id, content, created_at
        FROM ai_memory_entries
        WHERE user_id = p_user_id 
        AND relationship_id = p_relationship_id
        AND entry_type = 'milestone'
        AND is_active = TRUE
        ORDER BY created_at DESC
        LIMIT 10
    ) miles;
    
    -- Upsert context cache
    INSERT INTO relationship_context_cache (
        user_id,
        relationship_id,
        relationship_type,
        recent_interactions,
        important_patterns,
        preferences,
        boundaries,
        milestones,
        last_updated
    )
    VALUES (
        p_user_id,
        p_relationship_id,
        p_relationship_type,
        COALESCE(recent_interactions, '[]'::jsonb),
        COALESCE(important_patterns, '[]'::jsonb),
        COALESCE(preferences, '[]'::jsonb),
        COALESCE(boundaries, '[]'::jsonb),
        COALESCE(milestones, '[]'::jsonb),
        NOW()
    )
    ON CONFLICT (user_id, relationship_id)
    DO UPDATE SET
        recent_interactions = EXCLUDED.recent_interactions,
        important_patterns = EXCLUDED.important_patterns,
        preferences = EXCLUDED.preferences,
        boundaries = EXCLUDED.boundaries,
        milestones = EXCLUDED.milestones,
        last_updated = NOW();
        
END;
$$ LANGUAGE plpgsql;

-- Automatic cache update trigger
CREATE OR REPLACE FUNCTION trigger_update_context_cache()
RETURNS TRIGGER AS $$
BEGIN
    -- Update cache when memory entries are inserted or updated
    IF TG_OP = 'INSERT' OR TG_OP = 'UPDATE' THEN
        PERFORM update_relationship_context_cache(
            NEW.user_id,
            NEW.relationship_id,
            NEW.relationship_type
        );
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        PERFORM update_relationship_context_cache(
            OLD.user_id,
            OLD.relationship_id,
            OLD.relationship_type
        );
        RETURN OLD;
    END IF;
    
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for automatic cache updates
DROP TRIGGER IF EXISTS update_context_cache_trigger ON ai_memory_entries;
CREATE TRIGGER update_context_cache_trigger
    AFTER INSERT OR UPDATE OR DELETE ON ai_memory_entries
    FOR EACH ROW
    EXECUTE FUNCTION trigger_update_context_cache();

-- Insert sample data for testing (optional - remove in production)
/*
-- Sample memory entries for testing
INSERT INTO ai_memory_entries (
    user_id, 
    relationship_id, 
    relationship_type, 
    entry_type, 
    content, 
    importance, 
    emotional_tone, 
    tags
) VALUES 
-- Sample romantic relationship memories
(
    gen_random_uuid(), 
    gen_random_uuid(), 
    'romantic', 
    'preference', 
    'Prefers quality time over gifts as primary love language',
    'high',
    'positive',
    ARRAY['love_language', 'quality_time']
),
(
    gen_random_uuid(), 
    gen_random_uuid(), 
    'work', 
    'boundary', 
    'Prefers email communication over impromptu meetings',
    'high',
    'neutral',
    ARRAY['communication', 'boundary', 'work_style']
);
*/

-- Grant permissions
GRANT ALL ON ai_memory_entries TO service_role;
GRANT ALL ON relationship_context_cache TO service_role;
GRANT ALL ON ai_conversation_history TO service_role;
GRANT ALL ON memory_system_analytics TO service_role;

GRANT SELECT, INSERT, UPDATE ON ai_memory_entries TO authenticated;
GRANT SELECT, INSERT, UPDATE ON relationship_context_cache TO authenticated;
GRANT SELECT, INSERT, UPDATE ON ai_conversation_history TO authenticated;
GRANT SELECT, INSERT ON memory_system_analytics TO authenticated;

-- Success notification
SELECT 'Phase 7.5 AI Memory System database schema created successfully! ✅' as status;