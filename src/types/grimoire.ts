// Digital Grimoire Module Types
// TypeScript interfaces and types for the Digital Grimoire system

import { Correspondence } from './correspondence';

// Core Grimoire Types
export interface GrimoireVault {
  id: string;
  user_id: string;
  book_name: string;
  owner_name?: string;
  practice: string;
  style: string;
  calendar: string;
  timezone: string;
  privacy_level: 'private' | 'shared' | 'public';
  safety_mode: boolean;
  settings: VaultSettings;
  created_at: string;
  updated_at: string;
  version: string;
}

export interface GrimoireEntry {
  id: string;
  vault_id: string;
  type: EntryType;
  title: string;
  content?: string;
  steps: EntryStep[];
  checklist: ChecklistItem[];
  correspondences: Record<string, any>;
  tags: string[];
  linked_entries: string[];
  sources: Source[];
  media: MediaItem[];
  visibility: 'private' | 'shared' | 'public';
  status: EntryStatus;
  version: number;
  history: HistoryEntry[];
  created_at: string;
  updated_at: string;
}

export interface GrimoireAttachment {
  id: string;
  vault_id: string;
  filename: string;
  file_type: string;
  file_url?: string;
  note?: string;
  added_at: string;
}

export interface GrimoireCollection {
  id: string;
  vault_id: string;
  name: string;
  description?: string;
  color: string;
  icon: string;
  entry_ids: string[];
  created_at: string;
  updated_at: string;
}

export interface GrimoireEntryHistory {
  id: string;
  entry_id: string;
  version: number;
  title: string;
  content?: string;
  steps?: EntryStep[];
  checklist?: ChecklistItem[];
  correspondences?: Record<string, any>;
  tags?: string[];
  changed_by?: string;
  change_reason?: string;
  created_at: string;
}

// Entry Types and Templates
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

export type EntryStatus = 'draft' | 'active' | 'archived' | 'template';

export interface EntryStep {
  id: string;
  order: number;
  title: string;
  description: string;
  duration?: number; // in minutes
  materials?: string[];
  notes?: string;
  completed?: boolean;
}

export interface ChecklistItem {
  id: string;
  text: string;
  completed: boolean;
  order: number;
}

export interface Source {
  id: string;
  title: string;
  author?: string;
  url?: string;
  type: 'book' | 'article' | 'website' | 'personal' | 'other';
  notes?: string;
}

export interface MediaItem {
  id: string;
  type: 'image' | 'video' | 'audio' | 'document';
  url: string;
  filename: string;
  description?: string;
  uploaded_at: string;
}

export interface HistoryEntry {
  version: number;
  changed_at: string;
  changed_by?: string;
  change_reason?: string;
  changes: string[];
}

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
  notifications: NotificationSettings;
}

export interface NotificationSettings {
  daily_reminders: boolean;
  new_suggestions: boolean;
  backup_reminders: boolean;
  practice_reminders: boolean;
}

// Search and Filter Types
export interface GrimoireSearchParams {
  query?: string;
  types?: EntryType[];
  tags?: string[];
  status?: EntryStatus[];
  visibility?: string[];
  date_from?: string;
  date_to?: string;
  sort_by?: 'title' | 'created_at' | 'updated_at' | 'type' | 'status';
  sort_order?: 'asc' | 'desc';
  limit?: number;
  offset?: number;
}

export interface GrimoireSearchResult {
  entries: GrimoireEntry[];
  total_count: number;
  has_more: boolean;
  next_offset?: number;
}

// Entry Templates
export interface EntryTemplate {
  type: EntryType;
  label: string;
  icon: string;
  description: string;
  fields: TemplateField[];
  default_values: Partial<GrimoireEntry>;
}

export interface TemplateField {
  name: string;
  label: string;
  type: 'text' | 'textarea' | 'select' | 'multiselect' | 'checkbox' | 'date' | 'number';
  required: boolean;
  options?: string[];
  placeholder?: string;
  help_text?: string;
}

