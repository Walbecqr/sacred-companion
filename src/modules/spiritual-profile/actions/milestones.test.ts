import { jest } from '@jest/globals'
import type { SupabaseClient } from '@supabase/supabase-js'

// Import module under test. This path assumes the file exists at the same directory level.
import {
  createMilestone,
  updateMilestone,
  deleteMilestone,
  detectAndCreateAutoMilestones,
  type ApiResult,
} from './milestones'

// Mock next/cache revalidatePath
jest.unstable_mockModule('next/cache', () => ({
  revalidatePath: jest.fn(),
}))

// Mock supabase createClient
type FromQuery = {
  table: string
  action: 'insert' | 'update' | 'delete' | 'select'
  payload?: any
  filters?: Record<string, any>
}
type FakeRow = Record<string, any>

const makeFakeSupabase = (overrides: Partial<SupabaseClient> = {}) => {
  // We will program behaviors per-table/action using queues
  const callLog: Array<FromQuery> = []

  let authUser: { id: string } | null = { id: 'user-123' }
  let authError: any = null

  const tableApis: Record<string, any> = {}

  // Helper to chain calls similar to supabase.from(...).insert(...).select().single()
  const buildChain = (table: string) => {
    const chain: any = {
      _context: { table, q: {} as any },
      insert: function (rows: FakeRow[]) {
        callLog.push({ table, action: 'insert', payload: rows })
        this._context.q.action = 'insert'
        return this
      },
      update: function (patch: FakeRow) {
        callLog.push({ table, action: 'update', payload: patch })
        this._context.q.action = 'update'
        return this
      },
      delete: function () {
        callLog.push({ table, action: 'delete' })
        this._context.q.action = 'delete'
        return this
      },
      select: function (_cols?: string, options?: any) {
        callLog.push({ table, action: 'select', payload: { cols: _cols, options } })
        this._context.q.action = 'select'
        this._context.q.select = { cols: _cols, options }
        return this
      },
      eq: function (col: string, val: any) {
        this._context.q.filters = this._context.q.filters || {}
        this._context.q.filters[col] = val
        return this
      },
      ilike: function (col: string, val: any) {
        this._context.q.filters = this._context.q.filters || {}
        this._context.q.filters[col] = { ilike: val }
        return this
      },
      gte: function (col: string, val: any) {
        this._context.q.filters = this._context.q.filters || {}
        this._context.q.filters[col] = { gte: val }
        return this
      },
      order: function (_col: string, _opts: any) {
        this._context.q.order = { col: _col, opts: _opts }
        return this
      },
      limit: function (_n: number) {
        this._context.q.limit = _n
        return this
      },
      single: function () {
        this._context.q.single = true
        return this._resolve()
      },
      _resolve: async function () {
        const handler = tableApis[table]
        if (!handler) {
          return { data: null, error: null }
        }
        return handler(this._context.q, callLog)
      },
    }
    return chain
  }

  const fakeClient: any = {
    auth: {
      getUser: jest.fn(async () => ({
        data: { user: authUser },
        error: authError,
      })),
    },
    from: jest.fn((table: string) => buildChain(table)),
    __setAuth: (user: { id: string } | null, error: any = null) => {
      authUser = user
      authError = error
    },
    __setTableHandler: (table: string, fn: (q: any, log: Array<FromQuery>) => Promise<{ data: any; error: any }>) => {
      tableApis[table] = fn
    },
    __getCallLog: () => callLog,
    ...overrides,
  }

  return fakeClient as unknown as SupabaseClient & {
    __setAuth: (user: { id: string } | null, error?: any) => void
    __setTableHandler: (
      table: string,
      fn: (q: any, log: Array<FromQuery>) => Promise<{ data: any; error: any }>
    ) => void
    __getCallLog: () => Array<FromQuery>
    auth: { getUser: jest.Mock }
    from: jest.Mock
  }
}

let fakeSupabase: ReturnType<typeof makeFakeSupabase>

jest.unstable_mockModule('@supabase/supabase-js', () => {
  return {
    createClient: jest.fn(() => fakeSupabase),
    // Type-only export handled by TS
  }
})

