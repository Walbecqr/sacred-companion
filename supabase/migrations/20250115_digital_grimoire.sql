-- Digital Grimoire Module Database Schema
-- Migration: 20250115_digital_grimoire.sql

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- Grimoire vault metadata
CREATE TABLE grimoire_vaults (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  book_name TEXT DEFAULT 'Digital Grimoire',
  owner_name TEXT,
  practice TEXT DEFAULT 'Eclectic',
  style TEXT DEFAULT 'Clean & mystical',
  calendar TEXT DEFAULT 'Gregorian',
  timezone TEXT DEFAULT 'UTC',
  privacy_level TEXT DEFAULT 'private',
  safety_mode BOOLEAN DEFAULT true,
  settings JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  version TEXT DEFAULT '1.1'
);

-- Grimoire entries
CREATE TABLE grimoire_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vault_id UUID REFERENCES grimoire_vaults(id) ON DELETE CASCADE,
  type TEXT NOT NULL, -- spell, ritual, correspondence, herb, crystal, etc.
  title TEXT NOT NULL,
  content TEXT,
  steps JSONB DEFAULT '[]',
  checklist JSONB DEFAULT '[]',
  correspondences JSONB DEFAULT '{}',
  tags TEXT[] DEFAULT '{}',
  linked_entries UUID[] DEFAULT '{}',
  sources JSONB DEFAULT '[]',
  media JSONB DEFAULT '[]',
  visibility TEXT DEFAULT 'private',
  status TEXT DEFAULT 'draft',
  version INTEGER DEFAULT 1,
  history JSONB DEFAULT '[]',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Grimoire attachments
CREATE TABLE grimoire_attachments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vault_id UUID REFERENCES grimoire_vaults(id) ON DELETE CASCADE,
  filename TEXT NOT NULL,
  file_type TEXT NOT NULL,
  file_url TEXT,
  note TEXT,
  added_at TIMESTAMPTZ DEFAULT NOW()
);