// AI Evolution Types
export interface EvolutionSuggestion {
  id: string;
  type: 'connection' | 'improvement' | 'expansion' | 'safety' | 'research';
  title: string;
  message: string;
  priority: 'low' | 'medium' | 'high';
  entry_id?: string;
  related_entries?: string[];
  actions: SuggestionAction[];
  created_at: string;
}

export interface SuggestionAction {
  id: string;
  label: string;
  action: string;
  description: string;
  icon: string;
}

// Daily Practice Types
export interface DailyPractice {
  date: string;
  moon_phase?: MoonPhase;
  suggestions: PracticeSuggestion[];
  completed_entries: string[];
  journal_entry?: string;
  mood?: string;
  energy_level?: number;
}

export interface MoonPhase {
  phase: string;
  illumination: number;
  date: string;
  zodiac_sign: string;
  element: string;
}

export interface PracticeSuggestion {
  id: string;
  type: 'ritual' | 'meditation' | 'study' | 'reflection' | 'correspondence';
  title: string;
  description: string;
  duration: number;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  correspondences?: string[];
  entry_id?: string;
}

// Context Types
export interface GrimoireContextType {
  vault: GrimoireVault | null;
  entries: GrimoireEntry[];
  collections: GrimoireCollection[];
  attachments: GrimoireAttachment[];
  loading: boolean;
  error: string | null;
  
  // Vault operations
  createVault: (data: Partial<GrimoireVault>) => Promise<GrimoireVault>;
  updateVault: (data: Partial<GrimoireVault>) => Promise<void>;
  loadVault: () => Promise<void>;
  
  // Entry operations
  createEntry: (type: EntryType, data: Partial<GrimoireEntry>) => Promise<GrimoireEntry>;
  updateEntry: (id: string, data: Partial<GrimoireEntry>) => Promise<void>;
  deleteEntry: (id: string) => Promise<void>;
  duplicateEntry: (id: string) => Promise<GrimoireEntry>;
  
  // Search and filtering
  searchEntries: (params: GrimoireSearchParams) => Promise<GrimoireSearchResult>;
  getEntriesByType: (type: EntryType) => GrimoireEntry[];
  getEntriesByTag: (tag: string) => GrimoireEntry[];
  
  // Content ingestion
  ingestContent: (content: string, type?: EntryType) => Promise<GrimoireEntry[]>;
  importVault: (data: string) => Promise<void>;
  exportVault: () => string;
  
  // Collections
  createCollection: (data: Partial<GrimoireCollection>) => Promise<GrimoireCollection>;
  updateCollection: (id: string, data: Partial<GrimoireCollection>) => Promise<void>;
  deleteCollection: (id: string) => Promise<void>;
  addEntryToCollection: (collectionId: string, entryId: string) => Promise<void>;
  removeEntryFromCollection: (collectionId: string, entryId: string) => Promise<void>;
  
  // Attachments
  uploadAttachment: (file: File, note?: string) => Promise<GrimoireAttachment>;
  deleteAttachment: (id: string) => Promise<void>;
  
  // AI Evolution
  getSuggestions: () => Promise<EvolutionSuggestion[]>;
  applySuggestion: (suggestionId: string, actionId: string) => Promise<void>;
  
  // Daily Practice
  getDailyPractice: (date: string) => Promise<DailyPractice>;
  updateDailyPractice: (date: string, data: Partial<DailyPractice>) => Promise<void>;
}

// UI Component Props
export interface GrimoireDashboardProps {
  className?: string;
}

export interface EntryCardProps {
  entry: GrimoireEntry;
  onView: (entry: GrimoireEntry) => void;
  onEdit: (entry: GrimoireEntry) => void;
  onDelete: (entry: GrimoireEntry) => void;
  onDuplicate: (entry: GrimoireEntry) => void;
  compact?: boolean;
  className?: string;
}

export interface EntryViewerProps {
  entry: GrimoireEntry;
  onEdit: () => void;
  onClose: () => void;
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
  onIngest: (entries: GrimoireEntry[]) => Promise<void>;
  onCancel: () => void;
  className?: string;
}

