'use client';

import React, { createContext, useContext, useReducer, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import {
  GrimoireContextType,
  GrimoireVault,
  GrimoireEntry,
  GrimoireCollection,
  GrimoireAttachment,
  GrimoireSearchParams,
  GrimoireSearchResult,
  EntryType,
  EvolutionSuggestion,
  DailyPractice,
  GrimoireError,
  GrimoireInsert,
  VaultInsert
} from '@/types/grimoire';

// Initial state
const initialState = {
  vault: null as GrimoireVault | null,
  entries: [] as GrimoireEntry[],
  collections: [] as GrimoireCollection[],
  attachments: [] as GrimoireAttachment[],
  loading: false,
  error: null as string | null,
};

// Action types
type GrimoireAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'SET_VAULT'; payload: GrimoireVault | null }
  | { type: 'SET_ENTRIES'; payload: GrimoireEntry[] }
  | { type: 'ADD_ENTRY'; payload: GrimoireEntry }
  | { type: 'UPDATE_ENTRY'; payload: GrimoireEntry }
  | { type: 'DELETE_ENTRY'; payload: string }
  | { type: 'SET_COLLECTIONS'; payload: GrimoireCollection[] }
  | { type: 'ADD_COLLECTION'; payload: GrimoireCollection }
  | { type: 'UPDATE_COLLECTION'; payload: GrimoireCollection }
  | { type: 'DELETE_COLLECTION'; payload: string }
  | { type: 'SET_ATTACHMENTS'; payload: GrimoireAttachment[] }
  | { type: 'ADD_ATTACHMENT'; payload: GrimoireAttachment }
  | { type: 'DELETE_ATTACHMENT'; payload: string };

// Reducer
function grimoireReducer(state: typeof initialState, action: GrimoireAction): typeof initialState {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    case 'SET_ERROR':
      return { ...state, error: action.payload };
    case 'SET_VAULT':
      return { ...state, vault: action.payload };
    case 'SET_ENTRIES':
      return { ...state, entries: action.payload };
    case 'ADD_ENTRY':
      return { ...state, entries: [...state.entries, action.payload] };
    case 'UPDATE_ENTRY':
      return {
        ...state,
        entries: state.entries.map(entry =>
          entry.id === action.payload.id ? action.payload : entry
        ),
      };
    case 'DELETE_ENTRY':
      return {
        ...state,
        entries: state.entries.filter(entry => entry.id !== action.payload),
      };
    case 'SET_COLLECTIONS':
      return { ...state, collections: action.payload };
    case 'ADD_COLLECTION':
      return { ...state, collections: [...state.collections, action.payload] };
    case 'UPDATE_COLLECTION':
      return {
        ...state,
        collections: state.collections.map(collection =>
          collection.id === action.payload.id ? action.payload : collection
        ),
      };
    case 'DELETE_COLLECTION':
      return {
        ...state,
        collections: state.collections.filter(collection => collection.id !== action.payload),
      };
    case 'SET_ATTACHMENTS':
      return { ...state, attachments: action.payload };
    case 'ADD_ATTACHMENT':
      return { ...state, attachments: [...state.attachments, action.payload] };
    case 'DELETE_ATTACHMENT':
      return {
        ...state,
        attachments: state.attachments.filter(attachment => attachment.id !== action.payload),
      };
    default:
      return state;
  }
}

// Create context
const GrimoireContext = createContext<GrimoireContextType | undefined>(undefined);

