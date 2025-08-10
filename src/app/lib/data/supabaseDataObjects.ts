export interface SupabaseConfig {
  url: string;
  anonKey: string;
}
import type { SupabaseClient } from '@supabase/supabase-js';

export interface DataObjectFieldOption {
  name: string;
  type: 'string' | 'number' | 'boolean' | 'date' | string;
}

export interface WhereClauseOption {
  field: string;
  operator: 'equals' | 'ilike' | string;
  value: unknown;
}

export interface SortOption {
  field: string;
  direction: 'asc' | 'desc';
}

export interface DataObjectOptions {
  viewName: string;
  fields: DataObjectFieldOption[];
  whereClauses?: WhereClauseOption[];
  sort?: SortOption;
  recordLimit?: number;
  canInsert?: boolean;
  canUpdate?: boolean;
  canDelete?: boolean;
}

function getSupabaseConfig(): SupabaseConfig {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;

  if (!url || !anonKey) {
    throw new Error('Supabase configuration missing. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY.');
  }

  return { url, anonKey };
}

export async function getDataObject(options: DataObjectOptions, existingClient?: unknown) {
  const config = getSupabaseConfig();
  // Dynamically import to make the helper optional at build time
  try {
    // Avoid bundler static resolution by using the Function constructor
    const dynamicImport: (specifier: string) => Promise<unknown> = new Function(
      'specifier',
      'return import(specifier)'
    ) as unknown as (specifier: string) => Promise<unknown>;

    const modUnknown = await dynamicImport('supabase-dataobject-helper');
    const mod = modUnknown as { createDataObject?: (cfg: SupabaseConfig, opt: DataObjectOptions) => Promise<unknown> } | { default?: { createDataObject?: (cfg: SupabaseConfig, opt: DataObjectOptions) => Promise<unknown> } };
    const createDataObjectFn = ('createDataObject' in (mod as Record<string, unknown>)
      ? (mod as { createDataObject: (cfg: SupabaseConfig, opt: DataObjectOptions) => Promise<unknown> }).createDataObject
      : (mod as { default?: { createDataObject?: (cfg: SupabaseConfig, opt: DataObjectOptions) => Promise<unknown> } }).default?.createDataObject);
    if (!createDataObjectFn) {
      throw new Error('createDataObject not found in supabase-dataobject-helper');
    }
    return createDataObjectFn(config, options);
  } catch {
    // Fallback: emulate a minimal DataObject using supabase-js directly
    const { createClient } = await import('@supabase/supabase-js');
    // If a client with session context is provided (e.g., from route handler), use it
    const client: SupabaseClient = (existingClient as SupabaseClient) || createClient(config.url, config.anonKey);

    type RecordMap = Record<string, unknown>;
    let cached: RecordMap[] = [];
    const listeners: Array<(data: RecordMap[]) => void> = [];

    type WithFilters<Q> = Q & {
      eq: (field: string, value: unknown) => Q;
      ilike: (field: string, value: string) => Q;
      order: (field: string, opts: { ascending: boolean }) => Q;
      limit: (count: number) => Q;
    };

    function applyQuery<Q>(query: WithFilters<Q>): WithFilters<Q> {
      if (options.whereClauses && options.whereClauses.length > 0) {
        for (const clause of options.whereClauses) {
          if (clause.operator === 'equals') {
            query = query.eq(clause.field, clause.value) as WithFilters<Q>;
          } else if (clause.operator === 'ilike') {
            query = query.ilike(clause.field, clause.value as string) as WithFilters<Q>;
          }
        }
      }
      if (options.sort) {
        query = query.order(options.sort.field, { ascending: options.sort.direction === 'asc' }) as WithFilters<Q>;
      }
      if (options.recordLimit && options.recordLimit > 0) {
        query = query.limit(options.recordLimit) as WithFilters<Q>;
      }
      return query;
    }

    const refresh = async () => {
      const fields = options.fields?.map(f => f.name).join(',') || '*';
      const q = client.from(options.viewName).select(fields);
      const filtered = applyQuery(q as unknown as WithFilters<typeof q>);
      const { data, error } = await (filtered as unknown as typeof q);
      if (error) {
        throw error;
      }
      const rows = (data as unknown as RecordMap[]) ?? [];
      cached = rows;
      listeners.forEach(fn => fn(cached));
    };

    await refresh();

    return {
      onDataChanged(handler: (data: RecordMap[]) => void) {
        listeners.push(handler);
      },
      getData() {
        return cached;
      },
      async insert(record: RecordMap) {
        if (!options.canInsert) throw new Error('Insert not allowed by DataObjectOptions');
        const { error } = await client.from(options.viewName).insert(record);
        if (error) throw error;
        await refresh();
      },
      async update(id: string | number, changes: RecordMap) {
        if (!options.canUpdate) throw new Error('Update not allowed by DataObjectOptions');
        const idField = options.fields.find(f => f.name === 'id')?.name || 'id';
        const { error } = await client.from(options.viewName).update(changes).eq(idField, id);
        if (error) throw error;
        await refresh();
      },
      async delete(id: string | number) {
        if (!options.canDelete) throw new Error('Delete not allowed by DataObjectOptions');
        const idField = options.fields.find(f => f.name === 'id')?.name || 'id';
        const { error } = await client.from(options.viewName).delete().eq(idField, id);
        if (error) throw error;
        await refresh();
      },
      async refresh() {
        await refresh();
      },
      dispose() {
        listeners.length = 0;
      }
    };
  }
}


