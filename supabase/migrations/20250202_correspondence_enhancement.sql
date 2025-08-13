-- Correspondence Module Enhancement Migration
-- This migration enhances the correspondences table and adds supporting tables
-- for the comprehensive correspondence database with user interaction tracking

-- First, let's enhance the existing correspondences table if needed
ALTER TABLE public.correspondences 
ADD COLUMN IF NOT EXISTS description text,
ADD COLUMN IF NOT EXISTS traditional_names text[],
ADD COLUMN IF NOT EXISTS common_names text[],
ADD COLUMN IF NOT EXISTS scientific_name text,
ADD COLUMN IF NOT EXISTS origin_culture text,
ADD COLUMN IF NOT EXISTS rarity_level text CHECK (rarity_level IN ('common', 'uncommon', 'rare', 'very_rare')),
ADD COLUMN IF NOT EXISTS seasonal_availability text[],
ADD COLUMN IF NOT EXISTS preparation_methods text[],
ADD COLUMN IF NOT EXISTS usage_notes text,
ADD COLUMN IF NOT EXISTS historical_significance text,
ADD COLUMN IF NOT EXISTS modern_applications text[],
ADD COLUMN IF NOT EXISTS view_count integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS popularity_score real DEFAULT 0.0,
ADD COLUMN IF NOT EXISTS is_featured boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS image_url text,
ADD COLUMN IF NOT EXISTS source_references text[];

-- Add index for category-based browsing
CREATE INDEX IF NOT EXISTS idx_correspondences_category ON public.correspondences(category);
CREATE INDEX IF NOT EXISTS idx_correspondences_family ON public.correspondences(family);
CREATE INDEX IF NOT EXISTS idx_correspondences_popularity ON public.correspondences(popularity_score DESC);
CREATE INDEX IF NOT EXISTS idx_correspondences_view_count ON public.correspondences(view_count DESC);

-- Full-text search index
CREATE INDEX IF NOT EXISTS idx_correspondences_search_vector ON public.correspondences USING gin(search_vector);

-- Create user_correspondence_favorites table
CREATE TABLE IF NOT EXISTS public.user_correspondence_favorites (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  user_id uuid NOT NULL,
  correspondence_id uuid NOT NULL,
  notes text,
  tags text[] DEFAULT '{}',
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT user_correspondence_favorites_pkey PRIMARY KEY (id),
  CONSTRAINT user_correspondence_favorites_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE,
  CONSTRAINT user_correspondence_favorites_correspondence_id_fkey FOREIGN KEY (correspondence_id) REFERENCES public.correspondences(id) ON DELETE CASCADE,
  CONSTRAINT unique_user_correspondence_favorite UNIQUE (user_id, correspondence_id)
);

-- Create user_correspondence_recent table for tracking recently viewed items
CREATE TABLE IF NOT EXISTS public.user_correspondence_recent (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  user_id uuid NOT NULL,
  correspondence_id uuid NOT NULL,
  accessed_at timestamp with time zone DEFAULT now(),
  access_count integer DEFAULT 1,
  CONSTRAINT user_correspondence_recent_pkey PRIMARY KEY (id),
  CONSTRAINT user_correspondence_recent_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE,
  CONSTRAINT user_correspondence_recent_correspondence_id_fkey FOREIGN KEY (correspondence_id) REFERENCES public.correspondences(id) ON DELETE CASCADE,
  CONSTRAINT unique_user_correspondence_recent UNIQUE (user_id, correspondence_id)
);

-- Create index for recent access queries
CREATE INDEX IF NOT EXISTS idx_user_correspondence_recent_user_accessed ON public.user_correspondence_recent(user_id, accessed_at DESC);

-- Create correspondence_categories table for better category management
CREATE TABLE IF NOT EXISTS public.correspondence_categories (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  name text NOT NULL UNIQUE,
  display_name text NOT NULL,
  description text,
  icon_name text,
  color_hex text,
  sort_order integer DEFAULT 0,
  item_count integer DEFAULT 0,
  is_active boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT correspondence_categories_pkey PRIMARY KEY (id)
);

