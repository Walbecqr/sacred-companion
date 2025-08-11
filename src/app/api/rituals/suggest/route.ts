 import { NextRequest, NextResponse } from 'next/server'
 import { cookies } from 'next/headers'
 import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
 import type { SupabaseClient } from '@supabase/supabase-js'
 
 type ProfileRow = {
   user_id: string
   spiritual_path?: string[] | null
   primary_deity?: string | null
   secondary_deity?: string | null
   experience_level?: string | null
   current_journey_phase?: string | null
 }
 
 export async function POST(_req: NextRequest) {
   const supabase = createRouteHandlerClient({ cookies })
   const { data: userData } = await supabase.auth.getUser()
   const user = userData?.user
   if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
 
   // Fetch user profile minimal fields
   const { data: row } = await supabase
     .from('user_spiritual_profiles')
     .select('spiritual_path, primary_deity, secondary_deity, experience_level, current_journey_phase')
     .eq('user_id', user.id)
     .maybeSingle()
 
   const profile = (row || {}) as ProfileRow
   const usedFields: string[] = []
 
   const paths = (Array.isArray(profile.spiritual_path) ? profile.spiritual_path : []).map(s => String(s))
   if (paths.length) usedFields.push('spiritual_path')
   const deities = [profile.primary_deity, profile.secondary_deity].filter(Boolean) as string[]
   if (deities.length) usedFields.push('primary_deity','secondary_deity')
   const level = profile.experience_level || 'beginner'
   usedFields.push('experience_level')
   const phase = profile.current_journey_phase || ''
   if (phase) usedFields.push('current_journey_phase')
 
   // Very lightweight suggestion logic (placeholder for a richer engine)
   const baseTools = level === 'beginner' ? ['white candle','lavender','clear quartz'] : ['colored candles','resins','herb blend','altar tools']
   const traditionHint = paths[0] || 'eclectic'
   const deityHint = deities[0] || null
 
   const suggestions = {
     tradition: traditionHint,
     recommendedTools: baseTools,
     deityFocus: deityHint,
     notes: phase ? `Align with your phase: ${phase}` : undefined,
   }
 
   // Log which profile fields were used
   await logProfileUsage(supabase, user.id, usedFields, 'rituals')
 
   return NextResponse.json({ suggestions })
 }
 
 async function logProfileUsage(supabase: SupabaseClient, userId: string, usedFields: string[], feature: string) {
   try {
     await supabase.from('messages').insert({
       conversation_id: null,
       user_id: userId,
       role: 'system',
       content: `[profile-usage] feature=${feature}; used=${usedFields.join(', ')}`,
       metadata: { type: 'profile_usage', usedFields, feature }
     })
   } catch {}
 }
 

