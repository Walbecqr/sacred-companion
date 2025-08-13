-- Seed correspondence categories (skip if already exist)
INSERT INTO public.correspondence_categories (id, name, display_name, description, icon_name, color_hex, item_count) VALUES
(gen_random_uuid(), 'herbs_plants', 'Herbs & Plants', 'Medicinal and magical herbs, flowers, trees, and botanical correspondences', 'leaf', '#4ade80', 331),
(gen_random_uuid(), 'animals', 'Animals', 'Animal spirits, totems, and their magical associations', 'zap', '#fbbf24', 432),
(gen_random_uuid(), 'crystals', 'Crystals & Stones', 'Gemstones, crystals, and mineral correspondences', 'gem', '#a78bfa', 186),
(gen_random_uuid(), 'deities', 'Deities & Spirits', 'Gods, goddesses, and spiritual entities from various traditions', 'star', '#f87171', 233),
(gen_random_uuid(), 'colors', 'Colors', 'Color magic and their symbolic meanings', 'palette', '#ec4899', 40),
(gen_random_uuid(), 'elements', 'Elements', 'Earth, Air, Fire, Water, and Spirit correspondences', 'flame', '#f97316', 25),
(gen_random_uuid(), 'planets', 'Planets & Celestial', 'Planetary influences and celestial correspondences', 'globe', '#3b82f6', 35),
(gen_random_uuid(), 'zodiac', 'Zodiac Signs', 'Astrological signs and their magical properties', 'moon', '#8b5cf6', 12),
(gen_random_uuid(), 'metals', 'Metals', 'Metallic correspondences and their magical uses', 'shield', '#6b7280', 28),
(gen_random_uuid(), 'incense', 'Incense & Resins', 'Aromatic substances and their spiritual properties', 'wind', '#10b981', 45),
(gen_random_uuid(), 'oils', 'Essential Oils', 'Essential oils and their magical applications', 'droplets', '#06b6d4', 52),
(gen_random_uuid(), 'candles', 'Candles', 'Candle magic and color correspondences', 'lightbulb', '#f59e0b', 38),
(gen_random_uuid(), 'runes', 'Runes & Symbols', 'Ancient runes, symbols, and sigils', 'hash', '#374151', 33),
(gen_random_uuid(), 'tarot', 'Tarot Cards', 'Tarot card correspondences and meanings', 'cards', '#7c3aed', 78),
(gen_random_uuid(), 'numbers', 'Numbers', 'Numerological correspondences and meanings', 'hash', '#059669', 22),
(gen_random_uuid(), 'days', 'Days of the Week', 'Daily correspondences and planetary rulers', 'calendar', '#dc2626', 7),
(gen_random_uuid(), 'months', 'Months', 'Monthly correspondences and seasonal magic', 'calendar-days', '#ea580c', 12),
(gen_random_uuid(), 'seasons', 'Seasons', 'Seasonal correspondences and cyclical magic', 'sun', '#16a34a', 4),
(gen_random_uuid(), 'directions', 'Directions', 'Cardinal directions and their elemental associations', 'compass', '#0891b2', 8),
(gen_random_uuid(), 'tools', 'Magical Tools', 'Ritual tools and their symbolic meanings', 'hammer', '#7c2d12', 41),
(gen_random_uuid(), 'foods', 'Foods & Beverages', 'Culinary correspondences and kitchen witchery', 'utensils', '#be185d', 67),
(gen_random_uuid(), 'weather', 'Weather Phenomena', 'Weather patterns and their magical significance', 'cloud', '#1e40af', 29)
ON CONFLICT (name) DO NOTHING;