-- Insert default categories based on the user story requirements
INSERT INTO public.correspondence_categories (name, display_name, description, icon_name, color_hex, sort_order, item_count) VALUES
('herbs_plants', 'Herbs & Plants', 'Botanical correspondences including herbs, flowers, trees, and other plant materials', 'Leaf', '#22c55e', 1, 331),
('animals', 'Animals', 'Animal spirit correspondences and totems for magical workings', 'Heart', '#f97316', 2, 432),
('crystals', 'Crystals & Stones', 'Mineral and crystal correspondences for energy work and healing', 'Gem', '#8b5cf6', 3, 186),
('deities', 'Deities', 'Divine correspondences from various pantheons and traditions', 'Crown', '#eab308', 4, 233),
('colors', 'Colors', 'Color magic and chromotherapy correspondences', 'Palette', '#ec4899', 5, 40),
('elements', 'Elements', 'Elemental correspondences: Earth, Air, Fire, Water, Spirit', 'Zap', '#06b6d4', 6, 25),
('planets', 'Planets', 'Planetary and astrological correspondences', 'Globe', '#3b82f6', 7, 12),
('zodiac', 'Zodiac Signs', 'Astrological sign correspondences and attributes', 'Star', '#6366f1', 8, 12),
('numbers', 'Numbers', 'Numerological correspondences and sacred geometry', 'Hash', '#84cc16', 9, 50),
('tarot', 'Tarot', 'Tarot card correspondences and meanings', 'Square', '#f59e0b', 10, 78),
('runes', 'Runes', 'Runic correspondences and divination meanings', 'Triangle', '#71717a', 11, 24),
('incense', 'Incense & Resins', 'Aromatic correspondences for ritual and meditation', 'Flame', '#dc2626', 12, 45),
('oils', 'Essential Oils', 'Essential oil correspondences for aromatherapy and magic', 'Droplets', '#059669', 13, 67),
('moon_phases', 'Moon Phases', 'Lunar correspondences and timing for magical work', 'Moon', '#6b7280', 14, 8),
('sabbats', 'Sabbats & Holidays', 'Seasonal and holiday correspondences', 'Calendar', '#7c3aed', 15, 16),
('chakras', 'Chakras', 'Energy center correspondences for healing work', 'Circle', '#ef4444', 16, 7),
('directions', 'Directions', 'Cardinal and intercardinal direction correspondences', 'Navigation', '#0891b2', 17, 8),
('tools', 'Magical Tools', 'Ritual tool correspondences and uses', 'Wand', '#be185d', 18, 35),
('metals', 'Metals', 'Metallic correspondences for crafting and energy work', 'Hexagon', '#374151', 19, 12),
('sacred_texts', 'Sacred Texts', 'Religious and spiritual text correspondences', 'BookOpen', '#7c2d12', 20, 28)
ON CONFLICT (name) DO UPDATE SET
  display_name = EXCLUDED.display_name,
  description = EXCLUDED.description,
  icon_name = EXCLUDED.icon_name,
  color_hex = EXCLUDED.color_hex,
  sort_order = EXCLUDED.sort_order,
  item_count = EXCLUDED.item_count;

-- Function to update category item counts
CREATE OR REPLACE FUNCTION update_correspondence_category_counts()
RETURNS void AS $$
BEGIN
  UPDATE public.correspondence_categories
  SET item_count = (
    SELECT COUNT(*)
    FROM public.correspondences
    WHERE correspondences.category = correspondence_categories.name
  ),
  updated_at = now();
END;
$$ LANGUAGE plpgsql;

