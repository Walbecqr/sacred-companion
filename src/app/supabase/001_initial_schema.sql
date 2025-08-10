-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "pg_trgm"; -- For text search
CREATE EXTENSION IF NOT EXISTS "vector"; -- For AI embeddings (if using pgvector)

-- =====================================================
-- CORE TABLES
-- =====================================================

-- User Spiritual Profiles (extends auth.users)
CREATE TABLE IF NOT EXISTS user_spiritual_profiles (
    user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    display_name TEXT,
    current_journey_phase TEXT,
    experience_level TEXT CHECK (experience_level IN ('beginner', 'intermediate', 'advanced', 'expert')),
    spiritual_path TEXT[] DEFAULT '{}',
    preferred_deities TEXT[] DEFAULT '{}',
    spiritual_practices TEXT[] DEFAULT '{}',
    spiritual_goals TEXT[] DEFAULT '{}',
    personality_tags TEXT[] DEFAULT '{}',
    safety_profile JSONB DEFAULT '{}', -- allergies, pregnancy status, pets, etc.
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Conversations
CREATE TABLE IF NOT EXISTS conversations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    title TEXT,
    last_message_at TIMESTAMPTZ DEFAULT NOW(),
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Messages
CREATE TABLE IF NOT EXISTS messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    role TEXT NOT NULL CHECK (role IN ('user', 'assistant', 'system', 'tool')),
    content TEXT NOT NULL,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Memory Embeddings (for AI context retrieval)
CREATE TABLE IF NOT EXISTS memory_embeddings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    embedding vector(1536), -- Adjust dimension based on your embedding model
    importance_score REAL DEFAULT 0,
    source_type TEXT CHECK (source_type IN ('chat', 'journal', 'ritual', 'manual')),
    source_id UUID,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Journal Entries
CREATE TABLE IF NOT EXISTS journal_entries (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    title TEXT,
    body TEXT NOT NULL,
    mood TEXT,
    energy_level INTEGER CHECK (energy_level >= 1 AND energy_level <= 10),
    tags TEXT[] DEFAULT '{}',
    ai_reflection TEXT, -- Beatrice's reflection on the entry
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Rituals
CREATE TABLE IF NOT EXISTS rituals (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    ritual_type TEXT,
    intention TEXT,
    moon_phase TEXT,
    deities_invoked TEXT[] DEFAULT '{}',
    tools_used TEXT[] DEFAULT '{}',
    correspondences_used JSONB DEFAULT '{}',
    scheduled_for TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    outcome TEXT,
    effectiveness_rating INTEGER CHECK (effectiveness_rating >= 1 AND effectiveness_rating <= 10),
    photos TEXT[] DEFAULT '{}', -- Array of photo URLs
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Daily Check-ins
CREATE TABLE IF NOT EXISTS daily_check_ins (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    mood TEXT,
    energy_level INTEGER CHECK (energy_level >= 1 AND energy_level <= 10),
    spiritual_practice_done BOOLEAN DEFAULT FALSE,
    gratitude_list TEXT[] DEFAULT '{}',
    intentions_set TEXT[] DEFAULT '{}',
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Correspondences (Reference Data)
-- Drop table if it exists to ensure clean creation
DROP TABLE IF EXISTS correspondences CASCADE;

CREATE TABLE correspondences (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    category TEXT NOT NULL, -- herb, crystal, color, deity, element, etc.
    family TEXT, -- sub-category
    properties JSONB DEFAULT '{}',
    associations JSONB DEFAULT '{}',
    safety_warnings JSONB DEFAULT '{}', -- pregnancy, pets, toxicity warnings
    magical_uses TEXT[] DEFAULT '{}',
    elemental_associations TEXT[] DEFAULT '{}',
    planetary_associations TEXT[] DEFAULT '{}',
    zodiac_associations TEXT[] DEFAULT '{}',
    search_vector tsvector, -- For full-text search
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Personal Book of Shadows
CREATE TABLE IF NOT EXISTS book_of_shadows_entries (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    entry_type TEXT NOT NULL, -- spell, ritual_outcome, discovery, insight, etc.
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    related_ritual_id UUID REFERENCES rituals(id),
    related_journal_id UUID REFERENCES journal_entries(id),
    effectiveness_notes TEXT,
    personal_modifications TEXT,
    tags TEXT[] DEFAULT '{}',
    photos TEXT[] DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tarot/Oracle Readings
CREATE TABLE IF NOT EXISTS divination_readings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    reading_type TEXT NOT NULL, -- tarot, oracle, pendulum, runes, etc.
    question TEXT,
    spread_type TEXT,
    cards_drawn JSONB DEFAULT '{}', -- Array of card positions and meanings
    interpretation TEXT,
    personal_notes TEXT,
    photos TEXT[] DEFAULT '{}',
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- User Inventory (Phase 4)
CREATE TABLE IF NOT EXISTS spiritual_inventory (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    item_name TEXT NOT NULL,
    item_type TEXT NOT NULL,
    category TEXT,
    quantity DECIMAL,
    unit TEXT,
    status TEXT CHECK (status IN ('on_hand', 'low_stock', 'shopping_list', 'wish_list')),
    storage_location TEXT,
    storage_details TEXT,
    last_purchase_date DATE,
    average_price DECIMAL,
    photos TEXT[] DEFAULT '{}',
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Search Analytics (for improving search)
CREATE TABLE IF NOT EXISTS search_analytics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    query TEXT NOT NULL,
    results_count INTEGER,
    clicked_results JSONB DEFAULT '[]',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- INDEXES
-- =====================================================

-- Performance indexes
CREATE INDEX idx_conversations_user_id ON conversations(user_id);
CREATE INDEX idx_messages_conversation_id ON messages(conversation_id);
CREATE INDEX idx_messages_created_at ON messages(created_at DESC);
CREATE INDEX idx_journal_entries_user_id ON journal_entries(user_id);
CREATE INDEX idx_journal_entries_created_at ON journal_entries(created_at DESC);
CREATE INDEX idx_rituals_user_id ON rituals(user_id);
CREATE INDEX idx_rituals_scheduled_for ON rituals(scheduled_for);
CREATE INDEX idx_daily_check_ins_user_id_created ON daily_check_ins(user_id, created_at DESC);

-- Full-text search indexes
CREATE INDEX idx_correspondences_search ON correspondences USING GIN(search_vector);
CREATE INDEX idx_correspondences_name ON correspondences USING GIN(name gin_trgm_ops);
CREATE INDEX idx_correspondences_category ON correspondences(category);

-- Vector similarity search index (if using pgvector)
CREATE INDEX idx_memory_embeddings_vector ON memory_embeddings 
    USING ivfflat (embedding vector_cosine_ops) 
    WITH (lists = 100);

-- =====================================================
-- ROW LEVEL SECURITY (RLS)
-- =====================================================

-- Enable RLS on all user tables
ALTER TABLE user_spiritual_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE memory_embeddings ENABLE ROW LEVEL SECURITY;
ALTER TABLE journal_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE rituals ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_check_ins ENABLE ROW LEVEL SECURITY;
ALTER TABLE book_of_shadows_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE divination_readings ENABLE ROW LEVEL SECURITY;
ALTER TABLE spiritual_inventory ENABLE ROW LEVEL SECURITY;

-- RLS Policies: Users can only access their own data
CREATE POLICY "Users can view own profile" ON user_spiritual_profiles
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own conversations" ON conversations
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own messages" ON messages
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own memories" ON memory_embeddings
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own journal" ON journal_entries
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own rituals" ON rituals
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own check-ins" ON daily_check_ins
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own book of shadows" ON book_of_shadows_entries
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own readings" ON divination_readings
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own inventory" ON spiritual_inventory
    FOR ALL USING (auth.uid() = user_id);

-- Correspondences are read-only for all authenticated users
CREATE POLICY "All users can read correspondences" ON correspondences
    FOR SELECT USING (true);

-- Search analytics: users can insert, admins can read all
CREATE POLICY "Users can log searches" ON search_analytics
    FOR INSERT WITH CHECK (true);

-- =====================================================
-- TRIGGERS
-- =====================================================

-- Update timestamp trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply update trigger to relevant tables
CREATE TRIGGER update_user_spiritual_profiles_updated_at
    BEFORE UPDATE ON user_spiritual_profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_conversations_updated_at
    BEFORE UPDATE ON conversations
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_journal_entries_updated_at
    BEFORE UPDATE ON journal_entries
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_rituals_updated_at
    BEFORE UPDATE ON rituals
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_correspondences_updated_at
    BEFORE UPDATE ON correspondences
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_book_of_shadows_entries_updated_at
    BEFORE UPDATE ON book_of_shadows_entries
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_spiritual_inventory_updated_at
    BEFORE UPDATE ON spiritual_inventory
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Full-text search vector update trigger
CREATE OR REPLACE FUNCTION update_correspondence_search_vector()
RETURNS TRIGGER AS $$
BEGIN
    NEW.search_vector := 
        setweight(to_tsvector('english', COALESCE(NEW.name, '')), 'A') ||
        setweight(to_tsvector('english', COALESCE(NEW.category, '')), 'B') ||
        setweight(to_tsvector('english', COALESCE(NEW.family, '')), 'C') ||
        setweight(to_tsvector('english', COALESCE(array_to_string(NEW.magical_uses, ' '), '')), 'D');
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_correspondence_search_vector_trigger
    BEFORE INSERT OR UPDATE ON correspondences
    FOR EACH ROW EXECUTE FUNCTION update_correspondence_search_vector();

-- =====================================================
-- INITIAL DATA
-- =====================================================

-- Insert some basic correspondences (you can expand this significantly)
INSERT INTO correspondences (name, category, family, properties, associations, magical_uses) VALUES
('Rose Quartz', 'crystal', 'quartz', 
 '{"color": "pink", "hardness": 7, "chakra": "heart"}',
 '{"element": "water", "planet": "venus", "zodiac": ["taurus", "libra"]}',
 ARRAY['love', 'self-love', 'healing', 'peace', 'relationships']),
 
('Lavender', 'herb', 'lamiaceae',
 '{"parts_used": ["flowers", "leaves"], "native_to": "mediterranean"}',
 '{"element": "air", "planet": "mercury", "deities": ["hecate", "saturn"]}',
 ARRAY['peace', 'sleep', 'purification', 'happiness', 'love']),
 
('Amethyst', 'crystal', 'quartz',
 '{"color": "purple", "hardness": 7, "chakra": ["third_eye", "crown"]}',
 '{"element": "water", "planet": "jupiter", "zodiac": ["pisces", "aquarius"]}',
 ARRAY['intuition', 'protection', 'sobriety', 'meditation', 'wisdom']),
 
('Full Moon', 'lunar_phase', 'moon',
 '{"duration": "3 days", "energy": "peak"}',
 '{"element": "water", "energy_type": "manifesting"}',
 ARRAY['manifestation', 'gratitude', 'charging', 'divination', 'completion']);