export interface SearchInterfaceProps {
  onSearch: (params: GrimoireSearchParams) => Promise<void>;
  loading?: boolean;
  className?: string;
}

export interface FilterPanelProps {
  filters: GrimoireSearchParams;
  onFiltersChange: (filters: GrimoireSearchParams) => void;
  onClearFilters: () => void;
  className?: string;
}

// Menu Types
export interface MenuItem {
  id: string;
  label: string;
  icon: string;
  action: string;
  description?: string;
  disabled?: boolean;
  children?: MenuItem[];
}

export interface ContextMenuProps {
  items: MenuItem[];
  onSelect: (action: string) => void;
  onClose: () => void;
  x: number;
  y: number;
}

// Constants
export const ENTRY_TYPES: Record<EntryType, { label: string; icon: string; description: string }> = {
  spell: { label: 'Spell', icon: '✨', description: 'Magical spells and incantations' },
  ritual: { label: 'Ritual', icon: '🕯️', description: 'Ceremonial rituals and practices' },
  correspondence: { label: 'Correspondence', icon: '📊', description: 'Magical correspondences and associations' },
  herb: { label: 'Herb Profile', icon: '🌿', description: 'Herbal knowledge and properties' },
  crystal: { label: 'Crystal Profile', icon: '💎', description: 'Crystal and stone properties' },
  dream: { label: 'Dream Journal', icon: '🌙', description: 'Dream records and interpretations' },
  research: { label: 'Research Note', icon: '📝', description: 'Research findings and notes' },
  reflection: { label: 'Reflection', icon: '🤔', description: 'Personal reflections and insights' },
  deity: { label: 'Deity Work', icon: '👁️', description: 'Deity-related practices and knowledge' },
  tool: { label: 'Tool Profile', icon: '🔧', description: 'Magical tools and instruments' },
  recipe: { label: 'Recipe', icon: '🍯', description: 'Magical recipes and preparations' },
  journal: { label: 'Journal Entry', icon: '📖', description: 'Personal journal entries' },
  note: { label: 'Note', icon: '📄', description: 'General notes and observations' }
};

export const ENTRY_STATUSES: Record<EntryStatus, { label: string; color: string }> = {
  draft: { label: 'Draft', color: '#6b7280' },
  active: { label: 'Active', color: '#10b981' },
  archived: { label: 'Archived', color: '#f59e0b' },
  template: { label: 'Template', color: '#8b5cf6' }
};

export const VISIBILITY_LEVELS = [
  { value: 'private', label: 'Private', icon: '🔒' },
  { value: 'shared', label: 'Shared', icon: '👥' },
  { value: 'public', label: 'Public', icon: '🌍' }
] as const;

// Utility Types
export type GrimoireInsert = Omit<GrimoireEntry, 'id' | 'created_at' | 'updated_at'>;
export type GrimoireUpdate = Partial<Omit<GrimoireEntry, 'id' | 'created_at' | 'updated_at'>>;

export type VaultInsert = Omit<GrimoireVault, 'id' | 'created_at' | 'updated_at'>;
export type VaultUpdate = Partial<Omit<GrimoireVault, 'id' | 'created_at' | 'updated_at'>>;

// Error Types
export class GrimoireError extends Error {
  constructor(
    message: string,
    public code?: string,
    public statusCode?: number
  ) {
    super(message);
    this.name = 'GrimoireError';
  }
}

// API Response Types
export interface GrimoireAPIResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface VaultAPIResponse extends GrimoireAPIResponse<GrimoireVault> {}
export interface EntriesAPIResponse extends GrimoireAPIResponse<GrimoireEntry[]> {}
export interface EntryAPIResponse extends GrimoireAPIResponse<GrimoireEntry> {}
export interface CollectionsAPIResponse extends GrimoireAPIResponse<GrimoireCollection[]> {}
export interface SearchAPIResponse extends GrimoireAPIResponse<GrimoireSearchResult> {}
