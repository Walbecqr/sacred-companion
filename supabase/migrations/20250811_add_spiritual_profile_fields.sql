 -- Adds fields required for Spiritual Profile user story to user_spiritual_profiles
 -- Safe to run multiple times by checking existence
 
 DO $$
 BEGIN
   IF NOT EXISTS (
     SELECT 1 FROM information_schema.columns 
     WHERE table_schema = 'public' AND table_name = 'user_spiritual_profiles' AND column_name = 'legal_name'
   ) THEN
     ALTER TABLE public.user_spiritual_profiles ADD COLUMN legal_name text;
   END IF;
 
   IF NOT EXISTS (
     SELECT 1 FROM information_schema.columns 
     WHERE table_schema = 'public' AND table_name = 'user_spiritual_profiles' AND column_name = 'spiritual_name'
   ) THEN
     ALTER TABLE public.user_spiritual_profiles ADD COLUMN spiritual_name text;
   END IF;
 
   IF NOT EXISTS (
     SELECT 1 FROM information_schema.columns 
     WHERE table_schema = 'public' AND table_name = 'user_spiritual_profiles' AND column_name = 'gender'
   ) THEN
     ALTER TABLE public.user_spiritual_profiles ADD COLUMN gender text;
   END IF;
 
   IF NOT EXISTS (
     SELECT 1 FROM information_schema.columns 
     WHERE table_schema = 'public' AND table_name = 'user_spiritual_profiles' AND column_name = 'pronouns'
   ) THEN
     ALTER TABLE public.user_spiritual_profiles ADD COLUMN pronouns text;
   END IF;
 
   IF NOT EXISTS (
     SELECT 1 FROM information_schema.columns 
     WHERE table_schema = 'public' AND table_name = 'user_spiritual_profiles' AND column_name = 'birth_date'
   ) THEN
     ALTER TABLE public.user_spiritual_profiles ADD COLUMN birth_date date;
   END IF;
 
   IF NOT EXISTS (
     SELECT 1 FROM information_schema.columns 
     WHERE table_schema = 'public' AND table_name = 'user_spiritual_profiles' AND column_name = 'birth_time'
   ) THEN
     ALTER TABLE public.user_spiritual_profiles ADD COLUMN birth_time text;
   END IF;
 
   IF NOT EXISTS (
     SELECT 1 FROM information_schema.columns 
     WHERE table_schema = 'public' AND table_name = 'user_spiritual_profiles' AND column_name = 'birth_location'
   ) THEN
     ALTER TABLE public.user_spiritual_profiles ADD COLUMN birth_location text;
   END IF;
 
   IF NOT EXISTS (
     SELECT 1 FROM information_schema.columns 
     WHERE table_schema = 'public' AND table_name = 'user_spiritual_profiles' AND column_name = 'primary_deity'
   ) THEN
     ALTER TABLE public.user_spiritual_profiles ADD COLUMN primary_deity text;
   END IF;
 
   IF NOT EXISTS (
     SELECT 1 FROM information_schema.columns 
     WHERE table_schema = 'public' AND table_name = 'user_spiritual_profiles' AND column_name = 'secondary_deity'
   ) THEN
     ALTER TABLE public.user_spiritual_profiles ADD COLUMN secondary_deity text;
   END IF;
 
   IF NOT EXISTS (
     SELECT 1 FROM information_schema.columns 
     WHERE table_schema = 'public' AND table_name = 'user_spiritual_profiles' AND column_name = 'practice_frequency'
   ) THEN
     ALTER TABLE public.user_spiritual_profiles ADD COLUMN practice_frequency text;
   END IF;
 
   IF NOT EXISTS (
     SELECT 1 FROM information_schema.columns 
     WHERE table_schema = 'public' AND table_name = 'user_spiritual_profiles' AND column_name = 'current_journey_phase'
   ) THEN
     ALTER TABLE public.user_spiritual_profiles ADD COLUMN current_journey_phase text;
   END IF;
 END $$;
 

