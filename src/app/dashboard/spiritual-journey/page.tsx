// app/dashboard/spiritual-journey/page.tsx

import { Suspense } from 'react'
import { SpiritualJourneyClientWrapper } from './SpiritualJourneyClientWrapper'
import { Skeleton } from '@/modules/personal-dashboard/spiritual-progress-overview/components/Skeleton'
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

// Main page component
export default function SpiritualJourneyPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Coming Soon Banner */}
      <div className="bg-gradient-to-r from-amber-500 to-orange-500 text-white px-4 py-3 text-center shadow-lg">
        <div className="max-w-6xl mx-auto flex items-center justify-center gap-2">
          <span className="text-lg">⚠️</span>
          <span className="font-medium">This feature is coming soon - Sample data only</span>
          <span className="text-lg">⚠️</span>
        </div>
      </div>
      
      <Suspense fallback={<SpiritualJourneyLoading />}>
        <SpiritualJourneyClientWrapper />
      </Suspense>
    </div>
  )
}

