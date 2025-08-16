// Digital Grimoire Module Types
// TypeScript interfaces and types for the Digital Grimoire system

// Core Grimoire Types
export interface GrimoireVault {
  id: string;
  user_id: string;
  book_name: string;
  owner_name?: string;
  practice: string;
  created_at: string;
  updated_at: string;
  settings: VaultSettings;
}

export interface GrimoireEntry {
  id: string;
  vault_id: string;
  type: EntryType;
  title: string;
  content: string;
  tags: string[];
  visibility: 'private' | 'shared' | 'public';
  status: 'draft' | 'active' | 'archived';
  metadata: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export interface GrimoireAttachment {
  id: string;
  entry_id: string;
  file_name: string;
  file_type: string;
  file_size: number;
  file_url: string;
  created_at: string;
}

export interface GrimoireCollection {
  id: string;
  vault_id: string;
  name: string;
  description?: string;
  color?: string;
  entry_ids: string[];
  created_at: string;
  updated_at: string;
}

export interface GrimoireEntryHistory {
  id: string;
  entry_id: string;
  version: number;
  title: string;
  content: string;
  tags: string[];
  metadata: Record<string, unknown>;
  created_at: string;
}

// Entry Types
export type EntryType = 
  | 'spell' 
  | 'ritual' 
  | 'correspondence' 
  | 'herb' 
  | 'crystal' 
  | 'dream' 
  | 'research' 
  | 'reflection' 
  | 'deity' 
  | 'tool' 
  | 'recipe' 
  | 'journal' 
  | 'note';

export const ENTRY_TYPES: Record<EntryType, { label: string; icon: string; color: string }> = {
  spell: { label: 'Spell', icon: '✨', color: 'purple' },
  ritual: { label: 'Ritual', icon: '🕯️', color: 'indigo' },
  correspondence: { label: 'Correspondence', icon: '📊', color: 'blue' },
  herb: { label: 'Herb', icon: '🌿', color: 'green' },
  crystal: { label: 'Crystal', icon: '💎', color: 'cyan' },
  dream: { label: 'Dream', icon: '🌙', color: 'purple' },
  research: { label: 'Research', icon: '📚', color: 'orange' },
  reflection: { label: 'Reflection', icon: '🤔', color: 'yellow' },
  deity: { label: 'Deity', icon: '👁️', color: 'red' },
  tool: { label: 'Tool', icon: '🔮', color: 'gray' },
  recipe: { label: 'Recipe', icon: '🧪', color: 'pink' },
  journal: { label: 'Journal', icon: '📖', color: 'brown' },
  note: { label: 'Note', icon: '📝', color: 'gray' },
};

// Vault Settings
export interface VaultSettings {
  theme: 'light' | 'dark' | 'auto';
  layout: 'grid' | 'list' | 'compact';
  default_view: 'library' | 'daily' | 'correspondences' | 'settings';
  auto_save: boolean;
  backup_frequency: 'daily' | 'weekly' | 'monthly' | 'never';
  ai_suggestions: boolean;
  safety_warnings: boolean;
  correspondences_integration: boolean;
  lunar_integration: boolean;
  notifications: {
    daily_reminders: boolean;
    new_suggestions: boolean;
    backup_reminders: boolean;
    practice_reminders: boolean;
  };
}

// Daily Practice Types
export interface DailyPractice {
  date: string;
  moon_phase?: MoonPhase;
  suggestions: PracticeSuggestion[];
  completed_entries: string[];
  journal_entry: string;
  mood: string;
  energy_level: number;
}

export interface PracticeSuggestion {
  id: string;
  type: 'meditation' | 'ritual' | 'study' | 'reflection' | 'correspondence';
  title: string;
  description: string;
  duration: number;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  correspondences?: string[];
  entry_id?: string;
}

export interface MoonPhase {
  phase: string;
  illumination: number;
  date: string;
  zodiac_sign: string;
  element: string;
}

// Search and Filter Types
export interface SearchFilters {
  query?: string;
  types?: EntryType[];
  tags?: string[];
  status?: string[];
  date_range?: {
    start: string;
    end: string;
  };
  sort_by?: 'title' | 'created_at' | 'updated_at' | 'type';
  sort_order?: 'asc' | 'desc';
}

export interface SearchResult {
  entry: GrimoireEntry;
  relevance_score: number;
  matched_fields: string[];
}

// Context Types
export interface GrimoireContextType {
  // State
  vault: GrimoireVault | null;
  entries: GrimoireEntry[];
  collections: GrimoireCollection[];
  loading: boolean;
  error: string | null;
  