-- Sample correspondence data for Herbs & Plants category
INSERT INTO public.correspondences (
  id, name, category, family, properties, associations, safety_warnings, magical_uses, 
  elemental_associations, planetary_associations, zodiac_associations
) VALUES
-- Herbs & Plants (Sample entries)
(
  gen_random_uuid(), 'Common Sage', 'herbs_plants', 'Lamiaceae',
  '{"medicinal": "Antiseptic, digestive aid", "magical": "Purification, protection", "spiritual": "Wisdom, clarity"}',
  '{"purification": "Clears negative energy", "protection": "Creates protective barriers", "wisdom": "Enhances mental clarity"}',
  '{"pregnancy": "Avoid during pregnancy", "medication": "May interact with diabetes medications"}',
  ARRAY['Purification', 'Protection', 'Wisdom', 'Healing', 'Longevity'],
  ARRAY['Air'], ARRAY['Jupiter'], ARRAY['Sagittarius']
),
(
  gen_random_uuid(), 'Rosemary', 'herbs_plants', 'Lamiaceae',
  '{"medicinal": "Memory enhancement, circulatory stimulant", "magical": "Memory, love, protection", "spiritual": "Remembrance, fidelity"}',
  '{"memory": "Enhances mental clarity and recall", "love": "Strengthens romantic bonds", "protection": "Shields against negative energy"}',
  '{"pregnancy": "Avoid in large amounts during pregnancy", "epilepsy": "May trigger seizures in sensitive individuals"}',
  ARRAY['Memory', 'Love', 'Protection', 'Purification', 'Fidelity'],
  ARRAY['Fire'], ARRAY['Sun'], ARRAY['Leo']
),
(
  gen_random_uuid(), 'Lavender', 'herbs_plants', 'Lamiaceae',
  '{"medicinal": "Calming, sleep aid, antiseptic", "magical": "Peace, love, sleep", "spiritual": "Tranquility, harmony"}',
  '{"peace": "Promotes calm and tranquility", "love": "Attracts romantic love", "sleep": "Induces restful sleep"}',
  '{"pregnancy": "Avoid essential oil during pregnancy", "sensitive_skin": "May cause skin irritation"}',
  ARRAY['Peace', 'Love', 'Sleep', 'Purification', 'Protection'],
  ARRAY['Air'], ARRAY['Mercury'], ARRAY['Gemini']
),
(
  gen_random_uuid(), 'Mugwort', 'herbs_plants', 'Asteraceae',
  '{"medicinal": "Dream enhancement, digestive aid", "magical": "Psychic development, dream work", "spiritual": "Lunar connection, intuition"}',
  '{"psychic": "Enhances psychic abilities", "dreams": "Vivid and prophetic dreams", "protection": "Protects during astral travel"}',
  '{"pregnancy": "Absolutely avoid during pregnancy", "allergies": "May cause allergic reactions"}',
  ARRAY['Psychic Development', 'Dream Work', 'Protection', 'Astral Travel', 'Lunar Magic'],
  ARRAY['Water'], ARRAY['Moon'], ARRAY['Cancer']
),
(
  gen_random_uuid(), 'Yarrow', 'herbs_plants', 'Asteraceae',
  '{"medicinal": "Wound healing, fever reduction", "magical": "Courage, healing, protection", "spiritual": "Divination, psychic enhancement"}',
  '{"courage": "Increases bravery and strength", "healing": "Accelerates physical and emotional healing", "protection": "Creates protective barriers"}',
  '{"pregnancy": "Avoid during pregnancy", "blood_thinning": "May increase bleeding"}',
  ARRAY['Courage', 'Healing', 'Protection', 'Love Divination', 'Psychic Powers'],
  ARRAY['Water'], ARRAY['Venus'], ARRAY['Taurus']
);