-- Grimoire collections (for organizing entries)
CREATE TABLE grimoire_collections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vault_id UUID REFERENCES grimoire_vaults(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  color TEXT DEFAULT '#6366f1',
  icon TEXT DEFAULT '📚',
  entry_ids UUID[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Grimoire entry history (for version tracking)
CREATE TABLE grimoire_entry_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  entry_id UUID REFERENCES grimoire_entries(id) ON DELETE CASCADE,
  version INTEGER NOT NULL,
  title TEXT NOT NULL,
  content TEXT,
  steps JSONB,
  checklist JSONB,
  correspondences JSONB,
  tags TEXT[],
  changed_by UUID REFERENCES auth.users(id),
  change_reason TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Grimoire search index
CREATE TABLE grimoire_search_index (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  entry_id UUID REFERENCES grimoire_entries(id) ON DELETE CASCADE,
  search_vector tsvector,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_grimoire_vaults_user_id ON grimoire_vaults(user_id);
CREATE INDEX idx_grimoire_entries_vault_id ON grimoire_entries(vault_id);
CREATE INDEX idx_grimoire_entries_type ON grimoire_entries(type);
CREATE INDEX idx_grimoire_entries_tags ON grimoire_entries USING GIN(tags);
CREATE INDEX idx_grimoire_entries_linked_entries ON grimoire_entries USING GIN(linked_entries);
CREATE INDEX idx_grimoire_entries_created_at ON grimoire_entries(created_at);
CREATE INDEX idx_grimoire_entries_updated_at ON grimoire_entries(updated_at);
CREATE INDEX idx_grimoire_entries_status ON grimoire_entries(status);
CREATE INDEX idx_grimoire_entries_visibility ON grimoire_entries(visibility);

CREATE INDEX idx_grimoire_attachments_vault_id ON grimoire_attachments(vault_id);
CREATE INDEX idx_grimoire_collections_vault_id ON grimoire_collections(vault_id);
CREATE INDEX idx_grimoire_entry_history_entry_id ON grimoire_entry_history(entry_id);
CREATE INDEX idx_grimoire_entry_history_version ON grimoire_entry_history(version);

-- Full-text search index
CREATE INDEX idx_grimoire_search_vector ON grimoire_search_index USING GIN(search_vector);

-- Triggers for updated_at timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_grimoire_vaults_updated_at 
    BEFORE UPDATE ON grimoire_vaults 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_grimoire_entries_updated_at 
    BEFORE UPDATE ON grimoire_entries 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_grimoire_collections_updated_at 
    BEFORE UPDATE ON grimoire_collections 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Trigger for search vector updates
CREATE OR REPLACE FUNCTION update_grimoire_search_vector()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO grimoire_search_index (entry_id, search_vector)
    VALUES (
        NEW.id,
        setweight(to_tsvector('english', COALESCE(NEW.title, '')), 'A') ||
        setweight(to_tsvector('english', COALESCE(NEW.content, '')), 'B') ||
        setweight(to_tsvector('english', array_to_string(NEW.tags, ' ')), 'C')
    )
    ON CONFLICT (entry_id) DO UPDATE SET
        search_vector = EXCLUDED.search_vector,
        created_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_grimoire_search_vector_trigger
    AFTER INSERT OR UPDATE ON grimoire_entries
    FOR EACH ROW EXECUTE FUNCTION update_grimoire_search_vector();

-- RLS Policies
ALTER TABLE grimoire_vaults ENABLE ROW LEVEL SECURITY;
ALTER TABLE grimoire_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE grimoire_attachments ENABLE ROW LEVEL SECURITY;
ALTER TABLE grimoire_collections ENABLE ROW LEVEL SECURITY;
ALTER TABLE grimoire_entry_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE grimoire_search_index ENABLE ROW LEVEL SECURITY;

-- Vault policies
CREATE POLICY "Users can view their own vaults" ON grimoire_vaults
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own vaults" ON grimoire_vaults
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own vaults" ON grimoire_vaults
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own vaults" ON grimoire_vaults
    FOR DELETE USING (auth.uid() = user_id);

-- Entry policies
CREATE POLICY "Users can view entries in their vaults" ON grimoire_entries
    FOR SELECT USING (
        vault_id IN (
            SELECT id FROM grimoire_vaults WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "Users can insert entries in their vaults" ON grimoire_entries
    FOR INSERT WITH CHECK (
        vault_id IN (
            SELECT id FROM grimoire_vaults WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "Users can update entries in their vaults" ON grimoire_entries
    FOR UPDATE USING (
        vault_id IN (
            SELECT id FROM grimoire_vaults WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "Users can delete entries in their vaults" ON grimoire_entries
    FOR DELETE USING (
        vault_id IN (
            SELECT id FROM grimoire_vaults WHERE user_id = auth.uid()
        )
    );

-- Attachment policies
CREATE POLICY "Users can view attachments in their vaults" ON grimoire_attachments
    FOR SELECT USING (
        vault_id IN (
            SELECT id FROM grimoire_vaults WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "Users can insert attachments in their vaults" ON grimoire_attachments
    FOR INSERT WITH CHECK (
        vault_id IN (
            SELECT id FROM grimoire_vaults WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "Users can update attachments in their vaults" ON grimoire_attachments
    FOR UPDATE USING (
        vault_id IN (
            SELECT id FROM grimoire_vaults WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "Users can delete attachments in their vaults" ON grimoire_attachments
    FOR DELETE USING (
        vault_id IN (
            SELECT id FROM grimoire_vaults WHERE user_id = auth.uid()
        )
    );

-- Collection policies
CREATE POLICY "Users can view collections in their vaults" ON grimoire_collections
    FOR SELECT USING (
        vault_id IN (
            SELECT id FROM grimoire_vaults WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "Users can insert collections in their vaults" ON grimoire_collections
    FOR INSERT WITH CHECK (
        vault_id IN (
            SELECT id FROM grimoire_vaults WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "Users can update collections in their vaults" ON grimoire_collections
    FOR UPDATE USING (
        vault_id IN (
            SELECT id FROM grimoire_vaults WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "Users can delete collections in their vaults" ON grimoire_collections
    FOR DELETE USING (
        vault_id IN (
            SELECT id FROM grimoire_vaults WHERE user_id = auth.uid()
        )
    );

-- History policies
CREATE POLICY "Users can view entry history in their vaults" ON grimoire_entry_history
    FOR SELECT USING (
        entry_id IN (
            SELECT ge.id FROM grimoire_entries ge
            JOIN grimoire_vaults gv ON ge.vault_id = gv.id
            WHERE gv.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can insert entry history in their vaults" ON grimoire_entry_history
    FOR INSERT WITH CHECK (
        entry_id IN (
            SELECT ge.id FROM grimoire_entries ge
            JOIN grimoire_vaults gv ON ge.vault_id = gv.id
            WHERE gv.user_id = auth.uid()
        )
    );

-- Search index policies
CREATE POLICY "Users can view search index for their entries" ON grimoire_search_index
    FOR SELECT USING (
        entry_id IN (
            SELECT ge.id FROM grimoire_entries ge
            JOIN grimoire_vaults gv ON ge.vault_id = gv.id
            WHERE gv.user_id = auth.uid()
        )
    );

-- Functions for common operations
CREATE OR REPLACE FUNCTION get_user_grimoire_vault(user_uuid UUID)
RETURNS grimoire_vaults AS $$
BEGIN
    RETURN (
        SELECT * FROM grimoire_vaults 
        WHERE user_id = user_uuid 
        LIMIT 1
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION search_grimoire_entries(
    user_uuid UUID,
    search_query TEXT,
    entry_types TEXT[] DEFAULT NULL,
    tags_filter TEXT[] DEFAULT NULL,
    limit_count INTEGER DEFAULT 50
)
RETURNS TABLE (
    id UUID,
    type TEXT,
    title TEXT,
    content TEXT,
    tags TEXT[],
    created_at TIMESTAMPTZ,
    updated_at TIMESTAMPTZ,
    rank FLOAT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        ge.id,
        ge.type,
        ge.title,
        ge.content,
        ge.tags,
        ge.created_at,
        ge.updated_at,
        ts_rank(gsi.search_vector, plainto_tsquery('english', search_query)) as rank
    FROM grimoire_entries ge
    JOIN grimoire_vaults gv ON ge.vault_id = gv.id
    JOIN grimoire_search_index gsi ON ge.id = gsi.entry_id
    WHERE gv.user_id = user_uuid
        AND gsi.search_vector @@ plainto_tsquery('english', search_query)
        AND (entry_types IS NULL OR ge.type = ANY(entry_types))
        AND (tags_filter IS NULL OR ge.tags && tags_filter)
    ORDER BY rank DESC, ge.updated_at DESC
    LIMIT limit_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
