// modules/spiritual-profile/types.ts

export interface SpiritualMilestone {
    id: string;
    user_id: string;
    title: string;
    description?: string;
    milestone_date: string; // ISO date string
    milestone_type: MilestoneType;
    significance_level: 1 | 2 | 3 | 4 | 5;
    tags: string[];
    linked_journal_id?: string;
    linked_ritual_id?: string;
    linked_deity?: string;
    is_private: boolean;
    celebration_notes?: string;
    created_at: string;
    updated_at: string;
  }
  
  export type MilestoneType = 
    | 'personal_breakthrough'
    | 'first_practice'
    | 'seasonal_celebration' 
    | 'deity_connection'
    | 'learning_milestone'
    | 'ritual_completion'
    | 'journal_insight'
    | 'custom';
  
  export interface SpiritualFocusPeriod {
    id: string;
    user_id: string;
    focus_area: string;
    start_date: string;
    end_date?: string;
    notes?: string;
    intensity_level: 1 | 2 | 3 | 4 | 5;
    created_at: string;
  }
  
  export interface UserSpiritualProfile {
    user_id: string;
    spiritual_name?: string;
    journey_start_date?: string;
    primary_tradition?: string;
    current_focus_areas: string[];
    total_milestones: number;
    journal_entries_count: number;
    rituals_completed_count: number;
    days_since_start: number;
    preferred_deity_names: string[];
    favorite_correspondences: string[];
    profile_completion_percentage: number;
    last_activity_date?: string;
    created_at: string;
    updated_at: string;
  }
  
  // Form input types
  export interface CreateMilestoneInput {
    title: string;
    description?: string;
    milestone_date: string;
    milestone_type: MilestoneType;
    significance_level: 1 | 2 | 3 | 4 | 5;
    tags: string[];
    linked_journal_id?: string;
    linked_ritual_id?: string;
    linked_deity?: string;
    is_private: boolean;
    celebration_notes?: string;
  }
  
  export interface UpdateMilestoneInput extends Partial<CreateMilestoneInput> {
    id: string;
  }
  
  export interface UpdateSpiritualProfileInput {
    spiritual_name?: string;
    journey_start_date?: string;
    primary_tradition?: string;
    current_focus_areas?: string[];
    preferred_deity_names?: string[];
    favorite_correspondences?: string[];
  }
  
  // API response types
  export interface MilestonesTimelineData {
    milestones: SpiritualMilestone[];
    totalCount: number;
    yearlyGroups: {
      year: number;
      milestones: SpiritualMilestone[];
      count: number;
    }[];
  }
  
  export interface SpiritualJourneyStats {
    totalMilestones: number;
    milestonesThisYear: number;
    journeyDurationDays: number;
    mostCommonMilestoneType: MilestoneType;
    recentMilestones: SpiritualMilestone[];
    currentFocusAreas: SpiritualFocusPeriod[];
  }