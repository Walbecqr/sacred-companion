 'use client'
 
 import { useEffect, useMemo, useState, useCallback } from 'react'
 import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
 import type { User } from '@supabase/supabase-js'
 import { useRouter } from 'next/navigation'
 import { Sparkles, Save, Loader2 } from 'lucide-react'
 
 type ProfileForm = {
   legal_name: string
   display_name: string
   spiritual_name: string
   gender: string
   pronouns: string
   birth_date: string | null
   birth_time: string | null
   birth_location: string
   spiritual_path: string[]
   primary_deity: string
   secondary_deity: string
   practice_frequency: string
   experience_level: string
   current_journey_phase: string
 }
 
type DbProfileRow = {
  user_id: string
  display_name?: string | null
  spiritual_name?: string | null
  legal_name?: string | null
  gender?: string | null
  pronouns?: string | null
  birth_date?: string | null
  birth_time?: string | null
  birth_location?: string | null
  spiritual_path?: string[] | null
  primary_deity?: string | null
  secondary_deity?: string | null
  practice_frequency?: string | null
  experience_level?: string | null
  current_journey_phase?: string | null
  created_at?: string | null
  updated_at?: string | null
}

 const DEFAULT_FORM: ProfileForm = {
   legal_name: '',
   display_name: '',
   spiritual_name: '',
   gender: '',
   pronouns: '',
   birth_date: null,
   birth_time: null,
   birth_location: '',
   spiritual_path: [],
   primary_deity: '',
   secondary_deity: '',
   practice_frequency: '',
   experience_level: 'beginner',
   current_journey_phase: ''
 }
 
 const GENDER_OPTIONS = ['Woman', 'Man', 'Nonbinary', 'Genderfluid', 'Agender', 'Two-Spirit', 'Other']
 const PRONOUNS_OPTIONS = ['she/her', 'he/him', 'they/them', 'she/they', 'he/they', 'Ask me', 'Other']
 const PRACTICE_FREQUENCY_OPTIONS = ['Daily', 'Several times a week', 'Weekly', 'Monthly', 'Occasional']
 const EXPERIENCE_OPTIONS = ['beginner', 'intermediate', 'advanced', 'teacher']
 const GROWTH_PHASE_OPTIONS = ['Seeker', 'Learning', 'Deepening', 'Integration', 'Shadow Work', 'Service']
 const PATH_PRESETS = ['Eclectic Witchcraft','Wicca','Heathenry','Hellenic Polytheism','Kemetic','Druidry','Hoodoo','Brujería','Folk Magic','Buddhist','Hindu','Pagan (General)']
 
 export default function SpiritualProfilePage() {
   const router = useRouter()
   const supabase = createClientComponentClient()
   const [user, setUser] = useState<User | null>(null)
   const [loading, setLoading] = useState(true)
   const [saving, setSaving] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle')
   const [form, setForm] = useState<ProfileForm>(DEFAULT_FORM)
   const [pathInput, setPathInput] = useState('')
 
   useEffect(() => {
     ;(async () => {
       const { data } = await supabase.auth.getUser()
       const current = data?.user || null
       if (!current) {
         router.push('/login')
         return
       }
       setUser(current)
       // Ensure a row exists
       const { data: profile } = await supabase
         .from('user_spiritual_profiles')
         .select('*')
         .eq('user_id', current.id)
         .maybeSingle()
 
       if (!profile) {
         const defaultDisplay = current.email?.split('@')[0] || 'Seeker'
         await supabase.from('user_spiritual_profiles').insert({
           user_id: current.id,
           display_name: defaultDisplay,
           experience_level: 'beginner',
           created_at: new Date().toISOString()
         })
       }
 
      const { data: fresh } = await supabase
         .from('user_spiritual_profiles')
         .select('*')
         .eq('user_id', current.id)
         .maybeSingle()
 
      if (fresh) {
        const row = fresh as unknown as DbProfileRow
         setForm({
          legal_name: row.legal_name || '',
          display_name: row.display_name || '',
          spiritual_name: row.spiritual_name || '',
          gender: row.gender || '',
          pronouns: row.pronouns || '',
          birth_date: row.birth_date || null,
          birth_time: row.birth_time || null,
          birth_location: row.birth_location || '',
          spiritual_path: Array.isArray(row.spiritual_path) ? (row.spiritual_path as string[]) : [],
          primary_deity: row.primary_deity || '',
          secondary_deity: row.secondary_deity || '',
          practice_frequency: row.practice_frequency || '',
          experience_level: row.experience_level || 'beginner',
          current_journey_phase: row.current_journey_phase || ''
         })
       }
 
       setLoading(false)
     })()
   }, [router, supabase])
 
   const addPath = useCallback(() => {
     const p = pathInput.trim()
     if (!p) return
     if (!form.spiritual_path.includes(p)) {
       setForm({ ...form, spiritual_path: [...form.spiritual_path, p] })
     }
     setPathInput('')
   }, [form, pathInput])
 
   const removePath = useCallback((p: string) => {
     setForm({ ...form, spiritual_path: form.spiritual_path.filter((x) => x !== p) })
   }, [form])
 
   const canSave = useMemo(() => !!user, [user])
 
  const saveProfile = useCallback(async (): Promise<boolean> => {
    if (!user) return false
    try {
      setSaving('saving')
      const payload: Record<string, unknown> = {
        legal_name: form.legal_name || null,
        display_name: form.display_name || null,
        spiritual_name: form.spiritual_name || null,
        gender: form.gender || null,
        pronouns: form.pronouns || null,
        birth_date: form.birth_date || null,
        birth_time: form.birth_time || null,
        birth_location: form.birth_location || null,
        spiritual_path: form.spiritual_path,
        primary_deity: form.primary_deity || null,
        secondary_deity: form.secondary_deity || null,
        practice_frequency: form.practice_frequency || null,
        experience_level: form.experience_level || null,
        current_journey_phase: form.current_journey_phase || null,
        updated_at: new Date().toISOString()
      }
      const { error } = await supabase
        .from('user_spiritual_profiles')
        .update(payload)
        .eq('user_id', user.id)
      if (error) throw error
      setSaving('saved')
      setTimeout(() => setSaving('idle'), 1200)
      return true
    } catch {
      setSaving('error')
      setTimeout(() => setSaving('idle'), 1500)
      return false
    }
  }, [form, supabase, user])

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault()
    await saveProfile()
  }, [saveProfile])

  const handleClose = useCallback(() => {
    try {
      if (typeof window !== 'undefined' && window.history.length > 1) {
        router.back()
      } else {
        router.push('/dashboard')
      }
    } catch {
      router.push('/dashboard')
    }
  }, [router])

  const handleSaveAndClose = useCallback(async () => {
    const ok = await saveProfile()
    if (ok) handleClose()
  }, [saveProfile, handleClose])
 
   if (loading) {
     return (
       <div className="min-h-screen bg-gradient-to-br from-purple-900 via-indigo-900 to-purple-800 flex items-center justify-center">
         <div className="text-center text-white flex items-center gap-2">
           <Sparkles className="w-6 h-6 animate-pulse" />
           <span>Loading your profile…</span>
         </div>
       </div>
     )
   }
 
   return (
     <div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-50">
       <div className="max-w-3xl mx-auto p-6">
         <div className="bg-gradient-to-r from-purple-700 to-indigo-700 text-white rounded-lg p-6 mb-6">
           <h1 className="text-2xl font-semibold mb-1">Spiritual Profile</h1>
           <p className="text-sm text-white/90">Help us personalize guidance to your unique path.</p>
         </div>
 
         <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow p-6 space-y-6">
            <section>
             <h2 className="text-lg font-semibold mb-3">Identity</h2>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
               <div>
                <label htmlFor="legal_name" className="block text-sm text-gray-600 mb-1">Name</label>
                 <input
                  id="legal_name"
                   value={form.legal_name}
                   onChange={(e) => setForm({ ...form, legal_name: e.target.value })}
                   className="w-full rounded-md border border-purple-200 p-2"
                   placeholder="Your name"
                 />
               </div>
               <div>
                <label htmlFor="spiritual_name" className="block text-sm text-gray-600 mb-1">Preferred/Spiritual Name</label>
                 <input
                  id="spiritual_name"
                   value={form.spiritual_name || form.display_name}
                   onChange={(e) => setForm({ ...form, spiritual_name: e.target.value, display_name: e.target.value })}
                   className="w-full rounded-md border border-purple-200 p-2"
                   placeholder="e.g., Luna, Rowan…"
                 />
               </div>
               <div>
                <label htmlFor="gender" className="block text-sm text-gray-600 mb-1">Gender</label>
                 <select
                  id="gender"
                   value={GENDER_OPTIONS.includes(form.gender) ? form.gender : 'Other'}
                   onChange={(e) => setForm({ ...form, gender: e.target.value })}
                   className="w-full rounded-md border border-purple-200 p-2"
                 >
                   <option value="">Select…</option>
                   {GENDER_OPTIONS.map((g) => (
                     <option key={g} value={g}>{g}</option>
                   ))}
                 </select>
                 {form.gender === 'Other' && (
                   <input
                      id="gender_other"
                     className="mt-2 w-full rounded-md border border-purple-200 p-2"
                     placeholder="Enter gender"
                     onChange={(e) => setForm({ ...form, gender: e.target.value })}
                   />
                 )}
               </div>
               <div>
                <label htmlFor="pronouns" className="block text-sm text-gray-600 mb-1">Pronouns</label>
                 <select
                  id="pronouns"
                   value={PRONOUNS_OPTIONS.includes(form.pronouns) ? form.pronouns : 'Other'}
                   onChange={(e) => setForm({ ...form, pronouns: e.target.value })}
                   className="w-full rounded-md border border-purple-200 p-2"
                 >
                   <option value="">Select…</option>
                   {PRONOUNS_OPTIONS.map((p) => (
                     <option key={p} value={p}>{p}</option>
                   ))}
                 </select>
                 {form.pronouns === 'Other' && (
                   <input
                      id="pronouns_other"
                     className="mt-2 w-full rounded-md border border-purple-200 p-2"
                     placeholder="Enter pronouns"
                     onChange={(e) => setForm({ ...form, pronouns: e.target.value })}
                   />
                 )}
               </div>
             </div>
           </section>
 
            <section>
             <h2 className="text-lg font-semibold mb-3">Birth Details (optional)</h2>
             <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
               <div>
                <label htmlFor="birth_date" className="block text-sm text-gray-600 mb-1">Birth Date</label>
                 <input
                  id="birth_date"
                   type="date"
                   value={form.birth_date || ''}
                   onChange={(e) => setForm({ ...form, birth_date: e.target.value || null })}
                   className="w-full rounded-md border border-purple-200 p-2"
                 />
               </div>
               <div>
                <label htmlFor="birth_time" className="block text-sm text-gray-600 mb-1">Birth Time</label>
                 <input
                  id="birth_time"
                   type="time"
                   value={form.birth_time || ''}
                   onChange={(e) => setForm({ ...form, birth_time: e.target.value || null })}
                   className="w-full rounded-md border border-purple-200 p-2"
                 />
               </div>
               <div>
                <label htmlFor="birth_location" className="block text-sm text-gray-600 mb-1">Birth Location</label>
                 <input
                  id="birth_location"
                   value={form.birth_location}
                   onChange={(e) => setForm({ ...form, birth_location: e.target.value })}
                   className="w-full rounded-md border border-purple-200 p-2"
                   placeholder="City, Country"
                 />
               </div>
             </div>
           </section>
 
           <section>
             <h2 className="text-lg font-semibold mb-3">Path & Guides</h2>
             <div className="space-y-3">
                <div>
                  <label htmlFor="path_input" className="block text-sm text-gray-600 mb-1">Spiritual Paths/Traditions</label>
                 <div className="flex gap-2 mb-2">
                   <input
                      id="path_input"
                     value={pathInput}
                     onChange={(e) => setPathInput(e.target.value)}
                     onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addPath() } }}
                     className="flex-1 rounded-md border border-purple-200 p-2"
                     placeholder="Add a path and press Enter"
                   />
                   <button type="button" onClick={addPath} className="px-3 py-2 rounded-md bg-purple-100 text-purple-700">Add</button>
                 </div>
                 <div className="flex flex-wrap gap-2">
                   {form.spiritual_path.map((p) => (
                     <span key={p} className="px-2 py-1 rounded-full bg-purple-100 text-purple-700 text-sm">
                       {p}
                       <button type="button" className="ml-2" onClick={() => removePath(p)}>×</button>
                     </span>
                   ))}
                 </div>
                 <div className="mt-2 flex flex-wrap gap-2 text-xs">
                   {PATH_PRESETS.map((p) => (
                     <button
                       key={p}
                       type="button"
                       onClick={() => { if (!form.spiritual_path.includes(p)) setForm({ ...form, spiritual_path: [...form.spiritual_path, p] }) }}
                       className="px-2 py-1 rounded border border-purple-300 text-purple-700 hover:bg-purple-50"
                     >{p}</button>
                   ))}
                 </div>
               </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                 <div>
                    <label htmlFor="primary_deity" className="block text-sm text-gray-600 mb-1">Primary Deity/Entity</label>
                   <input
                      id="primary_deity"
                     value={form.primary_deity}
                     onChange={(e) => setForm({ ...form, primary_deity: e.target.value })}
                     className="w-full rounded-md border border-purple-200 p-2"
                     placeholder="e.g., Hecate, Brigid, Ancestors…"
                   />
                 </div>
                 <div>
                    <label htmlFor="secondary_deity" className="block text-sm text-gray-600 mb-1">Secondary Deity/Entity</label>
                   <input
                      id="secondary_deity"
                     value={form.secondary_deity}
                     onChange={(e) => setForm({ ...form, secondary_deity: e.target.value })}
                     className="w-full rounded-md border border-purple-200 p-2"
                     placeholder="Optional"
                   />
                 </div>
               </div>
             </div>
           </section>
 
           <section>
             <h2 className="text-lg font-semibold mb-3">Practice & Stage</h2>
             <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label htmlFor="practice_frequency" className="block text-sm text-gray-600 mb-1">Practice Frequency</label>
                 <select
                    id="practice_frequency"
                   value={form.practice_frequency}
                   onChange={(e) => setForm({ ...form, practice_frequency: e.target.value })}
                   className="w-full rounded-md border border-purple-200 p-2"
                 >
                   <option value="">Select…</option>
                   {PRACTICE_FREQUENCY_OPTIONS.map((o) => <option key={o} value={o}>{o}</option>)}
                 </select>
               </div>
               <div>
                  <label htmlFor="experience_level" className="block text-sm text-gray-600 mb-1">Experience Level</label>
                 <select
                    id="experience_level"
                   value={form.experience_level}
                   onChange={(e) => setForm({ ...form, experience_level: e.target.value })}
                   className="w-full rounded-md border border-purple-200 p-2"
                 >
                   {EXPERIENCE_OPTIONS.map((o) => <option key={o} value={o}>{o.charAt(0).toUpperCase() + o.slice(1)}</option>)}
                 </select>
               </div>
               <div>
                  <label htmlFor="current_growth_phase" className="block text-sm text-gray-600 mb-1">Current Growth Phase</label>
                 <select
                    id="current_growth_phase"
                   value={GROWTH_PHASE_OPTIONS.includes(form.current_journey_phase) ? form.current_journey_phase : ''}
                   onChange={(e) => setForm({ ...form, current_journey_phase: e.target.value })}
                   className="w-full rounded-md border border-purple-200 p-2"
                 >
                   <option value="">Select…</option>
                   {GROWTH_PHASE_OPTIONS.map((o) => <option key={o} value={o}>{o}</option>)}
                 </select>
                 {!GROWTH_PHASE_OPTIONS.includes(form.current_journey_phase) && (
                   <input
                      id="current_growth_phase_custom"
                     className="mt-2 w-full rounded-md border border-purple-200 p-2"
                     placeholder="Or write your own"
                     value={form.current_journey_phase}
                     onChange={(e) => setForm({ ...form, current_journey_phase: e.target.value })}
                   />
                 )}
               </div>
             </div>
           </section>
 
          <div className="flex items-center justify-between gap-3 pt-2">
            <button
              type="button"
              onClick={handleClose}
              className="px-3 py-2 rounded-md border border-gray-300 text-gray-700 hover:bg-gray-50"
              aria-label="Close profile without saving"
            >
              Close
            </button>
            <div className="flex items-center gap-3">
              {saving === 'error' && <span className="text-sm text-red-600">Save failed</span>}
              {saving === 'saved' && <span className="text-sm text-green-600">Saved</span>}
              <button
                type="submit"
                disabled={!canSave || saving === 'saving'}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-md bg-gradient-to-r from-purple-600 to-indigo-600 text-white disabled:opacity-60"
                aria-label="Save profile"
              >
                {saving === 'saving' ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} Save
              </button>
              <button
                type="button"
                onClick={handleSaveAndClose}
                disabled={!canSave || saving === 'saving'}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-md bg-purple-100 text-purple-700 hover:bg-purple-200 disabled:opacity-60"
                aria-label="Save profile and close"
              >
                {saving === 'saving' ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} Save & Close
              </button>
            </div>
          </div>
         </form>
       </div>
     </div>
   )
 }
 

