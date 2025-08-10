export interface SupabaseConfig {
  url: string;
  anonKey: string;
}

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

export async function getDataObject(options: DataObjectOptions) {
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
    throw new Error('supabase-dataobject-helper is not available. Ensure the extension or package is installed.');
  }
}


