// Correspondence Module Types
// TypeScript interfaces and types for the correspondence database system

export interface Correspondence {
  id: string;
  name: string;
  category: string;
  family?: string;
  description?: string;
  traditional_names?: string[];
  common_names?: string[];
  scientific_name?: string;
  origin_culture?: string;
  rarity_level?: 'common' | 'uncommon' | 'rare' | 'very_rare';
  seasonal_availability?: string[];
  preparation_methods?: string[];
  usage_notes?: string;
  historical_significance?: string;
  modern_applications?: string[];
  
  // Magical Properties
  magical_uses: string[];
  elemental_associations: string[];
  planetary_associations: string[];
  zodiac_associations: string[];
  
  // JSON Fields
  properties: Record<string, any>;
  associations: Record<string, any>;
  safety_warnings: Record<string, any>;
  
  // Metadata
  view_count: number;
  popularity_score: number;
  is_featured: boolean;
  image_url?: string;
  source_references?: string[];
  search_vector?: string; // PostgreSQL tsvector as string
  
  // Timestamps
  created_at: string;
  updated_at: string;
}

export interface CorrespondenceCategory {
  id: string;
  name: string;
  display_name: string;
  description?: string;
  icon_name?: string;
  color_hex?: string;
  sort_order: number;
  item_count: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface UserCorrespondenceFavorite {
  id: string;
  user_id: string;
  correspondence_id: string;
  notes?: string;
  tags: string[];
  created_at: string;
  updated_at: string;
  
  // Populated via joins
  correspondence?: Correspondence;
}

export interface UserCorrespondenceRecent {
  id: string;
  user_id: string;
  correspondence_id: string;
  accessed_at: string;
  access_count: number;
  
