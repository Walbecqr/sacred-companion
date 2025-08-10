-- WARNING: This schema is for context only and is not meant to be run.
-- Table order and constraints may not be valid for execution.

CREATE TABLE public.book_of_shadows_entries (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  user_id uuid NOT NULL,
  entry_type text NOT NULL,
  title text NOT NULL,
  content text NOT NULL,
  related_ritual_id uuid,
  related_journal_id uuid,
  effectiveness_notes text,
  personal_modifications text,
  tags ARRAY DEFAULT '{}'::text[],
  photos ARRAY DEFAULT '{}'::text[],
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT book_of_shadows_entries_pkey PRIMARY KEY (id),
  CONSTRAINT book_of_shadows_entries_related_journal_id_fkey FOREIGN KEY (related_journal_id) REFERENCES public.journal_entries(id),
  CONSTRAINT book_of_shadows_entries_related_ritual_id_fkey FOREIGN KEY (related_ritual_id) REFERENCES public.rituals(id),
  CONSTRAINT book_of_shadows_entries_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id)
);
CREATE TABLE public.conversations (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  title text,
  last_message_at timestamp with time zone DEFAULT now(),
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT conversations_pkey PRIMARY KEY (id),
  CONSTRAINT conversations_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id)
);
CREATE TABLE public.correspondences (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  name text NOT NULL,
  category text NOT NULL,
  family text,
  properties jsonb DEFAULT '{}'::jsonb,
  associations jsonb DEFAULT '{}'::jsonb,
  safety_warnings jsonb DEFAULT '{}'::jsonb,
  magical_uses ARRAY DEFAULT '{}'::text[],
  elemental_associations ARRAY DEFAULT '{}'::text[],
  planetary_associations ARRAY DEFAULT '{}'::text[],
  zodiac_associations ARRAY DEFAULT '{}'::text[],
  search_vector tsvector,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT correspondences_pkey PRIMARY KEY (id)
);
CREATE TABLE public.daily_check_ins (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  user_id uuid NOT NULL,
  mood text,
  energy_level integer CHECK (energy_level >= 1 AND energy_level <= 10),
  spiritual_practice_done boolean DEFAULT false,
  gratitude_list ARRAY DEFAULT '{}'::text[],
  intentions_set ARRAY DEFAULT '{}'::text[],
  notes text,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT daily_check_ins_pkey PRIMARY KEY (id),
  CONSTRAINT daily_check_ins_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id)
);
CREATE TABLE public.divination_readings (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  user_id uuid NOT NULL,
  reading_type text NOT NULL,
  question text,
  spread_type text,
  cards_drawn jsonb DEFAULT '{}'::jsonb,
  interpretation text,
  personal_notes text,
  photos ARRAY DEFAULT '{}'::text[],
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT divination_readings_pkey PRIMARY KEY (id),
  CONSTRAINT divination_readings_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id)
);
CREATE TABLE public.journal_entries (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  user_id uuid NOT NULL,
  title text,
  body text NOT NULL,
  mood text,
  energy_level integer CHECK (energy_level >= 1 AND energy_level <= 10),
  tags ARRAY DEFAULT '{}'::text[],
  ai_reflection text,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT journal_entries_pkey PRIMARY KEY (id),
  CONSTRAINT journal_entries_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id)
);
CREATE TABLE public.memory_embeddings (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  user_id uuid NOT NULL,
  content text NOT NULL,
  embedding USER-DEFINED,
  importance_score real DEFAULT 0,
  source_type text CHECK (source_type = ANY (ARRAY['chat'::text, 'journal'::text, 'ritual'::text, 'manual'::text])),
  source_id uuid,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT memory_embeddings_pkey PRIMARY KEY (id),
  CONSTRAINT memory_embeddings_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id)
);
CREATE TABLE public.messages (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  conversation_id uuid NOT NULL,
  user_id uuid NOT NULL,
  role text NOT NULL CHECK (role = ANY (ARRAY['user'::text, 'assistant'::text, 'system'::text])),
  content text NOT NULL,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT messages_pkey PRIMARY KEY (id),
  CONSTRAINT messages_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id),
  CONSTRAINT messages_conversation_id_fkey FOREIGN KEY (conversation_id) REFERENCES public.conversations(id)
);
CREATE TABLE public.rituals (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  user_id uuid NOT NULL,
  name text NOT NULL,
  description text,
  ritual_type text,
  intention text,
  moon_phase text,
  deities_invoked ARRAY DEFAULT '{}'::text[],
  tools_used ARRAY DEFAULT '{}'::text[],
  correspondences_used jsonb DEFAULT '{}'::jsonb,
  scheduled_for timestamp with time zone,
  completed_at timestamp with time zone,
  outcome text,
  effectiveness_rating integer CHECK (effectiveness_rating >= 1 AND effectiveness_rating <= 10),
  photos ARRAY DEFAULT '{}'::text[],
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT rituals_pkey PRIMARY KEY (id),
  CONSTRAINT rituals_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id)
);
CREATE TABLE public.search_analytics (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  user_id uuid,
  query text NOT NULL,
  results_count integer,
  clicked_results jsonb DEFAULT '[]'::jsonb,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT search_analytics_pkey PRIMARY KEY (id),
  CONSTRAINT search_analytics_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id)
);
CREATE TABLE public.spiritual_inventory (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  user_id uuid NOT NULL,
  item_name text NOT NULL,
  item_type text NOT NULL,
  category text,
  quantity numeric,
  unit text,
  status text CHECK (status = ANY (ARRAY['on_hand'::text, 'low_stock'::text, 'shopping_list'::text, 'wish_list'::text])),
  storage_location text,
  storage_details text,
  last_purchase_date date,
  average_price numeric,
  photos ARRAY DEFAULT '{}'::text[],
  notes text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT spiritual_inventory_pkey PRIMARY KEY (id),
  CONSTRAINT spiritual_inventory_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id)
);
CREATE TABLE public.user_spiritual_profiles (
  user_id uuid NOT NULL,
  display_name text,
  spiritual_path ARRAY,
  experience_level text DEFAULT 'beginner'::text,
  preferred_deities ARRAY,
  spiritual_goals ARRAY,
  safety_profile jsonb DEFAULT '{}'::jsonb,
  preferences jsonb DEFAULT '{}'::jsonb,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT user_spiritual_profiles_pkey PRIMARY KEY (user_id),
  CONSTRAINT user_spiritual_profiles_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id)
);