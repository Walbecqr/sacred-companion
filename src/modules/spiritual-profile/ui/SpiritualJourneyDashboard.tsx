"use client"

import { useMemo, useState } from 'react'
import { Star, BookOpen, Sparkles, Plus, Edit3, Clock, MapPin, Award, TrendingUp, Activity, CalendarRange } from 'lucide-react'

type Profile = {
  user_id: string
  spiritual_name?: string
  journey_start_date?: string
  primary_tradition?: string
  current_focus_areas: string[]
  total_milestones: number
  journal_entries_count: number
  rituals_completed_count: number
  days_since_start: number
  preferred_deity_names?: string[]
  favorite_correspondences?: string[]
  profile_completion_percentage?: number
  last_activity_date?: string
  created_at?: string
  updated_at?: string
}

type Milestone = {
  id: string
  title: string
  description?: string
  milestone_date: string
  milestone_type:
    | 'personal_breakthrough'
    | 'first_practice'
    | 'seasonal_celebration'
    | 'deity_connection'
    | 'learning_milestone'
    | 'ritual_completion'
    | 'journal_insight'
    | 'custom'
  significance_level: 1 | 2 | 3 | 4 | 5
  tags: string[]
  linked_deity?: string
  is_private?: boolean
  celebration_notes?: string
}

const mockProfile: Profile = {
  user_id: '123',
  spiritual_name: 'Luna Moonweaver',
  journey_start_date: '2023-01-15',
  primary_tradition: 'Eclectic Witchcraft',
  current_focus_areas: ['Tarot', 'Crystal Healing', 'Moon Magic'],
  total_milestones: 24,
  journal_entries_count: 156,
  rituals_completed_count: 31,
  days_since_start: 572,
  preferred_deity_names: ['Hecate', 'Diana', 'Brigid'],
  favorite_correspondences: ['Rose Quartz', 'Lavender', 'Full Moon'],
  profile_completion_percentage: 85,
  last_activity_date: '2024-08-09',
  created_at: '2023-01-15T00:00:00Z',
  updated_at: '2024-08-09T12:00:00Z',
}

const mockMilestones: Milestone[] = [
  {
    id: '1',
    title: 'First Tarot Reading',
    description: 'Completed my first solo tarot reading using the Celtic Cross spread',
    milestone_date: '2024-08-01',
    milestone_type: 'first_practice',
    significance_level: 4,
    tags: ['tarot', 'divination', 'personal-growth'],
    linked_deity: 'Hecate',
    is_private: false,
    celebration_notes: 'Felt a strong connection to the cards, especially The High Priestess',
  },
  {
    id: '2',
    title: 'Samhain Celebration',
    description: 'Hosted my first group ritual for Samhain, honoring ancestors',
    milestone_date: '2023-10-31',
    milestone_type: 'seasonal_celebration',
    significance_level: 5,
    tags: ['samhain', 'ancestors', 'ritual', 'community'],
    is_private: false,
    celebration_notes: 'Beautiful ceremony with friends, felt the veil was truly thin',
  },
  {
    id: '3',
    title: 'Moon Phase Tracking',
    description: 'Successfully tracked and worked with moon phases for 3 full cycles',
    milestone_date: '2024-06-15',
    milestone_type: 'learning_milestone',
    significance_level: 3,
    tags: ['moon', 'lunar-magic', 'consistency'],
    is_private: false,
    celebration_notes: 'Finally understanding the rhythm of lunar energy in my practice',
  },
]

const mockDeityConnections: Array<{
  id: string
  date: string
  name: string
  type: 'dream' | 'ritual' | 'sign' | 'meditation'
  notes?: string
}> = [
  { id: 'd1', date: '2024-08-05', name: 'Hecate', type: 'ritual', notes: 'Felt a strong presence during crossroads meditation.' },
  { id: 'd2', date: '2024-07-22', name: 'Brigid', type: 'sign', notes: 'Series of flame motifs appearing throughout the day.' },
  { id: 'd3', date: '2024-06-10', name: 'Diana', type: 'dream', notes: 'Guided through a moonlit forest; message of protection.' },
]