describe('spiritual-profile/actions/milestones', () => {
  let revalidatePath: jest.Mock
  let createClient: jest.Mock

  beforeAll(async () => {
    // Dynamically import mocks after jest.unstable_mockModule calls
    const cache = await import('next/cache')
    revalidatePath = cache.revalidatePath as unknown as jest.Mock

    const supabaseMod = await import('@supabase/supabase-js')
    createClient = (supabaseMod as any).createClient as jest.Mock
  })

  beforeEach(async () => {
    jest.resetModules()
    jest.clearAllMocks()

    process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://example.supabase.co'
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'anon-key'

    fakeSupabase = makeFakeSupabase()
    createClient.mockReturnValue(fakeSupabase)
  })

  afterEach(() => {
    delete process.env.NEXT_PUBLIC_SUPABASE_URL
    delete process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  })

  describe('createMilestone', () => {
    const baseInput = {
      title: 'My Milestone',
      description: 'Desc',
      milestone_date: '2024-01-15',
      milestone_type: 'personal_breakthrough' as const,
      significance_level: 3 as const,
      tags: ['a', 'b'],
      is_private: false,
    }

    test('returns UNAUTHORIZED when user not authenticated', async () => {
      fakeSupabase.__setAuth(null, null)

      const result = await createMilestone(baseInput)
      expect(result.ok).toBe(false)
      if (!result.ok) {
        expect(result.error.code).toBe('UNAUTHORIZED')
      }
      expect(revalidatePath).not.toHaveBeenCalled()
    })

    test('validates required title', async () => {
      const result = await createMilestone({ ...baseInput, title: '   ' })
      expect(result.ok).toBe(false)
      if (!result.ok) {
        expect(result.error.code).toBe('VALIDATION_ERROR')
        expect(result.error.message).toMatch(/Title is required/i)
      }
      expect(revalidatePath).not.toHaveBeenCalled()
    })

    test('validates required milestone_date', async () => {
      const { milestone_date, ...rest } = baseInput
      const result = await createMilestone({ ...rest, milestone_date: '' as any })
      expect(result.ok).toBe(false)
      if (!result.ok) {
        expect(result.error.code).toBe('VALIDATION_ERROR')
        expect(result.error.message).toMatch(/Milestone date is required/i)
      }
      expect(revalidatePath).not.toHaveBeenCalled()
    })

    test('returns DATABASE_ERROR when insert fails', async () => {
      fakeSupabase.__setTableHandler('spiritual_milestones', async () => {
        return { data: null, error: { message: 'db insert failed' } }
      })

      const result = await createMilestone(baseInput)
      expect(result.ok).toBe(false)
      if (!result.ok) {
        expect(result.error.code).toBe('DATABASE_ERROR')
      }
      expect(revalidatePath).not.toHaveBeenCalled()
    })

    test('returns ok and revalidates on success', async () => {
      const inserted = {
        id: 'm1',
        user_id: 'user-123',
        ...baseInput,
        created_at: '2024-01-15T00:00:00.000Z',
        updated_at: '2024-01-15T00:00:00.000Z',
      }

      fakeSupabase.__setTableHandler('spiritual_milestones', async (q) => {
        if (q.action === 'insert') {
          return { data: inserted, error: null }
        }
        return { data: null, error: null }
      })

      const result = await createMilestone(baseInput)
      expect(result.ok).toBe(true)
      if (result.ok) {
        expect(result.data).toMatchObject({ id: 'm1', title: 'My Milestone' })
      }
      expect(revalidatePath).toHaveBeenCalledWith('/dashboard/spiritual-journey')
      expect(revalidatePath).toHaveBeenCalledWith('/dashboard')
    })
  })

  describe('updateMilestone', () => {
    const updateInput = {
      id: 'm-99',
      title: 'Updated',
      description: 'Updated Desc',
    }

    test('returns UNAUTHORIZED when user not authenticated', async () => {
      fakeSupabase.__setAuth(null, null)
      const result = await updateMilestone(updateInput as any)
      expect(result.ok).toBe(false)
      if (!result.ok) {
        expect(result.error.code).toBe('UNAUTHORIZED')
      }
      expect(revalidatePath).not.toHaveBeenCalled()
    })

    test('returns NOT_FOUND when backend reports PGRST116', async () => {
      fakeSupabase.__setTableHandler('spiritual_milestones', async () => {
        return { data: null, error: { code: 'PGRST116', message: 'Not found' } }
      })

      const result = await updateMilestone(updateInput as any)
      expect(result.ok).toBe(false)
      if (!result.ok) {
        expect(result.error.code).toBe('NOT_FOUND')
      }
    })

    test('returns DATABASE_ERROR on generic update failure', async () => {
      fakeSupabase.__setTableHandler('spiritual_milestones', async () => {
        return { data: null, error: { code: 'XX', message: 'other' } }
      })

      const result = await updateMilestone(updateInput as any)
      expect(result.ok).toBe(false)
      if (!result.ok) {
        expect(result.error.code).toBe('DATABASE_ERROR')
      }
    })

    test('returns ok and revalidates on success', async () => {
      const updated = {
        id: 'm-99',
        user_id: 'user-123',
        title: 'Updated',
        description: 'Updated Desc',
        updated_at: new Date().toISOString(),
      }

      fakeSupabase.__setTableHandler('spiritual_milestones', async (q) => {
        if (q.action === 'update' && q.filters?.id === 'm-99') {
          return { data: updated, error: null }
        }
        return { data: null, error: null }
      })

      const result = await updateMilestone(updateInput as any)
      expect(result.ok).toBe(true)
      if (result.ok) {
        expect(result.data).toMatchObject({ id: 'm-99', title: 'Updated' })
      }
      expect(revalidatePath).toHaveBeenCalledWith('/dashboard/spiritual-journey')
      expect(revalidatePath).toHaveBeenCalledWith('/dashboard/spiritual-journey/milestone/m-99')
    })
  })

  describe('deleteMilestone', () => {
    test('returns UNAUTHORIZED when user not authenticated', async () => {
      fakeSupabase.__setAuth(null, null)
      const result = await deleteMilestone('m-1')
      expect(result.ok).toBe(false)
      if (!result.ok) {
        expect(result.error.code).toBe('UNAUTHORIZED')
      }
      expect(revalidatePath).not.toHaveBeenCalled()
    })

    test('returns DATABASE_ERROR on delete failure', async () => {
      fakeSupabase.__setTableHandler('spiritual_milestones', async () => {
        return { data: null, error: { message: 'delete failed' } }
      })

      const result = await deleteMilestone('m-1')
      expect(result.ok).toBe(false)
      if (!result.ok) {
        expect(result.error.code).toBe('DATABASE_ERROR')
      }
    })

    test('returns ok and revalidates on success', async () => {
      fakeSupabase.__setTableHandler('spiritual_milestones', async () => {
        // For delete path, action logged but the chain awaits a promise that returns { error }
        return { data: null, error: null }
      })

      const result = await deleteMilestone('m-1')
      expect(result.ok).toBe(true)
      if (result.ok) {
        expect(result.data).toBeUndefined()
      }
      expect(revalidatePath).toHaveBeenCalledWith('/dashboard/spiritual-journey')
    })
  })

  describe('detectAndCreateAutoMilestones', () => {
    test('creates "First Journal Entry" milestone when applicable', async () => {
      // journal_entries select count -> pretend > 0
      fakeSupabase.__setTableHandler('journal_entries', async (q) => {
        if (q.action === 'select' && q.select?.options?.count === 'exact') {
          // Using code's pattern, it checks data presence via .length
          // Provide a non-empty array to simulate entries
          return { data: [{ id: 'j1' }], error: null }
        }
        if (q.action === 'select' && q.order?.col === 'created_at' && q.limit === 1) {
          return { data: { created_at: '2023-12-01T05:00:00.000Z' }, error: null }
        }
        return { data: null, error: null }
      })
      // spiritual_milestones query for existing matching milestone -> none
      let insertPayload: any[] | null = null
      fakeSupabase.__setTableHandler('spiritual_milestones', async (q) => {
        if (q.action === 'select') {
          return { data: null, error: null }
        }
        if (q.action === 'insert') {
          insertPayload = q?.payload?.[0] ? q.payload : q.payload
          return { data: null, error: null }
        }
        return { data: null, error: null }
      })

      await detectAndCreateAutoMilestones('user-abc')

      expect(insertPayload).not.toBeNull()
      expect(insertPayload?.[0]).toMatchObject({
        user_id: 'user-abc',
        title: 'First Journal Entry',
        milestone_type: 'first_practice',
      })
    })

    test('creates "First Ritual Completed" milestone when applicable', async () => {
      // rituals select count -> pretend > 0
      fakeSupabase.__setTableHandler('rituals', async (q) => {
        if (q.action === 'select' && q.select?.options?.count === 'exact') {
          return { data: [{ id: 'r1' }], error: null }
        }
        if (q.action === 'select' && q.order?.col === 'created_at' && q.limit === 1) {
          return { data: { created_at: '2023-10-10T03:00:00.000Z', name: 'Morning Ritual' }, error: null }
        }
        return { data: null, error: null }
      })
      let ritualInsert: any[] | null = null
      fakeSupabase.__setTableHandler('spiritual_milestones', async (q) => {
        if (q.action === 'select') {
          return { data: null, error: null }
        }
        if (q.action === 'insert') {
          ritualInsert = q.payload
          return { data: null, error: null }
        }
        return { data: null, error: null }
      })

      await detectAndCreateAutoMilestones('user-xyz')
      expect(ritualInsert?.[0]).toMatchObject({
        user_id: 'user-xyz',
        title: 'First Ritual Completed',
        milestone_type: 'ritual_completion',
      })
    })

    test('creates "30-Day Consistency Achievement" milestone when applicable', async () => {
      // 15+ entries in last 30 days -> provide array of length 15
      fakeSupabase.__setTableHandler('journal_entries', async (q) => {
        if (q.action === 'select' && typeof q.filters?.created_at?.gte === 'string') {
          return {
            data: new Array(15).fill(null).map((_, i) => ({ created_at: `2024-01-${(i + 1).toString().padStart(2, '0')}` })),
            error: null,
          }
        }
        return { data: null, error: null }
      })
      let consistencyInsert: any[] | null = null
      fakeSupabase.__setTableHandler('spiritual_milestones', async (q) => {
        if (q.action === 'select') {
          return { data: null, error: null }
        }
        if (q.action === 'insert') {
          consistencyInsert = q.payload
          return { data: null, error: null }
        }
        return { data: null, error: null }
      })

      await detectAndCreateAutoMilestones('user-consistent')

      expect(consistencyInsert?.[0]).toMatchObject({
        user_id: 'user-consistent',
        title: '30-Day Consistency Achievement',
        milestone_type: 'learning_milestone',
      })
    })

    test('swallows errors and does not throw (robustness)', async () => {
      // Make from() throw via handler returning an error-like that will cause issues later
      fakeSupabase.__setTableHandler('journal_entries', async () => {
        throw new Error('boom')
      })

      await expect(detectAndCreateAutoMilestones('any')).resolves.toBeUndefined()
    })
  })
})