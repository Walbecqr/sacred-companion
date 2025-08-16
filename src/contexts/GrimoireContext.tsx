'use client';

import React, { createContext, useContext, useReducer, useCallback, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { 
  GrimoireContextType, 
  GrimoireVault, 
  GrimoireEntry, 
  GrimoireCollection, 
  EntryType, 
  SearchFilters, 
  SearchResult, 
  DailyPractice,
  VaultSettings 
} from '@/types/grimoire';

// Initial state
const initialState = {
  vault: null as GrimoireVault | null,
  entries: [] as GrimoireEntry[],
  collections: [] as GrimoireCollection[],
  loading: false,
  error: null as string | null,
};

// Action types
type GrimoireAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'SET_VAULT'; payload: GrimoireVault }
  | { type: 'SET_ENTRIES'; payload: GrimoireEntry[] }
  | { type: 'ADD_ENTRY'; payload: GrimoireEntry }
  | { type: 'UPDATE_ENTRY'; payload: GrimoireEntry }
  | { type: 'DELETE_ENTRY'; payload: string }
  | { type: 'SET_COLLECTIONS'; payload: GrimoireCollection[] }
  | { type: 'ADD_COLLECTION'; payload: GrimoireCollection }
  | { type: 'UPDATE_COLLECTION'; payload: GrimoireCollection }
  | { type: 'DELETE_COLLECTION'; payload: string };

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
        ) 
      };
    case 'DELETE_ENTRY':
      return { 
        ...state, 
        entries: state.entries.filter(entry => entry.id !== action.payload) 
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
        ) 
      };
    case 'DELETE_COLLECTION':
      return { 
        ...state, 
        collections: state.collections.filter(collection => collection.id !== action.payload) 
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

  // Load or create user's vault
  const loadVault = useCallback(async () => {
    dispatch({ type: 'SET_LOADING', payload: true });
    dispatch({ type: 'SET_ERROR', payload: null });

    try {
      // First check for session
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        // If no session, try to get user directly
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          dispatch({ type: 'SET_ERROR', payload: 'Please log in to access your grimoire' });
          return;
        }
      } else {
        // Use session user
        const user = session.user;

        // Try to get existing vault
        const { data: vault, error: vaultError } = await supabase
          .from('grimoire_vaults')
          .select('*')
          .eq('user_id', user.id)
          .single();

        if (vaultError && vaultError.code !== 'PGRST116') {
          throw vaultError;
        }

        if (vault) {
          dispatch({ type: 'SET_VAULT', payload: vault });
          
          // Load entries and collections
          const [entriesResponse, collectionsResponse] = await Promise.all([
            supabase.from('grimoire_entries').select('*').eq('vault_id', vault.id),
            supabase.from('grimoire_collections').select('*').eq('vault_id', vault.id)
          ]);

          if (entriesResponse.data) {
            dispatch({ type: 'SET_ENTRIES', payload: entriesResponse.data });
          }
          if (collectionsResponse.data) {
            dispatch({ type: 'SET_COLLECTIONS', payload: collectionsResponse.data });
          }
        } else {
          // Create new vault
          const defaultSettings: VaultSettings = {
            theme: 'light',
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
          };

          const newVault: Partial<GrimoireVault> = {
            user_id: user.id,
            book_name: 'My Grimoire',
            practice: 'Eclectic',
            settings: defaultSettings,
          };

          const { data: createdVault, error: createError } = await supabase
            .from('grimoire_vaults')
            .insert(newVault)
            .select()
            .single();

          if (createError) throw createError;
          if (createdVault) {
            dispatch({ type: 'SET_VAULT', payload: createdVault });
          }
        }
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to load vault';
      dispatch({ type: 'SET_ERROR', payload: errorMessage });
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, []);

  // Load vault on mount with retry mechanism
  useEffect(() => {
    const initializeVault = async () => {
      let retries = 0;
      const maxRetries = 3;
      
      while (retries < maxRetries) {
        try {
          await loadVault();
          break; // Success, exit retry loop
        } catch (error) {
          retries++;
          if (retries >= maxRetries) {
            console.error('Failed to load vault after', maxRetries, 'attempts:', error);
            dispatch({ type: 'SET_ERROR', payload: 'Failed to load grimoire. Please refresh the page.' });
          } else {
            // Wait before retrying
            await new Promise(resolve => setTimeout(resolve, 1000 * retries));
          }
        }
      }
    };

    initializeVault();
  }, [loadVault]);

  // Listen for auth state changes
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_IN' && session?.user) {
          // User signed in, reload vault
          await loadVault();
        } else if (event === 'SIGNED_OUT') {
          // User signed out, clear state
          dispatch({ type: 'SET_VAULT', payload: null });
          dispatch({ type: 'SET_ENTRIES', payload: [] });
          dispatch({ type: 'SET_COLLECTIONS', payload: [] });
          dispatch({ type: 'SET_ERROR', payload: 'Please log in to access your grimoire' });
        }
      }
    );

    return () => subscription.unsubscribe();
  }, [loadVault]);

  // Vault operations
  const createVault = useCallback(async (data: Partial<GrimoireVault>): Promise<GrimoireVault> => {
    const { data: vault, error } = await supabase
      .from('grimoire_vaults')
      .insert(data)
      .select()
      .single();

    if (error) throw error;
    if (!vault) throw new Error('Failed to create vault');

    dispatch({ type: 'SET_VAULT', payload: vault });
    return vault;
  }, []);

  const updateVault = useCallback(async (data: Partial<GrimoireVault>): Promise<GrimoireVault> => {
    if (!state.vault) throw new Error('No vault to update');

    const { data: vault, error } = await supabase
      .from('grimoire_vaults')
      .update(data)
      .eq('id', state.vault.id)
      .select()
      .single();

    if (error) throw error;
    if (!vault) throw new Error('Failed to update vault');

    dispatch({ type: 'SET_VAULT', payload: vault });
    return vault;
  }, [state.vault]);

  // Entry operations
  const createEntry = useCallback(async (type: EntryType, data: Partial<GrimoireEntry>): Promise<GrimoireEntry> => {
    if (!state.vault) throw new Error('No vault available');

    const entryData: Partial<GrimoireEntry> = {
      vault_id: state.vault.id,
      type,
      title: data.title || '',
      content: data.content || '',
      tags: data.tags || [],
      visibility: data.visibility || 'private',
      status: data.status || 'draft',
      metadata: data.metadata || {},
      ...data,
    };

    const { data: entry, error } = await supabase
      .from('grimoire_entries')
      .insert(entryData)
      .select()
      .single();

    if (error) throw error;
    if (!entry) throw new Error('Failed to create entry');

    dispatch({ type: 'ADD_ENTRY', payload: entry });
    return entry;
  }, [state.vault]);

  const updateEntry = useCallback(async (id: string, data: Partial<GrimoireEntry>): Promise<GrimoireEntry> => {
    const { data: entry, error } = await supabase
      .from('grimoire_entries')
      .update(data)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    if (!entry) throw new Error('Failed to update entry');

    dispatch({ type: 'UPDATE_ENTRY', payload: entry });
    return entry;
  }, []);

  const deleteEntry = useCallback(async (id: string): Promise<void> => {
    const { error } = await supabase
      .from('grimoire_entries')
      .delete()
      .eq('id', id);

    if (error) throw error;
    dispatch({ type: 'DELETE_ENTRY', payload: id });
  }, []);

  const getEntry = useCallback(async (id: string): Promise<GrimoireEntry | null> => {
    const { data: entry, error } = await supabase
      .from('grimoire_entries')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return entry;
  }, []);

  // Collection operations
  const createCollection = useCallback(async (data: Partial<GrimoireCollection>): Promise<GrimoireCollection> => {
    if (!state.vault) throw new Error('No vault available');

    const collectionData: Partial<GrimoireCollection> = {
      vault_id: state.vault.id,
      name: data.name || '',
      description: data.description,
      color: data.color,
      entry_ids: data.entry_ids || [],
      ...data,
    };

    const { data: collection, error } = await supabase
      .from('grimoire_collections')
      .insert(collectionData)
      .select()
      .single();

    if (error) throw error;
    if (!collection) throw new Error('Failed to create collection');

    dispatch({ type: 'ADD_COLLECTION', payload: collection });
    return collection;
  }, [state.vault]);

  const updateCollection = useCallback(async (id: string, data: Partial<GrimoireCollection>): Promise<GrimoireCollection> => {
    const { data: collection, error } = await supabase
      .from('grimoire_collections')
      .update(data)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    if (!collection) throw new Error('Failed to update collection');

    dispatch({ type: 'UPDATE_COLLECTION', payload: collection });
    return collection;
  }, []);

  const deleteCollection = useCallback(async (id: string): Promise<void> => {
    const { error } = await supabase
      .from('grimoire_collections')
      .delete()
      .eq('id', id);

    if (error) throw error;
    dispatch({ type: 'DELETE_COLLECTION', payload: id });
  }, []);

  const addEntryToCollection = useCallback(async (collectionId: string, entryId: string): Promise<void> => {
    const collection = state.collections.find(c => c.id === collectionId);
    if (!collection) throw new Error('Collection not found');

    const updatedEntryIds = [...collection.entry_ids, entryId];
    await updateCollection(collectionId, { entry_ids: updatedEntryIds });
  }, [state.collections, updateCollection]);

  const removeEntryFromCollection = useCallback(async (collectionId: string, entryId: string): Promise<void> => {
    const collection = state.collections.find(c => c.id === collectionId);
    if (!collection) throw new Error('Collection not found');

    const updatedEntryIds = collection.entry_ids.filter(id => id !== entryId);
    await updateCollection(collectionId, { entry_ids: updatedEntryIds });
  }, [state.collections, updateCollection]);

  // Search and filter
  const searchEntries = useCallback(async (filters: SearchFilters): Promise<SearchResult[]> => {
    if (!state.vault) return [];

    let query = supabase
      .from('grimoire_entries')
      .select('*')
      .eq('vault_id', state.vault.id);

    if (filters.query) {
      query = query.textSearch('search_vector', filters.query);
    }

    if (filters.types && filters.types.length > 0) {
      query = query.in('type', filters.types);
    }

    if (filters.tags && filters.tags.length > 0) {
      query = query.overlaps('tags', filters.tags);
    }

    if (filters.status && filters.status.length > 0) {
      query = query.in('status', filters.status);
    }

    if (filters.date_range) {
      query = query
        .gte('created_at', filters.date_range.start)
        .lte('created_at', filters.date_range.end);
    }

    if (filters.sort_by) {
      const order = filters.sort_order || 'desc';
      query = query.order(filters.sort_by, { ascending: order === 'asc' });
    }

    const { data: entries, error } = await query;

    if (error) throw error;

    // Convert to SearchResult format
    const results: SearchResult[] = (entries || []).map(entry => ({
      entry,
      relevance_score: 1.0, // Placeholder - would be calculated by full-text search
      matched_fields: ['title', 'content'], // Placeholder
    }));

    return results;
  }, [state.vault]);

  // Content ingestion
  const ingestContent = useCallback(async (content: string, type: EntryType): Promise<GrimoireEntry> => {
    // Placeholder implementation - would use AI to structure content
    const title = content.split('\n')[0].substring(0, 100);
    const tags = content.match(/#(\w+)/g)?.map(tag => tag.substring(1)) || [];

    return createEntry(type, {
      title,
      content,
      tags,
    });
  }, [createEntry]);

  // Import/Export
  const exportVault = useCallback(async (): Promise<string> => {
    if (!state.vault) throw new Error('No vault to export');

    const exportData = {
      vault: state.vault,
      entries: state.entries,
      collections: state.collections,
      export_date: new Date().toISOString(),
    };

    return JSON.stringify(exportData, null, 2);
  }, [state.vault, state.entries, state.collections]);

  const importVault = useCallback(async (data: string): Promise<void> => {
    try {
      const importData = JSON.parse(data);
      
      // Validate import data structure
      if (!importData.vault || !importData.entries) {
        throw new Error('Invalid import data format');
      }

      // Clear existing data
      if (state.vault) {
        await supabase.from('grimoire_entries').delete().eq('vault_id', state.vault.id);
        await supabase.from('grimoire_collections').delete().eq('vault_id', state.vault.id);
      }

      // Import new data
      if (importData.entries.length > 0) {
        const { error: entriesError } = await supabase
          .from('grimoire_entries')
          .insert(importData.entries);

        if (entriesError) throw entriesError;
      }

      if (importData.collections && importData.collections.length > 0) {
        const { error: collectionsError } = await supabase
          .from('grimoire_collections')
          .insert(importData.collections);

        if (collectionsError) throw collectionsError;
      }

      // Reload vault data
      await loadVault();
    } catch (error) {
      throw new Error(`Import failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }, [state.vault, loadVault]);

  // AI Evolution
  const evolveEntry = useCallback(async (entryId: string, suggestions: string[]): Promise<GrimoireEntry> => {
    // Placeholder implementation - would use AI to evolve entry
    const entry = state.entries.find(e => e.id === entryId);
    if (!entry) throw new Error('Entry not found');

    const updatedContent = `${entry.content}\n\n---\nAI Suggestions:\n${suggestions.join('\n')}`;
    
    return updateEntry(entryId, { content: updatedContent });
  }, [state.entries, updateEntry]);

  // Daily Practice
  const getDailyPractice = useCallback(async (date: string): Promise<DailyPractice> => {
    // Placeholder implementation - would fetch from database
    return {
      date,
      suggestions: [],
      completed_entries: [],
      journal_entry: '',
      mood: '',
      energy_level: 5,
    };
  }, []);

  const saveDailyPractice = useCallback(async (practice: DailyPractice): Promise<void> => {
    // Placeholder implementation - would save to database
    console.log('Saving daily practice:', practice);
  }, []);

  const contextValue: GrimoireContextType = {
    // State
    vault: state.vault,
    entries: state.entries,
    collections: state.collections,
    loading: state.loading,
    error: state.error,
    
    // Vault Operations
    createVault,
    updateVault,
    
    // Entry Operations
    createEntry,
    updateEntry,
    deleteEntry,
    getEntry,
    
    // Collection Operations
    createCollection,
    updateCollection,
    deleteCollection,
    addEntryToCollection,
    removeEntryFromCollection,
    
    // Search and Filter
    searchEntries,
    
    // Content Ingestion
    ingestContent,
    
    // Import/Export
    exportVault,
    importVault,
    
    // AI Evolution
    evolveEntry,
    
    // Daily Practice
    getDailyPractice,
    saveDailyPractice,
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
