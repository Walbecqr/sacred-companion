-- Oracle System Migration
-- Create tables for oracle cards, user interactions, and seasonal content

-- Oracle Cards table for storing all oracle content
CREATE TABLE public.oracle_cards (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  title text NOT NULL,
  content text NOT NULL,
  card_type text NOT NULL CHECK (card_type = ANY (ARRAY['daily_wisdom'::text, 'oracle_card'::text, 'affirmation'::text, 'guidance'::text])),
  spiritual_paths text[] DEFAULT '{}',
  experience_levels text[] DEFAULT '{}',
  seasonal_timing text[] DEFAULT '{}', -- sabbats, seasons, moon phases
  correspondences jsonb DEFAULT '{}',
  tags text[] DEFAULT '{}',
  source text, -- attribution if from traditional sources
  image_url text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  is_active boolean DEFAULT true,
  CONSTRAINT oracle_cards_pkey PRIMARY KEY (id)
);

-- User Oracle Interactions table for tracking draws, saves, and preferences
CREATE TABLE public.user_oracle_interactions (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  user_id uuid NOT NULL,
  oracle_card_id uuid NOT NULL,
  interaction_type text NOT NULL CHECK (interaction_type = ANY (ARRAY['draw'::text, 'save'::text, 'share'::text, 'unsave'::text])),
  interaction_date date NOT NULL DEFAULT CURRENT_DATE,
  notes text,
  metadata jsonb DEFAULT '{}',
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT user_oracle_interactions_pkey PRIMARY KEY (id),
  CONSTRAINT user_oracle_interactions_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE,
  CONSTRAINT user_oracle_interactions_oracle_card_id_fkey FOREIGN KEY (oracle_card_id) REFERENCES public.oracle_cards(id) ON DELETE CASCADE
);

-- Daily Oracle State table for tracking daily draws and limits
CREATE TABLE public.daily_oracle_state (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  user_id uuid NOT NULL,
  oracle_date date NOT NULL DEFAULT CURRENT_DATE,
  timezone text NOT NULL DEFAULT 'UTC',
  daily_card_id uuid,
  manual_draws_count integer DEFAULT 0,
  manual_draws_limit integer DEFAULT 3,
  last_draw_at timestamp with time zone,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT daily_oracle_state_pkey PRIMARY KEY (id),
  CONSTRAINT daily_oracle_state_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE,
  CONSTRAINT daily_oracle_state_daily_card_id_fkey FOREIGN KEY (daily_card_id) REFERENCES public.oracle_cards(id),
  CONSTRAINT daily_oracle_state_unique_user_date UNIQUE (user_id, oracle_date)
);

-- Seasonal Content Calendar table for managing seasonal/sabbat content
CREATE TABLE public.seasonal_content_calendar (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  name text NOT NULL,
  seasonal_type text NOT NULL CHECK (seasonal_type = ANY (ARRAY['sabbat'::text, 'moon_phase'::text, 'season'::text, 'holiday'::text])),
  start_date date,
  end_date date,
  recurring_pattern text, -- 'yearly', 'monthly', 'lunar_cycle'
  content_boost_factor numeric DEFAULT 1.0, -- multiplier for selecting seasonal content
  description text,
  spiritual_themes text[] DEFAULT '{}',
  associated_correspondences jsonb DEFAULT '{}',
  created_at timestamp with time zone DEFAULT now(),
  is_active boolean DEFAULT true,
  CONSTRAINT seasonal_content_calendar_pkey PRIMARY KEY (id)
);

-- User Saved Oracle Collections table for organizing saved cards
CREATE TABLE public.user_oracle_collections (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  user_id uuid NOT NULL,
  name text NOT NULL,
  description text,
  is_default boolean DEFAULT false,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT user_oracle_collections_pkey PRIMARY KEY (id),
  CONSTRAINT user_oracle_collections_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE
);

-- Junction table for oracle cards in collections
CREATE TABLE public.oracle_collection_items (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  collection_id uuid NOT NULL,
  oracle_card_id uuid NOT NULL,
  notes text,
  added_at timestamp with time zone DEFAULT now(),
  CONSTRAINT oracle_collection_items_pkey PRIMARY KEY (id),
  CONSTRAINT oracle_collection_items_collection_id_fkey FOREIGN KEY (collection_id) REFERENCES public.user_oracle_collections(id) ON DELETE CASCADE,
  CONSTRAINT oracle_collection_items_oracle_card_id_fkey FOREIGN KEY (oracle_card_id) REFERENCES public.oracle_cards(id) ON DELETE CASCADE,
  CONSTRAINT oracle_collection_items_unique_item UNIQUE (collection_id, oracle_card_id)
);

