-- Grimoire Tables Migration
-- This adds the missing tables for the Digital Grimoire feature

-- Create grimoire_vaults table
CREATE TABLE IF NOT EXISTS public.grimoire_vaults (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  user_id uuid NOT NULL,
  book_name text NOT NULL DEFAULT 'My Grimoire',
  practice text,
  settings jsonb DEFAULT '{}'::jsonb,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT grimoire_vaults_pkey PRIMARY KEY (id),
  CONSTRAINT grimoire_vaults_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE
);

-- Create grimoire_entries table
CREATE TABLE IF NOT EXISTS public.grimoire_entries (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  vault_id uuid NOT NULL,
  entry_type text NOT NULL,
  title text NOT NULL,
  content text,
  description text,
  tags text[] DEFAULT '{}'::text[],
  correspondences jsonb DEFAULT '{}'::jsonb,
  ritual_details jsonb DEFAULT '{}'::jsonb,
  effectiveness_notes text,
  personal_modifications text,
  photos text[] DEFAULT '{}'::text[],
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT grimoire_entries_pkey PRIMARY KEY (id),
  CONSTRAINT grimoire_entries_vault_id_fkey FOREIGN KEY (vault_id) REFERENCES public.grimoire_vaults(id) ON DELETE CASCADE
);

-- Create grimoire_collections table
CREATE TABLE IF NOT EXISTS public.grimoire_collections (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  vault_id uuid NOT NULL,
  name text NOT NULL,
  description text,
  category text,
  color_hex text DEFAULT '#6366f1',
  is_public boolean DEFAULT false,
  entry_ids uuid[] DEFAULT '{}'::uuid[],
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT grimoire_collections_pkey PRIMARY KEY (id),
  CONSTRAINT grimoire_collections_vault_id_fkey FOREIGN KEY (vault_id) REFERENCES public.grimoire_vaults(id) ON DELETE CASCADE
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_grimoire_vaults_user_id ON public.grimoire_vaults(user_id);
CREATE INDEX IF NOT EXISTS idx_grimoire_entries_vault_id ON public.grimoire_entries(vault_id);
CREATE INDEX IF NOT EXISTS idx_grimoire_entries_type ON public.grimoire_entries(entry_type);
CREATE INDEX IF NOT EXISTS idx_grimoire_collections_vault_id ON public.grimoire_collections(vault_id);

-- Enable Row Level Security (RLS)
ALTER TABLE public.grimoire_vaults ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.grimoire_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.grimoire_collections ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for grimoire_vaults
CREATE POLICY "Users can view their own vaults" ON public.grimoire_vaults
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own vaults" ON public.grimoire_vaults
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own vaults" ON public.grimoire_vaults
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own vaults" ON public.grimoire_vaults
  FOR DELETE USING (auth.uid() = user_id);

-- Create RLS policies for grimoire_entries
CREATE POLICY "Users can view entries in their vaults" ON public.grimoire_entries
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.grimoire_vaults 
      WHERE grimoire_vaults.id = grimoire_entries.vault_id 
      AND grimoire_vaults.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert entries in their vaults" ON public.grimoire_entries
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.grimoire_vaults 
      WHERE grimoire_vaults.id = grimoire_entries.vault_id 
      AND grimoire_vaults.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update entries in their vaults" ON public.grimoire_entries
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.grimoire_vaults 
      WHERE grimoire_vaults.id = grimoire_entries.vault_id 
      AND grimoire_vaults.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete entries in their vaults" ON public.grimoire_entries
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM public.grimoire_vaults 
      WHERE grimoire_vaults.id = grimoire_entries.vault_id 
      AND grimoire_vaults.user_id = auth.uid()
    )
  );

-- Create RLS policies for grimoire_collections
CREATE POLICY "Users can view collections in their vaults" ON public.grimoire_collections
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.grimoire_vaults 
      WHERE grimoire_vaults.id = grimoire_collections.vault_id 
      AND grimoire_vaults.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert collections in their vaults" ON public.grimoire_collections
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.grimoire_vaults 
      WHERE grimoire_vaults.id = grimoire_collections.vault_id 
      AND grimoire_vaults.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update collections in their vaults" ON public.grimoire_collections
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.grimoire_vaults 
      WHERE grimoire_vaults.id = grimoire_collections.vault_id 
      AND grimoire_vaults.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete collections in their vaults" ON public.grimoire_collections
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM public.grimoire_vaults 
      WHERE grimoire_vaults.id = grimoire_collections.vault_id 
      AND grimoire_vaults.user_id = auth.uid()
    )
  );

-- Create updated_at trigger function if it doesn't exist
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_grimoire_vaults_updated_at 
  BEFORE UPDATE ON public.grimoire_vaults 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_grimoire_entries_updated_at 
  BEFORE UPDATE ON public.grimoire_entries 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_grimoire_collections_updated_at 
  BEFORE UPDATE ON public.grimoire_collections 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
