'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createMilestone, updateMilestone, deleteMilestone } from '@/modules/spiritual-journey-profile/milestone-tracker-with-achievement-system/actions/milestones'
import type { CreateMilestoneInput, UpdateMilestoneInput } from '@/modules/spiritual-journey-profile/milestone-tracker-with-achievement-system/types'

export function useMilestones() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  const handleCreateMilestone = async (input: CreateMilestoneInput) => {
    setIsLoading(true)
    setError(null)
    try {
      const result = await createMilestone(input)
      if (!result.ok) {
        setError(result.error.message)
        return null
      }
      router.refresh()
      return result.data
    } finally {
      setIsLoading(false)
    }
  }

  const handleUpdateMilestone = async (input: UpdateMilestoneInput) => {
    setIsLoading(true)
    setError(null)
    try {
      const result = await updateMilestone(input)
      if (!result.ok) {
        setError(result.error.message)
        return null
      }
      router.refresh()
      return result.data
    } finally {
      setIsLoading(false)
    }
  }

  const handleDeleteMilestone = async (id: string) => {
    setIsLoading(true)
    setError(null)
    try {
      const result = await deleteMilestone(id)
      if (!result.ok) {
        setError(result.error.message)
        return false
      }
      router.refresh()
      return true
    } finally {
      setIsLoading(false)
    }
  }

  return {
    createMilestone: handleCreateMilestone,
    updateMilestone: handleUpdateMilestone,
    deleteMilestone: handleDeleteMilestone,
    isLoading,
    error,
    clearError: () => setError(null)
  }
}