-- Create indexes for performance
CREATE INDEX idx_oracle_cards_spiritual_paths ON public.oracle_cards USING gin(spiritual_paths);
CREATE INDEX idx_oracle_cards_seasonal_timing ON public.oracle_cards USING gin(seasonal_timing);
CREATE INDEX idx_oracle_cards_tags ON public.oracle_cards USING gin(tags);
CREATE INDEX idx_oracle_cards_active ON public.oracle_cards(is_active) WHERE is_active = true;

CREATE INDEX idx_user_oracle_interactions_user_date ON public.user_oracle_interactions(user_id, interaction_date);
CREATE INDEX idx_user_oracle_interactions_type ON public.user_oracle_interactions(interaction_type);

CREATE INDEX idx_daily_oracle_state_user_date ON public.daily_oracle_state(user_id, oracle_date);
CREATE INDEX idx_daily_oracle_state_timezone ON public.daily_oracle_state(timezone);

CREATE INDEX idx_seasonal_content_dates ON public.seasonal_content_calendar(start_date, end_date);
CREATE INDEX idx_seasonal_content_active ON public.seasonal_content_calendar(is_active) WHERE is_active = true;

-- Insert initial seasonal calendar data (major sabbats)
INSERT INTO public.seasonal_content_calendar (name, seasonal_type, start_date, end_date, recurring_pattern, description, spiritual_themes) VALUES
('Samhain', 'sabbat', '2024-10-31', '2024-11-01', 'yearly', 'Celtic New Year, honoring ancestors, thinning of the veil', ARRAY['ancestors', 'divination', 'transformation', 'death_rebirth']),
('Yule/Winter Solstice', 'sabbat', '2024-12-21', '2024-12-22', 'yearly', 'Longest night, return of the light, introspection', ARRAY['light', 'hope', 'introspection', 'renewal']),
('Imbolc', 'sabbat', '2025-02-01', '2025-02-02', 'yearly', 'Blessing of seeds, Brigid''s day, early stirrings of spring', ARRAY['purification', 'creativity', 'new_beginnings', 'healing']),
('Ostara/Spring Equinox', 'sabbat', '2025-03-20', '2025-03-21', 'yearly', 'Balance of light and dark, fertility, new growth', ARRAY['balance', 'fertility', 'growth', 'abundance']),
('Beltane', 'sabbat', '2025-05-01', '2025-05-01', 'yearly', 'Fertility festival, passion, creative fire', ARRAY['passion', 'creativity', 'fertility', 'joy']),
('Litha/Summer Solstice', 'sabbat', '2025-06-21', '2025-06-21', 'yearly', 'Longest day, peak of solar energy, abundance', ARRAY['power', 'abundance', 'achievement', 'celebration']),
('Lughnasadh/Lammas', 'sabbat', '2025-08-01', '2025-08-01', 'yearly', 'First harvest, sacrifice, honoring skills and crafts', ARRAY['harvest', 'gratitude', 'skill', 'sacrifice']),
('Mabon/Autumn Equinox', 'sabbat', '2025-09-22', '2025-09-23', 'yearly', 'Second harvest, balance, preparation for winter', ARRAY['balance', 'gratitude', 'preparation', 'wisdom']);

-- Insert initial oracle card content
INSERT INTO public.oracle_cards (title, content, card_type, spiritual_paths, experience_levels, seasonal_timing, tags, source) VALUES
('Trust Your Inner Wisdom', 'The answers you seek already dwell within you. Trust the whisper of your heart and the wisdom of your soul. Your intuition is a sacred compass guiding you home to yourself.', 'daily_wisdom', ARRAY['general', 'wiccan', 'eclectic'], ARRAY['beginner', 'intermediate', 'advanced'], ARRAY[], ARRAY['intuition', 'wisdom', 'trust'], 'Traditional Wisdom'),

('Embrace the Journey', 'Every step on your path is sacred, including the missteps and detours. Embrace the entirety of your journey with compassion and understanding. Growth comes through experience, not perfection.', 'daily_wisdom', ARRAY['general'], ARRAY['beginner', 'intermediate'], ARRAY[], ARRAY['journey', 'growth', 'compassion'], 'Traditional Wisdom'),

('The Moon''s Gentle Teaching', 'Like the moon, you are allowed to have phases. You can be whole while also being a work in progress. Allow yourself to wax and wane, to rest and to shine, in perfect natural rhythm.', 'oracle_card', ARRAY['lunar', 'wiccan', 'general'], ARRAY['beginner', 'intermediate', 'advanced'], ARRAY[], ARRAY['moon', 'cycles', 'self_acceptance'], 'Luna Wisdom'),

