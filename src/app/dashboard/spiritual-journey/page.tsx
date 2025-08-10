// app/dashboard/spiritual-journey/page.tsx

import { Suspense } from 'react'
import { supabase as client } from '@/lib/supabase'
import { redirect } from 'next/navigation'
import SpiritualJourneyDashboard from '@/modules/spiritual-profile/ui/SpiritualJourneyDashboard'
import { SpiritualProfileQueries } from '@/modules/spiritual-profile/db/queries'
import { Skeleton } from '@/components/ui/skeleton'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Spiritual Journey | Beatrice\'s Sacred Companion',
  description: 'Track your spiritual milestones and growth over time'
}

// Loading component for the dashboard
function SpiritualJourneyLoading() {
  return (
    <div className="max-w-6xl mx-auto p-6 space-y-8">
      {/* Header skeleton */}
      <div className="bg-gradient-to-r from-purple-900 via-blue-900 to-indigo-900 rounded-lg p-8">
        <Skeleton className="h-8 w-64 mb-2 bg-purple-800" />
        <Skeleton className="h-4 w-48 mb-4 bg-purple-700" />
        <div className="flex gap-6">
          <Skeleton className="h-4 w-24 bg-purple-700" />
          <Skeleton className="h-4 w-32 bg-purple-700" />
          <Skeleton className="h-4 w-20 bg-purple-700" />
        </div>
      </div>
      
      {/* Focus areas skeleton */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <Skeleton className="h-6 w-48 mb-4" />
        <div className="flex gap-2">
          <Skeleton className="h-6 w-20 rounded-full" />
          <Skeleton className="h-6 w-24 rounded-full" />
          <Skeleton className="h-6 w-28 rounded-full" />
        </div>
      </div>
      
      {/* Milestones skeleton */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <Skeleton className="h-6 w-40 mb-6" />
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <Skeleton className="h-8 w-8 rounded" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-5 w-48" />
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-3 w-full" />
                  <Skeleton className="h-3 w-3/4" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

/**
 * Renders the Spiritual Journey dashboard page, handling authentication and conditional UI states.
 *
 * Redirects unauthenticated users to the login page with a return path to the dashboard. Displays a loading skeleton while the main dashboard content loads.
 */
export default async function SpiritualJourneyPage() {
  const supabase = client
  
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    redirect(`/login?returnTo=${encodeURIComponent('/dashboard/spiritual-journey')}`)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Suspense fallback={<SpiritualJourneyLoading />}>
        <SpiritualJourneyContent />
      </Suspense>
    </div>
  )
}

// Separate component for data fetching
async function SpiritualJourneyContent() {
  try {
    // Fetch user's spiritual profile and milestones in parallel
    const [profileResult, milestonesResult, statsResult] = await Promise.allSettled([
      SpiritualProfileQueries.getSpiritualProfile(),
      SpiritualProfileQueries.getMilestonesTimeline(10, 0),
      SpiritualProfileQueries.getSpiritualJourneyStats()
    ])

    // Handle profile data
    const profile = profileResult.status === 'fulfilled' ? profileResult.value : null
    
    // Handle milestones data
    const milestonesData = milestonesResult.status === 'fulfilled' ? milestonesResult.value : {
      milestones: [],
      totalCount: 0,
      yearlyGroups: []
    }
    
    // Handle stats data
    const stats = statsResult.status === 'fulfilled' ? statsResult.value : {
      totalMilestones: 0,
      milestonesThisYear: 0,
      journeyDurationDays: 0,
      mostCommonMilestoneType: 'custom' as const,
      recentMilestones: [],
      currentFocusAreas: []
    }

    return (
      <SpiritualJourneyDashboard 
        profile={profile}
        milestones={milestonesData.milestones}
        stats={stats}
        yearlyGroups={milestonesData.yearlyGroups}
      />
    )
  } catch (error) {
    console.error('Error loading spiritual journey data:', error)
    
    // Return error state component
    return (
      <div className="max-w-6xl mx-auto p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <h2 className="text-lg font-semibold text-red-800 mb-2">
            Unable to Load Spiritual Journey
          </h2>
          <p className="text-red-600 mb-4">
            We&apos;re having trouble loading your spiritual journey data. Please try refreshing the page.
          </p>
          <button 
            onClick={() => window.location.reload()}
            className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md transition-colors"
          >
            Refresh Page
          </button>
        </div>
      </div>
    )
  }
}