-- Sample correspondence data for Animals category
INSERT INTO public.correspondences (
  id, name, category, family, properties, associations, safety_warnings, magical_uses, 
  elemental_associations, planetary_associations, zodiac_associations
) VALUES
(
  gen_random_uuid(), 'Wolf', 'animals', 'Canidae',
  '{"physical": "Strength, endurance", "spiritual": "Intuition, freedom", "emotional": "Loyalty, courage"}',
  '{"loyalty": "Strengthens bonds and commitments", "intuition": "Enhances psychic abilities", "protection": "Guards against threats"}',
  '{"respect": "Always approach with respect and caution", "wild": "Remember wolves are wild animals"}',
  ARRAY['Loyalty', 'Intuition', 'Freedom', 'Protection', 'Leadership'],
  ARRAY['Earth'], ARRAY['Mars'], ARRAY['Aries']
),
(
  gen_random_uuid(), 'Raven', 'animals', 'Corvidae',
  '{"physical": "Intelligence, adaptability", "spiritual": "Magic, prophecy", "mental": "Wisdom, cunning"}',
  '{"magic": "Enhances magical abilities", "prophecy": "Aids in divination", "transformation": "Facilitates change"}',
  '{"respect": "Ravens are highly intelligent and should be respected", "legal": "Check local laws about raven feathers"}',
  ARRAY['Magic', 'Prophecy', 'Transformation', 'Communication', 'Wisdom'],
  ARRAY['Air'], ARRAY['Mercury'], ARRAY['Gemini']
),
(
  gen_random_uuid(), 'Owl', 'animals', 'Strigidae',
  '{"physical": "Silent flight, keen vision", "spiritual": "Wisdom, intuition", "mental": "Knowledge, mystery"}',
  '{"wisdom": "Enhances knowledge and understanding", "intuition": "Strengthens psychic abilities", "protection": "Guards during night work"}',
  '{"respect": "Owls are sacred and should be treated with reverence", "legal": "Check local laws about owl imagery"}',
  ARRAY['Wisdom', 'Intuition', 'Mystery', 'Night Magic', 'Protection'],
  ARRAY['Air'], ARRAY['Moon'], ARRAY['Cancer']
);

-- Sample correspondence data for Crystals category
INSERT INTO public.correspondences (
  id, name, category, family, properties, associations, safety_warnings, magical_uses, 
  elemental_associations, planetary_associations, zodiac_associations
) VALUES
(
  gen_random_uuid(), 'Amethyst', 'crystals', 'Quartz',
  '{"physical": "Calming, stress relief", "spiritual": "Protection, peace", "emotional": "Balance, harmony"}',
  '{"protection": "Creates protective barriers", "peace": "Promotes calm and tranquility", "spiritual": "Enhances spiritual awareness"}',
  '{"sunlight": "May fade in direct sunlight", "cleaning": "Clean with mild soap and water"}',
  ARRAY['Protection', 'Peace', 'Spiritual Awareness', 'Healing', 'Intuition'],
  ARRAY['Water'], ARRAY['Jupiter'], ARRAY['Pisces']
),
(
  gen_random_uuid(), 'Rose Quartz', 'crystals', 'Quartz',
  '{"physical": "Emotional healing, stress relief", "spiritual": "Love, compassion", "emotional": "Self-love, harmony"}',
  '{"love": "Attracts and strengthens love", "healing": "Heals emotional wounds", "self_love": "Promotes self-acceptance"}',
  '{"sunlight": "May fade in direct sunlight", "cleaning": "Clean with mild soap and water"}',
  ARRAY['Love', 'Emotional Healing', 'Self-Love', 'Compassion', 'Harmony'],
  ARRAY['Water'], ARRAY['Venus'], ARRAY['Taurus']
),
(
  gen_random_uuid(), 'Clear Quartz', 'crystals', 'Quartz',
  '{"physical": "General healing, energy amplification", "spiritual": "Amplification, programming", "mental": "Clarity, focus"}',
  '{"amplification": "Increases the power of other crystals", "healing": "General healing and balance", "programming": "Can be programmed for specific purposes"}',
  '{"programming": "Regularly cleanse and reprogram", "cleaning": "Clean with mild soap and water"}',
  ARRAY['Amplification', 'Healing', 'Programming', 'Clarity', 'Energy'],
  ARRAY['All Elements'], ARRAY['Sun'], ARRAY['All Signs']
);

