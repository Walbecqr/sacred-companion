declare module 'supabase-dataobject-helper' {
  export interface SupabaseConfig {
    url: string;
    anonKey: string;
  }

  export interface DataObjectOptions {
    viewName: string;
    fields: Array<{ name: string; type: string }>;
    whereClauses?: Array<{ field: string; operator: string; value: unknown }>;
    sort?: { field: string; direction: 'asc' | 'desc' };
    recordLimit?: number;
    canInsert?: boolean;
    canUpdate?: boolean;
    canDelete?: boolean;
  }

  export type DataChangedHandler<T = unknown> = (data: T[]) => void;

  export interface DataObject<T = unknown> {
    onDataChanged(handler: DataChangedHandler<T>): void;
    getData(): T[];
    insert(record: Partial<T>): Promise<void>;
    update(id: string | number, changes: Partial<T>): Promise<void>;
    delete(id: string | number): Promise<void>;
    refresh(): Promise<void>;
    dispose(): void;
  }

  export function createDataObject<T = unknown>(
    config: SupabaseConfig,
    options: DataObjectOptions
  ): Promise<DataObject<T>>;

  const _default: {
    createDataObject: typeof createDataObject;
  };
  export default _default;
}

declare module 'supabase-dataobject-helper/types' {
  export * from 'supabase-dataobject-helper';
}