// Provider component
export function GrimoireProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(grimoireReducer, initialState);

  // Get current user
  const getCurrentUser = useCallback(async () => {
    const { data: { user }, error } = await supabase.auth.getUser();
    if (error) throw new GrimoireError('Failed to get current user', 'AUTH_ERROR');
    return user;
  }, []);

  // Load vault
  const loadVault = useCallback(async () => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      dispatch({ type: 'SET_ERROR', payload: null });

      const user = await getCurrentUser();
      if (!user) throw new GrimoireError('User not authenticated', 'AUTH_ERROR');

      // Get or create vault
      let { data: vault, error: vaultError } = await supabase
        .from('grimoire_vaults')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (vaultError && vaultError.code !== 'PGRST116') {
        throw new GrimoireError('Failed to load vault', 'VAULT_LOAD_ERROR');
      }

      if (!vault) {
        // Create default vault
        const defaultVault: VaultInsert = {
          user_id: user.id,
          book_name: 'Digital Grimoire',
          practice: 'Eclectic',
          style: 'Clean & mystical',
          calendar: 'Gregorian',
          timezone: 'UTC',
          privacy_level: 'private',
          safety_mode: true,
          settings: {
            theme: 'auto',
            layout: 'grid',
            default_view: 'library',
            auto_save: true,
            backup_frequency: 'weekly',
            ai_suggestions: true,
            safety_warnings: true,
            correspondences_integration: true,
            lunar_integration: true,
            notifications: {
              daily_reminders: true,
              new_suggestions: true,
              backup_reminders: true,
              practice_reminders: true,
            },
          },
        };

        const { data: newVault, error: createError } = await supabase
          .from('grimoire_vaults')
          .insert(defaultVault)
          .select()
          .single();

        if (createError) throw new GrimoireError('Failed to create vault', 'VAULT_CREATE_ERROR');
        vault = newVault;
      }

      dispatch({ type: 'SET_VAULT', payload: vault });

      // Load entries
      const { data: entries, error: entriesError } = await supabase
        .from('grimoire_entries')
        .select('*')
        .eq('vault_id', vault.id)
        .order('updated_at', { ascending: false });

      if (entriesError) throw new GrimoireError('Failed to load entries', 'ENTRIES_LOAD_ERROR');
      dispatch({ type: 'SET_ENTRIES', payload: entries || [] });

      // Load collections
      const { data: collections, error: collectionsError } = await supabase
        .from('grimoire_collections')
        .select('*')
        .eq('vault_id', vault.id)
        .order('created_at', { ascending: false });

      if (collectionsError) throw new GrimoireError('Failed to load collections', 'COLLECTIONS_LOAD_ERROR');
      dispatch({ type: 'SET_COLLECTIONS', payload: collections || [] });

      // Load attachments
      const { data: attachments, error: attachmentsError } = await supabase
        .from('grimoire_attachments')
        .select('*')
        .eq('vault_id', vault.id)
        .order('added_at', { ascending: false });

      if (attachmentsError) throw new GrimoireError('Failed to load attachments', 'ATTACHMENTS_LOAD_ERROR');
      dispatch({ type: 'SET_ATTACHMENTS', payload: attachments || [] });

    } catch (error) {
      const message = error instanceof Error ? error.message : 'An unknown error occurred';
      dispatch({ type: 'SET_ERROR', payload: message });
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, [getCurrentUser]);

  // Create vault
  const createVault = useCallback(async (data: Partial<GrimoireVault>): Promise<GrimoireVault> => {
    try {
      const user = await getCurrentUser();
      if (!user) throw new GrimoireError('User not authenticated', 'AUTH_ERROR');

      const vaultData: VaultInsert = {
        user_id: user.id,
        book_name: data.book_name || 'Digital Grimoire',
        owner_name: data.owner_name,
        practice: data.practice || 'Eclectic',
        style: data.style || 'Clean & mystical',
        calendar: data.calendar || 'Gregorian',
        timezone: data.timezone || 'UTC',
        privacy_level: data.privacy_level || 'private',
        safety_mode: data.safety_mode ?? true,
        settings: data.settings || {
          theme: 'auto',
          layout: 'grid',
          default_view: 'library',
          auto_save: true,
          backup_frequency: 'weekly',
          ai_suggestions: true,
          safety_warnings: true,
          correspondences_integration: true,
          lunar_integration: true,
          notifications: {
            daily_reminders: true,
            new_suggestions: true,
            backup_reminders: true,
            practice_reminders: true,
          },
        },
      };

      const { data: vault, error } = await supabase
        .from('grimoire_vaults')
        .insert(vaultData)
        .select()
        .single();

      if (error) throw new GrimoireError('Failed to create vault', 'VAULT_CREATE_ERROR');

      dispatch({ type: 'SET_VAULT', payload: vault });
      return vault;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'An unknown error occurred';
      dispatch({ type: 'SET_ERROR', payload: message });
      throw error;
    }
  }, [getCurrentUser]);

  // Update vault
  const updateVault = useCallback(async (data: Partial<GrimoireVault>): Promise<void> => {
    try {
      if (!state.vault) throw new GrimoireError('No vault loaded', 'NO_VAULT');

      const { error } = await supabase
        .from('grimoire_vaults')
        .update(data)
        .eq('id', state.vault.id);

      if (error) throw new GrimoireError('Failed to update vault', 'VAULT_UPDATE_ERROR');

      // Reload vault to get updated data
      await loadVault();
    } catch (error) {
      const message = error instanceof Error ? error.message : 'An unknown error occurred';
      dispatch({ type: 'SET_ERROR', payload: message });
      throw error;
    }
  }, [state.vault, loadVault]);

  // Create entry
  const createEntry = useCallback(async (type: EntryType, data: Partial<GrimoireEntry>): Promise<GrimoireEntry> => {
    try {
      if (!state.vault) throw new GrimoireError('No vault loaded', 'NO_VAULT');

      const entryData: GrimoireInsert = {
        vault_id: state.vault.id,
        type,
        title: data.title || 'Untitled Entry',
        content: data.content,
        steps: data.steps || [],
        checklist: data.checklist || [],
        correspondences: data.correspondences || {},
        tags: data.tags || [],
        linked_entries: data.linked_entries || [],
        sources: data.sources || [],
        media: data.media || [],
        visibility: data.visibility || 'private',
        status: data.status || 'draft',
        version: 1,
        history: [],
      };

      const { data: entry, error } = await supabase
        .from('grimoire_entries')
        .insert(entryData)
        .select()
        .single();

      if (error) throw new GrimoireError('Failed to create entry', 'ENTRY_CREATE_ERROR');

      dispatch({ type: 'ADD_ENTRY', payload: entry });
      return entry;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'An unknown error occurred';
      dispatch({ type: 'SET_ERROR', payload: message });
      throw error;
    }
  }, [state.vault]);

  // Update entry
  const updateEntry = useCallback(async (id: string, data: Partial<GrimoireEntry>): Promise<void> => {
    try {
      const { data: entry, error } = await supabase
        .from('grimoire_entries')
        .update(data)
        .eq('id', id)
        .select()
        .single();

      if (error) throw new GrimoireError('Failed to update entry', 'ENTRY_UPDATE_ERROR');

      dispatch({ type: 'UPDATE_ENTRY', payload: entry });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'An unknown error occurred';
      dispatch({ type: 'SET_ERROR', payload: message });
      throw error;
    }
  }, []);

  // Delete entry
  const deleteEntry = useCallback(async (id: string): Promise<void> => {
    try {
      const { error } = await supabase
        .from('grimoire_entries')
        .delete()
        .eq('id', id);

      if (error) throw new GrimoireError('Failed to delete entry', 'ENTRY_DELETE_ERROR');

      dispatch({ type: 'DELETE_ENTRY', payload: id });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'An unknown error occurred';
      dispatch({ type: 'SET_ERROR', payload: message });
      throw error;
    }
  }, []);

  // Duplicate entry
  const duplicateEntry = useCallback(async (id: string): Promise<GrimoireEntry> => {
    try {
      const originalEntry = state.entries.find(entry => entry.id === id);
      if (!originalEntry) throw new GrimoireError('Entry not found', 'ENTRY_NOT_FOUND');

      const duplicatedEntry: GrimoireInsert = {
        ...originalEntry,
        title: `${originalEntry.title} (Copy)`,
        status: 'draft',
        version: 1,
        history: [],
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      delete (duplicatedEntry as any).id;

      const { data: entry, error } = await supabase
        .from('grimoire_entries')
        .insert(duplicatedEntry)
        .select()
        .single();

      if (error) throw new GrimoireError('Failed to duplicate entry', 'ENTRY_DUPLICATE_ERROR');

      dispatch({ type: 'ADD_ENTRY', payload: entry });
      return entry;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'An unknown error occurred';
      dispatch({ type: 'SET_ERROR', payload: message });
      throw error;
    }
  }, [state.entries]);

  // Search entries
  const searchEntries = useCallback(async (params: GrimoireSearchParams): Promise<GrimoireSearchResult> => {
    try {
      if (!state.vault) throw new GrimoireError('No vault loaded', 'NO_VAULT');

      let query = supabase
        .from('grimoire_entries')
        .select('*', { count: 'exact' })
        .eq('vault_id', state.vault.id);

      if (params.query) {
        query = query.textSearch('title', params.query);
      }

      if (params.types && params.types.length > 0) {
        query = query.in('type', params.types);
      }

      if (params.tags && params.tags.length > 0) {
        query = query.overlaps('tags', params.tags);
      }

      if (params.status && params.status.length > 0) {
        query = query.in('status', params.status);
      }

      if (params.visibility && params.visibility.length > 0) {
        query = query.in('visibility', params.visibility);
      }

      if (params.date_from) {
        query = query.gte('created_at', params.date_from);
      }

      if (params.date_to) {
        query = query.lte('created_at', params.date_to);
      }

      const sortBy = params.sort_by || 'updated_at';
      const sortOrder = params.sort_order || 'desc';
      query = query.order(sortBy, { ascending: sortOrder === 'asc' });

      const limit = params.limit || 50;
      const offset = params.offset || 0;
      query = query.range(offset, offset + limit - 1);

      const { data: entries, error, count } = await query;

      if (error) throw new GrimoireError('Failed to search entries', 'SEARCH_ERROR');

      return {
        entries: entries || [],
        total_count: count || 0,
        has_more: (count || 0) > offset + limit,
        next_offset: (count || 0) > offset + limit ? offset + limit : undefined,
      };
    } catch (error) {
      const message = error instanceof Error ? error.message : 'An unknown error occurred';
      dispatch({ type: 'SET_ERROR', payload: message });
      throw error;
    }
  }, [state.vault]);

  // Get entries by type
  const getEntriesByType = useCallback((type: EntryType): GrimoireEntry[] => {
    return state.entries.filter(entry => entry.type === type);
  }, [state.entries]);

  // Get entries by tag
  const getEntriesByTag = useCallback((tag: string): GrimoireEntry[] => {
    return state.entries.filter(entry => entry.tags.includes(tag));
  }, [state.entries]);

  // Content ingestion (placeholder implementation)
  const ingestContent = useCallback(async (content: string, type?: EntryType): Promise<GrimoireEntry[]> => {
    try {
      // This would integrate with AI to parse and structure content
      // For now, create a simple note entry
      const entry = await createEntry(type || 'note', {
        title: 'Imported Content',
        content,
        tags: ['imported'],
      });

      return [entry];
    } catch (error) {
      const message = error instanceof Error ? error.message : 'An unknown error occurred';
      dispatch({ type: 'SET_ERROR', payload: message });
      throw error;
    }
  }, [createEntry]);

  // Import/Export vault (placeholder implementations)
  const importVault = useCallback(async (data: string): Promise<void> => {
    try {
      // Parse JSON data and import entries
      const importData = JSON.parse(data);
      // Implementation would depend on the export format
      console.log('Import vault:', importData);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'An unknown error occurred';
      dispatch({ type: 'SET_ERROR', payload: message });
      throw error;
    }
  }, []);

  const exportVault = useCallback((): string => {
    try {
      const exportData = {
        vault: state.vault,
        entries: state.entries,
        collections: state.collections,
        attachments: state.attachments,
        export_date: new Date().toISOString(),
        version: '1.0',
      };
      return JSON.stringify(exportData, null, 2);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'An unknown error occurred';
      dispatch({ type: 'SET_ERROR', payload: message });
      throw error;
    }
  }, [state.vault, state.entries, state.collections, state.attachments]);

  // Collection operations (placeholder implementations)
  const createCollection = useCallback(async (data: Partial<GrimoireCollection>): Promise<GrimoireCollection> => {
    try {
      if (!state.vault) throw new GrimoireError('No vault loaded', 'NO_VAULT');

      const collectionData = {
        vault_id: state.vault.id,
        name: data.name || 'New Collection',
        description: data.description,
        color: data.color || '#6366f1',
        icon: data.icon || '📚',
        entry_ids: data.entry_ids || [],
      };

      const { data: collection, error } = await supabase
        .from('grimoire_collections')
        .insert(collectionData)
        .select()
        .single();

      if (error) throw new GrimoireError('Failed to create collection', 'COLLECTION_CREATE_ERROR');

      dispatch({ type: 'ADD_COLLECTION', payload: collection });
      return collection;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'An unknown error occurred';
      dispatch({ type: 'SET_ERROR', payload: message });
      throw error;
    }
  }, [state.vault]);

  const updateCollection = useCallback(async (id: string, data: Partial<GrimoireCollection>): Promise<void> => {
    try {
      const { data: collection, error } = await supabase
        .from('grimoire_collections')
        .update(data)
        .eq('id', id)
        .select()
        .single();

      if (error) throw new GrimoireError('Failed to update collection', 'COLLECTION_UPDATE_ERROR');

      dispatch({ type: 'UPDATE_COLLECTION', payload: collection });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'An unknown error occurred';
      dispatch({ type: 'SET_ERROR', payload: message });
      throw error;
    }
  }, []);

  const deleteCollection = useCallback(async (id: string): Promise<void> => {
    try {
      const { error } = await supabase
        .from('grimoire_collections')
        .delete()
        .eq('id', id);

      if (error) throw new GrimoireError('Failed to delete collection', 'COLLECTION_DELETE_ERROR');

      dispatch({ type: 'DELETE_COLLECTION', payload: id });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'An unknown error occurred';
      dispatch({ type: 'SET_ERROR', payload: message });
      throw error;
    }
  }, []);

  const addEntryToCollection = useCallback(async (collectionId: string, entryId: string): Promise<void> => {
    try {
      const collection = state.collections.find(c => c.id === collectionId);
      if (!collection) throw new GrimoireError('Collection not found', 'COLLECTION_NOT_FOUND');

      const updatedEntryIds = [...collection.entry_ids, entryId];
      await updateCollection(collectionId, { entry_ids: updatedEntryIds });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'An unknown error occurred';
      dispatch({ type: 'SET_ERROR', payload: message });
      throw error;
    }
  }, [state.collections, updateCollection]);

  const removeEntryFromCollection = useCallback(async (collectionId: string, entryId: string): Promise<void> => {
    try {
      const collection = state.collections.find(c => c.id === collectionId);
      if (!collection) throw new GrimoireError('Collection not found', 'COLLECTION_NOT_FOUND');

      const updatedEntryIds = collection.entry_ids.filter(id => id !== entryId);
      await updateCollection(collectionId, { entry_ids: updatedEntryIds });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'An unknown error occurred';
      dispatch({ type: 'SET_ERROR', payload: message });
      throw error;
    }
  }, [state.collections, updateCollection]);

  // Attachment operations (placeholder implementations)
  const uploadAttachment = useCallback(async (file: File, note?: string): Promise<GrimoireAttachment> => {
    try {
      if (!state.vault) throw new GrimoireError('No vault loaded', 'NO_VAULT');

      // This would upload to Supabase Storage
      // For now, create a placeholder attachment
      const attachmentData = {
        vault_id: state.vault.id,
        filename: file.name,
        file_type: file.type,
        file_url: URL.createObjectURL(file), // This would be the uploaded URL
        note,
      };

      const { data: attachment, error } = await supabase
        .from('grimoire_attachments')
        .insert(attachmentData)
        .select()
        .single();

      if (error) throw new GrimoireError('Failed to upload attachment', 'ATTACHMENT_UPLOAD_ERROR');

      dispatch({ type: 'ADD_ATTACHMENT', payload: attachment });
      return attachment;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'An unknown error occurred';
      dispatch({ type: 'SET_ERROR', payload: message });
      throw error;
    }
  }, [state.vault]);

  const deleteAttachment = useCallback(async (id: string): Promise<void> => {
    try {
      const { error } = await supabase
        .from('grimoire_attachments')
        .delete()
        .eq('id', id);

      if (error) throw new GrimoireError('Failed to delete attachment', 'ATTACHMENT_DELETE_ERROR');

      dispatch({ type: 'DELETE_ATTACHMENT', payload: id });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'An unknown error occurred';
      dispatch({ type: 'SET_ERROR', payload: message });
      throw error;
    }
  }, []);

  // AI Evolution (placeholder implementations)
  const getSuggestions = useCallback(async (): Promise<EvolutionSuggestion[]> => {
    // This would integrate with AI to generate suggestions
    return [];
  }, []);

  const applySuggestion = useCallback(async (suggestionId: string, actionId: string): Promise<void> => {
    // This would apply AI suggestions
    console.log('Apply suggestion:', suggestionId, actionId);
  }, []);

  // Daily Practice (placeholder implementations)
  const getDailyPractice = useCallback(async (date: string): Promise<DailyPractice> => {
    // This would get daily practice data
    return {
      date,
      suggestions: [],
      completed_entries: [],
    };
  }, []);

  const updateDailyPractice = useCallback(async (date: string, data: Partial<DailyPractice>): Promise<void> => {
    // This would update daily practice data
    console.log('Update daily practice:', date, data);
  }, []);

  // Load vault on mount
  useEffect(() => {
    loadVault();
  }, [loadVault]);

  const contextValue: GrimoireContextType = {
    vault: state.vault,
    entries: state.entries,
    collections: state.collections,
    attachments: state.attachments,
    loading: state.loading,
    error: state.error,
    createVault,
    updateVault,
    loadVault,
    createEntry,
    updateEntry,
    deleteEntry,
    duplicateEntry,
    searchEntries,
    getEntriesByType,
    getEntriesByTag,
    ingestContent,
    importVault,
    exportVault,
    createCollection,
    updateCollection,
    deleteCollection,
    addEntryToCollection,
    removeEntryFromCollection,
    uploadAttachment,
    deleteAttachment,
    getSuggestions,
    applySuggestion,
    getDailyPractice,
    updateDailyPractice,
  };

  return (
    <GrimoireContext.Provider value={contextValue}>
      {children}
    </GrimoireContext.Provider>
  );
}

// Hook to use the context
export function useGrimoire(): GrimoireContextType {
  const context = useContext(GrimoireContext);
  if (context === undefined) {
    throw new Error('useGrimoire must be used within a GrimoireProvider');
  }
  return context;
}