-- Sample correspondence data for Deities category
INSERT INTO public.correspondences (
  id, name, category, family, properties, associations, safety_warnings, magical_uses, 
  elemental_associations, planetary_associations, zodiac_associations
) VALUES
(
  gen_random_uuid(), 'Hecate', 'deities', 'Greek',
  '{"spiritual": "Magic, protection", "emotional": "Guidance, wisdom", "mental": "Intuition, knowledge"}',
  '{"magic": "Enhances magical abilities", "protection": "Provides powerful protection", "guidance": "Offers guidance at life crossroads"}',
  '{"respect": "Always approach with respect and proper offerings", "underworld": "Associated with death and the underworld"}',
  ARRAY['Magic', 'Protection', 'Crossroads', 'Underworld', 'Witchcraft'],
  ARRAY['Earth'], ARRAY['Moon'], ARRAY['Scorpio']
),
(
  gen_random_uuid(), 'Brigid', 'deities', 'Celtic',
  '{"physical": "Healing, vitality", "spiritual": "Creativity, inspiration", "mental": "Poetry, wisdom"}',
  '{"healing": "Provides healing and vitality", "creativity": "Inspires artistic and poetic expression", "fire": "Enhances fire magic"}',
  '{"respect": "Approach with respect and proper offerings", "fire": "Be careful with fire in rituals"}',
  ARRAY['Healing', 'Creativity', 'Fire', 'Poetry', 'Smithcraft'],
  ARRAY['Fire'], ARRAY['Sun'], ARRAY['Leo']
);

-- Sample correspondence data for Colors category
INSERT INTO public.correspondences (
  id, name, category, family, properties, associations, safety_warnings, magical_uses, 
  elemental_associations, planetary_associations, zodiac_associations
) VALUES
(
  gen_random_uuid(), 'Red', 'colors', 'Primary',
  '{"physical": "Energy, vitality", "spiritual": "Power, passion", "emotional": "Love, courage"}',
  '{"love": "Attracts and strengthens love", "courage": "Increases bravery and strength", "power": "Enhances personal power"}',
  '{"intensity": "Can be overwhelming in large amounts", "balance": "Use with grounding colors"}',
  ARRAY['Love', 'Passion', 'Courage', 'Power', 'Protection'],
  ARRAY['Fire'], ARRAY['Mars'], ARRAY['Aries']
),
(
  gen_random_uuid(), 'Blue', 'colors', 'Primary',
  '{"physical": "Calming, healing", "spiritual": "Peace, wisdom", "mental": "Communication, truth"}',
  '{"peace": "Promotes calm and tranquility", "communication": "Enhances communication skills", "wisdom": "Increases knowledge and understanding"}',
  '{"cooling": "Can be cooling and calming", "balance": "Use with warming colors when needed"}',
  ARRAY['Peace', 'Communication', 'Wisdom', 'Healing', 'Truth'],
  ARRAY['Water'], ARRAY['Mercury'], ARRAY['Gemini']
);

-- Update item counts based on inserted data
UPDATE public.correspondence_categories 
SET item_count = (
  SELECT COUNT(*) 
  FROM public.correspondences 
  WHERE category = correspondence_categories.name
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_correspondences_category ON public.correspondences(category);
CREATE INDEX IF NOT EXISTS idx_correspondences_family ON public.correspondences(family);

-- Create full-text search index
CREATE INDEX IF NOT EXISTS idx_correspondences_search ON public.correspondences USING gin(search_vector);

-- Update search vectors for existing data
UPDATE public.correspondences 
SET search_vector = to_tsvector('english', 
  coalesce(name, '') || ' ' || 
  coalesce(category, '') || ' ' || 
  coalesce(family, '') || ' ' || 
  coalesce(array_to_string(magical_uses, ' '), '') || ' ' || 
  coalesce(array_to_string(elemental_associations, ' '), '') || ' ' || 
  coalesce(array_to_string(planetary_associations, ' '), '') || ' ' || 
  coalesce(array_to_string(zodiac_associations, ' '), '')
);