  // Vault Operations
  createVault: (data: Partial<GrimoireVault>) => Promise<GrimoireVault>;
  updateVault: (data: Partial<GrimoireVault>) => Promise<GrimoireVault>;
  
  // Entry Operations
  createEntry: (type: EntryType, data: Partial<GrimoireEntry>) => Promise<GrimoireEntry>;
  updateEntry: (id: string, data: Partial<GrimoireEntry>) => Promise<GrimoireEntry>;
  deleteEntry: (id: string) => Promise<void>;
  getEntry: (id: string) => Promise<GrimoireEntry | null>;
  
  // Collection Operations
  createCollection: (data: Partial<GrimoireCollection>) => Promise<GrimoireCollection>;
  updateCollection: (id: string, data: Partial<GrimoireCollection>) => Promise<GrimoireCollection>;
  deleteCollection: (id: string) => Promise<void>;
  addEntryToCollection: (collectionId: string, entryId: string) => Promise<void>;
  removeEntryFromCollection: (collectionId: string, entryId: string) => Promise<void>;
  
  // Search and Filter
  searchEntries: (filters: SearchFilters) => Promise<SearchResult[]>;
  
  // Content Ingestion
  ingestContent: (content: string, type: EntryType) => Promise<GrimoireEntry>;
  
  // Import/Export
  exportVault: () => Promise<string>;
  importVault: (data: string) => Promise<void>;
  
  // AI Evolution
  evolveEntry: (entryId: string, suggestions: string[]) => Promise<GrimoireEntry>;
  
  // Daily Practice
  getDailyPractice: (date: string) => Promise<DailyPractice>;
  saveDailyPractice: (practice: DailyPractice) => Promise<void>;
}

// Component Props Types
export interface GrimoireDashboardProps {
  className?: string;
}

export interface MainTabsProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  entryCount: number;
  collectionCount: number;
  className?: string;
}

export interface ActionToolbarProps {
  onCreateEntry: (type: EntryType) => void;
  onImport: () => void;
  onExport: () => void;
  onSearch: (query: string) => void;
  onToggleFilters: () => void;
  searchQuery: string;
  showFilters: boolean;
  className?: string;
}

export interface FilterSidebarProps {
  filters: SearchFilters;
  onFiltersChange: (filters: SearchFilters) => void;
  onClose: () => void;
  isOpen: boolean;
  className?: string;
}

export interface EntryCardProps {
  entry: GrimoireEntry;
  onView: (entry: GrimoireEntry) => void;
  onEdit: (entry: GrimoireEntry) => void;
  onDelete: (entry: GrimoireEntry) => void;
  onDuplicate: (entry: GrimoireEntry) => void;
  layout?: 'compact' | 'full';
  className?: string;
}

export interface EntryEditorProps {
  entry?: GrimoireEntry;
  type?: EntryType;
  onSave: (entry: GrimoireEntry) => Promise<void>;
  onCancel: () => void;
  className?: string;
}

export interface ContentIngestionProps {
  onIngest: (content: string, type: EntryType) => Promise<void>;
  onCancel: () => void;
  className?: string;
}

// Constants
export const GRIMOIRE_CONSTANTS = {
  MAX_TITLE_LENGTH: 200,
  MAX_CONTENT_LENGTH: 10000,
  MAX_TAGS_PER_ENTRY: 20,
  MAX_TAG_LENGTH: 50,
  SUPPORTED_FILE_TYPES: ['image/jpeg', 'image/png', 'image/gif', 'application/pdf'],
  MAX_FILE_SIZE: 10 * 1024 * 1024, // 10MB
} as const;

// Utility Types
export type EntryStatus = 'draft' | 'active' | 'archived';
export type EntryVisibility = 'private' | 'shared' | 'public';
export type PracticeType = 'meditation' | 'ritual' | 'study' | 'reflection' | 'correspondence';
export type DifficultyLevel = 'beginner' | 'intermediate' | 'advanced';
