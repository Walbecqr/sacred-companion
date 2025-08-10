// modules/spiritual-profile/actions/milestones.ts
'use server'

import { revalidatePath } from 'next/cache'
import { createClient as createSupabaseClient, type SupabaseClient } from '@supabase/supabase-js'
type MilestoneType =
  | 'personal_breakthrough'
  | 'first_practice'
  | 'seasonal_celebration'
  | 'deity_connection'
  | 'learning_milestone'
  | 'ritual_completion'
  | 'journal_insight'
  | 'custom'

interface SpiritualMilestone {
  id: string
  user_id: string
  title: string
  description?: string
  milestone_date: string
  milestone_type: MilestoneType
  significance_level: 1 | 2 | 3 | 4 | 5
  tags: string[]
  linked_journal_id?: string
  linked_ritual_id?: string
  linked_deity?: string
  is_private?: boolean
  celebration_notes?: string
  created_at: string
  updated_at: string
}

interface CreateMilestoneInput {
  title: string
  description?: string
  milestone_date: string
  milestone_type: MilestoneType
  significance_level: 1 | 2 | 3 | 4 | 5
  tags: string[]
  linked_journal_id?: string
  linked_ritual_id?: string
  linked_deity?: string
  is_private?: boolean
  celebration_notes?: string
}

interface UpdateMilestoneInput extends Partial<CreateMilestoneInput> {
  id: string
}

type ApiErrorCode =
  | 'UNAUTHORIZED'
  | 'VALIDATION_ERROR'
  | 'DATABASE_ERROR'
  | 'INTERNAL_ERROR'
  | 'NOT_FOUND'

interface ApiError {
  code: ApiErrorCode
  message: string
}

export type ApiResult<T> =
  | { ok: true; data: T }
  | { ok: false; error: ApiError }

function getSupabaseConfig() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY
  if (!url || !anonKey) {
    throw new Error('Supabase configuration missing. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY.')
  }
  return { url, anonKey }
}

function getSupabaseClient(): SupabaseClient {
  const { url, anonKey } = getSupabaseConfig()
  return createSupabaseClient(url, anonKey)
}

/**
 * Creates a new spiritual milestone for the authenticated user.
 *
 * Validates required fields and inserts a new milestone record linked to the user. Returns the created milestone on success, or an error result if authentication, validation, or database operations fail. Relevant dashboard pages are revalidated after creation.
 *
 * @param input - The milestone data to create
 * @returns An object containing either the created milestone or an error
 */
export async function createMilestone(
  input: CreateMilestoneInput
): Promise<ApiResult<SpiritualMilestone>> {
  try {
    const supabase = getSupabaseClient()
    
    // Verify user authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return { 
        ok: false, 
        error: { code: 'UNAUTHORIZED', message: 'User not authenticated' } 
      }
    }

    // Validate input
    if (!input.title?.trim()) {
      return { 
        ok: false, 
        error: { code: 'VALIDATION_ERROR', message: 'Title is required' } 
      }
    }

    if (!input.milestone_date) {
      return { 
        ok: false, 
        error: { code: 'VALIDATION_ERROR', message: 'Milestone date is required' } 
      }
    }

    // Insert milestone
    const { data, error } = await supabase
      .from('spiritual_milestones')
      .insert([{
        ...input,
        user_id: user.id
      }])
      .select()
      .single()

    if (error) {
      console.error('Database error creating milestone:', error)
      return { 
        ok: false, 
        error: { code: 'DATABASE_ERROR', message: 'Failed to create milestone' } 
      }
    }

    // Revalidate relevant pages
    revalidatePath('/dashboard/spiritual-journey')
    revalidatePath('/dashboard')

    return { ok: true, data }
  } catch (error) {
    console.error('Unexpected error creating milestone:', error)
    return { 
      ok: false, 
      error: { code: 'INTERNAL_ERROR', message: 'An unexpected error occurred' } 
    }
  }
}

/**
 * Updates an existing spiritual milestone for the authenticated user.
 *
 * Validates user authentication and updates the specified milestone with new data. Returns the updated milestone on success, or an error result if the milestone is not found, the user is unauthorized, or a database/internal error occurs.
 *
 * @param input - The updated milestone data, including the milestone ID
 * @returns An object containing either the updated milestone or an error
 */
export async function updateMilestone(
  input: UpdateMilestoneInput
): Promise<ApiResult<SpiritualMilestone>> {
  try {
    const supabase = getSupabaseClient()
    
    // Verify user authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return { 
        ok: false, 
        error: { code: 'UNAUTHORIZED', message: 'User not authenticated' } 
      }
    }

    const { id, ...updateData } = input

    // Update milestone (RLS will ensure user can only update their own)
    const { data, error } = await supabase
      .from('spiritual_milestones')
      .update({
        ...updateData,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .eq('user_id', user.id) // Extra safety check
      .select()
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return { 
          ok: false, 
          error: { code: 'NOT_FOUND', message: 'Milestone not found' } 
        }
      }
      
      console.error('Database error updating milestone:', error)
      return { 
        ok: false, 
        error: { code: 'DATABASE_ERROR', message: 'Failed to update milestone' } 
      }
    }

    // Revalidate relevant pages
    revalidatePath('/dashboard/spiritual-journey')
    revalidatePath(`/dashboard/spiritual-journey/milestone/${id}`)

    return { ok: true, data }
  } catch (error) {
    console.error('Unexpected error updating milestone:', error)
    return { 
      ok: false, 
      error: { code: 'INTERNAL_ERROR', message: 'An unexpected error occurred' } 
    }
  }
}

