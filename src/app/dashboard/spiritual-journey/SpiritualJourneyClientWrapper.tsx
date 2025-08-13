'use client'

import { useEffect, useState } from 'react'
import SpiritualJourneyDashboard from '@/modules/spiritual-journey-profile/milestone-tracker-with-achievement-system/components/SpiritualJourneyDashboard'
import { SpiritualProfileQueries } from '@/modules/spiritual-journey-profile/milestone-tracker-with-achievement-system/db/queries'
import { SpiritualJourneyErrorBoundary } from './ErrorBoundary'
import { Skeleton } from '@/modules/personal-dashboard/spiritual-progress-overview/components/Skeleton'
import type { 
  UserSpiritualProfile, 
  SpiritualMilestone, 
  SpiritualJourneyStats,
  MilestonesTimelineData 
} from '@/modules/spiritual-journey-profile/milestone-tracker-with-achievement-system/types'

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

export function SpiritualJourneyClientWrapper() {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [data, setData] = useState<{
    profile: UserSpiritualProfile | null
    milestones: SpiritualMilestone[]
    stats: SpiritualJourneyStats
    yearlyGroups: MilestonesTimelineData['yearlyGroups']
  }>({
    profile: null,
    milestones: [],
    stats: {
      totalMilestones: 0,
      milestonesThisYear: 0,
      journeyDurationDays: 0,
      mostCommonMilestoneType: 'custom' as const,
      recentMilestones: [],
      currentFocusAreas: []
    },
    yearlyGroups: []
  })

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true)
        setError(null)

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

        setData({
          profile,
          milestones: milestonesData.milestones,
          stats,
          yearlyGroups: milestonesData.yearlyGroups
        })
      } catch (err) {
        console.error('Error loading spiritual journey data:', err)
        setError(err instanceof Error ? err.message : 'Unknown error occurred')
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  if (loading) {
    return <SpiritualJourneyLoading />
  }

  if (error) {
    return <SpiritualJourneyErrorBoundary error={error} />
  }

  return (
    <SpiritualJourneyDashboard 
      profile={data.profile}
      milestones={data.milestones}
      stats={data.stats}
      yearlyGroups={data.yearlyGroups}
    />
  )
}