const milestoneTypeConfig: Record<Milestone['milestone_type'], { label: string; icon: string; color: string }> = {
  personal_breakthrough: { label: 'Personal Breakthrough', icon: '✨', color: 'text-purple-600' },
  first_practice: { label: 'First Practice', icon: '🌱', color: 'text-green-600' },
  seasonal_celebration: { label: 'Seasonal Celebration', icon: '🎭', color: 'text-orange-600' },
  deity_connection: { label: 'Deity Connection', icon: '🔮', color: 'text-blue-600' },
  learning_milestone: { label: 'Learning Milestone', icon: '📚', color: 'text-indigo-600' },
  ritual_completion: { label: 'Ritual Completion', icon: '🕯️', color: 'text-yellow-600' },
  journal_insight: { label: 'Journal Insight', icon: '💭', color: 'text-pink-600' },
  custom: { label: 'Custom', icon: '⭐', color: 'text-gray-600' },
}

type DashboardProps = {
  profile?: Profile | null
  milestones?: Milestone[]
  stats?: unknown
  yearlyGroups?: unknown[]
}

export default function SpiritualJourneyDashboard(props: DashboardProps) {
  const [profile] = useState<Profile>(props.profile || mockProfile)
  const [milestones, setMilestones] = useState<Milestone[]>(props.milestones || mockMilestones)
  const [showCreateMilestone, setShowCreateMilestone] = useState(false)

  const journeyYears = Math.floor((profile.days_since_start || 0) / 365)
  const journeyMonths = Math.floor(((profile.days_since_start || 0) % 365) / 30)

  // Derived stats and insights
  const { avgSignificance, typeCounts, mostCommonType } = useMemo(() => {
    if (!milestones || milestones.length === 0) {
      return { avgSignificance: 0, typeCounts: {} as Record<Milestone['milestone_type'], number>, mostCommonType: 'custom' as Milestone['milestone_type'] }
    }
    const counts = milestones.reduce((acc, m) => {
      acc[m.milestone_type] = (acc[m.milestone_type] || 0) + 1
      return acc
    }, {} as Record<Milestone['milestone_type'], number>)
    const avg = (
      milestones.reduce((s, m) => s + m.significance_level, 0) / milestones.length
    )
    const common = Object.entries(counts).sort((a, b) => b[1] - a[1])[0]?.[0] as Milestone['milestone_type']
    return { avgSignificance: Number(avg.toFixed(1)), typeCounts: counts, mostCommonType: common || 'custom' }
  }, [milestones])

  const achievements = useMemo(() => {
    const total = milestones.length
    const highSig = milestones.filter(m => m.significance_level >= 4).length
    const hasDeity = milestones.some(m => m.milestone_type === 'deity_connection')
    const firstYear = (profile.days_since_start || 0) >= 365
    return [
      { id: 'a1', title: 'Getting Started', desc: 'Create your first milestone', unlocked: total >= 1 },
      { id: 'a2', title: 'On The Path', desc: 'Log 10 milestones', unlocked: total >= 10 },
      { id: 'a3', title: 'Deep Insight', desc: '5 milestones with high significance', unlocked: highSig >= 5 },
      { id: 'a4', title: 'Divine Whisper', desc: 'Record a deity/spirit connection', unlocked: hasDeity },
      { id: 'a5', title: 'Year One', desc: 'Journey for one year', unlocked: firstYear },
    ]
  }, [milestones, profile.days_since_start])

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-8">
      <div className="bg-gradient-to-r from-purple-900 via-blue-900 to-indigo-900 rounded-lg p-8 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">{profile.spiritual_name || 'Your Spiritual Journey'}</h1>
            <p className="text-purple-200 mb-4">
              {profile.primary_tradition} • {journeyYears > 0 && `${journeyYears} years, `}
              {journeyMonths} months on the path
            </p>
            <div className="flex gap-6 text-sm">
              <div className="flex items-center gap-2">
                <Star className="w-4 h-4" />
                <span>{profile.total_milestones} Milestones</span>
              </div>
              <div className="flex items-center gap-2">
                <BookOpen className="w-4 h-4" />
                <span>{profile.journal_entries_count} Journal Entries</span>
              </div>
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4" />
                <span>{profile.rituals_completed_count} Rituals</span>
              </div>
            </div>
          </div>
          <button
            onClick={() => setShowCreateMilestone(true)}
            className="bg-purple-600 hover:bg-purple-700 px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add Milestone
          </button>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <MapPin className="w-5 h-5 text-purple-600" />
          Current Focus Areas
        </h2>
        <div className="flex flex-wrap gap-2">
          {profile.current_focus_areas?.map((area, index) => (
            <span key={index} className="bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-sm">
              {area}
            </span>
          ))}
        </div>
      </div>

      {/* Personal Statistics & Insights */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="font-semibold mb-2 flex items-center gap-2"><Activity className="w-4 h-4 text-purple-600"/> Personal Statistics</h3>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-gray-500">Avg. Significance</p>
              <p className="text-xl font-semibold text-purple-700">{avgSignificance}</p>
            </div>
            <div>
              <p className="text-gray-500">Most Common Type</p>
              <p className="text-sm font-medium">{milestoneTypeConfig[mostCommonType].label}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="font-semibold mb-2 flex items-center gap-2"><TrendingUp className="w-4 h-4 text-purple-600"/> Trend Snapshot</h3>
          <p className="text-sm text-gray-600">Patterns and trends will appear here based on your logged milestones over time.</p>
        </div>
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="font-semibold mb-2 flex items-center gap-2"><Award className="w-4 h-4 text-purple-600"/> Achievements</h3>
          <ul className="space-y-1 text-sm">
            {achievements.map(a => (
              <li key={a.id} className={`flex items-center justify-between ${a.unlocked ? 'text-gray-900' : 'text-gray-400'}`}>
                <span>{a.title}</span>
                <span className={`text-xs px-2 py-0.5 rounded ${a.unlocked ? 'bg-green-100 text-green-700' : 'bg-gray-100'}`}>{a.unlocked ? 'Unlocked' : 'Locked'}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
          <Clock className="w-5 h-5 text-purple-600" />
          Recent Milestones
        </h2>
        <div className="space-y-4">
          {milestones.map(milestone => (
            <MilestoneCard key={milestone.id} milestone={milestone} />
          ))}
        </div>
      </div>

      {/* Spirit/Deity Connections Log */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-purple-600" />
          Spirit/Deity Connections Log
        </h2>
        <div className="space-y-3">
          {mockDeityConnections.map((c) => (
            <div key={c.id} className="flex items-start justify-between border border-gray-200 rounded-md p-3">
              <div>
                <p className="font-medium text-gray-900">{c.name} <span className="text-xs text-gray-500">({c.type})</span></p>
                <p className="text-xs text-gray-500">{new Date(c.date).toLocaleDateString()}</p>
                {c.notes && <p className="text-sm text-gray-700 mt-1">{c.notes}</p>}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Visual Timeline Placeholder */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <CalendarRange className="w-5 h-5 text-purple-600" />
          Visual Timeline
        </h2>
        <p className="text-sm text-gray-600">A chronological, scrollable timeline of your milestones will appear here.</p>
      </div>

      {showCreateMilestone && (
        <CreateMilestoneModal
          onClose={() => setShowCreateMilestone(false)}
          onCreate={(newMilestone: Milestone) => {
            setMilestones([newMilestone, ...milestones])
            setShowCreateMilestone(false)
          }}
        />
      )}
    </div>
  )
}

function MilestoneCard({ milestone }: { milestone: Milestone }) {
  const config = milestoneTypeConfig[milestone.milestone_type]
  const milestoneDate = new Date(milestone.milestone_date)

  return (
    <div className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <span className="text-2xl">{config.icon}</span>
            <div>
              <h3 className="font-semibold text-gray-900">{milestone.title}</h3>
              <span className={`text-sm ${config.color} font-medium`}>{config.label}</span>
            </div>
          </div>

          {milestone.description && <p className="text-gray-600 mb-3">{milestone.description}</p>}

          <div className="flex items-center gap-4 text-sm text-gray-500">
            <span>{milestoneDate.toLocaleDateString()}</span>
            <div className="flex items-center gap-1">
              {Array.from({ length: milestone.significance_level }).map((_, i) => (
                <Star key={i} className="w-3 h-3 fill-yellow-400 text-yellow-400" />
              ))}
            </div>
            {milestone.linked_deity && (
              <span className="bg-blue-100 text-blue-800 px-2 py-0.5 rounded text-xs">{milestone.linked_deity}</span>
            )}
          </div>

          {milestone.tags.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-2">
              {milestone.tags.map((tag, index) => (
                <span key={index} className="bg-gray-100 text-gray-600 px-2 py-0.5 rounded text-xs">
                  #{tag}
                </span>
              ))}
            </div>
          )}

          {milestone.celebration_notes && (
            <div className="mt-3 p-3 bg-purple-50 rounded-md">
              <p className="text-sm text-purple-800 italic"><q>{milestone.celebration_notes}</q></p>
            </div>
          )}
        </div>

        <button className="text-gray-400 hover:text-gray-600 p-1" aria-label="Edit milestone">
          <Edit3 className="w-4 h-4" />
        </button>
      </div>
    </div>
  )
}

function CreateMilestoneModal({
  onClose,
  onCreate,
}: {
  onClose: () => void
  onCreate: (milestone: Milestone) => void
}) {
  const [formData, setFormData] = useState<Milestone>({
    id: '',
    title: '',
    description: '',
    milestone_date: new Date().toISOString().split('T')[0],
    milestone_type: 'custom',
    significance_level: 3,
    tags: [],
    linked_deity: '',
    is_private: false,
    celebration_notes: '',
  })

  const [tagInput, setTagInput] = useState('')

  const handleSubmit = () => {
    if (!formData.title.trim()) return
    const newMilestone: Milestone = {
      ...formData,
      id: Date.now().toString(),
      tags: formData.tags,
    }
    onCreate(newMilestone)
  }

  const addTag = () => {
    const tag = tagInput.trim()
    if (tag && !formData.tags.includes(tag)) {
      setFormData({ ...formData, tags: [...formData.tags, tag] })
      setTagInput('')
    }
  }

  const removeTag = (tagToRemove: string) => {
    setFormData({ ...formData, tags: formData.tags.filter(tag => tag !== tagToRemove) })
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
        <h2 className="text-xl font-semibold mb-4">Create New Milestone</h2>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Milestone Title *</label>
            <input aria-label="Milestone title"
              type="text"
              value={formData.title}
              onChange={e => setFormData({ ...formData, title: e.target.value })}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea
              value={formData.description}
              onChange={e => setFormData({ ...formData, description: e.target.value })}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
              rows={3}
              placeholder="Describe the milestone"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
              <input aria-label="Milestone date"
                type="date"
                value={formData.milestone_date}
                onChange={e => setFormData({ ...formData, milestone_date: e.target.value })}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
              <select aria-label="Milestone type"
                value={formData.milestone_type}
                onChange={e => setFormData({ ...formData, milestone_type: e.target.value as Milestone['milestone_type'] })}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                {Object.entries(milestoneTypeConfig).map(([key, cfg]) => (
                  <option key={key} value={key}>
                    {cfg.icon} {cfg.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Significance Level: {formData.significance_level}</label>
            <input aria-label="Significance level"
              type="range"
              min={1}
              max={5}
              value={formData.significance_level}
              onChange={e => setFormData({ ...formData, significance_level: parseInt(e.target.value, 10) as Milestone['significance_level'] })}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>Minor</span>
              <span>Major</span>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Deity/Spirit</label>
            <input
              type="text"
              value={formData.linked_deity || ''}
              onChange={e => setFormData({ ...formData, linked_deity: e.target.value })}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
              placeholder="e.g., Hecate, Brigid..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Tags</label>
            <div className="flex gap-2 mb-2">
              <input
                type="text"
                value={tagInput}
                onChange={e => setTagInput(e.target.value)}
                onKeyDown={e => {
                  if (e.key === 'Enter') {
                    e.preventDefault()
                    addTag()
                  }
                }}
                className="flex-1 border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="Add tag..."
              />
              <button type="button" onClick={addTag} className="bg-gray-200 hover:bg-gray-300 px-3 py-2 rounded-md">
                Add
              </button>
            </div>
            <div className="flex flex-wrap gap-1">
              {formData.tags.map((tag, index) => (
                <span key={index} className="bg-purple-100 text-purple-800 px-2 py-1 rounded text-sm flex items-center gap-1">
                  #{tag}
                  <button type="button" onClick={() => removeTag(tag)} className="text-purple-600 hover:text-purple-800">
                    ×
                  </button>
                </span>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Celebration Notes</label>
            <textarea
              value={formData.celebration_notes || ''}
              onChange={e => setFormData({ ...formData, celebration_notes: e.target.value })}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
              rows={2}
              placeholder="How did this moment feel? What made it special?"
            />
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="is_private"
              checked={!!formData.is_private}
              onChange={e => setFormData({ ...formData, is_private: e.target.checked })}
              className="rounded"
            />
            <label htmlFor="is_private" className="text-sm text-gray-700">
              Keep this milestone private
            </label>
          </div>

          <div className="flex gap-3 pt-4">
            <button type="button" onClick={onClose} className="flex-1 bg-gray-200 hover:bg-gray-300 px-4 py-2 rounded-md transition-colors">
              Cancel
            </button>
            <button onClick={handleSubmit} className="flex-1 bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-md transition-colors">
              Create Milestone
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

// placeholder default export removed