('Sacred Pause', 'In stillness, the sacred reveals itself. Take time today to pause, breathe deeply, and connect with the quiet wisdom that emerges when you allow yourself to simply be present.', 'guidance', ARRAY['general', 'meditation', 'mindfulness'], ARRAY['beginner'], ARRAY[], ARRAY['stillness', 'presence', 'mindfulness'], 'Contemplative Practice'),

('Ancestral Blessings', 'You carry the strength, wisdom, and love of countless generations within you. Honor those who came before by living with courage, practicing with intention, and walking your path with dignity.', 'oracle_card', ARRAY['ancestral', 'traditional'], ARRAY['intermediate', 'advanced'], ARRAY['samhain'], ARRAY['ancestors', 'heritage', 'strength'], 'Ancestral Wisdom'),

('Seeds of Intention', 'Like seeds planted in fertile soil, your intentions require patience, nurturing, and faith. Trust in the perfect timing of your manifestations and tend to your dreams with loving care.', 'daily_wisdom', ARRAY['green_witch', 'earth_based'], ARRAY['beginner', 'intermediate'], ARRAY['imbolc', 'spring'], ARRAY['manifestation', 'patience', 'growth'], 'Earth Wisdom'),

('Fire of Transformation', 'Welcome the sacred fire of transformation. What no longer serves you can be released with gratitude. Like the phoenix, you are reborn through the flames of change.', 'oracle_card', ARRAY['fire_magic', 'transformation'], ARRAY['intermediate', 'advanced'], ARRAY['beltane', 'litha'], ARRAY['transformation', 'release', 'rebirth'], 'Elemental Wisdom'),

('Blessed Balance', 'Seek balance not as a static state, but as a dynamic dance. Like the scales of justice or the turning of seasons, find harmony through mindful attention to all aspects of your being.', 'guidance', ARRAY['general', 'elemental'], ARRAY['intermediate'], ARRAY['ostara', 'mabon'], ARRAY['balance', 'harmony', 'mindfulness'], 'Seasonal Wisdom'),

('Harvest Gratitude', 'Take time to acknowledge and celebrate your growth, achievements, and the abundance in your life. Gratitude transforms what we have into enough and more.', 'daily_wisdom', ARRAY['general'], ARRAY['beginner', 'intermediate', 'advanced'], ARRAY['lughnasadh', 'mabon'], ARRAY['gratitude', 'abundance', 'celebration'], 'Harvest Wisdom'),

('Winter''s Gift', 'In the darkness of winter, we learn to kindle our inner light. Use this time of introspection to connect with your deepest truths and prepare for the renewal that follows rest.', 'oracle_card', ARRAY['seasonal', 'introspective'], ARRAY['intermediate', 'advanced'], ARRAY['yule', 'winter'], ARRAY['introspection', 'inner_light', 'renewal'], 'Seasonal Wisdom');

-- Create RLS (Row Level Security) policies
ALTER TABLE public.oracle_cards ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_oracle_interactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.daily_oracle_state ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_oracle_collections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.oracle_collection_items ENABLE ROW LEVEL SECURITY;

-- Oracle cards are readable by all authenticated users
CREATE POLICY "Oracle cards are readable by authenticated users" ON public.oracle_cards
  FOR SELECT TO authenticated USING (is_active = true);

-- Users can only access their own oracle interactions
CREATE POLICY "Users can manage their own oracle interactions" ON public.user_oracle_interactions
  FOR ALL TO authenticated USING (auth.uid() = user_id);

-- Users can only access their own daily oracle state
CREATE POLICY "Users can manage their own daily oracle state" ON public.daily_oracle_state
  FOR ALL TO authenticated USING (auth.uid() = user_id);

-- Users can only access their own oracle collections
CREATE POLICY "Users can manage their own oracle collections" ON public.user_oracle_collections
  FOR ALL TO authenticated USING (auth.uid() = user_id);

-- Collection items are accessible if user owns the collection
CREATE POLICY "Users can manage oracle collection items they own" ON public.oracle_collection_items
  FOR ALL TO authenticated USING (
    EXISTS (
      SELECT 1 FROM public.user_oracle_collections 
      WHERE id = collection_id AND user_id = auth.uid()
    )
  );

-- Seasonal content calendar is readable by all authenticated users
CREATE POLICY "Seasonal content is readable by authenticated users" ON public.seasonal_content_calendar
  FOR SELECT TO authenticated USING (is_active = true);
