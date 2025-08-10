import { supabase } from '@/lib/supabase'
import type {
  SpiritualMilestone,
  CreateMilestoneInput,
  UpdateMilestoneInput,
  UserSpiritualProfile,
  UpdateSpiritualProfileInput,
  MilestonesTimelineData,
  SpiritualJourneyStats
} from '@/modules/spiritual-profile/types'

export class SpiritualProfileQueries {
  static async createMilestone(input: CreateMilestoneInput): Promise<SpiritualMilestone> {
    const { data, error } = await supabase
      .from('spiritual_milestones')
      .insert([input])
      .select()
      .single()

    if (error) throw error
    return data as SpiritualMilestone
  }

  static async getMilestone(id: string): Promise<SpiritualMilestone | null> {
    const { data, error } = await supabase
      .from('spiritual_milestones')
      .select('*')
      .eq('id', id)
      .single()

    if (error && (error as { code?: string }).code !== 'PGRST116') throw error
    return (data as SpiritualMilestone) ?? null
  }

  static async updateMilestone(input: UpdateMilestoneInput): Promise<SpiritualMilestone> {
    const { id, ...updateData } = input
    const { data, error } = await supabase
      .from('spiritual_milestones')
      .update({ ...updateData, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return data as SpiritualMilestone
  }

  static async deleteMilestone(id: string): Promise<void> {
    const { error } = await supabase
      .from('spiritual_milestones')
      .delete()
      .eq('id', id)

    if (error) throw error
  }

  static async getMilestonesTimeline(
    limit: number = 50,
    offset: number = 0
  ): Promise<MilestonesTimelineData> {
    const { data: milestones, error, count } = await supabase
      .from('spiritual_milestones')
      .select('*', { count: 'exact' })
      .order('milestone_date', { ascending: false })
      .range(offset, offset + limit - 1)

    if (error) throw error

    const yearlyGroups = (milestones || []).reduce<MilestonesTimelineData['yearlyGroups']>((groups, milestone) => {
      const year = new Date((milestone as SpiritualMilestone).milestone_date).getFullYear()
      const existing = groups.find(group => group.year === year)

      if (existing) {
        existing.milestones.push(milestone as SpiritualMilestone)
        existing.count++
      } else {
        groups.push({ year, milestones: [milestone as SpiritualMilestone], count: 1 })
      }

      return groups
    }, [])

    return {
      milestones: (milestones as SpiritualMilestone[]) || [],
      totalCount: count || 0,
      yearlyGroups
    }
  }

  static async getMilestonesByType(milestoneType: string): Promise<SpiritualMilestone[]> {
    const { data, error } = await supabase
      .from('spiritual_milestones')
      .select('*')
      .eq('milestone_type', milestoneType)
      .order('milestone_date', { ascending: false })

    if (error) throw error
    return (data as SpiritualMilestone[]) || []
  }

  static async searchMilestones(searchTerm: string): Promise<SpiritualMilestone[]> {
    const { data, error } = await supabase
      .from('spiritual_milestones')
      .select('*')
      .or(`title.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%`)
      .order('milestone_date', { ascending: false })

    if (error) throw error
    return (data as SpiritualMilestone[]) || []
  }

  static async getSpiritualProfile(): Promise<UserSpiritualProfile | null> {
    const { data, error } = await supabase
      .from('user_spiritual_profiles')
      .select('*')
      .single()

    if (error && (error as { code?: string }).code !== 'PGRST116') throw error
    return (data as UserSpiritualProfile) ?? null
  }

  static async updateSpiritualProfile(
    input: UpdateSpiritualProfileInput
  ): Promise<UserSpiritualProfile> {
    const { data, error } = await supabase
      .from('user_spiritual_profiles')
      .update({ ...input, updated_at: new Date().toISOString() })
      .select()
      .single()

    if (error) throw error
    return data as UserSpiritualProfile
  }

  static async getSpiritualJourneyStats(): Promise<SpiritualJourneyStats> {
    const profile = await this.getSpiritualProfile()

    const { data: recentMilestones } = await supabase
      .from('spiritual_milestones')
      .select('*')
      .order('milestone_date', { ascending: false })
      .limit(5)

    const currentYear = new Date().getFullYear()
    const { data: yearMilestones } = await supabase
      .from('spiritual_milestones')
      .select('milestone_type')
      .gte('milestone_date', `${currentYear}-01-01`)
      .lte('milestone_date', `${currentYear}-12-31`)

    const { data: currentFocus } = await supabase
      .from('spiritual_focus_periods')
      .select('*')
      .is('end_date', null)
      .order('start_date', { ascending: false })

    const typeCounts = (yearMilestones as Array<{ milestone_type: string }> | null)?.reduce<Record<string, number>>(
      (counts, m) => {
        counts[m.milestone_type] = (counts[m.milestone_type] || 0) + 1
        return counts
      },
      {}
    ) || {}

    const mostCommonType = (Object.entries(typeCounts).sort(([, a], [, b]) => (b as number) - (a as number))[0]?.[0] || 'custom') as SpiritualJourneyStats['mostCommonMilestoneType']

    return {
      totalMilestones: profile?.total_milestones || 0,
      milestonesThisYear: (yearMilestones as unknown[] | null)?.length || 0,
      journeyDurationDays: profile?.days_since_start || 0,
      mostCommonMilestoneType: mostCommonType,
      recentMilestones: (recentMilestones as SpiritualMilestone[]) || [],
      currentFocusAreas: (currentFocus as any) || []
    }
  }

  static async linkMilestoneToJournal(
    milestoneId: string,
    journalId: string
  ): Promise<void> {
    const { error } = await supabase
      .from('spiritual_milestones')
      .update({ linked_journal_id: journalId })
      .eq('id', milestoneId)

    if (error) throw error
  }

  static async linkMilestoneToRitual(
    milestoneId: string,
    ritualId: string
  ): Promise<void> {
    const { error } = await supabase
      .from('spiritual_milestones')
      .update({ linked_ritual_id: ritualId })
      .eq('id', milestoneId)

    if (error) throw error
  }
}


