import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest'

// If the repository uses Jest instead of Vitest, uncomment the following lines and comment out the Vitest import above.
// import { describe, test, expect, jest, beforeEach, afterEach } from '@jest/globals'
// const vi = jest as unknown as typeof import('vitest').vi

// We will import the GET handler from the route implementation.
// The implementation is expected at src/app/auth/callback/route.ts
import * as RouteModule from './route'

// Mocks for Next.js and Supabase APIs used by the route
vi.mock('next/headers', () => {
  const cookieStore = {
    get: vi.fn(),
    set: vi.fn(),
    delete: vi.fn(),
    // Provide any additional cookie store methods if needed
  }
  return {
    cookies: vi.fn(() => cookieStore),
  }
})

type SupabaseSelectBuilder = {
  select: (cols: string) => SupabaseSelectBuilder
  eq: (col: string, val: string) => SupabaseSelectBuilder
  maybeSingle: () => Promise<{ data: { user_id: string } | null }>
}

type SupabaseClientMock = {
  auth: {
    exchangeCodeForSession: (code: string) => Promise<void>
    getUser: () => Promise<{ data: { user: null | { id: string, email: string | null, user_metadata?: { full_name?: string } } } }>
  }
  from: (table: string) => {
    select: (cols: string) => SupabaseSelectBuilder
    insert: (obj: unknown) => Promise<{ data: unknown }>
    eq: (col: string, val: string) => SupabaseSelectBuilder // keep typing flexible
  }
}

const createSelectBuilder = (maybeSingleResult: { data: { user_id: string } | null }): SupabaseSelectBuilder => {
  return {
    select: () => createSelectBuilder(maybeSingleResult),
    eq: () => createSelectBuilder(maybeSingleResult),
    maybeSingle: async () => maybeSingleResult,
  }
}

const supabaseMockFactory = (options: {
  user: null | { id: string, email: string | null, user_metadata?: { full_name?: string } }
  hasProfile: boolean
  track: { insertedProfile?: any[] }
}): SupabaseClientMock => {
  const { user, hasProfile, track } = options
  const selectBuilder = createSelectBuilder({ data: hasProfile ? { user_id: user?.id ?? 'unknown' } : null })
  return {
    auth: {
      exchangeCodeForSession: vi.fn(async (_code: string) => {
        // No return value
      }),
      getUser: vi.fn(async () => ({ data: { user } })),
    },
    from: vi.fn((table: string) => {
      if (table !== 'user_spiritual_profiles') {
        throw new Error('Unexpected table ' + table)
      }
      return {
        select: vi.fn((_cols: string) => selectBuilder),
        eq: vi.fn((_col: string, _val: string) => selectBuilder),
        insert: vi.fn(async (obj: unknown) => {
          track.insertedProfile = Array.isArray(obj) ? obj : [obj]
          return { data: obj }
        }),
      } as any
    }),
  }
}

// Mock createRouteHandlerClient to return our supabase mock
vi.mock('@supabase/auth-helpers-nextjs', () => {
  return {
    createRouteHandlerClient: vi.fn((_opts: any) => {
      // The actual returned value will be configured per-test by spying on the module's default export
      // We'll override with vi.spyOn during tests to return our current supabase mock
      return {}
    }),
  }
})

// We do not mock next/server's NextResponse, as it is available at runtime,
// but to ensure compatibility, we can inspect the returned NextResponse object.

import { NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'

describe('GET /auth/callback route handler', () => {
  const originalCreate = createRouteHandlerClient as unknown as vi.Mock

  beforeEach(() => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2024-01-01T00:00:00.000Z'))
  })

  afterEach(() => {
    vi.restoreAllMocks()
    vi.clearAllMocks()
    vi.useRealTimers()
  })

  const buildRequest = (url: string) => {
    return new Request(url)
  }

  test('redirects to /dashboard when no returnTo is provided', async () => {
    // No code param; ensure it still redirects
    const req = buildRequest('https://example.com/auth/callback')

    // Ensure no supabase calls happen when no code is present
    originalCreate.mockImplementation((_opts: any) => {
      return supabaseMockFactory({ user: null, hasProfile: false, track: {} })
    })

    const res = await RouteModule.GET(req)
    expect(res).toBeInstanceOf(NextResponse)
    expect(res.headers.get('location')).toBe('https://example.com/dashboard')
    expect(res.status).toBe(307)

    // With no code param, supabase should not be created or used in normal flow.
    // However, our route creates supabase only if code exists; verify create not called.
    expect(originalCreate).not.toHaveBeenCalled()
  })

  test('honors returnTo param when provided', async () => {
    const req = buildRequest('https://example.com/auth/callback?returnTo=%2Fwelcome')

    originalCreate.mockImplementation((_opts: any) => {
      return supabaseMockFactory({ user: null, hasProfile: false, track: {} })
    })

    const res = await RouteModule.GET(req)
    expect(res.headers.get('location')).toBe('https://example.com/welcome')
    expect(res.status).toBe(307)
    expect(originalCreate).not.toHaveBeenCalled()
  })

  test('with code: exchanges code and skips profile creation if profile exists', async () => {
    const track: any = {}
    const supabase = supabaseMockFactory({
      user: { id: 'user-1', email: 'john@example.com', user_metadata: { full_name: 'John Doe' } },
      hasProfile: true,
      track,
    })

    originalCreate.mockImplementation((_opts: any) => supabase)

    const req = buildRequest('https://example.com/auth/callback?code=abc123')
    const res = await RouteModule.GET(req)

    expect(supabase.auth.exchangeCodeForSession).toHaveBeenCalledWith('abc123')
    expect(supabase.auth.getUser).toHaveBeenCalledTimes(1)
    // Existing profile: no insert
    expect(track.insertedProfile).toBeUndefined()

    expect(res.headers.get('location')).toBe('https://example.com/dashboard')
    expect(res.status).toBe(307)
  })

  test('with code: creates profile when none exists (uses full_name when available)', async () => {
    const track: any = {}
    const supabase = supabaseMockFactory({
      user: { id: 'user-2', email: 'alice@example.com', user_metadata: { full_name: 'Alice A' } },
      hasProfile: false,
      track,
    })
    originalCreate.mockImplementation((_opts: any) => supabase)

    const req = buildRequest('https://example.com/auth/callback?code=token123')
    const res = await RouteModule.GET(req)

    expect(supabase.auth.exchangeCodeForSession).toHaveBeenCalledWith('token123')
    expect(supabase.auth.getUser).toHaveBeenCalledTimes(1)
    expect(track.insertedProfile).toBeDefined()
    const inserted = track.insertedProfile?.[0]
    expect(inserted.user_id).toBe('user-2')
    expect(inserted.display_name).toBe('Alice A')
    expect(inserted.experience_level).toBe('beginner')
    // created_at should be current ISO time
    expect(inserted.created_at).toBe(new Date().toISOString())

    expect(res.headers.get('location')).toBe('https://example.com/dashboard')
    expect(res.status).toBe(307)
  })

  test('with code: creates profile with email prefix when full_name missing', async () => {
    const track: any = {}
    const supabase = supabaseMockFactory({
      user: { id: 'user-3', email: 'no_name@example.com', user_metadata: {} },
      hasProfile: false,
      track,
    })
    originalCreate.mockImplementation((_opts: any) => supabase)

    const req = buildRequest('https://example.com/auth/callback?code=xyz')
    const res = await RouteModule.GET(req)

    expect(track.insertedProfile).toBeDefined()
    const inserted = track.insertedProfile?.[0]
    expect(inserted.display_name).toBe('no_name')

    expect(res.headers.get('location')).toBe('https://example.com/dashboard')
  })

  test('with code: creates profile with null-safe email handling when email is null', async () => {
    const track: any = {}
    const supabase = supabaseMockFactory({
      user: { id: 'user-4', email: null, user_metadata: {} },
      hasProfile: false,
      track,
    })
    originalCreate.mockImplementation((_opts: any) => supabase)

    const req = buildRequest('https://example.com/auth/callback?code=zzz')
    const res = await RouteModule.GET(req)

    // When email is null and no full_name present, the code tries user.email?.split('@')[0]
    // That results in undefined; ensure our code still inserts and doesn't crash.
    expect(track.insertedProfile).toBeDefined()
    const inserted = track.insertedProfile?.[0]
    expect(inserted.display_name).toBeUndefined()

    expect(res.headers.get('location')).toBe('https://example.com/dashboard')
    expect(res.status).toBe(307)
  })

  test('with code: if user is null, no profile check/insert occurs but redirect still happens', async () => {
    const track: any = {}
    const supabase = supabaseMockFactory({
      user: null,
      hasProfile: false,
      track,
    })
    originalCreate.mockImplementation((_opts: any) => supabase)

    const req = buildRequest('https://example.com/auth/callback?code=abc')
    const res = await RouteModule.GET(req)

    expect(supabase.auth.exchangeCodeForSession).toHaveBeenCalledWith('abc')
    expect(supabase.auth.getUser).toHaveBeenCalledTimes(1)

    // No user -> no profile check/insert
    expect(track.insertedProfile).toBeUndefined()
    expect(res.headers.get('location')).toBe('https://example.com/dashboard')
    expect(res.status).toBe(307)
  })
})