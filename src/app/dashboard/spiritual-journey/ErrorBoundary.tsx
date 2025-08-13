'use client'

interface ErrorBoundaryProps {
  error: string
}

export function SpiritualJourneyErrorBoundary({ error }: ErrorBoundaryProps) {
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