  // Populated via joins
  correspondence?: Correspondence;
}

// Extended correspondence with category information
export interface CorrespondenceWithCategory extends Correspondence {
  category_display_name?: string;
  category_icon?: string;
  category_color?: string;
}

// Search and filtering types
export interface CorrespondenceSearchParams {
  query?: string;
  category?: string;
  categories?: string[];
  magical_uses?: string[];
  elemental_associations?: string[];
  planetary_associations?: string[];
  zodiac_associations?: string[];
  rarity_level?: string[];
  origin_culture?: string;
  featured_only?: boolean;
  sort_by?: 'name' | 'popularity' | 'view_count' | 'created_at' | 'updated_at';
  sort_order?: 'asc' | 'desc';
  limit?: number;
  offset?: number;
}

export interface CorrespondenceSearchResult {
  data: CorrespondenceWithCategory[];
  total_count: number;
  has_more: boolean;
  next_offset?: number;
}

// API Response types
export interface CorrespondenceAPIResponse {
  success: boolean;
  data?: Correspondence | Correspondence[];
  error?: string;
  message?: string;
}

export interface CategoryAPIResponse {
  success: boolean;
  data?: CorrespondenceCategory | CorrespondenceCategory[];
  error?: string;
  message?: string;
}

export interface FavoriteAPIResponse {
  success: boolean;
  data?: UserCorrespondenceFavorite | UserCorrespondenceFavorite[];
  error?: string;
  message?: string;
}

// UI Component props types
export interface CorrespondenceCardProps {
  correspondence: CorrespondenceWithCategory;
  isFavorited?: boolean;
  onFavoriteToggle?: (correspondenceId: string, isFavorited: boolean) => void;
  onView?: (correspondenceId: string) => void;
  compact?: boolean;
  showCategory?: boolean;
  className?: string;
}

export interface CategoryBrowserProps {
  categories: CorrespondenceCategory[];
  selectedCategory?: string;
  onCategorySelect: (category: string | null) => void;
  showItemCounts?: boolean;
  layout?: 'grid' | 'list';
  className?: string;
}

export interface CorrespondenceSearchProps {
  onSearch: (params: CorrespondenceSearchParams) => void;
  loading?: boolean;
  placeholder?: string;
  showFilters?: boolean;
  defaultCategory?: string;
  className?: string;
}

export interface CorrespondenceGridProps {
  correspondences: CorrespondenceWithCategory[];
  favorites: Set<string>;
  onFavoriteToggle: (correspondenceId: string, isFavorited: boolean) => Promise<void>;
  onCorrespondenceView: (correspondenceId: string) => void;
  loading?: boolean;
  hasMore?: boolean;
  onLoadMore?: () => void;
  emptyMessage?: string;
  viewMode?: 'grid' | 'list';
  className?: string;
}

export interface CorrespondenceDetailProps {
  correspondence: CorrespondenceWithCategory;
  isFavorited: boolean;
  onFavoriteToggle: (correspondenceId: string, isFavorited: boolean) => Promise<void>;
  onClose?: () => void;
  relatedCorrespondences?: CorrespondenceWithCategory[];
  className?: string;
}

// Filter and sort options
export const CORRESPONDENCE_SORT_OPTIONS = [
  { value: 'name', label: 'Name (A-Z)', order: 'asc' },
  { value: 'name', label: 'Name (Z-A)', order: 'desc' },
  { value: 'popularity', label: 'Most Popular', order: 'desc' },
  { value: 'view_count', label: 'Most Viewed', order: 'desc' },
  { value: 'created_at', label: 'Newest First', order: 'desc' },
  { value: 'created_at', label: 'Oldest First', order: 'asc' },
] as const;

export const RARITY_LEVELS = [
  { value: 'common', label: 'Common', color: '#22c55e' },
  { value: 'uncommon', label: 'Uncommon', color: '#3b82f6' },
  { value: 'rare', label: 'Rare', color: '#a855f7' },
  { value: 'very_rare', label: 'Very Rare', color: '#ef4444' },
] as const;

export const ELEMENTAL_ASSOCIATIONS = [
  'Earth', 'Air', 'Fire', 'Water', 'Spirit', 'Akasha'
] as const;

export const PLANETARY_ASSOCIATIONS = [
  'Sun', 'Moon', 'Mercury', 'Venus', 'Mars', 'Jupiter', 'Saturn', 
  'Uranus', 'Neptune', 'Pluto'
] as const;

export const ZODIAC_ASSOCIATIONS = [
  'Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo',
  'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'
] as const;

// Utility types
export type CorrespondenceSortField = typeof CORRESPONDENCE_SORT_OPTIONS[number]['value'];
export type CorrespondenceSortOrder = 'asc' | 'desc';
export type RarityLevel = typeof RARITY_LEVELS[number]['value'];
export type ElementalAssociation = typeof ELEMENTAL_ASSOCIATIONS[number];
export type PlanetaryAssociation = typeof PLANETARY_ASSOCIATIONS[number];
export type ZodiacAssociation = typeof ZODIAC_ASSOCIATIONS[number];

// Hook return types
export interface UseCorrespondencesReturn {
  correspondences: CorrespondenceWithCategory[];
  loading: boolean;
  error: string | null;
  hasMore: boolean;
  total: number;
  search: (params: CorrespondenceSearchParams) => Promise<void>;
  loadMore: () => Promise<void>;
  refresh: () => Promise<void>;
}

export interface UseCategoriesReturn {
  categories: CorrespondenceCategory[];
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
}

export interface UseFavoritesReturn {
  favorites: Set<string>;
  favoritesList: UserCorrespondenceFavorite[];
  loading: boolean;
  error: string | null;
  addToFavorites: (correspondenceId: string, notes?: string, tags?: string[]) => Promise<void>;
  removeFromFavorites: (correspondenceId: string) => Promise<void>;
  toggleFavorite: (correspondenceId: string) => Promise<void>;
  updateFavoriteNotes: (correspondenceId: string, notes: string, tags?: string[]) => Promise<void>;
  refresh: () => Promise<void>;
}

export interface UseRecentReturn {
  recent: UserCorrespondenceRecent[];
  loading: boolean;
  error: string | null;
  trackView: (correspondenceId: string) => Promise<void>;
  clearRecent: () => Promise<void>;
  refresh: () => Promise<void>;
}

// Database utility types
export interface CorrespondenceInsert {
  name: string;
  category: string;
  family?: string;
  description?: string;
  traditional_names?: string[];
  common_names?: string[];
  scientific_name?: string;
  origin_culture?: string;
  rarity_level?: RarityLevel;
  seasonal_availability?: string[];
  preparation_methods?: string[];
  usage_notes?: string;
  historical_significance?: string;
  modern_applications?: string[];
  magical_uses?: string[];
  elemental_associations?: string[];
  planetary_associations?: string[];
  zodiac_associations?: string[];
  properties?: Record<string, any>;
  associations?: Record<string, any>;
  safety_warnings?: Record<string, any>;
  is_featured?: boolean;
  image_url?: string;
  source_references?: string[];
}

export interface CorrespondenceUpdate extends Partial<CorrespondenceInsert> {
  id: string;
}

// Constants for UI
export const DEFAULT_CORRESPONDENCE_LIMIT = 24;
export const DEFAULT_RECENT_LIMIT = 10;
export const DEFAULT_SEARCH_DEBOUNCE = 300;

// Error types
export class CorrespondenceError extends Error {
  constructor(
    message: string,
    public code?: string,
    public statusCode?: number
  ) {
    super(message);
    this.name = 'CorrespondenceError';
  }
}