/**
 * Deletes a spiritual milestone for the authenticated user.
 *
 * Attempts to remove the milestone with the specified ID, ensuring the user is authenticated and authorized. On success, triggers revalidation of the spiritual journey dashboard page.
 *
 * @param id - The unique identifier of the milestone to delete
 * @returns An object indicating success or containing an error code and message
 */
export async function deleteMilestone(id: string): Promise<ApiResult<void>> {
  try {
    const supabase = getSupabaseClient()
    
    // Verify user authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return { 
        ok: false, 
        error: { code: 'UNAUTHORIZED', message: 'User not authenticated' } 
      }
    }

    // Delete milestone (RLS will ensure user can only delete their own)
    const { error } = await supabase
      .from('spiritual_milestones')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id) // Extra safety check

    if (error) {
      console.error('Database error deleting milestone:', error)
      return { 
        ok: false, 
        error: { code: 'DATABASE_ERROR', message: 'Failed to delete milestone' } 
      }
    }

    // Revalidate relevant pages
    revalidatePath('/dashboard/spiritual-journey')

    return { ok: true, data: undefined }
  } catch (error) {
    console.error('Unexpected error deleting milestone:', error)
    return { 
      ok: false, 
      error: { code: 'INTERNAL_ERROR', message: 'An unexpected error occurred' } 
    }
  }
}

// Auto-milestone detection functions
export async function detectAndCreateAutoMilestones(userId: string): Promise<void> {
  try {
    const supabase = getSupabaseClient()

    // Check for "first journal entry" milestone
    await checkFirstJournalMilestone(supabase, userId)
    
    // Check for "first ritual" milestone  
    await checkFirstRitualMilestone(supabase, userId)
    
    // Check for consistency milestones (30 day streak, etc.)
    await checkConsistencyMilestones(supabase, userId)
    
  } catch (error) {
    console.error('Error detecting auto-milestones:', error)
  }
}

async function checkFirstJournalMilestone(supabase: SupabaseClient, userId: string): Promise<void> {
  // Check if user has journal entries but no "first journal" milestone
  const { data: journalCount } = await supabase
    .from('journal_entries')
    .select('id', { count: 'exact' })
    .eq('user_id', userId)

  const { data: existingMilestone } = await supabase
    .from('spiritual_milestones')
    .select('id')
    .eq('user_id', userId)
    .eq('milestone_type', 'first_practice')
    .ilike('title', '%journal%')
    .single()

  if (journalCount && journalCount.length > 0 && !existingMilestone) {
    // Get the first journal entry date
    const { data: firstEntry } = await supabase
      .from('journal_entries')
      .select('created_at')
      .eq('user_id', userId)
      .order('created_at', { ascending: true })
      .limit(1)
      .single()

    if (firstEntry) {
      await supabase
        .from('spiritual_milestones')
        .insert([{
          user_id: userId,
          title: 'First Journal Entry',
          description: 'Created your first spiritual journal entry',
          milestone_date: firstEntry.created_at.split('T')[0],
          milestone_type: 'first_practice',
          significance_level: 3,
          tags: ['journal', 'first-time', 'auto-generated']
        }])
    }
  }
}

async function checkFirstRitualMilestone(supabase: SupabaseClient, userId: string): Promise<void> {
  // Similar logic for first ritual milestone
  const { data: ritualCount } = await supabase
    .from('rituals')
    .select('id', { count: 'exact' })
    .eq('user_id', userId)

  const { data: existingMilestone } = await supabase
    .from('spiritual_milestones')
    .select('id')
    .eq('user_id', userId)
    .eq('milestone_type', 'first_practice')
    .ilike('title', '%ritual%')
    .single()

  if (ritualCount && ritualCount.length > 0 && !existingMilestone) {
    const { data: firstRitual } = await supabase
      .from('rituals')
      .select('created_at, name')
      .eq('user_id', userId)
      .order('created_at', { ascending: true })
      .limit(1)
      .single()

    if (firstRitual) {
      await supabase
        .from('spiritual_milestones')
        .insert([{
          user_id: userId,
          title: 'First Ritual Completed',
          description: `Completed your first ritual: ${firstRitual.name || 'Unnamed ritual'}`,
          milestone_date: firstRitual.created_at.split('T')[0],
          milestone_type: 'ritual_completion',
          significance_level: 4,
          tags: ['ritual', 'first-time', 'auto-generated']
        }])
    }
  }
}

async function checkConsistencyMilestones(supabase: SupabaseClient, userId: string): Promise<void> {
  // Check for 30-day consistency milestone
  const thirtyDaysAgo = new Date()
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

  const { data: recentActivity } = await supabase
    .from('journal_entries')
    .select('created_at::date')
    .eq('user_id', userId)
    .gte('created_at', thirtyDaysAgo.toISOString())

  if (recentActivity && recentActivity.length >= 15) { // 15 entries in 30 days = decent consistency
    const { data: existingMilestone } = await supabase
      .from('spiritual_milestones')
      .select('id')
      .eq('user_id', userId)
      .eq('milestone_type', 'learning_milestone')
      .ilike('title', '%consistency%')
      .single()

    if (!existingMilestone) {
      await supabase
        .from('spiritual_milestones')
        .insert([{
          user_id: userId,
          title: '30-Day Consistency Achievement',
          description: 'Maintained regular spiritual practice for 30 days',
          milestone_date: new Date().toISOString().split('T')[0],
          milestone_type: 'learning_milestone',
          significance_level: 4,
          tags: ['consistency', 'discipline', 'auto-generated']
        }])
    }
  }
}