-- Function to automatically update search vector when correspondence is modified
CREATE OR REPLACE FUNCTION update_correspondence_search_vector()
RETURNS trigger AS $$
BEGIN
  NEW.search_vector := to_tsvector('english', 
    COALESCE(NEW.name, '') || ' ' ||
    COALESCE(NEW.category, '') || ' ' ||
    COALESCE(NEW.family, '') || ' ' ||
    COALESCE(NEW.description, '') || ' ' ||
    COALESCE(array_to_string(NEW.traditional_names, ' '), '') || ' ' ||
    COALESCE(array_to_string(NEW.common_names, ' '), '') || ' ' ||
    COALESCE(NEW.scientific_name, '') || ' ' ||
    COALESCE(array_to_string(NEW.magical_uses, ' '), '') || ' ' ||
    COALESCE(array_to_string(NEW.elemental_associations, ' '), '') || ' ' ||
    COALESCE(array_to_string(NEW.planetary_associations, ' '), '') || ' ' ||
    COALESCE(array_to_string(NEW.zodiac_associations, ' '), '')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for automatic search vector updates
DROP TRIGGER IF EXISTS correspondence_search_vector_update ON public.correspondences;
CREATE TRIGGER correspondence_search_vector_update
  BEFORE INSERT OR UPDATE ON public.correspondences
  FOR EACH ROW EXECUTE FUNCTION update_correspondence_search_vector();

-- Function to track correspondence views and update popularity
CREATE OR REPLACE FUNCTION track_correspondence_view(correspondence_uuid uuid, viewer_user_id uuid DEFAULT NULL)
RETURNS void AS $$
BEGIN
  -- Increment view count
  UPDATE public.correspondences
  SET view_count = view_count + 1,
      popularity_score = popularity_score + 0.1,
      updated_at = now()
  WHERE id = correspondence_uuid;
  
  -- Track recent access for authenticated users
  IF viewer_user_id IS NOT NULL THEN
    INSERT INTO public.user_correspondence_recent (user_id, correspondence_id, accessed_at, access_count)
    VALUES (viewer_user_id, correspondence_uuid, now(), 1)
    ON CONFLICT (user_id, correspondence_id)
    DO UPDATE SET
      accessed_at = now(),
      access_count = user_correspondence_recent.access_count + 1;
  END IF;
END;
$$ LANGUAGE plpgsql;

-- Enable Row Level Security
ALTER TABLE public.correspondences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.correspondence_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_correspondence_favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_correspondence_recent ENABLE ROW LEVEL SECURITY;

-- RLS Policies

-- Correspondences are readable by all authenticated users
CREATE POLICY "Correspondences are readable by all authenticated users"
  ON public.correspondences FOR SELECT
  TO authenticated
  USING (true);

-- Categories are readable by all authenticated users
CREATE POLICY "Categories are readable by all authenticated users"
  ON public.correspondence_categories FOR SELECT
  TO authenticated
  USING (true);

-- Users can manage their own favorites
CREATE POLICY "Users can view their own favorites"
  ON public.user_correspondence_favorites FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own favorites"
  ON public.user_correspondence_favorites FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own favorites"
  ON public.user_correspondence_favorites FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own favorites"
  ON public.user_correspondence_favorites FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Users can manage their own recent items
CREATE POLICY "Users can view their own recent items"
  ON public.user_correspondence_recent FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own recent items"
  ON public.user_correspondence_recent FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own recent items"
  ON public.user_correspondence_recent FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own recent items"
  ON public.user_correspondence_recent FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create some sample correspondence data to test the structure
INSERT INTO public.correspondences (
  name, category, family, description, traditional_names, common_names, 
  scientific_name, magical_uses, elemental_associations, planetary_associations, 
  zodiac_associations, properties, associations, origin_culture, rarity_level
) VALUES
(
  'Lavender', 'herbs_plants', 'Lamiaceae', 
  'A fragrant flowering plant known for its calming and purifying properties in magical practice.',
  ARRAY['Lavandula', 'Nard'],
  ARRAY['English Lavender', 'True Lavender'],
  'Lavandula angustifolia',
  ARRAY['purification', 'love', 'peace', 'healing', 'sleep', 'protection'],
  ARRAY['Air'],
  ARRAY['Mercury'],
  ARRAY['Gemini', 'Virgo'],
  '{"healing_properties": ["antiseptic", "calming", "anti-inflammatory"], "magical_properties": ["purification", "love_attraction", "peaceful_sleep"]}',
  '{"deities": ["Hecate", "Saturn"], "chakras": ["crown", "third_eye"]}',
  'Mediterranean',
  'common'
),
(
  'Rose Quartz', 'crystals', 'Quartz',
  'A pink variety of quartz crystal associated with unconditional love and emotional healing.',
  ARRAY['Pink Quartz'],
  ARRAY['Love Stone', 'Heart Stone'],
  'SiO2',
  ARRAY['love', 'self_love', 'emotional_healing', 'forgiveness', 'compassion'],
  ARRAY['Water'],
  ARRAY['Venus'],
  ARRAY['Taurus', 'Libra'],
  '{"hardness": "7", "crystal_system": "trigonal", "chakra_alignment": "heart"}',
  '{"deities": ["Aphrodite", "Venus"], "elements": ["water"], "emotions": ["love", "compassion"]}',
  'Brazil',
  'common'
),
(
  'Sage', 'herbs_plants', 'Lamiaceae',
  'A sacred herb used for cleansing, wisdom, and protection in many magical traditions.',
  ARRAY['Salvia', 'Garden Sage'],
  ARRAY['Common Sage', 'Culinary Sage'],
  'Salvia officinalis',
  ARRAY['purification', 'wisdom', 'protection', 'cleansing', 'banishing'],
  ARRAY['Air', 'Earth'],
  ARRAY['Jupiter'],
  ARRAY['Sagittarius'],
  '{"magical_properties": ["cleansing", "wisdom", "protection"], "physical_properties": ["antiseptic", "astringent"]}',
  '{"deities": ["Athena", "Thoth"], "uses": ["smudging", "tea", "incense"]}',
  'Mediterranean',
  'common'
) ON CONFLICT (id) DO NOTHING;

-- Update the category counts
SELECT update_correspondence_category_counts();

-- Create view for popular correspondences
CREATE OR REPLACE VIEW popular_correspondences AS
SELECT 
  c.*,
  cc.display_name as category_display_name,
  cc.icon_name as category_icon,
  cc.color_hex as category_color
FROM public.correspondences c
LEFT JOIN public.correspondence_categories cc ON c.category = cc.name
WHERE c.view_count > 0
ORDER BY c.popularity_score DESC, c.view_count DESC
LIMIT 100;

-- Create view for featured correspondences
CREATE OR REPLACE VIEW featured_correspondences AS
SELECT 
  c.*,
  cc.display_name as category_display_name,
  cc.icon_name as category_icon,
  cc.color_hex as category_color
FROM public.correspondences c
LEFT JOIN public.correspondence_categories cc ON c.category = cc.name
WHERE c.is_featured = true
ORDER BY c.popularity_score DESC;

COMMENT ON TABLE public.correspondences IS 'Main correspondence database with 3,180+ magical and spiritual correspondences';
COMMENT ON TABLE public.correspondence_categories IS 'Categories for organizing correspondences with display metadata';
COMMENT ON TABLE public.user_correspondence_favorites IS 'User bookmarks and favorites for frequently referenced correspondences';
COMMENT ON TABLE public.user_correspondence_recent IS 'Tracks recently accessed correspondences for quick re-access';
