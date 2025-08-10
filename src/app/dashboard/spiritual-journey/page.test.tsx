import React from 'react'

// Under test: default export (page) and metadata from the same module.
import type { Metadata } from 'next'

// We will import the module after setting up mocks to ensure the module captures the mocked dependencies.
const mockRedirect = jest.fn()

// Mock next/navigation redirect to capture redirect calls without throwing.
jest.mock('next/navigation', () => {
  return {
    // Keep module shape minimal; extend if project depends on other exports.
    redirect: (...args: any[]) => mockRedirect(...args),
  }
})

// Provide a minimal mock for the Supabase client so we can control auth.getUser results.
const mockGetUser = jest.fn()
jest.mock('@/lib/supabase', () => {
  return {
    supabase: {
      auth: {
        getUser: (...args: any[]) => mockGetUser(...args),
      },
    },
  }
})

// Mock the Skeleton component to a recognizable marker for fallback assertions
jest.mock('@/components/ui/skeleton', () => {
  return {
    // eslint-disable-next-line react/display-name
    Skeleton: (props: any) => React.createElement('div', { 'data-testid': 'skeleton', ...props }),
  }
})

// Mock the dashboard to a simple component that echos its props (we won't actually render it here
// but the element will be constructed in the tree).
jest.mock('@/modules/spiritual-profile/ui/SpiritualJourneyDashboard', () => {
  // eslint-disable-next-line react/display-name
  return {
    __esModule: true,
    default: (props: any) => React.createElement('div', { 'data-testid': 'spiritual-dashboard', props }),
  }
})

// Mock the DB queries so their imports resolve (we won't exercise their logic here given RSC async constraints)
jest.mock('@/modules/spiritual-profile/db/queries', () => {
  return {
    SpiritualProfileQueries: {
      getSpiritualProfile: jest.fn().mockResolvedValue({ id: 'p1' }),
      getMilestonesTimeline: jest.fn().mockResolvedValue({ milestones: [], totalCount: 0, yearlyGroups: [] }),
      getSpiritualJourneyStats: jest.fn().mockResolvedValue({
        totalMilestones: 0,
        milestonesThisYear: 0,
        journeyDurationDays: 0,
        mostCommonMilestoneType: 'custom' as const,
        recentMilestones: [],
        currentFocusAreas: [],
      }),
    },
  }
})

// Helper to recursively collect nodes that match a predicate from a React element tree (without rendering).
function collectFromTree(node: any, predicate: (n: any) => boolean, out: any[] = []): any[] {
  if (!node) return out

  if (predicate(node)) {
    out.push(node)
  }

  // React element children can be in props.children (single or array)
  const children = node?.props?.children
  if (Array.isArray(children)) {
    children.forEach((c) => collectFromTree(c, predicate, out))
  } else if (children) {
    collectFromTree(children, predicate, out)
  }

  // Additionally inspect other known props that might hold nested elements (like "fallback" in Suspense)
  if (node?.props?.fallback) {
    collectFromTree(node.props.fallback, predicate, out)
  }

  return out
}

describe('app/dashboard/spiritual-journey/page.tsx', () => {
  let Page: any
  let metadata: Metadata

  beforeEach(async () => {
    jest.clearAllMocks()

    // Default behavior: authenticated user
    mockGetUser.mockResolvedValue({
      data: { user: { id: 'user-123' } },
      error: null,
    })

    // Import the page module after mocks are in place
    const mod = await import('./page')
    Page = mod.default
    metadata = mod.metadata
  })

  it('exports correct metadata (title and description)', () => {
    expect(metadata).toBeDefined()
    expect(metadata.title).toBe("Spiritual Journey | Beatrice's Sacred Companion")
    expect(metadata.description).toBe('Track your spiritual milestones and growth over time')
  })

  it('redirects to login with returnTo when no user is present', async () => {
    // Re-import module with mocked unauthenticated response
    jest.resetModules()
    mockGetUser.mockResolvedValue({ data: { user: null }, error: null })
    const mod = await import('./page')
    const UnauthedPage = mod.default

    // Calling the page function should trigger redirect (we do not expect a thrown redirect because we mocked redirect)
    await UnauthedPage()
    expect(mockRedirect).toHaveBeenCalledTimes(1)
    const redirectedTo = mockRedirect.mock.calls[0][0]
    expect(redirectedTo).toContain('/login?returnTo=')
    // It should include encoded path to the spiritual journey dashboard
    expect(decodeURIComponent(redirectedTo)).toBe('/login?returnTo=/dashboard/spiritual-journey')
  })

  it('redirects to login when auth.getUser returns an error', async () => {
    jest.resetModules()
    mockGetUser.mockResolvedValue({ data: { user: null }, error: new Error('boom') })
    const mod = await import('./page')
    const ErrorPage = mod.default

    await ErrorPage()
    expect(mockRedirect).toHaveBeenCalledTimes(1)
    const redirectedTo = mockRedirect.mock.calls[0][0]
    expect(decodeURIComponent(redirectedTo)).toBe('/login?returnTo=/dashboard/spiritual-journey')
  })

  it('returns a tree that contains a Suspense with a rich fallback made of skeletons when user is authenticated', async () => {
    const element = await Page() // returns a React element
    // Find Suspense element in the top-level tree.
    const suspenseNodes = collectFromTree(
      element,
      (n) => n && n.type && (n.type as any) === React.Suspense
    )
    expect(suspenseNodes.length).toBeGreaterThan(0)
    const suspense = suspenseNodes[0]

    // Validate fallback subtree has Skeleton markers (from our mock)
    const skeletonNodes = collectFromTree(suspense.props.fallback, (n) => n?.props?.['data-testid'] === 'skeleton')
    // The loading UI defines numerous Skeleton components; assert several exist (robust to minor changes)
    expect(skeletonNodes.length).toBeGreaterThanOrEqual(8)

    // Validate that the Suspense child is the SpiritualJourneyContent component (by function name)
    const children = suspense.props.children
    const childArray = Array.isArray(children) ? children : [children]
    const contentChild = childArray.find(Boolean)
    expect(contentChild).toBeTruthy()
    // When JSX was created, the element's "type" is the function reference defined in the module
    const typeName = contentChild?.type?.name || contentChild?.type?.displayName
    expect(typeName).toBe('SpiritualJourneyContent')
  })

  it('does not redirect when user is authenticated', async () => {
    await Page()
    expect(mockRedirect).not.toHaveBeenCalled()
  })
})